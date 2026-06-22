import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Accessible modal dialog.
 *  - Closes on Escape and backdrop click
 *  - Moves focus into the dialog on open and restores it on close
 *  - role="dialog" + aria-modal + labelled by the title
 */
export default function ConfirmModal({
  open,
  onClose,
  title,
  icon: Icon,
  tone = "default", // "default" | "danger"
  children,
}) {
  const dialogRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    const node = dialogRef.current;
    if (node) node.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (lastFocused.current && lastFocused.current.focus) {
        lastFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const accent =
    tone === "danger"
      ? "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
      : "bg-emerald-50 text-emerald-600 dark:bg-[#00ff88]/10 dark:text-[#00ff88]";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/70"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-md animate-modal-in rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none dark:border-white/10 dark:bg-[#0b100d] motion-reduce:animate-none"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent}`}>
                <Icon size={18} aria-hidden="true" />
              </span>
            )}
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 pb-5 pt-4">{children}</div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-modal-in { animation: modal-in 0.18s ease-out; }
      `}</style>
    </div>
  );
}
