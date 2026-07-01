(function(global){
  'use strict';
  const G=global.Guardioes=global.Guardioes||{};

  class QuestionEngine{
    constructor(root=document){
      this.overlay=root.getElementById('overlay-question');
      this.questionView=root.getElementById('question-view');
      this.practiceView=root.getElementById('practice-view');
      this.objectIcon=root.getElementById('question-object-icon');
      this.objectName=root.getElementById('question-object-name');
      this.title=root.getElementById('question-title');
      this.text=root.getElementById('question-text');
      this.options=root.getElementById('question-options');
      this.feedbackBadge=root.getElementById('feedback-badge');
      this.feedbackTitle=root.getElementById('feedback-title');
      this.feedbackMessage=root.getElementById('feedback-message');
      this.practiceGroups=root.getElementById('practice-groups');
      this.practiceAddition=root.getElementById('practice-addition');
      this.practiceMultiplication=root.getElementById('practice-multiplication');
      this.continueButton=root.getElementById('btn-practice-continue');
      this.question=null;this.answerHandler=null;this.completeHandler=null;this.optionOrder=[];
      this.world=null;
    }
    setWorld(world){
      this.world=world;
      if(this.objectIcon)this.objectIcon.textContent=world.challengeGlyph||'✦';
      if(this.objectName)this.objectName.textContent=(world.challengeName||'Desafio do mundo').toUpperCase();
    }
    open(question,answerHandler,completeHandler){
      this.question=question;this.answerHandler=answerHandler;this.completeHandler=completeHandler;
      this.optionOrder=this.shuffle([...question.alternatives]);
      this.renderQuestion();this.overlay.classList.add('active');
      setTimeout(()=>this.options.querySelector('button')?.focus(),40);
    }
    close(payload){
      this.overlay.classList.remove('active');const callback=this.completeHandler;
      this.question=null;this.answerHandler=null;this.completeHandler=null;
      if(callback)callback(payload||{});
    }
    renderQuestion(){
      if(!this.question)return;
      this.questionView.hidden=false;this.practiceView.hidden=true;this.title.textContent=this.question.title;this.text.textContent=this.question.text;this.options.innerHTML='';
      this.optionOrder.forEach((value,index)=>{
        const button=document.createElement('button');button.type='button';button.className='answer-button';
        button.setAttribute('aria-label',`Alternativa ${String.fromCharCode(65+index)}: ${value}`);
        button.innerHTML=`<span>${String.fromCharCode(65+index)}</span> ${value}`;
        button.addEventListener('click',()=>this.choose(value));this.options.appendChild(button);
      });
    }
    choose(value){
      this.options.querySelectorAll('button').forEach(button=>button.disabled=true);
      const result=this.answerHandler?this.answerHandler(value):{correct:false};this.showPractice(result);
    }
    showPractice(result){
      const q=this.question,p=q.practice,answer=q.fact[0]*q.fact[1];
      this.questionView.hidden=true;this.practiceView.hidden=false;
      this.feedbackBadge.className=`feedback-badge ${result.correct?'correct':'wrong'}`;
      this.feedbackBadge.textContent=result.correct?(this.world?.bossWorld?'GOLPE DE CONHECIMENTO':'ACERTOU'):'VAMOS COMPREENDER';
      this.feedbackTitle.textContent=result.correct?(this.world?.bossWorld?'A armadura do chefão foi enfraquecida!':'Muito bem, Guardião!'):'Observe como os grupos são formados';
      if(result.correct){
        this.feedbackMessage.textContent=`Você organizou corretamente ${p.groups} ${p.groups===1?'grupo':'grupos'} com ${p.perGroup} ${p.itemName} ${p.groups===1?'nesse grupo':'em cada grupo'}.`;
      }else{
        this.feedbackMessage.textContent=`A alternativa escolhida não representa a situação. Veja a organização correta e tente novamente. Vidas restantes: ${Math.max(0,result.lives)}.`;
      }
      this.practiceGroups.innerHTML='';
      for(let group=1;group<=p.groups;group++){
        const set=document.createElement('div');set.className='practice-set';
        const label=document.createElement('strong');label.textContent=`${p.groupLabel}${p.groups>1?` ${group}`:''}`;
        const container=document.createElement('div');container.className='container-icon';container.textContent=p.groupIcon||'📦';
        const items=document.createElement('div');items.className='practice-items';
        for(let item=0;item<p.perGroup;item++){const span=document.createElement('span');span.textContent=p.itemEmoji;items.appendChild(span)}
        set.append(label,container,items);this.practiceGroups.appendChild(set);
      }
      const repeated=Array.from({length:p.groups},()=>p.perGroup).join(' + ');
      this.practiceAddition.textContent=p.groups===1?`${p.perGroup} = ${answer}`:`${repeated} = ${answer}`;
      this.practiceMultiplication.textContent=`${p.groups} × ${p.perGroup} = ${answer}`;
      this.continueButton.textContent=result.gameOver?'Continuar':result.correct?(this.world?.bossWorld?'Voltar à batalha':'Continuar aventura'):'Tentar novamente';
      this.continueButton.onclick=()=>{
        G.Audio.play('click');
        if(result.gameOver)this.close({gameOver:true,correct:false});
        else if(result.correct)this.close({correct:true});
        else this.renderQuestion();
      };
      setTimeout(()=>this.continueButton.focus(),40);
    }
    shuffle(values){
      for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}
      return values;
    }
  }
  G.QuestionEngine=QuestionEngine;
})(window);
