"use client";

import { useEffect, useMemo, useState } from "react";
import EnemEvolucao from "./EnemEvolucao";

type Habilidade = { habilidade: string; percentual: number };
type Escola = {
  inep: string; escola: string; municipio: string; alunos: number;
  online: number; impresso: number; turmas: number; media: number | null;
  faixa: string; habilidades: Habilidade[];
};
type Conjunto = {
  sim: number; serie: number; dia: number; grupo: number; rotulo: string;
  fonte: string; fontes: string[]; cabecalhos: string[]; escolas: Escola[];
};
type Banco = {
  versao: string; origem: string; totalArquivos: number;
  totalConjuntos: number; conjuntos: Conjunto[];
};

const painel = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const label = "mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-500";
const campo = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const pct = (x: number) => x.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
const numero = (x: number) => x.toLocaleString("pt-BR");
const nota = (x: number | null) => x === null ? "—" : x.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const semAcentos = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const classeFaixa = (f: string) => {
  const v = semAcentos(f);
  return v.includes("muito baixo") ? "bg-red-50 text-red-800" :
    v.includes("baixo") ? "bg-amber-50 text-amber-800" :
    v.includes("alto") ? "bg-emerald-50 text-emerald-800" :
    "bg-blue-50 text-blue-800";
};

function Indicador({ titulo, valor, subtitulo }: { titulo: string; valor: string; subtitulo: string }) {
  return <div className={painel + " p-4 sm:p-5"}>
    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{titulo}</p>
    <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{valor}</p>
    <p className="mt-1 text-xs text-slate-500">{subtitulo}</p>
  </div>;
}

function Barra({ nome, valor, maximo, destaque }: { nome: string; valor: number; maximo: number; destaque?: boolean }) {
  return <div className="py-1.5">
    <div className="mb-1 flex justify-between gap-3 text-xs">
      <span className="min-w-0 truncate font-semibold text-slate-700" title={nome}>{nome}</span>
      <span className="shrink-0 font-extrabold tabular-nums text-slate-800">{destaque ? pct(valor) : nota(valor)}</span>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div className={"h-full rounded-full " + (destaque ? (valor < 40 ? "bg-orange-500" : "bg-blue-600") : "bg-blue-600")}
        style={{ width: String(Math.max(0, Math.min(100, maximo > 0 ? valor / maximo * 100 : 0))) + "%" }} />
    </div>
  </div>;
}

