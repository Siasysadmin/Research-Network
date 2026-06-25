import React from "react";

/**
 * Accessible toggle switch. Renders a real checkbox-style control with
 * role="switch", keyboard support (Space/Enter via button) and a smooth,
 * reduced-motion-aware thumb animation.
 */
export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full",
        "transition-colors duration-200 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b100d]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        checked
          ? "bg-[#00c46a] dark:bg-[#00ff88]"
          : "bg-slate-200 dark:bg-white/10",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm",
          "transition-transform duration-200 motion-reduce:transition-none",
          checked ? "translate-x-[22px]" : "translate-x-[2px]",
          checked ? "dark:bg-[#04130c]" : "",
        ].join(" ")}
      />
    </button>
  );
}
