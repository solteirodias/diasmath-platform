import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "Os Guardiões da Multiplicação | DIASMATH™",
  description: "Os Guardiões da Multiplicação da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe src="/games/guardioes-multiplicacao/index.html" title="Os Guardiões da Multiplicação" className="block h-screen h-[100dvh] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="play-guardioes-multiplicacao" appName="Os Guardiões da Multiplicação" />
      </section>
    </main>
  );
}
