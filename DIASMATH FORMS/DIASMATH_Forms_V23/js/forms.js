
const KEY="dm_forms_v23";
let forms=JSON.parse(localStorage.getItem(KEY)||"[]");
let current={title:"Novo formulário",description:"",questions:[]};

function saveCurrent(){
 const idx=forms.findIndex(f=>f.id===current.id);
 if(!current.id) current.id=Date.now().toString();
 if(idx>=0) forms[idx]=current; else forms.push(current);
 localStorage.setItem(KEY,JSON.stringify(forms));
 renderList();
 alert("Formulário salvo.");
}
function newForm(){current={id:null,title:"Novo formulário",description:"",questions:[]};bind();}
function duplicate(){
 const copy=JSON.parse(JSON.stringify(current));
 copy.id=null;copy.title+=" (Cópia)";
 current=copy;bind();
}
function addQuestion(){
 current.questions.push({title:"Nova pergunta",type:"Resposta curta"});
 bind();
}
function bind(){
 document.getElementById("title").value=current.title;
 document.getElementById("desc").value=current.description;
 preview();
}
function preview(){
 current.title=document.getElementById("title").value;
 current.description=document.getElementById("desc").value;
 const p=document.getElementById("preview");
 p.innerHTML="<h3>"+current.title+"</h3><p>"+current.description+"</p>";
 current.questions.forEach((q,i)=>{
   p.innerHTML+=`<div class='item'><b>${i+1}. ${q.title}</b><br><small>${q.type}</small></div>`;
 });
}
function renderList(){
 const l=document.getElementById("list");
 if(!l)return;
 l.innerHTML="";
 forms.forEach(f=>{
   const d=document.createElement("div");
   d.className="item";
   d.innerHTML="<b>"+f.title+"</b><br><button>Abrir</button>";
   d.querySelector("button").onclick=()=>{current=f;bind();};
   l.appendChild(d);
 });
}
window.onload=()=>{renderList();bind();}
