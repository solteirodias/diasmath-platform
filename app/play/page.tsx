import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const games = [
  {
    title: "Os Guardiões da Multiplicação",
    status: "Publicado",
    description:
      "Aventura educacional com mundos, desafios, fantasmas, Bombas de Luz, chefão e problemas contextualizados.",
    href: "/play/guardioes-multiplicacao",
    directHref: "/games/guardioes-multiplicacao/index.html",
    emoji: "🛡️",
    area: "Multiplicação",
    newTab: false,
  },
  {
    title: "Os Guardiões da Divisão",
    status: "Publicado",
    description:
      "Aventura em mundos temáticos, com missões, desafios práticos de divisão, chefes regionais e batalha final.",
    href: "/play/guardioes-divisao",
    directHref: "/games/guardioes-divisao/index.html",
    emoji: "➗",
    area: "Divisão",
    newTab: false,
  },
  {
    title: "DIASMATH™ Arena da Revisão",
    status: "Publicado",
    description:
      "Game de revisão para 5 equipes, com 40 desafios do 5º ano, fases de pensar, responder e compreender, ranking e estatísticas finais.",
    href: "/play/arena-revisao",
    directHref: "/games/arena-revisao/index.html",
    emoji: "🏟️",
    area: "Revisão 5º ano",
    newTab: true,
  },
];

export const metadata = {
  title: "Jogos educativos | DIASMATH™ Play",
  description:
    "Jogos digitais da DIASMATH™ para aprender Matemática por meio de missões, problemas contextualizados e desafios interativos.",
};

export default function PlayPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-diasmath-blue">DIASMATH™ Play</p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Jogos educativos
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Aprenda Matemática por meio de desafios, missões, problemas
          contextualizados, conquistas e experiências interativas.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <article
              key={game.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-5xl" aria-hidden="true">
                  {game.emoji}
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {game.status}
                </span>
              </div>

              <p className="mt-5 text-sm font-black text-blue-700">
                {game.area}
              </p>

              <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950">
                {game.title}
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {game.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={game.href}
                  className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Abrir no site
                </Link>

                <a
                  href={game.directHref}
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
