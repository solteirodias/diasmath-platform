import Link from "next/link";

const links = [
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Página inicial da DIASMATH">
          <img
            src="/brand/diasmath-icon.svg"
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl"
          />

          <div className="min-w-0 leading-none">
            <span className="block text-xl font-black tracking-tight text-slate-950">
              DIAS<span className="text-blue-600">MATH</span>
              <sup className="ml-0.5 align-super text-xs font-black">™</sup>
            </span>
            <span className="mt-1 hidden text-[9px] font-bold tracking-[0.14em] text-slate-500 sm:block">
              APRENDER • EXPLORAR • TRANSFORMAR
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-700 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-blue-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href="mailto:contato@diasmath.com.br"
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          Entrar em contato
        </a>
      </div>
    </header>
  );
}
