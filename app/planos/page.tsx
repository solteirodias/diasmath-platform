import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const plans = [
  ["Gratuito", "Jogos e laboratórios selecionados."],
  ["Professor", "Turmas, atividades e relatórios."],
  ["Escola", "Gestão institucional e suporte."]
];

export default function PlanosPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="text-4xl font-black text-slate-950">Planos</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map(([name, desc]) => (
            <div key={name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">{name}</h2>
              <p className="mt-3 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
