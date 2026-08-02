
const BK="dm_bank_v25";
const FM="dm_form_v25";
let form=JSON.parse(localStorage.getItem(FM)||'{"title":"Novo formulário","sections":[{"title":"Seção 1","questions":[]}]}');
let bank=JSON.parse(localStorage.getItem(BK)||"[]");

function draw(){
 const sec=form.sections[0];
 document.getElementById("editor").innerHTML="";
 sec.questions.forEach((q,i)=>{
  document.getElementById("editor").innerHTML+=`
  <div class='item'><b>${q.title}</b><br>${q.type}
  <button onclick='saveToBank(${i})'>Salvar no banco</button></div>`;
 });
 let b=document.getElementById("bank");
 b.innerHTML="";
 bank.forEach((q,i)=>{
   b.innerHTML+=`<div class='item'><b>${q.title}</b>
   <button onclick='useBank(${i})'>Usar</button></div>`;
 });
 preview();
}
function add(){
 form.sections[0].questions.push({title:"Nova pergunta",type:"Resposta curta",required:false});
 persist();
}
function saveToBank(i){
 bank.push(JSON.parse(JSON.stringify(form.sections[0].questions[i])));
 localStorage.setItem(BK,JSON.stringify(bank));
 draw();
}
function useBank(i){
 form.sections[0].questions.push(JSON.parse(JSON.stringify(bank[i])));
 persist();
}
function persist(){
 localStorage.setItem(FM,JSON.stringify(form));
 draw();
}
function preview(){
 let p=document.getElementById("preview");
 p.innerHTML="<h3>"+form.title+"</h3>";
 form.sections.forEach(s=>{
   p.innerHTML+="<h4>"+s.title+"</h4>";
   s.questions.forEach((q,n)=>p.innerHTML+=`<div class='item'>${n+1}. ${q.title}</div>`);
 });
}
window.onload=draw;
