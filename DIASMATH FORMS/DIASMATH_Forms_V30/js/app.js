
const KEY="dm_v30_forms";
let forms=JSON.parse(localStorage.getItem(KEY)||"[]");
let current={id:null,title:"Novo formulário",description:"",questions:[]};

function saveDB(){localStorage.setItem(KEY,JSON.stringify(forms));}
function newForm(){current={id:crypto.randomUUID?.()||Date.now().toString(),title:"Novo formulário",description:"",questions:[]};render();}
function addQuestion(){current.questions.push({title:"Nova pergunta",type:"Resposta curta"});render();}
function saveForm(){
 current.title=document.getElementById("title").value;
 current.description=document.getElementById("desc").value;
 const i=forms.findIndex(f=>f.id===current.id);
 if(i>=0) forms[i]=structuredClone(current); else forms.push(structuredClone(current));
 saveDB(); renderList(); alert("Formulário salvo.");
}
function openForm(id){current=structuredClone(forms.find(f=>f.id===id));render();}
function duplicate(){
 const c=structuredClone(current);
 c.id=crypto.randomUUID?.()||String(Date.now());
 c.title+=" (Cópia)";
 forms.push(c); saveDB(); renderList();
}
function render(){
 title.value=current.title; desc.value=current.description;
 const ed=document.getElementById("editor"),pv=document.getElementById("preview");
 ed.innerHTML=""; pv.innerHTML="<h2>"+current.title+"</h2><p>"+current.description+"</p>";
 current.questions.forEach((q,n)=>{
  ed.innerHTML+=`<div class=item><input value="${q.title}" oninput="current.questions[${n}].title=this.value;updatePreview()">
  <select onchange="current.questions[${n}].type=this.value;updatePreview()">
  <option>Resposta curta</option><option>Parágrafo</option><option>Múltipla escolha</option></select></div>`;
 });
 updatePreview();
}
function updatePreview(){
 const pv=document.getElementById("preview");
 pv.innerHTML="<h2>"+title.value+"</h2><p>"+desc.value+"</p>";
 current.questions.forEach((q,i)=>pv.innerHTML+=`<div class=item><b>${i+1}. ${q.title}</b><br><small>${q.type}</small></div>`);
}
function renderList(){
 const l=document.getElementById("forms");
 l.innerHTML="";
 forms.forEach(f=>l.innerHTML+=`<div class=item><b>${f.title}</b><button onclick="openForm('${f.id}')">Abrir</button></div>`);
}
window.onload=()=>{renderList();newForm();}
