import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  HelpCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard } from "../components/SettingsCard";

function LinkRow({ icon, title, description, onClick, external, divider }) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00ff88]/60 sm:px-5 dark:hover:bg-white/5",
        divider ? "border-t border-slate-100 dark:border-white/5" : "",
      ].join(" ")}
    >
      <span className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:text-emerald-600 dark:bg-white/5 dark:text-slate-300 dark:group-hover:text-[#00ff88]">
          <Icon size={16} />
        </span>
        <span>
          <span className="block text-sm font-medium text-slate-900 dark:text-white">
            {title}
          </span>
          {description && (
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </span>
      </span>
      {external ? (
        <ExternalLink size={16} className="text-slate-400" />
      ) : (
        <ChevronRight
          size={18}
          className="text-slate-400 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
        />
      )}
    </button>
  );
}

export default function HelpSupport() {
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeader
        title="Help & support"
        description="Get answers, reach the team, and review our policies."
      />

      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Support
      </p>
      <SettingsCard>
        <LinkRow
          icon={Mail}
          title="Contact support"
          description="Email us and we'll get back to you"
          external
          onClick={() =>
            (window.location.href = "mailto:support@sasedge.org")
          }
        />
        <LinkRow
          icon={HelpCircle}
          title="Frequently asked questions"
          description="Browse common questions and answers"
          divider
          onClick={() => navigate("/terms")}
        />
      </SettingsCard>

      <p className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Legal
      </p>
      <SettingsCard>
        <LinkRow
          icon={ShieldCheck}
          title="Privacy Policy"
          description="How we handle your data"
          onClick={() => navigate("/privacy")}
        />
        <LinkRow
          icon={FileText}
          title="Terms & Conditions"
          description="The rules for using the network"
          divider
          onClick={() => navigate("/terms")}
        />
      </SettingsCard>
    </div>
  );
}
