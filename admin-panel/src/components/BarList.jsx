// Daftar batang horizontal sederhana (tanpa library chart).
import { formatAngka } from "../utils/penduduk";

export default function BarList({ items }) {
  const max = Math.max(1, ...items.map((i) => i.value || 0));
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--text-muted)]">{i.label}</span>
            <span className="font-semibold tabular-nums">{formatAngka(i.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-alt)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-700"
              style={{ width: `${((i.value || 0) / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
