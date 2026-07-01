import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const games = [
  {
    title: "Os Guardiões da Multiplicação",
    status: "Publicado",
    description: "Aventura educacional com mundos, desafios, fantasmas, bombas de luz, chefão e 91 problemas contextualizados.",
    href: "/play/guardioes-multiplicacao",
    emoji: "🛡️"
  },
  {
    title: "Guardiões da Divisão",
    status: "Planejado",
    description: "Desafios para desenvolver divisão exata e raciocínio multiplicativo.",
    href: "#",
    emoji: "🔑"
  },
  {
    title: "Frações em Ação",
    status: "Planejado",
    description: "Atividades interativas para compreender frações e equivalência.",
    href: "#",
    emoji: "🍕"
  }
];

export default function PlayPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-diasmath-blue">DiasMath Play</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Jogos educativos
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Aprenda Matemática por meio de desafios, missões, XP, medalhas e jogos interativos.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {games.map((game) => (
            <article key={game.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-5xl">{game.emoji}</div>
              <p className="mt-5 text-sm font-bold text-diasmath-blue">{game.status}</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">{game.title}</h2>
              <p className="mt-3 text-slate-600">{game.description}</p>
              {game.href !== "#" ? (
                <Link href={game.href} className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white">
                  Jogar agora
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
