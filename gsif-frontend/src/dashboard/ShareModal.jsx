/**
 * ShareModal.jsx
 *
 * Complete share implementation — modal component + all helper logic.
 * Previously the helpers lived in shareUtils.js; they are now here so
 * the entire share feature lives in a single file.
 *
 * Named exports (helpers used by UserProfile):
 *   handleNativeShare(title, text)
 *   fetchShareData(getAuthToken, setAllUsers, setShareGroups)
 *   sendPost(postId, selectedUserIds, shareGroups, getAuthToken,
 *            setIsShareOpen, setSelectedSharePostId, setSelectedUserIds,
 *            setShareSearchQuery)
 *
 * Default export:
 *   ShareModal  — the user/group picker modal component
 */

import React from "react";
import { toast } from "react-toastify";
import API_CONFIG from "../config/api.config";

/* ─── 1. Native OS share (research posts) ─────────────────────────────── */

/**
 * Exact copy of MainContent's handleShare.
 * Used by ResearchCard in UserProfile.
 */
export const handleNativeShare = async (title, text) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || "Research Insight",
        text: text ? text.substring(0, 100) + "..." : "Check out this research post!",
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  } else {
    alert("Sharing is not supported on this browser. Link copied to clipboard!");
    navigator.clipboard.writeText(window.location.href);
  }
};

/* ─── 2. Fetch users + groups for the share modal ─────────────────────── */

/**
 * Exact copy of MainContent's fetchShareData logic.
 * Fetches /user/get-all-users and /group/get-groups.
 */
export const fetchShareData = async (getAuthToken, setAllUsers, setShareGroups) => {
  try {
    const token = getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    const userRes = await fetch(`${API_CONFIG.BASE_URL}/user/get-all-users`, { headers });
    const userData = await userRes.json();
    setAllUsers(
      userData.data || userData.users || (Array.isArray(userData) ? userData : []),
    );

    try {
      const groupRes = await fetch(`${API_CONFIG.BASE_URL}/group/get-groups`, {
        headers: { "Content-Type": "application/json", ...headers },
      });
      const groupData = await groupRes.json();
      if (groupData.status && Array.isArray(groupData.groups))
        setShareGroups(groupData.groups);
      else if (Array.isArray(groupData.data))
        setShareGroups(groupData.data);
      else if (Array.isArray(groupData))
        setShareGroups(groupData);
    } catch (e) {
      console.error("Groups fetch error:", e);
    }
  } catch (err) {
    console.error("Share data fetch error:", err);
  }
};

/* ─── 3. Send post to selected users/groups ───────────────────────────── */

/**
 * Exact copy of MainContent's handleSendPost logic.
 * Sends POST_SHARE_ID:<postId> via /message/message-send (DM)
 * or /group/group-message-send/<id> (group).
 */
export const sendPost = async (
  postId,
  selectedUserIds,
  shareGroups,
  getAuthToken,
  setIsShareOpen,
  setSelectedSharePostId,
  setSelectedUserIds,
  setShareSearchQuery,
) => {
  if (selectedUserIds.length === 0) {
    toast.error("Please select at least one chat/group to share.");
    return;
  }

  try {
    const token = getAuthToken();
    let successCount = 0;
    let failCount = 0;

    const sharePromises = selectedUserIds.map(async (uid) => {
      const isGroup = shareGroups.some(
        (g) => String(g.group_id || g.id) === String(uid),
      );

      let endpoint = `${API_CONFIG.BASE_URL}/message/message-send`;
      let payload = {
        receiver_id: String(uid),
        type: "text",
        message: `POST_SHARE_ID:${postId}`,
      };

      if (isGroup) {
        endpoint = `${API_CONFIG.BASE_URL}/group/group-message-send/${uid}`;
        payload = { message: `POST_SHARE_ID:${postId}` };
      }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data && (data.status === true || data.status === "true" || data.status === 1)) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    });

    await Promise.all(sharePromises);

    if (successCount > 0) {
      toast.success(`Shared successfully with ${successCount} targets!`);
    } else {
      toast.error("Failed to share post.");
    }

    setIsShareOpen(false);
    setSelectedSharePostId(null);
    setSelectedUserIds([]);
    setShareSearchQuery("");
  } catch (err) {
    toast.error("Something went wrong while sharing.");
  }
};

/* ─── 4. Modal component ──────────────────────────────────────────────── */

/**
 * ShareModal — the user/group picker modal.
 *
 * Props:
 *  isOpen              {boolean}
 *  onClose             {function}
 *  allUsers            {array}
 *  shareGroups         {array}
 *  selectedUserIds     {string[]}
 *  setSelectedUserIds  {function}
 *  shareSearchQuery    {string}
 *  setShareSearchQuery {function}
 *  onSend              {function}
 *  selectedSharePostId {string|number}
 *  avatarFallback      {string}
 */
