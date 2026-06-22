import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import avatar from "../assets/images/avatar.jpg";
import API_CONFIG from "../config/api.config";
import ShareModal, {
  fetchShareData,
  sendPost,
  handleNativeShare,
} from "./ShareModal";
import { toast } from "react-toastify";

const profileCache = new Map();

const MaterialIcon = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

/* ─── shared helpers ─── */
const buildMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${API_CONFIG.BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
};

const getPostProfileSrc = (post) => {
  if (post.profile_image) return `${API_CONFIG.BASE_URL}/${post.profile_image}`;
  return avatar;
};

const getLocalAuthToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("authToken") ||
  null;

const getLocalCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return { id: null, name: "", avatarUrl: null };
    const u = JSON.parse(userStr);
    const obj = Array.isArray(u) ? u[0] : u;
    const profileImg =
      obj.profile_image ||
      obj.avatar ||
      obj.profile_pic ||
      obj.profile_individual_details?.profile_image ||
      obj.profile_institute_details?.profile_image ||
      null;
    const avatarUrl = profileImg
      ? String(profileImg).startsWith("http")
        ? profileImg
        : `${API_CONFIG.BASE_URL}/${profileImg}`
      : null;
    return {
      id: String(obj.id || obj.user_id || ""),
      name: obj.name || "",
      avatarUrl,
    };
  } catch {
    return { id: null, name: "", avatarUrl: null };
  }
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  let normalized = String(timestamp).replace(" ", "T");
  if (!normalized.endsWith("Z") && !normalized.includes("+"))
    normalized += "+05:30";
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return "Just now";
  const diffSecs = Math.floor((new Date() - date) / 1000);
  if (diffSecs < 60) return "Just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

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

/** Returns true if a value is non-empty (used for section-empty guards) */
const hasVal = (v) => v !== null && v !== undefined && v !== "" && v !== "N/A";

/* ─── presentational helpers (module-scope + memo → no remount churn) ─── */

const FieldInfo = memo(({ label, value, icon = "info" }) => {
  if (!hasVal(value)) return null;
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl dark:bg-[#0a120e]/40 dark:border-white/5 hover:border-[#00ff85]/30 hover:bg-white dark:hover:bg-white/[0.03] transition-colors">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85]">
        <MaterialIcon name={icon} className="text-lg" />
      </span>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
          {label}
        </label>
        <p className="text-slate-900 dark:text-white font-medium break-words">
          {value}
        </p>
      </div>
    </div>
  );
});

const LinkField = memo(({ label, value }) => {
  if (!hasVal(value)) return null;
  return (
    <div className="p-4 bg-gray-50 dark:bg-[#0a120e]/40 rounded-xl border border-gray-200 dark:border-white/5 hover:border-[#00ff85]/30 transition-colors">
      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
        {label}
      </label>
      <a
        href={value.startsWith("http") ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[#00c46a] dark:text-[#00ff85] hover:underline transition-colors break-all"
      >
        <MaterialIcon name="link" className="text-base shrink-0" />
        {value}
      </a>
    </div>
  );
});

const TagsField = memo(({ label, items, icon }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="p-4 bg-gray-50 dark:bg-[#0a120e]/40 rounded-xl border border-gray-200 dark:border-white/5">
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85]">
            <MaterialIcon name={icon} className="text-lg" />
          </span>
        )}
        <label
          className={
            icon
              ? "text-sm font-bold text-slate-900 dark:text-white"
              : "text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
          }
        >
          {label}
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85] border border-[#00ff85]/20 px-3 py-1.5 rounded-full text-xs font-bold"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
});

const HighlightField = memo(({ icon, label, value }) => {
  if (!hasVal(value)) return null;
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl dark:bg-[#0a120e]/40 dark:border-white/5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85]">
        <MaterialIcon name={icon} className="text-lg" />
      </span>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
          {label}
        </label>
        <p className="text-slate-900 dark:text-white font-extrabold text-lg break-words">
          {value}
        </p>
      </div>
    </div>
  );
});

const ExperienceItem = memo(({ exp }) => (
  <div className="flex gap-3">
    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#00ff85]" />
    <div className="flex-1 min-w-0 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h5 className="font-bold text-slate-900 dark:text-white">
          {exp.company}
        </h5>
        {hasVal(exp.duration) && (
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <MaterialIcon name="schedule" className="text-sm" />
            {exp.duration}
          </span>
        )}
      </div>
      {hasVal(exp.role) && (
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#00c46a] dark:text-[#00ff85]">
          <MaterialIcon name="apartment" className="text-base" />
          {exp.role}
        </p>
      )}
      {hasVal(exp.description) && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {exp.description}
        </p>
      )}
    </div>
  </div>
));

/**
 * SectionCard — renders nothing when children resolve to all-null.
 * We use a CSS-trick-free approach: caller passes an explicit `hasContent`
 * boolean computed from the data, so we can bail before any DOM paint.
 */
const SectionCard = memo(
  ({ icon, title, isOpen, onToggle, hasContent, children }) => {
    if (!hasContent) return null;
    return (
      <div className="bg-white border border-gray-200 dark:bg-[#141414] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85]">
              <MaterialIcon name={icon} className="text-xl" />
            </span>
            <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg">
              {title}
            </h3>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
            <MaterialIcon name={isOpen ? "expand_less" : "expand_more"} />
          </span>
        </button>
        {isOpen && (
          <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#0a120e]/40">
            <div className="space-y-3">{children}</div>
          </div>
        )}
      </div>
    );
  },
);

const SideCard = memo(({ icon, title, children }) => (
  <div className="bg-white border border-gray-200 dark:bg-[#141414] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
    <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-gray-100 dark:border-white/5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85]">
        <MaterialIcon name={icon} className="text-lg" />
      </span>
      <h3 className="text-slate-900 dark:text-white font-bold text-base">
        {title}
      </h3>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
));

const ActivityEmpty = memo(({ icon, text }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-slate-400 dark:text-slate-500">
      <MaterialIcon name={icon} className="text-2xl" />
    </span>
    <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
  </div>
));

export const ActivityAuthor = memo(({ item }) => {
  const img = buildMediaUrl(item.profile_image);
  return (
    <div className="flex items-center gap-3">
      <img
        src={img || avatar}
        alt={item.name}
        className="w-11 h-11 rounded-full border-2 border-[#00ff85]/20 object-cover shrink-0 bg-gray-200 dark:bg-[#13231a]"
        onError={(e) => {
          e.target.src = avatar;
        }}
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate capitalize">
          {item.user_type === "institute" && item.institute_name
            ? item.institute_name
            : item.name}
        </p>
        <p className="text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1.5">
          {item.user_type === "institute" ? "Institute" : "Individual"}
          <span className="w-1 h-1 rounded-full bg-slate-400 inline-block" />
          {formatActivityDate(item.created_at)}
        </p>
      </div>
    </div>
  );
});

export const Engagement = memo(({ likeCount, commentCount }) => (
  <div className="mt-4 flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-white/5">
    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-bold">
      <MaterialIcon
        name="favorite"
        className="text-lg text-rose-500"
        style={{ fontVariationSettings: "'FILL' 1" }}
      />
      {Number(likeCount) || 0}
    </span>
    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-bold">
      <MaterialIcon
        name="chat_bubble"
        className="text-lg text-[#00c46a] dark:text-[#00ff85]"
      />
      {Number(commentCount) || 0}
    </span>
  </div>
));

