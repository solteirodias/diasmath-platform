import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Contato | DIASMATH™",
  description:
    "Entre em contato com a DIASMATH™ para dúvidas, sugestões, parcerias e suporte.",
};

export default function ContatoPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="font-bold text-blue-700">DIASMATH™ Contato</p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Fale com a DIASMATH™
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Para dúvidas, sugestões, parcerias, suporte ou envio de materiais,
          utilize o e-mail oficial da plataforma.
        </p>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              E-mail oficial
            </span>

            <h2 className="mt-5 text-3xl font-black text-slate-950">
              contato@diasmath.com.br
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Clique no botão abaixo para abrir seu aplicativo de e-mail e enviar
              uma mensagem diretamente para a DIASMATH™.
            </p>

            <a
              href="mailto:contato@diasmath.com.br?subject=Contato%20pelo%20site%20DIASMATH"
              className="mt-7 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Enviar e-mail
            </a>
          </article>

          <article className="rounded-3xl bg-slate-950 p-8 text-white">
            <h2 className="text-2xl font-black">Canais de atendimento</h2>

            <div className="mt-5 grid gap-4 text-slate-300">
              <div>
                <p className="font-black text-white">Sugestões pedagógicas</p>
                <p className="mt-1 leading-7">
                  Envie ideias para novos jogos, laboratórios e atividades.
                </p>
              </div>

              <div>
                <p className="font-black text-white">Suporte</p>
                <p className="mt-1 leading-7">
                  Relate erros em páginas, jogos ou materiais publicados.
                </p>
              </div>

              <div>
                <p className="font-black text-white">Parcerias</p>
                <p className="mt-1 leading-7">
                  Entre em contato para projetos educacionais, formações e uso da plataforma.
                </p>
              </div>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}
