import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Bell,
  Eye,
  Palette,
  Link2,
  Ban,
  HelpCircle,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react";

import AccountSettings from "./sections/AccountSettings";
import SecuritySettings from "./sections/SecuritySettings";
import NotificationSettings from "./sections/NotificationSettings";
import PrivacySettings from "./sections/PrivacySettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import ConnectedAccounts from "./sections/ConnectedAccounts";
import BlockedUsers from "./sections/BlockedUsers";
import HelpSupport from "./sections/HelpSupport";
import DangerZone from "./sections/DangerZone";

import ConfirmModal from "./components/ConfirmModal";
import { logout, clearAuthData } from "./services/settingsService";

const NAV = [
  {
    heading: "Account",
    items: [
      { id: "account", label: "Account", icon: User, Component: AccountSettings },
      { id: "security", label: "Security", icon: ShieldCheck, Component: SecuritySettings },
      { id: "notifications", label: "Notifications", icon: Bell, Component: NotificationSettings },
      { id: "privacy", label: "Privacy", icon: Eye, Component: PrivacySettings },
    ],
  },
  {
    heading: "Preferences",
    items: [
      { id: "appearance", label: "Appearance/Theme", icon: Palette, Component: AppearanceSettings },
      // { id: "connected", label: "Connected accounts", icon: Link2, Component: ConnectedAccounts },
    ],
  },
  {
    heading: "Safety",
    items: [
      { id: "blocked", label: "Blocked users", icon: Ban, Component: BlockedUsers },
      { id: "help", label: "Help & support", icon: HelpCircle, Component: HelpSupport },
      { id: "danger", label: "Account control", icon: AlertOctagon, Component: DangerZone, danger: true },
    ],
  },
];

const FLAT = NAV.flatMap((g) => g.items);

export default function Settings() {
  const navigate = useNavigate();
  const [active, setActive] = useState("account");
  const [showContentMobile, setShowContentMobile] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const tablistRef = useRef(null);

  const activeItem = useMemo(
    () => FLAT.find((i) => i.id === active) || FLAT[0],
    [active],
  );
  const ActiveComponent = activeItem.Component;

  const select = (id) => {
    setActive(id);
    setShowContentMobile(true);
  };

  // Roving keyboard navigation across the vertical tablist.
  const onTablistKeyDown = (e) => {
    const idx = FLAT.findIndex((i) => i.id === active);
    let next = null;
    if (e.key === "ArrowDown") next = (idx + 1) % FLAT.length;
    else if (e.key === "ArrowUp") next = (idx - 1 + FLAT.length) % FLAT.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = FLAT.length - 1;
    if (next === null) return;
    e.preventDefault();
    const id = FLAT[next].id;
    setActive(id);
    const node = tablistRef.current?.querySelector(`#tab-${id}`);
    if (node) node.focus();
  };

  const doLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuthData();
      navigate("/login");
    }
  };

  // Reset panel scroll when switching sections.
  useEffect(() => {
    const el = document.getElementById("settings-panel");
    if (el) el.scrollTop = 0;
  }, [active]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-black dark:text-white">
      {/* ── Sidebar ── */}
      <aside
        className={[
          "w-full flex-col border-r border-slate-200 bg-white md:flex md:w-72 md:shrink-0",
          "dark:border-white/10 dark:bg-[#070d0a]",
          showContentMobile ? "hidden md:flex" : "flex",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 px-5 pb-2 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        </div>

        <nav
          ref={tablistRef}
          role="tablist"
          aria-orientation="vertical"
          aria-label="Settings sections"
          onKeyDown={onTablistKeyDown}
          className="flex-1 overflow-y-auto px-3 py-3"
        >
          {NAV.map((group) => (
            <div key={group.heading} className="mb-2">
              <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                {group.heading}
              </p>
              {group.items.map((item) => {
                const isActive = active === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="settings-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => select(item.id)}
                    className={[
                      "group mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 motion-reduce:transition-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60",
                      isActive
                        ? item.danger
                          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-emerald-50 text-emerald-700 dark:bg-[#00ff88]/10 dark:text-[#00ff88]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      className={
                        isActive ? "" : "opacity-70 group-hover:opacity-100"
                      }
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight
                      size={15}
                      className={[
                        "transition-opacity md:hidden",
                        isActive ? "opacity-60" : "opacity-30",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Content ── */}
      <main
        id="settings-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        className={[
          "flex-1 overflow-y-auto",
          showContentMobile ? "block" : "hidden md:block",
        ].join(" ")}
      >
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
          <button
            type="button"
            onClick={() => setShowContentMobile(false)}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:text-white"
          >
            <ChevronLeft size={16} /> All settings
          </button>

          <div key={active} className="animate-section motion-reduce:animate-none">
            {active === "danger" ? (
              <DangerZone onRequestLogout={() => setLogoutOpen(true)} />
            ) : (
              <ActiveComponent />
            )}
          </div>
        </div>
      </main>

      {/* ── Shared logout confirmation ── */}
      <ConfirmModal
        open={logoutOpen}
        onClose={() => !loggingOut && setLogoutOpen(false)}
        title="Log out?"
        icon={LogOut}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          You'll need to sign in again to get back to your account.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={doLogout}
            disabled={loggingOut}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {loggingOut && <Loader2 size={16} className="animate-spin" />}
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
          <button
            type="button"
            onClick={() => setLogoutOpen(false)}
            disabled={loggingOut}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </ConfirmModal>

      <style>{`
        @keyframes section-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-section { animation: section-in 0.22s ease-out; }
      `}</style>
    </div>
  );
}
