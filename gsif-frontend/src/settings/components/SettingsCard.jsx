import React from "react";

export function SettingsCard({ children, className = "", interactive = false }) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white shadow-sm",
        "border-slate-200 dark:border-white/10 dark:bg-[#0b100d] dark:shadow-none",
        interactive
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none dark:hover:border-[#00ff88]/30"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * A standard settings row: leading icon chip, label + helper text and a
 * trailing control (toggle, button, badge…). Renders a divider when stacked.
 */
export function Row({ icon: Icon, title, description, children, divider = false }) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 px-4 py-4 sm:px-5",
        divider ? "border-t border-slate-100 dark:border-white/5" : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
            {title}
          </p>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
