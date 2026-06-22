import React from "react";
import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "../hooks/usePasswordStrength";

export default function StrengthMeter({ strength }) {
  const { score, label, color, checks } = strength;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex h-1.5 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-full flex-1 rounded-full bg-slate-200 transition-colors duration-300 motion-reduce:transition-none dark:bg-white/10"
              style={i <= score ? { backgroundColor: color } : undefined}
            />
          ))}
        </div>
        {label && (
          <p className="text-xs font-medium" style={{ color }}>
            {label} password
          </p>
        )}
      </div>

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = checks[rule.key];
          return (
            <li
              key={rule.key}
              className={[
                "flex items-center gap-1.5 text-xs transition-colors",
                ok
                  ? "text-emerald-600 dark:text-[#00ff88]"
                  : "text-slate-400 dark:text-slate-500",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full",
                  ok
                    ? "bg-emerald-100 dark:bg-[#00ff88]/15"
                    : "bg-slate-100 dark:bg-white/5",
                ].join(" ")}
              >
                {ok ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
