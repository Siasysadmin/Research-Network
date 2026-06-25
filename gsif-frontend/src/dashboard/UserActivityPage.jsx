import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import avatar from "../assets/images/avatar.jpg";
import API_CONFIG from "../config/api.config";
import ShareModal, {
  fetchShareData,
  sendPost,
  handleNativeShare,
} from "./ShareModal";
import { toast } from "react-toastify";

// ─── NOTE ───────────────────────────────────────────────────────────────
// Cards are defined locally (not imported from UserProfile) so they carry
// the same like / comment / share / save behaviour as MainContent cards.
// All existing page-level logic (fetch, tabs, scroll, displayName, etc.)
// is preserved exactly as it was in the uploaded file.
// Poll functionality is ported directly from MainContent (same logic,
// same helpers, same UI, same API calls).
// ────────────────────────────────────────────────────────────────────────

const MaterialIcon = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

// ── helpers ──────────────────────────────────────────────────────────────

const formatActivityDate = (s) => {
  if (!s) return "";
  const d = new Date(String(s).replace(" ", "T"));
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const buildMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${API_CONFIG.BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
};

const getPostProfileSrc = (post) => {
  if (post.profile_image) return `${API_CONFIG.BASE_URL}/${post.profile_image}`;
  return avatar;
};

const getCurrentUserInfo = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return { id: null, name: "", avatar: null };
    const u = JSON.parse(userStr);
    const obj = Array.isArray(u) ? u[0] : u;
    const profileImg =
      obj.profile_image ||
      obj.avatar ||
      obj.profile_pic ||
      obj.profile_individual_details?.profile_image ||
      obj.profile_institute_details?.profile_image ||
      null;
    const avatarUrl =
      profileImg && String(profileImg).startsWith("http")
        ? profileImg
        : profileImg
          ? `${API_CONFIG.BASE_URL}/${profileImg}`
          : null;
    return {
      id: String(obj.id || obj.user_id || ""),
      name: obj.name || "",
      avatar: avatarUrl,
    };
  } catch {
    return { id: null, name: "", avatar: null };
  }
};

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("authToken") ||
  null;

// Same formatTimeAgo as MainContent
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  let normalized = String(timestamp).replace(" ", "T");
  if (!normalized.endsWith("Z") && !normalized.includes("+")) {
    normalized += "+05:30";
  }
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return "Just now";
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 0) return "Just now";
  if (diffSecs < 60) return "Just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Same formatDate as MainContent (used for poll timestamps)
const formatDate = (timestamp) => {
  if (!timestamp) return "Published";
  const dateStr = String(timestamp).replace(" ", "T");
  const date = new Date(dateStr);
  const now = new Date();
  if (isNaN(date.getTime())) return "Recent";
  const diffMs = now - date;
  if (diffMs < 0) return "Just now";
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ── Empty state ──────────────────────────────────────────────────────────
const Empty = memo(({ icon, heading, sub }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 dark:bg-white/5 text-slate-400 dark:text-slate-500">
      <MaterialIcon name={icon} className="text-3xl" />
    </span>
    <p className="text-base font-semibold text-slate-700 dark:text-white">
      {heading}
    </p>
    {sub && (
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        {sub}
      </p>
    )}
  </div>
));

// ── Tab button ───────────────────────────────────────────────────────────
const Tab = memo(({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 whitespace-nowrap px-5 py-3 rounded-t-xl text-sm font-semibold border-b-2 transition-colors ${
      active
        ? "border-[#00ff85] text-slate-900 dark:text-white"
        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
    }`}
  >
    {label}
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
        active
          ? "bg-[#00ff85]/15 text-[#00c46a] dark:text-[#00ff85]"
          : "bg-gray-100 dark:bg-white/5 text-slate-500"
      }`}
    >
      {count}
    </span>
  </button>
));

// ── Skeleton ─────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl p-5 animate-shimmer"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-[#1a2a22]" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-[#1a2a22]" />
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-[#1a2a22]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-[#1a2a22]" />
          <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-[#1a2a22]" />
          <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-[#1a2a22]" />
        </div>
      </div>
    ))}
    <style jsx>{`
      @keyframes shimmer {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }
      .animate-shimmer {
        animation: shimmer 1.5s ease-in-out infinite;
      }
    `}</style>
  </div>
);

