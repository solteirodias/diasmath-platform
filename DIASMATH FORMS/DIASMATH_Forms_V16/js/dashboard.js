
function load(){
 const forms=JSON.parse(localStorage.getItem("dm_form")||"[]");
 const answers=JSON.parse(localStorage.getItem("dm_answers")||"[]");
 const sel=document.getElementById("question");
 sel.innerHTML="";
 forms.forEach((q,i)=>{
   if(["Múltipla escolha","Caixas de seleção","Lista suspensa"].includes(q.type)){
      let o=document.createElement("option");
      o.value=i;o.textContent=q.title;sel.appendChild(o);
   }
 });
 if(sel.options.length) draw();
 document.getElementById("info").textContent=`${answers.length} respostas carregadas`;
}
function draw(){
 const idx=parseInt(document.getElementById("question").value);
 const forms=JSON.parse(localStorage.getItem("dm_form")||"[]");
 const answers=JSON.parse(localStorage.getItem("dm_answers")||"[]");
 const q=forms[idx];
 let counts={}; q.options.forEach(o=>counts[o]=0);
 answers.forEach(r=>{
   let v=r.answers[idx]?.value;
   if(Array.isArray(v)) v.forEach(x=>counts[x]=(counts[x]||0)+1);
   else if(v in counts) counts[v]++;
 });
 const c=document.getElementById("chart");
 const ctx=c.getContext("2d");
 ctx.clearRect(0,0,c.width,c.height);
 const vals=Object.values(counts), labels=Object.keys(counts);
 const max=Math.max(1,...vals);
 const w=60,gap=25;
 labels.forEach((lab,i)=>{
   const h=(vals[i]/max)*220;
   const x=40+i*(w+gap), y=250-h;
   ctx.fillStyle="#0f4c81";
   ctx.fillRect(x,y,w,h);
   ctx.fillStyle="#000";
   ctx.fillText(vals[i],x+18,y-5);
   ctx.save();ctx.translate(x,270);ctx.rotate(-0.35);
   ctx.fillText(lab,0,0);ctx.restore();
 });
}
function exportCSV(){
 const ans=JSON.parse(localStorage.getItem("dm_answers")||"[]");
 let rows=["Nome,Data"];
 ans.forEach(a=>rows.push(`"${a.nome}","${a.data}"`));
 const blob=new Blob([rows.join("\n")],{type:"text/csv"});
 const link=document.createElement("a");
 link.href=URL.createObjectURL(blob);
 link.download="participantes.csv";
 link.click();
}
function printReport(){window.print();}
