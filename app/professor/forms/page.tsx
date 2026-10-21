
export const metadata = {
  title: "DIASMATH Forms | Professor",
  description:
    "Sistema DIASMATH Forms para professores criarem formulários, questionários, atividades e acompanharem respostas.",
};

export default function DiasmathFormsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <iframe
        src="/professor/forms/index.html"
        title="DIASMATH Forms"
        className="block h-screen h-[100dvh] w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </main>
  );
}
