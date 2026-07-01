(function(global){
  'use strict';
  const G=global.Guardioes=global.Guardioes||{};

  class ProgressSystem{
    constructor(){this.key='guardioes-multiplicacao-v1';this.legacyKeys=[G.Config.saveKey,'guardioes-multiplicacao-etapa-6']}
    load(){
      try{
        let raw=global.localStorage.getItem(this.key);
        if(!raw){for(const key of this.legacyKeys){raw=global.localStorage.getItem(key);if(raw){global.localStorage.setItem(this.key,raw);break}}}
        if(!raw)return null;
        const data=JSON.parse(raw);
        if(!data||!Number.isInteger(data.worldId))return null;
        // Migração da Etapa 8: partidas antigas recebem a nova carga inicial mínima.
        if((data.saveVersion||0)<2&&Number(data.bombs)<10){data.bombs=10;this.save(data)}
        return data;
      }catch(error){console.warn('Não foi possível carregar o progresso.',error);return null}
    }
    save(data){
      try{
        global.localStorage.setItem(this.key,JSON.stringify({...data,saveVersion:2,updatedAt:new Date().toISOString()}));
        return true;
      }catch(error){console.warn('Não foi possível salvar o progresso.',error);return false}
    }
    clear(){
      try{global.localStorage.removeItem(this.key);this.legacyKeys.forEach(key=>global.localStorage.removeItem(key))}catch(error){console.warn('Não foi possível apagar o progresso.',error)}
    }
    hasSave(){return !!this.load()}
  }

  G.Progress=new ProgressSystem();
})(window);
