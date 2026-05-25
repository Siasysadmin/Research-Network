import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout"; // ✅ Admin Layout
import defaultAvatar from "../../assets/images/avatar.jpg";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

// ─────────────────────────────────────────
// MaterialIcon Helper
// ─────────────────────────────────────────
const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

// ─────────────────────────────────────────
// SavedPostCard Component
// ─────────────────────────────────────────
const SavedPostCard = ({ post, currentUserId, onUnsave }) => {
  const [refreshingComments, setRefreshingComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(true);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [postData, setPostData] = useState(post);

  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newCommentText, setNewCommentText] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingPostData, setLoadingPostData] = useState(false);

  const videoRef = useRef(null);

  const hasImage = postData.image && postData.image !== "";
  const hasVideo = postData.video && postData.video !== "";
  const videoUrl = hasVideo ? `${API_CONFIG.BASE_URL}/${postData.video}` : null;
  const isCurrentUserPost = String(currentUserId) === String(postData.user_id);

  const textLength = postData.post_text ? postData.post_text.length : 0;
  const needsReadMore = textLength > 700;
  const displayText = isExpanded
    ? postData.post_text
    : postData.post_text?.substring(0, 700);

  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  // ── Fetch fresh post data ──
  const fetchFreshPostData = async () => {
    setLoadingPostData(true);
    const token = getAuthToken();
    const isResearch = postData.isResearchPost === true;
    const actualId = postData.researche_id || postData.id;

    try {
      if (isResearch) {
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/research/get-published-research`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await res.json();
        if (result.status && result.data) {
          const freshPost = result.data.find(
            (p) =>
              String(p.researche_id) === String(actualId) ||
              String(p.id) === String(actualId)
          );
          if (freshPost) {
            setIsLiked(freshPost.is_liked === "1");
            setLikeCount(parseInt(freshPost.like_count || 0));
            setCommentCount(parseInt(freshPost.comment_count || 0));
          } else {
            setIsLiked(postData.is_liked === "1");
            setLikeCount(parseInt(postData.like_count || 0));
            setCommentCount(parseInt(postData.comment_count || 0));
          }
        }
      } else {
        const res = await fetch(`${API_CONFIG.BASE_URL}/post/get-posts`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (result.status && result.data) {
          const freshPost = result.data.find(
            (p) => String(p.id) === String(postData.id)
          );
          if (freshPost) {
            setPostData(freshPost);
            setIsLiked(freshPost.is_liked === "1");
            setLikeCount(parseInt(freshPost.like_count || 0));
            setCommentCount(parseInt(freshPost.comment_count || 0));
          } else {
            setIsLiked(postData.is_liked === "1");
            setLikeCount(parseInt(postData.like_count || 0));
            setCommentCount(parseInt(postData.comment_count || 0));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch fresh post data:", err);
      setIsLiked(postData.is_liked === "1");
      setLikeCount(parseInt(postData.like_count || 0));
      setCommentCount(parseInt(postData.comment_count || 0));
    } finally {
      setLoadingPostData(false);
    }
  };

  useEffect(() => {
    fetchFreshPostData();
  }, [post.id, post.researche_id]);

  useEffect(() => {
    const handlePostLiked = (event) => {
      const { postId, isLiked: newIsLiked } = event.detail;
      if (postId === postData.id) {
        setIsLiked(newIsLiked);
        fetchFreshPostData();
      }
    };
    window.addEventListener("postLiked", handlePostLiked);
    return () => window.removeEventListener("postLiked", handlePostLiked);
  }, [postData.id]);

  // ── Video Controls ──
  const toggleVideoPlayPause = (event) => {
    event.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch((err) => console.error(err));
        setIsVideoPaused(false);
      } else {
        videoRef.current.pause();
        setIsVideoPaused(true);
      }
    }
  };

  const toggleVideoSound = (event) => {
    event.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsVideoMuted(videoRef.current.muted);
    }
  };

  // ── Like ──
  const handleLike = async () => {
    const token = getAuthToken();
    const isResearch = postData.isResearchPost === true;
    const actualId = postData.researche_id || postData.id;
    const wasLiked = isLiked;
    const currentCount = likeCount;

    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1);

    const endpoint = isResearch
      ? `${API_CONFIG.BASE_URL}/research/like-research/${actualId}`
      : `${API_CONFIG.BASE_URL}/post/like-post/${postData.id}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!result.status) {
        setIsLiked(wasLiked);
        setLikeCount(currentCount);
        toast.error("Failed to like");
      }
    } catch (err) {
      setIsLiked(wasLiked);
      setLikeCount(currentCount);
      toast.error("Network error while liking");
    }
  };

  // ── Comments ──
  const fetchCommentsOnly = async (showLoader = true) => {
    if (showLoader) setLoadingComments(true);
    else setRefreshingComments(true);

    const token = getAuthToken();
    const isResearch = postData.isResearchPost === true;
    const actualId = postData.researche_id || postData.id;

    const endpoint = isResearch
      ? `${API_CONFIG.BASE_URL}/research/get-comments/${actualId}`
      : `${API_CONFIG.BASE_URL}/post/get-comments/${postData.id}`;

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.status && result.data) {
        const fetchedComments = result.data.map((c) => ({
          id: c.id,
          text: c.comment,
          author: c.name,
          authorId: c.user_id,
          authorAvatar: (() => {
            const img = c.profile_image || c.user_profile || c.image;
            if (!img) return defaultAvatar;
            if (String(img).startsWith("http")) return img;
            return `${API_CONFIG.BASE_URL}/${img}`;
          })(),
          timestamp: c.created_at,
        }));
        setCommentsList(fetchedComments);
        setCommentCount(fetchedComments.length);
      } else {
        setCommentsList([]);
        setCommentCount(0);
      }
    } catch (err) {
      console.error("Get comments error:", err);
      toast.error("Failed to load comments");
    } finally {
      if (showLoader) setLoadingComments(false);
      else setRefreshingComments(false);
    }
  };

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    await fetchCommentsOnly(true);
  };

  const addComment = async () => {
    if (!newCommentText.trim()) return;
    const token = getAuthToken();
    const commentTextToAdd = newCommentText.trim();
    const isResearch = postData.isResearchPost === true;
    const actualId = postData.researche_id || postData.id;

    const endpoint = isResearch
      ? `${API_CONFIG.BASE_URL}/research/add-comment/${actualId}`
      : `${API_CONFIG.BASE_URL}/post/add-comment/${postData.id}`;

    setNewCommentText("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: commentTextToAdd }),
      });
      const result = await res.json();
      if (result.status) {
        await fetchCommentsOnly(false);
      } else {
        toast.error(result.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("Add comment error:", err);
      toast.error("Network error while adding comment");
    }
  };

  const deleteComment = async (commentId) => {
    const token = getAuthToken();
    const isResearch = postData.isResearchPost === true;

    setCommentsList((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((prev) => Math.max(0, prev - 1));

    const endpoint = isResearch
      ? `${API_CONFIG.BASE_URL}/research/delete-comment/${commentId}`
      : `${API_CONFIG.BASE_URL}/post/delete-comment/${commentId}`;

    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!result.status) {
        toast.error("Failed to delete comment");
        await fetchCommentsOnly();
      } else {
        toast.success("Comment deleted");
      }
    } catch (err) {
      console.error("Delete comment error:", err);
      toast.error("Network error while deleting");
      await fetchCommentsOnly();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: postData.name,
          text: postData.post_text?.substring(0, 100),
          url: window.location.href,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    let normalized = String(timestamp).replace(" ", "T");
    if (!normalized.endsWith("Z") && !normalized.includes("+")) {
      normalized += "Z";
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

  return (
    <article className="bg-[#141414] rounded-2xl border border-white/5 shadow-sm overflow-hidden relative mb-6 sm:mb-8">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-5 mt-2 sm:mt-4 mb-3 sm:mb-4">
          <img
            alt={postData.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff85]/20 object-cover shrink-0"
            src={
              postData.profile_image
                ? `${API_CONFIG.BASE_URL}/${postData.profile_image}`
                : defaultAvatar
            }
            onError={(e) => { e.target.src = defaultAvatar; }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-bold text-white hover:text-[#00ff85] cursor-pointer transition-colors capitalize truncate text-sm sm:text-base">
                  {postData.institute_name ? postData.institute_name : postData.name}
                </h4>
                <p className="text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1">
                  {postData.institute_name ? "Institute" : "Individual"}
                  <span className="w-1 h-1 rounded-full bg-slate-500 inline-block"></span>
                  {new Date(postData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Post Text */}
        <div className="text-xs sm:text-sm leading-relaxed text-slate-300 break-words whitespace-pre-wrap mb-3 sm:mb-4">
          {displayText}
          {needsReadMore && !isExpanded && "..."}
        </div>
        {needsReadMore && (
          <div className="mb-3 sm:mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#00ff85] hover:text-white text-xs sm:text-sm font-bold transition-colors"
            >
              {isExpanded ? "Read less" : "Read more"}
            </button>
          </div>
        )}

        {/* Media */}
        {(hasImage || hasVideo) && (
          <div className="relative w-full bg-black overflow-hidden mt-3 sm:mt-4 rounded-xl">
            {hasImage && (
              <div className="w-full flex items-center justify-center bg-black">
                <img
                  src={`${API_CONFIG.BASE_URL}/${postData.image}`}
                  alt="Post Media"
                  className="w-full h-auto object-contain max-h-[600px] md:max-h-[700px]"
                  onError={(e) => { e.target.src = postData.image; }}
                />
              </div>
            )}
            {hasVideo && (
              <div
                className="relative w-full bg-black flex items-center justify-center"
                style={{ minHeight: "300px", maxHeight: "700px" }}
              >
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls={false}
                  muted={isVideoMuted}
                  playsInline
                  className="w-full h-full object-contain"
                  onClick={toggleVideoPlayPause}
                  onPlay={() => setIsVideoPaused(false)}
                  onPause={() => setIsVideoPaused(true)}
                />
                {isVideoPaused && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/50 transition-all group"
                    onClick={toggleVideoPlayPause}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00ff85] to-[#00dd77] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                      <MaterialIcon name="play_arrow" className="text-4xl sm:text-5xl text-black ml-1" />
                    </div>
                  </div>
                )}
                <button
                  onClick={toggleVideoSound}
                  className="absolute bottom-4 right-4 bg-black/80 hover:bg-black/95 text-white rounded-full p-3 transition-all z-10"
                >
                  <MaterialIcon name={isVideoMuted ? "volume_off" : "volume_up"} className="text-xl sm:text-2xl" />
                </button>
                <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 rounded-lg text-xs text-white font-semibold">
                  Video
                </div>
              </div>
            )}
          </div>
        )}

        {/* Research File */}
        {postData.research_file && postData.isResearchPost && (
          <div className="mt-3 sm:mt-4 rounded-xl overflow-hidden border border-white/10 bg-[#0e0f10] p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-[#0f172a] border border-[#00ff85]/20 flex items-center justify-center shrink-0">
                  <MaterialIcon name="description" className="text-[#00ff85] text-xl sm:text-2xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                    {postData.research_file.split("/").pop() || "Research Paper"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                    PDF • {postData.research_title || "Research Document"}
                  </p>
                </div>
              </div>
              <a
                href={`${API_CONFIG.BASE_URL}/${postData.research_file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-[#00ff85] text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-[#00dd77] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm sm:text-base">open_in_new</span>
                View PDF
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-6 pt-4 border-t border-white/5 flex-wrap">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 sm:gap-2 transition-all ${
              isLiked ? "text-[#00ff85]" : "text-slate-500 hover:text-[#00ff85]"
            }`}
          >
            <MaterialIcon
              name="favorite"
              className="text-lg sm:text-xl"
              style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
            />
            {likeCount > 0 ? (
              <span className="text-xs sm:text-sm font-bold">{likeCount}</span>
            ) : (
              <span className="hidden sm:inline text-xs font-bold">Like</span>
            )}
          </button>

          {/* Comment */}
          <button
            onClick={toggleComments}
            className={`flex items-center gap-1 sm:gap-2 transition-all ${
              showComments ? "text-[#00ff85]" : "text-slate-500 hover:text-[#00ff85]"
            }`}
          >
            <MaterialIcon name="chat_bubble" className="text-lg sm:text-xl" />
            {commentCount > 0 || commentsList.length > 0 ? (
              <span className="text-xs sm:text-sm font-bold">
                {commentsList.length > 0 ? commentsList.length : commentCount}
              </span>
            ) : (
              <span className="hidden sm:inline text-xs font-bold">Comment</span>
            )}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-[#00ff85] transition-all"
          >
            <MaterialIcon name="share" className="text-lg sm:text-xl" />
            <span className="hidden sm:inline text-xs font-bold">Share</span>
          </button>

          {/* Unsave */}
          <button
            onClick={() => onUnsave(postData.id)}
            className="ml-auto flex items-center gap-1 sm:gap-2 text-[#00ff85] hover:text-white transition-all"
          >
            <MaterialIcon
              name="bookmark"
              className="text-lg sm:text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <span className="hidden sm:inline text-xs font-bold">Saved</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
            <div className="flex gap-2 sm:gap-3 items-start">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyPress={(e) => { if (e.key === "Enter") addComment(); }}
                  placeholder="Add a comment..."
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#00ff85]/50 transition-colors pr-10 text-white"
                  style={{ outline: "none", boxShadow: "none" }}
                />
                <button
                  onClick={addComment}
                  className="absolute right-3 top-2 sm:top-2.5 text-[#00ff88] hover:text-[#00ff88]/80 transition-colors"
                >
                  <MaterialIcon name="send" className="text-sm" />
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00ff85]"></div>
                </div>
              ) : commentsList.length > 0 ? (
                commentsList.map((comment) => (
                  <div key={comment.id} className="flex gap-2 sm:gap-3 group">
                    <img
                      alt={comment.author}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 object-cover shrink-0"
                      src={comment.authorAvatar || defaultAvatar}
                      onError={(e) => { e.target.src = defaultAvatar; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{comment.author}</span>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                          <span className="text-[10px] text-slate-500 uppercase">
                            {formatTimeAgo(comment.timestamp)}
                          </span>
                          {comment.authorId === currentUserId && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                            >
                              <MaterialIcon name="delete" className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs text-slate-300 mt-1 leading-relaxed ${
                        expandedComments[comment.id] ? "" : "line-clamp-3"
                      }`}>
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
                          className="text-[10px] text-[#00ff88] mt-1 hover:underline"
                        >
                          {expandedComments[comment.id] ? "Show less" : "Read more"}
                        </button>
                      )}
                      <div className="border-b border-white/10 mt-3"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest italic">
                    No comments yet. Be the first to discuss!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

// ─────────────────────────────────────────
// MAIN PAGE — AdminSavedPosts
// ─────────────────────────────────────────
const AdminSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeNav, setActiveNav] = useState("save"); // ✅ Sidebar mein "Save" highlight hoga

  // ── Get current user ID ──
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setUserId(parsed.id || parsed.user_id);
      }
    } catch (e) {}
  }, []);

  // ── Fetch saved posts on mount ──
  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const [regRes, resRes] = await Promise.allSettled([
        fetch(`${API_CONFIG.BASE_URL}/post/get-saved-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`${API_CONFIG.BASE_URL}/research/get-saved-researches`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

      let regularPosts =
        regRes.status === "fulfilled" && Array.isArray(regRes.value.data)
          ? regRes.value.data
          : [];

      let researchPosts =
        resRes.status === "fulfilled" && Array.isArray(resRes.value.data)
          ? resRes.value.data
          : [];

      const transformedResearch = researchPosts.map((r) => ({
        ...r,
        id: r.research_id || r.id,
        isResearchPost: true,
        created_at: r.created_at || new Date().toISOString(),
      }));

      const finalData = [...transformedResearch, ...regularPosts].filter(
        (p) => p && (p.id || p.researche_id)
      );

      setSavedPosts(finalData);
    } catch (error) {
      console.error("Fetch saved posts error:", error);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Unsave handler ──
  const handleToggleSave = async (postId) => {
    try {
      const token = getAuthToken();
      const post = savedPosts.find(
        (p) => p.id === postId || p.researche_id === postId
      );
      if (!post) return;

      const isResearch = post.isResearchPost === true || !!post.research_file;
      const idToSend = post.researche_id || post.id;

      const endpoint = isResearch
        ? `${API_CONFIG.BASE_URL}/research/research-save/${idToSend}`
        : `${API_CONFIG.BASE_URL}/post/save-post/${idToSend}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.status) {
        toast.success("Removed from saved");
        setSavedPosts((prev) =>
          prev.filter((p) => p.id !== postId && p.researche_id !== postId)
        );
        const savedState = JSON.parse(
          localStorage.getItem("savedPosts") || "{}"
        );
        delete savedState[postId];
        localStorage.setItem("savedPosts", JSON.stringify(savedState));
      } else {
        toast.error(result.message || "Failed to unsave");
      }
    } catch (error) {
      console.error("Unsave error:", error);
      toast.error("Network error");
    }
  };

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
      <div className="max-w-3xl mx-auto py-6 sm:py-10">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#e2e3e0] uppercase">
            Saved Posts
          </h1>
          <div className="flex items-center gap-2 text-[#b9cbb9] mt-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Your bookmarked content
            </span>
            <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]"></div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff85]"></div>
          </div>
        ) : savedPosts.length > 0 ? (
          savedPosts.map((post) => (
            <SavedPostCard
              key={post.id || post.researche_id}
              post={post}
              currentUserId={userId}
              onUnsave={handleToggleSave}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 border-2 border-dashed border-[#1e3a2c] rounded-xl opacity-60">
            <span className="material-symbols-outlined text-5xl sm:text-6xl text-[#b9cbb9]/30 mb-4">
              bookmark
            </span>
            <p className="text-[#b9cbb9] font-medium uppercase tracking-widest text-xs">
              No saved posts yet
            </p>
          </div>
        )}
      </div>

      <style>{`
        ::-webkit-scrollbar { display: none; width: 0; height: 0; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </Layout>
  );
};

export default AdminSavedPosts;