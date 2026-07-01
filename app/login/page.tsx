import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-2xl font-black text-diasmath-blue">DIASMATH</Link>
        <h1 className="mt-8 text-3xl font-black text-slate-950">Entrar</h1>
        <p className="mt-2 text-slate-600">Login será conectado ao Supabase na próxima etapa.</p>

        <form className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="E-mail" />
          <input className="w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="Senha" type="password" />
          <button className="w-full rounded-full bg-diasmath-blue px-5 py-3 font-bold text-white">
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
