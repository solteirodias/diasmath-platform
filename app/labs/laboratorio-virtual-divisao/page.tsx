
export const metadata = {
  title: "Laboratório Virtual de Divisão | DIASMATH",
  description:
    "Laboratório digital para aprender divisão por meio de animações, partilha de bolinhas e método da chave passo a passo.",
};

export default function LaboratorioVirtualDivisaoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <iframe
        src="/labs/laboratorio-virtual-divisao/index.html"
        title="Laboratório Virtual de Divisão"
        className="block h-screen h-[100dvh] w-full border-0"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </main>
  );
}
