import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Contato | DIASMATH™",
  description: "Entre em contato com a DIASMATH™ para sugestões, necessidades pedagógicas, relatos de erro e parcerias.",
};

export default function ContatoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-14">
        <p className="font-bold text-blue-700">DIASMATH™ Contato</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Fale com a DIASMATH™</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Envie sugestões, necessidades pedagógicas, ideias para novos apps ou relatos de erro.
        </p>
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">Canais oficiais</h2>
          <p className="mt-3 leading-7 text-slate-600">Para contato direto, use o WhatsApp ou o e-mail oficial da plataforma.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="https://wa.me/5589999877193?text=Ol%C3%A1%2C%20DIASMATH%21%20Tenho%20uma%20sugest%C3%A3o%20ou%20necessidade%20pedag%C3%B3gica." target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-600 px-6 py-3 text-sm font-black text-white transition hover:bg-green-700">
              WhatsApp (89) 99987-7193
            </a>
            <a href="mailto:contato@diasmath.com.br" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700">
              contato@diasmath.com.br
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
