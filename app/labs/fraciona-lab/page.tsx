
export const metadata = {
  title: "FracionaLab | DIASMATH™",
  description:
    "FracionaLab: laboratório interativo de frações com página principal, entrada em tela cheia, bancada visual, cotidiano, equivalência, reta numérica, desafios e relatório.",
};

export default function FracionaLabPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <iframe
        src="/labs/fraciona-lab/index.html"
        title="DIASMATH FracionaLab"
        className="block h-screen h-[100dvh] w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  );
}
