import React, { useState, useEffect, useRef, useCallback } from "react";
import avatar from "../assets/images/avatar.jpg";
import { Layout } from "./Layout/Layout";
import API_CONFIG from "../config/api.config";
import { toast } from "react-toastify";

const MainContent = () => {
  const [activeNav, setActiveNav] = useState("home");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [feedData, setFeedData] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [commentsState, setCommentsState] = useState({});
  const [showOptionsId, setShowOptionsId] = useState(null);
  const [savedPosts, setSavedPosts] = useState({});
  const [videoMutedState, setVideoMutedState] = useState({});
  const [deletingPost, setDeletingPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [pausedVideos, setPausedVideos] = useState({});
  const [newCommentText, setNewCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);

  const currentPlayingVideo = useRef(null);
  const videoRefs = useRef({});
  const observerRef = useRef(null);

  // ✅ user object states ke BAAD
  const user = {
    name: userName,
    role: "Admin",
    avatar: userAvatar,
  };

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        return u.id || u.user_id || null;
      }
      return null;
    } catch (e) {
      console.error("Error getting user ID:", e);
      return null;
    }
  };

  const getCurrentUserAvatar = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const profileImg = u.profile_image || u.avatar || u.profile_pic || null;
        if (profileImg) {
          return `${API_CONFIG.BASE_URL}/${profileImg}`;
        }
        return null;
      }
      return null;
    } catch (e) {
      console.error("Error getting user avatar:", e);
      return null;
    }
  };

  const getCurrentUserName = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.user_type === "institute") {
          return (
            u.institute_details?.institute_name ||
            u.institute_name ||
            u.name ||
            "Institute"
          );
        }
        return u.name || u.username || "User";
      }
      return "User";
    } catch (e) {
      console.error("Error getting user name:", e);
      return "User";
    }
  };

  const getFileInfo = (filePath) => {
    if (!filePath) return { name: "Research File", size: "Unknown" };
    const fileName = filePath.split("/").pop() || "research_file.pdf";
    return {
      name: fileName,
      size: "4.2 MB",
      pages: "12 PAGES",
    };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Published";
    let dateStr = String(timestamp).replace(" ", "T");
    if (!dateStr.endsWith("Z") && !dateStr.includes("+")) {
      dateStr += "Z";
    }
    const date = new Date(dateStr);
    const now = new Date();
    if (isNaN(date.getTime())) return "Recent";
    const diffMs = now - date;
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

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const normalized = String(timestamp).replace(" ", "T");
    const seconds = Math.floor((new Date() - new Date(normalized)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(normalized).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleVideoPlayback = useCallback((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (currentPlayingVideo.current && currentPlayingVideo.current !== video) {
          currentPlayingVideo.current.pause();
        }
        video.play().catch(() => {});
        currentPlayingVideo.current = video;
      } else {
        video.pause();
      }
    });
  }, []);

  const toggleVideoPlayPause = (postId, event) => {
    event.stopPropagation();
    const videoElement = videoRefs.current[`video-${postId}`];
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play().catch((err) => console.error(err));
        currentPlayingVideo.current = videoElement;
        setPausedVideos((prev) => ({ ...prev, [postId]: false }));
      } else {
        videoElement.pause();
        setPausedVideos((prev) => ({ ...prev, [postId]: true }));
      }
    }
  };

  const toggleVideoSound = (postId, event) => {
    event.stopPropagation();
    const videoElement = videoRefs.current[`video-${postId}`];
    if (videoElement) {
      const newMutedState = !videoElement.muted;
      videoElement.muted = newMutedState;
      setVideoMutedState((prev) => ({ ...prev, [postId]: !newMutedState }));
      if (!newMutedState && videoElement.paused) {
        videoElement.play().catch((err) => console.error("Error playing video on unmute:", err));
      }
    }
  };

  const toggleReadMorePost = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleReadMore = (commentId) => {
    setExpandedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const getPostProfileSrc = (post) => {
    if (post.profile_image) {
      return `${API_CONFIG.BASE_URL}/${post.profile_image}`;
    }
    return avatar;
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleVideoPlayback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    });
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleVideoPlayback]);

  useEffect(() => {
    if (!observerRef.current) return;
    Object.values(videoRefs.current).forEach((videoElement) => {
      if (videoElement && observerRef.current) {
        observerRef.current.observe(videoElement);
      }
    });
    return () => {
      if (observerRef.current) {
        Object.values(videoRefs.current).forEach((videoElement) => {
          if (videoElement && observerRef.current) {
            observerRef.current.unobserve(videoElement);
          }
        });
      }
    };
  }, [feedData]);

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId);
    setUserAvatar(getCurrentUserAvatar());
    setUserName(getCurrentUserName());

    try {
      const storedSavedPosts = localStorage.getItem("savedPosts");
      if (storedSavedPosts) setSavedPosts(JSON.parse(storedSavedPosts));
      const storedMuteStates = localStorage.getItem("videoMuteStates");
      if (storedMuteStates) setVideoMutedState(JSON.parse(storedMuteStates));
      const storedComments = localStorage.getItem("postComments");
      if (storedComments) setCommentsState(JSON.parse(storedComments));
    } catch (e) {
      console.error("Error loading saved data:", e);
    }

    const fetchFeed = async () => {
      try {
        const token = getAuthToken();
        let apiPosts = [];
        let publishedResearch = [];

        try {
          const res = await fetch(`${API_CONFIG.BASE_URL}/post/get-posts`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const result = await res.json();
          if (result.status && result.data) apiPosts = result.data;
        } catch (apiErr) {
          console.error("Error fetching API posts:", apiErr);
        }

        try {
          const researchRes = await fetch(
            `${API_CONFIG.BASE_URL}/research/get-published-research`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const researchResult = await researchRes.json();
          if (researchResult.status && researchResult.data) {
            publishedResearch = researchResult.data.map((research) => ({
              ...research,
              id: research.researche_id,
              isResearchPost: true,
              post_text: research.abstract || "Published Research",
              type: "research",
              created_at:
                research.published_at ||
                research.created_at ||
                research.updated_at ||
                new Date().toISOString(),
            }));
          }
        } catch (researchErr) {
          console.error("Error fetching published research:", researchErr);
        }

        let mockPosts = [];
        try {
          const storedPosts = localStorage.getItem("mockPosts");
          if (storedPosts) mockPosts = JSON.parse(storedPosts);
        } catch (e) {
          console.error("Error reading mock posts", e);
        }

        let savedLikes = {}, savedComments = {};
        try {
          savedLikes = JSON.parse(localStorage.getItem("postLikes")) || {};
          savedComments = JSON.parse(localStorage.getItem("postComments")) || {};
        } catch (e) {
          console.error("Error reading saved interactions", e);
        }

        setLikedPosts(savedLikes);
        setCommentsState(savedComments);
        setFeedData([...publishedResearch, ...mockPosts, ...apiPosts]);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchFeed();
  }, []);

  useEffect(() => {
    localStorage.setItem("videoMuteStates", JSON.stringify(videoMutedState));
  }, [videoMutedState]);

  const toggleLike = async (postId) => {
    const token = getAuthToken();
    const postIndex = feedData.findIndex(
      (p) => p.id === postId || p.researche_id === postId
    );
    if (postIndex === -1) return;

    const post = feedData[postIndex];
    const isCurrentlyLiked = post.is_liked === "1" || likedPosts[postId];
    const isMockPost = post.author !== undefined;
    const isResearchPost = post.isResearchPost === true;

    setLikedPosts((prev) => {
      const newLikes = { ...prev, [postId]: !isCurrentlyLiked };
      localStorage.setItem("postLikes", JSON.stringify(newLikes));
      return newLikes;
    });
    setFeedData((prevFeed) =>
      prevFeed.map((p) => {
        if (p.id === postId || p.researche_id === postId) {
          const currentCount = parseInt(p.like_count || 0);
          return {
            ...p,
            is_liked: isCurrentlyLiked ? "0" : "1",
            like_count: isCurrentlyLiked
              ? Math.max(0, currentCount - 1)
              : currentCount + 1,
          };
        }
        return p;
      })
    );

    if (isMockPost) return;

    try {
      const actualId = isResearchPost ? post.researche_id || post.id : post.id;
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/like-research/${actualId}`
        : `${API_CONFIG.BASE_URL}/post/like-post/${actualId}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();

      if (!result.status) {
        setLikedPosts((prev) => {
          const newLikes = { ...prev, [postId]: isCurrentlyLiked };
          localStorage.setItem("postLikes", JSON.stringify(newLikes));
          return newLikes;
        });
        setFeedData((prevFeed) =>
          prevFeed.map((p) => {
            if (p.id === postId || p.researche_id === postId) {
              const currentCount = parseInt(p.like_count || 0);
              return {
                ...p,
                is_liked: isCurrentlyLiked ? "1" : "0",
                like_count: isCurrentlyLiked
                  ? currentCount + 1
                  : Math.max(0, currentCount - 1),
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error("Like API error:", err);
    }
  };

  const toggleSave = async (postId) => {
    const token = getAuthToken();
    const post = feedData.find((p) => {
      if (p.isResearchPost) return p.researche_id === postId || p.id === postId;
      return p.id === postId;
    });
    if (!post) return;

    const isMockPost = post.author !== undefined;
    const isResearchPost = post.isResearchPost === true;
    const isCurrentlySaved = savedPosts[postId] || false;

    setSavedPosts((prev) => {
      const newSavedPosts = { ...prev, [postId]: !isCurrentlySaved };
      localStorage.setItem("savedPosts", JSON.stringify(newSavedPosts));
      return newSavedPosts;
    });

    if (isMockPost) {
      toast.success(isCurrentlySaved ? "Post unsaved" : "Post saved");
      return;
    }

    try {
      const actualId = isResearchPost ? post.researche_id || post.id : post.id;
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/research-save/${actualId}`
        : `${API_CONFIG.BASE_URL}/post/save-post/${actualId}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();

      if (result.status) {
        toast.success(result.msg || (isCurrentlySaved ? "Post unsaved" : "Post saved"));
      } else {
        toast.error(result.message || "Failed to update save status");
        setSavedPosts((prev) => {
          const newSavedPosts = { ...prev, [postId]: isCurrentlySaved };
          localStorage.setItem("savedPosts", JSON.stringify(newSavedPosts));
          return newSavedPosts;
        });
      }
    } catch (err) {
      console.error("Save API error:", err);
      toast.error("Network error while saving.");
      setSavedPosts((prev) => {
        const newSavedPosts = { ...prev, [postId]: isCurrentlySaved };
        localStorage.setItem("savedPosts", JSON.stringify(newSavedPosts));
        return newSavedPosts;
      });
    }
  };

  const toggleComments = async (postId) => {
    const isCurrentlyOpen = commentsState[postId]?.isOpen;
    const post = feedData.find((p) => p.id === postId || p.researche_id === postId);
    const isMockPost = post?.author !== undefined;
    const isResearchPost = post?.isResearchPost === true;

    if (isCurrentlyOpen) {
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], isOpen: false },
      }));
      return;
    }

    if (isMockPost) {
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { isOpen: true, list: prev[postId]?.list || [] },
      }));
      return;
    }

    const token = getAuthToken();
    try {
      const actualId = isResearchPost ? post.researche_id || post.id : post.id;
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/get-comments/${actualId}`
        : `${API_CONFIG.BASE_URL}/post/get-comments/${actualId}`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      const fetchedComments = (result.data || []).map((c) => ({
        id: c.id,
        text: c.comment,
        author: c.name,
        authorId: c.user_id,
        timestamp: c.created_at,
      }));

      setCommentsState((prev) => ({
        ...prev,
        [postId]: { isOpen: true, list: fetchedComments },
      }));
    } catch (err) {
      console.error("Get comments error:", err);
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { isOpen: true, list: prev[postId]?.list || [] },
      }));
    }
  };

  const addComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    const post = feedData.find((p) => p.id === postId || p.researche_id === postId);
    const isMockPost = post?.author !== undefined;
    const isResearchPost = post?.isResearchPost === true;

    const tempId = Date.now().toString();
    const newLocalComment = {
      id: tempId,
      text: commentText.trim(),
      author: userName,
      authorId: userId,
      authorAvatar: userAvatar,
      timestamp: new Date().toISOString(),
    };

    setCommentsState((prev) => {
      const newState = {
        ...prev,
        [postId]: {
          ...prev[postId],
          list: [newLocalComment, ...(prev[postId]?.list || [])],
        },
      };
      if (isMockPost) localStorage.setItem("postComments", JSON.stringify(newState));
      return newState;
    });
    setNewCommentText((prev) => ({ ...prev, [postId]: "" }));

    if (isMockPost) return;

    const token = getAuthToken();
    try {
      const actualId = isResearchPost ? post.researche_id || post.id : post.id;
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/add-comment/${actualId}`
        : `${API_CONFIG.BASE_URL}/post/add-comment/${actualId}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: commentText.trim() }),
      });
      const result = await res.json();

      if (result.status) {
        setCommentsState((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            list: prev[postId].list.map((c) =>
              c.id === tempId ? { ...c, id: result.comment_id } : c
            ),
          },
        }));
      }
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  const deleteComment = async (postId, commentId) => {
    const post = feedData.find((p) => p.id === postId || p.researche_id === postId);
    const isMockPost = post?.author !== undefined;
    const isResearchPost = post?.isResearchPost === true;

    setCommentsState((prev) => {
      const newState = {
        ...prev,
        [postId]: {
          ...prev[postId],
          list: prev[postId].list.filter((c) => c.id != commentId),
        },
      };
      if (isMockPost) localStorage.setItem("postComments", JSON.stringify(newState));
      return newState;
    });

    if (isMockPost) return;

    const token = getAuthToken();
    try {
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/delete-comment/${commentId}`
        : `${API_CONFIG.BASE_URL}/post/delete-comment/${commentId}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result.status) console.error("Failed to delete comment on server");
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  const handleShare = async (title, text) => {
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
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDeletePost = async (postId, isMockPost, postUserId) => {
    try {
      setDeletingPost(postId);

      if (isMockPost) {
        const storedPosts = JSON.parse(localStorage.getItem("mockPosts")) || [];
        const updatedPosts = storedPosts.filter((p) => p.id !== postId);
        localStorage.setItem("mockPosts", JSON.stringify(updatedPosts));
        setFeedData((prev) =>
          prev.filter((p) => p.id !== postId && p.researche_id !== postId)
        );
        toast.success("Post deleted successfully");
      } else {
        const token = getAuthToken();
        const post = feedData.find((p) => p.id === postId || p.researche_id === postId);
        const isResearchPost = post?.isResearchPost === true;
        const endpoint = isResearchPost
          ? `${API_CONFIG.BASE_URL}/research/research-delete/${postId}`
          : `${API_CONFIG.BASE_URL}/post/delete-post/${postId}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (result.status) {
          setFeedData((prev) =>
            prev.filter((p) => p.id !== postId && p.researche_id !== postId)
          );
          toast.success(result.msg || "Deleted successfully");
        } else {
          toast.error(result.message || "Failed to delete");
        }
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error deleting. Please try again.");
    } finally {
      setDeletingPost(null);
      setShowOptionsId(null);
      setShowDeletePopup(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/account/block-unblock-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: String(selectedPost?.postUserId) }),
      });
      const result = await response.json();

      if (result.status) {
        toast.success(result.message || "User blocked successfully.");
        setFeedData((prev) =>
          prev.filter((p) => String(p.user_id) !== String(selectedPost?.postUserId))
        );
      } else {
        toast.error(result.message || "Failed to block user");
      }
    } catch (error) {
      toast.error("Error blocking user. Please try again.");
    } finally {
      setShowBlockPopup(false);
      setSelectedPost(null);
      setShowOptionsId(null);
    }
  };

  const confirmDelete = () => {
    if (selectedPost) {
      handleDeletePost(selectedPost.postId, selectedPost.isMockPost, selectedPost.postUserId);
    }
    setShowDeletePopup(false);
    setSelectedPost(null);
  };

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav} user={user}>
      <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full relative">

        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6">
          <div className="relative rounded-2xl border border-[#1f2a25] bg-gradient-to-r from-[#020b08] via-[#03130e] to-[#020b08] px-5 py-6 sm:px-10 sm:py-10 flex flex-col items-center justify-center text-center overflow-hidden gap-6">
            <div className="flex flex-col items-center gap-4 sm:gap-6 z-10 w-full">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight">
                Welcome back, <br className="sm:hidden" />
                {userName}!
              </h1>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl mx-auto">
            <div className="space-y-6 sm:space-y-10">
              <section>
                <div className="space-y-4 sm:space-y-6">
                  {loadingFeed ? (
                    <div className="bg-[#020f0a] rounded-xl border border-white/5 p-8 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
                      <span className="ml-3 text-slate-400">Loading network feed...</span>
                    </div>
                  ) : feedData.length > 0 ? (
                    feedData.map((post, index) => {
                      const isMockPost = post.author !== undefined;
                      const isResearchPost = post.isResearchPost === true;
                      const postId = post.id || post.researche_id;
                      const postName = isMockPost
                        ? post.author
                        : post.user_type === "institute"
                        ? post.institute_details?.institute_name || post.institute_name || post.name || "Institute"
                        : post.name || "User";
                      const postType = isMockPost
                        ? post.authorType
                        : post.user_type === "institute"
                        ? "Institute"
                        : "Individual";
                      const postContent = isMockPost ? post.content : post.post_text || post.abstract;
                      const isTextOnly =
                        !isMockPost && !isResearchPost && postContent && !post.image && !post.video && !post.research_file;
                      const postTime = isMockPost ? post.time : formatDate(post.created_at);
                      const isLiked = isMockPost ? likedPosts[postId] : post.is_liked === "1";
                      const isSaved = savedPosts[postId] || post.is_saved === "1";
                      const postComments = commentsState[postId] || { isOpen: false, list: [] };
                      const postUserId = isMockPost ? userId : post.user_id;
                      const isCurrentUserPost = userId === postUserId || isMockPost;
                      const isDeleting = deletingPost === postId;
                      const hasImage = !isMockPost && post.image && post.image !== "";
                      const hasVideo = !isMockPost && post.video && post.video !== "";
                      const videoUrl = hasVideo ? `${API_CONFIG.BASE_URL}/${post.video}` : null;
                      const isVideoMuted = !videoMutedState[postId];

                      // ==================== RESEARCH POST ====================
                      if (isResearchPost || (post.research_file && !isMockPost)) {
                        const fileInfo = getFileInfo(post.research_file);
                        return (
                          <article
                            key={`res-${postId}-${index}`}
                            className="bg-[#020f0a] rounded-2xl border border-white/5 shadow-sm overflow-visible relative mb-6 sm:mb-8"
                          >
                            <div className="p-4 sm:p-5">
                              <div className="flex items-start gap-3 sm:gap-5 mt-2 sm:mt-4 mb-4 sm:mb-6">
                                <img
                                  alt={postName}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0"
                                  src={getPostProfileSrc(post)}
                                  onError={(e) => { e.target.src = avatar; }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-bold text-white hover:text-[#00ff88] cursor-pointer transition-colors capitalize truncate text-sm sm:text-base">
                                        {postName}
                                      </h4>
                                      <p className="text-[10px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1">
                                        {postType}
                                        <span className="w-1 h-1 rounded-full bg-slate-500 inline-block"></span>
                                        {postTime}
                                      </p>
                                    </div>
                                    <div className="relative">
                                      <button
                                        onClick={() => setShowOptionsId(showOptionsId === postId ? null : postId)}
                                        disabled={isDeleting}
                                        className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
                                      >
                                        <span className="material-symbols-outlined text-lg sm:text-xl">more_horiz</span>
                                      </button>
                                      {showOptionsId === postId && (
                                        <>
                                          <div className="fixed inset-0 z-10" onClick={() => setShowOptionsId(null)}></div>
                                          <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 overflow-hidden z-20">
                                            {isCurrentUserPost && (
                                              <button
                                                onClick={() => {
                                                  setSelectedPost({ postId, isMockPost, postUserId, postName });
                                                  setShowDeletePopup(true);
                                                }}
                                                disabled={isDeleting}
                                                className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group disabled:opacity-50"
                                              >
                                                <span className="material-symbols-outlined text-xs sm:text-sm">delete</span>
                                                <span>{isDeleting ? "Deleting..." : "Delete Post"}</span>
                                              </button>
                                            )}
                                            {!isCurrentUserPost && (
                                              <button
                                                onClick={() => {
                                                  setSelectedPost({ postId, isMockPost, postUserId, postName });
                                                  setShowBlockPopup(true);
                                                }}
                                                className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group"
                                              >
                                                <span className="material-symbols-outlined text-xs sm:text-sm">block</span>
                                                <span>Block User</span>
                                              </button>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="sm:ml-16 mb-3 sm:mb-4">
                                <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight">
                                  {post.research_title || "Published Research"}
                                </h3>
                              </div>
                              <div className="sm:ml-16 mb-4 sm:mb-6">
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{postContent}</p>
                              </div>

                              {post.research_file && (
                                <div className="sm:ml-16 mb-4 sm:mb-6">
                                  <div className="bg-[#0e0f10] border border-white/10 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-white/20 transition-all gap-3 sm:gap-0">
                                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-[#0f172a] border border-[#00ff88]/20 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#00ff88] text-xl sm:text-2xl">description</span>
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold text-white truncate">{fileInfo.name}</p>
                                        <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{fileInfo.pages} • {fileInfo.size}</p>
                                      </div>
                                    </div>
                                    <a
                                      href={`${API_CONFIG.BASE_URL}/${post.research_file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full sm:w-auto px-4 py-2 bg-[#00ff88] text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-[#00dd77] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                      <span className="material-symbols-outlined text-sm sm:text-base">open_in_new</span>
                                      View on Library
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Bar */}
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                              <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-white/5 sm:pl-16 flex-wrap">
                                <button
                                  onClick={() => toggleLike(postId)}
                                  className={`flex items-center gap-1 sm:gap-2 transition-colors ${isLiked ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                                >
                                  <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                                  <span className="text-[10px] sm:text-xs font-bold">
                                    {parseInt(post.like_count || 0) > 0 ? post.like_count : <span className="hidden sm:inline">Like</span>}
                                  </span>
                                </button>
                                <button
                                  onClick={() => toggleComments(postId)}
                                  className={`flex items-center gap-1 sm:gap-2 transition-colors ${postComments.isOpen ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                                >
                                  <span className="material-symbols-outlined text-lg sm:text-xl">chat_bubble</span>
                                  <span className="text-[10px] sm:text-xs font-bold">
                                    <span className="hidden sm:inline">Comment </span>
                                    {postComments.list.length > 0 ? `(${postComments.list.length})` : post.comment_count && !postComments.list.length ? `(${post.comment_count})` : ""}
                                  </span>
                                </button>
                                <button onClick={() => handleShare(post.research_title, postContent)} className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-[#00ff88] transition-colors">
                                  <span className="material-symbols-outlined text-lg sm:text-xl">share</span>
                                  <span className="hidden sm:inline text-xs font-bold">Share</span>
                                </button>
                                <button
                                  onClick={() => toggleSave(postId)}
                                  className={`ml-auto flex items-center gap-1 sm:gap-2 transition-colors ${isSaved ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                                >
                                  <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                                  <span className="hidden sm:inline text-xs font-bold">Save</span>
                                </button>
                              </div>

                              {postComments.isOpen && (
                                <div className="mt-4 sm:mt-6 sm:pl-16 space-y-4 sm:space-y-5">
                                  <div className="flex gap-2 sm:gap-3 items-start">
                                    <img alt={userName} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#00ff88]/20 object-cover shrink-0" src={userAvatar || avatar} onError={(e) => { e.target.src = avatar; }} />
                                    <div className="flex-1 relative">
                                      <input
                                        type="text"
                                        value={newCommentText[postId] || ""}
                                        onChange={(e) => setNewCommentText((prev) => ({ ...prev, [postId]: e.target.value }))}
                                        onKeyPress={(e) => { if (e.key === "Enter") addComment(postId, newCommentText[postId] || ""); }}
                                        placeholder="Add a comment..."
                                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors pr-10 text-white"
                                        style={{ outline: "none", boxShadow: "none" }}
                                      />
                                      <button onClick={() => addComment(postId, newCommentText[postId] || "")} className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-[#00ff88] hover:text-[#00ff88]/80 transition-colors">
                                        <span className="material-symbols-outlined text-sm">send</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
                                    {postComments.list.length > 0 ? (
                                      postComments.list.map((comment) => (
                                        <div key={comment.id} className="flex gap-2 sm:gap-3 group">
                                          <img alt={comment.author} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 object-cover shrink-0" src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.author}&background=random&color=fff`} />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] sm:text-xs font-bold text-white truncate pr-2">{comment.author}</span>
                                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                                <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">{formatTimeAgo(comment.timestamp)}</span>
                                                {comment.authorId === userId && (
                                                  <button onClick={() => deleteComment(postId, comment.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                                                    <span className="material-symbols-outlined text-xs sm:text-sm">delete</span>
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                            <p className={`text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}>{comment.text}</p>
                                            {comment.text.length > 120 && (
                                              <button onClick={() => toggleReadMore(comment.id)} className="text-[9px] sm:text-[10px] text-[#00ff88] mt-1 hover:underline">
                                                {expandedComments[comment.id] ? "Show less" : "Read more"}
                                              </button>
                                            )}
                                            <div className="border-b border-white/10 mt-2 sm:mt-3"></div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-4 sm:py-6">
                                        <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest italic">No comments yet. Be the first to discuss!</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      }

                      // ==================== NORMAL POST ====================
                      return (
                        <article
                          key={`post-${postId}-${index}`}
                          className="bg-[#020f0a] rounded-2xl border border-white/5 shadow-sm overflow-visible relative mb-6 sm:mb-8"
                        >
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start gap-3 sm:gap-5 mt-2 sm:mt-4 mb-3 sm:mb-4">
                              <img
                                alt={postName}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0"
                                src={getPostProfileSrc(post)}
                                onError={(e) => { e.target.src = avatar; }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-bold text-white hover:text-[#00ff88] cursor-pointer transition-colors capitalize truncate text-sm sm:text-base">{postName}</h4>
                                    <p className="text-[10px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1">
                                      {postType}
                                      <span className="w-1 h-1 rounded-full bg-slate-500 inline-block"></span>
                                      {postTime}
                                    </p>
                                  </div>
                                  <div className="relative">
                                    <button
                                      onClick={() => setShowOptionsId(showOptionsId === postId ? null : postId)}
                                      disabled={isDeleting}
                                      className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
                                    >
                                      <span className="material-symbols-outlined text-lg sm:text-xl">more_horiz</span>
                                    </button>
                                    {showOptionsId === postId && (
                                      <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowOptionsId(null)}></div>
                                        <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 overflow-hidden z-20">
                                          {isCurrentUserPost && (
                                            <button
                                              onClick={() => {
                                                setSelectedPost({ postId, isMockPost, postUserId, postName });
                                                setShowDeletePopup(true);
                                              }}
                                              disabled={isDeleting}
                                              className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group disabled:opacity-50"
                                            >
                                              <span className="material-symbols-outlined text-xs sm:text-sm">delete</span>
                                              <span>{isDeleting ? "Deleting..." : "Delete Post"}</span>
                                            </button>
                                          )}
                                          {!isCurrentUserPost && (
                                            <button
                                              onClick={() => {
                                                setSelectedPost({ postId, isMockPost, postUserId, postName });
                                                setShowBlockPopup(true);
                                              }}
                                              className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group"
                                            >
                                              <span className="material-symbols-outlined text-xs sm:text-sm">block</span>
                                              <span>Block User</span>
                                            </button>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isTextOnly ? (
                              <div className="sm:ml-16 mt-2 mb-3 sm:mb-4 max-w-full sm:max-w-[600px]">
                                <div className="bg-[#000302] border border-white/10 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-sm">
                                  <span className={`${expandedPosts[postId] ? "" : "line-clamp-10"}`}>{postContent}</span>
                                  {postContent?.length > 300 && (
                                    <span onClick={() => toggleReadMorePost(postId)} className="text-[#00ff88] cursor-pointer ml-1 text-[10px] sm:text-xs hover:underline">
                                      {expandedPosts[postId] ? "Show less" : "... Read more"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs sm:text-sm leading-relaxed text-slate-300 break-words whitespace-pre-wrap mb-3 sm:mb-4 sm:ml-16">
                                {postContent}
                              </div>
                            )}

                            {isMockPost && post.media && (
                              <div className="mt-3 sm:mt-4 rounded-xl overflow-hidden border border-white/10 bg-black flex justify-center max-h-[300px] sm:max-h-[500px] sm:ml-16 relative">
                                {post.mediaType === "image" ? (
                                  <img src={post.media} alt="Post media" className="object-contain max-h-[300px] sm:max-h-[500px] w-auto" />
                                ) : post.mediaType === "video" ? (
                                  <div className="relative w-full">
                                    <video
                                      ref={(el) => { if (el) { videoRefs.current[`video-${postId}`] = el; el.setAttribute("data-video-id", postId); } }}
                                      src={post.media}
                                      muted={isVideoMuted}
                                      playsInline
                                      className="max-h-[300px] sm:max-h-[500px] w-full bg-black cursor-pointer"
                                      loop={false}
                                      onClick={(e) => toggleVideoPlayPause(postId, e)}
                                    />
                                    <button onClick={(e) => toggleVideoSound(postId, e)} className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 sm:p-2 transition-all z-10">
                                      <span className="material-symbols-outlined text-lg sm:text-xl">{isVideoMuted ? "volume_off" : "volume_up"}</span>
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {!isMockPost && (hasImage || hasVideo) && (
                              <div className="mt-3 sm:mt-4 rounded-xl overflow-hidden border border-white/10 bg-black flex justify-center max-h-[300px] sm:max-h-[500px] sm:ml-16 relative">
                                {hasImage && (
                                  <img src={`${API_CONFIG.BASE_URL}/${post.image}`} alt="Post media" className="object-contain max-h-[300px] sm:max-h-[500px] w-auto" onError={(e) => { e.target.src = post.image; }} />
                                )}
                                {hasVideo && (
                                  <div className="relative w-full" onClick={(e) => toggleVideoPlayPause(postId, e)}>
                                    <video
                                      ref={(el) => { if (el) { videoRefs.current[`video-${postId}`] = el; el.setAttribute("data-video-id", postId); } }}
                                      src={videoUrl}
                                      muted={isVideoMuted}
                                      playsInline
                                      className="max-h-[300px] sm:max-h-[500px] w-full bg-black"
                                      loop={false}
                                      onClick={(e) => toggleVideoPlayPause(postId, e)}
                                      onError={(e) => { e.target.src = post.video; }}
                                      onPlay={() => setPausedVideos((prev) => ({ ...prev, [postId]: false }))}
                                      onPause={() => setPausedVideos((prev) => ({ ...prev, [postId]: true }))}
                                    />
                                    {pausedVideos[postId] && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#00ff88]/80 rounded-full flex items-center justify-center">
                                          <span className="material-symbols-outlined text-black text-3xl sm:text-4xl">play_arrow</span>
                                        </div>
                                      </div>
                                    )}
                                    <button onClick={(e) => toggleVideoSound(postId, e)} className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 sm:p-2 transition-all z-10">
                                      <span className="material-symbols-outlined text-lg sm:text-xl">{isVideoMuted ? "volume_off" : "volume_up"}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Bar */}
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                            <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-white/5 sm:pl-16 flex-wrap">
                              <button
                                onClick={() => toggleLike(postId)}
                                className={`flex items-center gap-1 sm:gap-2 transition-colors ${isLiked ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                              >
                                <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                                <span className="text-[10px] sm:text-xs font-bold">
                                  {parseInt(post.like_count || 0) > 0 ? post.like_count : <span className="hidden sm:inline">Like</span>}
                                </span>
                              </button>
                              <button
                                onClick={() => toggleComments(postId)}
                                className={`flex items-center gap-1 sm:gap-2 transition-colors ${postComments.isOpen ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                              >
                                <span className="material-symbols-outlined text-lg sm:text-xl">chat_bubble</span>
                                <span className="text-[10px] sm:text-xs font-bold">
                                  <span className="hidden sm:inline">Comment </span>
                                  {postComments.list.length > 0 ? `(${postComments.list.length})` : post.comment_count && !postComments.list.length ? `(${post.comment_count})` : ""}
                                </span>
                              </button>
                              <button onClick={() => handleShare(postName, postContent)} className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-[#00ff88] transition-colors">
                                <span className="material-symbols-outlined text-lg sm:text-xl">share</span>
                                <span className="hidden sm:inline text-xs font-bold">Share</span>
                              </button>
                              <button
                                onClick={() => toggleSave(postId)}
                                className={`ml-auto flex items-center gap-1 sm:gap-2 transition-colors ${isSaved ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                              >
                                <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                                <span className="hidden sm:inline text-xs font-bold">Save</span>
                              </button>
                            </div>

                            {postComments.isOpen && (
                              <div className="mt-4 sm:mt-6 sm:pl-16 space-y-4 sm:space-y-5">
                                <div className="flex gap-2 sm:gap-3 items-start">
                                  <img alt={userName} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#00ff88]/20 object-cover shrink-0" src={userAvatar || avatar} onError={(e) => { e.target.src = avatar; }} />
                                  <div className="flex-1 relative">
                                    <input
                                      type="text"
                                      value={newCommentText[postId] || ""}
                                      onChange={(e) => setNewCommentText((prev) => ({ ...prev, [postId]: e.target.value }))}
                                      onKeyPress={(e) => { if (e.key === "Enter") addComment(postId, newCommentText[postId] || ""); }}
                                      placeholder="Add a comment..."
                                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors pr-10 text-white"
                                      style={{ outline: "none", boxShadow: "none" }}
                                    />
                                    <button onClick={() => addComment(postId, newCommentText[postId] || "")} className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-[#00ff88] hover:text-[#00ff88]/80 transition-colors">
                                      <span className="material-symbols-outlined text-sm">send</span>
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
                                  {postComments.list.length > 0 ? (
                                    postComments.list.map((comment) => (
                                      <div key={comment.id} className="flex gap-2 sm:gap-3 group">
                                        <img alt={comment.author} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 object-cover shrink-0" src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.author}&background=random&color=fff`} />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] sm:text-xs font-bold text-white pr-2 truncate">{comment.author}</span>
                                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                              <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">{formatTimeAgo(comment.timestamp)}</span>
                                              {comment.authorId === userId && (
                                                <button onClick={() => deleteComment(postId, comment.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                                                  <span className="material-symbols-outlined text-xs sm:text-sm">delete</span>
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                          <p className={`text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}>{comment.text}</p>
                                          {comment.text.length > 120 && (
                                            <button onClick={() => toggleReadMore(comment.id)} className="text-[9px] sm:text-[10px] text-[#00ff88] mt-1 hover:underline">
                                              {expandedComments[comment.id] ? "Show less" : "Read more"}
                                            </button>
                                          )}
                                          <div className="border-b border-white/10 mt-2 sm:mt-3"></div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 sm:py-6">
                                      <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest italic">No comments yet. Be the first to discuss!</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="bg-[#141414] rounded-2xl border border-white/5 p-8 text-center">
                      <p className="text-slate-400">No posts found in the network yet.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== DELETE POPUP ==================== */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">Delete Post?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeletePopup(false); setSelectedPost(null); }} className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition-all">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== BLOCK POPUP ==================== */}
      {showBlockPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">Block User?</h3>
            <p className="text-slate-400 text-sm mb-6">You won't see posts from <span className="text-white font-semibold">{selectedPost?.postName}</span> anymore.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowBlockPopup(false); setSelectedPost(null); }} className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition-all">
                Cancel
              </button>
              <button onClick={handleBlockUser} className="flex-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all">
                Block
              </button>
            </div>
          </div>
        </div>
      )}

<style jsx global>{`
  /* Chrome, Safari aur Opera ke liye */
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  /* Firefox ke liye */
  * {
    scrollbar-width: none;
  }

  /* IE aur Edge ke liye */
  * {
    -ms-overflow-style: none;
  }
`}</style>
    </Layout>
  );
};

export default MainContent;