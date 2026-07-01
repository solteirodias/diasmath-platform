(function(global){
  'use strict';
  const G=global.Guardioes=global.Guardioes||{};
  const C=G.Config,T=C.tile;

  class Game{
    constructor(canvas,ui){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.ui=ui;
      this.running=false;this.paused=false;this.modalOpen=false;this.gameOver=false;this.completed=false;
      this.last=0;this.raf=0;this.world=G.Worlds[0];
      this.lives=C.startLives;this.bombs=C.startBombs;this.score=0;this.totalCrystals=0;
      this.initializeWorld([]);
    }

    startNew(){
      G.Progress.clear();
      this.lives=C.startLives;this.bombs=C.startBombs;this.score=0;this.totalCrystals=0;
      this.running=true;this.loadWorld(1,[]);this.ensureLoop();this.saveProgress();
      return this.world;
    }

    continueSaved(){
      const save=G.Progress.load();
      if(!save)return this.startNew();
      this.lives=clampNumber(save.lives,1,C.maxLives,C.startLives);
      this.bombs=Math.max(0,Number(save.bombs)||0);
      this.score=Math.max(0,Number(save.score)||0);
      this.totalCrystals=Math.max(0,Number(save.totalCrystals)||0);
      this.running=true;this.loadWorld(save.worldId,Array.isArray(save.solvedIds)?save.solvedIds:[]);this.ensureLoop();
      return this.world;
    }

    restartCurrentWorld(){
      this.lives=C.startLives;this.bombs=C.startBombs;
      this.loadWorld(this.world.id,[]);this.saveProgress();
      return this.world;
    }

    advanceToWorld(worldId){
      this.loadWorld(worldId,[]);this.saveProgress();
      return this.world;
    }

    loadWorld(worldId,solvedIds=[]){
      this.world=G.getWorld(worldId);
      this.initializeWorld(solvedIds);
      this.paused=true;this.last=performance.now();G.Input.clear();
      this.ui.updateWorld?.(this.world);
    }

    initializeWorld(solvedIds=[]){
      this.crystals=0;this.target=this.world.targetChallenges||C.targetCrystals;this.portalActive=false;
      if(this.world.bossWorld){this.lives=Math.max(3,this.lives);this.bombs=Math.max(10,this.bombs)}
      this.completed=false;this.gameOver=false;this.modalOpen=false;this.bomb=null;this.finalVictoryPending=false;
      this.activeChallenge=null;this.mustLeaveChallengeId=null;
      this.player=new G.Entities.Player(this.world.playerSpawn.x,this.world.playerSpawn.y);
      this.ghosts=this.world.ghostSpawns.map((spawn,index)=>new G.Entities.Ghost(spawn.x,spawn.y,spawn.kind,spawn.color,index));
      const questions=G.QuestionDatabase.getWorld(this.world.id);
      const solvedSet=new Set(solvedIds);
      this.challenges=this.world.challengeSpawns.map((spot,index)=>{
        const question=questions[index];
        if(!question)throw new Error(`Questão ausente no mundo ${this.world.id}, posição ${index+1}.`);
        const solved=solvedSet.has(question.id);if(solved)this.crystals++;
        return{...spot,id:index,solved,question};
      });
      this.boss=this.world.bossWorld?new G.Entities.Boss(this.world.boss.x,this.world.boss.y,this.world.boss.maxHp):null;
      if(this.boss){this.boss.setHp(this.boss.maxHp-this.crystals);this.finalVictoryPending=!this.boss.alive}
      this.portalActive=!this.world.bossWorld&&this.crystals>=this.target;
      this.powerups=[];this.walls=this.buildWalls();this.crates=this.buildCrates();this.updateHud();
    }

    ensureLoop(){
      this.last=performance.now();cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(t=>this.loop(t));
    }

    beginMission(){
      if(this.world.bossWorld&&this.finalVictoryPending){this.triggerFinalVictory();return}
      this.paused=false;this.last=performance.now();G.Input.clear();G.Audio.play('start');this.toast(this.world.missionTip);
    }

    stop(){this.running=false;cancelAnimationFrame(this.raf);G.Input.clear()}

    setPaused(value){
      if(this.modalOpen||this.gameOver||this.completed)return;
      this.paused=value;G.Input.clear();if(value)G.Audio.play('pause');
    }

    loop(now){
      if(!this.running)return;
      const dt=Math.min(34,now-this.last||16.67);this.last=now;
      if(!this.paused&&!this.modalOpen&&!this.completed&&!this.gameOver)this.update(dt);
      this.draw();this.raf=requestAnimationFrame(t=>this.loop(t));
    }

    update(dt){
      this.player.update(dt,G.Input,this);
      if(G.Input.consumeLight())this.placeBomb();
      this.checkChallengeInteraction();
      if(this.modalOpen)return;
      this.ghosts.forEach(ghost=>ghost.update(dt,this));
      if(this.boss)this.boss.update(dt,this);
      if(this.bomb){this.bomb.update(dt,this);if(this.bomb.finished)this.bomb=null}
      this.checkGhostCollision();this.checkBossCollision();
      if(this.gameOver)return;
      this.checkPowerups();
      if(!this.world.bossWorld)this.checkPortal();
    }

    moveEntity(entity,dx,dy){
      let moved=false;
      if(dx){const nx=entity.x+dx;if(!this.collidesRect(nx,entity.y,entity.size,entity.size)){entity.x=nx;moved=true}}
      if(dy){const ny=entity.y+dy;if(!this.collidesRect(entity.x,ny,entity.size,entity.size)){entity.y=ny;moved=true}}
      return moved;
    }

    collidesRect(x,y,w,h){
      const left=Math.floor(x/T),right=Math.floor((x+w-1)/T),top=Math.floor(y/T),bottom=Math.floor((y+h-1)/T);
      for(let ty=top;ty<=bottom;ty++)for(let tx=left;tx<=right;tx++)if(this.isBlocked(tx,ty))return true;
      return false;
    }

    isBlocked(tx,ty){
      if(tx<0||ty<0||tx>=C.cols||ty>=C.rows)return true;
      if(this.walls.has(`${tx},${ty}`))return true;
      return this.crates.some(c=>!c.destroyed&&c.x===tx&&c.y===ty);
    }

    buildWalls(){
      const walls=new Set();
      for(let x=0;x<C.cols;x++){walls.add(`${x},0`);walls.add(`${x},${C.rows-1}`)}
      for(let y=0;y<C.rows;y++){walls.add(`0,${y}`);walls.add(`${C.cols-1},${y}`)}
      for(let y=2;y<C.rows-1;y+=2)for(let x=2;x<C.cols-1;x+=2)walls.add(`${x},${y}`);
      [[7,1],[6,1],[8,1],[7,2]].forEach(([x,y])=>walls.delete(`${x},${y}`));
      return walls;
    }

    buildCrates(){
      const reserved=new Set([
        '1,1','2,1','1,2','13,1','12,1','13,2','13,7','12,7','13,6','1,7','2,7','1,6',
        ...this.world.challengeSpawns.map(c=>`${c.x},${c.y}`),`${this.world.portal.x},${this.world.portal.y}`
      ]);
      const layouts={
        1:[[4,1],[7,1],[8,1],[3,3],[5,3],[9,3],[11,3],[3,5],[5,5],[7,5],[9,5],[11,5],[5,7],[7,7],[9,7]],
        2:[[4,1],[7,1],[10,1],[3,3],[5,3],[9,3],[11,3],[3,5],[5,5],[7,5],[9,5],[11,5],[3,7],[7,7],[9,7]],
        3:[[4,1],[7,1],[8,1],[3,3],[5,3],[9,3],[11,3],[3,5],[5,5],[7,5],[11,5],[5,7],[7,7],[11,7]],
        4:[[4,1],[7,1],[10,1],[3,3],[5,3],[9,3],[11,3],[3,5],[5,5],[7,5],[9,5],[11,5],[5,7],[7,7],[9,7]],
        5:[[4,1],[7,1],[8,1],[3,3],[5,3],[9,3],[11,3],[3,5],[5,5],[7,5],[11,5],[3,7],[7,7],[9,7]],
        6:[[4,1],[7,1],[10,1],[3,3],[5,3],[9,3],[11,3],[3,5],[7,5],[9,5],[11,5],[5,7],[7,7],[11,7]],
        7:[[4,1],[7,1],[10,1],[3,3],[5,3],[9,3],[11,3],[5,5],[7,5],[9,5],[3,7],[7,7],[9,7]],
        8:[[4,1],[7,1],[8,1],[3,3],[5,3],[9,3],[11,3],[3,5],[7,5],[11,5],[3,7],[7,7],[9,7]],
        9:[[4,1],[7,1],[10,1],[3,3],[5,3],[9,3],[11,3],[5,5],[7,5],[9,5],[5,7],[7,7],[11,7]],
        10:[[4,1],[7,1],[8,1],[3,3],[5,3],[9,3],[11,3],[1,5],[5,5],[9,5],[13,5],[5,7],[9,7],[13,7]]
      };
      return (layouts[this.world.id]||layouts[1]).filter(([x,y])=>!reserved.has(`${x},${y}`)&&!this.walls.has(`${x},${y}`)).map(([x,y],i)=>({x,y,id:i,destroyed:false}));
    }

    getNearestUnsolvedChallenge(point){
      let nearest=null,best=Infinity;
      for(const challenge of this.challenges){
        if(challenge.solved)continue;
        const candidate={x:challenge.x*T+T/2,y:challenge.y*T+T/2};
        const distance=Math.hypot(point.x-candidate.x,point.y-candidate.y);
        if(distance<best){best=distance;nearest=candidate}
      }
      return nearest;
    }

    placeBomb(){
      if(this.paused||this.modalOpen||this.bomb||this.bombs<=0)return;
      const c=this.player.center,tx=Math.floor(c.x/T),ty=Math.floor(c.y/T);
      if(this.crates.some(v=>!v.destroyed&&v.x===tx&&v.y===ty))return;
      this.bomb=new G.Entities.LightBomb(tx,ty);this.bombs--;this.updateHud();this.saveProgress();G.Audio.play('place');
    }

    computeBlast(x,y){
      const cells=[{x,y}];const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
      for(const [dx,dy] of dirs){
        for(let i=1;i<=C.blastRange;i++){
          const tx=x+dx*i,ty=y+dy*i;if(this.walls.has(`${tx},${ty}`))break;
          cells.push({x:tx,y:ty});if(this.crates.some(c=>!c.destroyed&&c.x===tx&&c.y===ty))break;
        }
      }
      return cells;
    }

    onBombExploded(bomb){
      G.Audio.play('blast');const keys=new Set(bomb.cells.map(cell=>`${cell.x},${cell.y}`));
      for(const crate of this.crates){
        if(!crate.destroyed&&keys.has(`${crate.x},${crate.y}`)){
          crate.destroyed=true;
          /* Algumas caixas sempre escondem Luzes; as demais usam sorteio.
             Isso garante que o jogador realmente encontre recargas durante a fase. */
          const guaranteedBomb=(crate.id%5===0)||(this.world.bossWorld&&crate.id%3===0);
          const roll=Math.random();
          const bombChance=this.world.bossWorld?.58:.46;
          const lifeLimit=this.world.bossWorld?.78:.68;
          if(guaranteedBomb||roll<bombChance){
            this.powerups.push({x:crate.x,y:crate.y,type:'bomb',taken:false});
            this.toast('Uma Bomba de Luz apareceu na caixa!');
          }else if(roll<lifeLimit){
            this.powerups.push({x:crate.x,y:crate.y,type:'life',taken:false});
          }
        }
      }
      this.ghosts.forEach(ghost=>{
        if(!ghost.alive)return;const center=ghost.center,tx=Math.floor(center.x/T),ty=Math.floor(center.y/T);
        if(keys.has(`${tx},${ty}`)){ghost.defeat();this.score+=25;G.Audio.play('ghost')}
      });
      if(this.boss&&this.boss.alive){
        const center=this.boss.center,tx=Math.floor(center.x/T),ty=Math.floor(center.y/T);
        if(keys.has(`${tx},${ty}`)){this.boss.applyLight();G.Audio.play('bossStun');this.toast('A Luz interrompeu o Senhor da Confusão por alguns instantes!')}
      }
    }

    checkChallengeInteraction(){
      const p=this.player.center;
      if(this.mustLeaveChallengeId!==null){
        const old=this.challenges.find(ch=>ch.id===this.mustLeaveChallengeId);
        if(!old||Math.hypot(p.x-(old.x*T+T/2),p.y-(old.y*T+T/2))>C.interactionResetDistance)this.mustLeaveChallengeId=null;
      }
      if(this.mustLeaveChallengeId!==null)return;
      const challenge=this.challenges.find(ch=>!ch.solved&&Math.hypot(p.x-(ch.x*T+T/2),p.y-(ch.y*T+T/2))<=C.interactionDistance);
      if(challenge)this.openChallenge(challenge);
    }

    openChallenge(challenge){
      this.modalOpen=true;this.activeChallenge=challenge;G.Input.clear();G.Audio.play('question');
      this.ui.openQuestion(challenge.question,value=>this.resolveAnswer(challenge,value),payload=>this.finishQuestion(challenge,payload));
    }

    resolveAnswer(challenge,value){
      const correctAnswer=challenge.question.fact[0]*challenge.question.fact[1];
      const correct=Number(value)===correctAnswer;
      if(correct){
        if(!challenge.solved){
          challenge.solved=true;this.crystals++;this.totalCrystals++;this.score+=this.world.bossWorld?200:100;
          if(this.boss){const defeated=this.boss.damage();this.finalVictoryPending=defeated;G.Audio.play(defeated?'bossDefeat':'bossHit')}
          this.updateHud();this.saveProgress();
        }
        G.Audio.play('correct');
        if(!this.world.bossWorld&&this.crystals>=this.target&&!this.portalActive){this.portalActive=true;G.Audio.play('portal');this.saveProgress()}
      }else{
        this.lives=Math.max(0,this.lives-1);this.player.invulnerable=C.invulnerabilityMs;this.updateHud();this.saveProgress();G.Audio.play('wrong');
      }
      return{correct,lives:this.lives,gameOver:!correct&&this.lives<=0};
    }

    finishQuestion(challenge,payload){
      this.modalOpen=false;this.activeChallenge=null;this.mustLeaveChallengeId=challenge.id;G.Input.clear();
      if(payload.gameOver){this.triggerGameOver();return}
      if(payload.correct&&this.world.bossWorld){
        if(this.finalVictoryPending){this.triggerFinalVictory();return}
        this.toast(`Armadura do chefão: ${this.boss.hp}/${this.boss.maxHp}`);return;
      }
      if(payload.correct){
        this.toast(`${this.world.challengeName} recuperado: ${this.crystals}/${this.target}`);
        if(this.portalActive)this.toast('O portal está aberto. Continue jogando e atravesse quando estiver pronto.');
      }
    }

    checkGhostCollision(){
      if(this.player.invulnerable>0)return;
      const p=this.player.center;
      for(const ghost of this.ghosts){
        if(!ghost.alive)continue;const c=ghost.center;
        if(Math.hypot(p.x-c.x,p.y-c.y)<31){
          this.lives=Math.max(0,this.lives-1);this.player.invulnerable=C.invulnerabilityMs;G.Audio.play('hit');this.updateHud();this.saveProgress();
          if(this.lives<=0){this.triggerGameOver();return}
          this.toast('Cuidado! O Guardião perdeu uma vida.');break;
        }
      }
    }

    checkBossCollision(){
      if(!this.boss||!this.boss.alive||this.player.invulnerable>0)return;
      const player=this.player.center,boss=this.boss.center;
      if(Math.hypot(player.x-boss.x,player.y-boss.y)<52){
        this.lives=Math.max(0,this.lives-1);this.player.invulnerable=C.invulnerabilityMs;G.Audio.play('hit');this.updateHud();this.saveProgress();
        if(this.lives<=0){this.triggerGameOver();return}
        this.toast('O Senhor da Confusão atingiu o Guardião!');
      }
    }

    spawnBossMinion(origin,phase){
      const alive=this.ghosts.filter(ghost=>ghost.alive).length;if(alive>=12)return;
      const positions=[{x:3,y:1},{x:11,y:1},{x:1,y:5},{x:13,y:5},{x:3,y:7},{x:11,y:7}];
      const spot=positions[Math.floor(Math.random()*positions.length)];
      const kinds=phase>=3?['chaser','guard','chaser']:phase===2?['chaser','square','wander']:['wander','patrol'];
      const colors=['#ff5f82','#b85cff','#6ee7a5','#67d7ff'];
      this.ghosts.push(new G.Entities.Ghost(spot.x,spot.y,kinds[Math.floor(Math.random()*kinds.length)],colors[Math.floor(Math.random()*colors.length)],this.ghosts.length));
      G.Audio.play('bossSummon');this.toast('O Senhor da Confusão invocou outro fantasma!');
    }

    onBossTeleport(){G.Audio.play('bossTeleport')}

    triggerFinalVictory(){
      if(this.completed)return;this.completed=true;this.paused=true;G.Input.clear();
      this.score+=2000;G.Progress.save({worldId:this.world.id,lives:this.lives,bombs:this.bombs,score:this.score,totalCrystals:this.totalCrystals,solvedIds:this.challenges.map(ch=>ch.question.id),stageComplete:true});
      this.ui.onSaveChange?.(true);setTimeout(()=>this.ui.onFinalVictory(this.world,{score:this.score,lives:this.lives,bombs:this.bombs,totalCrystals:this.totalCrystals}),700);
    }

    triggerGameOver(){
      if(this.gameOver)return;this.gameOver=true;this.paused=true;G.Input.clear();setTimeout(()=>this.ui.onGameOver(),180);
    }

    checkPowerups(){
      const p=this.player.center;
      for(const item of this.powerups){
        if(item.taken)continue;const c={x:item.x*T+T/2,y:item.y*T+T/2};
        if(Math.hypot(p.x-c.x,p.y-c.y)<29){
          item.taken=true;
          if(item.type==='life'){
            this.lives=Math.min(C.maxLives,this.lives+1);this.toast(this.lives===C.maxLives?'Vidas completas!':'Coração do Conhecimento: +1 vida.');
          }else{this.bombs++;this.toast('Bomba de Luz encontrada: +1 carga!')}
          G.Audio.play('item');this.updateHud();this.saveProgress();
        }
      }
    }

    checkPortal(){
      if(this.world.bossWorld||!this.portalActive||this.completed)return;
      const p=this.player.center,c={x:this.world.portal.x*T+T/2,y:this.world.portal.y*T+T/2};
      if(Math.hypot(p.x-c.x,p.y-c.y)<33){
        this.completed=true;this.paused=true;G.Input.clear();G.Audio.play('win');
        const index=G.Worlds.findIndex(world=>world.id===this.world.id);const nextWorld=G.Worlds[index+1]||null;
        if(nextWorld){
          G.Progress.save({worldId:nextWorld.id,lives:this.lives,bombs:this.bombs,score:this.score,totalCrystals:this.totalCrystals,solvedIds:[]});
        }else{
          G.Progress.save({worldId:this.world.id,lives:this.lives,bombs:this.bombs,score:this.score,totalCrystals:this.totalCrystals,solvedIds:this.challenges.map(ch=>ch.question.id),stageComplete:true});
        }
        setTimeout(()=>this.ui.onWorldComplete(this.world,nextWorld,!nextWorld),450);
      }
    }

    saveProgress(){
      G.Progress.save({
        worldId:this.world.id,lives:this.lives,bombs:this.bombs,score:this.score,totalCrystals:this.totalCrystals,
        solvedIds:this.challenges.filter(ch=>ch.solved).map(ch=>ch.question.id),stageComplete:false
      });
      this.ui.onSaveChange?.(true);
    }

    updateHud(){this.ui.updateHud(this.lives,this.bombs,this.crystals,this.target,this.world,this.totalCrystals,this.boss)}
    toast(message){this.ui.toast(message)}

    draw(){
      const ctx=this.ctx;ctx.clearRect(0,0,C.canvasWidth,C.canvasHeight);
      this.drawGround(ctx);this.drawDecorations(ctx);this.drawWalls(ctx);this.drawCrates(ctx);this.drawChallenges(ctx);this.drawPortal(ctx);this.drawPowerups(ctx);
      this.ghosts.forEach(ghost=>ghost.draw(ctx));if(this.boss)this.boss.draw(ctx);if(this.bomb)this.bomb.draw(ctx);this.player.draw(ctx);this.drawVignette(ctx);
    }

    drawGround(ctx){
      const p=this.world.palette;
      for(let y=0;y<C.rows;y++)for(let x=0;x<C.cols;x++){
        const path=(x===7||y===4);ctx.fillStyle=path?((x+y)%2?p.pathA:p.pathB):((x+y)%2?p.grassA:p.grassB);ctx.fillRect(x*T,y*T,T,T);
        ctx.strokeStyle='rgba(24,77,61,.08)';ctx.strokeRect(x*T+.5,y*T+.5,T-1,T-1);
      }
      ctx.fillStyle='rgba(255,255,255,.88)';ctx.font='900 17px system-ui';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(`${this.world.bossWorld?'MUNDO EXTRA':`MUNDO ${this.world.id}`} · ${this.world.subtitle.toUpperCase()}`,18,28);
    }

    drawDecorations(ctx){for(const d of this.world.decorations)this.drawDecor(ctx,d)}

    drawDecor(ctx,d){
      const x=d.x*T+T/2,y=d.y*T+T/2;ctx.save();ctx.translate(x,y);
      if(d.type==='tree'){ctx.fillStyle='#8b5b32';ctx.fillRect(-5,5,10,24);ctx.fillStyle='#2d8d55';ctx.beginPath();ctx.arc(0,-3,20,0,Math.PI*2);ctx.arc(-14,5,14,0,Math.PI*2);ctx.arc(14,5,14,0,Math.PI*2);ctx.fill()}
      if(d.type==='cactus'){ctx.strokeStyle='#287a4f';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,20);ctx.lineTo(0,-18);ctx.moveTo(0,-2);ctx.lineTo(-11,-10);ctx.moveTo(0,5);ctx.lineTo(12,-4);ctx.stroke()}
      if(d.type==='school'){drawHouse(ctx,'#fff7d4','#dc5a45','#2d6fa3')}
      if(d.type==='flower'){for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#fff':'#ffd75f';ctx.beginPath();ctx.arc(Math.cos(i)*14,Math.sin(i)*10,4,0,Math.PI*2);ctx.fill()}}
      if(d.type==='stall'){ctx.fillStyle='#704022';ctx.fillRect(-24,2,48,21);ctx.fillStyle='#fff0c7';ctx.fillRect(-27,-10,54,14);ctx.fillStyle='#e55d4d';for(let i=-24;i<24;i+=12)ctx.fillRect(i,-10,6,14)}
      if(d.type==='fruit'){ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText('🥭',0,9)}
      if(d.type==='market'){drawHouse(ctx,'#f8e8c8','#d97838','#824119');ctx.fillStyle='#fff';ctx.font='900 8px system-ui';ctx.textAlign='center';ctx.fillText('FEIRA',0,5)}
      if(d.type==='basket'){ctx.font='31px system-ui';ctx.textAlign='center';ctx.fillText('🧺',0,9)}
      if(d.type==='shelf'){ctx.fillStyle='#394c58';ctx.fillRect(-25,-20,50,43);ctx.fillStyle='#d9e5ea';for(let yy=-13;yy<=13;yy+=13)ctx.fillRect(-21,yy,42,4);ctx.fillStyle='#efc15c';ctx.fillRect(-16,-9,8,8);ctx.fillStyle='#6ad0aa';ctx.fillRect(2,4,10,8)}
      if(d.type==='cart'){ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText('🛒',0,9)}
      if(d.type==='warehouse'){drawHouse(ctx,'#c9d6dc','#4e6470','#233844');ctx.fillStyle='#fff';ctx.font='900 7px system-ui';ctx.textAlign='center';ctx.fillText('MERCADO',0,5)}
      if(d.type==='boxes'){ctx.font='29px system-ui';ctx.textAlign='center';ctx.fillText('📦',0,8)}
      if(d.type==='barn'){drawHouse(ctx,'#d98745','#8c2f28','#5f3824');ctx.fillStyle='#fff1c2';ctx.font='900 7px system-ui';ctx.textAlign='center';ctx.fillText('CELEIRO',0,5)}
      if(d.type==='tractor'){ctx.font='31px system-ui';ctx.textAlign='center';ctx.fillText('🚜',0,9)}
      if(d.type==='corn'){ctx.font='31px system-ui';ctx.textAlign='center';ctx.fillText('🌽',0,9)}
      if(d.type==='chicken'){ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText('🐔',0,9)}
      if(d.type==='farm'){drawHouse(ctx,'#f1d6a5','#b44732','#6b3d22');ctx.fillStyle='#fff';ctx.font='900 7px system-ui';ctx.textAlign='center';ctx.fillText('FAZENDA',0,5)}
      if(d.type==='fence'){ctx.strokeStyle='#79502f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-25,-9);ctx.lineTo(25,-9);ctx.moveTo(-25,10);ctx.lineTo(25,10);for(let xx=-20;xx<=20;xx+=20){ctx.moveTo(xx,-18);ctx.lineTo(xx,20)}ctx.stroke()}
      if(d.type==='boat'){ctx.font='31px system-ui';ctx.textAlign='center';ctx.fillText('🛶',0,9)}
      if(d.type==='reeds'){ctx.strokeStyle='#487b46';ctx.lineWidth=4;for(let xx=-13;xx<=13;xx+=7){ctx.beginPath();ctx.moveTo(xx,19);ctx.quadraticCurveTo(xx-4,-2,xx+2,-20);ctx.stroke()}}
      if(d.type==='fish'){ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText('🐟',0,9)}
      if(d.type==='net'){ctx.strokeStyle='#e7f4ef';ctx.lineWidth=2;for(let i=-18;i<=18;i+=9){ctx.beginPath();ctx.moveTo(i,-18);ctx.lineTo(i,18);ctx.stroke();ctx.beginPath();ctx.moveTo(-18,i);ctx.lineTo(18,i);ctx.stroke()}}
      if(d.type==='river'){ctx.fillStyle='#84d7e1';ctx.beginPath();ctx.ellipse(0,5,29,17,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e6ffff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-22,2);ctx.quadraticCurveTo(-10,-5,0,2);ctx.quadraticCurveTo(12,9,23,1);ctx.stroke()}
      if(d.type==='water'){ctx.fillStyle='#53bcd0';ctx.beginPath();ctx.arc(-10,4,10,0,Math.PI*2);ctx.arc(8,1,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(-16,-2,23,3)}
      if(d.type==='rock'){ctx.fillStyle='#694438';ctx.beginPath();ctx.moveTo(-24,18);ctx.lineTo(-16,-10);ctx.lineTo(1,-22);ctx.lineTo(23,-5);ctx.lineTo(27,18);ctx.closePath();ctx.fill();ctx.fillStyle='#a56a4e';ctx.beginPath();ctx.moveTo(-12,8);ctx.lineTo(-5,-10);ctx.lineTo(10,-4);ctx.lineTo(16,10);ctx.closePath();ctx.fill()}
      if(d.type==='painting'){ctx.fillStyle='#8d4c36';ctx.beginPath();ctx.roundRect(-25,-21,50,42,9);ctx.fill();ctx.strokeStyle='#f4c079';ctx.lineWidth=3;ctx.beginPath();ctx.arc(-8,-2,5,0,Math.PI*2);ctx.moveTo(-8,3);ctx.lineTo(-8,14);ctx.moveTo(-8,7);ctx.lineTo(-16,11);ctx.moveTo(-8,7);ctx.lineTo(0,11);ctx.moveTo(8,-8);ctx.lineTo(16,7);ctx.stroke()}
      if(d.type==='lizard'){ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText('🦎',0,9)}
      if(d.type==='cave'){ctx.fillStyle='#4d3028';ctx.beginPath();ctx.arc(0,9,27,Math.PI,Math.PI*2);ctx.lineTo(27,22);ctx.lineTo(-27,22);ctx.closePath();ctx.fill();ctx.fillStyle='#1c1514';ctx.beginPath();ctx.arc(0,11,13,Math.PI,Math.PI*2);ctx.lineTo(13,22);ctx.lineTo(-13,22);ctx.closePath();ctx.fill()}
      if(d.type==='capivara'){ctx.font='29px system-ui';ctx.textAlign='center';ctx.fillText('🏞️',0,9)}
      if(d.type==='trail'){ctx.fillStyle='#e5c291';ctx.beginPath();ctx.moveTo(-24,20);ctx.quadraticCurveTo(-8,-18,5,-5);ctx.quadraticCurveTo(17,6,24,-18);ctx.lineWidth=9;ctx.strokeStyle='#d9ad71';ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 8px system-ui';ctx.textAlign='center';ctx.fillText('TRILHA',0,3)}

      if(d.type==='twistedTree'){ctx.strokeStyle='#4c3828';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,22);ctx.quadraticCurveTo(-9,0,3,-22);ctx.moveTo(-1,-2);ctx.lineTo(-17,-13);ctx.moveTo(2,-9);ctx.lineTo(17,-19);ctx.stroke();ctx.fillStyle='#365e3d';for(const [xx,yy,rr] of [[-17,-14,10],[17,-20,10],[2,-25,12]]){ctx.beginPath();ctx.arc(xx,yy,rr,0,Math.PI*2);ctx.fill()}}
      if(d.type==='fog'){ctx.fillStyle='rgba(225,241,235,.55)';for(const [xx,yy,rx,ry] of [[-14,-4,18,8],[7,2,22,9],[-2,13,26,8]]){ctx.beginPath();ctx.ellipse(xx,yy,rx,ry,0,0,Math.PI*2);ctx.fill()}}
      if(d.type==='macaw'){ctx.font='31px system-ui';ctx.textAlign='center';ctx.fillText('🦜',0,9)}
      if(d.type==='boulder'){ctx.fillStyle='#625f54';ctx.beginPath();ctx.moveTo(-24,18);ctx.lineTo(-18,-5);ctx.lineTo(-5,-20);ctx.lineTo(16,-15);ctx.lineTo(25,5);ctx.lineTo(19,19);ctx.closePath();ctx.fill();ctx.fillStyle='#8d897c';ctx.beginPath();ctx.moveTo(-10,4);ctx.lineTo(-3,-11);ctx.lineTo(12,-6);ctx.lineTo(14,6);ctx.closePath();ctx.fill()}
      if(d.type==='confusoes'){ctx.font='29px system-ui';ctx.textAlign='center';ctx.fillText('🌳',0,9);ctx.fillStyle='#eef8ef';ctx.font='900 7px system-ui';ctx.fillText('SERRA',0,22)}
      if(d.type==='trailMarker'){ctx.fillStyle='#6f4c2d';ctx.fillRect(-4,-13,8,34);ctx.fillStyle='#f1d56c';ctx.beginPath();ctx.moveTo(-18,-17);ctx.lineTo(18,-17);ctx.lineTo(11,-4);ctx.lineTo(-18,-4);ctx.closePath();ctx.fill();ctx.fillStyle='#3b4c35';ctx.font='900 8px system-ui';ctx.textAlign='center';ctx.fillText('TRILHA',0,-8)}
      if(d.type==='cliff'){ctx.fillStyle='#7c4e35';ctx.beginPath();ctx.moveTo(-29,22);ctx.lineTo(-20,-14);ctx.lineTo(-5,-25);ctx.lineTo(9,-16);ctx.lineTo(24,-25);ctx.lineTo(29,22);ctx.closePath();ctx.fill();ctx.fillStyle='#a86d49';ctx.fillRect(-15,-5,8,20);ctx.fillRect(8,-10,7,25)}
      if(d.type==='bridge'){ctx.strokeStyle='#6d482c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-27,-13);ctx.lineTo(27,-13);ctx.moveTo(-27,13);ctx.lineTo(27,13);ctx.stroke();ctx.fillStyle='#b9824c';for(let xx=-23;xx<=23;xx+=9)ctx.fillRect(xx,-12,6,24)}
      if(d.type==='canoePoti'){ctx.font='31px system-ui';ctx.textAlign='center';ctx.fillText('🛶',0,9)}
      if(d.type==='waterfall'){ctx.fillStyle='#67c8e0';ctx.beginPath();ctx.roundRect(-15,-24,30,46,9);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=3;for(let xx=-8;xx<=8;xx+=8){ctx.beginPath();ctx.moveTo(xx,-18);ctx.quadraticCurveTo(xx+5,0,xx,16);ctx.stroke()}}
      if(d.type==='canyon'){ctx.font='30px system-ui';ctx.textAlign='center';ctx.fillText('🏜️',0,9);ctx.fillStyle='#fff2dc';ctx.font='900 7px system-ui';ctx.fillText('POTI',0,22)}
      if(d.type==='viewpoint'){ctx.fillStyle='#594334';ctx.fillRect(-22,7,44,8);ctx.fillRect(-18,15,6,9);ctx.fillRect(12,15,6,9);ctx.strokeStyle='#f5d17c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,4);ctx.lineTo(0,-15);ctx.lineTo(18,4);ctx.stroke()}
      if(d.type==='church'){drawHouse(ctx,'#fff3d8','#c45b45','#6f4730');ctx.fillStyle='#fff3d8';ctx.fillRect(-5,-40,10,16);ctx.fillStyle='#d4a34c';ctx.fillRect(-1,-48,2,10);ctx.fillRect(-5,-44,10,2)}
      if(d.type==='mansion'){ctx.fillStyle='#f4ddbd';ctx.fillRect(-27,-18,54,40);ctx.fillStyle='#924c3b';ctx.fillRect(-30,-23,60,8);ctx.fillStyle='#35739a';for(const xx of [-16,0,16]){ctx.fillRect(xx-4,-7,8,11);ctx.fillRect(xx-4,9,8,10)}}
      if(d.type==='streetLamp'){ctx.strokeStyle='#2d2a2d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,23);ctx.lineTo(0,-15);ctx.stroke();ctx.fillStyle='#ffd66f';ctx.shadowColor='#ffd66f';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,-19,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
      if(d.type==='clock'){ctx.fillStyle='#f8ebcf';ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5b4738';ctx.lineWidth=4;ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-12);ctx.moveTo(0,0);ctx.lineTo(10,5);ctx.stroke()}
      if(d.type==='oeiras'){drawHouse(ctx,'#fff4d9','#b45542','#66412d');ctx.fillStyle='#fff';ctx.font='900 7px system-ui';ctx.textAlign='center';ctx.fillText('OEIRAS',0,5)}
      if(d.type==='bunting'){ctx.strokeStyle='#fff2ce';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-28,-12);ctx.lineTo(28,-12);ctx.stroke();const colors=['#e45858','#f4c14e','#4da5d9','#5dc17a'];for(let i=0;i<8;i++){ctx.fillStyle=colors[i%colors.length];ctx.beginPath();ctx.moveTo(-25+i*7,-11);ctx.lineTo(-19+i*7,-11);ctx.lineTo(-22+i*7,0);ctx.closePath();ctx.fill()}}
      if(d.type==='tower'){ctx.fillStyle='#332641';ctx.fillRect(-20,-23,40,47);ctx.fillStyle='#17111f';for(const xx of [-13,0,13])ctx.fillRect(xx-3,-7,6,13);ctx.fillStyle='#6c467f';for(const xx of [-18,-6,6,18])ctx.fillRect(xx-4,-31,8,10)}
      if(d.type==='shadowFlame'){ctx.shadowColor='#bd5cff';ctx.shadowBlur=20;ctx.fillStyle='#7a35c2';ctx.beginPath();ctx.moveTo(0,-25);ctx.quadraticCurveTo(20,-4,9,19);ctx.quadraticCurveTo(0,28,-10,18);ctx.quadraticCurveTo(-21,-4,0,-25);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#e4c3ff';ctx.beginPath();ctx.moveTo(0,-12);ctx.quadraticCurveTo(8,1,3,12);ctx.quadraticCurveTo(-5,8,0,-12);ctx.fill()}
      if(d.type==='castle'){ctx.font='31px system-ui';ctx.textAlign='center';ctx.fillText('🏰',0,9);ctx.fillStyle='#f2ddff';ctx.font='900 7px system-ui';ctx.fillText('CASTELO',0,22)}
      if(d.type==='masterCrystal'){ctx.shadowColor='#ff5f9f';ctx.shadowBlur=22;ctx.fillStyle='#ff5f9f';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(17,-6);ctx.lineTo(10,20);ctx.lineTo(-10,20);ctx.lineTo(-17,-6);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(-4,-17);ctx.lineTo(4,-10);ctx.lineTo(-1,8);ctx.closePath();ctx.fill();ctx.globalAlpha=1}
      ctx.restore();
    }

    drawWalls(ctx){
      const p=this.world.palette;
      for(const key of this.walls){
        const [x,y]=key.split(',').map(Number),px=x*T,py=y*T;ctx.fillStyle=p.wall;ctx.beginPath();ctx.roundRect(px+5,py+5,T-10,T-10,12);ctx.fill();
        ctx.strokeStyle=p.wallEdge;ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(px+14,py+14,T-28,7);
      }
    }

    drawCrates(ctx){
      const p=this.world.palette;
      for(const c of this.crates){
        if(c.destroyed)continue;const x=c.x*T+8,y=c.y*T+8;ctx.fillStyle=p.crateDark;ctx.beginPath();ctx.roundRect(x,y,T-16,T-16,9);ctx.fill();
        ctx.fillStyle=p.crate;ctx.fillRect(x+6,y+6,T-28,T-28);ctx.strokeStyle='#f1ba6c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+9,y+9);ctx.lineTo(x+T-25,y+T-25);ctx.moveTo(x+T-25,y+9);ctx.lineTo(x+9,y+T-25);ctx.stroke();
      }
    }

    drawChallenges(ctx){
      const time=performance.now();
      for(const ch of this.challenges){
        const x=ch.x*T+T/2,y=ch.y*T+T/2,bob=Math.sin(time*.003+ch.id)*2;ctx.save();ctx.translate(x,y+bob);
        ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,20,23,7,0,0,Math.PI*2);ctx.fill();
        ctx.shadowColor=ch.solved?'#6be4ff':'#ffd166';ctx.shadowBlur=ch.solved?17:13;ctx.fillStyle=ch.solved?'#dff8ff':'#245f99';ctx.beginPath();ctx.roundRect(-23,-22,46,42,10);ctx.fill();
        ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.shadowBlur=0;ctx.font=ch.solved?'900 27px system-ui':'25px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ch.solved?'#1672a8':'#fff';ctx.fillText(ch.solved?'✓':this.world.challengeGlyph,0,-1);
        ctx.fillStyle='#75461d';ctx.fillRect(-19,17,38,7);ctx.restore();
      }
    }

    drawPowerups(ctx){
      for(const item of this.powerups){
        if(item.taken)continue;const x=item.x*T+T/2,y=item.y*T+T/2;ctx.save();ctx.translate(x,y);
        const pulse=1+Math.sin(performance.now()*.008+item.x)*.08;ctx.scale(pulse,pulse);
        ctx.shadowColor=item.type==='life'?'#ff6576':'#77efff';ctx.shadowBlur=18;
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.fill();
        if(item.type==='life'){
          ctx.fillStyle='#e53d55';ctx.font='900 23px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('❤',0,1);
        }else{
          const glow=ctx.createRadialGradient(-5,-6,2,0,0,17);glow.addColorStop(0,'#fffef0');glow.addColorStop(.36,'#ffe269');glow.addColorStop(1,'#22b9e7');
          ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
          ctx.fillStyle='#134a73';ctx.font='900 14px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('+1',0,1);
        }
        ctx.restore();
      }
    }

    drawPortal(ctx){
      if(this.world.bossWorld||!this.portalActive)return;
      const x=this.world.portal.x*T+T/2,y=this.world.portal.y*T+T/2,t=performance.now()*.002;ctx.save();ctx.translate(x,y);ctx.rotate(t);
      for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(${80+i*45},${190+i*15},255,${.85-i*.2})`;ctx.lineWidth=7-i*1.5;ctx.beginPath();ctx.ellipse(0,0,20+i*7,29+i*4,0,0,Math.PI*2);ctx.stroke()}
      ctx.rotate(-t);ctx.fillStyle='#fff';ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.fillText('PORTAL',0,-39);ctx.restore();
    }

    drawVignette(ctx){
      const g=ctx.createRadialGradient(C.canvasWidth/2,C.canvasHeight/2,180,C.canvasWidth/2,C.canvasHeight/2,570);g.addColorStop(.55,'rgba(0,0,0,0)');g.addColorStop(1,this.world.palette.vignette);ctx.fillStyle=g;ctx.fillRect(0,0,C.canvasWidth,C.canvasHeight);
    }
  }

  function drawHouse(ctx,body,roof,door){
    ctx.fillStyle=body;ctx.fillRect(-24,-12,48,35);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(-29,-12);ctx.lineTo(0,-33);ctx.lineTo(29,-12);ctx.closePath();ctx.fill();ctx.fillStyle=door;ctx.fillRect(-7,4,14,19);
  }
  function clampNumber(value,min,max,fallback){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}

  G.Game=Game;
})(window);
