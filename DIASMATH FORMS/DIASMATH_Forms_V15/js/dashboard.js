
function loadDashboard(){
 const forms=JSON.parse(localStorage.getItem("dm_form")||"[]");
 const answers=JSON.parse(localStorage.getItem("dm_answers")||"[]");
 document.getElementById("forms").textContent=forms.length?1:0;
 document.getElementById("responses").textContent=answers.length;
 document.getElementById("participants").textContent=new Set(answers.map(a=>a.nome)).size;

 let html="";
 forms.forEach((q,idx)=>{
   if(!["Múltipla escolha","Caixas de seleção","Lista suspensa"].includes(q.type)) return;
   let counts={};
   q.options.forEach(o=>counts[o]=0);
   answers.forEach(r=>{
      let a=r.answers[idx]?.value;
      if(Array.isArray(a)){a.forEach(v=>counts[v]=(counts[v]||0)+1);}
      else if(a in counts){counts[a]++;}
   });
   html+=`<div class='card'><h3>${q.title}</h3><table border='1' cellpadding='6'><tr><th>Opção</th><th>Qtd</th></tr>`;
   Object.entries(counts).forEach(([k,v])=>html+=`<tr><td>${k}</td><td>${v}</td></tr>`);
   html+="</table><p><em>Na versão seguinte será substituído por gráficos Chart.js.</em></p></div>";
 });
 document.getElementById("analysis").innerHTML=html||"<div class='card'>Nenhuma pergunta objetiva encontrada.</div>";
}
function exportJSON(){
 const data={
   form:JSON.parse(localStorage.getItem("dm_form")||"[]"),
   answers:JSON.parse(localStorage.getItem("dm_answers")||"[]")
 };
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="diasmath_forms_backup.json";
 a.click();
}
