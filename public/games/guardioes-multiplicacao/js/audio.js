(function(global){
  'use strict';
  const G = global.Guardioes = global.Guardioes || {};

  class AudioSystem{
    constructor(){this.ctx=null;this.enabled=true;this.master=.075}
    unlock(){
      if(!this.enabled)return;
      if(!this.ctx){
        const AC=global.AudioContext||global.webkitAudioContext;
        if(AC)this.ctx=new AC();
      }
      if(this.ctx && this.ctx.state==='suspended')this.ctx.resume();
    }
    setEnabled(value){this.enabled=!!value;if(this.enabled)this.unlock()}
    setVolume(value){const n=Number(value);this.master=Math.max(0,Math.min(.12,Number.isFinite(n)?n*.12:.075))}
    tone(freq,duration=.12,type='sine',volume=1,delay=0){
      if(!this.enabled)return;
      this.unlock(); if(!this.ctx)return;
      const t=this.ctx.currentTime+delay;
      const osc=this.ctx.createOscillator(); const gain=this.ctx.createGain();
      osc.type=type; osc.frequency.setValueAtTime(freq,t);
      gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(this.master*volume,t+.01);
      gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
      osc.connect(gain).connect(this.ctx.destination); osc.start(t); osc.stop(t+duration+.03);
    }
    play(name){
      const map={
        click:()=>{this.tone(420,.08,'triangle',.8)},
        start:()=>{this.tone(294,.11,'triangle');this.tone(392,.12,'triangle',1,.09);this.tone(587,.18,'triangle',1,.18)},
        collect:()=>{this.tone(660,.08,'sine');this.tone(880,.16,'sine',1,.08)},
        item:()=>{this.tone(520,.08,'triangle');this.tone(740,.12,'triangle',1,.07)},
        hit:()=>{this.tone(140,.28,'sawtooth',1.3)},
        place:()=>{this.tone(250,.08,'square',.8)},
        blast:()=>{this.tone(90,.35,'sawtooth',1.5);this.tone(820,.14,'sine',.8,.05)},
        ghost:()=>{this.tone(900,.09,'triangle');this.tone(500,.16,'triangle',1,.06)},
        portal:()=>{this.tone(360,.15,'sine');this.tone(520,.18,'sine',1,.12);this.tone(760,.3,'sine',1,.25)},
        win:()=>{[392,494,587,784].forEach((f,i)=>this.tone(f,.25,'triangle',1,i*.11))},
        question:()=>{this.tone(520,.08,'triangle',.8);this.tone(690,.12,'sine',.9,.07)},
        correct:()=>{this.tone(523,.08,'triangle');this.tone(659,.10,'triangle',1,.07);this.tone(784,.18,'triangle',1,.14)},
        wrong:()=>{this.tone(210,.18,'sawtooth',.8);this.tone(160,.22,'triangle',.7,.12)},
        bossHit:()=>{this.tone(170,.16,'sawtooth',1.2);this.tone(420,.12,'square',.8,.08)},
        bossStun:()=>{this.tone(860,.12,'sine');this.tone(620,.2,'triangle',1,.08)},
        bossSummon:()=>{this.tone(120,.32,'sawtooth',1.1);this.tone(240,.22,'sine',.7,.12)},
        bossTeleport:()=>{this.tone(760,.08,'sine',.7);this.tone(380,.24,'sine',.8,.06)},
        bossDefeat:()=>{[196,247,330,440,659].forEach((f,i)=>this.tone(f,.32,'triangle',1.1,i*.09))},
        finalVictory:()=>{[392,494,587,784,988].forEach((f,i)=>this.tone(f,.45,'triangle',1.2,i*.13))},
        pause:()=>this.tone(230,.09,'triangle',.7)
      };
      if(map[name])map[name]();
    }
  }
  G.Audio = new AudioSystem();
})(window);