const ShareModal = ({
  isOpen,
  onClose,
  allUsers,
  shareGroups,
  selectedUserIds,
  setSelectedUserIds,
  shareSearchQuery,
  setShareSearchQuery,
  onSend,
  selectedSharePostId,
  avatarFallback,
}) => {
  if (!isOpen) return null;

  const avatar = avatarFallback;
  // Add this tag right before 'export default ShareModal;' at the bottom of the file
const ScrollbarStyles = () => (
  <style jsx global>{`
    .dark .custom-dark-scrollbar::-webkit-scrollbar {
      width: 6px !important;
    }
    .dark .custom-dark-scrollbar::-webkit-scrollbar-track {
      background: transparent !important;
    }
    .dark .custom-dark-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12) !important;
      border-radius: 9999px !important;
    }
    .dark .custom-dark-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.25) !important;
    }
  `}</style>
);


  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeInScale"
      style={{ zIndex: 999999 }}
      onClick={onClose}
    >
      <ScrollbarStyles />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] h-[550px] flex flex-col rounded-2xl bg-white dark:bg-[#13231a] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 shrink-0">
          <h2 className="text-base font-extrabold text-black dark:text-white uppercase tracking-wide">
            Share Post
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-white dark:bg-[#13231a] border-b border-gray-100 dark:border-white/5 shrink-0">
          <div className="flex items-center bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 transition-all duration-200 focus-within:border-[#00ff88] focus-within:ring-2 focus-within:ring-[#00ff88]/20 dark:focus-within:border-[#32ff99]">
            <span className="material-symbols-outlined text-gray-400 text-[20px] mr-3">
              search
            </span>
            <input
              type="text"
              placeholder="Search users to share..."
              value={shareSearchQuery}
              onChange={(e) => setShareSearchQuery(e.target.value)}
              className="
                w-full
                bg-transparent
                text-sm
                text-black dark:text-white
                placeholder:text-slate-500
                outline-none
                border-none
                focus:outline-none
                focus:ring-0
                shadow-none
              "
            />
            {shareSearchQuery && (
              <button
                onClick={() => setShareSearchQuery("")}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Users / Groups List */}
        {/* Users / Groups List */}
        <div 
          className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-white dark:bg-[#13231a] custom-dark-scrollbar">
          {[
            ...(Array.isArray(allUsers) ? allUsers : [])
              .filter((u) => u && u.user_type !== "institute" && !u.institute_details)
              .map((u) => ({
                ...u,
                displayType: "Individual",
                finalName: u.name || u.username || "No Name",
              })),
            ...(Array.isArray(allUsers) ? allUsers : [])
              .filter((u) => u && (u.user_type === "institute" || u.institute_details))
              .map((i) => ({
                ...i,
                displayType: "Institute",
                finalName: i.institute_details?.institute_name || i.name || "Institute",
              })),
            ...(Array.isArray(shareGroups) ? shareGroups : [])
              .map((g) =>
                g
                  ? {
                      ...g,
                      displayType: "Group",
                      finalName: g.group_name || g.name || "Unnamed Group",
                      finalId: String(g.group_id || g.id || g._id),
                      finalImage: g.profile || g.image || null,
                    }
                  : null,
              )
              .filter(Boolean),
          ]
            .filter((a) =>
              a?.finalName?.toLowerCase().includes(shareSearchQuery.toLowerCase()),
            )
            .map((account) => {
              const uniqueId =
                account.displayType === "Group"
                  ? account.finalId
                  : String(account.id || account._id);
              const isChecked = selectedUserIds.includes(uniqueId);

              let finalAvatar = avatar;
              if (account.profile_image)
                finalAvatar = `${API_CONFIG.BASE_URL}/${account.profile_image}`;
              else if (account.displayType === "Group" && account.finalImage)
                finalAvatar = `${API_CONFIG.BASE_URL}/${account.finalImage}`;

              return (
                <div
                  key={`${account.displayType}-${uniqueId}`}
                  onClick={() =>
                    isChecked
                      ? setSelectedUserIds(selectedUserIds.filter((id) => id !== uniqueId))
                      : setSelectedUserIds([...selectedUserIds, uniqueId])
                  }
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/30 dark:bg-[#00ff88]/10 dark:border-[#00ff88]/20"
                      : "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-[#1e3a2c]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={finalAvatar}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 dark:border-white/5"
                      alt={account.finalName}
                      onError={(e) => { e.target.src = avatar; }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-black dark:text-white truncate max-w-[160px]">
                          {account.finalName}
                        </p>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono uppercase font-bold shrink-0 ${
                            account.displayType === "Institute"
                              ? "bg-blue-500/10 text-blue-500"
                              : account.displayType === "Group"
                                ? "bg-purple-500/10 text-purple-500"
                                : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {account.displayType}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-400 truncate">
                        {account.displayType === "Group"
                          ? `${account.total_members || 0} Members`
                          : account.registration_id || `#${uniqueId}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isChecked ? "text-[#00ff88]" : "text-gray-400"
                    }`}
                  >
                    {isChecked ? "check_box" : "check_box_outline_blank"}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Send Button */}
        {selectedUserIds.length > 0 && (
          <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex items-center justify-between shrink-0">
            <div>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-[#00ff88]">
                {selectedUserIds.length} SELECTED
              </span>
              <span className="block text-[9px] text-gray-400">Ready to share</span>
            </div>
            <button
              onClick={() => onSend(selectedSharePostId)}
              className="w-10 h-10 rounded-full bg-[#00ff88] text-black flex items-center justify-center hover:scale-105 transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)]"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;