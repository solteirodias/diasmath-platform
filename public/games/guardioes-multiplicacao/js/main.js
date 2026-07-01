(function(global){
  'use strict';
  const G=global.Guardioes;
  const $=id=>document.getElementById(id);
  const screens=['screen-menu','screen-learn','screen-manual','screen-settings'];
  let toastTimer=null;let nextWorldId=null;
  const questionUI=new G.QuestionEngine(document);
  let lastFocused=null;

  const UI={
    showScreen(id){
      screens.forEach(screen=>$(screen).classList.toggle('active',screen===id));
      $('screen-game').classList.toggle('active',id==='screen-game');
    },
    updateHud(lives,bombs,crystals,target,world,totalCrystals,boss){
      $('hud-lives').textContent=lives;$('hud-bombs').textContent=bombs;$('hud-crystals').textContent=`${crystals}/${target}`;
      if(world){
        $('hud-world-kicker').textContent=world.bossWorld?'MUNDO EXTRA · TABUADAS MISTURADAS':`MUNDO ${world.id} · TABUADA DO ${world.tabuada}`;
        $('hud-world-name').textContent=world.name;
      }
      const bossHud=$('boss-hud');
      if(bossHud){
        const visible=!!boss;bossHud.hidden=!visible;
        if(visible){
          $('boss-hp-text').textContent=`${boss.hp}/${boss.maxHp}`;
          $('boss-hp-fill').style.width=`${Math.max(0,(boss.hp/boss.maxHp)*100)}%`;
          $('boss-phase').textContent=boss.alive?`Fase ${boss.phase}`:'Derrotado';
        }
      }
    },
    updateWorld(world){
      configureMission(world);questionUI.setWorld(world);
    },
    toast(message){
      const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);
    },
    openQuestion(question,onAnswer,onComplete){questionUI.open(question,onAnswer,onComplete)},
    onWorldComplete(world,nextWorld,isFinal){showWorldTransition(world,nextWorld,isFinal)},
    onGameOver(){$('overlay-gameover').classList.add('active')},
    onFinalVictory(world,stats){showFinalVictory(world,stats)},
    onSaveChange(){refreshContinueButton()}
  };

  const game=new G.Game($('game-canvas'),UI);
  G.GameInstance=game;
  G.Input.bindMobile(document);

  function hideOverlays(){document.querySelectorAll('.overlay').forEach(el=>el.classList.remove('active'))}
  function show(id){G.Audio.play('click');UI.showScreen(id)}
  function refreshContinueButton(){
    const save=G.Progress.load();const button=$('btn-continue');const available=!!save&&!save.stageComplete;
    button.disabled=!available;button.classList.toggle('disabled',!available);
    button.title=available?`Continuar no Mundo ${save.worldId}`:'Nenhum progresso salvo';
  }
  function configureMission(world){
    $('mission-icon').textContent=world.worldIcon;$('mission-kicker').textContent=world.missionKicker;
    $('mission-title').textContent=world.subtitle;$('mission-text').textContent=world.mission;
    $('btn-begin-mission').textContent=world.bossWorld?'Enfrentar o chefão':world.id===1?'Começar missão':'Explorar este mundo';
    document.documentElement.style.setProperty('--world-accent',world.palette.accent);
  }
  function showMission(world){
    configureMission(world);questionUI.setWorld(world);$('overlay-mission').classList.add('active');
  }
  function menu(){
    game.stop();hideOverlays();show('screen-menu');refreshContinueButton();
  }
  function prepareNewAdventure(){
    G.Audio.unlock();hideOverlays();UI.showScreen('screen-game');const world=game.startNew();showMission(world);refreshContinueButton();
  }
  function prepareContinue(){
    const save=G.Progress.load();if(!save||save.stageComplete){prepareNewAdventure();return}
    G.Audio.unlock();hideOverlays();UI.showScreen('screen-game');const world=game.continueSaved();showMission(world);
  }
  function beginMission(){$('overlay-mission').classList.remove('active');game.beginMission()}
  function restartMission(){
    hideOverlays();UI.showScreen('screen-game');const world=game.restartCurrentWorld();showMission(world);
  }
  function showWorldTransition(world,nextWorld,isFinal){
    nextWorldId=nextWorld?.id||null;
    $('world-transition-icon').textContent=world.worldIcon;$('world-complete-kicker').textContent=world.completeKicker;
    $('world-complete-title').textContent=world.completeTitle;$('world-complete-text').textContent=world.transitionText;
    $('next-world-panel').hidden=isFinal;$('btn-next-world').hidden=isFinal;
    if(nextWorld){$('next-world-icon').textContent=nextWorld.worldIcon;$('next-world-name').textContent=nextWorld.name;$('btn-next-world').textContent='Entrar no novo mundo'}
    $('btn-world-menu').textContent=isFinal?'Concluir Etapa 6':'Voltar ao menu';
    $('overlay-world').classList.add('active');
  }
  function showFinalVictory(world,stats){
    G.Audio.play('finalVictory');
    $('final-score').textContent=stats.score;
    $('final-lives').textContent=stats.lives;
    $('final-lights').textContent=stats.bombs;
    $('final-crystals').textContent=stats.totalCrystals;
    $('overlay-final').classList.add('active');
  }

  function enterNextWorld(){
    if(!nextWorldId)return;G.Audio.play('portal');$('overlay-world').classList.remove('active');
    const world=game.advanceToWorld(nextWorldId);showMission(world);nextWorldId=null;
  }

  $('btn-start').addEventListener('click',prepareNewAdventure);
  $('btn-continue').addEventListener('click',prepareContinue);
  $('btn-learn').addEventListener('click',()=>show('screen-learn'));
  $('btn-manual').addEventListener('click',()=>show('screen-manual'));
  $('btn-settings').addEventListener('click',()=>show('screen-settings'));
  document.querySelectorAll('[data-back-menu]').forEach(button=>button.addEventListener('click',()=>show('screen-menu')));
  function loadSettingsUI(){
    const v=G.Settings.value;
    $('setting-sound').checked=!!v.sound;$('setting-volume').value=v.volume;$('setting-volume-value').textContent=`${v.volume}%`;
    $('setting-reduced-motion').checked=!!v.reducedMotion;$('setting-high-contrast').checked=!!v.highContrast;$('setting-large-text').checked=!!v.largeText;
  }
  function saveSettingsFromUI(){G.Settings.save({sound:$('setting-sound').checked,volume:Number($('setting-volume').value),reducedMotion:$('setting-reduced-motion').checked,highContrast:$('setting-high-contrast').checked,largeText:$('setting-large-text').checked})}
  ['setting-sound','setting-reduced-motion','setting-high-contrast','setting-large-text'].forEach(id=>$(id).addEventListener('change',saveSettingsFromUI));
  $('setting-volume').addEventListener('input',event=>{$('setting-volume-value').textContent=`${event.target.value}%`;saveSettingsFromUI()});

  $('btn-begin-mission').addEventListener('click',beginMission);
  $('btn-pause').addEventListener('click',()=>{game.setPaused(true);if(game.paused)$('overlay-pause').classList.add('active')});
  $('btn-resume').addEventListener('click',()=>{game.setPaused(false);$('overlay-pause').classList.remove('active')});
  $('btn-restart').addEventListener('click',restartMission);
  $('btn-exit').addEventListener('click',menu);
  $('btn-gameover-restart').addEventListener('click',restartMission);
  $('btn-gameover-menu').addEventListener('click',menu);
  $('btn-next-world').addEventListener('click',enterNextWorld);
  $('btn-world-menu').addEventListener('click',menu);
  $('btn-final-restart').addEventListener('click',prepareNewAdventure);
  $('btn-final-menu').addEventListener('click',menu);
  $('btn-fullscreen').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch(_){UI.toast('A tela cheia não está disponível neste navegador.')}});
  $('btn-error-reload').addEventListener('click',()=>location.reload());
  $('btn-error-menu').addEventListener('click',menu);
  global.addEventListener('guardioes:escape',()=>{
    if($('overlay-question').classList.contains('active')||$('overlay-mission').classList.contains('active')||$('overlay-world').classList.contains('active')||$('overlay-final').classList.contains('active'))return;
    if($('overlay-pause').classList.contains('active')){$('btn-resume').click();return}
    if(game.running&&!game.gameOver&&!game.completed){game.setPaused(true);if(game.paused)$('overlay-pause').classList.add('active')}
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&game.running&&!game.paused&&!game.modalOpen&&!game.gameOver&&!game.completed){game.setPaused(true);$('overlay-pause').classList.add('active')}
  });
  global.addEventListener('pointerdown',()=>G.Audio.unlock(),{once:true});
  global.addEventListener('error',event=>console.error('Guardioes Engine:',event.error||event.message));

  loadSettingsUI();G.Settings.apply();
  const diagnostic=G.Diagnostics.validate();
  if(!diagnostic.ok){$('error-message').textContent=diagnostic.errors.slice(0,4).join(' ');$('overlay-error').classList.add('active')}
  refreshContinueButton();configureMission(G.Worlds[0]);questionUI.setWorld(G.Worlds[0]);
})(window);
