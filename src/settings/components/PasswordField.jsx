import React, { useState } from "react";
import { Eye, EyeOff, ArrowUpToLine } from "lucide-react";

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  autoComplete = "off",
  error = false,
}) {
  const [visible, setVisible] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const handleKey = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onKeyUp={handleKey}
          onKeyDown={handleKey}
          onBlur={() => setCapsOn(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error}
          className={[
            "w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none",
            "placeholder:text-slate-400 transition-colors",
            "dark:bg-[#0a120e] dark:text-white dark:placeholder:text-slate-600",
            "focus:border-[#00c46a] focus:ring-2 focus:ring-[#00c46a]/20 dark:focus:border-[#00ff88]/60 dark:focus:ring-[#00ff88]/15",
            error
              ? "border-red-400 dark:border-red-500/50"
              : "border-slate-200 dark:border-white/10",
          ].join(" ")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:hover:text-slate-200"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {capsOn && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          <ArrowUpToLine size={12} aria-hidden="true" />
          Caps Lock is on
        </p>
      )}
    </div>
  );
}
