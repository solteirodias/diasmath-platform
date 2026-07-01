(function(global){
  'use strict';
  const G=global.Guardioes=global.Guardioes||{};
  const KEY='guardioes-multiplicacao-settings-v1';
  const defaults=Object.freeze({sound:true,volume:75,reducedMotion:false,highContrast:false,largeText:false});
  class SettingsSystem{
    constructor(){this.value=this.load();this.apply()}
    load(){try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(_){return{...defaults}}}
    save(patch){this.value={...this.value,...patch};try{localStorage.setItem(KEY,JSON.stringify(this.value))}catch(_){}this.apply();return this.value}
    apply(){
      const root=document.documentElement,v=this.value;
      root.classList.toggle('reduced-motion',!!v.reducedMotion);
      root.classList.toggle('high-contrast',!!v.highContrast);
      root.classList.toggle('large-text',!!v.largeText);
      if(G.Audio){G.Audio.setEnabled(!!v.sound);G.Audio.setVolume(Number(v.volume)/100)}
    }
  }
  G.Settings=new SettingsSystem();
})(window);
