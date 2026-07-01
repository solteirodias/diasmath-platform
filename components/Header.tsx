import Link from "next/link";

const links = [
  { href: "/play", label: "Jogos" },
  { href: "/labs", label: "Labs" },
  { href: "/professor", label: "Professor" },
  { href: "/aluno", label: "Aluno" },
  { href: "/escolas", label: "Escolas" },
  { href: "/planos", label: "Planos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight text-diasmath-blue">
          DIASMATH
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-diasmath-blue">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="rounded-full bg-diasmath-blue px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
