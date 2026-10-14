/**
 * Integra o ENEM+ diretamente na barra de abas do SAP legado.
 * Idempotente: executado no pipeline GitHub Actions sem afetar os dados existentes.
 */
import { readFileSync, writeFileSync } from "node:fs";

const arquivo = "public/escolas/sap-avaliacoes-2026/index.html";
let html = readFileSync(arquivo, "utf8");
const tab='<button class="tab" data-tab="enem">ENEM+</button>';
if (html.includes(tab)) {
  const expected=['id="enemRoot"',"enem-native.js","enem-native.css","window.SAP_ENEM.render(session)"];
  for(const e of expected) if(!html.includes(e)) throw new Error("Integração incompleta: "+e);
  console.log("SAP ENEM+ já integrado. Nenhuma alteração necessária.");
  process.exit(0);
}
function replaceOnce(before,after) {
  const num=html.split(before).length-1;
  if(num!==1) throw new Error("Não é seguro aplicar alteração no HTML: trecho encontrado "+num+" vezes: "+before.slice(0,85));
  html=html.replace(before,after);
}
replaceOnce("</head>",'<link rel="stylesheet" href="/escolas/sap-avaliacoes-2026/enem-native.css">\n</head>');
replaceOnce('<button class="tab" data-tab="simula">Simula+</button><button class="tab" data-tab="saepi">SAEPI</button>',
  '<button class="tab" data-tab="simula">Simula+</button>'+tab+'<button class="tab" data-tab="saepi">SAEPI</button>');
replaceOnce('<section id="simula" class="panel"></section><section id="saepi" class="panel"></section>',
 '<section id="simula" class="panel"></section><section id="enem" class="panel"><div id="enemRoot"></div></section><section id="saepi" class="panel"></section>');
const antigo="function setTab(tab){state.tab=tab;if(tab==='diagnostic')state.instrument='Avaliação Diagnóstica';if(tab==='minitests')state.instrument='Minitestes';if(tab==='simula')state.instrument='Simula+';document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===tab));populateFilters();renderAll();window.scrollTo({top:0,behavior:'smooth'})}";
const novo="function setTab(tab){state.tab=tab;if(tab==='diagnostic')state.instrument='Avaliação Diagnóstica';if(tab==='minitests')state.instrument='Minitestes';if(tab==='simula')state.instrument='Simula+';document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===tab));populateFilters();renderAll();const enemAtivo=tab==='enem';['filters','statusline','m6CoverageNotice'].forEach(id=>{const el=$(id);if(el)el.style.display=enemAtivo?'none':'';});if(enemAtivo&&window.SAP_ENEM)window.SAP_ENEM.render(session);window.scrollTo({top:0,behavior:'smooth'})}";
replaceOnce(antigo,novo);
replaceOnce("  bindTabs();\n  populateFilters();\n  renderAll();\n}",
 "  bindTabs();\n  populateFilters();\n  renderAll();\n  if(new URLSearchParams(location.search).get('aba')==='enem')setTab('enem');\n}");
html=html.replaceAll("O Simulado ENEM+ não integra o sistema.",
 "O ENEM+ possui uma aba própria para consulta dos resultados e da evolução entre os simulados.");
replaceOnce("</body>",'<script src="/escolas/sap-avaliacoes-2026/enem-native.js"></script>\n</body>');
const rechecks=[tab,'id="enemRoot"',"enem-native.js","enem-native.css","window.SAP_ENEM.render(session)"];
for(const e of rechecks) if(!html.includes(e)) throw new Error("Falha de validação final: "+e);
writeFileSync(arquivo,html,"utf8");
console.log("SAP ENEM+ integrado ao HTML original. Tamanho:",Buffer.byteLength(html,"utf8"));
