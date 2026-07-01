type ModuleCardProps = {
  title: string;
  description: string;
  emoji: string;
};

export function ModuleCard({ title, description, emoji }: ModuleCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="text-4xl">{emoji}</div>
      <h3 className="mt-4 text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
    </div>
  );
}
