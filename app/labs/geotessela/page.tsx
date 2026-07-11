import Link from "next/link";

export const metadata = {
  title: "GeoTessela Lab | DIASMATH™",
  description: "GeoTessela Lab da plataforma DIASMATH™.",
};

export default function LabPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4">
        <Link href="/labs" className="shrink-0 font-black text-white">
          ← DIASMATH™ Labs
        </Link>

        <p className="truncate text-center text-sm font-bold">
          GeoTessela Lab
        </p>

        <a
          href="/labs/geotessela/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Nova aba
        </a>
      </div>

      <iframe
        src="/labs/geotessela/index.html"
        title="GeoTessela Lab"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </main>
  );
}
