import {readFileSync, writeFileSync, mkdirSync} from "node:fs";
import {gzipSync} from "node:zlib";
const db=JSON.parse(readFileSync("public/escolas/sap-avaliacoes-2026/dados.json","utf8"));
const en=JSON.parse(readFileSync("public/escolas/sap-avaliacoes-2026/enem-dados-2026.json","utf8"));
const schools=new Map();
for(const e of db.schools) schools.set(String(e.inep),e.school);
for(const g of db.groups) for(const e of g.schools||[])if(!schools.has(String(e.inep)))schools.set(String(e.inep),e.school);
for(const g of en.conjuntos)for(const e of g.escolas||[])if(!schools.has(String(e.inep)))schools.set(String(e.inep),e.escola);
const keys=[...schools.keys()].sort();
const index=new Map(keys.map((k,i)=>[k,i]));
const nomes=keys.map(k=>[k,schools.get(k)]);
const S=db.groups.filter(x=>x.instrument==="Simula+"&&String(x.grade).includes("2ª Série")).map(g=>({
sim:g.sequence,serie:g.grade,area:g.discipline,fonte:(g.sources||[]).join(" | "),
alunos:g.students,media:g.mean,total:g.total,
escolas:(g.schools||[]).map(e=>[index.get(String(e.inep)),e.students,e.classes,e.mean,e.total?.pct??null,
 ...(e.skills?.length?[e.skills.map(h=>[h.code,h.items,h.correct,h.expected,h.pct])]:[[]])])
}));
const E=en.conjuntos.filter(g=>g.serie===2).map(g=>({
sim:g.sim,dia:g.dia,grupo:g.grupo,area:g.area||"",fonte:g.fonte,
escolas:g.escolas.map(e=>[index.get(String(e.inep)),e.alunos,e.turmas,e.media,e.faixa])
}));
const full={origem:"SAP DIASMATH 2026; bancos nativos do repositório. Médias e estudantes conforme consolidados originais; não são TRI.",nomes,simula:S,enem:E};
const json=JSON.stringify(full);
mkdirSync("docs",{recursive:true});
writeFileSync("docs/SAP_2_SERIE_EXPORT_2026.b64",gzipSync(Buffer.from(json)).toString("base64"));
console.log("SAP_2_SERIE_EXPORT",{json:json.length,gzip:gzipSync(Buffer.from(json)).length,simula:S.length,enem:E.length,nome:nomes.length});
const activeIds=new Set([...S.flatMap(g=>g.escolas.map(e=>e[0])),...E.flatMap(g=>g.escolas.map(e=>e[0]))]);
const active=[...activeIds].sort((a,b)=>String(nomes[a][1]).localeCompare(String(nomes[b][1]),"pt-BR"));
const newIndex=new Map(active.map((x,i)=>[x,i]));
const tiny={
 nomes:active.map(i=>nomes[i]),
 simula:S.flatMap(g=>g.escolas.map(e=>[newIndex.get(e[0]),g.sim,g.serie.includes("Alternância")?1:0,g.area==="Língua Portuguesa"?1:g.area==="Matemática"?2:g.area==="Ciências da Natureza"?3:4,e[1],e[2],e[3],e[4],g.fonte])),
 enem:E.flatMap(g=>g.escolas.map(e=>[newIndex.get(e[0]),g.sim,g.dia,g.grupo,e[1],e[2],e[3],g.fonte])),
 gruposS:S.map(g=>[g.sim,g.serie,g.area,g.escolas.length,g.alunos,g.media]),
 gruposE:E.map(g=>[g.sim,g.dia,g.grupo,g.area,g.escolas.length])
};
const sm=JSON.stringify(tiny);
writeFileSync("docs/SAP_2_SERIE_RESUMO_2026.b64",gzipSync(Buffer.from(sm)).toString("base64"));
console.log("SAP_2_SERIE_SMALL",{raw:sm.length,encoded:gzipSync(Buffer.from(sm)).toString("base64").length,active:active.length,rows:tiny.simula.length,enemRows:tiny.enem.length});

