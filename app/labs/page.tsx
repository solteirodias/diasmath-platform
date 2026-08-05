import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const labs = [
  {
    title: "FracionaLab",
    area: "Frações",
    description:
      "Laboratório interativo para compreender frações com partes iguais, cotidiano, equivalência, reta numérica, fração de quantidade, desafios e relatório.",
    href: "/labs/fraciona-lab",
    icon: "⅗",
    status: "Novo",
  },
  {
    title: "Laboratório de Subtração",
    area: "Operações",
    description:
      "Explore a subtração com material dourado, trocas, animações e situações-problema.",
    href: "/labs/subtracao",
    icon: "➖",
    status: "Publicado",
  },
  {
    title: "Laboratório da Divisão",
    area: "Operações",
    description:
      "Visualize agrupamentos, repartições, quociente e resto com representações interativas.",
    href: "/labs/divisao",
    icon: "➗",
    status: "Publicado",
  },
  {
    title: "Laboratório Virtual de Xadrez",
    area: "Raciocínio lógico",
    description:
      "Aprenda movimentos, estratégias iniciais e resolução de desafios no tabuleiro.",
    href: "/labs/xadrez",
    icon: "♟️",
    status: "Publicado",
  },
  {
    title: "IntegraZ Lab",
    area: "Matemática integrada",
    description:
      "Ambiente digital para exploração matemática com desafios e atividades interativas.",
    href: "/labs/integraz",
    icon: "∫",
    status: "Publicado",
  },
  {
    title: "GeoTessela Lab",
    area: "Geometria",
    description:
      "Explore formas, mosaicos, composição, decomposição e padrões geométricos.",
    href: "/labs/geotessela",
    icon: "⬡",
    status: "Publicado",
  },
  {
    title: "Prancha Trigonométrica",
    area: "Trigonometria",
    description:
      "Visualize relações trigonométricas, ângulos e representações geométricas.",
    href: "/labs/prancha-trigonometrica",
    icon: "📐",
    status: "Publicado",
  },
];

export const metadata = {
  title: "Laboratórios digitais | DIASMATH™",
  description:
    "Laboratórios digitais interativos da DIASMATH™ para explorar conceitos matemáticos com visualizações, desafios e atividades pedagógicas.",
};

export default function LabsPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-blue-700">DIASMATH™ Labs</p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
          Laboratórios digitais
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          Explore conceitos matemáticos com simulações, representações visuais,
          manipulação interativa, desafios e relatórios pedagógicos.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {labs.map((lab) => (
            <article
              key={lab.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl font-black text-blue-700">
                  {lab.icon}
                </div>

                <span
                  className={
                    lab.status === "Novo"
                      ? "rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700"
                      : "rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700"
                  }
                >
                  {lab.status}
                </span>
              </div>

              <p className="mt-5 text-sm font-black uppercase tracking-wide text-blue-700">
                {lab.area}
              </p>

              <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">
                {lab.title}
              </h2>

              <p className="mt-4 min-h-[112px] leading-7 text-slate-600">
                {lab.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={lab.href}
                  className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Abrir laboratório
                </Link>

                <a
                  href={lab.href}
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
