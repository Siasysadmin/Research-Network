import React from "react";
import {
  Mail,
  Phone,
  Building2,
  BookText,
  Trophy,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard, Row } from "../components/SettingsCard";
import Toggle from "../components/Toggle";
import useLocalSetting from "../hooks/useLocalSetting";

const FIELDS = [
  { key: "showEmail", icon: Mail, title: "Show email", description: "Display your email on your profile" },
  { key: "showPhone", icon: Phone, title: "Show phone", description: "Display your phone number" },
 
];

const DEFAULTS = {
  showEmail: false,
  showPhone: false,
  
};

export default function PrivacySettings() {
  const [prefs, setPrefs] = useLocalSetting("privacy", DEFAULTS);
  const set = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <SectionHeader
        title="Privacy"
        description="Control who can see your profile and what it reveals."
      />

      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Visible details
      </p>
      <SettingsCard>
        {FIELDS.map((f, i) => (
          <Row
            key={f.key}
            icon={f.icon}
            title={f.title}
            description={f.description}
            divider={i > 0}
          >
            <Toggle
              checked={!!prefs[f.key]}
              onChange={set(f.key)}
              label={f.title}
            />
          </Row>
        ))}
      </SettingsCard>
    </div>
  );
}
