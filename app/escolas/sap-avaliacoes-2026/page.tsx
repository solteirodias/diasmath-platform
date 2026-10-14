import Link from "next/link";

export const metadata = {
  title: "SAP Avaliações 2026 e ENEM+ | DIASMATH™ Escolas",
  description: "Sistema de Análise Pedagógica: avaliações, Simula+, SAEPI e ENEM+ no mesmo ambiente.",
};

export default function SapAvaliacoes2026Page({
  searchParams,
}: {
  searchParams?: { aba?: string };
}) {
  const src =
    "/escolas/sap-avaliacoes-2026/index.html" +
    (searchParams?.aba === "enem" ? "?aba=enem" : "");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4">
        <Link href="/escolas" className="shrink-0 font-black text-white">
          ← DIASMATH™ Escolas
        </Link>
        <p className="truncate text-center text-sm font-bold">
          SAP Avaliações 2026
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Abrir em outra aba
        </a>
      </div>
      <iframe
        src={src}
        title="SAP Avaliações 2026 e ENEM+"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  );
}
