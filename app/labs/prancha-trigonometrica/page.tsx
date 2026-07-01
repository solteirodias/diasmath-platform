import Link from "next/link";

export const metadata = {
  title: "Prancha Trigonométrica | DIASMATH",
  description: "Laboratório digital para explorar ciclo trigonométrico, seno, cosseno e tangente."
};

export default function PranchaTrigonometricaPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-950 px-4">
        <Link href="/labs" className="font-black text-white">
          ← DIASMATH Labs
        </Link>

        <div className="text-center">
          <p className="text-sm font-bold">Prancha Trigonométrica</p>
        </div>

        <a
          href="/labs/prancha-trigonometrica/index.html"
          target="_blank"
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Tela cheia
        </a>
      </div>

      <iframe
        src="/labs/prancha-trigonometrica/index.html"
        title="Prancha Trigonométrica"
        className="h-[calc(100vh-56px)] w-full border-0"
        allow="fullscreen"
      />
    </main>
  );
}
