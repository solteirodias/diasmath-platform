import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const games = [
  {
    title: "Os Guardiões da Multiplicação",
    status: "Em desenvolvimento",
    description: "Jogo de aventura para praticar multiplicação e resolver problemas."
  },
  {
    title: "Guardiões da Divisão",
    status: "Planejado",
    description: "Desafios para desenvolver divisão exata e raciocínio multiplicativo."
  },
  {
    title: "Frações em Ação",
    status: "Planejado",
    description: "Atividades interativas para compreender frações e equivalência."
  }
];

export default function PlayPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-4xl font-black text-slate-950">DiasMath Play</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Jogos educativos para aprender Matemática de forma divertida, significativa e baseada em progresso.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {games.map((game) => (
            <article key={game.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-diasmath-blue">{game.status}</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">{game.title}</h2>
              <p className="mt-3 text-slate-600">{game.description}</p>
              <button className="mt-6 rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white">
                Ver detalhes
              </button>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
