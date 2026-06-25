import React, { useEffect } from "react";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard } from "../components/SettingsCard";
import Segmented from "../components/Segmented";
import useLocalSetting from "../hooks/useLocalSetting";
import { useTheme } from "../../context/ThemeContext";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: MonitorSmartphone },
];

const systemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export default function AppearanceSettings() {
  const { isDark, toggleTheme } = useTheme();
  const [pref, setPref] = useLocalSetting("appearance", isDark ? "dark" : "light");

  const desiredDark = pref === "system" ? systemPrefersDark() : pref === "dark";

  // Reconcile the existing ThemeContext (which only exposes a toggle) with the
  // chosen preference, without changing the context's public API.
  useEffect(() => {
    if (isDark !== desiredDark) toggleTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pref, desiredDark]);

  // Follow the OS when "system" is selected.
  useEffect(() => {
    if (pref !== "system" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (isDark !== mq.matches) toggleTheme();
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pref, isDark]);

  return (
    <div>
      <SectionHeader
        title="Appearance/Theme"
        description="Pick a theme. System follows your device automatically."
      />

      <Segmented
        options={OPTIONS}
        value={pref}
        onChange={setPref}
        ariaLabel="Theme"
      />

      <p className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Preview
      </p>
      <SettingsCard className="overflow-hidden">
        <div className="p-4">
          <div
            className={[
              "rounded-xl border p-4 transition-colors duration-300 motion-reduce:transition-none",
              desiredDark
                ? "border-white/10 bg-[#0a120e]"
                : "border-slate-200 bg-white",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <div className="flex-1 space-y-1.5">
                <div
                  className={[
                    "h-2.5 w-24 rounded-full",
                    desiredDark ? "bg-white/30" : "bg-slate-300",
                  ].join(" ")}
                />
                <div
                  className={[
                    "h-2 w-16 rounded-full",
                    desiredDark ? "bg-white/15" : "bg-slate-200",
                  ].join(" ")}
                />
              </div>
              <div className="h-7 w-16 rounded-full bg-[#00c46a] dark:bg-[#00ff88]" />
            </div>
            <div className="mt-4 space-y-2">
              <div
                className={[
                  "h-2 w-full rounded-full",
                  desiredDark ? "bg-white/10" : "bg-slate-100",
                ].join(" ")}
              />
              <div
                className={[
                  "h-2 w-4/5 rounded-full",
                  desiredDark ? "bg-white/10" : "bg-slate-100",
                ].join(" ")}
              />
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
