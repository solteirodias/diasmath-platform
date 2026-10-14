/* DIASMATH SAP — ENEM+ integrado à navegação nativa do SAP */
(function(){
"use strict";
const BASE="/escolas/sap-avaliacoes-2026/enem-dados-2026.json";
let dados=null, carregamento=null, ultimaSessao=null;
const escolha={sim:1,serie:3,dia:1,municipio:"Todos",escola:"Todos",busca:""};
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const numero=x=>Number(x||0).toLocaleString("pt-BR");
const nota=x=>x==null?"—":Number(x).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=x=>x==null?"—":Number(x).toLocaleString("pt-BR",{maximumFractionDigits:1})+"%";
const neutro=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const ehCidade=x=>Boolean(x)&&!/^\d{5,}$/.test(String(x));
const unico=arr=>[...new Set(arr)].sort((a,b)=>typeof a==="number"?a-b:String(a).localeCompare(String(b),"pt-BR"));
function opcoes(arr,atual,fmt=x=>x){return arr.map(x=>'<option value="'+esc(x)+'"'+(String(x)===String(atual)?" selected":"")+'>'+esc(fmt(x))+'</option>').join("");}
function carga(){
 if(dados)return Promise.resolve(dados);
 if(!carregamento)carregamento=fetch(BASE).then(r=>{if(!r.ok)throw Error("Falha HTTP "+r.status);return r.json()}).then(json=>{
  if(!Array.isArray(json.conjuntos))throw Error("A base ENEM+ está em um formato inesperado");
  dados=json;return json;
 }).catch(e=>{carregamento=null;throw e;});
 return carregamento;
}
function fontes(){
 const todas=dados?.conjuntos||[];
 if(ultimaSessao?.role!=="school")return todas;
 const inep=String(ultimaSessao.inep||"");
 return todas.map(f=>({...f,escolas:f.escolas.filter(e=>String(e.inep)===inep)}));
}
function juntar(sources,sim,serie,dia){
 const escolas=new Map();
 for(const arquivo of sources.filter(f=>f.sim===sim&&f.serie===serie&&f.dia===dia)){
  for(const row of arquivo.escolas){
   const id=String(row.inep||row.escola);
   if(!escolas.has(id)){
    escolas.set(id,{inep:id,escola:row.escola,municipio:row.municipio,alunos:0,turmas:0,online:0,impresso:0,
     soma:0,nmedias:0,faixas:new Set(),skills:new Map()});
   }
   const item=escolas.get(id);
   item.alunos=Math.max(item.alunos,Number(row.alunos)||0);
   item.turmas=Math.max(item.turmas,Number(row.turmas)||0);
   item.online=Math.max(item.online,Number(row.online)||0);
   item.impresso=Math.max(item.impresso,Number(row.impresso)||0);
   if(!ehCidade(item.municipio)&&ehCidade(row.municipio))item.municipio=row.municipio;
   if(row.media!=null&&!Number.isNaN(Number(row.media))){item.soma+=Number(row.media);item.nmedias++;}
   if(row.faixa)item.faixas.add(row.faixa);
   for(const h of row.habilidades||[]){
    if(h.percentual==null)continue;
    const k=String(h.habilidade).trim();
    let info=item.skills.get(k);
    if(!info){info={soma:0,n:0};item.skills.set(k,info);}
    info.soma+=Number(h.percentual);info.n++;
   }
  }
 }
 return [...escolas.values()].map(e=>({
  ...e,media:e.nmedias?e.soma/e.nmedias:null,faixa:e.faixas.size===1?[...e.faixas][0]:"Variável",
  habilidades:[...e.skills.entries()].map(([habilidade,i])=>({habilidade,percentual:i.soma/i.n}))
 })).sort((a,b)=>a.escola.localeCompare(b.escola,"pt-BR"));
}
function ponderada(rows){
 const validos=rows.filter(x=>x.media!=null&&x.alunos>0);
 const peso=validos.reduce((a,x)=>a+x.alunos,0);
 return peso?validos.reduce((a,x)=>a+x.media*x.alunos,0)/peso:null;
}
function totaisHabilidades(rows){
 const habilidades=new Map();
 for(const row of rows)for(const h of row.habilidades){
  let item=habilidades.get(h.habilidade);
  if(!item){item={habilidade:h.habilidade,soma:0,peso:0,escolas:0};habilidades.set(h.habilidade,item);}
  const peso=Math.max(0,row.alunos);
  item.soma+=h.percentual*peso;item.peso+=peso;item.escolas++;
 }
 return [...habilidades.values()].filter(h=>h.peso).map(h=>({...h,percentual:h.soma/h.peso}))
  .sort((a,b)=>a.percentual-b.percentual);
}
function escolaPermitida(inep){return ultimaSessao?.role!=="school" || String(inep)===String(ultimaSessao?.inep||"");}
function atualizaFiltros(){
 const todos=fontes();
 const simulados=unico(todos.map(x=>x.sim));
 if(!simulados.includes(escolha.sim))escolha.sim=simulados[0]||1;
 const series=unico(todos.filter(x=>x.sim===escolha.sim).map(x=>x.serie));
 if(!series.includes(escolha.serie))escolha.serie=series[0]||3;
 const dias=unico(todos.filter(x=>x.sim===escolha.sim&&x.serie===escolha.serie).map(x=>x.dia));
 if(!dias.includes(escolha.dia))escolha.dia=dias[0]||1;
 const orig=juntar(todos,escolha.sim,escolha.serie,escolha.dia);
 const municipios=unico(orig.filter(e=>ehCidade(e.municipio)).map(e=>e.municipio));
 if(escolha.municipio!=="Todos"&&!municipios.includes(escolha.municipio))escolha.municipio="Todos";
 const escolas=orig.filter(e=>escolha.municipio==="Todos"||e.municipio===escolha.municipio);
 if(escolha.escola!=="Todos"&&!escolas.some(e=>e.inep===escolha.escola))escolha.escola="Todos";
 if(ultimaSessao?.role==="school")escolha.escola=String(ultimaSessao.inep||"");
 return {todos,simulados,series,dias,orig,municipios,escolas};
}
function filtradas(lista){
 const query=neutro(escolha.busca.trim());
 return lista.filter(e=>(escolha.escola==="Todos"||e.inep===escolha.escola)&&
  (!query||neutro(e.escola+" "+e.inep+" "+e.municipio).includes(query)));
}
function barra(nome,val,max,percentual){
 const w=max>0?Math.max(0,Math.min(100,val/max*100)):0;
 return '<div class="enem-bar"><div class="enem-bar-label"><span title="'+esc(nome)+'">'+esc(nome)+'</span><b>'+(percentual?pct(val):nota(val))+'</b></div>'+
  '<div class="enem-track"><span style="width:'+w+'%;background:'+(percentual&&val<40?"#df7a32":"#078f82")+'"></span></div></div>';
}
function evolucao(sources,sel){
 const simulados=unico(sources.filter(x=>x.serie===escolha.serie&&x.dia===escolha.dia).map(x=>x.sim));
 const rodadas=simulados.map(sim=>({sim,rows:juntar(sources,sim,escolha.serie,escolha.dia)}));
 let inepsComuns=[];
 if(rodadas.length){
  inepsComuns=rodadas[0].rows.map(r=>r.inep).filter(id=>rodadas.every(rd=>rd.rows.some(r=>r.inep===id)));
 }
 const porCidade=rows=>rows.filter(e=>escolha.municipio==="Todos"||e.municipio===escolha.municipio);
 const pontos=rodadas.map(({sim,rows})=>{
  let vals=porCidade(rows);
  if(sel!=="Todos")vals=vals.filter(e=>e.inep===sel);
  else vals=vals.filter(e=>inepsComuns.includes(e.inep));
  return {sim,media:ponderada(vals),escolas:vals.length};
 });
 const validos=pontos.filter(p=>p.media!=null);
 const delta=validos.length>=2?validos[validos.length-1].media-validos[0].media:null;
 const plotX=i=>pontos.length===1?420:75+i*(690/(pontos.length-1));
 const plotY=v=>236-Math.max(0,Math.min(10,v))*19;
 let svg='<svg viewBox="0 0 850 300" role="img" aria-label="Evolução das médias por simulado">';
 for(const tick of [0,2,4,6,8,10])svg+='<line x1="75" y1="'+plotY(tick)+'" x2="775" y2="'+plotY(tick)+'" stroke="#dbe8e4"/><text x="54" y="'+(plotY(tick)+4)+'" fill="#647b78" text-anchor="end" font-size="13">'+tick+'</text>';
 for(let i=1;i<pontos.length;i++){
  const a=pontos[i-1],b=pontos[i];
  if(a.media!=null&&b.media!=null)svg+='<line x1="'+plotX(i-1)+'" x2="'+plotX(i)+'" y1="'+plotY(a.media)+'" y2="'+plotY(b.media)+'" stroke="#078f82" stroke-width="4" stroke-linecap="round"/>';
 }
 pontos.forEach((p,i)=>{
  const x=plotX(i);
  svg+='<text x="'+x+'" y="274" text-anchor="middle" fill="#456360" font-size="15" font-weight="700">'+p.sim+'º simulado</text>';
  if(p.media!=null)svg+='<circle cx="'+x+'" cy="'+plotY(p.media)+'" r="8" stroke="white" stroke-width="3" fill="#078f82"/><text x="'+x+'" y="'+(plotY(p.media)-17)+'" text-anchor="middle" fill="#075e59" font-size="16" font-weight="800">'+nota(p.media)+'</text>';
 });
 svg+='</svg>';
 return '<div class="enem-card enem-chart-card"><div class="enem-section-title"><div><h3>Evolução por simulado</h3><p>'+escolha.serie+'ª série · '+escolha.dia+'º dia · '+(sel==="Todos"?"mesmas escolas nas aplicações":"escola selecionada")+'</p></div>'+
  '<div class="enem-delta '+(delta==null?"":delta<0?"enem-neg":"enem-pos")+'">'+(delta==null?"—":(delta>0?"+":"")+nota(delta))+' <small>pontos</small></div></div>'+
  (validos.length?'<div class="enem-svg">'+svg+'</div>':'<div class="enem-empty">Não há resultados comparáveis nos simulados disponíveis para este recorte.</div>')+
  '<div class="enem-mini-table"><table><thead><tr><th>Aplicação</th><th>Média</th><th>Escolas analisadas</th></tr></thead><tbody>'+
  pontos.map(p=>'<tr><td>'+p.sim+'º simulado</td><td>'+nota(p.media)+'</td><td>'+numero(p.escolas)+'</td></tr>').join("")+
  '</tbody></table></div><p class="enem-note">No comparativo regional entram apenas escolas presentes em todos os simulados exibidos. Quando existem diferentes boletins para a mesma escola e aplicação, usa-se a média aritmética das médias das fontes. O indicador não equivale à nota TRI do ENEM.</p></div>';
}
function renderPainel(){
 const raiz=$("enemRoot");if(!raiz||!dados)return;
 const r=atualizaFiltros();
 const linhas=filtradas(r.escolas);
 const total=linhas.reduce((a,e)=>a+e.alunos,0);
 const habilidades=totaisHabilidades(linhas);
 const media=ponderada(linhas);
 const selecionado=escolha.escola;
 const permitirTodas=ultimaSessao?.role!=="school";
 const ordem=[...linhas].sort((a,b)=>(b.media??-Infinity)-(a.media??-Infinity));
 raiz.innerHTML='<div class="enem-hero"><span class="enem-kicker">DIASMATH • SAP 2026</span><h2>ENEM+ | Análise pedagógica</h2><p>Resultados dos simulados, desempenho por escola e evolução entre as aplicações.</p></div>'+
 '<div class="enem-filtros"><div class="enem-field"><label for="enemSim">Simulado</label><select id="enemSim">'+opcoes(r.simulados,escolha.sim,x=>x+"º simulado")+'</select></div>'+
 '<div class="enem-field"><label for="enemSerie">Série</label><select id="enemSerie">'+opcoes(r.series,escolha.serie,x=>x+"ª série")+'</select></div>'+
 '<div class="enem-field"><label for="enemDia">Dia de prova</label><select id="enemDia">'+opcoes(r.dias,escolha.dia,x=>x+"º dia")+'</select></div>'+
 (permitirTodas?'<div class="enem-field"><label for="enemMunicipio">Município</label><select id="enemMunicipio">'+opcoes(["Todos",...r.municipios],escolha.municipio)+'</select></div>'+
 '<div class="enem-field"><label for="enemEscola">Escola</label><select id="enemEscola">'+opcoes(["Todos",...r.escolas.map(e=>e.inep)],selecionado,id=>id==="Todos"?"Todas as escolas":(r.escolas.find(e=>e.inep===id)?.escola||id))+'</select></div>':'')+
 '<div class="enem-field"><label for="enemBusca">Buscar</label><input type="search" id="enemBusca" placeholder="Nome ou INEP" value="'+esc(escolha.busca)+'"></div>'+
 '<button id="enemExportar" class="enem-export" type="button">↓ Exportar CSV</button></div>'+
 '<div class="enem-kpis">'+
 '<div class="enem-kpi"><span>Média das escolas</span><strong>'+nota(media)+'</strong><small>Média ponderada por alunos</small></div>'+
 '<div class="enem-kpi"><span>Alunos registrados</span><strong>'+numero(total)+'</strong><small>Sem repetir escolas por boletim</small></div>'+
 '<div class="enem-kpi"><span>Escolas</span><strong>'+numero(linhas.length)+'</strong><small>Recorte selecionado</small></div>'+
 '<div class="enem-kpi"><span>Habilidades</span><strong>'+numero(habilidades.length)+'</strong><small>Quando informadas na fonte</small></div></div>'+
 evolucao(r.todos,selecionado)+
 '<div class="enem-grid2">'+
 '<div class="enem-card"><h3>Desempenho das escolas</h3><p class="enem-note">Maiores médias do simulado selecionado</p>'+
 (ordem.length?ordem.slice(0,10).map(e=>barra(e.escola,e.media??0,10,false)).join(""):'<p class="enem-empty">Nenhuma escola encontrada.</p>')+'</div>'+
 '<div class="enem-card"><h3>Habilidades prioritárias</h3><p class="enem-note">Menores percentuais de acertos disponíveis</p>'+
 (habilidades.length?habilidades.slice(0,10).map(h=>barra(h.habilidade,h.percentual,100,true)).join(""):'<p class="enem-empty">Os arquivos selecionados não apresentam percentuais por habilidade.</p>')+'</div></div>'+
 '<div class="enem-card"><div class="enem-section-title"><div><h3>Resultados por escola</h3><p>Clique em uma escola para acompanhar sua evolução.</p></div><span class="enem-count">'+numero(linhas.length)+' escolas</span></div>'+
 '<div class="enem-table-wrap"><table class="enem-table"><thead><tr><th>Escola / INEP</th><th>Município</th><th>Alunos</th><th>Turmas</th><th>Média</th><th>Faixa</th></tr></thead><tbody>'+
 ordem.map(e=>'<tr data-inep="'+esc(e.inep)+'" class="enem-school-row"><td><strong>'+esc(e.escola)+'</strong><small>'+esc(e.inep)+'</small></td><td>'+esc(e.municipio)+'</td><td>'+numero(e.alunos)+'</td><td>'+numero(e.turmas)+'</td><td><strong>'+nota(e.media)+'</strong></td><td>'+esc(e.faixa)+'</td></tr>').join("")+
 '</tbody></table></div></div>'+
 '<p class="enem-note enem-bottom"><b>Critério de análise:</b> resultados agrupados por simulado, série, dia e INEP, sem repetições por exportação. Quando a escola possui médias em diferentes boletins, a média apresentada é aritmética entre esses boletins. Essa síntese é indicativa e não substitui a proficiência TRI oficial. A taxa de participação exige o número de estudantes previstos, ausente nas fontes.</p>';
 const change=(id,key,fun)=>{const el=$(id);if(el)el.addEventListener("change",ev=>{
  escolha[key]=fun(ev.target.value);
  if(["sim","serie","dia","municipio"].includes(key)){if(key!=="municipio")escolha.municipio="Todos";escolha.escola="Todos";}
  if(ultimaSessao?.role==="school")escolha.escola=String(ultimaSessao.inep||"");
  renderPainel();
 });};
 change("enemSim","sim",Number);change("enemSerie","serie",Number);change("enemDia","dia",Number);
 change("enemMunicipio","municipio",String);change("enemEscola","escola",String);
 $("enemBusca")?.addEventListener("change",ev=>{escolha.busca=ev.target.value;renderPainel();});
 $("enemExportar")?.addEventListener("click",()=>exportar(ordem));
 raiz.querySelectorAll(".enem-school-row").forEach(tr=>tr.addEventListener("click",()=>{
  if(ultimaSessao?.role==="school")return;
  escolha.escola=tr.dataset.inep||"Todos";
  renderPainel();$("enemRoot")?.scrollIntoView({behavior:"smooth",block:"start"});
 }));
}
function exportar(rows){
 const escCsv=x=>'"'+String(x??"").replace(/"/g,'""')+'"';
 const header=["Simulado","Série","Dia","INEP","Escola","Município","Alunos","Online","Impresso","Turmas","Média","Faixa"];
 const lines=[header.map(escCsv).join(";")];
 for(const r of rows)lines.push([escolha.sim,escolha.serie,escolha.dia,r.inep,r.escola,r.municipio,r.alunos,r.online,r.impresso,r.turmas,r.media==null?"":nota(r.media),r.faixa].map(escCsv).join(";"));
 const blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="DIASMATH_ENEM_"+escolha.sim+"sim_"+escolha.serie+"serie_"+escolha.dia+"dia.csv";
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function render(sessao){
 ultimaSessao=sessao||ultimaSessao;
 const raiz=$("enemRoot");if(!raiz)return;
 if(!dados)raiz.innerHTML='<div class="enem-card">Carregando resultados ENEM+…</div>';
 carga().then(()=>{if($("enem")?.classList.contains("active"))renderPainel();}).catch(err=>{
  raiz.innerHTML='<div class="enem-card enem-error">Não foi possível carregar os resultados ENEM+: '+esc(err.message)+'</div>';
 });
}
window.SAP_ENEM={render};
function abrirSeSolicitado(){
 if(new URLSearchParams(location.search).get("aba")==="enem"&&typeof setTab==="function"&&
  $("shell")&&!$("shell").classList.contains("hidden") && $("enem"))
   setTab("enem");
 else if(typeof state!=="undefined" && state.tab==="enem" && typeof session!=="undefined" && session)render(session);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",abrirSeSolicitado,{once:true});
else abrirSeSolicitado();
})();