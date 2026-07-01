(function(global){
  'use strict';
  const G = global.Guardioes = global.Guardioes || {};
  const C=()=>G.Config;

  class Player{
    constructor(tileX,tileY){
      this.size=36;this.x=tileX*C().tile+(C().tile-this.size)/2;this.y=tileY*C().tile+(C().tile-this.size)/2;
      this.dir='down';this.anim=0;this.invulnerable=0;
    }
    get center(){return{x:this.x+this.size/2,y:this.y+this.size/2}}
    update(dt,input,game){
      if(this.invulnerable>0)this.invulnerable-=dt;
      const v=input.vector(); if(!v.x&&!v.y)return;
      if(Math.abs(v.x)>Math.abs(v.y))this.dir=v.x>0?'right':'left';else this.dir=v.y>0?'down':'up';
      const distance=C().playerSpeed*(dt/1000);
      game.moveEntity(this,v.x*distance,v.y*distance);
      this.anim+=dt*.012;
    }
    draw(ctx){
      if(this.invulnerable>0&&Math.floor(this.invulnerable/90)%2===0)return;
      const c=this.center,bob=Math.sin(this.anim)*1.4;
      ctx.save();ctx.translate(c.x,c.y+bob);
      ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,17,17,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f0a34a';rounded(ctx,-17,-4,34,30,10,true);ctx.fillStyle='#176bb2';rounded(ctx,-15,-2,30,21,8,true);
      ctx.fillStyle='#ffe1b2';ctx.beginPath();ctx.arc(0,-13,12,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#8b5a2b';ctx.beginPath();ctx.arc(0,-17,13,Math.PI,0);ctx.fill();
      ctx.fillStyle='#d9a441';rounded(ctx,-17,-24,34,8,4,true);rounded(ctx,-10,-31,20,12,5,true);
      ctx.fillStyle='#142b3f';ctx.fillRect(-5,-14,3,3);ctx.fillRect(4,-14,3,3);
      ctx.strokeStyle='#8b3e23';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-9,4,0,Math.PI);ctx.stroke();
      ctx.fillStyle='#ffd166';ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(7,9);ctx.lineTo(0,17);ctx.lineTo(-7,9);ctx.closePath();ctx.fill();
      ctx.restore();
    }
  }

  class Ghost{
    constructor(tileX,tileY,kind,color,index){
      this.size=38;this.x=tileX*C().tile+13;this.y=tileY*C().tile+13;this.spawn={x:this.x,y:this.y};
      this.kind=kind;this.color=color;this.index=index;this.alive=true;this.respawn=0;
      this.dir={x:index%2?1:-1,y:0};this.changeIn=500+Math.random()*900;this.anim=Math.random()*6;this.squareStep=index%4;
      this.speed=kind==='chaser'?116:kind==='guard'?104:kind==='patrol'?92:kind==='square'?88:82;
    }
    get center(){return{x:this.x+this.size/2,y:this.y+this.size/2}}
    defeat(){this.alive=false;this.respawn=C().ghostRespawnMs}
    update(dt,game){
      if(!this.alive){
        this.respawn-=dt;
        if(this.respawn<=0){this.x=this.spawn.x;this.y=this.spawn.y;this.alive=true;this.changeIn=250}
        return;
      }
      this.anim+=dt*.008;this.changeIn-=dt;
      const p=game.player.center,c=this.center,dx=p.x-c.x,dy=p.y-c.y;

      if(this.kind==='chaser'){
        if(this.changeIn<=0){this.changeIn=310;this.dir=Math.abs(dx)>Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)}}
      }else if(this.kind==='guard'){
        const distanceToPlayer=Math.hypot(dx,dy);
        if(distanceToPlayer<190&&this.changeIn<=0){
          this.changeIn=300;this.dir=Math.abs(dx)>Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)};
        }else if(this.changeIn<=0){
          this.changeIn=620;
          const target=game.getNearestUnsolvedChallenge(c) || {x:this.spawn.x+this.size/2,y:this.spawn.y+this.size/2};
          const tx=target.x-c.x,ty=target.y-c.y;
          this.dir=Math.abs(tx)>Math.abs(ty)?{x:Math.sign(tx)||1,y:0}:{x:0,y:Math.sign(ty)||1};
        }
      }else if(this.kind==='square'){
        if(this.changeIn<=0){
          const dirs=[{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}];
          this.squareStep=(this.squareStep+1)%dirs.length;this.dir=dirs[this.squareStep];this.changeIn=820;
        }
      }else if(this.kind==='patrol'){
        if(this.changeIn<=0){
          this.changeIn=850+Math.random()*500;
          this.dir=this.index%2===0?{x:-this.dir.x||1,y:0}:{x:0,y:-this.dir.y||1};
        }
      }else if(this.changeIn<=0){
        this.changeIn=450+Math.random()*850;this.dir=randomDirection();
      }

      const d=this.speed*(dt/1000);const moved=game.moveEntity(this,this.dir.x*d,this.dir.y*d);
      if(!moved){
        if(this.kind==='square'){this.squareStep=(this.squareStep+1)%4;this.dir=[{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}][this.squareStep]}
        else this.dir=randomDirection();
        this.changeIn=160;
      }
    }
    draw(ctx){
      if(!this.alive)return;const c=this.center,bob=Math.sin(this.anim)*3;
      ctx.save();ctx.translate(c.x,c.y+bob);ctx.shadowColor=this.color;ctx.shadowBlur=12;
      ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(0,-4,18,Math.PI,0);ctx.lineTo(18,15);ctx.quadraticCurveTo(12,8,7,15);ctx.quadraticCurveTo(1,8,-5,15);ctx.quadraticCurveTo(-11,8,-18,15);ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-7,-5,5,7,0,0,Math.PI*2);ctx.ellipse(7,-5,5,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#17324a';ctx.beginPath();ctx.arc(-6,-4,2.5,0,Math.PI*2);ctx.arc(8,-4,2.5,0,Math.PI*2);ctx.fill();
      if(this.kind==='guard'){ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-4,22,0,Math.PI*2);ctx.stroke()}
      ctx.restore();
    }
  }


  class Boss{
    constructor(tileX,tileY,maxHp=10){
      this.size=78;this.x=tileX*C().tile+(C().tile-this.size)/2;this.y=tileY*C().tile+(C().tile-this.size)/2;
      this.maxHp=maxHp;this.hp=maxHp;this.alive=true;this.flash=0;this.stun=0;this.anim=0;
      this.teleportIn=4200;this.summonIn=5200;this.phase=1;
      this.positions=[{x:7,y:5},{x:5,y:3},{x:9,y:3},{x:5,y:7},{x:9,y:7},{x:11,y:5},{x:3,y:5}];
    }
    get center(){return{x:this.x+this.size/2,y:this.y+this.size/2}}
    setHp(value){this.hp=Math.max(0,Math.min(this.maxHp,Number(value)||0));this.alive=this.hp>0;this.updatePhase()}
    updatePhase(){this.phase=this.hp<=3?3:this.hp<=6?2:1}
    damage(){
      if(!this.alive)return false;
      this.hp=Math.max(0,this.hp-1);this.flash=620;this.stun=760;this.updatePhase();
      if(this.hp===0)this.alive=false;
      return !this.alive;
    }
    applyLight(){if(this.alive){this.stun=Math.max(this.stun,1500);this.flash=240}}
    update(dt,game){
      this.anim+=dt*.004;if(this.flash>0)this.flash-=dt;if(!this.alive)return;
      if(this.stun>0){this.stun-=dt;return}
      this.teleportIn-=dt;this.summonIn-=dt;
      if(this.teleportIn<=0){
        this.teleportIn=this.phase===3?2400:this.phase===2?3200:4300;
        const choices=this.positions.filter(pos=>!game.isBlocked(pos.x,pos.y));
        const pos=choices[Math.floor(Math.random()*choices.length)]||this.positions[0];
        this.x=pos.x*C().tile+(C().tile-this.size)/2;this.y=pos.y*C().tile+(C().tile-this.size)/2;
        game.onBossTeleport?.();
      }
      if(this.summonIn<=0){
        this.summonIn=this.phase===3?3000:this.phase===2?4100:5600;
        game.spawnBossMinion?.(this.center,this.phase);
      }
    }
    draw(ctx){
      const c=this.center,bob=Math.sin(this.anim*2.2)*4;
      ctx.save();ctx.translate(c.x,c.y+bob);
      ctx.globalAlpha=this.alive?1:.28;
      ctx.shadowColor=this.flash>0?'#fff8b0':'#b85cff';ctx.shadowBlur=this.flash>0?34:22;
      ctx.fillStyle=this.flash>0?'#f8edff':'#21152f';
      ctx.beginPath();ctx.moveTo(-35,34);ctx.quadraticCurveTo(-28,-12,-20,-28);ctx.quadraticCurveTo(0,-48,20,-28);ctx.quadraticCurveTo(30,-6,35,34);ctx.closePath();ctx.fill();
      ctx.fillStyle='#3e2358';ctx.beginPath();ctx.arc(0,-19,22,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ff4f72';ctx.shadowColor='#ff4f72';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(-8,-20,4,0,Math.PI*2);ctx.arc(8,-20,4,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;ctx.strokeStyle='#d6b5ff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(25,-18);ctx.lineTo(37,31);ctx.stroke();
      ctx.fillStyle='#ff3d6e';ctx.shadowColor='#ff3d6e';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(25,-29);ctx.lineTo(35,-20);ctx.lineTo(25,-11);ctx.lineTo(15,-20);ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='#f4dcff';ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillText(`FASE ${this.phase}`,0,50);
      ctx.restore();
    }
  }

  class LightBomb{
    constructor(tileX,tileY){
      this.tileX=tileX;this.tileY=tileY;this.fuse=C().bombFuseMs;this.blast=C().blastMs;this.exploded=false;this.cells=[];this.finished=false;
    }
    update(dt,game){
      if(!this.exploded){this.fuse-=dt;if(this.fuse<=0){this.exploded=true;this.cells=game.computeBlast(this.tileX,this.tileY);game.onBombExploded(this)}}
      else{this.blast-=dt;if(this.blast<=0)this.finished=true}
    }
    draw(ctx){
      const t=C().tile,cx=this.tileX*t+t/2,cy=this.tileY*t+t/2;
      if(!this.exploded){
        const pulse=1+Math.sin(performance.now()*.018)*.12;ctx.save();ctx.translate(cx,cy);ctx.scale(pulse,pulse);
        ctx.shadowColor='#fff3a0';ctx.shadowBlur=18;ctx.fillStyle='#ffe36f';ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
        ctx.fillStyle='#123b62';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',0,1);ctx.restore();return;
      }
      ctx.save();ctx.globalCompositeOperation='screen';
      for(const cell of this.cells){
        const x=cell.x*t,y=cell.y*t;const grad=ctx.createRadialGradient(x+t/2,y+t/2,3,x+t/2,y+t/2,t*.55);
        grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(.35,'rgba(255,240,120,.95)');grad.addColorStop(1,'rgba(255,184,49,0)');ctx.fillStyle=grad;ctx.fillRect(x-4,y-4,t+8,t+8);
      }
      ctx.restore();
    }
  }

  function randomDirection(){const dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];return dirs[Math.floor(Math.random()*dirs.length)]}
  function rounded(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill()}
  G.Entities={Player,Ghost,Boss,LightBomb};
})(window);
