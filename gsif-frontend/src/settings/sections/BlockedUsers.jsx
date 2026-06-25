import React, { useEffect, useMemo, useState } from "react";
import { Ban, UserCheck, ChevronLeft, ChevronRight, RotateCw, Loader2 } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { SettingsCard } from "../components/SettingsCard";
import { SearchInput, EmptyState, RowSkeleton } from "../components/Feedback";
import {
  fetchBlockedUsers,
  blockUnblockUser,
  getBlockedUserDisplay,
  getBlockedUserImage,
  getUserInitials,
  getSecondaryInfo,
} from "../services/settingsService";

const PAGE_SIZE = 6;

export default function BlockedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [unblockingId, setUnblockingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBlockedUsers();
      if (data.status) setUsers(data.data || []);
      else setError(data.message || "Couldn't load blocked users.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = getBlockedUserDisplay(u)?.toLowerCase() || "";
      const reg = String(u.registration_id || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      return name.includes(q) || reg.includes(q) || email.includes(q);
    });
  }, [users, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [query]);

  const handleUnblock = async (userId) => {
    setUnblockingId(userId);
    try {
      const data = await blockUnblockUser(userId);
      // user_status 1 = unblocked. Fall back to optimistic removal otherwise.
      if (data.status) setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Unblock error:", err);
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Blocked users"
        description="People you've blocked can't view your profile or contact you."
        action={
          <button
            type="button"
            onClick={load}
            aria-label="Refresh list"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <RotateCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {users.length > 0 && (
        <div className="mb-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name, ID or email"
          />
        </div>
      )}

      {loading ? (
        <SettingsCard>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={i > 0 ? "border-t border-slate-100 dark:border-white/5" : ""}>
              <RowSkeleton />
            </div>
          ))}
        </SettingsCard>
      ) : error ? (
        <EmptyState
          icon={Ban}
          title="Something went wrong"
          description={error}
          action={
            <button
              type="button"
              onClick={load}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
            >
              Try again
            </button>
          }
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No one is blocked"
          description="When you block someone, they'll appear here so you can manage them."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Ban}
          title="No matches"
          description={`Nothing matches "${query}".`}
        />
      ) : (
        <>
          <SettingsCard>
            {pageItems.map((u, i) => {
              const img = getBlockedUserImage(u);
              const busy = unblockingId === u.id;
              return (
                <div
                  key={u.id}
                  className={[
                    "flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:px-5 dark:hover:bg-white/5",
                    i > 0 ? "border-t border-slate-100 dark:border-white/5" : "",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-300">
                        {getUserInitials(u)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium capitalize text-slate-900 dark:text-white">
                        {getBlockedUserDisplay(u)}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {getSecondaryInfo(u) || u.email || "—"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnblock(u.id)}
                    disabled={busy}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:text-emerald-600 active:scale-95 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:border-white/10 dark:text-slate-200 dark:hover:border-[#00ff88]/50 dark:hover:text-[#00ff88]"
                  >
                    {busy ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <UserCheck size={13} />
                    )}
                    {busy ? "Unblocking" : "Unblock"}
                  </button>
                </div>
              );
            })}
          </SettingsCard>

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page {safePage} of {pageCount} · {filtered.length} blocked
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  aria-label="Previous page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={safePage === pageCount}
                  aria-label="Next page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
