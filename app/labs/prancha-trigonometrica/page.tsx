import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "Prancha Trigonométrica | DIASMATH™",
  description: "Prancha Trigonométrica da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe src="/labs/prancha-trigonometrica/index.html" title="Prancha Trigonométrica" className="block h-screen h-[100dvh] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="labs-prancha-trigonometrica" appName="Prancha Trigonométrica" />
      </section>
    </main>
  );
}
