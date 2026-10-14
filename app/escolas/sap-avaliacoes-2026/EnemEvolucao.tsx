"use client";
import { useState } from "react";

type Escola = { inep:string; escola:string; municipio:string; alunos:number; media:number|null };
type Fonte = { sim:number; serie:number; dia:number; escolas:Escola[] };
type Ponto = { sim:number; media:number|null; escolas:number };
const campo = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500";
const formato = (n:number|null) => n===null?"—":n.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});

export default function EnemEvolucao({ fontes, serie, dia, municipio }: {
  fontes: Fonte[]; serie:number; dia:number; municipio:string
}) {
  const [selecionada,setSelecionada] = useState("rede");
  const simulados = [...new Set(fontes.filter(x=>x.serie===serie && x.dia===dia).map(x=>x.sim))].sort((a,b)=>a-b);
  type Registro = { inep:string; escola:string; municipio:string; alunos:number; soma:number; quantidade:number };
  const rodadas = simulados.map(sim=>{
    const escolas = new Map<string,Registro>();
    for(const fonte of fontes.filter(x=>x.sim===sim && x.serie===serie && x.dia===dia)) {
      for(const item of fonte.escolas) {
        if(item.media===null)continue;
        const id=item.inep||item.escola;
        if(!escolas.has(id))escolas.set(id,{inep:id,escola:item.escola,municipio:item.municipio,alunos:0,soma:0,quantidade:0});
        const atual=escolas.get(id)!;
        atual.soma+=item.media; atual.quantidade++;
        atual.alunos=Math.max(atual.alunos,item.alunos);
        if(!atual.municipio||/^\d+$/.test(atual.municipio))atual.municipio=item.municipio;
      }
    }
    return {sim,escolas};
  });
  const nomes = new Map<string,Registro>();
  for(const rodada of rodadas)for(const escola of rodada.escolas.values()){
    const antiga=nomes.get(escola.inep);
    if(!antiga || /^\d+$/.test(antiga.municipio))nomes.set(escola.inep,escola);
  }
  const lista = [...nomes.values()].filter(x=>municipio==="todos"||x.municipio===municipio)
    .sort((a,b)=>a.escola.localeCompare(b.escola,"pt-BR"));
  const escolha = lista.some(x=>x.inep===selecionada)?selecionada:"rede";
  const comuns = rodadas.length ? [...rodadas[0].escolas.keys()].filter(id=>
    rodadas.every(r=>r.escolas.has(id))&&(municipio==="todos"||lista.some(x=>x.inep===id))) : [];
  const pontos:Ponto[] = rodadas.map(({sim,escolas})=>{
    if(escolha!=="rede"){
      const e=escolas.get(escolha);
      return {sim,media:e?e.soma/e.quantidade:null,escolas:e?1:0};
    }
    const valores=comuns.map(id=>escolas.get(id)).filter((e):e is Registro=>Boolean(e));
    const peso=valores.reduce((s,e)=>s+e.alunos,0);
    return {sim,media:peso?valores.reduce((s,e)=>s+(e.soma/e.quantidade)*e.alunos,0)/peso:null,escolas:valores.length};
  });
  const validos=pontos.filter(p=>p.media!==null);
  const variacao=validos.length>=2?validos[validos.length-1].media!-validos[0].media!:null;
  const x=(i:number)=>simulados.length<=1?440:65+i*(750/(simulados.length-1));
  const y=(v:number)=>246-v*20;
  return <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-black text-slate-950">Evolução por simulado</h2>
        <p className="mt-1 text-xs text-slate-500">{serie}ª série · {dia}º dia de prova · médias apresentadas em escala de 0 a 10</p>
      </div>
      <div className="w-full sm:w-80">
        <label htmlFor="enem-evolucao-escola" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Evolução de</label>
        <select id="enem-evolucao-escola" className={campo} value={escolha} onChange={e=>setSelecionada(e.target.value)}>
          <option value="rede">Média das mesmas escolas</option>
          {lista.map(e=><option key={e.inep} value={e.inep}>{e.escola}</option>)}
        </select>
      </div>
    </div>
    {validos.length===0 ? <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Não há resultados comparáveis nos simulados disponíveis para este filtro.</p> :
    <>
      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="text-xs font-bold text-slate-500">Variação entre o primeiro e o último simulado disponível</span>
        <strong className={"text-2xl "+(variacao===null?"text-slate-700":variacao>=0?"text-emerald-700":"text-rose-700")}>
          {variacao===null?"—":(variacao>0?"+":"")+formato(variacao)}
        </strong>
        <span className="text-xs text-slate-500">pontos</span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 880 300" role="img" aria-label={"Evolução das médias da "+serie+"ª série, "+dia+"º dia"}
          className="h-auto w-full min-w-[480px]">
          <title>Evolução das médias por simulado</title>
          {[0,2,4,6,8,10].map(n=><g key={n}>
            <line x1="65" x2="815" y1={y(n)} y2={y(n)} stroke="#e2e8f0" strokeWidth="1"/>
            <text x="52" y={y(n)+5} fontSize="13" textAnchor="end" fill="#64748b">{n}</text>
          </g>)}
          {pontos.map((p,i)=><text key={"x"+p.sim} x={x(i)} y="274" fontSize="14" fontWeight="700" textAnchor="middle" fill="#334155">{p.sim}º simulado</text>)}
          {pontos.slice(1).map((p,i)=>{
            const anterior=pontos[i];if(p.media===null||anterior.media===null)return null;
            return <line key={"l"+p.sim} x1={x(i)} x2={x(i+1)} y1={y(anterior.media)} y2={y(p.media)} stroke="#2563eb" strokeWidth="4" strokeLinecap="round"/>;
          })}
          {pontos.map((p,i)=>p.media===null?null:<g key={"p"+p.sim}>
            <circle cx={x(i)} cy={y(p.media)} r="8" fill="#2563eb" stroke="white" strokeWidth="3"/>
            <text x={x(i)} y={y(p.media)-18} textAnchor="middle" fontSize="16" fontWeight="800" fill="#1e40af">{formato(p.media)}</text>
          </g>)}
        </svg>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-700">
          <thead><tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2">Simulado</th><th className="px-3 py-2 text-right">Média</th><th className="px-3 py-2 text-right">Escolas</th>
          </tr></thead>
          <tbody>{pontos.map(p=><tr key={p.sim} className="border-b border-slate-100">
            <td className="px-3 py-2 font-bold">{p.sim}º</td><td className="px-3 py-2 text-right">{formato(p.media)}</td><td className="px-3 py-2 text-right">{p.escolas}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </>}
    <p className="mt-4 text-xs leading-5 text-slate-500">
      {escolha==="rede"?"Na média geral entram apenas escolas presentes em todos os simulados disponíveis, com ponderação pelo número de alunos. ":""}
      Quando existem várias exportações da mesma escola no mesmo simulado e dia, é calculada a média aritmética das médias informadas.
      A comparação é indicativa: as fontes não identificam todas as áreas avaliadas. Não representa nota oficial nem proficiência TRI do ENEM.
    </p>
  </section>;
}
