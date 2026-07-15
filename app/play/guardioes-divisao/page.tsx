import Link from "next/link";

export const metadata = {
  title: "Os Guardiões da Divisão | DIASMATH™",
  description:
    "Game educativo da DIASMATH™ para aprender divisão com mundos brasileiros, fases, portais, chefes, resto e batalha final.",
};

export default function GuardioesDivisaoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4">
        <Link href="/play" className="shrink-0 font-black text-white">
          ← DIASMATH™ Play
        </Link>

        <p className="truncate text-center text-sm font-bold">
          Os Guardiões da Divisão
        </p>

        <a
          href="/games/guardioes-divisao/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Abrir em outra aba
        </a>
      </div>

      <iframe
        src="/games/guardioes-divisao/index.html"
        title="Os Guardiões da Divisão"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </main>
  );
}
