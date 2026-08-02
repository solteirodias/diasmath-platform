
let form={title:"Novo formulário",questions:[]};
function addQ(){form.questions.push({title:"Nova pergunta",type:"Resposta curta"});draw();}
function draw(){
 const e=document.getElementById("editor"),p=document.getElementById("preview");
 e.innerHTML=""; p.innerHTML="<h3>"+form.title+"</h3>";
 form.questions.forEach((q,i)=>{
  const d=document.createElement("div");d.className="q";
  d.innerHTML=`<input value="${q.title}" oninput="form.questions[${i}].title=this.value;draw()">
<select onchange="form.questions[${i}].type=this.value;draw()">
${["Resposta curta","Parágrafo","Múltipla escolha"].map(t=>`<option ${t==q.type?"selected":""}>${t}</option>`).join("")}
</select>
<div class="row">
<button onclick="up(${i})">↑</button>
<button onclick="down(${i})">↓</button>
<button onclick="dup(${i})">Duplicar</button>
<button onclick="del(${i})">Excluir</button>
</div>`;
  e.appendChild(d);
  p.innerHTML+=`<div class="q"><b>${i+1}. ${q.title}</b><br><small>${q.type}</small></div>`;
 });
}
function up(i){if(i){[form.questions[i-1],form.questions[i]]=[form.questions[i],form.questions[i-1]];draw();}}
function down(i){if(i<form.questions.length-1){[form.questions[i+1],form.questions[i]]=[form.questions[i],form.questions[i+1]];draw();}}
function dup(i){form.questions.splice(i+1,0,JSON.parse(JSON.stringify(form.questions[i])));draw();}
function del(i){form.questions.splice(i,1);draw();}
function save(){localStorage.setItem("dm_v24",JSON.stringify(form));alert("Salvo.");}
window.onload=draw;
