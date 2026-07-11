import Link from "next/link";

export const metadata = {
  title: "Laboratório Virtual de Divisão | DIASMATH™",
  description: "Laboratório Virtual de Divisão da plataforma DIASMATH™.",
};

export default function LabPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4">
        <Link href="/labs" className="shrink-0 font-black text-white">
          ← DIASMATH™ Labs
        </Link>

        <p className="truncate text-center text-sm font-bold">
          Laboratório Virtual de Divisão
        </p>

        <a
          href="/labs/divisao/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Nova aba
        </a>
      </div>

      <iframe
        src="/labs/divisao/index.html"
        title="Laboratório Virtual de Divisão"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </main>
  );
}
