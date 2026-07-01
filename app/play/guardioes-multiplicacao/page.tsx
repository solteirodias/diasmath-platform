import Link from "next/link";

export const metadata = {
  title: "Os Guardiões da Multiplicação | DIASMATH",
  description: "Jogo educativo para aprender multiplicação na plataforma DIASMATH."
};

export default function GuardioesMultiplicacaoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-950 px-4">
        <Link href="/play" className="font-black text-white">
          ← DIASMATH Play
        </Link>

        <div className="text-center">
          <p className="text-sm font-bold">Os Guardiões da Multiplicação</p>
        </div>

        <a
          href="/games/guardioes-multiplicacao/index.html"
          target="_blank"
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Tela cheia
        </a>
      </div>

      <iframe
        src="/games/guardioes-multiplicacao/index.html"
        title="Os Guardiões da Multiplicação"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen; autoplay"
      />
    </main>
  );
}
