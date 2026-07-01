import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AlunoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-4xl font-black text-slate-950">Área do Aluno</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Em breve: missões, XP, medalhas, avatar e progresso por habilidade.
        </p>
      </main>
      <Footer />
    </>
  );
}
