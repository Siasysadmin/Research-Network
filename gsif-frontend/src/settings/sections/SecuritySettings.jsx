import React, { useState } from "react";
import { ShieldCheck, KeyRound, CheckCircle2, Loader2 } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard, Row } from "../components/SettingsCard";
import PasswordField from "../components/PasswordField";
import StrengthMeter from "../components/StrengthMeter";
import usePasswordStrength from "../hooks/usePasswordStrength";
import { changePassword } from "../services/settingsService";

const emptyForm = {
  old_password: "",
  new_password: "",
  confirm_password: "",
};

export default function SecuritySettings() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = usePasswordStrength(form.new_password);
  const mismatch =
    form.confirm_password.length > 0 &&
    form.new_password !== form.confirm_password;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (msg.text) setMsg({ text: "", type: "" });
  };

  const reset = () => {
    setOpen(false);
    setForm(emptyForm);
    setMsg({ text: "", type: "" });
    setDone(false);
  };

  const handleSubmit = async () => {
    const { old_password, new_password, confirm_password } = form;

    // Validation gates preserved from the original implementation.
    if (!old_password || !new_password || !confirm_password) {
      return setMsg({ text: "Please fill in every field.", type: "error" });
    }
    if (new_password !== confirm_password) {
      return setMsg({ text: "New passwords don't match.", type: "error" });
    }
    if (new_password.length < 6) {
      return setMsg({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
    }

    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      const data = await changePassword(form);
      if (data.status) {
        setDone(true);
        setMsg({ text: data.message || "Password updated.", type: "success" });
        setTimeout(reset, 1800);
      } else {
        setMsg({ text: data.message || "Something went wrong.", type: "error" });
      }
    } catch {
      setMsg({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Security"
        description="Keep your account safe by using a strong, unique password."
      />

      <SettingsCard>
        <Row
          icon={KeyRound}
          title="Password"
          description="Last changed a while ago"
        >
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              Change
            </button>
          )}
        </Row>

        {open && (
          <div className="space-y-4 border-t border-slate-100 px-4 py-5 sm:px-5 dark:border-white/5">
            <PasswordField
              label="Current password"
              name="old_password"
              value={form.old_password}
              onChange={handleInput}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
            <div>
              <PasswordField
                label="New password"
                name="new_password"
                value={form.new_password}
                onChange={handleInput}
                placeholder="Enter a new password"
                autoComplete="new-password"
              />
              {form.new_password && (
                <div className="mt-3">
                  <StrengthMeter strength={strength} />
                </div>
              )}
            </div>
            <PasswordField
              label="Confirm new password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleInput}
              placeholder="Re-enter the new password"
              autoComplete="new-password"
              error={mismatch}
            />
            {mismatch && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                Passwords don't match yet.
              </p>
            )}

            {msg.text && !done && (
              <p
                className={[
                  "text-sm",
                  msg.type === "success"
                    ? "text-emerald-600 dark:text-[#00ff88]"
                    : "text-red-500 dark:text-red-400",
                ].join(" ")}
              >
                {msg.text}
              </p>
            )}

            {done ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-semibold text-emerald-600 animate-success dark:bg-[#00ff88]/10 dark:text-[#00ff88] motion-reduce:animate-none">
                <CheckCircle2 size={18} />
                Password updated
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:bg-[#00ff88] dark:text-[#04130c] dark:hover:bg-[#2be58a]"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Saving…" : "Save password"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </SettingsCard>

      <SettingsCard className="mt-4">
        <Row
          icon={ShieldCheck}
          title="Two-factor authentication"
          description="Add an extra layer of security at sign-in"
        >
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
            Coming soon
          </span>
        </Row>
      </SettingsCard>

      <style>{`
        @keyframes success-pop {
          0% { opacity: 0; transform: scale(0.96); }
          60% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-success { animation: success-pop 0.32s ease-out; }
      `}</style>
    </div>
  );
}
