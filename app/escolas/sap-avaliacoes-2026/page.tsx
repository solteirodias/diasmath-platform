
export const metadata = {
  title: "SAP Avaliações 2026 e ENEM+ | DIASMATH™ Escolas",
  description: "Sistema de Análise Pedagógica: avaliações, Simula+, SAEPI e ENEM+ no mesmo ambiente.",
};

export default function SapAvaliacoes2026Page({
  searchParams,
}: {
  searchParams?: { aba?: string };
}) {
  const src =
    "/escolas/sap-avaliacoes-2026/index.html" +
    (searchParams?.aba === "enem" ? "?aba=enem" : "");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <iframe
        src={src}
        title="SAP Avaliações 2026 e ENEM+"
        className="block h-screen h-[100dvh] w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  );
}
