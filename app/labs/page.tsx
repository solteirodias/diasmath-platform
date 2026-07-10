import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const labs = [
  {
    title: "Laboratório Virtual de Divisão",
    status: "Publicado",
    description:
      "Experimente a divisão com bolinhas, caixas, partilha visual, resto e método da chave passo a passo.",
    href: "/labs/laboratorio-virtual-divisao",
    emoji: "🧪➗",
    focus: "Divisão",
  },
  {
    title: "GeoTessela Lab",
    status: "Publicado",
    description:
      "Laboratório digital para explorar pavimentações, mosaicos, polígonos, padrões geométricos e composição de figuras.",
    href: "/labs/geotessela",
    emoji: "🔷",
    focus: "Geometria",
  },
  {
    title: "Prancha Trigonométrica",
    status: "Publicado",
    description:
      "Laboratório visual para investigar ângulos, relações trigonométricas e representações no círculo trigonométrico.",
    href: "/labs/prancha-trigonometrica",
    emoji: "📐",
    focus: "Trigonometria",
  },
  {
    title: "Laboratório de Frações",
    status: "Planejado",
    description:
      "Ambiente para manipular partes de inteiros, comparar frações, equivalências e representações visuais.",
    href: "#",
    emoji: "🍕",
    focus: "Frações",
  },
];

export const metadata = {
  title: "Laboratórios digitais | DIASMATH",
  description:
    "Laboratórios digitais da DIASMATH para ensinar Matemática com visualização, experimentação e interação.",
};

export default function LabsPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-diasmath-blue">DIASMATH™ Labs</p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Laboratórios digitais
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Ambientes interativos para visualizar conceitos, testar estratégias,
          comparar representações e transformar a aula de Matemática em uma
          experiência investigativa.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {labs.map((lab) => {
            const published = lab.href !== "#";

            return (
              <article
                key={lab.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-5xl" aria-hidden="true">
                    {lab.emoji}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      published
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {lab.status}
                  </span>
                </div>

                <p className="mt-5 text-sm font-bold text-diasmath-blue">
                  {lab.focus}
                </p>

                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  {lab.title}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {lab.description}
                </p>

                {published ? (
                  <Link
                    href={lab.href}
                    className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white transition hover:bg-diasmath-blue"
                  >
                    Abrir laboratório
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-6 rounded-full bg-slate-200 px-5 py-2 text-sm font-bold text-slate-500"
                  >
                    Em breve
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </main>

      <Footer />
    </>
  );
}
