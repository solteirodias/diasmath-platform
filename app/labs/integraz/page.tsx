import Link from "next/link";
import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "IntegraZ Lab | DIASMATH™",
  description: "IntegraZ Lab da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4">
        <Link href="/labs" className="shrink-0 font-black text-white">
          ← DIASMATH™ Labs
        </Link>
        <p className="truncate text-center text-sm font-bold">IntegraZ Lab</p>
        <a href="/labs/integraz/index.html" target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950">
          Abrir em outra aba
        </a>
      </div>
      <iframe src="/labs/integraz/index.html" title="IntegraZ Lab" className="h-[calc(100vh-56px)] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="labs-integraz" appName="IntegraZ Lab" />
      </section>
    </main>
  );
}
