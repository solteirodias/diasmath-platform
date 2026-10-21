
export const metadata = {
  title: "Os Guardiões da Divisão | DIASMATH™",
  description:
    "Game educativo da DIASMATH™ para aprender divisão com mundos brasileiros, fases, portais, chefes, resto e batalha final.",
};

export default function GuardioesDivisaoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <iframe
        src="/games/guardioes-divisao/index.html?v=48"
        title="Os Guardiões da Divisão"
        className="block h-screen h-[100dvh] w-full border-0"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </main>
  );
}
