
const TYPES=["Resposta curta","Parágrafo","Múltipla escolha","Escala","Data","Hora","Grade"];
let form={title:"Novo formulário",description:"",questions:[]};

function addQuestion(){
 form.questions.push({title:"Nova pergunta",type:TYPES[0],required:false,options:["Opção 1","Opção 2"]});
 render();
}
function duplicateQuestion(i){
 form.questions.splice(i+1,0,JSON.parse(JSON.stringify(form.questions[i])));
 render();
}
function deleteQuestion(i){
 form.questions.splice(i,1); render();
}
function render(){
 const ed=document.getElementById("editor");
 const pv=document.getElementById("preview");
 ed.innerHTML="";
 pv.innerHTML=`<h2>${form.title}</h2><p>${form.description}</p>`;
 form.questions.forEach((q,i)=>{
   ed.innerHTML+=`
   <div class="item">
   <input value="${q.title}" oninput="form.questions[${i}].title=this.value;render()">
   <select onchange="form.questions[${i}].type=this.value;render()">
     ${TYPES.map(t=>`<option ${t===q.type?"selected":""}>${t}</option>`).join("")}
   </select>
   <label><input type="checkbox" ${q.required?"checked":""}
   onchange="form.questions[${i}].required=this.checked"> Obrigatória</label>
   <button onclick="duplicateQuestion(${i})">Duplicar</button>
   <button onclick="deleteQuestion(${i})">Excluir</button>
   </div>`;
   pv.innerHTML+=`<div class="item"><b>${i+1}. ${q.title}</b><br>${q.type}${q.required?" • Obrigatória":""}</div>`;
 });
}
function saveProject(){
 localStorage.setItem("dm_v31_project",JSON.stringify(form));
 alert("Projeto salvo localmente.");
}
window.onload=render;
