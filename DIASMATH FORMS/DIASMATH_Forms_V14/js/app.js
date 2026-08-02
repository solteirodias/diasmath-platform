
function loadForm(){
 const q=JSON.parse(localStorage.getItem("dm_form")||"[]");
 const c=document.getElementById("questions");
 c.innerHTML="";
 q.forEach((it,i)=>{
   let h=`<div><b>${it.title}</b><br>`;
   switch(it.type){
    case "Resposta curta": h+="<input id='q"+i+"'>";break;
    case "Parágrafo": h+="<textarea id='q"+i+"'></textarea>";break;
    case "Múltipla escolha":
      it.options.forEach((o,j)=>h+=`<label><input type='radio' name='q${i}' value='${o}'> ${o}</label><br>`);
      break;
    case "Caixas de seleção":
      it.options.forEach((o,j)=>h+=`<label><input type='checkbox' name='q${i}' value='${o}'> ${o}</label><br>`);
      break;
    case "Lista suspensa":
      h+="<select id='q"+i+"'>"+it.options.map(o=>"<option>"+o+"</option>").join("")+"</select>";
   }
   h+="</div><hr>";
   c.innerHTML+=h;
 });
}
function submitForm(){
 const q=JSON.parse(localStorage.getItem("dm_form")||"[]");
 let resp={nome:document.getElementById("nome").value,data:new Date().toISOString(),answers:[]};
 q.forEach((it,i)=>{
   let val="";
   if(it.type==="Resposta curta"||it.type==="Parágrafo"||it.type==="Lista suspensa"){
      val=document.getElementById("q"+i)?.value||"";
   }else if(it.type==="Múltipla escolha"){
      let r=document.querySelector("input[name='q"+i+"']:checked"); val=r?r.value:"";
   }else{
      val=[...document.querySelectorAll("input[name='q"+i+"']:checked")].map(x=>x.value);
   }
   resp.answers.push({question:it.title,value:val});
 });
 let all=JSON.parse(localStorage.getItem("dm_answers")||"[]");
 all.push(resp);
 localStorage.setItem("dm_answers",JSON.stringify(all));
 alert("Resposta enviada.");
 location.reload();
}
function loadAnswers(){
 const area=document.getElementById("answers");
 if(!area)return;
 let all=JSON.parse(localStorage.getItem("dm_answers")||"[]");
 area.innerHTML="<h3>Total: "+all.length+"</h3>";
 all.forEach((r,n)=>{
   area.innerHTML+=`<div><b>${r.nome}</b><br>${r.data}<ul>`+
   r.answers.map(a=>`<li><b>${a.question}</b>: ${Array.isArray(a.value)?a.value.join(", "):a.value}</li>`).join("")+
   "</ul></div><hr>";
 });
}
