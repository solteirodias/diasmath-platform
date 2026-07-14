import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const atividades = [
  {
    title: "Atividades para imprimir",
    status: "Em organização",
    description:
      "Espaço para listas, revisões, avaliações, atividades em PDF e materiais prontos para sala de aula.",
    href: "#",
    emoji: "📝",
    area: "PDF e Word",
  },
  {
    title: "Resolva e pinte",
    status: "Em breve",
    description:
      "Atividades lúdicas para colorir, revisar conteúdos matemáticos e trabalhar com turmas dos anos iniciais.",
    href: "#",
    emoji: "🎨",
    area: "Colorir",
  },
  {
    title: "Desafios matemáticos",
    status: "Em breve",
    description:
      "Problemas contextualizados, desafios rápidos e propostas para revisão em grupo.",
    href: "#",
    emoji: "🧠",
    area: "Raciocínio",
  },
  {
    title: "Materiais SAEB",
    status: "Em breve",
    description:
      "Atividades organizadas por habilidade, descritor, ano escolar e foco pedagógico.",
    href: "#",
    emoji: "📊",
    area: "SAEB",
  },
];

export const metadata = {
  title: "Atividades | DIASMATH™",
  description:
    "Atividades pedagógicas da DIASMATH™ para imprimir, revisar, colorir e fortalecer a aprendizagem matemática.",
};

export default function AtividadesPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-blue-700">DIASMATH™ Atividades</p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Atividades pedagógicas
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Um espaço para reunir materiais prontos para sala de aula: atividades
          impressas, revisões, propostas para colorir, desafios matemáticos,
          avaliações e sequências organizadas por conteúdo.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {atividades.map((atividade) => (
            <article
              key={atividade.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-5xl" aria-hidden="true">
                  {atividade.emoji}
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {atividade.status}
                </span>
              </div>

              <p className="mt-5 text-sm font-black text-blue-700">
                {atividade.area}
              </p>

              <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950">
                {atividade.title}
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {atividade.description}
              </p>

              {atividade.href === "#" ? (
                <button
                  type="button"
                  disabled
                  className="mt-7 inline-flex rounded-full bg-slate-200 px-5 py-2.5 text-sm font-black text-slate-500"
                >
                  Em breve
                </button>
              ) : (
                <Link
                  href={atividade.href}
                  className="mt-7 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Abrir atividade
                </Link>
              )}
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-3xl bg-slate-950 p-8 text-white">
          <h2 className="text-2xl font-black">Próximos materiais</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Esta aba pode receber atividades em PDF, Word, imagens para colorir,
            revisões semanais, jogos impressos e materiais organizados por ano
            escolar. O ideal é publicar cada atividade em uma página própria e
            adicionar um card aqui.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
