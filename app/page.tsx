import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const destaques = [
  {
    title: "Jogos educativos",
    description:
      "Aventuras, desafios e revisões para aprender Matemática de forma dinâmica.",
    href: "/play",
    emoji: "🎮",
  },
  {
    title: "Laboratórios digitais",
    description:
      "Ambientes interativos para visualizar, testar e compreender conceitos matemáticos.",
    href: "/labs",
    emoji: "🧪",
  },
  {
    title: "Atividades pedagógicas",
    description:
      "Materiais para imprimir, revisar, colorir, aplicar e acompanhar habilidades.",
    href: "/atividades",
    emoji: "📝",
  },
  {
    title: "Escolas",
    description:
      "Sistemas pedagógicos e painéis para apoiar a leitura de dados educacionais.",
    href: "/escolas",
    emoji: "🏫",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              A plataforma DIASMATH™ está nascendo
            </p>

            <h1 className="mt-6 text-5xl font-black leading-tight text-slate-950 md:text-6xl">
              Aprender Matemática nunca foi tão interativo.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Jogos, laboratórios digitais, atividades e ferramentas para
              professores, estudantes e escolas transformarem a aprendizagem
              matemática com tecnologia, criatividade e dados.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Explorar jogos
              </Link>

              <Link
                href="/labs"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:border-blue-600 hover:text-blue-700"
              >
                Conhecer laboratórios
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
            <div className="rounded-[1.5rem] bg-slate-950 p-8 text-white">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                Plataforma educacional
              </span>

              <h2 className="mt-6 text-3xl font-black">
                DIASMATH™
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Aprender, explorar e transformar a Matemática com recursos digitais,
                investigação, dados pedagógicos e experiências interativas.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Foco</p>
                  <p className="font-black">Ensino e aprendizagem de Matemática</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Recursos</p>
                  <p className="font-black">Jogos, labs, atividades e sistemas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <h2 className="text-3xl font-black text-slate-950">
              Explore a plataforma
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {destaques.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="text-5xl" aria-hidden="true">
                    {item.emoji}
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
