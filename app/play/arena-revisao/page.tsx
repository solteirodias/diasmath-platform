import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "DIASMATH™ Arena da Revisão | DIASMATH™",
  description: "DIASMATH™ Arena da Revisão da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe src="/games/arena-revisao/index.html" title="DIASMATH™ Arena da Revisão" className="block h-screen h-[100dvh] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="play-arena-revisao" appName="DIASMATH™ Arena da Revisão" />
      </section>
    </main>
  );
}
