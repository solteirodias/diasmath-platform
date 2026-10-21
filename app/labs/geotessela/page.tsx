import { CommentBox } from "@/components/CommentBox";

export const metadata = {
  title: "GeoTessela Lab | DIASMATH™",
  description: "GeoTessela Lab da plataforma DIASMATH™.",
};

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe src="/labs/geotessela/index.html" title="GeoTessela Lab" className="block h-screen h-[100dvh] w-full border-0" allow="fullscreen; autoplay" allowFullScreen />
      <section className="bg-slate-50 px-4 py-10 text-slate-900">
        <CommentBox appSlug="labs-geotessela" appName="GeoTessela Lab" />
      </section>
    </main>
  );
}