export default function EnemPainel() {
  const [base, setBase] = useState<Banco | null>(null);
  const [erro, setErro] = useState("");
  const [sim, setSim] = useState(1);
  const [serie, setSerie] = useState(3);
  const [dia, setDia] = useState(1);
  const [busca, setBusca] = useState("");
  const [municipio, setMunicipio] = useState("todos");
  const [escolaSelecionada, setEscolaSelecionada] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/escolas/sap-avaliacoes-2026/enem-dados-2026.json", { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error("Base de dados indisponível (" + r.status + ")."); return r.json(); })
      .then((d: Banco) => {
        if (!Array.isArray(d?.conjuntos) || d.conjuntos.length === 0) throw new Error("Formato da base ENEM inválido.");
        setBase(d);
        setErro("");
      })
      .catch((e) => { if (e.name !== "AbortError") setErro(e.message || "Não foi possível carregar os dados."); });
    return () => controller.abort();
  }, []);

  const todos = base?.conjuntos || [];
  const simulados = [...new Set(todos.map(x => x.sim))].sort((a, b) => a - b);
  const series = [...new Set(todos.filter(x => x.sim === sim).map(x => x.serie))].sort((a, b) => a - b);
  const serieAtual = series.includes(serie) ? serie : (series[0] ?? 1);
  const dias = [...new Set(todos.filter(x => x.sim === sim && x.serie === serieAtual).map(x => x.dia))].sort((a,b) => a-b);
  const diaAtual = dias.includes(dia) ? dia : (dias[0] ?? 1);
  const conjunto = useMemo<Conjunto | undefined>(() => {
    const selecionados = todos.filter(x => x.sim === sim && x.serie === serieAtual && x.dia === diaAtual);
    if (!selecionados.length) return undefined;
    type Acumulado = { registro: Escola; soma: number; quantidade: number; faixas: Set<string>; habilidades: Map<string, { soma: number; quantidade: number }> };
    const escolas = new Map<string, Acumulado>();
    for (const arquivo of selecionados) for (const item of arquivo.escolas) {
      const chave = item.inep || item.escola;
      if (!escolas.has(chave)) escolas.set(chave, {
        registro: { ...item, alunos: 0, turmas: 0, online: 0, impresso: 0, media: null, faixa: "", habilidades: [] },
        soma: 0, quantidade: 0, faixas: new Set<string>(), habilidades: new Map()
      });
      const atual = escolas.get(chave)!;
      if (item.media !== null) { atual.soma += item.media; atual.quantidade++; }
      atual.registro.alunos = Math.max(atual.registro.alunos, item.alunos);
      atual.registro.online = Math.max(atual.registro.online, item.online);
      atual.registro.impresso = Math.max(atual.registro.impresso, item.impresso);
      atual.registro.turmas = Math.max(atual.registro.turmas, item.turmas);
      if (!atual.registro.municipio || /^\d+$/.test(atual.registro.municipio)) atual.registro.municipio = item.municipio;
      if (item.faixa) atual.faixas.add(item.faixa);
      for (const h of item.habilidades) {
        const info = atual.habilidades.get(h.habilidade) || { soma: 0, quantidade: 0 };
        info.soma += h.percentual; info.quantidade++;
        atual.habilidades.set(h.habilidade, info);
      }
    }
    const linhas = [...escolas.values()].map(atual => {
      atual.registro.media = atual.quantidade ? atual.soma / atual.quantidade : null;
      atual.registro.faixa = atual.faixas.size === 1 ? [...atual.faixas][0] : "Variável";
      atual.registro.habilidades = [...atual.habilidades.entries()].map(([habilidade, info]) => ({
        habilidade, percentual: info.soma / info.quantidade
      }));
      return atual.registro;
    });
    return {
      ...selecionados[0],
      fonte: selecionados.map(x => x.fonte).join(" | "),
      fontes: selecionados.flatMap(x => x.fontes),
      cabecalhos: [...new Set(selecionados.flatMap(x => x.cabecalhos))],
      escolas: linhas
    };
  }, [base, sim, serieAtual, diaAtual]);
  const municipios = [...new Set((conjunto?.escolas || []).map(x => x.municipio))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
  const filtradas = useMemo(() => {
    const q = semAcentos(busca.trim());
    return (conjunto?.escolas || []).filter(x =>
      (municipio === "todos" || x.municipio === municipio) &&
      (!q || semAcentos(x.escola + " " + x.inep + " " + x.municipio).includes(q))
    ).sort((a,b) => (b.media ?? -Infinity) - (a.media ?? -Infinity) || a.escola.localeCompare(b.escola,"pt-BR"));
  }, [conjunto, busca, municipio]);
  const totalAlunos = filtradas.reduce((s,x)=>s+x.alunos,0);
  const notaMedia = totalAlunos > 0 ?
    filtradas.reduce((s,x)=>s+(x.media ?? 0)*x.alunos,0)/totalAlunos : null;
  const skillData = useMemo(() => {
    const agg = new Map<string, {somatorio: number; peso: number; presentes: number}>();
    for (const escola of filtradas) for (const h of escola.habilidades) {
      const w = Math.max(0, escola.alunos);
      const k = h.habilidade;
      const old = agg.get(k) || {somatorio:0,peso:0,presentes:0};
      old.somatorio += h.percentual*w; old.peso += w; old.presentes++;
      agg.set(k,old);
    }
    return [...agg.entries()].filter(([,x])=>x.peso>0).map(([habilidade,x])=>({
      habilidade, percentual:x.somatorio/x.peso, escolas:x.presentes
    })).sort((a,b)=>a.percentual-b.percentual);
  }, [filtradas]);
  const destaque = filtradas.find(x => x.inep === escolaSelecionada) || null;

  function exportar() {
    if (!conjunto) return;
    const esc = (x: unknown) => '"' + String(x ?? "").replace(/"/g, '""') + '"';
    const header = ["Simulado","Série","Dia","INEP","Escola","Município","Alunos","Online","Impresso","Turmas","Média","Faixa",...conjunto.cabecalhos];
    const lines = [header.map(esc).join(";")];
    for(const x of filtradas) {
      const mapa = new Map(x.habilidades.map(h=>[h.habilidade,h.percentual]));
      const row = [sim,serieAtual,diaAtual,x.inep,x.escola,x.municipio,x.alunos,x.online,x.impresso,x.turmas, x.media === null ? "" : nota(x.media),x.faixa, ...conjunto.cabecalhos.map(h => mapa.has(h) ? pct(mapa.get(h)!) : "")];
      lines.push(row.map(esc).join(";"));
    }
    const blob = new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download="DIASMATH_ENEM_"+sim+"sim_"+serieAtual+"serie_"+diaAtual+"dia_integrado.csv";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  if (erro) return <section className="m-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900" role="alert"><h2 className="font-black">Não foi possível abrir os resultados ENEM</h2><p className="mt-2">{erro}</p></section>;
  if (!base) return <section className="m-4 rounded-xl bg-white p-8 text-center font-bold text-slate-700" role="status">Carregando resultados ENEM+…</section>;

  return <section className="min-h-full bg-slate-50 px-4 pb-10 pt-7 text-slate-900 sm:px-7 lg:px-10">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-700">DIASMATH · SAP · 2026</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">ENEM+ <span className="text-blue-600">| Análise pedagógica</span></h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Resultados por escola dos simulados ENEM+: comparação de médias, quantitativos e habilidades quando presentes no arquivo.
          </p>
        </div>
        <button onClick={exportar} disabled={!conjunto || filtradas.length===0}
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-800 disabled:opacity-40">↓ Exportar CSV filtrado</button>
      </div>

      <div className={painel + " mb-5 p-4 sm:p-5"}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div><label htmlFor="enem-sim" className={label}>Simulado</label>
            <select id="enem-sim" className={campo} value={sim} onChange={e=>{setSim(Number(e.target.value));setMunicipio("todos");setEscolaSelecionada("");}}>
              {simulados.map(x=><option key={x} value={x}>{x}º simulado</option>)}
            </select></div>
          <div><label htmlFor="enem-serie" className={label}>Série</label>
            <select id="enem-serie" className={campo} value={serieAtual} onChange={e=>{setSerie(Number(e.target.value));setMunicipio("todos");setEscolaSelecionada("");}}>
              {series.map(x=><option key={x} value={x}>{x}ª série</option>)}
            </select></div>
          <div><label htmlFor="enem-dia" className={label}>Dia de prova</label>
            <select id="enem-dia" className={campo} value={diaAtual} onChange={e=>{setDia(Number(e.target.value));setMunicipio("todos");setEscolaSelecionada("");}}>
              {dias.map(x=><option key={x} value={x}>{x}º dia</option>)}
            </select></div>
          <div><label htmlFor="enem-cidade" className={label}>Município</label>
            <select id="enem-cidade" className={campo} value={municipios.includes(municipio) ? municipio : "todos"} onChange={e=>{setMunicipio(e.target.value);setEscolaSelecionada("");}}>
              <option value="todos">Todos</option>{municipios.map(x=><option key={x} value={x}>{x}</option>)}
            </select></div>
          <div><label htmlFor="enem-busca" className={label}>Buscar escola / INEP</label>
            <input id="enem-busca" className={campo} value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Nome ou código" type="search" />
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Visualização integrada dos arquivos deste simulado, série e dia. Quando há mais de uma exportação por escola, a média exibida é a média aritmética das médias informadas, não uma nota oficial do ENEM.
          {conjunto && <> <strong>Arquivos utilizados:</strong> {conjunto.fontes.length}.</>}
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador titulo="Média ponderada" valor={nota(notaMedia)} subtitulo="Ponderada pelo nº de alunos em cada escola" />
        <Indicador titulo="Alunos nas escolas" valor={numero(totalAlunos)} subtitulo="Cada escola contada uma vez por dia" />
        <Indicador titulo="Escolas" valor={numero(filtradas.length)} subtitulo="Após filtros selecionados" />
        <Indicador titulo="Habilidades" valor={numero(skillData.length)} subtitulo={skillData.length ? "Percentuais de acertos por habilidade" : "Não disponíveis nesta exportação"} />
      </div>

      <EnemEvolucao fontes={todos} serie={serieAtual} dia={diaAtual} municipio={municipios.includes(municipio) ? municipio : "todos"} />

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className={painel + " p-5"}>
          <h2 className="text-lg font-black">Desempenho das escolas</h2>
          <p className="mb-4 text-xs text-slate-500">Maiores médias do simulado selecionado · {Math.min(10,filtradas.length)} escolas</p>
          {filtradas.length===0 ? <p className="text-sm text-slate-500">Nenhuma escola encontrada.</p> :
            filtradas.slice(0,10).map(x=><Barra key={x.inep} nome={x.escola} valor={x.media??0} maximo={10} />)}
        </div>
        <div className={painel + " p-5"}>
          <h2 className="text-lg font-black">Habilidades que exigem atenção</h2>
          <p className="mb-4 text-xs text-slate-500">Menores percentuais de acerto, ponderados pelo nº de alunos</p>
          {skillData.length===0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Os arquivos desta seleção não apresentam percentuais por habilidade.</p> :
            skillData.slice(0,10).map(h=><Barra key={h.habilidade} nome={h.habilidade} valor={h.percentual} maximo={100} destaque />)}
        </div>
      </div>

      <div className={painel + " overflow-hidden"}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div><h2 className="text-lg font-black">Resultados por escola</h2><p className="text-xs text-slate-500">Clique em uma escola para ver seu diagnóstico</p></div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">{filtradas.length} escolas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>
              <th className="px-4 py-3">Escola</th><th className="px-4 py-3">Município</th>
              <th className="px-4 py-3 text-right">Alunos</th><th className="px-4 py-3 text-right">Turmas</th>
              <th className="px-4 py-3 text-right">Média</th><th className="px-4 py-3">Faixa</th>
            </tr></thead>
            <tbody>{filtradas.map(x=><tr key={x.inep} onClick={()=>setEscolaSelecionada(x.inep)}
              className={"cursor-pointer border-t border-slate-100 hover:bg-blue-50/70 "+(destaque?.inep===x.inep?"bg-blue-50":"")}>
              <td className="max-w-sm px-4 py-3"><span className="font-bold">{x.escola}</span><span className="mt-0.5 block text-xs text-slate-500">INEP: {x.inep}</span></td>
              <td className="px-4 py-3 text-slate-600">{x.municipio}</td>
              <td className="px-4 py-3 text-right tabular-nums">{numero(x.alunos)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{numero(x.turmas)}</td>
              <td className="px-4 py-3 text-right font-extrabold tabular-nums">{nota(x.media)}</td>
              <td className="px-4 py-3"><span className={"inline-flex rounded-full px-2.5 py-1 text-xs font-bold "+classeFaixa(x.faixa)}>{x.faixa || "Sem faixa"}</span></td>
            </tr>)}</tbody>
          </table>
          {filtradas.length===0 && <p className="p-8 text-center text-sm text-slate-500">Nenhum resultado para estes filtros.</p>}
        </div>
      </div>

      {destaque && <div className={painel + " mt-5 p-5"}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Diagnóstico da escola</p>
            <h2 className="mt-1 text-xl font-black">{destaque.escola}</h2>
            <p className="text-sm text-slate-500">{destaque.municipio} · INEP {destaque.inep} · {numero(destaque.alunos)} alunos · Média {nota(destaque.media)}</p>
          </div>
          <button onClick={()=>setEscolaSelecionada("")} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50">Fechar</button>
        </div>
        {destaque.habilidades.length>0 ? <div className="mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {[...destaque.habilidades].sort((a,b)=>a.percentual-b.percentual).map(h=><Barra key={h.habilidade} nome={h.habilidade} valor={h.percentual} maximo={100} destaque />)}
        </div> : <p className="mt-4 text-sm text-slate-500">O arquivo selecionado não apresenta resultados por habilidade.</p>}
      </div>}

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-600">
        <strong>Leitura dos dados:</strong> as médias e as faixas são as informadas na fonte (não são proficiências TRI do ENEM).
        As médias exibidas integram as exportações por escola, série, dia e simulado usando a média aritmética das médias informadas.
        As faixas de desempenho podem variar entre as fontes. Habilidades com o mesmo código em arquivos distintos são resumidas por média simples, sem garantia de equivalência entre matrizes.
        Não é possível calcular taxa de participação sem os estudantes previstos.
        A base utiliza {base.totalArquivos} arquivos recebidos, sem contar duplicidades idênticas duas vezes.
      </div>
    </div>
  </section>;
}