export const PostCard = memo(({ post, onShareClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(() => {
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem("postLikes") || "{}");
      } catch {
        return {};
      }
    })();
    return saved[post.id] !== undefined
      ? saved[post.id]
      : post.is_liked === "1";
  });
  const [likeCount, setLikeCount] = useState(parseInt(post.like_count || 0));
  const [isSaved, setIsSaved] = useState(() => {
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem("savedPosts") || "{}");
      } catch {
        return {};
      }
    })();
    return saved[post.id] !== undefined
      ? saved[post.id]
      : post.is_saved === "1";
  });
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  const img = buildMediaUrl(post.image);
  const video = buildMediaUrl(post.video);
  const tags = Array.isArray(post.hash_tag) ? post.hash_tag : [];
  const text = post.post_text || "";

  // ⭐ STEP 1: Check karenge ki kya post ke andar image ya video maujood hai
  const hasMedia = !!(img || video);

  // ⭐ STEP 2: Media presence ke hisab se dynamic Line Clamp class decide karenge
  // Image/Video hone par 'line-clamp-5', pure text post hone par 'line-clamp-10'
  const lineClampClass = hasMedia ? "line-clamp-5" : "line-clamp-10";

  const handleToggleLike = async () => {
    const token = getLocalAuthToken();
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem("postLikes") || "{}");
      } catch {
        return {};
      }
    })();
    stored[post.id] = !wasLiked;
    localStorage.setItem("postLikes", JSON.stringify(stored));
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/like-post/${post.id}`,
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
        setIsLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
        stored[post.id] = wasLiked;
        localStorage.setItem("postLikes", JSON.stringify(stored));
      }
    } catch {}
  };

  const handleToggleSave = async () => {
    const token = getLocalAuthToken();
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem("savedPosts") || "{}");
      } catch {
        return {};
      }
    })();
    stored[post.id] = !wasSaved;
    localStorage.setItem("savedPosts", JSON.stringify(stored));
    if (wasSaved)
      window.dispatchEvent(
        new CustomEvent("postUnsaved", { detail: { postId: post.id } }),
      );
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/save-post/${post.id}`,
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
        setIsSaved(wasSaved);
        stored[post.id] = wasSaved;
        localStorage.setItem("savedPosts", JSON.stringify(stored));
      }
    } catch {}
  };

  const handleShare = () => {
    if (onShareClick) onShareClick(post.id);
  };

  const fetchComments = async () => {
    const token = getLocalAuthToken();
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/get-comments/${post.id}`,
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
      setCommentsList(fetched);
      setCommentsLoaded(true);
    } catch {}
  };

  const handleToggleComments = () => {
    if (!commentsOpen && !commentsLoaded) fetchComments();
    setCommentsOpen((v) => !v);
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    const clean = newCommentText.trim();
    const currentUser = getLocalCurrentUser();
    const tempId = `temp_${Date.now()}`;
    const temp = {
      id: tempId,
      text: clean,
      author: currentUser.name,
      authorId: currentUser.id,
      authorAvatar: currentUser.avatarUrl,
      timestamp: new Date().toISOString(),
    };
    setCommentsList((prev) => [temp, ...prev]);
    setNewCommentText("");
    const token = getLocalAuthToken();
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/add-comment/${post.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: clean }),
        },
      );
      const result = await res.json();
      if (result.status) {
        fetchComments();
      } else setCommentsList((prev) => prev.filter((c) => c.id !== tempId));
    } catch {
      setCommentsList((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentsList((prev) => prev.filter((c) => c.id != commentId));
    const token = getLocalAuthToken();
    try {
      await fetch(`${API_CONFIG.BASE_URL}/post/delete-comment/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const currentUser = getLocalCurrentUser();

  return (
    <article className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-white/5 shadow-sm overflow-visible relative w-full">
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start gap-2 sm:gap-3 mb-3">
          <img
            alt={post.name || "User"}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0"
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

        {/* ⭐ STEP 3: Pure text ko render karna with responsive line clamping */}
        {text && (
          <div
            className={`mb-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 break-words whitespace-pre-wrap ${
              !expanded ? `${lineClampClass} display-webkit-box` : ""
            }`}
            style={
              !expanded
                ? {
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
                : {}
            }
          >
            {text}
          </div>
        )}

        {/* ⭐ STEP 4: Dynamic Read More / Show Less Button */}
        {text && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mb-2 text-[10px] sm:text-xs text-emerald-600 dark:text-[#00ff88] hover:underline font-semibold block"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
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
        {img && (
          <div className="mb-3 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-black">
            <img
              src={img}
              alt="Post Media"
              loading="lazy"
              className="w-full h-auto object-contain max-h-[500px]"
              onError={(e) => {
                e.target.parentElement.style.display = "none";
              }}
            />
          </div>
        )}
        {video && (
          <div className="mb-3 rounded-lg sm:rounded-xl overflow-hidden bg-black">
            <video
              src={video}
              controls
              playsInline
              className="w-full max-h-[500px]"
            />
          </div>
        )}
      </div>

      {/* ── ⭐ 100% Flat & Clean Action Bar (No Background Shapes, No Shadow Boxes) ── */}
      <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 pt-2 sm:pt-3 border-t border-white/5 flex-wrap w-full">
          {/* 1. LIKE BUTTON */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm bg-transparent outline-none select-none ${
              isLiked
                ? "text-[#34d399] dark:text-[#55ffb0]"
                : "text-slate-500 hover:text-[#34d399] dark:hover:text-[#55ffb0]"
            }`}
            style={{
              boxShadow: "none",
              border: "none",
              background: "transparent",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span
              className="material-symbols-outlined text-base sm:text-lg"
              style={{
                fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              favorite
            </span>
            <span className="text-[9px] sm:text-xs font-bold">
              {likeCount > 0 ? likeCount : "Like"}
            </span>
          </button>

          {/* 2. COMMENT BUTTON */}
          <button
            onClick={handleToggleComments}
            className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm bg-transparent outline-none select-none ${
              commentsOpen
                ? "text-[#34d399] dark:text-[#55ffb0]"
                : "text-slate-500 hover:text-[#34d399] dark:hover:text-[#55ffb0]"
            }`}
            style={{
              boxShadow: "none",
              border: "none",
              background: "transparent",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span className="material-symbols-outlined text-base sm:text-lg">
              chat_bubble
            </span>
            <span className="text-[9px] sm:text-xs font-bold">
              {commentsList.length > 0
                ? `(${commentsList.length})`
                : post.comment_count && !commentsList.length
                  ? `(${post.comment_count})`
                  : ""}
            </span>
          </button>

          {/* 3. SHARE BUTTON */}
          <button
            onClick={handleShare}
            className="flex items-center gap-0.5 sm:gap-1 text-slate-500 hover:text-[#34d399] dark:hover:text-[#55ffb0] transition-colors text-xs sm:text-sm bg-transparent outline-none select-none"
            style={{
              boxShadow: "none",
              border: "none",
              background: "transparent",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span className="material-symbols-outlined text-base sm:text-lg">
              share
            </span>
            <span className="hidden sm:inline text-xs font-bold">Share</span>
          </button>

          {/* 4. SAVE BUTTON */}
          <button
            onClick={handleToggleSave}
            className={`ml-auto flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm bg-transparent outline-none select-none ${
              isSaved
                ? "text-[#34d399] dark:text-[#55ffb0]"
                : "text-slate-500 hover:text-[#34d399] dark:hover:text-[#55ffb0]"
            }`}
            style={{
              boxShadow: "none",
              border: "none",
              background: "transparent",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span
              className="material-symbols-outlined text-base sm:text-lg"
              style={{
                fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              bookmark
            </span>
            <span className="hidden sm:inline text-xs font-bold">Save</span>
          </button>
        </div>

        {/* Comments section toggle logic starts below... */}
        {commentsOpen && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2 items-start">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleAddComment();
                  }}
                  placeholder="Add a comment..."
                  className="w-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 dark:focus:border-[#00ff88]/50 transition-colors pr-10 text-slate-800 dark:text-white placeholder:text-slate-400"
                  style={{ outline: "none", boxShadow: "none" }}
                />
                <button
                  onClick={handleAddComment}
                  className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-emerald-600 dark:text-[#00ff88] hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">
                    send
                  </span>
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {commentsList.length > 0 ? (
                commentsList.map((comment) => (
                  <div key={comment.id} className="flex gap-2 group">
                    <img
                      alt={comment.author}
                      className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 object-cover shrink-0"
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
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] text-slate-500 uppercase">
                            {formatTimeAgo(comment.timestamp)}
                          </span>
                          {String(comment.authorId) ===
                            String(currentUser.id) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                            >
                              <span className="material-symbols-outlined text-xs">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                        {comment.text}
                      </p>
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
        )}
      </div>
    </article>
  );
});

export const ResearchCard = memo(({ research }) => {
  const resId = research.research_id || research.id;
  const [expanded, setExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(() => {
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem("postLikes") || "{}");
      } catch {
        return {};
      }
    })();
    return saved[resId] !== undefined
      ? saved[resId]
      : research.is_liked === "1";
  });
  const [likeCount, setLikeCount] = useState(
    parseInt(research.like_count || 0),
  );
  const [isSaved, setIsSaved] = useState(() => {
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem("savedPosts") || "{}");
      } catch {
        return {};
      }
    })();
    return saved[resId] !== undefined
      ? saved[resId]
      : research.is_saved === "1";
  });
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  const fileUrl = buildMediaUrl(research.research_file);
  const keywords = Array.isArray(research.keywords) ? research.keywords : [];
  const abs = research.abstract || "";

  const handleToggleLike = async () => {
    const token = getLocalAuthToken();
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem("postLikes") || "{}");
      } catch {
        return {};
      }
    })();
    stored[resId] = !wasLiked;
    localStorage.setItem("postLikes", JSON.stringify(stored));
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/research/like-research/${resId}`,
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
        setIsLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
        stored[resId] = wasLiked;
        localStorage.setItem("postLikes", JSON.stringify(stored));
      }
    } catch {}
  };

  const handleToggleSave = async () => {
    const token = getLocalAuthToken();
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem("savedPosts") || "{}");
      } catch {
        return {};
      }
    })();
    stored[resId] = !wasSaved;
    localStorage.setItem("savedPosts", JSON.stringify(stored));
    if (wasSaved)
      window.dispatchEvent(
        new CustomEvent("postUnsaved", { detail: { postId: resId } }),
      );
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/research/research-save/${resId}`,
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
        setIsSaved(wasSaved);
        stored[resId] = wasSaved;
        localStorage.setItem("savedPosts", JSON.stringify(stored));
      }
    } catch {}
  };

  const fetchComments = async () => {
    const token = getLocalAuthToken();
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/research/get-comments/${resId}`,
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
      setCommentsList(fetched);
      setCommentsLoaded(true);
    } catch {}
  };

  const handleToggleComments = () => {
    if (!commentsOpen && !commentsLoaded) fetchComments();
    setCommentsOpen((v) => !v);
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    const clean = newCommentText.trim();
    const currentUser = getLocalCurrentUser();
    const tempId = `temp_${Date.now()}`;
    const temp = {
      id: tempId,
      text: clean,
      author: currentUser.name,
      authorId: currentUser.id,
      authorAvatar: currentUser.avatarUrl,
      timestamp: new Date().toISOString(),
    };
    setCommentsList((prev) => [temp, ...prev]);
    setNewCommentText("");
    const token = getLocalAuthToken();
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/research/add-comment/${resId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: clean }),
        },
      );
      const result = await res.json();
      if (result.status) {
        fetchComments();
      } else setCommentsList((prev) => prev.filter((c) => c.id !== tempId));
    } catch {
      setCommentsList((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentsList((prev) => prev.filter((c) => c.id != commentId));
    const token = getLocalAuthToken();
    try {
      await fetch(
        `${API_CONFIG.BASE_URL}/research/delete-comment/${commentId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {}
  };

  const currentUser = getLocalCurrentUser();

  return (
    <article className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-white/5 shadow-sm overflow-visible relative w-full">
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start gap-2 sm:gap-3 mb-3">
          <img
            alt={research.name || "User"}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0"
            src={getPostProfileSrc(research)}
            onError={(e) => {
              e.target.src = avatar;
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate capitalize">
                {research.name || "User"}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85] border border-[#00ff85]/20 px-2 py-0.5 text-[10px] font-bold shrink-0">
                <span className="material-symbols-outlined text-xs">
                  science
                </span>
                Research
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 capitalize">
              {research.user_type === "institute" ? "Institute" : "Individual"}{" "}
              • {formatActivityDate(research.created_at)}
            </p>
          </div>
        </div>
        <h4 className="mb-2 text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white">
          {research.research_title}
        </h4>
        {/* ⭐ 3 Lines Par Lock Text Content — 100% Full Proof Line Clamp */}
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
          <div className="mb-3 flex flex-wrap gap-1.5">
            {keywords.map((k, i) => (
              <span
                key={i}
                className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium"
              >
                {k}
              </span>
            ))}
          </div>
        )}
        {fileUrl && (
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0e0f10] p-2.5 sm:p-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-200 dark:bg-[#0f172a] border border-emerald-200 dark:border-[#00ff88]/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-lg sm:text-xl">
                  description
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {research.research_file.split("/").pop() || "Research Paper"}
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
        )}
      </div>
      {/* Action bar — same as MainContent */}
      <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 pt-2 sm:pt-3 border-t border-white/5 flex-wrap w-full">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${isLiked ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
          >
            <span
              className="material-symbols-outlined text-base sm:text-lg"
              style={{
                fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              favorite
            </span>
            <span className="text-[9px] sm:text-xs font-bold">
              {likeCount > 0 ? likeCount : "Like"}
            </span>
          </button>
          <button
            onClick={handleToggleComments}
            className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${commentsOpen ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
          >
            <span className="material-symbols-outlined text-base sm:text-lg">
              chat_bubble
            </span>
            <span className="text-[9px] sm:text-xs font-bold">
              {commentsList.length > 0
                ? `(${commentsList.length})`
                : research.comment_count && !commentsList.length
                  ? `(${research.comment_count})`
                  : ""}
            </span>
          </button>

          <button
            onClick={handleToggleSave}
            className={`ml-auto flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${isSaved ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
          >
            <span
              className="material-symbols-outlined text-base sm:text-lg"
              style={{
                fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              bookmark
            </span>
            <span className="hidden sm:inline text-xs font-bold">Save</span>
          </button>
        </div>
        {commentsOpen && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2 items-start">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleAddComment();
                  }}
                  placeholder="Add a comment..."
                  className="w-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 dark:focus:border-[#00ff88]/50 transition-colors pr-10 text-slate-800 dark:text-white placeholder:text-slate-400"
                  style={{ outline: "none", boxShadow: "none" }}
                />
                <button
                  onClick={handleAddComment}
                  className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-emerald-600 dark:text-[#00ff88] hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">
                    send
                  </span>
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {commentsList.length > 0 ? (
                commentsList.map((comment) => (
                  <div key={comment.id} className="flex gap-2 group">
                    <img
                      alt={comment.author}
                      className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 object-cover shrink-0"
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
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] text-slate-500 uppercase">
                            {formatTimeAgo(comment.timestamp)}
                          </span>
                          {String(comment.authorId) ===
                            String(currentUser.id) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                            >
                              <span className="material-symbols-outlined text-xs">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                        {comment.text}
                      </p>
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
        )}
      </div>
    </article>
  );
});

/* ─── poll helpers (mirrors MainContent vote logic exactly) ─── */
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

const seedPoll = (poll) => {
  const options = Array.isArray(poll.options)
    ? poll.options.map((o) => ({ ...o }))
    : [];
  let myVote = poll.my_vote_option_id;
  if (myVote === undefined || myVote === null || myVote === "") {
    const votedOpt = options.find((o) => Number(o.is_voted_by_me) === 1);
    myVote = votedOpt ? String(votedOpt.id) : null;
  } else {
    myVote = String(myVote);
  }
  return { ...poll, options, my_vote_option_id: myVote };
};

const applyLocalVote = (poll, optionId) => {
  const nextTotalVotes = (Number(poll.total_votes) || 0) + 1;

  const nextOptions = poll.options.map((o) => {
    const isTarget = String(o.id) === String(optionId);
    const nextCount = (Number(o.vote_count) || 0) + (isTarget ? 1 : 0);
    return {
      ...o,
      vote_count: nextCount,
      is_voted_by_me: isTarget ? 1 : 0,
    };
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
    return {
      ...o,
      vote_count: nextCount,
      is_voted_by_me: isNext ? 1 : 0,
    };
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
    return {
      ...o,
      vote_count: nextCount,
      is_voted_by_me: 0,
    };
  });

  return {
    ...poll,
    total_votes: nextTotalVotes,
    my_vote_option_id: null,
    options: recomputePollPercentages(nextOptions, nextTotalVotes),
  };
};

const pollVoteRequest = async ({ pollId, optionId }) => {
  const token = getLocalAuthToken();
  if (!token) throw new Error("Authentication required. Please login again.");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let response;
  try {
    response = await fetch(`${API_CONFIG.BASE_URL}/poll/vote-poll/${pollId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ option_id: Number(optionId) }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Voting timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const responseText = await response.text();
  if (responseText.includes("PHP Error") || responseText.includes("<div")) {
    throw new Error("Server error occurred while submitting vote.");
  }

  const data = JSON.parse(responseText);
  if (!data?.status) throw new Error(data?.message || "Vote failed.");
  return data;
};

const pollUndoRequest = async ({ pollId }) => {
  const token = getLocalAuthToken();
  if (!token) throw new Error("Authentication required. Please login again.");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let response;
  try {
    response = await fetch(`${API_CONFIG.BASE_URL}/poll/undo-vote/${pollId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Undo vote timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const responseText = await response.text();
  if (responseText.includes("PHP Error") || responseText.includes("<div")) {
    throw new Error("Server error occurred while removing vote.");
  }

  const data = JSON.parse(responseText);
  if (!data?.status) throw new Error(data?.message || "Undo vote failed.");
  return data;
};

export const PollCard = memo(({ poll }) => {
  const [localPoll, setLocalPoll] = useState(() => seedPoll(poll));
  const [isBusy, setIsBusy] = useState(false);

  const options = Array.isArray(localPoll.options) ? localPoll.options : [];
  const totalVotes = Number(localPoll.total_votes) || 0;
  const myVote = localPoll.my_vote_option_id;
  const pollId = localPoll.poll_id;

  const handlePollOptionClick = async (e, optionId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!pollId) return;
    if (isBusy) return;

    setIsBusy(true);

    const snapshot = clonePoll(localPoll);

    try {
      const currentVote = localPoll.my_vote_option_id;

      if (currentVote && String(currentVote) === String(optionId)) {
        setLocalPoll((p) => applyLocalUndo({ ...p, options: p.options || [] }));
        await pollUndoRequest({ pollId });
        return;
      }

      if (currentVote && String(currentVote) !== String(optionId)) {
        setLocalPoll((p) =>
          applyLocalSwitchVote({ ...p, options: p.options || [] }, optionId),
        );
        await pollUndoRequest({ pollId });
        await pollVoteRequest({ pollId, optionId });
        return;
      }

      setLocalPoll((p) =>
        applyLocalVote({ ...p, options: p.options || [] }, optionId),
      );
      await pollVoteRequest({ pollId, optionId });
    } catch (err) {
      setLocalPoll(() => snapshot);
      toast.error(err?.message || "Poll action failed");
    } finally {
      setIsBusy(false);
    }
  };

  const handlePollUndo = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!pollId) return;
    if (isBusy) return;

    setIsBusy(true);

    const snapshot = clonePoll(localPoll);

    try {
      setLocalPoll((p) => applyLocalUndo({ ...p, options: p.options || [] }));
      await pollUndoRequest({ pollId });
    } catch (err) {
      setLocalPoll(() => snapshot);
      toast.error(err?.message || "Undo vote failed");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <article className="bg-white border border-gray-200 text-slate-800 dark:bg-[#141414] dark:border-white/10 dark:text-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <ActivityAuthor item={localPoll} />
          <span className="inline-flex items-center gap-1 rounded-full bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85] border border-[#00ff85]/20 px-2.5 py-1 text-[11px] font-bold shrink-0">
            <MaterialIcon name="ballot" className="text-sm" />
            Poll
          </span>
        </div>
        <h4 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {localPoll.question}
        </h4>
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          {options.map((opt) => {
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
                onClick={(e) => handlePollOptionClick(e, opt.id)}
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

        <div className="mt-3 sm:mt-4 flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-500 gap-2">
          <span className="truncate">{totalVotes.toLocaleString()} votes</span>
          {myVote ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={(e) => handlePollUndo(e)}
              className="text-emerald-600 dark:text-[#00ff88] hover:text-emerald-600 dark:text-[#00ff88]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
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
});

/* ─────────────────────── skeleton ─────────────────────── */
const SkeletonLoader = () => (
  <div className="min-h-screen w-full bg-slate-50 text-slate-800 dark:bg-[#080a09] dark:text-white">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <div className="bg-white border border-gray-200 dark:bg-[#141414] dark:border-white/10 rounded-3xl overflow-hidden mb-5">
        <div className="h-40 sm:h-52 w-full bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] animate-shimmer" />
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 -mt-16">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full ring-4 ring-white dark:ring-[#141414] bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] animate-shimmer" />
            <div className="flex-1 text-center sm:text-left pt-2">
              <div className="h-8 w-56 mx-auto sm:mx-0 rounded-lg bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] animate-shimmer mb-2" />
              <div className="h-4 w-40 mx-auto sm:mx-0 rounded-lg bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <style jsx>{`
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .animate-shimmer {
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
      }

      .line-clamp-5 {
        -webkit-line-clamp: 5;
      }
      .line-clamp-10 {
        -webkit-line-clamp: 10;
      }
    `}</style>
  </div>
);

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const UserProfile = ({
  user: propUser,
  onClose: propOnClose,
  initialConnectionStatus: propInitialStatus,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};

  const user = propUser || routeState.user || null;
  const embedded = !!propUser;
  const initialConnectionStatus =
    propInitialStatus ?? routeState.initialConnectionStatus ?? 3;
  const onClose = propOnClose || (() => navigate(-1));

  const [connectionStatus, setConnectionStatus] = useState(
    initialConnectionStatus,
  );

  const [profileData, setProfileData] = useState(() => {
    if (user?.id) {
      const cached = profileCache.get(`profile_${user.id}`);
      if (cached && Date.now() - cached.time < 60000) return cached.data;
    }
    return {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        user_type: user?.user_type || "individual",
        registration_id:
          user?.registration_id &&
          String(user?.registration_id) !== String(user?.id)
            ? user.registration_id
            : user?.registration_no || "",
      },
      individual: {},
      profile_individual: {},
      institute: {},
      profile_institute: {},
    };
  });

  const [loading] = useState(() => {
    if (user?.id) {
      const cached = profileCache.get(`profile_${user.id}`);
      if (cached && Date.now() - cached.time < 60000) return false;
    }
    return false;
  });

  const [userType, setUserType] = useState(() => {
    if (user?.id) {
      const cached = profileCache.get(`profile_${user.id}`);
      if (cached && Date.now() - cached.time < 60000) return cached.userType;
    }
    const isInstitute =
      user?.type === "Research Institute" ||
      user?.organization_type ||
      user?.institute_name ||
      user?.user_type === "institute";
    return isInstitute ? "institute" : "individual";
  });

  const [showMenu, setShowMenu] = useState(false);
  const [menuButtonPos, setMenuButtonPos] = useState({ top: 0, right: 0 });
  const menuButtonRef = useRef(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isConnecting] = useState(false);
  const [openSections, setOpenSections] = useState({
    personal: true,
    professional: true,
    institute: true,
    admin: true,
    contact: true,
  });

  const [connectedUsersList, setConnectedUsersList] = useState([]);
  const [connectedCount, setConnectedCount] = useState(null);
  const [showConnectedPopup, setShowConnectedPopup] = useState(false);
  const [loadingConnected, setLoadingConnected] = useState(false);

  const [activity, setActivity] = useState({
    posts: [],
    research: [],
    polls: [],
  });
  const [activityLoading, setActivityLoading] = useState(false);

  /* ── Share modal state (same as MainContent) ── */
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedSharePostId, setSelectedSharePostId] = useState(null);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [shareAllUsers, setShareAllUsers] = useState([]);
  const [shareGroups, setShareGroups] = useState([]);

  const requestRef = useRef(null);

  const toggleSection = useCallback((section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const getAuthToken = () =>
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("authToken") ||
    null;

  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      const u = JSON.parse(userStr);
      if (Array.isArray(u) && u.length > 0)
        return String(u[0].id || u[0].user_id || "");
      return String(u.id || u.user_id || "");
    } catch {
      return null;
    }
  };

  const isOwnProfile = String(getCurrentUserId()) === String(user?.id);

  /* ── connection status (preserved verbatim) ── */
  useEffect(() => {
    if (!user?.id || isOwnProfile) return;
    const fetchConnectionStatus = async () => {
      try {
        const token = getAuthToken();
        let finalStatus = 3;
        const statusRes = await fetch(
          `${API_CONFIG.BASE_URL}/user/connection-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ connected_user_id: Number(user.id) }),
          },
        );
        const statusResult = await statusRes.json();
        if (statusResult.status && statusResult.data)
          finalStatus = Number(statusResult.data.connection_status);

        const [myListRes, profileListRes] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}/user/connected-users-list`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(
            `${API_CONFIG.BASE_URL}/user/connected-users-list-user/${user.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          ),
        ]);
        const myList = await myListRes.json();
        const profileList = await profileListRes.json();
        const currentUserId = getCurrentUserId();
        const foundInMyList =
          myList.status &&
          Array.isArray(myList.data) &&
          myList.data.some((item) => {
            const id = item.id || item.user_id || item.connected_user_id;
            return String(id) === String(user.id);
          });
        const foundInProfileList =
          profileList.status &&
          Array.isArray(profileList.data) &&
          profileList.data.some((item) => {
            const id = item.id || item.user_id || item.connected_user_id;
            return String(id) === String(currentUserId);
          });
        if (foundInMyList || foundInProfileList) finalStatus = 2;
        setConnectionStatus(finalStatus);
      } catch (err) {
        console.error("Connection status fetch error:", err);
      }
    };
    fetchConnectionStatus();
  }, [user?.id, isOwnProfile]);

  /* ── connected count ── */
  useEffect(() => {
    if (!user?.id) return;
    const fetchCount = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/user/connected-users-list-user/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const result = await res.json();
        if (result.status && result.data) {
          setConnectedUsersList(result.data);
          setConnectedCount(result.data.length);
        } else setConnectedCount(0);
      } catch {
        setConnectedCount(0);
      }
    };
    fetchCount();
  }, [user?.id]);

  /* ── profile data fetch ── */
  useEffect(() => {
    if (!user?.id) return;
    const cacheKey = `profile_${user.id}`;
    const cached = profileCache.get(cacheKey);
    if (cached && Date.now() - cached.time < 60000) return;
    if (requestRef.current) requestRef.current.abort();
    requestRef.current = new AbortController();
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const timeoutId = setTimeout(() => {
          if (requestRef.current) requestRef.current.abort();
        }, 5000);
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/profile/get-chat-user-profile/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: requestRef.current.signal,
          },
        );
        clearTimeout(timeoutId);
        const result = await response.json();
        if (result.status && result.data) {
          const apiUserType =
            result.data.user?.user_type ||
            (result.data.institute ? "institute" : "individual");
          setUserType(apiUserType);
          setProfileData(result.data);
          profileCache.set(cacheKey, {
            data: result.data,
            userType: apiUserType,
            time: Date.now(),
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
        }
      }
    };
    fetchData();
    return () => {
      if (requestRef.current) requestRef.current.abort();
    };
  }, [user?.id]);

  /* ── Share data fetch (same as MainContent) ── */
  useEffect(() => {
    fetchShareData(getAuthToken, setShareAllUsers, setShareGroups);
  }, []);

  /* ── real-time connection listener ── */
  useEffect(() => {
    const handleUpdate = (e) => {
      if (String(e.detail.userId) === String(user?.id))
        setConnectionStatus(e.detail.status);
    };
    window.addEventListener("connectionStatusUpdated", handleUpdate);
    return () =>
      window.removeEventListener("connectionStatusUpdated", handleUpdate);
  }, [user?.id]);

  /* ── activity feed fetch ── */
  useEffect(() => {
    if (!user?.id) return;
    let aborted = false;
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const token = getAuthToken();
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/post/user-created-content/${user.id}`,
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
        if (!aborted) setActivityLoading(false);
      }
    };
    fetchActivity();
    return () => {
      aborted = true;
    };
  }, [user?.id]);

  const fetchConnectedUsers = async () => {
    if (!user?.id) return;
    setLoadingConnected(true);
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/user/connected-users-list-user/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await res.json();
      if (result.status && result.data) {
        setConnectedUsersList(result.data);
        setConnectedCount(result.data.length);
      } else {
        setConnectedUsersList([]);
        setConnectedCount(0);
      }
    } catch {
      setConnectedCount(0);
    } finally {
      setLoadingConnected(false);
    }
  };

  const handleOpenConnectedPopup = () => {
    setShowConnectedPopup(true);
    if (connectedUsersList.length === 0) fetchConnectedUsers();
  };

  const getProfileImage = () => {
    if (!profileData) return user?.avatars?.[0] || avatar;
    const profileImage =
      profileData.profile_institute?.profile_image ||
      profileData.profile_individual?.profile_image ||
      profileData.user?.profile_image;
    const image = profileImage || user?.avatars?.[0];
    if (!image) return avatar;
    if (image.startsWith("http")) return image;
    if (image.startsWith("data:")) return image;
    return `${API_CONFIG.BASE_URL}${image.startsWith("/") ? image : "/" + image}`;
  };

  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  const getIndividualData = () => profileData?.profile_individual || {};
  const getInstituteProfileData = () => profileData?.profile_institute || {};
  const getInstituteData = () => profileData?.institute || {};
  const getUserData = () => profileData?.user || {};

  const handleEditProfile = () => {
    if (userType === "institute") {
      navigate("/dashboard/institute-edit-profile");
    } else {
      navigate("/dashboard/individual-edit-profile");
    }
  };

  const handleBlockUser = async () => {
    if (!user?.id) return;
    setIsBlocking(true);
    setShowMenu(false);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/account/block-unblock-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: String(user.id) }),
        },
      );
      const result = await response.json();
      if (result.status) {
        toast.success(result.message || "User blocked successfully");
        onClose();
      } else toast.error(result.message || "Failed to block user");
    } catch {
      toast.error("Error blocking user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleConnect = async () => {
    if (!user?.id || isFlipping) return;
    if (connectionStatus === 1) return;
    // isFlipping handled locally via timeout pattern (preserved from original)
    const token = getAuthToken();
    setTimeout(async () => {
      try {
        if (connectionStatus === 2) {
          const res = await fetch(
            `${API_CONFIG.BASE_URL}/user/disconnect-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ connected_user_id: String(user.id) }),
            },
          );
          const result = await res.json();
          if (result.status) {
            setConnectionStatus(3);
            profileCache.delete(`profile_${user.id}`);
            window.dispatchEvent(
              new CustomEvent("connectionStatusUpdated", {
                detail: { userId: String(user.id), status: 3 },
              }),
            );
          }
        } else {
          const res = await fetch(`${API_CONFIG.BASE_URL}/user/connect-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ connected_user_id: String(user.id) }),
          });
          const result = await res.json();
          if (result.status) {
            setConnectionStatus(1);
            profileCache.delete(`profile_${user.id}`);
            window.dispatchEvent(
              new CustomEvent("connectionStatusUpdated", {
                detail: { userId: String(user.id), status: 1 },
              }),
            );
          }
        }
      } catch {
        toast.error("Error. Please try again.");
      }
    }, 50);
  };

  if (loading) return <SkeletonLoader />;

  const userData = getUserData();
  const individualData = getIndividualData();
  const instituteProfileData = getInstituteProfileData();
  const instituteData = getInstituteData();

  /* ── Work experience builder ──
     company / job_role / duration / description ko index-wise zip karke
     ek experience list banata hai. individualData & parseArrayField component
     scope me hone ke kaaran ye function bhi yahin (component body) me hai. */
  const buildExperience = () => {
    const companies = parseArrayField(individualData.company);
    const roles = parseArrayField(individualData.job_role);
    const durations = parseArrayField(individualData.duration);
    const descriptions = parseArrayField(individualData.description);
    const len = Math.max(
      companies.length,
      roles.length,
      durations.length,
      descriptions.length,
    );
    const list = [];
    for (let i = 0; i < len; i++) {
      const entry = {
        company: companies[i] || "",
        role: roles[i] || "",
        duration: durations[i] || "",
        description: descriptions[i] || "",
      };
      if (entry.company || entry.role || entry.duration || entry.description)
        list.push(entry);
    }
    return list;
  };
  const experienceList = buildExperience();

  const getDisplayName = () => {
    if (userType === "institute")
      return (
        instituteData.institute_name ||
        instituteProfileData.organization_name ||
        userData.name ||
        "Institute"
      );
    return userData.name || user?.name || "User";
  };

  /* ── Registration ID resolver ── */
  const regId =
    userData.registration_id ||
    individualData.registration_id ||
    instituteProfileData.registration_id ||
    instituteData.registration_id ||
    profileData?.registration_id ||
    (user?.registration_id && String(user?.registration_id) !== String(user?.id)
      ? user.registration_id
      : "") ||
    user?.registration_no ||
    activity.posts[0]?.registration_id ||
    activity.research[0]?.registration_id ||
    activity.polls[0]?.registration_id ||
    "N/A";

  const aboutText =
    userType === "institute"
      ? instituteData.institute_description ||
        instituteProfileData.institute_description
      : individualData.short_bio;

  const locationSummary =
    userType === "institute"
      ? [
          instituteProfileData.city,
          instituteProfileData.state,
          instituteProfileData.country,
        ]
          .filter(Boolean)
          .join(", ")
      : [individualData.city, individualData.state, individualData.country]
          .filter(Boolean)
          .join(", ");

  const headlineRole =
    userType === "individual"
      ? individualData.describes || "Individual Researcher"
      : instituteProfileData.organization_type || "Research Institute";

  /* ── 3 stats (no Connections) ── */
  const stats = [
    { icon: "post_add", label: "Posts", value: activity.posts.length },
    { icon: "science", label: "Research", value: activity.research.length },
    { icon: "ballot", label: "Polls", value: activity.polls.length },
  ];

  const connectionPreview = connectedUsersList.slice(0, 5);

  /* ── section-content guards ── */
  const personalHasContent =
    hasVal(userData.name) ||
    hasVal(individualData.date_of_birth) ||
    hasVal(individualData.short_bio) ||
    hasVal(individualData.language) ||
    hasVal(individualData.country) ||
    hasVal(individualData.state) ||
    hasVal(individualData.city) ||
    hasVal(individualData.pincode);

  const professionalHasContent =
    hasVal(individualData.describes) ||
    hasVal(individualData.current_research) ||
    hasVal(
      individualData.year_of_experience_vijay ||
        individualData.year_of_experience,
    ) ||
    hasVal(individualData.skills_vijay || individualData.skills) ||
    hasVal(
      individualData.previous_publication_vijay ||
        individualData.previous_publication,
    ) ||
    parseArrayField(individualData.job_role).length > 0 ||
    parseArrayField(individualData.company).length > 0 ||
    parseArrayField(individualData.interest).length > 0 ||
    parseArrayField(individualData.developement_goals).length > 0 ||
    parseArrayField(individualData.duration).length > 0 ||
    parseArrayField(individualData.description).length > 0;

  const instituteHasContent =
    hasVal(instituteData.institute_name) ||
    hasVal(instituteProfileData.organization_type) ||
    hasVal(instituteProfileData.country) ||
    hasVal(instituteProfileData.state) ||
    hasVal(instituteProfileData.city) ||
    hasVal(instituteData.address) ||
    hasVal(instituteProfileData.establishment_year) ||
    parseArrayField(instituteProfileData.research_focus).length > 0 ||
    parseArrayField(instituteProfileData.platform).length > 0;

  const adminHasContent =
    hasVal(userData.name) || hasVal(instituteData.professional_role);

  const contactHasContent =
    hasVal(userData.email) ||
    hasVal(
      userType === "institute"
        ? instituteData.contact_no
        : individualData.contact_no,
    ) ||
    hasVal(
      userType === "institute" ? instituteData.website : individualData.website,
    ) ||
    hasVal(
      userType === "institute"
        ? instituteProfileData.linkedin
        : individualData.linkedin,
    ) ||
    hasVal(
      userType === "institute"
        ? instituteProfileData.research_gate
        : individualData.research_gate,
    ) ||
    hasVal(
      userType === "institute"
        ? instituteProfileData.orc_id
        : individualData.orc_id,
    ) ||
    hasVal(
      userType === "institute"
        ? instituteProfileData.personal_website
        : individualData.personal_website,
    );

  /* ── 2 most-recent items for preview (newest-first assumed from API) ── */
  const recentItems = [
    ...activity.posts
      .slice(0, 2)
      .map((p) => ({ type: "post", data: p, time: p.created_at })),
    ...activity.research
      .slice(0, 2)
      .map((r) => ({ type: "research", data: r, time: r.created_at })),
    ...activity.polls
      .slice(0, 2)
      .map((p) => ({ type: "poll", data: p, time: p.created_at })),
  ]
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .slice(0, 2);

  const totalActivity =
    activity.posts.length + activity.research.length + activity.polls.length;

  const rootClass = embedded
    ? "h-full w-full overflow-y-auto bg-slate-50 text-slate-800 dark:bg-[#080a09] dark:text-white"
    : "min-h-screen w-full bg-slate-50 text-slate-800 dark:bg-[#080a09] dark:text-white";

  const handleShowAllPosts = () => {
    navigate("/user-activity", {
      state: { user, activity, displayName: getDisplayName() },
    });
  };

  return (
    <div className={rootClass}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {/* ══════════ HERO / COVER ══════════ */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] shadow-sm mb-5">
          {/* Banner */}
          <div className="relative h-40 sm:h-52 w-full bg-gradient-to-br from-[#00ff85]/30 via-emerald-400/10 to-transparent dark:from-[#00ff85]/20 dark:via-emerald-500/5 dark:to-transparent">
            <div
              className="absolute inset-0 opacity-40 dark:opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(0,255,133,0.18) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="absolute -top-20 -right-10 h-60 w-60 rounded-full bg-[#00ff85]/20 blur-3xl" />
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 group flex items-center gap-1.5 rounded-full bg-white/85 dark:bg-black/40 backdrop-blur px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-white hover:bg-white dark:hover:bg-black/60 transition-colors shadow-sm"
            >
              <MaterialIcon
                name="arrow_back"
                className="text-lg group-hover:-translate-x-0.5 transition-transform"
              />
              Back
            </button>
          </div>

          <div className="px-5 sm:px-8 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-5">
              {/* Avatar */}
              <div className="relative -mt-20 sm:-mt-24 shrink-0 self-center lg:self-auto">
                <div className="rounded-full p-[3px] bg-gradient-to-br from-[#00ff85] to-emerald-500 shadow-xl">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full ring-4 ring-white dark:ring-[#141414] bg-gray-100 dark:bg-[#13231a] overflow-hidden">
                    <img
                      className="w-full h-full rounded-full object-cover"
                      src={getProfileImage()}
                      alt={getDisplayName()}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = avatar;
                      }}
                    />
                  </div>
                </div>
                <span className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-[#00ff85] border-4 border-white dark:border-[#141414]" />
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white capitalize">
                  {getDisplayName()}
                </h1>

                <div className="mt-2.5 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85] border border-[#00ff85]/30 px-3 py-1 text-xs font-semibold">
                    <MaterialIcon
                      name={userType === "individual" ? "verified" : "domain"}
                      className="text-sm"
                    />
                    {userType === "individual"
                      ? "Individual Researcher"
                      : "Research Institute"}
                  </span>
                  {locationSummary && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-3 py-1 text-xs font-medium">
                      <MaterialIcon name="location_on" className="text-sm" />
                      {locationSummary}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-3 py-1 text-xs font-medium">
                    <MaterialIcon name="badge" className="text-sm" />
                    Registration ID:&nbsp;
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {regId}
                    </span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-2 sm:gap-3 self-center lg:self-auto">
                {!isOwnProfile ? (
                  <>
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting || connectionStatus === 1}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-transform disabled:opacity-60 select-none ${
                        connectionStatus === 2
                          ? "bg-transparent border-2 border-green-500/40 text-green-500 dark:text-green-400 hover:bg-green-500/10"
                          : connectionStatus === 1
                            ? "bg-transparent border-2 border-yellow-500/40 text-yellow-500 dark:text-yellow-400 cursor-not-allowed"
                            : "bg-[#00ff85] text-[#0a120e] hover:bg-[#00e676]"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-base ${isFlipping ? "flip" : ""}`}
                      >
                        {connectionStatus === 2
                          ? "how_to_reg"
                          : connectionStatus === 1
                            ? "schedule"
                            : "person_add"}
                      </span>
                      <span>
                        {connectionStatus === 2
                          ? "Connected"
                          : connectionStatus === 1
                            ? "Pending"
                            : "Connect"}
                      </span>
                    </button>

                    <div className="relative">
                      <button
                        ref={menuButtonRef}
                        onClick={() => {
                          if (menuButtonRef.current) {
                            const rect =
                              menuButtonRef.current.getBoundingClientRect();
                            setMenuButtonPos({
                              top: rect.bottom + 8,
                              right: window.innerWidth - rect.right,
                            });
                          }
                          setShowMenu(!showMenu);
                        }}
                        disabled={isBlocking}
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-transparent border border-gray-200 dark:border-white/20 text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      >
                        {isBlocking ? (
                          <div className="w-4 h-4 border-2 border-slate-300 dark:border-white/40 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
                        ) : (
                          <MaterialIcon name="more_vert" className="text-xl" />
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#00ff85] hover:bg-[#00e676] rounded-xl text-[#0a120e] transition-all text-sm font-bold shadow-md border-none"
                  >
                    <MaterialIcon
                      name="edit"
                      className="text-base sm:text-lg"
                    />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ TWO-COLUMN BODY ══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* ── SIDEBAR ── */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            {aboutText && (
              <SideCard icon="info" title="About">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                  {aboutText}
                </p>
              </SideCard>
            )}

            <SideCard icon="group" title="Connections">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {connectedCount === null ? "…" : connectedCount}
                </p>
                {connectionPreview.length > 0 && (
                  <div className="flex -space-x-2">
                    {connectionPreview.map((u) => {
                      const imgSrc = u.profile_image
                        ? u.profile_image.startsWith("http")
                          ? u.profile_image
                          : `${API_CONFIG.BASE_URL}/${u.profile_image}`
                        : null;
                      return (
                        <img
                          key={u.user_id}
                          src={imgSrc || avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-[#141414] object-cover bg-gray-200 dark:bg-[#13231a]"
                          onError={(e) => {
                            e.target.src = avatar;
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={handleOpenConnectedPopup}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-[#00ff85]/40 transition-colors"
              >
                View all connections
                <MaterialIcon name="chevron_right" className="text-base" />
              </button>
            </SideCard>

            {/* Contact — only if has data */}
            <SectionCard
              icon="contact_mail"
              title="Contact & Social"
              isOpen={openSections.contact}
              onToggle={() => toggleSection("contact")}
              hasContent={contactHasContent}
            >
              <FieldInfo
                label="Email Address"
                value={userData.email}
                icon="mail"
              />
              <FieldInfo
                label="Phone Number"
                value={
                  userType === "institute"
                    ? instituteData.contact_no
                    : individualData.contact_no
                }
                icon="phone"
              />
              <LinkField
                label="Website"
                value={
                  userType === "institute"
                    ? instituteData.website
                    : individualData.website
                }
              />
              <LinkField
                label="LinkedIn Profile"
                value={
                  userType === "institute"
                    ? instituteProfileData.linkedin
                    : individualData.linkedin
                }
              />
              <LinkField
                label="ResearchGate Profile"
                value={
                  userType === "institute"
                    ? instituteProfileData.research_gate
                    : individualData.research_gate
                }
              />
              <LinkField
                label="ORCID ID"
                value={
                  userType === "institute"
                    ? instituteProfileData.orc_id
                    : individualData.orc_id
                }
              />
              <LinkField
                label="Personal Website"
                value={
                  userType === "institute"
                    ? instituteProfileData.personal_website
                    : individualData.personal_website
                }
              />
            </SectionCard>
          </aside>

          {/* ── MAIN ── */}
          <main className="lg:col-span-2 space-y-5">
            {/* Personal Info — only if individual + has data */}
            {userType === "individual" && (
              <SectionCard
                icon="person"
                title="Personal Information"
                isOpen={openSections.personal}
                onToggle={() => toggleSection("personal")}
                hasContent={personalHasContent}
              >
                <FieldInfo
                  label="Full Name"
                  value={userData.name}
                  icon="person"
                />
                <FieldInfo
                  label="Date of Birth"
                  value={individualData.date_of_birth}
                  icon="cake"
                />
                <FieldInfo
                  label="Short Bio"
                  value={individualData.short_bio}
                  icon="description"
                />
                <FieldInfo
                  label="Language"
                  value={individualData.language}
                  icon="language"
                />
                <FieldInfo
                  label="Country"
                  value={individualData.country}
                  icon="public"
                />
                <FieldInfo
                  label="State"
                  value={individualData.state}
                  icon="map"
                />
                <FieldInfo
                  label="City"
                  value={individualData.city}
                  icon="location_on"
                />
                <FieldInfo
                  label="Pincode"
                  value={individualData.pincode}
                  icon="pin_drop"
                />
              </SectionCard>
            )}

            {/* Professional Info */}
            {userType === "individual" && (
              <SectionCard
                icon="school"
                title="Professional Information"
                isOpen={openSections.professional}
                onToggle={() => toggleSection("professional")}
                hasContent={professionalHasContent}
              >
                <FieldInfo
                  label="Research Level"
                  value={individualData.describes}
                  icon="school"
                />
                <FieldInfo
                  label="Years of Experience"
                  value={
                    individualData.year_of_experience_vijay ||
                    individualData.year_of_experience
                  }
                  icon="workspace_premium"
                />
                <FieldInfo
                  label="Skills"
                  value={individualData.skills_vijay || individualData.skills}
                  icon="psychology"
                />
                <FieldInfo
                  label="Previous Publications"
                  value={
                    individualData.previous_publication_vijay ||
                    individualData.previous_publication
                  }
                  icon="menu_book"
                />
                {(parseArrayField(individualData.developement_goals).length >
                  0 ||
                  parseArrayField(individualData.interest).length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TagsField
                      icon="eco"
                      label="Sustainable Development Goals"
                      items={parseArrayField(individualData.developement_goals)}
                    />
                    <TagsField
                      icon="diversity_3"
                      label="Collaboration Interests"
                      items={parseArrayField(individualData.interest)}
                    />
                  </div>
                )}
                <HighlightField
                  icon="trending_up"
                  label="Current Research Level"
                  value={individualData.current_research}
                />
                {experienceList.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85]">
                        <MaterialIcon name="work" className="text-lg" />
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                        Work Experience
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {experienceList.map((exp, i) => (
                        <ExperienceItem key={i} exp={exp} />
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Institute Details */}
            {userType === "institute" && (
              <SectionCard
                icon="domain"
                title="Institute Details"
                isOpen={openSections.institute}
                onToggle={() => toggleSection("institute")}
                hasContent={instituteHasContent}
              >
                <FieldInfo
                  label="Institute Name"
                  value={instituteData.institute_name}
                  icon="domain"
                />
                <FieldInfo
                  label="Institute Type"
                  value={instituteProfileData.organization_type}
                  icon="category"
                />
                <FieldInfo
                  label="Country"
                  value={instituteProfileData.country}
                  icon="public"
                />
                <FieldInfo
                  label="State"
                  value={instituteProfileData.state}
                  icon="map"
                />
                <FieldInfo
                  label="City"
                  value={instituteProfileData.city}
                  icon="location_on"
                />
                <FieldInfo
                  label="Address"
                  value={instituteData.address}
                  icon="home"
                />
                <FieldInfo
                  label="Establishment Year"
                  value={instituteProfileData.establishment_year}
                  icon="event"
                />
                <TagsField
                  label="Research Focus"
                  items={parseArrayField(instituteProfileData.research_focus)}
                />
                <TagsField
                  label="Platforms"
                  items={parseArrayField(instituteProfileData.platform)}
                />
              </SectionCard>
            )}

            {/* Admin Info */}
            {userType === "institute" && (
              <SectionCard
                icon="admin_panel_settings"
                title="Administrator Information"
                isOpen={openSections.admin}
                onToggle={() => toggleSection("admin")}
                hasContent={adminHasContent}
              >
                <FieldInfo
                  label="Administrator Name"
                  value={userData.name}
                  icon="person"
                />
                <FieldInfo
                  label="Professional Role"
                  value={instituteData.professional_role}
                  icon="work"
                />
              </SectionCard>
            )}

            {/* ══════════ ACTIVITY PREVIEW (2 most recent) ══════════ */}
            <div className="bg-white border border-gray-200 dark:bg-[#141414] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              {/* ══════════ RECENT ACTIVITY HEADER WITH COMPACT STATS ══════════ */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-b border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00ff85]/10 text-[#00c46a] dark:text-[#00ff85]">
                    <MaterialIcon name="dynamic_feed" className="text-xl" />
                  </span>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg">
                      Activity
                    </h3>
                  </div>
                </div>

                {/* ── CLEAN & COMPACT INLINE STATS CHHOTE PILLS ── */}
                <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                  {stats.map((s) => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
                    >
                      <MaterialIcon
                        name={s.icon}
                        className="text-sm text-[#00c46a] dark:text-[#00ff85]"
                      />
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {s.value}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {s.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-gray-50/50 dark:bg-[#0a120e]/40">
                {activityLoading ? (
                  <div className="flex items-center justify-center gap-3 py-10">
                    <div className="w-5 h-5 border-2 border-[#00ff85]/30 border-t-[#00ff85] rounded-full animate-spin" />
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      Loading activity...
                    </span>
                  </div>
                ) : recentItems.length === 0 ? (
                  <ActivityEmpty
                    icon="dynamic_feed"
                    text="No activity to show yet."
                  />
                ) : (
                  <div className="space-y-4">
                    {recentItems.map((item) => {
                      if (item.type === "post")
                        return (
                          <PostCard
                            key={`post-${item.data.id}`}
                            post={item.data}
                            onShareClick={(id) => {
                              setSelectedSharePostId(id);
                              setIsShareOpen(true);
                            }}
                          />
                        );
                      if (item.type === "research")
                        return (
                          <ResearchCard
                            key={`res-${item.data.research_id}`}
                            research={item.data}
                          />
                        );
                      return (
                        <PollCard
                          key={`poll-${item.data.poll_id}`}
                          poll={item.data}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Show All Posts button */}
              {totalActivity > 0 && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#141414]">
                  <button
                    onClick={handleShowAllPosts}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#00ff85]/40 bg-[#00ff85]/5 hover:bg-[#00ff85]/10 dark:border-[#00ff85]/30 dark:hover:bg-[#00ff85]/10 px-5 py-3 text-sm font-bold text-[#00c46a] dark:text-[#00ff85] transition-all group"
                  >
                    <MaterialIcon name="grid_view" className="text-lg" />
                    Show All Posts & Activity
                    <MaterialIcon
                      name="arrow_forward"
                      className="text-base group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── 3-dot menu — fixed positioned so it escapes overflow-hidden hero card ── */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="fixed z-[9999] w-44 bg-white dark:bg-[#0f1a14] border border-red-200 dark:border-red-500/20 rounded-lg overflow-hidden shadow-2xl"
            style={{ top: menuButtonPos.top, right: menuButtonPos.right }}
          >
            <button
              onClick={handleBlockUser}
              className="w-full px-3 py-2.5 flex items-center gap-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium"
            >
              <MaterialIcon name="block" className="text-base" />
              <span>Block User</span>
            </button>
          </div>
        </>
      )}

      {/* Share modal — same as MainContent */}
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

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .flip {
          animation: flip 0.3s ease-in-out;
        }
        @keyframes flip {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>

      {/* ── Connected Users Popup (unchanged) ── */}
      {showConnectedPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowConnectedPopup(false)}
        >
          <div
            className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#00ff85]/20 rounded-2xl w-full max-w-sm shadow-2xl animate-fadeInUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <MaterialIcon
                  name="group"
                  className="text-[#00c46a] dark:text-[#00ff85] text-xl"
                />
                <h3 className="text-slate-900 dark:text-white font-bold text-base">
                  Connected Users
                  {connectedCount !== null && (
                    <span className="ml-2 text-xs font-normal bg-emerald-500 text-white dark:bg-[#00ff85] dark:text-[#0a120e] px-2 py-0.5 rounded-full border border-[#00ff85]/20">
                      {connectedCount}
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setShowConnectedPopup(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto hide-scrollbar">
              {loadingConnected ? (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="w-5 h-5 border-2 border-[#00ff85]/30 border-t-[#00ff85] rounded-full animate-spin" />
                  <span className="text-slate-600 dark:text-slate-400 text-sm">
                    Loading...
                  </span>
                </div>
              ) : connectedUsersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <MaterialIcon
                    name="group_off"
                    className="text-3xl text-slate-500 dark:text-slate-600"
                  />
                  <p className="text-slate-500 text-sm">No connections yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-white/5">
                  {connectedUsersList.map((u) => {
                    const imgSrc = u.profile_image
                      ? u.profile_image.startsWith("http")
                        ? u.profile_image
                        : `${API_CONFIG.BASE_URL}/${u.profile_image}`
                      : null;
                    return (
                      <div
                        key={u.user_id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full border border-[#00ff85]/20 overflow-hidden shrink-0 bg-gray-200 dark:bg-[#13231a]">
                          <img
                            src={imgSrc || avatar}
                            alt={u.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = avatar;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 dark:text-white font-semibold text-sm truncate capitalize">
                            {u.user_type === "institute" && u.institute_name
                              ? u.institute_name
                              : u.name}
                          </p>
                          <p className="text-slate-500 text-xs truncate">
                            {u.registration_id} •{" "}
                            <span className="capitalize">{u.user_type}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
