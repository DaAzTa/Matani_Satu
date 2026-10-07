import { formatAngka } from "../utils/penduduk";

export default function StatCard({ icon: Icon, label, value, note, tone = "primary" }) {
  const tones = {
    primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="card p-5 flex items-start gap-4">
      <span className={`h-11 w-11 shrink-0 rounded-xl grid place-items-center ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold tabular-nums mt-0.5">
          {value === undefined ? <span className="skeleton inline-block h-7 w-16" /> : formatAngka(value)}
        </p>
        {note && <p className="text-xs text-[var(--text-muted)] mt-0.5">{note}</p>}
      </div>
    </div>
  );
}
