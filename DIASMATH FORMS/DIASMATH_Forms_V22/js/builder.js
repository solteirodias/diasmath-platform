
const state={questions:[]};

function addQuestion(type){
 state.questions.push({
   id:Date.now()+Math.random(),
   type:type,
   title:"Nova pergunta",
   required:false,
   options:["Opção 1","Opção 2"]
 });
 render();
}

function render(){
 const root=document.getElementById("editor");
 if(!root)return;
 root.innerHTML="";
 state.questions.forEach((q,i)=>{
   const div=document.createElement("div");
   div.className="question";
   div.innerHTML=`
   <input value="${q.title}" oninput="state.questions[${i}].title=this.value">
   <select onchange="state.questions[${i}].type=this.value;render()">
   ${["Resposta curta","Parágrafo","Múltipla escolha"].map(t=>`<option ${t==q.type?"selected":""}>${t}</option>`).join("")}
   </select>
   <label><input type="checkbox" ${q.required?"checked":""}
   onchange="state.questions[${i}].required=this.checked"> Obrigatória</label>
   <button onclick="removeQuestion(${i})">Excluir</button>`;
   root.appendChild(div);
 });
}

function removeQuestion(i){state.questions.splice(i,1);render();}

function exportJSON(){
 const blob=new Blob([JSON.stringify(state.questions,null,2)],{type:"application/json"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="formulario.json";
 a.click();
}

function importJSON(file){
 const reader=new FileReader();
 reader.onload=e=>{
   state.questions=JSON.parse(e.target.result);
   render();
 };
 reader.readAsText(file);
}
