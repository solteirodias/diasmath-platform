
let perguntas=[];
function render(){
 const l=document.getElementById('lista');
 l.innerHTML='';
 perguntas.forEach((p,i)=>{
   let html=`<div style="border:1px solid #ddd;padding:10px;margin:8px 0">
   <b>${i+1}. ${p.tipo}</b><input value="${p.titulo}" onchange="perguntas[${i}].titulo=this.value">`;
   if(p.tipo==='Múltipla escolha'){
      html+=`<textarea onchange="perguntas[${i}].op=this.value" placeholder="Uma opção por linha">${p.op||''}</textarea>`;
   }
   html+='</div>';
   l.innerHTML+=html;
 });
}
function addTexto(){perguntas.push({tipo:'Resposta curta',titulo:''});render();}
function addLongo(){perguntas.push({tipo:'Parágrafo',titulo:''});render();}
function addOpcao(){perguntas.push({tipo:'Múltipla escolha',titulo:'',op:''});render();}
function salvar(){
 const banco=JSON.parse(localStorage.getItem('forms')||'[]');
 banco.push({titulo:document.getElementById('titulo').value,perguntas});
 localStorage.setItem('forms',JSON.stringify(banco));
 document.getElementById('qtd').textContent=banco.length;
 alert('Protótipo salvo no navegador.');
}
document.getElementById('qtd').textContent=(JSON.parse(localStorage.getItem('forms')||'[]')).length;
