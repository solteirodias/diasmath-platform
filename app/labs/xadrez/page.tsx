import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "Laboratório Virtual de Xadrez | DIASMATH™",
  description: "Laboratório Virtual de Xadrez da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe src="/labs/xadrez/index.html" title="Laboratório Virtual de Xadrez" className="block h-screen h-[100dvh] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="labs-xadrez" appName="Laboratório Virtual de Xadrez" />
      </section>
    </main>
  );
}
