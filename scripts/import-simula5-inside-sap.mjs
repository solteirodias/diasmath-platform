/**
 * Importa o 5º Simula+ da 2ª série no banco nativo do SAP.
 * Idempotente, preserva as demais aplicações e a autenticação por INEP.
 * Foco: avaliações regular e Modelo 03 (Alternância) em grupos distintos.
 */
import { readFileSync, writeFileSync } from "node:fs";
const root="public/escolas/sap-avaliacoes-2026/";
const fonte=JSON.parse(readFileSync(root+"simula5-2026.json","utf8"));
const db=JSON.parse(readFileSync(root+"dados.json","utf8"));
if(!Array.isArray(db.groups)||!Array.isArray(db.schools))throw Error("Banco SAP sem groups/schools");
if(!Array.isArray(fonte.aplicacoes)||fonte.aplicacoes.length!==4)throw Error("Esperadas quatro aplicações em Simula 5");
const nomes=new Map(db.schools.map(s=>[String(s.inep),s.school]));
for(const g of db.groups)for(const s of (g.schools||[]))if(!nomes.has(String(s.inep)))nomes.set(String(s.inep),s.school);
const descricoes=new Map();
for(const g of db.groups.filter(g=>g.instrument==="Simula+"))for(const h of (g.skills||[])){
 const k=g.discipline+"::"+h.code;
 if(h.description&&!descricoes.has(k))descricoes.set(k,h.description);
}
let adicionados=0,substituidos=0;
const ids=[];
for(const c of fonte.aplicacoes){
 if(c.serie!=="2ª Série"||c.simulado!==5)throw Error("Aplicação fora do escopo");
 const alternancia=c.modalidade==="alternancia_modelo03";
 const serie=alternancia?"2ª Série — Alternância (Modelo 03)":c.serie;
 const id="Simula+|5|"+serie+"|"+c.disciplina;
 const escolas=c.escolas.map(e=>{
  const school=nomes.get(String(e.inep));
  if(!school)throw Error("INEP desconhecido: "+e.inep);
  const habilidades=e.habilidades.map(h=>({
   code:h.codigo,description:descricoes.get(c.disciplina+"::"+h.codigo)||"",
   items:h.itens,correct:h.acertos,expected:h.esperado,pct:h.percentual
  }));
  const acertos=habilidades.reduce((a,h)=>a+h.correct,0);
  const esperado=habilidades.reduce((a,h)=>a+h.expected,0);
  return {gre:"08ª GRE - OEIRAS",inep:String(e.inep),school,
   classes:e.turmas,students:e.alunos,mean:e.media,skills:habilidades,
   total:{correct:acertos,expected:esperado,pct:esperado?Math.round(acertos/esperado*100):null}};
 });
 const habilidades=c.descritores.map(h=>{
  const acertos=escolas.reduce((a,e)=>a+(e.skills.find(s=>s.code===h.codigo)?.correct||0),0);
  const esperado=escolas.reduce((a,e)=>a+(e.skills.find(s=>s.code===h.codigo)?.expected||0),0);
  return {code:h.codigo,description:descricoes.get(c.disciplina+"::"+h.codigo)||"",
   items:h.itens,correct:acertos,expected:esperado,pct:esperado?Math.round(acertos/esperado*100):null};
 });
 const estudantes=escolas.reduce((a,e)=>a+e.students,0);
 const media=estudantes?Math.round(escolas.reduce((a,e)=>a+e.mean*e.students,0)/estudantes*100)/100:null;
 const acertos=habilidades.reduce((a,h)=>a+h.correct,0);
 const esperado=habilidades.reduce((a,h)=>a+h.expected,0);
 const grupo={instrument:"Simula+",sequence:5,grade:serie,discipline:c.disciplina,
  sources:[c.origem],id,schools:escolas,skills:habilidades,
  total:{correct:acertos,expected:esperado,pct:esperado?Math.round(acertos/esperado*100):null},
  mean:media,students:estudantes,model:alternancia?"Modelo 03 — Alternância":"Regular",
  coverage_note:"Os percentuais por descritor refletem apenas as sete colunas de habilidades informadas no quadro por escola. A média da prova é a média informada pela SEDUC-PI."};
 const index=db.groups.findIndex(g=>g.id===id);
 if(index>=0){db.groups[index]=grupo;substituidos++;}else{db.groups.push(grupo);adicionados++;}
 ids.push(id);
}
db.version="SAP Avaliações 2026 — V17 Simula+ 5ª aplicação 2ª série";
db.fix_51_simula5={date:"2026-11-17",
 description:"Resultados do 5º Simula+ da 2ª série em LP e Matemática: Regular e Modelo 03 (Alternância) em grupos separados.",
 groups:ids,coverage:"Quadros por escola detalham sete descritores por disciplina; médias escolares são as informadas nos PDFs originais."};
writeFileSync(root+"dados.json",JSON.stringify(db),"utf8");
console.log("SAP_SIMULA5_RESULT",JSON.stringify({adicionados,substituidos,ids,groups:db.groups.length,
 estudantes:fonte.aplicacoes.map(a=>[a.disciplina,a.modalidade,a.escolas.length])}));
