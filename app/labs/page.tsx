import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const labs = [
  {
    title: "GeoTessela Lab",
    status: "Publicado",
    description: "Laboratório de Geometria para investigar ladrilhamentos com polígonos regulares, códigos de vértice e soma angular.",
    href: "/labs/geotessela",
    emoji: "⬡",
    area: "Geometria"
  },
  {
    title: "Prancha Trigonométrica",
    status: "Publicado",
    description: "Laboratório para explorar ciclo trigonométrico, ângulos notáveis, redução ao 1º quadrante, seno, cosseno e tangente.",
    href: "/labs/prancha-trigonometrica",
    emoji: "📐",
    area: "Trigonometria"
  },
  {
    title: "GeoPlan",
    status: "Planejado",
    description: "Laboratório digital para exploração de pontos, retas, ângulos e polígonos.",
    href: "#",
    emoji: "📏",
    area: "Geometria"
  },
  {
    title: "AlgePlan",
    status: "Planejado",
    description: "Laboratório para manipulação de expressões, equivalências e equações.",
    href: "#",
    emoji: "⚖️",
    area: "Álgebra"
  },
  {
    title: "Função Afim",
    status: "Planejado",
    description: "Laboratório para relacionar tabela, expressão algébrica e gráfico.",
    href: "#",
    emoji: "📈",
    area: "Funções"
  }
];

export default function LabsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-diasmath-blue">DiasMath Labs</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Laboratórios digitais
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Ambientes interativos para investigar, manipular, visualizar e compreender ideias matemáticas.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {labs.map((lab) => (
            <article key={lab.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-5xl">{lab.emoji}</div>
              <p className="mt-5 text-sm font-bold text-diasmath-blue">{lab.area} · {lab.status}</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">{lab.title}</h2>
              <p className="mt-3 text-slate-600">{lab.description}</p>

              {lab.href !== "#" ? (
                <Link href={lab.href} className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white">
                  Abrir laboratório
                </Link>
              ) : (
                <button disabled className="mt-6 rounded-full bg-slate-200 px-5 py-2 text-sm font-bold text-slate-500">
                  Em breve
                </button>
              )}
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
