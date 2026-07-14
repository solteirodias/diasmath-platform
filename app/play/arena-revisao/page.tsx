import Link from "next/link";

export const metadata = {
  title: "DIASMATH™ Arena da Revisão",
  description:
    "Game de revisão matemática para 5 equipes, com 40 desafios, fases de pensar, responder e compreender, ranking e estatísticas finais.",
};

export default function ArenaRevisaoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4">
        <Link href="/play" className="shrink-0 font-black text-white">
          ← DIASMATH™ Play
        </Link>

        <p className="truncate text-center text-sm font-bold">
          DIASMATH™ Arena da Revisão
        </p>

        <a
          href="/games/arena-revisao/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Abrir em outra aba
        </a>
      </div>

      <iframe
        src="/games/arena-revisao/index.html"
        title="DIASMATH™ Arena da Revisão"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </main>
  );
}
