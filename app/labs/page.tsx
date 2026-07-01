import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function LabsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-4xl font-black text-slate-950">DiasMath Labs</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Laboratórios digitais para investigar, manipular e visualizar conceitos matemáticos.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {["GeoPlan", "AlgePlan", "Função Afim", "Estatística"].map((lab) => (
            <div key={lab} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl">🧪</p>
              <h2 className="mt-3 text-2xl font-black">{lab}</h2>
              <p className="mt-3 text-slate-600">Laboratório digital em planejamento para a versão inicial da DIASMATH.</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
