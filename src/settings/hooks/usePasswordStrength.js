import { useMemo } from "react";

/**
 * Analyses a password against a set of named rules and returns a 0-4 score
 * plus the individual checks so the UI can show a live checklist + meter.
 */
export default function usePasswordStrength(password = "") {
  return useMemo(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    const passed = Object.values(checks).filter(Boolean).length;

    // Map the 5 checks onto a 0-4 strength scale.
    let score = 0;
    if (password.length > 0) {
      if (passed <= 2) score = 1;
      else if (passed === 3) score = 2;
      else if (passed === 4) score = 3;
      else score = 4;
    }

    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#00c46a"];

    return {
      checks,
      score,
      label: labels[score],
      color: colors[score],
      // Considered acceptable once the original minimum (length) plus a mix
      // of character classes is met. The backend's own validation is the
      // source of truth; this is purely guidance.
      isStrongEnough: checks.length && passed >= 3,
    };
  }, [password]);
}

export const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters" },
  { key: "uppercase", label: "One uppercase letter" },
  { key: "lowercase", label: "One lowercase letter" },
  { key: "number", label: "One number" },
  { key: "special", label: "One special character" },
];
