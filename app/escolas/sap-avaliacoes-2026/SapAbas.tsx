"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import EnemPainel from "./EnemPainel";

export default function SapAbas() {
  const [aba,setAba] = useState<"sap" | "enem">("sap");
  useEffect(() => {
    if(new URLSearchParams(window.location.search).get("aba")==="enem") setAba("enem");
  }, []);
  const mudar=(proxima:"sap" | "enem")=>{
    setAba(proxima);
    const url=new URL(window.location.href);
    if(proxima==="enem")url.searchParams.set("aba","enem");
    else url.searchParams.delete("aba");
    window.history.replaceState(null,"",url.pathname+url.search+url.hash);
  };
  return <main className="min-h-screen bg-slate-950 text-white">
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/escolas" className="text-sm font-black hover:text-blue-200">← DIASMATH™ Escolas</Link>
        <span className="text-sm font-bold text-blue-200">SAP · Avaliações 2026</span>
      </div>
      <a href="/escolas/sap-avaliacoes-2026/index.html" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold hover:bg-white/10">Abrir SAP original ↗</a>
    </header>
    <nav className="flex gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2 sm:px-6" role="tablist" aria-label="Áreas do SAP">
      <button type="button" id="sap-tab-avaliacoes" role="tab" aria-selected={aba==="sap"} aria-controls="sap-avaliacoes" onClick={()=>mudar("sap")}
        className={"rounded-xl px-4 py-2.5 text-sm font-black transition "+(aba==="sap"?"bg-white text-slate-950":"text-slate-300 hover:bg-slate-800")}>📊 Avaliações 2026</button>
      <button type="button" id="sap-tab-enem" role="tab" aria-selected={aba==="enem"} aria-controls="sap-enem" onClick={()=>mudar("enem")}
        className={"rounded-xl px-4 py-2.5 text-sm font-black transition "+(aba==="enem"?"bg-blue-600 text-white":"text-slate-300 hover:bg-slate-800")}>🎯 ENEM+</button>
    </nav>
    <div id="sap-avaliacoes" role="tabpanel" aria-labelledby="sap-tab-avaliacoes" hidden={aba!=="sap"}>
      <iframe src="/escolas/sap-avaliacoes-2026/index.html" title="SAP Avaliações 2026 — painel original"
        className="h-[calc(100vh-116px)] min-h-[600px] w-full border-0 bg-white" allow="fullscreen" allowFullScreen />
    </div>
    <div id="sap-enem" role="tabpanel" aria-labelledby="sap-tab-enem" hidden={aba!=="enem"}>
      <EnemPainel />
    </div>
  </main>;
}
