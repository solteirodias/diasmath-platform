(function(global){
  'use strict';
  const G = global.Guardioes = global.Guardioes || {};
  class InputSystem{
    constructor(){
      this.state={up:false,down:false,left:false,right:false};
      this.lightRequested=false;
      this.bindKeyboard();
    }
    bindKeyboard(){
      const directions={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
      global.addEventListener('keydown',e=>{
        if(directions[e.code]){this.state[directions[e.code]]=true;e.preventDefault()}
        if(e.code==='Space'){if(!e.repeat)this.lightRequested=true;e.preventDefault()}
        if(e.code==='Escape'&&!e.repeat)global.dispatchEvent(new CustomEvent('guardioes:escape'))
      },{passive:false});
      global.addEventListener('keyup',e=>{if(directions[e.code]){this.state[directions[e.code]]=false;e.preventDefault()}},{passive:false});
      global.addEventListener('blur',()=>this.clear());
    }
    bindMobile(root=document){
      root.querySelectorAll('[data-direction]').forEach(btn=>{
        const dir=btn.dataset.direction;
        const down=e=>{e.preventDefault();this.state[dir]=true};
        const up=e=>{e.preventDefault();this.state[dir]=false};
        btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);
      });
      const light=root.getElementById('btn-light');
      if(light)light.addEventListener('pointerdown',e=>{e.preventDefault();this.lightRequested=true});
    }
    consumeLight(){const value=this.lightRequested;this.lightRequested=false;return value}
    vector(){
      let x=(this.state.right?1:0)-(this.state.left?1:0);
      let y=(this.state.down?1:0)-(this.state.up?1:0);
      if(x&&y){const n=Math.SQRT1_2;x*=n;y*=n}
      return{x,y};
    }
    clear(){Object.keys(this.state).forEach(k=>this.state[k]=false);this.lightRequested=false}
  }
  G.Input = new InputSystem();
})(window);
