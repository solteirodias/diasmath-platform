import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ModuleCard } from "@/components/ModuleCard";

const modules = [
  {
    title: "DiasMath Play",
    emoji: "🎮",
    description: "Jogos educativos para desenvolver habilidades matemáticas com diversão, desafios e progresso."
  },
  {
    title: "DiasMath Labs",
    emoji: "🧪",
    description: "Laboratórios digitais para explorar conceitos, manipular objetos e visualizar ideias matemáticas."
  },
  {
    title: "Área do Professor",
    emoji: "👨‍🏫",
    description: "Crie turmas, envie atividades e acompanhe a evolução dos estudantes com dados claros."
  },
  {
    title: "Área do Aluno",
    emoji: "🎓",
    description: "Uma jornada gamificada com missões, XP, medalhas, conquistas e progresso por habilidade."
  }
];

const highlights = [
  "Jogos alinhados à aprendizagem",
  "Laboratórios digitais interativos",
  "Relatórios para professores",
  "Experiência gamificada para alunos"
];

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-green-200/50 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-24">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-diasmath-blue">
                A plataforma DIASMATH está nascendo
              </p>

              <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Aprender Matemática nunca foi tão interativo.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-700">
                Jogos, laboratórios digitais e ferramentas para professores, estudantes e escolas transformarem a aprendizagem matemática com tecnologia, criatividade e dados.
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

              <div className="mt-8 grid gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-diasmath-green" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl">
              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-blue-100">
                    Primeiro jogo
                  </p>
                  <img src="/brand/diasmath-icon.svg" alt="" className="h-10 w-10 rounded-xl" />
                </div>

                <h2 className="mt-6 text-3xl font-black">
                  Os Guardiões da Multiplicação
                </h2>

                <p className="mt-4 text-slate-300">
                  Uma aventura para aprender tabuada, resolver problemas, vencer desafios e conquistar medalhas.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-slate-300">Status</p>
                    <p className="font-bold">Em desenvolvimento</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-slate-300">Foco pedagógico</p>
                    <p className="font-bold">Multiplicação e resolução de problemas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-slate-950">
              Um ecossistema para ensinar, jogar e explorar Matemática
            </h2>
            <p className="mt-3 text-slate-600">
              A DIASMATH nasce modular, preparada para crescer com jogos, laboratórios, painéis pedagógicos e experiências digitais para escolas brasileiras.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>

        <section className="bg-slate-950 px-6 py-16 text-white">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black">
              Tecnologia educacional com propósito pedagógico.
            </h2>
            <p className="mt-4 max-w-3xl text-slate-300">
              A DIASMATH será construída para apoiar professores, engajar estudantes e gerar evidências de aprendizagem a partir de jogos e laboratórios digitais.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
