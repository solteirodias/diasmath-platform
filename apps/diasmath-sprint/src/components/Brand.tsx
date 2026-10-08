import { Link } from "@tanstack/react-router";
import sprintLogo from "@/assets/diasmath-sprint-logo.webp.asset.json";

export function LogoMark({ className = "size-12" }: { className?: string }) {
  return <img src={sprintLogo.url} alt="Logotipo DIASMATH Sprint" width={512} height={512} className={`shrink-0 object-contain rounded-lg ${className}`} />;
}

export function Logo({ sub }: { sub?: string | undefined }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <LogoMark />
      <div className="leading-tight">
        <div className="font-display text-lg">DIASMATH <span className="block text-brand">Sprint</span></div>
        {sub && <div className="text-[11px] uppercase text-ash font-semibold">{sub}</div>}
      </div>
    </div>
  );
}

export function Brand({ sub }: { sub?: string | undefined }) {
  return <Link to="/" aria-label="DIASMATH Sprint — início"><Logo sub={sub} /></Link>;
}

export function TopBar({ children, sub }: { children?: React.ReactNode; sub?: string }) {
  return (
    <div className="sticky top-0 z-30 bg-ink text-paper border-b border-paper/10">
      <div className="max-w-[1440px] mx-auto px-6 h-18 py-3 flex items-center justify-between gap-4">
        <Brand sub={sub} />
        <div className="flex items-center gap-4">{children}</div>
      </div>
    </div>
  );
}