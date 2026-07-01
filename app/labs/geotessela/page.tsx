import Link from "next/link";

export const metadata = {
  title: "GeoTessela Lab | DIASMATH",
  description: "Laboratório digital para investigação de ladrilhamentos com polígonos regulares."
};

export default function GeoTesselaPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-950 px-4">
        <Link href="/labs" className="font-black text-white">
          ← DIASMATH Labs
        </Link>

        <div className="text-center">
          <p className="text-sm font-bold">GeoTessela Lab</p>
        </div>

        <a
          href="/labs/geotessela/index.html"
          target="_blank"
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Tela cheia
        </a>
      </div>

      <iframe
        src="/labs/geotessela/index.html"
        title="GeoTessela Lab"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen"
      />
    </main>
  );
}
