import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactEmailBox } from "@/components/ContactEmailBox";

export const metadata = {
  title: "Contato | DIASMATH™",
  description:
    "Entre em contato com a DIASMATH™ para sugestões, necessidades pedagógicas, relatos de erro e parcerias.",
};

export default function ContatoPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-14">
        <p className="font-bold text-blue-700">DIASMATH™ Contato</p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Fale com a DIASMATH™
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Envie sugestões, necessidades pedagógicas, ideias para novos apps ou relatos de erro.
        </p>

        <div className="mt-10">
          <ContactEmailBox />
        </div>
      </main>

      <Footer />
    </>
  );
}
