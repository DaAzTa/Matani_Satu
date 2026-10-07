// src/components/Modal.jsx — dialog generik (Esc / klik latar untuk menutup).
import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, onClose, children, footer, size = "max-w-2xl" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${size} max-h-[92vh] flex flex-col bg-[var(--card)] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[var(--border)]`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 id="modal-title" className="font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="icon-btn" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-[var(--border)] flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
