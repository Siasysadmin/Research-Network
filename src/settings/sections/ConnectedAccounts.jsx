import React from "react";
import { Github, Linkedin, Globe, Link2, Unlink } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard } from "../components/SettingsCard";
import useLocalSetting from "../hooks/useLocalSetting";

// Provider metadata. Connect/disconnect is stored locally for now — there is
// no OAuth backend yet, so this is an honest scaffold rather than a live link.
const PROVIDERS = [
  { key: "google", name: "Google", hint: "Sign in and sync your identity", brand: "#ea4335", Icon: Globe },
  { key: "github", name: "GitHub", hint: "Link your code and contributions", brand: "#6e7681", Icon: Github },
  { key: "linkedin", name: "LinkedIn", hint: "Show your professional profile", brand: "#0a66c2", Icon: Linkedin },
  { key: "orcid", name: "ORCID", hint: "Connect your researcher iD", brand: "#a6ce39", Icon: Link2 },
];

export default function ConnectedAccounts() {
  const [connected, setConnected] = useLocalSetting("connectedAccounts", {
    google: true,
  });

  const toggle = (key) =>
    setConnected((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div>
      <SectionHeader
        title="Connected accounts"
        description="Link external services to enrich your profile."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const { key, name, hint, brand } = provider;
          const Icon = provider.Icon;
          const isConnected = !!connected[key];
          return (
            <SettingsCard key={key} interactive className="p-4">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ backgroundColor: `${brand}1a`, color: brand }}
                >
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {name}
                    </p>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:bg-[#00ff88]/10 dark:text-[#00ff88]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-[#00ff88]" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {hint}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(key)}
                className={[
                  "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60",
                  isConnected
                    ? "border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500 dark:border-white/10 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:text-red-400"
                    : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
                ].join(" ")}
              >
                {isConnected ? <Unlink size={14} /> : <Link2 size={14} />}
                {isConnected ? "Disconnect" : "Connect"}
              </button>
            </SettingsCard>
          );
        })}
      </div>
    </div>
  );
}