// ── Comment section (shared by Post and Research cards) ───────────────────
const CommentSection = ({
  postId,
  isResearch,
  commentsState,
  setCommentsState,
  activity,
  setActivity,
}) => {
  const [newText, setNewText] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const {
    id: currentUserId,
    name: currentUserName,
    avatar: currentUserAvatar,
  } = getCurrentUserInfo();

  const comments = commentsState[postId] || { isOpen: false, list: [] };
  if (!comments.isOpen) return null;

  const fetchComments = async () => {
    const token = getAuthToken();
    try {
      const endpoint = isResearch
        ? `${API_CONFIG.BASE_URL}/research/get-comments/${postId}`
        : `${API_CONFIG.BASE_URL}/post/get-comments/${postId}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      const fetched = (result.data || []).map((c) => ({
        id: c.id,
        text: c.comment,
        author: c.name,
        authorId: c.user_id,
        authorAvatar: c.profile_image
          ? `${API_CONFIG.BASE_URL}/${c.profile_image}`
          : null,
        timestamp: c.created_at,
      }));
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], list: fetched },
      }));
    } catch {}
  };

  const addComment = async () => {
    if (!newText.trim()) return;
    const clean = newText.trim();
    const tempId = `temp_${Date.now()}`;
    const tempComment = {
      id: tempId,
      text: clean,
      author: currentUserName,
      authorId: currentUserId,
      authorAvatar: currentUserAvatar,
      timestamp: new Date().toISOString(),
    };
    setCommentsState((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isOpen: true,
        list: [tempComment, ...(prev[postId]?.list || [])],
      },
    }));
    setNewText("");
    setActivity((prev) => {
      const key = isResearch ? "research" : "posts";
      return {
        ...prev,
        [key]: prev[key].map((item) => {
          const itemId = isResearch ? item.research_id || item.id : item.id;
          if (String(itemId) === String(postId)) {
            return {
              ...item,
              comment_count: parseInt(item.comment_count || 0) + 1,
            };
          }
          return item;
        }),
      };
    });
    try {
      const token = getAuthToken();
      const endpoint = isResearch
        ? `${API_CONFIG.BASE_URL}/research/add-comment/${postId}`
        : `${API_CONFIG.BASE_URL}/post/add-comment/${postId}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: clean }),
      });
      const result = await res.json();
      if (result.status) {
        await fetchComments();
      } else {
        setCommentsState((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            list: prev[postId].list.filter((c) => c.id !== tempId),
          },
        }));
        toast.error(result.message || "Failed to add comment");
      }
    } catch {
      setCommentsState((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          list: prev[postId].list.filter((c) => c.id !== tempId),
        },
      }));
    }
  };

  const deleteComment = async (commentId) => {
    setCommentsState((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        list: prev[postId].list.filter((c) => c.id != commentId),
      },
    }));
    try {
      const token = getAuthToken();
      const endpoint = isResearch
        ? `${API_CONFIG.BASE_URL}/research/delete-comment/${commentId}`
        : `${API_CONFIG.BASE_URL}/post/delete-comment/${commentId}`;
      await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  return (
    <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
      {/* Input */}
      <div className="flex gap-2 sm:gap-3 items-start">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") addComment();
            }}
            placeholder="Add a comment..."
            className="w-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 dark:focus:border-[#00ff88]/50 transition-colors pr-10 text-slate-800 dark:text-white placeholder:text-slate-400"
            style={{ outline: "none", boxShadow: "none" }}
          />
          <button
            onClick={addComment}
            className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-emerald-600 dark:text-[#00ff88] hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 scrollbar-hidden">
        {comments.list.length > 0 ? (
          comments.list.map((comment) => (
            <div key={comment.id} className="flex gap-2 sm:gap-3 group">
              <img
                alt={comment.author}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-white/10 object-cover shrink-0"
                src={comment.authorAvatar || avatar}
                onError={(e) => {
                  e.target.src = avatar;
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white pr-2 truncate">
                    {comment.author}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">
                      {formatTimeAgo(comment.timestamp)}
                    </span>
                    {String(comment.authorId) === String(currentUserId) && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <p
                  className={`text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed ${
                    expandedComments[comment.id] ? "" : "line-clamp-3"
                  }`}
                >
                  {comment.text}
                </p>
                {comment.text.length > 120 && (
                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [comment.id]: !prev[comment.id],
                      }))
                    }
                    className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-[#00ff88] mt-1 hover:underline"
                  >
                    {expandedComments[comment.id] ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-[10px] sm:text-xs text-slate-400 text-center py-3">
            No comments yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
};

// ── Action bar (like / comment / share / save) — same as MainContent ─────
const ActionBar = ({
  postId,
  isResearch,
  isLiked,
  likeCount,
  isSaved,
  isCommentsOpen,
  commentCount,
  commentsListLength,
  shareTitle,
  shareText,
  onToggleLike,
  onToggleComments,
  onToggleSave,
  onShareClick,
}) => (
  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 pt-2 sm:pt-3 md:pt-4 border-t border-white/5 flex-wrap w-full">
    {/* Like Button */}
    <button
      onClick={onToggleLike}
      className={`flex items-center gap-0.5 sm:gap-1 transition-colors duration-200 text-xs sm:text-sm ${
        isLiked
          ? "text-emerald-500 dark:text-[#00ff88]"
          : "text-slate-500 hover:text-emerald-400 dark:hover:text-[#00ff88]/70"
      }`}
    >
      <span
        className="material-symbols-outlined text-base sm:text-lg"
        style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
      <span className="text-[9px] sm:text-xs font-bold">
        {parseInt(likeCount || 0) > 0 ? likeCount : "Like"}
      </span>
    </button>

    {/* Comment Button */}
    <button
      onClick={onToggleComments}
      className={`flex items-center gap-0.5 sm:gap-1 transition-colors duration-200 text-xs sm:text-sm ${
        isCommentsOpen
          ? "text-emerald-500 dark:text-[#00ff88]"
          : "text-slate-500 hover:text-emerald-400 dark:hover:text-[#00ff88]/70"
      }`}
    >
      <span className="material-symbols-outlined text-base sm:text-lg">
        chat_bubble
      </span>
      <span className="text-[9px] sm:text-xs font-bold">
        {commentsListLength > 0
          ? `(${commentsListLength})`
          : commentCount && !commentsListLength
            ? `(${commentCount})`
            : ""}
      </span>
    </button>

    {/* Share Button */}
    {/* Share Button - Only visible for regular posts, completely hidden for research */}
    {!isResearch && (
      <button
        onClick={() => {
          if (onShareClick) {
            onShareClick(postId);
          }
        }}
        className="flex items-center gap-0.5 sm:gap-1 text-slate-500 hover:text-emerald-400 dark:hover:text-[#00ff88]/70 transition-colors duration-200 text-xs sm:text-sm"
      >
        <span className="material-symbols-outlined text-base sm:text-lg">
          share
        </span>
        <span className="hidden sm:inline text-xs font-bold">Share</span>
      </button>
    )}

    {/* Save Button */}
    <button
      onClick={onToggleSave}
      className={`ml-auto flex items-center gap-0.5 sm:gap-1 transition-colors duration-200 text-xs sm:text-sm ${
        isSaved
          ? "text-emerald-500 dark:text-[#00ff88]"
          : "text-slate-500 hover:text-emerald-400 dark:hover:text-[#00ff88]/70"
      }`}
    >
      <span
        className="material-symbols-outlined text-base sm:text-lg"
        style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
      >
        bookmark
      </span>
      <span className="hidden sm:inline text-xs font-bold">Save</span>
    </button>
  </div>
);

// ── PostCard — identical behaviour to MainContent regular post ────────────
const PostCard = ({
  post,
  likedPosts,
  setLikedPosts,
  savedPosts,
  setSavedPosts,
  commentsState,
  setCommentsState,
  activity,
  setActivity,
  onShareClick,
}) => {
  const postId = post.id;
  const isLiked = post.is_liked === "1" || !!likedPosts[postId];
  const isSaved = !!savedPosts[postId] || post.is_saved === "1";
  const postComments = commentsState[postId] || { isOpen: false, list: [] };

  const [localLikeCount, setLocalLikeCount] = useState(
    parseInt(post.like_count || 0),
  );
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [expanded, setExpanded] = useState(false);

  const content = post.post_text || "";
  const hasImage = post.image && post.image !== "";
  const hasVideo = post.video && post.video !== "";
  const imageUrl = hasImage ? buildMediaUrl(post.image) : null;
  const videoUrl = hasVideo ? buildMediaUrl(post.video) : null;
  const hasMedia = !!(imageUrl || videoUrl);

  const tags = Array.isArray(post.hash_tag)
    ? post.hash_tag
    : typeof post.hash_tag === "string" && post.hash_tag
      ? (() => {
          try {
            return JSON.parse(post.hash_tag);
          } catch {
            return [];
          }
        })()
      : [];

  const toggleLike = async () => {
    const token = getAuthToken();
    const wasLiked = localIsLiked;
    setLocalIsLiked(!wasLiked);
    setLocalLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    setLikedPosts((prev) => {
      const next = { ...prev, [postId]: !wasLiked };
      localStorage.setItem("postLikes", JSON.stringify(next));
      return next;
    });
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/like-post/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!result.status) {
        setLocalIsLiked(wasLiked);
        setLocalLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
        setLikedPosts((prev) => {
          const next = { ...prev, [postId]: wasLiked };
          localStorage.setItem("postLikes", JSON.stringify(next));
          return next;
        });
      }
    } catch {}
  };

  const toggleSave = async () => {
    const token = getAuthToken();
    const wasSaved = isSaved;
    setSavedPosts((prev) => {
      const next = { ...prev, [postId]: !wasSaved };
      localStorage.setItem("savedPosts", JSON.stringify(next));
      return next;
    });
    toast.success(
      wasSaved ? "Post removed from saved" : "Post saved successfully",
    );
    if (wasSaved)
      window.dispatchEvent(
        new CustomEvent("postUnsaved", { detail: { postId } }),
      );
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/save-post/${postId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!result.status) {
        setSavedPosts((prev) => {
          const next = { ...prev, [postId]: wasSaved };
          localStorage.setItem("savedPosts", JSON.stringify(next));
          return next;
        });
        toast.error(result.message || "Failed to update save status");
      }
    } catch {
      setSavedPosts((prev) => {
        const next = { ...prev, [postId]: wasSaved };
        localStorage.setItem("savedPosts", JSON.stringify(next));
        return next;
      });
    }
  };

  const toggleComments = async () => {
    const isCurrentlyOpen = postComments.isOpen;
    if (isCurrentlyOpen) {
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], isOpen: false },
      }));
      return;
    }
    setCommentsState((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isOpen: true,
        list: prev[postId]?.list || [],
      },
    }));
    if (commentsState[postId]?.list?.length > 0) return;
    const token = getAuthToken();
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/get-comments/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await res.json();
      const fetched = (result.data || []).map((c) => ({
        id: c.id,
        text: c.comment,
        author: c.name,
        authorId: c.user_id,
        authorAvatar: c.profile_image
          ? `${API_CONFIG.BASE_URL}/${c.profile_image}`
          : null,
        timestamp: c.created_at,
      }));
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], list: fetched },
      }));
    } catch {}
  };

  return (
    <article className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-white/5 shadow-sm overflow-visible relative w-full">
      <div className="p-3 sm:p-4 md:p-5">
        {/* Author */}
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 mb-3 sm:mb-4">
          <img
            alt={post.name || "User"}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0"
            src={getPostProfileSrc(post)}
            onError={(e) => {
              e.target.src = avatar;
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate capitalize">
              {post.name || "User"}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 capitalize">
              {post.user_type === "institute" ? "Institute" : "Individual"} •{" "}
              {formatActivityDate(post.created_at)}
            </p>
          </div>
        </div>

        {content && (
          <div className="mb-3">
            <div
              className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words"
              style={
                !expanded
                  ? {
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      WebkitLineClamp: hasMedia ? 5 : 10,
                    }
                  : {}
              }
            >
              {content}
            </div>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[10px] sm:text-xs text-emerald-600 dark:text-[#00ff85] mt-1 hover:underline font-semibold block"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((t, i) => (
              <span
                key={i}
                className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-0.5 rounded-full"
              >
                #{String(t).replace(/^#/, "")}
              </span>
            ))}
          </div>
        )}

        {imageUrl && (
          <div className="mb-3 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-black">
            <img
              src={imageUrl}
              alt="Post media"
              loading="lazy"
              className="w-full h-auto object-contain max-h-[500px]"
              onError={(e) => {
                e.target.parentElement.style.display = "none";
              }}
            />
          </div>
        )}

        {videoUrl && (
          <div className="mb-3 rounded-lg sm:rounded-xl overflow-hidden bg-black">
            <video
              src={videoUrl}
              controls
              playsInline
              className="w-full max-h-[500px]"
            />
          </div>
        )}
      </div>

      <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
        <ActionBar
          postId={postId}
          isResearch={false}
          isLiked={localIsLiked}
          likeCount={localLikeCount}
          isSaved={isSaved}
          isCommentsOpen={postComments.isOpen}
          commentCount={post.comment_count}
          commentsListLength={postComments.list.length}
          shareTitle={null}
          shareText={content}
          onToggleLike={toggleLike}
          onToggleComments={toggleComments}
          onToggleSave={toggleSave}
          onShareClick={onShareClick}
        />
        {postComments.isOpen && (
          <CommentSection
            postId={postId}
            isResearch={false}
            commentsState={commentsState}
            setCommentsState={setCommentsState}
            activity={activity}
            setActivity={setActivity}
          />
        )}
      </div>
    </article>
  );
};

