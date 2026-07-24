import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contato | DIASMATH™",
  description:
    "Entre em contato com a DIASMATH™ para dúvidas, sugestões, parcerias, necessidades pedagógicas e suporte.",
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
          Envie sugestões, relate dificuldades, indique o que você está precisando
          para suas aulas ou proponha novas ideias de jogos, laboratórios e atividades.
        </p>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <ContactForm />

          <div className="grid gap-6">
            <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                WhatsApp oficial
              </span>

              <h2 className="mt-5 text-3xl font-black text-slate-950">
                (89) 99987-7193
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Use o WhatsApp para enviar sugestões rápidas, necessidades pedagógicas,
                ideias para novos apps ou relatos de erro.
              </p>

              <a
                href="https://wa.me/5589999877193?text=Ol%C3%A1%2C%20DIASMATH%21%20Tenho%20uma%20sugest%C3%A3o%20ou%20necessidade%20pedag%C3%B3gica."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-black text-white transition hover:bg-green-700"
              >
                Enviar mensagem no WhatsApp
              </a>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                E-mail oficial
              </span>

              <h2 className="mt-5 text-3xl font-black text-slate-950">
                contato@diasmath.com.br
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Use o formulário ao lado para enviar mensagens por e-mail. Informe seu e-mail
                para que a DIASMATH™ consiga responder, caso necessário.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-slate-950 p-8 text-white">
          <h2 className="text-2xl font-black">O que você pode enviar?</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="font-black">Sugestões</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Ideias para novos jogos, laboratórios, atividades e melhorias.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="font-black">Necessidades</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Conteúdos que professores e estudantes estão precisando trabalhar.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="font-black">Erros encontrados</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Problemas em links, telas, atividades, respostas ou funcionamento.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
