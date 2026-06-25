import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import avatar from "../../assets/images/avatar.jpg";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken");

// ✅ SINGLE POST CARD
const PostCard = ({ post, onPostClick, onDeletePost }) => {
  const [liked, setLiked] = useState(post.is_liked === "1");
  const [likeCount, setLikeCount] = useState(parseInt(post.like_count || 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const avatarSrc =
    post.profile_image && post.profile_image !== ""
      ? `${API_CONFIG.BASE_URL}/${post.profile_image}`
      : avatar;
  const hasImage = post.image && post.image !== "";
  const hasVideo = post.video && post.video !== "";

  const handleLike = async (e) => {
    e.stopPropagation();
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(wasLiked ? Math.max(0, likeCount - 1) : likeCount + 1);
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/like-post/${post.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      const result = await res.json();
      if (!result.status) {
        setLiked(wasLiked);
        setLikeCount(wasLiked ? likeCount : likeCount - 1);
        toast.error("Failed to like");
      }
    } catch {
      setLiked(wasLiked);
      toast.error("Network error");
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  return (
    <div
      onClick={() => onPostClick && onPostClick(post)}
      className="
  bg-white dark:bg-[#141414]
  border border-gray-200 dark:border-white/10
  rounded-xl sm:rounded-2xl overflow-hidden flex flex-col h-full
  transition-all duration-200
  hover:border-gray-300 dark:hover:border-white/20
  hover:shadow-xl cursor-pointer
"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt={post.name}
            className="w-9 h-9 rounded-full border-2 border-[#00ff85]/30 object-cover bg-gray-200"
            onError={(e) => {
              e.target.src = avatar;
            }}
          />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
              {post.institute_name || post.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {new Date(post.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-lg"
          >
            <MaterialIcon name="more_vert" className="text-xl" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-1 min-w-[130px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDeletePost) {
                    onDeletePost(post.id);
                  }
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
              >
                <MaterialIcon name="delete" className="text-base" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {post.post_text && (
        <div className="px-4 pb-3">
          <p
            className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: post.image && post.image.trim() !== "" ? 3 : 14,
              overflow: "hidden",
            }}
          >
            {post.post_text}
          </p>
        </div>
      )}

      {/* Image */}
      {hasImage && (
        <div className="w-full bg-gray-100 dark:bg-black">
          <img
            src={`${API_CONFIG.BASE_URL}/${post.image}`}
            alt="post"
            className="w-full object-cover max-h-[280px]"
            onError={(e) => {
              e.target.src = post.image;
            }}
          />
        </div>
      )}

      {/* Video */}
      {hasVideo && (
        <div className="relative w-full bg-black">
          <video
            src={`${API_CONFIG.BASE_URL}/${post.video}`}
            className="w-full object-cover max-h-[280px] opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-[#00ff85] rounded-full flex items-center justify-center shadow-lg">
              <MaterialIcon
                name="play_arrow"
                className="text-3xl text-black ml-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/5">
        {" "}
        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-all ${
              liked
                ? "text-[#00ff85]"
                : "text-slate-500 dark:text-slate-400 hover:text-[#00ff85]"
            }`}
          >
            <MaterialIcon
              name="favorite"
              className="text-[22px]"
              style={{
                fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
              }}
            />

            <span className="text-sm font-semibold">{likeCount}</span>
          </button>

          {/* <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-[#00ff85]"
          >
            <MaterialIcon
              name="chat_bubble"
              className="text-[21px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            />

            {parseInt(post.comment_count) > 0 && (
              <span className="text-sm font-semibold">
                {post.comment_count}
              </span>
            )}
          </button> */}
        </div>
      </div>
    </div>
  );
};

// ✅ POST MODAL
const PostModal = ({ post, onClose }) => {
  const [liked, setLiked] = useState(post?.is_liked === "1");
  const [likeCount, setLikeCount] = useState(parseInt(post?.like_count || 0));
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId =
    currentUser?.id || currentUser?.user_id || localStorage.getItem("user_id");
  const avatarSrc =
    post?.profile_image && post.profile_image !== ""
      ? `${API_CONFIG.BASE_URL}/${post.profile_image}`
      : avatar;
  const hasImage = post?.image && post.image !== "";
  const hasVideo = post?.video && post.video !== "";

  useEffect(() => {
    if (!post) return;
    fetchComments();
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [post]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/get-comments/${post.id}`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      const result = await res.json();
      if (result.status && result.data) {
        setComments(
          result.data.map((c) => ({
            id: c.id,
            user_id: c.user_id,
            author: c.name,
            text: c.comment,
            time: c.created_at,
            avatar: c.profile_image
              ? `${API_CONFIG.BASE_URL}/${c.profile_image}`
              : null,
          })),
        );
      }
    } catch {
      // silent
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(wasLiked ? Math.max(0, likeCount - 1) : likeCount + 1);
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/like-post/${post.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      const result = await res.json();
      if (!result.status) {
        setLiked(wasLiked);
        toast.error("Failed to like");
      }
    } catch {
      setLiked(wasLiked);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText("");
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/post/add-comment/${post.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ comment: text }),
        },
      );
      const result = await res.json();
      if (result.status) fetchComments();
      else toast.error("Failed to add comment");
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/post/delete-comment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.status) {
        // toast.success(result.msg || "Comment deleted successfully");

        setComments((prev) =>
          prev.filter((comment) => String(comment.id) !== String(commentId)),
        );

        return;
      }

      toast.error(result.msg || "Failed to delete comment");
    } catch (error) {
      console.error("Delete Comment Error:", error);
      toast.error("Something went wrong");
    }
  };

  const formatCommentTime = (time) => {
    if (!time) return "JUST NOW";

    const now = new Date();
    const commentDate = new Date(time.replace(" ", "T"));

    if (isNaN(commentDate.getTime())) return "JUST NOW";

    const diffMs = now - commentDate;
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "JUST NOW";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (!post) return null;

  const isTextOnly = !hasImage && !hasVideo;

  // ─────────────────────────────────────────────
  // TEXT-ONLY POST → compact single-column modal
  // ─────────────────────────────────────────────
  if (isTextOnly) {
    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-md"
          style={{
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
          onClick={onClose}
        />

        {/* Modal wrapper */}
        {/* Modal wrapper */}
        <div
          className="fixed inset-x-0 top-0 bottom-16 md:inset-0 z-[9999] flex items-end md:items-center justify-center md:p-6"
          onClick={onClose}
        >
          <div
            className="
              relative
              w-full md:w-[min(560px,calc(100vw-32px))]
              h-full md:h-[80vh]
              bg-white dark:bg-[#0a0a0a]
              rounded-t-2xl md:rounded-2xl
              overflow-hidden shadow-2xl
              flex flex-col
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 dark:bg-black/60 text-white hover:bg-black/70 transition-all flex items-center justify-center"
            >
              <MaterialIcon name="close" className="text-xl" />
            </button>

            {/* Author header */}
            <div className="flex items-center gap-3 px-4 py-3 pr-14 border-b border-gray-200 dark:border-white/10 shrink-0">
              <img
                src={avatarSrc}
                alt={post.name}
                className="w-9 h-9 rounded-full border-2 border-[#00ff85]/30 object-cover shrink-0"
                onError={(e) => {
                  e.target.src = avatar;
                }}
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white capitalize truncate">
                  {post.institute_name || post.name}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(post.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Scrollable area: post text + comments */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 min-h-0">
              {post.post_text && (
                <div className="flex gap-3">
                  <img
                    src={avatarSrc}
                    alt={post.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#00ff85]/30 shrink-0"
                    onError={(e) => {
                      e.target.src = avatar;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      <span className="font-bold text-slate-900 dark:text-white mr-1">
                        {post.institute_name || post.name}
                      </span>
                      {post.post_text}
                    </p>
                    {post.hash_tag && post.hash_tag.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.hash_tag.map((tag, index) => (
                          <span
                            key={index}
                            className="text-sm font-medium text-[#00b86b] dark:text-[#00ff85] hover:underline cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {loadingComments ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00ff85]" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.avatar ? comment.avatar : avatar}
                      alt={comment.author}
                      className="w-8 h-8 rounded-full object-cover bg-gray-200 shrink-0"
                      onError={(e) => {
                        e.target.src = avatar;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {comment.author}
                        </span>
                        <span className="flex items-center gap-2 text-[11px] uppercase text-slate-400 whitespace-nowrap shrink-0">
                          {formatCommentTime(comment.time)}
                          {String(comment.user_id) ===
                            String(currentUserId) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComment(comment.id);
                              }}
                              className="text-red-400 hover:text-red-500 transition-colors"
                            >
                              <MaterialIcon
                                name="delete"
                                className="text-base"
                              />
                            </button>
                          )}
                        </span>
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {comment.text}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pt-4 text-center">
                  <p className="text-sm text-slate-500">No comments yet.</p>
                </div>
              )}
            </div>

            {/* Like / comment action row */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={handleLike}>
                  <MaterialIcon
                    name="favorite"
                    className={`text-3xl ${liked ? "text-[#00ff85]" : "text-slate-700 dark:text-white"}`}
                    style={{
                      fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
                    }}
                  />
                </button>
                <button>
                  <MaterialIcon
                    name="chat_bubble"
                    className="text-3xl text-slate-700 dark:text-white"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  />
                </button>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {likeCount} likes
              </p>
            </div>

            {/* Comment input */}
            <form
              onSubmit={handleAddComment}
              className="flex items-center gap-2 px-3 py-3 pb-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0b0b] shrink-0"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-white/10 border-0 focus:ring-2 focus:ring-[#00ff85] outline-none text-slate-800 dark:text-white min-w-0"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-full bg-[#00ff85] text-black font-bold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00ff85]/90 transition-all shrink-0"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </>,
      document.body,
    );
  }

  // ─────────────────────────────────────────────
  // IMAGE / VIDEO POST → existing two-column modal
  // ─────────────────────────────────────────────
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-md"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
        onClick={onClose}
      />

      {/* Modal wrapper - bottom nav ke upar se shuru */}
      {/* Modal wrapper - bottom nav ke upar se shuru */}
      <div
        className="fixed inset-x-0 top-0 bottom-16 md:inset-0 z-[9999] flex items-end md:items-center justify-center md:p-6"
        onClick={onClose}
      >
        <div
          className="
      relative
      w-full md:w-[min(980px,calc(100vw-32px))]
      h-full md:h-[85vh]
      bg-white dark:bg-[#0a0a0a]
      rounded-t-2xl md:rounded-2xl
      overflow-hidden shadow-2xl
      flex flex-col
    "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all flex items-center justify-center"
          >
            <MaterialIcon name="close" className="text-xl sm:text-2xl" />
          </button>

          {/* phone=column, desktop=row — FULL HEIGHT */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Left - Media */}
            <div className="w-full md:w-[540px] bg-gray-100 dark:bg-black flex items-center justify-center p-3 shrink-0 max-h-[38vh] md:max-h-none md:min-h-[300px]">
              {hasImage && (
                <img
                  src={`${API_CONFIG.BASE_URL}/${post.image}`}
                  alt="Post"
                  className="max-w-full max-h-[35vh] md:max-h-[72vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = post.image;
                  }}
                />
              )}
              {hasVideo && (
                <video
                  src={`${API_CONFIG.BASE_URL}/${post.video}`}
                  controls
                  className="max-w-full max-h-[35vh] md:max-h-[60vh] rounded-lg"
                />
              )}
            </div>

            {/* Right - Comments */}
            <div
              className="
    flex-1 flex flex-col min-h-0
    bg-white dark:bg-[#111111]
    border-t md:border-t-0 md:border-l
    border-gray-200 dark:border-white/10
  "
            >
              {/* Author header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/10 shrink-0">
                <img
                  src={avatarSrc}
                  alt={post.name}
                  className="w-9 h-9 rounded-full border-2 border-[#00ff85]/30 object-cover shrink-0"
                  onError={(e) => {
                    e.target.src = avatar;
                  }}
                />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {post.institute_name || post.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Scrollable area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 min-h-0">
                {post.post_text && (
                  <div className="flex gap-3">
                    <img
                      src={avatarSrc}
                      alt={post.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#00ff85]/30 shrink-0"
                      onError={(e) => {
                        e.target.src = avatar;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        <span className="font-bold text-slate-900 dark:text-white mr-1">
                          {post.institute_name || post.name}
                        </span>
                        {post.post_text}
                      </p>
                      {post.hash_tag && post.hash_tag.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.hash_tag.map((tag, index) => (
                            <span
                              key={index}
                              className="text-sm font-medium text-[#00b86b] dark:text-[#00ff85] hover:underline cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {loadingComments ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00ff85]" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.avatar ? comment.avatar : avatar}
                        alt={comment.author}
                        className="w-8 h-8 rounded-full object-cover bg-gray-200 shrink-0"
                        onError={(e) => {
                          e.target.src = avatar;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {comment.author}
                          </span>
                          <span className="flex items-center gap-2 text-[11px] uppercase text-slate-400 whitespace-nowrap shrink-0">
                            {formatCommentTime(comment.time)}
                            {String(comment.user_id) ===
                              String(currentUserId) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment.id);
                                }}
                                className="text-red-400 hover:text-red-500 transition-colors"
                              >
                                <MaterialIcon
                                  name="delete"
                                  className="text-base"
                                />
                              </button>
                            )}
                          </span>
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {comment.text}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pt-8 text-center">
                    <p className="text-sm text-slate-500">No comments yet.</p>
                  </div>
                )}
              </div>

              {/* Like count */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={handleLike}>
                    <MaterialIcon
                      name="favorite"
                      className={`text-3xl ${liked ? "text-[#00ff85]" : "text-slate-700 dark:text-white"}`}
                      style={{
                        fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
                      }}
                    />
                  </button>
                  <button>
                    <MaterialIcon
                      name="chat_bubble"
                      className="text-3xl text-slate-700 dark:text-white"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    />
                  </button>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  {likeCount} likes
                </p>
              </div>

              {/* Comment input */}
              <form
                onSubmit={handleAddComment}
                className="flex items-center gap-2 px-3 py-3 pb-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0b0b] shrink-0"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 rounded-xl text-sm bg-gray-100 dark:bg-white/10 border-0 focus:ring-2 focus:ring-[#00ff85] outline-none text-slate-800 dark:text-white min-w-0"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 rounded-full bg-[#00ff85] text-black font-bold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00ff85]/90 transition-all shrink-0"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

// ✅ POLL MODAL
const PollModal = ({ poll, onClose }) => {
  if (!poll) return null;

  const avatarSrc =
    poll.profile_image && poll.profile_image !== ""
      ? `${API_CONFIG.BASE_URL}/${poll.profile_image}`
      : avatar;

  const totalVotes = parseInt(poll.total_votes || 0);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-md"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
        onClick={onClose}
      />

      {/* Modal wrapper */}

      <div
        className="fixed inset-x-0 top-0 bottom-16 md:inset-0 z-[9999] flex items-end md:items-center justify-center md:p-6"
        onClick={onClose}
      >
        <div
          className="
            relative
            w-full md:w-[min(620px,calc(100vw-32px))]
            h-full md:h-[75vh]
            bg-white dark:bg-[#0a0a0a]
            rounded-t-2xl md:rounded-2xl
            overflow-hidden shadow-2xl
            flex flex-col
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all flex items-center justify-center"
          >
            <MaterialIcon name="close" className="text-xl sm:text-2xl" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/10 shrink-0">
            <img
              src={avatarSrc}
              alt={poll.name}
              className="w-10 h-10 rounded-full border-2 border-[#00ff85]/30 object-cover bg-gray-200"
              onError={(e) => {
                e.target.src = avatar;
              }}
            />

            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                {poll.name}
              </p>

              <p className="text-xs text-slate-400">
                {new Date(
                  String(poll.created_at).replace(" ", "T"),
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            <div className="flex gap-3">
              <img
                src={avatarSrc}
                alt={poll.name}
                className="w-8 h-8 rounded-full object-cover border border-[#00ff85]/30 shrink-0"
                onError={(e) => {
                  e.target.src = avatar;
                }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-white mr-1">
                    {poll.name}
                  </span>
                  {poll.question}
                </p>
              </div>
            </div>

            {/* Poll Options */}
            <div className="space-y-3 pt-2">
              {Array.isArray(poll.options) &&
                poll.options.map((option) => {
                  const isVoted = Number(option.is_voted_by_me) === 1;
                  const percentage = parseInt(option.percentage || 0);

                  return (
                    <div
                      key={option.id}
                      className={`
                        relative overflow-hidden rounded-xl border px-4 py-3
                        ${
                          isVoted
                            ? "border-[#00ff85]/60 bg-[#00ff85]/10"
                            : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
                        }
                      `}
                    >
                      <div
                        className={`
                          absolute left-0 top-0 h-full transition-all duration-300
                          ${isVoted ? "bg-[#00ff85]/20" : "bg-white/5"}
                        `}
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {isVoted && (
                            <MaterialIcon
                              name="check_circle"
                              className="text-[20px] text-[#00ff85] shrink-0"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            />
                          )}

                          <span className="text-sm font-semibold text-slate-800 dark:text-white">
                            {option.option_text}
                          </span>
                        </div>

                        <span
                          className={`text-sm font-bold shrink-0 ${
                            isVoted
                              ? "text-[#00ff85]"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <p className="pt-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
              {totalVotes} {totalVotes === 1 ? "Vote" : "Votes"}
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

// ✅ POLL CARD
const PollCard = ({ poll, onPollClick }) => {
  const avatarSrc =
    poll.profile_image && poll.profile_image !== ""
      ? `${API_CONFIG.BASE_URL}/${poll.profile_image}`
      : avatar;

  const totalVotes = parseInt(poll.total_votes || 0);

  return (
    <div
      onClick={() => onPollClick && onPollClick(poll)}
      className="
        bg-white dark:bg-[#141414]
        border border-gray-200 dark:border-white/10
        rounded-xl sm:rounded-2xl overflow-hidden flex flex-col h-full
        transition-all duration-200
        hover:border-gray-300 dark:hover:border-white/20
        hover:shadow-xl cursor-pointer
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt={poll.name}
            className="w-9 h-9 rounded-full border-2 border-[#00ff85]/30 object-cover bg-gray-200"
            onError={(e) => {
              e.target.src = avatar;
            }}
          />

          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
              {poll.name}
            </p>

            <p className="text-[11px] text-slate-400">
              {new Date(
                String(poll.created_at).replace(" ", "T"),
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#00ff85]/10 text-[#00ff85] border border-[#00ff85]/20">
          Poll
        </span>
      </div>

      {/* Question */}
      <div className="px-4 pb-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-white leading-relaxed line-clamp-2">
          {poll.question}
        </p>
      </div>

      {/* Options */}
      <div className="px-4 pb-4 space-y-2">
        {Array.isArray(poll.options) &&
          poll.options.map((option) => {
            const isVoted = Number(option.is_voted_by_me) === 1;
            const percentage = parseInt(option.percentage || 0);

            return (
              <div
                key={option.id}
                className={`
                  relative overflow-hidden rounded-xl border px-3 py-2.5
                  ${
                    isVoted
                      ? "border-[#00ff85]/50 bg-[#00ff85]/10"
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30"
                  }
                `}
              >
                <div
                  className={`
                    absolute left-0 top-0 h-full transition-all duration-300
                    ${isVoted ? "bg-[#00ff85]/20" : "bg-white/5"}
                  `}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {isVoted && (
                      <MaterialIcon
                        name="check_circle"
                        className="text-[18px] text-[#00ff85] shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      />
                    )}

                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">
                      {option.option_text}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold shrink-0 ${
                      isVoted
                        ? "text-[#00ff85]"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <MaterialIcon name="how_to_vote" className="text-[20px]" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            {totalVotes} {totalVotes === 1 ? "Vote" : "Votes"}
          </span>
        </div>

        {poll.my_vote_option_id && (
          <span className="text-[11px] font-bold text-[#00ff85] uppercase tracking-widest">
            Voted
          </span>
        )}
      </div>
    </div>
  );
};

// ✅ MAIN Myposts COMPONENT
const Myposts = ({ viewMode = "grid", filter = "All Posts" }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPoll, setSelectedPoll] = useState(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const normalizeDate = (dateValue) => {
    if (!dateValue) return 0;

    const date = new Date(String(dateValue).replace(" ", "T"));
    return isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const fetchFeed = async () => {
    setLoading(true);

    try {
      const [postRes, pollRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/post/get-posts-auth`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }),

        fetch(`${API_CONFIG.BASE_URL}/poll/my-poll-list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }),
      ]);

      const postResult = await postRes.json();
      const pollResult = await pollRes.json();

      const posts =
        postResult.status && Array.isArray(postResult.data)
          ? postResult.data.map((post) => ({
              ...post,
              feed_type: "post",
              feed_id: `post-${post.id}`,
            }))
          : [];

      const polls =
        pollResult.status && Array.isArray(pollResult.data)
          ? pollResult.data.map((poll) => ({
              ...poll,
              feed_type: "poll",
              feed_id: `poll-${poll.poll_id}`,
            }))
          : [];

      const mergedFeed = [...posts, ...polls].sort(
        (a, b) => normalizeDate(b.created_at) - normalizeDate(a.created_at),
      );

      setFeedItems(mergedFeed);
    } catch (error) {
      console.error("Feed Load Error:", error);
      toast.error("Failed to load posts and polls");
      setFeedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getPostType = (post) => {
    if (post.video && post.video !== "") return "video";
    if (post.image && post.image !== "") return "image";
    return "text";
  };

  const filteredItems = feedItems.filter((item) => {
    if (filter === "All Posts") return true;

    // ✅ Poll filter optional future ke liye
    if (filter === "Polls") return item.feed_type === "poll";

    // ✅ Images/Videos/Text sirf posts par apply honge
    if (item.feed_type !== "post") return false;

    const type = getPostType(item);

    if (filter === "Images") return type === "image";
    if (filter === "Videos") return type === "video";
    if (filter === "Text") return type === "text";

    return true;
  });

  const handlePostClick = (post) => {
    setSelectedPost(post);
    document.body.style.overflow = "hidden";
  };

  const handlePollClick = (poll) => {
    setSelectedPoll(poll);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setSelectedPoll(null);
    document.body.style.overflow = "auto";
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/post/delete-post/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.status) {
        toast.success(result.msg || "Post deleted successfully");

        setFeedItems((prev) =>
          prev.filter(
            (item) =>
              !(
                item.feed_type === "post" && String(item.id) === String(postId)
              ),
          ),
        );

        setSelectedPost(null);
        return;
      }

      toast.error(result.msg || "Failed to delete post");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff85]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {filteredItems.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
              : "flex flex-col gap-4"
          }
        >
          {filteredItems.map((item) => {
            if (item.feed_type === "poll") {
              return (
                <PollCard
                  key={item.feed_id}
                  poll={item}
                  onPollClick={handlePollClick}
                />
              );
            }

            return (
              <PostCard
                key={item.feed_id}
                post={item}
                onPostClick={handlePostClick}
                onDeletePost={handleDeletePost}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl opacity-60">
          <MaterialIcon
            name="article"
            className="text-5xl text-slate-300 dark:text-white/20 mb-3"
          />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
            No posts or polls found
          </p>
        </div>
      )}

      {selectedPost && (
        <PostModal post={selectedPost} onClose={handleCloseModal} />
      )}

      {selectedPoll && (
        <PollModal poll={selectedPoll} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Myposts;
