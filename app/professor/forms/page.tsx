import Link from "next/link";

export const metadata = {
  title: "DIASMATH Forms | Professor",
  description:
    "Sistema DIASMATH Forms para professores criarem formulários, questionários, atividades e acompanharem respostas.",
};

export default function DiasmathFormsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4">
        <Link href="/professor" className="shrink-0 font-black text-white">
          ← DIASMATH™ Professor
        </Link>

        <p className="truncate text-center text-sm font-bold">
          DIASMATH Forms V32
        </p>

        <a
          href="/professor/forms/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Abrir em outra aba
        </a>
      </div>

      <iframe
        src="/professor/forms/index.html"
        title="DIASMATH Forms V32"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  );
}