// ── ResearchCard — identical behaviour to MainContent research post ────────
const ResearchCard = ({
  research,
  likedPosts,
  setLikedPosts,
  savedPosts,
  setSavedPosts,
  commentsState,
  setCommentsState,
  activity,
  setActivity,
}) => {
  const postId = research.research_id || research.id;
  const isLiked = research.is_liked === "1" || !!likedPosts[postId];
  const isSaved = !!savedPosts[postId] || research.is_saved === "1";
  const postComments = commentsState[postId] || { isOpen: false, list: [] };

  const [localLikeCount, setLocalLikeCount] = useState(
    parseInt(research.like_count || 0),
  );
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [expanded, setExpanded] = useState(false);

  const abs = research.abstract || "";

  const keywords = Array.isArray(research.keywords) ? research.keywords : [];
  const fileUrl = research.research_file
    ? `${API_CONFIG.BASE_URL}/${research.research_file}`
    : null;
  const fileName = research.research_file?.split("/").pop() || "Research Paper";

  const toggleLike = async () => {
    const token = getAuthToken();
    const wasLiked = localIsLiked;
    setLocalIsLiked(!wasLiked);
    setLocalLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    setLikedPosts((prev) => {
      const next = { ...prev, [postId]: !wasLiked };
      localStorage.setItem("postLikes", JSON.stringify(next));
      return next;
    });
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/research/like-research/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!result.status) {
        setLocalIsLiked(wasLiked);
        setLocalLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
        setLikedPosts((prev) => {
          const next = { ...prev, [postId]: wasLiked };
          localStorage.setItem("postLikes", JSON.stringify(next));
          return next;
        });
      }
    } catch {}
  };

  const toggleSave = async () => {
    const token = getAuthToken();
    const wasSaved = isSaved;
    setSavedPosts((prev) => {
      const next = { ...prev, [postId]: !wasSaved };
      localStorage.setItem("savedPosts", JSON.stringify(next));
      return next;
    });
    toast.success(
      wasSaved ? "Post removed from saved" : "Post saved successfully",
    );
    if (wasSaved)
      window.dispatchEvent(
        new CustomEvent("postUnsaved", { detail: { postId } }),
      );
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/research/research-save/${postId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!result.status) {
        setSavedPosts((prev) => {
          const next = { ...prev, [postId]: wasSaved };
          localStorage.setItem("savedPosts", JSON.stringify(next));
          return next;
        });
        toast.error(result.message || "Failed to update save status");
      }
    } catch {
      setSavedPosts((prev) => {
        const next = { ...prev, [postId]: wasSaved };
        localStorage.setItem("savedPosts", JSON.stringify(next));
        return next;
      });
    }
  };

  const toggleComments = async () => {
    const isCurrentlyOpen = postComments.isOpen;
    if (isCurrentlyOpen) {
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], isOpen: false },
      }));
      return;
    }
    setCommentsState((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isOpen: true,
        list: prev[postId]?.list || [],
      },
    }));
    if (commentsState[postId]?.list?.length > 0) return;
    const token = getAuthToken();
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/research/get-comments/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await res.json();
      const fetched = (result.data || []).map((c) => ({
        id: c.id,
        text: c.comment,
        author: c.name,
        authorId: c.user_id,
        authorAvatar: c.profile_image
          ? `${API_CONFIG.BASE_URL}/${c.profile_image}`
          : null,
        timestamp: c.created_at,
      }));
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], list: fetched },
      }));
    } catch {}
  };

  return (
    <article className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-white/5 shadow-sm overflow-visible relative w-full">
      <div className="p-3 sm:p-4 md:p-5">
        {/* Author */}
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 mb-3 sm:mb-4">
          <img
            alt={research.name || "User"}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0"
            src={getPostProfileSrc(research)}
            onError={(e) => {
              e.target.src = avatar;
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate capitalize">
              {research.name || "User"}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 capitalize">
              {research.user_type === "institute" ? "Institute" : "Individual"}{" "}
              • {formatActivityDate(research.created_at)}
            </p>
          </div>
        </div>

        <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white mb-2">
          {research.research_title}
        </h4>

        {abs && (
          <div className="mb-3">
            <div
              className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 break-words whitespace-pre-wrap"
              style={
                !expanded
                  ? {
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      WebkitLineClamp: 3,
                    }
                  : {}
              }
            >
              {abs}
            </div>

            {/* Dynamic Read more / Show less Button */}
            {abs.length > 120 && ( // Ek andaze se character safety lagayi hai taaki chote text par button na dikhe
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[10px] sm:text-xs text-emerald-600 dark:text-[#00ff85] mt-1 hover:underline font-semibold block"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {keywords.map((k, i) => (
              <span
                key={i}
                className="text-[10px] sm:text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-medium"
              >
                {k}
              </span>
            ))}
          </div>
        )}

        {fileUrl && (
          <div className="mb-3 sm:mb-4">
            <div className="bg-slate-100 dark:bg-[#0e0f10] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-200 dark:bg-[#0f172a] border border-emerald-200 dark:border-[#00ff88]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-lg sm:text-xl">
                    description
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {fileName}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                    PDF Document
                  </p>
                </div>
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00ff88] text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-[#00dd77] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-xs sm:text-sm">
                  open_in_new
                </span>
                View
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
        <ActionBar
          postId={postId}
          isResearch={true}
          isLiked={localIsLiked}
          likeCount={localLikeCount}
          isSaved={isSaved}
          isCommentsOpen={postComments.isOpen}
          commentCount={research.comment_count}
          commentsListLength={postComments.list.length}
          shareTitle={research.research_title}
          shareText={abs}
          onToggleLike={toggleLike}
          onToggleComments={toggleComments}
          onToggleSave={toggleSave}
        />
        {postComments.isOpen && (
          <CommentSection
            postId={postId}
            isResearch={true}
            commentsState={commentsState}
            setCommentsState={setCommentsState}
            activity={activity}
            setActivity={setActivity}
          />
        )}
      </div>
    </article>
  );
};

// ════════════════════════════════════════════════════════════════
//  POLL HELPERS — ported 1-to-1 from MainContent
// ════════════════════════════════════════════════════════════════

const recomputePollPercentages = (options, totalVotes) => {
  const total = Number(totalVotes) || 0;
  return options.map((o) => {
    const count = Number(o.vote_count) || 0;
    const percentage = total > 0 ? Math.round((count * 100) / total) : 0;
    return { ...o, percentage };
  });
};

const clonePoll = (poll) => ({
  ...poll,
  options: Array.isArray(poll.options)
    ? poll.options.map((o) => ({ ...o }))
    : [],
});

const applyLocalVote = (poll, optionId) => {
  const nextTotalVotes = (Number(poll.total_votes) || 0) + 1;
  const nextOptions = poll.options.map((o) => {
    const isTarget = String(o.id) === String(optionId);
    const nextCount = (Number(o.vote_count) || 0) + (isTarget ? 1 : 0);
    return { ...o, vote_count: nextCount, is_voted_by_me: isTarget ? 1 : 0 };
  });
  return {
    ...poll,
    total_votes: nextTotalVotes,
    my_vote_option_id: String(optionId),
    options: recomputePollPercentages(nextOptions, nextTotalVotes),
  };
};

const applyLocalSwitchVote = (poll, nextOptionId) => {
  const prevVote = poll.my_vote_option_id;
  if (!prevVote) return applyLocalVote(poll, nextOptionId);
  const totalVotes = Number(poll.total_votes) || 0;
  const nextOptions = poll.options.map((o) => {
    const id = String(o.id);
    const isPrev = id === String(prevVote);
    const isNext = id === String(nextOptionId);
    const base = Number(o.vote_count) || 0;
    const nextCount = Math.max(0, base - (isPrev ? 1 : 0) + (isNext ? 1 : 0));
    return { ...o, vote_count: nextCount, is_voted_by_me: isNext ? 1 : 0 };
  });
  return {
    ...poll,
    my_vote_option_id: String(nextOptionId),
    options: recomputePollPercentages(nextOptions, totalVotes),
  };
};

const applyLocalUndo = (poll) => {
  const prevVote = poll.my_vote_option_id;
  if (!prevVote) return poll;
  const nextTotalVotes = Math.max(0, (Number(poll.total_votes) || 0) - 1);
  const nextOptions = poll.options.map((o) => {
    const isTarget = String(o.id) === String(prevVote);
    const currentCount = Number(o.vote_count) || 0;
    const nextCount = isTarget ? Math.max(0, currentCount - 1) : currentCount;
    return { ...o, vote_count: nextCount, is_voted_by_me: 0 };
  });
  return {
    ...poll,
    total_votes: nextTotalVotes,
    my_vote_option_id: null,
    options: recomputePollPercentages(nextOptions, nextTotalVotes),
  };
};

// ── PollCard — same UI and behaviour as MainContent poll ─────────────────
const PollCard = ({
  poll: initialPoll,
  currentUserId,
  pollActionLoading,
  setPollActionLoading,
  onPollUpdate, // (pollId, updaterFn) => void  — updates activity state
  onDeletePoll, // (pollId) => void
  showOptionsId,
  setShowOptionsId,
}) => {
  // Local copy of this poll so optimistic updates are instant
  const [poll, setPoll] = useState(initialPoll);

  // Keep in sync if parent re-renders (e.g. after fetch)
  useEffect(() => {
    setPoll(initialPoll);
  }, [initialPoll]);

  const pollId = String(poll.poll_id);
  const isBusy = Boolean(pollActionLoading[pollId]);
  const isCurrentUserPoll = String(currentUserId) === String(poll.user_id);
  const totalVotes = Number(poll.total_votes) || 0;
  const myVote = poll.my_vote_option_id;
  const pollName =
    poll.user_type === "institute"
      ? poll.name || "Institute"
      : poll.name || "User";
  const pollTime = formatDate(
    `${String(poll.created_at || "").replace(" ", "T")}+05:30`,
  );
  const pollOptionsKey = `poll-${pollId}`;

  // ── API calls ──────────────────────────────────────────────────────────
  const pollVoteRequest = async (optionId) => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required. Please login again.");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      response = await fetch(
        `${API_CONFIG.BASE_URL}/poll/vote-poll/${pollId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ option_id: Number(optionId) }),
          signal: controller.signal,
        },
      );
    } catch (err) {
      if (err?.name === "AbortError")
        throw new Error("Voting timed out. Please try again.");
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
    const responseText = await response.text();
    if (responseText.includes("PHP Error") || responseText.includes("<div"))
      throw new Error("Server error occurred while submitting vote.");
    const data = JSON.parse(responseText);
    if (!data?.status) throw new Error(data?.message || "Vote failed.");
    return data;
  };

  const pollUndoRequest = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required. Please login again.");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      response = await fetch(
        `${API_CONFIG.BASE_URL}/poll/undo-vote/${pollId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        },
      );
    } catch (err) {
      if (err?.name === "AbortError")
        throw new Error("Undo vote timed out. Please try again.");
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
    const responseText = await response.text();
    if (responseText.includes("PHP Error") || responseText.includes("<div"))
      throw new Error("Server error occurred while removing vote.");
    const data = JSON.parse(responseText);
    if (!data?.status) throw new Error(data?.message || "Undo vote failed.");
    return data;
  };

  // ── optimistic helpers ─────────────────────────────────────────────────
  const applyUpdate = (updaterFn) => {
    setPoll((prev) => updaterFn({ ...prev, options: prev.options || [] }));
    // also propagate to parent so activity state stays in sync
    if (onPollUpdate) onPollUpdate(pollId, updaterFn);
  };

  // ── handlers ──────────────────────────────────────────────────────────
  const handleOptionClick = async (e, optionId) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBusy) return;

    setPollActionLoading((prev) => ({ ...prev, [pollId]: true }));
    const snapshot = clonePoll(poll);

    try {
      const currentMyVote = poll.my_vote_option_id;

      if (currentMyVote && String(currentMyVote) === String(optionId)) {
        // undo
        applyUpdate((p) => applyLocalUndo(p));
        await pollUndoRequest();
        return;
      }

      if (currentMyVote && String(currentMyVote) !== String(optionId)) {
        // switch vote
        applyUpdate((p) => applyLocalSwitchVote(p, optionId));
        await pollUndoRequest();
        await pollVoteRequest(optionId);
        return;
      }

      // fresh vote
      applyUpdate((p) => applyLocalVote(p, optionId));
      await pollVoteRequest(optionId);
    } catch (err) {
      // rollback
      setPoll(snapshot);
      if (onPollUpdate) onPollUpdate(pollId, () => snapshot);
      toast.error(err?.message || "Poll action failed");
    } finally {
      setPollActionLoading((prev) => {
        const next = { ...prev };
        delete next[pollId];
        return next;
      });
    }
  };

  const handleUndo = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBusy) return;

    setPollActionLoading((prev) => ({ ...prev, [pollId]: true }));
    const snapshot = clonePoll(poll);

    try {
      applyUpdate((p) => applyLocalUndo(p));
      await pollUndoRequest();
    } catch (err) {
      setPoll(snapshot);
      if (onPollUpdate) onPollUpdate(pollId, () => snapshot);
      toast.error(err?.message || "Undo vote failed");
    } finally {
      setPollActionLoading((prev) => {
        const next = { ...prev };
        delete next[pollId];
        return next;
      });
    }
  };

  // ── UI — identical to MainContent poll card ────────────────────────────
  return (
    <article className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden relative w-full">
      <div className="p-3 sm:p-4 md:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-emerald-100 dark:bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.12)] shrink-0 hover:opacity-90 transition-opacity"
            >
              {poll.profile_image ? (
                <img
                  alt={pollName}
                  src={getPostProfileSrc(poll)}
                  className="w-full h-full rounded-lg sm:rounded-2xl object-cover"
                  onError={(e) => {
                    e.target.src = avatar;
                  }}
                />
              ) : (
                <img
                  alt={pollName}
                  src={avatar}
                  className="w-full h-full rounded-lg sm:rounded-2xl object-cover"
                />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-wrap">
                <h4 className="text-slate-900 dark:text-white font-bold truncate text-xs sm:text-sm">
                  {pollName}
                </h4>
              </div>
              <p className="text-[9px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-0.5 flex-wrap">
                {(poll.user_type || "user")
                  .toLowerCase()
                  .replace(/^./, (c) => c.toUpperCase())}
                <span className="text-slate-500 text-[9px] sm:text-xs shrink-0">
                  • {pollTime}
                </span>
              </p>
            </div>
          </div>

          {/* Options menu */}
          {/* <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative">
            <button
              type="button"
              className="text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setShowOptionsId(
                  showOptionsId === pollOptionsKey ? null : pollOptionsKey,
                );
              }}
            >
              <MaterialIcon name="more_horiz" className="text-base sm:text-lg" />
            </button>

            {showOptionsId === pollOptionsKey && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptionsId(null);
                  }}
                />
                <div className="absolute right-0 top-8 w-40 sm:w-48 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 animate-fadeInScale">
                  {isCurrentUserPoll ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsId(null);
                        onDeletePoll && onDeletePoll(pollId);
                      }}
                      className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group"
                    >
                      <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                        delete
                      </span>
                      <span>Delete Poll</span>
                    </button>
                  ) : (
                    <p className="px-3 py-2 text-xs text-slate-400">
                      No actions available
                    </p>
                  )}
                </div>
              </>
            )}
          </div> */}
        </div>

        {/* Question */}
        <h3 className="mt-3 sm:mt-4 md:mt-5 text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug break-words">
          {poll.question}
        </h3>

        {/* Options */}
        <div className="mt-3 sm:mt-4 md:mt-5 space-y-2 sm:space-y-3">
          {(poll.options || []).map((opt) => {
            const percent = Math.max(
              0,
              Math.min(100, Number(opt.percentage) || 0),
            );
            const isSelected =
              String(opt.id) === String(myVote) ||
              Number(opt.is_voted_by_me) === 1;

            return (
              <button
                key={`${pollId}-${opt.id}`}
                type="button"
                disabled={isBusy}
                onClick={(e) => handleOptionClick(e, opt.id)}
                className={`relative w-full rounded-xl border bg-white dark:bg-[#000302] overflow-hidden transition-all text-left min-h-[44px] sm:min-h-[52px] shadow-sm ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-50 dark:border-[#00ff88]/35 dark:bg-[#000302]"
                    : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-white/10 dark:hover:border-white/15 dark:hover:bg-white/5"
                } ${isBusy ? "opacity-70 cursor-wait" : ""}`}
              >
                <div
                  className={`absolute inset-y-0 left-0 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#00ff88]/45 to-[#00ff88]/10"
                      : "bg-gradient-to-r from-[#00ff88]/25 to-[#00ff88]/5"
                  }`}
                  style={{ width: `${percent}%` }}
                />
                <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5">
                  <span
                    className={`text-xs sm:text-sm font-semibold pr-1 sm:pr-2 break-words flex-1 ${
                      isSelected
                        ? "text-emerald-700 dark:text-white"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {opt.option_text}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {isSelected && (
                      <MaterialIcon
                        name="check_circle"
                        className={`text-emerald-600 dark:text-[#00ff88] text-base sm:text-lg ${
                          isSelected ? "scale-110" : ""
                        }`}
                      />
                    )}
                    <span
                      className={`text-xs sm:text-sm font-black tabular-nums ${
                        isSelected
                          ? "text-emerald-600 dark:text-[#00ff88]"
                          : "text-slate-500"
                      }`}
                    >
                      {percent}%
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer: vote count + undo */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-500 gap-2">
          <span className="truncate">{totalVotes.toLocaleString()} votes</span>
          {myVote ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleUndo}
              className="text-emerald-600 dark:text-[#00ff88] hover:opacity-80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Undo vote
            </button>
          ) : (
            <span className="text-slate-600 whitespace-nowrap">
              Tap to vote
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

// ════════════════════════════════════════════════════════════════
//                        PAGE COMPONENT
// ════════════════════════════════════════════════════════════════
const UserActivityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};

  /* ── Existing logic preserved exactly ── */
  const passedUser = routeState.user || null;
  const passedActivity = routeState.activity || null;

  const [activity, setActivity] = useState(
    passedActivity || { posts: [], research: [], polls: [] },
  );
  const [loading, setLoading] = useState(!passedActivity);
  const [activeTab, setActiveTab] = useState("all");

  const [displayName, setDisplayName] = useState(
    location.state?.displayName || location.state?.user?.name || "User",
  );

  // ── Card shared state (mirrors MainContent) ──
  const [likedPosts, setLikedPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("postLikes") || "{}");
    } catch {
      return {};
    }
  });
  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedPosts") || "{}");
    } catch {
      return {};
    }
  });
  const [commentsState, setCommentsState] = useState({});

  // ── Poll-specific state (ported from MainContent) ──
  const [pollActionLoading, setPollActionLoading] = useState({});
  const [deletingPollId, setDeletingPollId] = useState(null);
  const [showOptionsId, setShowOptionsId] = useState(null);
  const [showDeletePollPopup, setShowDeletePollPopup] = useState(false);
  const [pollToDelete, setPollToDelete] = useState(null);

  /* ── Share modal state (same as UserProfile) ── */
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedSharePostId, setSelectedSharePostId] = useState(null);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [shareAllUsers, setShareAllUsers] = useState([]);
  const [shareGroups, setShareGroups] = useState([]);

  /* ── Scroll handler — preserved exactly ── */
  useEffect(() => {
    const targetId = location.state?.targetId;
    if (targetId && !loading) {
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
      return () => clearTimeout(timer);
    } else if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [location.state?.targetId, loading]);

  /* ── Activity fetch — preserved exactly ── */
  useEffect(() => {
    if (passedActivity || !passedUser?.id) return;
    let aborted = false;

    const fetchActivity = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/post/user-created-content/${passedUser.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const result = await res.json();
        if (!aborted && result.status && result.data) {
          setActivity({
            posts: Array.isArray(result.data.posts) ? result.data.posts : [],
            research: Array.isArray(result.data.research)
              ? result.data.research
              : [],
            polls: Array.isArray(result.data.polls) ? result.data.polls : [],
          });
        }
      } catch {
        /* non-critical */
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    fetchActivity();
    return () => {
      aborted = true;
    };
  }, [passedUser?.id]);

  /* ── Share data fetch (same as UserProfile) ── */
  useEffect(() => {
    fetchShareData(getAuthToken, setShareAllUsers, setShareGroups);
  }, []);

  // ── Poll update propagator (keeps activity state in sync with PollCard optimistic updates)
  const handlePollUpdate = useCallback((pollId, updaterFn) => {
    setActivity((prev) => ({
      ...prev,
      polls: prev.polls.map((p) => {
        const pid = String(p.poll_id || p.id);
        if (pid !== String(pollId)) return p;
        return updaterFn(p);
      }),
    }));
  }, []);

  // ── Poll delete (same flow as MainContent) ──────────────────────────────
  const handleDeletePoll = async (pollId) => {
    const pollIdStr = String(pollId);
    setDeletingPollId(pollIdStr);

    // optimistic remove
    const snapshot = activity.polls;
    setActivity((prev) => ({
      ...prev,
      polls: prev.polls.filter((p) => String(p.poll_id || p.id) !== pollIdStr),
    }));

    try {
      const token = getAuthToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      let response;
      try {
        response = await fetch(
          `${API_CONFIG.BASE_URL}/poll/delete-poll/${pollIdStr}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
      } catch (err) {
        if (err?.name === "AbortError")
          throw new Error("Delete poll timed out. Please try again.");
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
      const responseText = await response.text();
      if (responseText.includes("PHP Error") || responseText.includes("<div"))
        throw new Error("Server error occurred while deleting poll.");
      const data = JSON.parse(responseText);
      if (!data?.status)
        throw new Error(data?.message || "Failed to delete poll.");
      toast.success("Poll deleted successfully");
    } catch (err) {
      // rollback
      setActivity((prev) => ({ ...prev, polls: snapshot }));
      toast.error(err?.message || "Failed to delete poll");
    } finally {
      setDeletingPollId(null);
    }
  };

  const confirmDeletePoll = () => {
    if (pollToDelete) handleDeletePoll(pollToDelete);
    setShowDeletePollPopup(false);
    setPollToDelete(null);
  };

  /* ── Merge + sort (preserved exactly) ── */
  const allItems = [
    ...activity.posts.map((p) => ({
      type: "post",
      data: p,
      time: p.created_at,
    })),
    ...activity.research.map((r) => ({
      type: "research",
      data: r,
      time: r.created_at,
    })),
    ...activity.polls.map((p) => ({
      type: "poll",
      data: p,
      time: p.created_at,
    })),
  ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

  const tabs = [
    { key: "all", label: "All Activity", count: allItems.length },
    { key: "posts", label: "Posts", count: activity.posts.length },
    { key: "research", label: "Research", count: activity.research.length },
    { key: "polls", label: "Polls", count: activity.polls.length },
  ];

  const { id: currentUserId } = getCurrentUserInfo();

  const renderItem = (item, key) => {
    const sharedProps = {
      likedPosts,
      setLikedPosts,
      savedPosts,
      setSavedPosts,
      commentsState,
      setCommentsState,
      activity,
      setActivity,
    };

    if (item.type === "post")
      return (
        <PostCard
          key={key}
          post={item.data}
          {...sharedProps}
          onShareClick={(id) => {
            setSelectedSharePostId(id);
            setIsShareOpen(true);
          }}
        />
      );

    if (item.type === "research")
      return <ResearchCard key={key} research={item.data} {...sharedProps} />;

    if (item.type === "poll") {
      const poll = item.data;
      // Ensure poll has the shape PollCard expects
      const normalizedPoll = {
        ...poll,
        poll_id: poll.poll_id || poll.id,
        options: Array.isArray(poll.options) ? poll.options : [],
      };
      return (
        <PollCard
          key={key}
          poll={normalizedPoll}
          currentUserId={currentUserId}
          pollActionLoading={pollActionLoading}
          setPollActionLoading={setPollActionLoading}
          onPollUpdate={handlePollUpdate}
          onDeletePoll={(pollId) => {
            setPollToDelete(pollId);
            setShowDeletePollPopup(true);
            setShowOptionsId(null);
          }}
          showOptionsId={showOptionsId}
          setShowOptionsId={setShowOptionsId}
        />
      );
    }

    return null;
  };

  const activeItems =
    activeTab === "all"
      ? allItems
      : activeTab === "posts"
        ? activity.posts.map((d) => ({
            type: "post",
            data: d,
            time: d.created_at,
          }))
        : activeTab === "research"
          ? activity.research.map((d) => ({
              type: "research",
              data: d,
              time: d.created_at,
            }))
          : activity.polls.map((d) => ({
              type: "poll",
              data: d,
              time: d.created_at,
            }));

  const emptyConfigs = {
    all: {
      icon: "dynamic_feed",
      heading: "No activity yet",
      sub: `${displayName} hasn't shared anything yet.`,
    },
    posts: {
      icon: "post_add",
      heading: "No posts yet",
      sub: "No posts have been shared.",
    },
    research: {
      icon: "science",
      heading: "No research published yet",
      sub: "No research papers have been uploaded.",
    },
    polls: {
      icon: "ballot",
      heading: "No polls yet",
      sub: "No polls have been created.",
    },
  };

  // header avatar — passedUser ya pehli activity se, warna default
  const headerAvatar =
    passedUser?.avatars?.[0] ||
    (passedUser?.profile_image
      ? String(passedUser.profile_image).startsWith("http")
        ? passedUser.profile_image
        : `${API_CONFIG.BASE_URL}/${passedUser.profile_image}`
      : null) ||
    (() => {
      const withImg = [
        ...activity.posts,
        ...activity.research,
        ...activity.polls,
      ].find((x) => x.profile_image);
      return withImg ? `${API_CONFIG.BASE_URL}/${withImg.profile_image}` : null;
    })() ||
    avatar;

  // "Member since" — real date (passedUser ya sabse purani activity se), warna hide
  const memberSince = (() => {
    const raw =
      passedUser?.created_at ||
      [...activity.posts, ...activity.research, ...activity.polls]
        .map((x) => x.created_at)
        .filter(Boolean)
        .sort((a, b) => new Date(a) - new Date(b))[0];
    return raw ? formatActivityDate(raw) : "";
  })();

  const isInstituteUser = (() => {
    const t =
      passedUser?.user_type ||
      [...activity.posts, ...activity.research, ...activity.polls].find(
        (x) => x.user_type,
      )?.user_type ||
      "individual";
    return String(t).toLowerCase() === "institute";
  })();

  const userTypeLabel = isInstituteUser
    ? "Research Institute"
    : "Individual Researcher";

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 dark:bg-[#080a09] dark:text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        {/* ══ HEADER BANNER ══ */}
        <div
          className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm mb-5
                      bg-gradient-to-r from-sky-50 via-emerald-50 to-emerald-100
                      dark:from-[#0c1512] dark:via-[#0d1a14] dark:to-[#0a1410]"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-emerald-200/40 dark:bg-[#00ff85]/10 blur-2xl" />

          <div className="relative p-4 sm:p-6">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="group mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/15 transition-colors"
            >
              <MaterialIcon
                name="arrow_back"
                className="text-xl group-hover:-translate-x-0.5 transition-transform"
              />
            </button>

            {/* Identity row */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="shrink-0 rounded-full p-[3px] bg-white dark:bg-white/10 ring-2 ring-emerald-200 dark:ring-[#00ff85]/30 shadow-sm">
                <img
                  src={headerAvatar}
                  alt={displayName}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover bg-gray-100 dark:bg-[#13231a]"
                  onError={(e) => {
                    e.target.src = avatar;
                  }}
                />
              </div>

              <div className="min-w-0 flex-1 pr-12 sm:pr-20">
                <h1 className="font-extrabold tracking-tight text-slate-900 dark:text-white capitalize truncate text-xl sm:text-2xl leading-tight">
                  {displayName}
                </h1>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85] border border-[#00ff85]/30 px-3 py-1 text-xs font-semibold">
                    <MaterialIcon
                      name={isInstituteUser ? "domain" : "verified"}
                      className="text-sm"
                    />
                    {userTypeLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ TABS CARD ══ */}
        <div className="sticky top-0 z-40 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm mb-5">
          <div
            className="flex items-center gap-1 px-3 sm:px-5 py-0.5 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                label={tab.label}
                count={tab.count}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>
        </div>

        {/* ══ FEED ══ */}
        {loading ? (
          <Skeleton />
        ) : activeItems.length === 0 ? (
          <div className="bg-white border border-gray-200 dark:bg-[#141414] dark:border-white/10 rounded-2xl shadow-sm">
            <Empty {...emptyConfigs[activeTab]} />
          </div>
        ) : (
          <div className="space-y-4">
            {activeItems.map((item) => {
              const key =
                item.type === "post"
                  ? `post-${item.data.id}`
                  : item.type === "research"
                    ? `res-${item.data.research_id}`
                    : `poll-${item.data.poll_id || item.data.id}`;
              return (
                <div id={key} key={key} className="scroll-mt-24">
                  {renderItem(item, key)}
                </div>
              );
            })}
          </div>
        )}

        <div className="h-12" />
      </div>

      {/* Share modal — same as UserProfile */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setSelectedUserIds([]);
          setShareSearchQuery("");
        }}
        allUsers={shareAllUsers}
        shareGroups={shareGroups}
        selectedUserIds={selectedUserIds}
        setSelectedUserIds={setSelectedUserIds}
        shareSearchQuery={shareSearchQuery}
        setShareSearchQuery={setShareSearchQuery}
        onSend={(postId) =>
          sendPost(
            postId,
            selectedUserIds,
            shareGroups,
            getAuthToken,
            setIsShareOpen,
            setSelectedSharePostId,
            setSelectedUserIds,
            setShareSearchQuery,
          )
        }
        selectedSharePostId={selectedSharePostId}
        avatarFallback={avatar}
      />

      {/* ══ Poll Delete Confirmation Popup ══ */}
      {showDeletePollPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-[#000302]/60 backdrop-blur-sm px-2 sm:px-4"
          onClick={() => {
            setShowDeletePollPopup(false);
            setPollToDelete(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#1e293b] rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 w-full max-w-[350px] border border-slate-200 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Delete Poll
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-5 md:mb-6 break-words">
              Are you sure you want to delete this poll?
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowDeletePollPopup(false);
                  setPollToDelete(null);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePoll}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default UserActivityPage;
