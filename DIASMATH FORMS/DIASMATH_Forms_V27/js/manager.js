
const K="dm_v27";
let db=JSON.parse(localStorage.getItem(K)||'{"bank":[],"templates":[]}');

function search(){
 const q=(document.getElementById("q").value||"").toLowerCase();
 const out=document.getElementById("out");
 out.innerHTML="";
 db.bank.filter(x=>(x.title||"").toLowerCase().includes(q)||(x.tags||[]).join(" ").toLowerCase().includes(q))
 .forEach(x=>out.innerHTML+=`<div class=item><b>${x.title}</b><br>${(x.tags||[]).join(", ")}</div>`);
}
function exportBank(){
 const b=new Blob([JSON.stringify(db.bank,null,2)],{type:"application/json"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(b);a.download="banco_questoes.json";a.click();
}
function importBank(f){
 const r=new FileReader();
 r.onload=e=>{db.bank=JSON.parse(e.target.result);save();}
 r.readAsText(f);
}
function saveTemplate(){
 db.templates.push({name:"Modelo "+(db.templates.length+1),created:new Date().toISOString()});
 save();
}
function save(){
 localStorage.setItem(K,JSON.stringify(db));
 render();
}
function render(){
 document.getElementById("templates").innerHTML=db.templates.map(t=>`<div class=item>${t.name}</div>`).join("")||"<i>Nenhum modelo</i>";
 search();
}
window.onload=render;
