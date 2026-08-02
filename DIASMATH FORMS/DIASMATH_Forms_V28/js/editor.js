
let form={questions:[]};
const types=["Resposta curta","Parágrafo","Múltipla escolha","Escala","Data","Hora"];
function add(){
 form.questions.push({title:"Nova pergunta",type:types[0],next:""});
 draw();
}
function draw(){
 let e=document.getElementById("editor"),p=document.getElementById("preview");
 e.innerHTML="";p.innerHTML="";
 form.questions.forEach((q,i)=>{
  e.innerHTML+=`<div class=q>
  <input value="${q.title}" oninput="form.questions[${i}].title=this.value;draw()">
  <select onchange="form.questions[${i}].type=this.value;draw()">
  ${types.map(t=>`<option ${t==q.type?"selected":""}>${t}</option>`).join("")}
  </select>
  <input placeholder="Ir para seção..." value="${q.next}" oninput="form.questions[${i}].next=this.value">
  </div>`;
  p.innerHTML+=`<div class=q><b>${i+1}. ${q.title}</b><br><small>${q.type}</small>${q.next?`<br>➡ ${q.next}`:""}</div>`;
 });
}
window.onload=draw;
