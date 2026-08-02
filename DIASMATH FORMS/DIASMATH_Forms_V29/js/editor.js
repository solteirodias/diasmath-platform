
const types=["Resposta curta","Parágrafo","Múltipla escolha","Grade","Upload (estrutura)"];
let form={questions:[]};
function add(){form.questions.push({title:"Nova pergunta",type:types[0]});render();}
function render(){
 let e=document.getElementById("ed"),p=document.getElementById("pv");
 e.innerHTML="";p.innerHTML="";
 form.questions.forEach((q,i)=>{
   e.innerHTML+=`<div class=q><input value="${q.title}" oninput="form.questions[${i}].title=this.value;render()">
<select onchange="form.questions[${i}].type=this.value;render()">
${types.map(t=>`<option ${t==q.type?"selected":""}>${t}</option>`).join("")}
</select></div>`;
   p.innerHTML+=`<div class=q><b>${q.title}</b><br>${q.type}</div>`;
 });
}
function theme(v){
 document.documentElement.style.setProperty('--primary',v);
 document.querySelector('header').style.background=v;
 document.querySelectorAll('button').forEach(b=>b.style.background=v);
}
window.onload=render;
