import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModuleCard } from "@/components/ModuleCard";

const pillars = [
  {
    title: "Jogar",
    description: "Games educativos que transformam conteúdos matemáticos em desafios, missões e conquistas.",
    emoji: "🎮",
  },
  {
    title: "Explorar",
    description: "Laboratórios digitais para manipular, visualizar e investigar conceitos matemáticos.",
    emoji: "🧪",
  },
  {
    title: "Acompanhar",
    description: "Dados claros para professores identificarem avanços, dificuldades e necessidades de intervenção.",
    emoji: "📊",
  },
  {
    title: "Evoluir",
    description: "Uma jornada gamificada para o aluno perceber seu próprio crescimento.",
    emoji: "🚀",
  },
];

const modules = [
  {
    title: "DiasMath Play",
    emoji: "🎮",
    description: "Jogos educativos alinhados a habilidades matemáticas, com fases, XP, medalhas e desafios."
  },
  {
    title: "DiasMath Labs",
    emoji: "🧪",
    description: "Laboratórios digitais para explorar geometria, álgebra, funções, estatística e probabilidade."
  },
  {
    title: "Professor",
    emoji: "👨‍🏫",
    description: "Criação de turmas, envio de atividades e acompanhamento pedagógico com relatórios simples."
  },
  {
    title: "Aluno",
    emoji: "🎓",
    description: "Missões, progresso por habilidade, conquistas e uma experiência de aprendizagem motivadora."
  }
];

const games = [
  "Os Guardiões da Multiplicação",
  "Guardiões da Divisão",
  "Frações em Ação",
  "GeoMissão",
];

const labs = [
  "GeoPlan",
  "AlgePlan",
  "Função Afim",
  "Estatística Interativa",
];

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="absolute left-[-160px] top-[-160px] h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute bottom-[-180px] right-[-160px] h-96 w-96 rounded-full bg-green-200/50 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
            <div>
              <p className="mb-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-diasmath-blue shadow-sm ring-1 ring-blue-100">
                Plataforma brasileira de Matemática Interativa
              </p>

              <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Aprender Matemática nunca foi tão interativo.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-700">
                A DIASMATH une jogos, laboratórios digitais e recursos pedagógicos para tornar a aprendizagem matemática mais significativa, divertida e orientada por dados.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/play"
                  className="rounded-full bg-diasmath-blue px-7 py-3 text-center font-bold text-white shadow-sm hover:opacity-90"
                >
                  Conhecer os jogos
                </Link>
                <Link
                  href="/professor"
                  className="rounded-full border border-slate-300 bg-white px-7 py-3 text-center font-bold text-slate-900 hover:bg-slate-50"
                >
                  Sou professor
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-diasmath-green" />Jogos educativos</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-diasmath-green" />Laboratórios digitais</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-diasmath-green" />Relatórios pedagógicos</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-diasmath-green" />Experiência gamificada</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-5 -top-5 h-24 w-24 rounded-3xl bg-diasmath-yellow/60 blur-xl" />
              <div className="absolute -bottom-5 -right-5 h-24 w-24 rounded-3xl bg-diasmath-green/30 blur-xl" />

              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl">
                <div className="rounded-3xl bg-slate-950 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-blue-100">
                      Primeiro produto
                    </p>
                    <img src="/brand/diasmath-icon.svg" alt="" className="h-10 w-10 rounded-xl" />
                  </div>

                  <h2 className="mt-6 text-3xl font-black">
                    Os Guardiões da Multiplicação
                  </h2>

                  <p className="mt-4 text-slate-300">
                    Uma aventura matemática para praticar tabuada, resolver problemas e conquistar medalhas.
                  </p>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-slate-300">Foco pedagógico</p>
                      <p className="font-bold">Multiplicação e raciocínio lógico</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-slate-300">Status</p>
                      <p className="font-bold">Em construção na DIASMATH</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-2xl font-black text-diasmath-blue">XP</p>
                    <p className="text-xs text-slate-600">progresso</p>
                  </div>
                  <div className="rounded-2xl bg-green-50 p-4">
                    <p className="text-2xl font-black text-diasmath-green">🏅</p>
                    <p className="text-xs text-slate-600">medalhas</p>
                  </div>
                  <div className="rounded-2xl bg-yellow-50 p-4">
                    <p className="text-2xl font-black text-yellow-600">🎯</p>
                    <p className="text-xs text-slate-600">missões</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="font-bold text-diasmath-blue">Nossa proposta</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
              Quatro pilares para transformar a aprendizagem matemática
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-4xl">{pillar.emoji}</div>
                <h3 className="mt-4 text-xl font-black text-slate-950">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-bold text-diasmath-blue">Ecossistema DIASMATH</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
                Um ambiente para estudantes, professores e escolas
              </h2>
              <p className="mt-4 text-slate-600">
                A plataforma será construída em módulos integrados, começando pelos jogos e laboratórios digitais.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {modules.map((module) => (
                <ModuleCard key={module.title} {...module} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white">
            <p className="font-bold text-blue-200">DiasMath Play</p>
            <h2 className="mt-3 text-3xl font-black">Jogos planejados</h2>
            <div className="mt-6 grid gap-3">
              {games.map((game) => (
                <div key={game} className="rounded-2xl bg-white/10 p-4 font-semibold">
                  {game}
                </div>
              ))}
            </div>
            <Link href="/play" className="mt-6 inline-flex rounded-full bg-white px-5 py-2 font-bold text-slate-950">
              Ver jogos
            </Link>
          </div>

          <div className="rounded-[2rem] bg-blue-50 p-8">
            <p className="font-bold text-diasmath-blue">DiasMath Labs</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Laboratórios digitais</h2>
            <div className="mt-6 grid gap-3">
              {labs.map((lab) => (
                <div key={lab} className="rounded-2xl bg-white p-4 font-semibold text-slate-800 shadow-sm">
                  {lab}
                </div>
              ))}
            </div>
            <Link href="/labs" className="mt-6 inline-flex rounded-full bg-diasmath-blue px-5 py-2 font-bold text-white">
              Ver laboratórios
            </Link>
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-950 to-blue-950 px-6 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-bold text-blue-200">Para professores e escolas</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                Ensinar Matemática com mais evidências, engajamento e criatividade.
              </h2>
              <p className="mt-5 text-slate-300">
                A DIASMATH será desenvolvida para apoiar a prática docente, indicar dificuldades e ampliar as possibilidades de intervenção pedagógica.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl bg-white/10 p-5">
                <h3 className="font-black">Criação de turmas</h3>
                <p className="mt-2 text-sm text-slate-300">Organize estudantes e acompanhe atividades.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <h3 className="font-black">Relatórios simples</h3>
                <p className="mt-2 text-sm text-slate-300">Veja progresso, participação e habilidades em desenvolvimento.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <h3 className="font-black">Intervenção pedagógica</h3>
                <p className="mt-2 text-sm text-slate-300">Use dados para planejar ações em sala de aula.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-3xl font-black text-slate-950 md:text-4xl">
            A DIASMATH está apenas começando.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            O primeiro passo é construir uma plataforma sólida, bonita e funcional. Em seguida, integraremos jogos, laboratórios, login, progresso e relatórios.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/play" className="rounded-full bg-diasmath-blue px-7 py-3 font-bold text-white">
              Começar pelos jogos
            </Link>
            <Link href="/escolas" className="rounded-full border border-slate-300 px-7 py-3 font-bold text-slate-900">
              Conhecer proposta para escolas
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
