import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "Laboratório Virtual de Divisão | DIASMATH™",
  description: "Laboratório Virtual de Divisão da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe src="/labs/divisao/index.html" title="Laboratório Virtual de Divisão" className="block h-screen h-[100dvh] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="labs-divisao" appName="Laboratório Virtual de Divisão" />
      </section>
    </main>
  );
}
