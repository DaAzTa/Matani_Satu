export default function FullPageLoader({ label = "Memuat…" }) {
  return (
    <div className="min-h-screen grid place-items-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
        <span className="h-9 w-9 rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)] animate-spin" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
