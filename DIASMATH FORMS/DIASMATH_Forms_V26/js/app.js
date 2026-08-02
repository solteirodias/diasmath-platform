
const DBKEY="dm_v26";
let db=JSON.parse(localStorage.getItem(DBKEY)||'{"sections":[{"title":"Seção 1","questions":[]}],"bank":[]}');
let current=0;

function save(){localStorage.setItem(DBKEY,JSON.stringify(db));render();}
function addSection(){db.sections.push({title:"Seção "+(db.sections.length+1),questions:[]});save();}
function addQuestion(){db.sections[current].questions.push({title:"Nova pergunta",type:"Resposta curta",tags:[]});save();}
function render(){
 let s=document.getElementById("sections"),e=document.getElementById("editor"),p=document.getElementById("preview");
 s.innerHTML=""; e.innerHTML=""; p.innerHTML="";
 db.sections.forEach((sec,i)=>{
   s.innerHTML+=`<div class=item><b>${sec.title}</b><button onclick="current=${i};render()">Abrir</button></div>`;
 });
 db.sections[current].questions.forEach((q,i)=>{
   e.innerHTML+=`<div class=item>
   <input value="${q.title}" oninput="db.sections[current].questions[${i}].title=this.value">
   <select onchange="db.sections[current].questions[${i}].type=this.value">
   <option ${q.type=="Resposta curta"?"selected":""}>Resposta curta</option>
   <option ${q.type=="Parágrafo"?"selected":""}>Parágrafo</option>
   <option ${q.type=="Múltipla escolha"?"selected":""}>Múltipla escolha</option>
   </select>
   <button onclick="db.bank.push(JSON.parse(JSON.stringify(db.sections[current].questions[${i}])));save()">Salvar no banco</button>
   </div>`;
 });
 p.innerHTML="<h3>Prévia</h3>";
 db.sections.forEach(sec=>{
   p.innerHTML+=`<h4>${sec.title}</h4>`;
   sec.questions.forEach(q=>p.innerHTML+=`<div class=item>${q.title}<br><small>${q.type}</small></div>`);
 });
}
window.onload=render;
