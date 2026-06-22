import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard, Row } from "../components/SettingsCard";
import ConfirmModal from "../components/ConfirmModal";
import { deleteAccount, clearAuthData } from "../services/settingsService";

const CONSEQUENCES = [
  "Your profile, publications and connections will be removed.",
  "You'll lose access to messages and saved content.",
  "This action is permanent and cannot be undone.",
];

export default function DangerZone({ onRequestLogout }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [typed, setTyped] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const canDelete = typed.trim().toUpperCase() === "DELETE";

  const handleDelete = async () => {
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      const data = await deleteAccount();
      if (data.status) {
        setMsg({
          text: data.message || "Account deleted.",
          type: "success",
        });
        setTimeout(() => {
          clearAuthData();
          navigate("/login");
        }, 1500);
      } else {
        setMsg({
          text: data.message || "Couldn't delete the account.",
          type: "error",
        });
        setConfirmOpen(false);
      }
    } catch {
      setMsg({ text: "Network error. Please try again.", type: "error" });
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const resetDelete = () => {
    setExpanded(false);
    setTyped("");
    setMsg({ text: "", type: "" });
  };

  return (
    <div>
      <SectionHeader
        title="Account control"
        description="Sign out or permanently close your account."
      />

      <SettingsCard>
        <Row
          icon={LogOut}
          title="Log out"
          description="Sign out of this device"
        >
          <button
            type="button"
            onClick={onRequestLogout}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            Log out
          </button>
        </Row>
      </SettingsCard>

      <div className="mt-4 overflow-hidden rounded-2xl border border-red-200 bg-red-50/50 dark:border-red-500/20 dark:bg-red-500/5">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-500 dark:bg-red-500/15 dark:text-red-400">
              <Trash2 size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Delete account
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Permanently remove your account and all data
              </p>
            </div>
          </div>
          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-full border border-red-300 bg-white px-4 py-1.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-500 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 dark:border-red-500/40 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
            >
              Delete
            </button>
          )}
        </div>

        {expanded && (
          <div className="space-y-4 border-t border-red-200 px-4 py-4 sm:px-5 dark:border-red-500/20">
            <div className="flex items-start gap-2 rounded-xl bg-red-100/60 p-3 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <ul className="space-y-1">
                {CONSEQUENCES.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <label
                htmlFor="delete-confirm"
                className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Type <span className="font-bold text-red-500">DELETE</span> to confirm
              </label>
              <input
                id="delete-confirm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm tracking-wide text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-white/10 dark:bg-[#0a120e] dark:text-white"
              />
            </div>

            {msg.text && msg.type === "error" && (
              <p className="text-xs text-red-500 dark:text-red-400">{msg.text}</p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canDelete}
                onClick={() => setConfirmOpen(true)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
              >
                Delete my account
              </button>
              <button
                type="button"
                onClick={resetDelete}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => !loading && setConfirmOpen(false)}
        title="Delete account permanently?"
        tone="danger"
        icon={AlertTriangle}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This is your final confirmation. Your account and everything in it
          will be erased and cannot be recovered.
        </p>
        {msg.text && msg.type === "success" && (
          <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-[#00ff88]">
            {msg.text}
          </p>
        )}
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Deleting…" : "Yes, delete everything"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
}
