import { useCallback, useState } from "react";

/**
 * Persists a JSON-serialisable preference in localStorage.
 *
 * Used for client-side preferences that don't yet have a dedicated backend
 * endpoint (notification toggles, privacy toggles, language). Keeping them
 * here means the controls genuinely work and survive a reload, and swapping
 * in a real API later only touches this hook's setter.
 */
const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export default function useLocalSetting(key, fallback) {
  const storageKey = `gsif.settings.${key}`;
  const [value, setValue] = useState(() => read(storageKey, fallback));

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          localStorage.setItem(storageKey, JSON.stringify(resolved));
        } catch {
          /* storage may be unavailable; keep in-memory value */
        }
        return resolved;
      });
    },
    [storageKey],
  );

  return [value, update];
}
