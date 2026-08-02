
let questions=[];
function add(type){
 const q={type,title:"Nova pergunta",options:["Opção 1","Opção 2"]};
 questions.push(q);render();
}
function render(){
 const area=document.getElementById("editor");
 area.innerHTML="";
 questions.forEach((q,i)=>{
   let h=`<div class='question'>
   <label>Pergunta</label>
   <input value="${q.title}" oninput="questions[${i}].title=this.value">
   <label>Tipo</label>
   <select onchange="questions[${i}].type=this.value;render()">
     ${["Resposta curta","Parágrafo","Múltipla escolha","Caixas de seleção","Lista suspensa"].map(t=>`<option ${t==q.type?"selected":""}>${t}</option>`).join("")}
   </select>`;
   if(q.type==="Múltipla escolha"||q.type==="Caixas de seleção"||q.type==="Lista suspensa"){
      h+=`<label>Opções (uma por linha)</label>
      <textarea oninput="questions[${i}].options=this.value.split('\n')">${q.options.join("\n")}</textarea>`;
   }
   h+=`<button onclick="up(${i})">↑</button>
   <button onclick="down(${i})">↓</button>
   <button onclick="dup(${i})">Duplicar</button>
   <button onclick="del(${i})">Excluir</button></div>`;
   area.innerHTML+=h;
 });
 preview();
}
function up(i){if(i){[questions[i-1],questions[i]]=[questions[i],questions[i-1]];render();}}
function down(i){if(i<questions.length-1){[questions[i+1],questions[i]]=[questions[i],questions[i+1]];render();}}
function dup(i){questions.splice(i+1,0,JSON.parse(JSON.stringify(questions[i])));render();}
function del(i){questions.splice(i,1);render();}
function preview(){
 const p=document.getElementById("preview");
 p.innerHTML="";
 questions.forEach(q=>{
   let html=`<p><b>${q.title}</b></p>`;
   switch(q.type){
    case "Resposta curta": html+="<input placeholder='Resposta'>"; break;
    case "Parágrafo": html+="<textarea></textarea>"; break;
    case "Múltipla escolha":
      html+=q.options.map(o=>`<label><input type='radio'> ${o}</label><br>`).join("");break;
    case "Caixas de seleção":
      html+=q.options.map(o=>`<label><input type='checkbox'> ${o}</label><br>`).join("");break;
    case "Lista suspensa":
      html+="<select>"+q.options.map(o=>`<option>${o}</option>`).join("")+"</select>";break;
   }
   p.innerHTML+=html+"<hr>";
 });
}
function save(){
 localStorage.setItem("dm_form",JSON.stringify(questions));
 alert("Formulário salvo localmente.");
}
