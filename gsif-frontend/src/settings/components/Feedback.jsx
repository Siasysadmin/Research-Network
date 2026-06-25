import React from "react";
import { Search } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Search" }) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#00c46a] focus:ring-2 focus:ring-[#00c46a]/20 dark:border-white/10 dark:bg-[#0a120e] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-[#00ff88]/60 dark:focus:ring-[#00ff88]/15"
      />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-white/10">
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
          <Icon size={24} aria-hidden="true" />
        </span>
      )}
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={[
        "animate-pulse rounded-lg bg-slate-200/70 motion-reduce:animate-none dark:bg-white/5",
        className,
      ].join(" ")}
    />
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  );
}
