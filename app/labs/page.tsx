import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const labs = [
  {
    title: "GeoTessela Lab",
    area: "Laboratório de Geometria",
    status: "Publicado",
    description: "Investigue tesselações, códigos de vértices, soma angular, lacunas, sobreposições e ladrilhamentos uniformes.",
    href: "/labs/geotessela",
    emoji: "⬡",
  },
  {
    title: "Prancha Trigonométrica",
    area: "Laboratório de Trigonometria",
    status: "Em preparação",
    description: "Explore seno, cosseno, tangente, ângulo de referência e ciclo trigonométrico.",
    href: "#",
    emoji: "📐",
  },
  {
    title: "AlgePlan",
    area: "Laboratório de Álgebra",
    status: "Planejado",
    description: "Manipule expressões, equivalências, equações e representações algébricas.",
    href: "#",
    emoji: "🧩",
  },
  {
    title: "Função Afim",
    area: "Laboratório de Funções",
    status: "Planejado",
    description: "Conecte tabela, gráfico, expressão algébrica e interpretação de situações-problema.",
    href: "#",
    emoji: "📈",
  },
];

export default function LabsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-diasmath-blue">DIASMATH LABS</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Laboratórios digitais</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Ambientes interativos para investigar, manipular, visualizar e construir conceitos matemáticos.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {labs.map((lab) => (
            <article key={lab.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-5xl">{lab.emoji}</div>
              <p className="mt-5 text-sm font-bold text-diasmath-blue">{lab.area}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{lab.title}</h2>
              <p className="mt-3 text-slate-600">{lab.description}</p>
              <p className="mt-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-diasmath-blue">{lab.status}</p>
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
