import React from "react";

/**
 * Segmented control. `options` is [{ value, label, icon }].
 * Implemented as a radiogroup for keyboard + screen-reader support.
 */
export default function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 dark:border-white/10 dark:bg-[#0a120e]"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={[
              "flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-sm font-medium transition-all duration-200 motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60",
              active
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-emerald-500/30 dark:bg-white/10 dark:text-white dark:ring-[#00ff88]/40"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
            ].join(" ")}
          >
            {Icon && <Icon size={20} aria-hidden="true" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
