(function(global){
  'use strict';
  const G=global.Guardioes=global.Guardioes||{};
  function validate(){
    const errors=[],warnings=[],ids=new Set();
    if(!Array.isArray(G.Worlds)||G.Worlds.length!==10)errors.push(`Esperados 10 mundos; encontrados ${G.Worlds?.length||0}.`);
    let total=0;
    (G.Worlds||[]).forEach(world=>{
      const qs=G.QuestionDatabase?.getWorld(world.id)||[];total+=qs.length;
      const expected=world.targetChallenges||9;
      if(qs.length!==expected)errors.push(`Mundo ${world.id}: ${qs.length} desafios; esperado ${expected}.`);
      if((world.challengeSpawns||[]).length!==expected)errors.push(`Mundo ${world.id}: posições de desafios inconsistentes.`);
      qs.forEach((q,index)=>{
        if(!q.id||ids.has(q.id))errors.push(`ID duplicado/ausente no mundo ${world.id}, questão ${index+1}.`);ids.add(q.id);
        const answer=Number(q.fact?.[0])*Number(q.fact?.[1]);
        if(!Number.isFinite(answer))errors.push(`${q.id}: fato multiplicativo inválido.`);
        if(!Array.isArray(q.alternatives)||q.alternatives.length!==4||!q.alternatives.map(Number).includes(answer))errors.push(`${q.id}: alternativas não contêm a resposta correta.`);
        const p=q.practice||{};
        if(Number(p.groups)!==Number(q.fact?.[0])||Number(p.perGroup)!==Number(q.fact?.[1]))errors.push(`${q.id}: prática não corresponde ao fato multiplicativo.`);
        if(!q.text?.includes('?'))warnings.push(`${q.id}: enunciado sem ponto de interrogação.`);
        if(!p.itemEmoji||!p.groupIcon)errors.push(`${q.id}: objetos visuais ausentes.`);
      });
    });
    if(total!==91)errors.push(`Esperados 91 desafios; encontrados ${total}.`);
    const result={ok:errors.length===0,errors,warnings,total,checkedAt:new Date().toISOString()};
    G.DiagnosticsResult=result;console.info('[Guardiões] Diagnóstico:',result);return result;
  }
  G.Diagnostics={validate};
})(window);
