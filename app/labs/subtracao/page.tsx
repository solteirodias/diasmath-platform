import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "Laboratório de Subtração | DIASMATH™",
  description: "Laboratório de Subtração da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe src="/labs/subtracao/index.html" title="Laboratório de Subtração" className="block h-screen h-[100dvh] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="labs-subtracao" appName="Laboratório de Subtração" />
      </section>
    </main>
  );
}
