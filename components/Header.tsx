import Link from "next/link";

const navItems = [
  { href: "/play", label: "Jogos" },
  { href: "/labs", label: "Labs" },
  { href: "/atividades", label: "Atividades" },
  { href: "/professor", label: "Professor" },
  { href: "/aluno", label: "Aluno" },
  { href: "/escolas", label: "Escolas" },
  { href: "/planos", label: "Planos" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Página inicial DIASMATH">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-sm">
            ↗
          </div>

          <div className="leading-tight">
            <p className="text-xl font-black tracking-tight text-slate-950">
              DIAS<span className="text-blue-600">MATH</span><sup className="text-[10px]">™</sup>
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
              Aprender • Explorar • Transformar
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-700 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-blue-700">
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://wa.me/5589999877193?text=Ol%C3%A1%2C%20DIASMATH!"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 sm:inline-flex"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}
