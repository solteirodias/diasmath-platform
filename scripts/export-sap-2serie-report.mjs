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
