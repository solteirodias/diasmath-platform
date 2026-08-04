import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ferramentas = [
  {
    title: "DIASMATH Forms V32",
    description:
      "Crie formulários, questionários, atividades avaliativas, compartilhe links e acompanhe respostas em um painel pedagógico.",
    href: "/professor/forms",
    directHref: "/professor/forms/index.html",
    emoji: "📝",
    status: "Publicado",
  },
];

export const metadata = {
  title: "Professor | DIASMATH™",
  description:
    "Área do professor da DIASMATH™ com ferramentas para criação de atividades, formulários, questionários e acompanhamento pedagógico.",
};

export default function ProfessorPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-blue-700">DIASMATH™ Professor</p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Ferramentas para professores
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Espaço para publicar recursos digitais que apoiam o planejamento,
          a criação de atividades, a coleta de respostas e a análise pedagógica.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ferramentas.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-5xl" aria-hidden="true">
                  {item.emoji}
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {item.status}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-black leading-tight text-slate-950">
                {item.title}
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {item.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={item.href}
                  className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Abrir ferramenta
                </Link>

                <a
                  href={item.directHref}
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
