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
          <img
            src="/brand/diasmath-icon.png"
            alt="Logo DIASMATH"
            className="h-12 w-12 shrink-0 rounded-2xl object-contain shadow-sm"
          />

          <div className="leading-none">
            <p className="text-xl font-black tracking-tight text-slate-950">
              DIAS<span className="text-blue-600">MATH</span>
              <sup className="ml-0.5 align-super text-xs font-black">™</sup>
            </p>
            <p className="mt-1 hidden text-[9px] font-bold tracking-[0.14em] text-slate-500 sm:block">
              APRENDER • EXPLORAR • TRANSFORMAR
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-700 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-blue-700">
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://wa.me/5589999877193?text=Ol%C3%A1%2C%20DIASMATH%21%20Tenho%20uma%20sugest%C3%A3o."
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
