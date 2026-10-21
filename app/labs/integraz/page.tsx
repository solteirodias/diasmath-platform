import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "IntegraZ Lab | DIASMATH™",
  description: "IntegraZ Lab da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe src="/labs/integraz/index.html" title="IntegraZ Lab" className="block h-screen h-[100dvh] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="labs-integraz" appName="IntegraZ Lab" />
      </section>
    </main>
  );
}
