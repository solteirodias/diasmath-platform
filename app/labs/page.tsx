import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const labs = [
  {
    title: "Laboratório Virtual de Divisão",
    status: "Publicado",
    description:
      "Experimente a divisão com bolinhas, caixas, partilha visual, resto e método da chave passo a passo.",
    href: "/labs/divisao",
    emoji: "🧪➗",
    area: "Divisão",
  },
  {
    title: "GeoTessela Lab",
    status: "Publicado",
    description:
      "Laboratório digital para explorar pavimentações, mosaicos, polígonos, padrões geométricos e composição de figuras.",
    href: "/labs/geotessela",
    emoji: "🔷",
    area: "Geometria",
  },
  {
    title: "Prancha Trigonométrica",
    status: "Publicado",
    description:
      "Laboratório visual para investigar ângulos, relações trigonométricas e representações no círculo trigonométrico.",
    href: "/labs/prancha-trigonometrica",
    emoji: "📐",
    area: "Trigonometria",
  },
  {
    title: "Laboratório Virtual de Xadrez",
    status: "Publicado",
    description:
      "Ferramenta interativa para ensinar xadrez nos anos iniciais, com setas de movimento, turnos guiados, aulas por peças e montagem personalizada do tabuleiro.",
    href: "/labs/xadrez",
    emoji: "♟️",
    area: "Raciocínio lógico",
  },
];

export const metadata = {
  title: "Laboratórios digitais | DIASMATH™",
  description:
    "Laboratórios digitais da DIASMATH™ para investigar, manipular, visualizar e compreender ideias matemáticas.",
};

export default function LabsPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-4xl font-black text-slate-950">
          Laboratórios digitais
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Ambientes interativos para visualizar conceitos, testar estratégias,
          comparar representações e transformar a aula de Matemática em uma
          experiência investigativa.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {labs.map((lab) => (
            <article
              key={lab.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-5xl" aria-hidden="true">
                  {lab.emoji}
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {lab.status}
                </span>
              </div>

              <p className="mt-5 text-sm font-black text-blue-700">
                {lab.area}
              </p>

              <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950">
                {lab.title}
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {lab.description}
              </p>

              <Link
                href={lab.href}
                className="mt-7 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Abrir laboratório
              </Link>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
