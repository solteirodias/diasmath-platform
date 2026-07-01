import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModuleCard } from "@/components/ModuleCard";

const modules = [
  {
    title: "DiasMath Play",
    emoji: "🎮",
    description: "Jogos educativos para desenvolver habilidades matemáticas com diversão e propósito."
  },
  {
    title: "DiasMath Labs",
    emoji: "🧪",
    description: "Laboratórios digitais para explorar conceitos, manipular objetos e visualizar ideias matemáticas."
  },
  {
    title: "Área do Professor",
    emoji: "👨‍🏫",
    description: "Crie turmas, envie atividades e acompanhe a evolução dos estudantes."
  },
  {
    title: "Área do Aluno",
    emoji: "🎓",
    description: "Uma jornada gamificada com missões, XP, medalhas e progresso por habilidade."
  }
];

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-diasmath-blue">
                DiasMath Play já começou
              </p>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Tecnologia educacional para transformar o ensino da Matemática.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-700">
                Jogos, laboratórios digitais e ferramentas para professores, estudantes e escolas.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/play"
                  className="rounded-full bg-diasmath-blue px-7 py-3 text-center font-bold text-white shadow-sm hover:opacity-90"
                >
                  Explorar jogos
                </Link>
                <Link
                  href="/labs"
                  className="rounded-full border border-slate-300 bg-white px-7 py-3 text-center font-bold text-slate-900 hover:bg-slate-50"
                >
                  Conhecer laboratórios
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <p className="text-sm text-blue-200">Primeiro jogo</p>
                <h2 className="mt-3 text-3xl font-black">Os Guardiões da Multiplicação</h2>
                <p className="mt-4 text-slate-300">
                  Uma aventura para aprender tabuada, resolver problemas e conquistar medalhas.
                </p>
                <div className="mt-6 rounded-2xl bg-white/10 p-4">
                  <p>XP: 0</p>
                  <p>Medalhas: em breve</p>
                  <p>Status: em desenvolvimento</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-3xl font-black text-slate-950">Módulos da plataforma</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            A DIASMATH nasce como uma plataforma modular, preparada para crescer com jogos, laboratórios e acompanhamento pedagógico.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
