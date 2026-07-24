import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-sm text-slate-600 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-black text-slate-950">DIASMATH™</p>

          <p className="mt-3 max-w-xl leading-7">
            Jogos, laboratórios digitais e atividades pedagógicas para transformar
            a aprendizagem da Matemática com tecnologia, criatividade e dados.
          </p>

          <p className="mt-5 font-semibold text-slate-900">
            © 2026 Francisco Vieira Dias — DIASMATH™. Todos os direitos reservados.
          </p>

          <p className="mt-2 text-xs text-slate-500">
            DIASMATH™ é marca em processo de registro junto ao INPI.
          </p>
        </div>

        <div>
          <p className="font-black text-slate-950">Navegação</p>
          <div className="mt-3 grid gap-2">
            <Link href="/play" className="hover:text-blue-700">Jogos</Link>
            <Link href="/labs" className="hover:text-blue-700">Labs</Link>
            <Link href="/atividades" className="hover:text-blue-700">Atividades</Link>
            <Link href="/contato" className="hover:text-blue-700">Contato</Link>
          </div>
        </div>

        <div>
          <p className="font-black text-slate-950">Contato</p>
          <p className="mt-3 leading-7">
            Para dúvidas, sugestões, parcerias ou suporte:
          </p>

          <a
            href="mailto:contato@diasmath.com.br"
            className="mt-3 inline-flex font-black text-blue-700 hover:text-blue-900"
          >
            contato@diasmath.com.br
          </a>
        </div>
      </div>
    </footer>
  );
}
