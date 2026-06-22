import React from "react";
import {
  Mail,
  MessageSquare,
  FlaskConical,
  MessageCircle,
  Megaphone,
  UserPlus,
  Tag,
  Newspaper,
  Bell,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard, Row } from "../components/SettingsCard";
import Toggle from "../components/Toggle";
import useLocalSetting from "../hooks/useLocalSetting";

const GROUPS = [
  {
    title: "Channels",
    items: [
      {
        key: "email",
        icon: Mail,
        title: "Email",
        description: "Updates sent to your inbox",
      },
    ],
  },
  {
    title: "Activity",
    items: [
      {
        key: "research",
        icon: FlaskConical,
        title: "Research updates",
        description: "Status changes on your submissions",
      },
      {
        key: "comments",
        icon: MessageCircle,
        title: "Comments",
        description: "Replies and mentions on your posts",
      },
      {
        key: "connections",
        icon: UserPlus,
        title: "Connection requests",
        description: "When someone wants to connect",
      },
    ],
  },
];

const DEFAULTS = {
  email: true,
  system: true,
  research: true,
  comments: true,
  connections: true,
};

export default function NotificationSettings() {
  const [prefs, setPrefs] = useLocalSetting("notifications", DEFAULTS);

  const set = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <SectionHeader
        title="Notifications"
        description="Choose what we tell you about, and where."
      />

      <div className="space-y-6">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.title}
            </p>
            <SettingsCard>
              {group.items.map((item, i) => (
                <Row
                  key={item.key}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  divider={i > 0}
                >
                  <Toggle
                    checked={!!prefs[item.key]}
                    onChange={set(item.key)}
                    label={`${item.title} notifications`}
                  />
                </Row>
              ))}
            </SettingsCard>
          </div>
        ))}
      </div>
    </div>
  );
}
