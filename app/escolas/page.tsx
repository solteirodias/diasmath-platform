import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const sistemas = [
  {
    title: "SAP Avaliações 2026",
    status: "Publicado",
    description:
      "Sistema de Análise Pedagógica para acompanhar resultados por escola, série, disciplina, habilidades críticas, questões, desempenho e intervenções.",
    href: "/escolas/sap-avaliacoes-2026",
    directHref: "/escolas/sap-avaliacoes-2026/index.html",
    emoji: "📊",
    area: "Análise pedagógica",
  },
];

export const metadata = {
  title: "Escolas | DIASMATH™",
  description:
    "Área de escolas da DIASMATH™ com sistemas pedagógicos, painéis de análise e ferramentas para gestão da aprendizagem.",
};

export default function EscolasPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-blue-700">DIASMATH™ Escolas</p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Sistemas para escolas
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Ferramentas digitais para apoiar escolas, equipes gestoras e professores
          na leitura pedagógica dos dados, no acompanhamento da aprendizagem e no
          planejamento de intervenções.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sistemas.map((sistema) => (
            <article
              key={sistema.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-5xl" aria-hidden="true">
                  {sistema.emoji}
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {sistema.status}
                </span>
              </div>

              <p className="mt-5 text-sm font-black text-blue-700">
                {sistema.area}
              </p>

              <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950">
                {sistema.title}
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {sistema.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={sistema.href}
                  className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Abrir sistema
                </Link>

                <a
                  href={sistema.directHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-slate-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:border-blue-600 hover:text-blue-700"
                >
                  Outra aba
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
