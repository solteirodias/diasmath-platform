import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ProfessorPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-4xl font-black text-slate-950">Área do Professor</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Em breve: criação de turmas, envio de atividades, acompanhamento de desempenho e relatórios.
        </p>
      </main>
      <Footer />
    </>
  );
}
