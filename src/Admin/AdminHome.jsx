import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import avatar from "../assets/images/avatar.jpg";
import { Layout } from "./Layout/Layout";
import API_CONFIG from "../config/api.config";
import { toast } from "react-toastify";

// ==================== COMMENTS SECTION (reusable) ====================
const CommentsSection = React.memo(
  ({
    postId,
    post,
    commentsState,
    addComment,
    expandedComments,
    toggleReadMore,
    deleteComment,
    userId,
    formatTimeAgo,
  }) => {
    // Local state for comment input - prevents parent re-renders on every keystroke
    const [localCommentText, setLocalCommentText] = React.useState("");

    // Define ALL hooks FIRST - no conditional logic before this
    const handleCommentChange = useCallback((e) => {
      setLocalCommentText(e.target.value);
    }, []);

    const handleCommentSubmit = useCallback(() => {
      if (localCommentText.trim()) {
        addComment(postId, localCommentText);
        setLocalCommentText("");
      }
    }, [localCommentText, postId, addComment]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" && localCommentText.trim()) {
          handleCommentSubmit();
        }
      },
      [localCommentText, handleCommentSubmit],
    );

    // Get postComments data
    const postComments = commentsState?.[String(postId)] || {
      isOpen: false,
      list: [],
    };

    // Return null in the JSX, not as early return
    return !postComments.isOpen ? null : (
      <div className="mt-4 sm:mt-6 sm:pl-16 space-y-4 sm:space-y-5">
        <div className="flex items-start">
          <div className="flex-1 relative">
            <input
              type="text"
              value={localCommentText}
              onChange={handleCommentChange}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              className="w-full px-4 py-3 rounded-2xl
            bg-gray-100 dark:bg-[#1e293b]
            border border-gray-300 dark:border-white/10
            text-gray-900 dark:text-white
            focus:outline-none focus:border-[#00ff88]/50"
              style={{ outline: "none", boxShadow: "none" }}
            />
            <button
              onClick={handleCommentSubmit}
              className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-[#00ff88] hover:text-[#00ff88]/80 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
          {postComments.list.length > 0 ? (
            postComments.list.map((comment) => (
              <div key={comment.id} className="group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-white truncate pr-2">
                      {comment.author}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-slate-500 uppercase">
                        {formatTimeAgo(comment.timestamp)}
                      </span>
                      {comment.authorId === userId && (
                        <button
                          onClick={() => deleteComment(postId, comment.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 dark:text-slate-500 hover:text-red-400 transition-all"
                        >
                          <span className="material-symbols-outlined text-xs sm:text-sm">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-[10px] sm:text-xs text-gray-700 dark:text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}
                  >
                    {comment.text}
                  </p>
                  {comment.text.length > 120 && (
                    <button
                      onClick={() => toggleReadMore(comment.id)}
                      className="text-[9px] sm:text-[10px] text-[#00ff88] mt-1 hover:underline"
                    >
                      {expandedComments[comment.id] ? "Show less" : "Read more"}
                    </button>
                  )}
                  <div className="border-b border-gray-200 dark:border-white/10 mt-2 sm:mt-3"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 sm:py-6">
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-widest italic">
                No comments yet. Be the first to discuss!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

const MainContent = () => {
  const navigate = useNavigate();

  const userType = localStorage.getItem("user_type");

  useEffect(() => {
    if (userType !== "admin") {
      navigate("/dashboard");
    }
  }, [userType, navigate]);

  if (userType !== "admin") {
    return null;
  }
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
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
 
  // Poll states
  const [pollVoting, setPollVoting] = useState({}); // { pollId: true/false } loading state

  const currentPlayingVideo = useRef(null);
  const videoRefs = useRef({});
  const observerRef = useRef(null);

  const textRefs = useRef({});
  const [overflowMap, setOverflowMap] = useState({});
  const [isOverflowingMap, setIsOverflowingMap] = useState({});

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [shareGroups, setShareGroups] = useState([]);
  const [loadingShare, setLoadingShare] = useState(false);
  // const [selectedPost, setSelectedPost] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedSharePostId, setSelectedSharePostId] = useState(null);

  // 💡 WhatsApp style multi-share ke liye states
  const [shareSearchQuery, setShareSearchQuery] = useState(""); // Search bar ke liye
  const [selectedUserIds, setSelectedUserIds] = useState([]); // Multiple users select karne ke liye

  const [allInstitutes, setAllInstitutes] = useState([]); // Naya add kiya
  const [allGroups, setAllGroups] = useState([]); // Naya add kiya
  const [myGroupsList, setMyGroupsList] = useState([]);

  const user = {
    name: userName,
    role: "Admin",
    avatar: userAvatar,
  };

  // 💡 Users, Institutes aur Groups teeno ko fetch karne ka sahi tarika
  useEffect(() => {
    const fetchShareData = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Users
        const userRes = await fetch(
          `${API_CONFIG.BASE_URL}/user/get-all-users`,
          { headers },
        );
        const userData = await userRes.json();
        setAllUsers(
          userData.data ||
            userData.users ||
            (Array.isArray(userData) ? userData : []),
        );

        // 2. Fetch Joined Institutes
        try {
          const instRes = await fetch(
            `${API_CONFIG.BASE_URL}/institute/get-all-institutes`,
            { headers },
          );
          const instData = await instRes.json();
          setAllInstitutes(
            instData.data ||
              instData.institutes ||
              (Array.isArray(instData) ? instData : []),
          );
        } catch (e) {
          console.error("Institutes fetch error:", e);
        }

        // 3. Fetch Joined Groups (Jisme user connected ya joined hai)
        try {
          const groupRes = await fetch(
            `${API_CONFIG.BASE_URL}/group/poll-list`,
            { headers },
          ); // Ya fir jo aapka group list ka custom endpoint ho jaise /group/joined-groups
          const groupData = await groupRes.json();
          setAllGroups(
            groupData.data ||
              groupData.groups ||
              (Array.isArray(groupData) ? groupData : []),
          );
        } catch (e) {
          console.error("Groups fetch error:", e);
        }
      } catch (err) {
        console.error("Main share data fetch error:", err);
      }
    };

    fetchShareData();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

 const openUserProfile = (post) => {
    navigate("/admin/user-profile", {
      state: {
        user: {
          id: post.user_id || post.id,
          name: post.name || post.postName,
          email: post.email,
          user_type: post.user_type,
          registration_id: post.registration_id,
        },
      },
    });
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

    // MySQL datetime: "2026-05-11 13:03:27"
    // Isko local browser time ki tarah parse karna hai, UTC nahi.
    const dateStr = String(timestamp).replace(" ", "T");

    const date = new Date(dateStr);
    const now = new Date();

    if (isNaN(date.getTime())) return "Recent";

    const diffMs = now - date;

    // Agar date future me chali gayi ho, to bhi Just now dikha do
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
        if (
          currentPlayingVideo.current &&
          currentPlayingVideo.current !== video
        ) {
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
        videoElement
          .play()
          .catch((err) => console.error("Error playing video on unmute:", err));
      }
    }
  };

  const toggleReadMorePost = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
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
    const newMap = {};

    Object.keys(textRefs.current).forEach((id) => {
      const el = textRefs.current[id];
      if (!el) return;

      // remove clamp temporarily
      const prevStyle = el.style.WebkitLineClamp;
      el.style.WebkitLineClamp = "unset";

      const fullHeight = el.scrollHeight;

      // apply clamp back
      el.style.WebkitLineClamp = prevStyle || "10";

      const clampedHeight = el.clientHeight;

      newMap[id] = fullHeight > clampedHeight;
    });

    setOverflowMap(newMap);
  }, [feedData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newOverflowMap = {};

      Object.keys(textRefs.current).forEach((id) => {
        const el = textRefs.current[id];
        if (el) {
          newOverflowMap[id] = el.scrollHeight > el.clientHeight;
        }
      });

      setIsOverflowingMap(newOverflowMap);
    }, 200);

    return () => clearTimeout(timer);
  }, [feedData]);

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
        let polls = [];

        // Fetch regular posts
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

        // Fetch published research
        try {
          const researchRes = await fetch(
            `${API_CONFIG.BASE_URL}/research/get-published-research`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
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
                research.updated_at ||
                research.published_at ||
                research.created_at ||
                new Date().toISOString(),
            }));
          }
        } catch (researchErr) {
          console.error("Error fetching published research:", researchErr);
        }

        // Fetch polls
        try {
          const pollRes = await fetch(`${API_CONFIG.BASE_URL}/poll/poll-list`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const pollResult = await pollRes.json();
          if (pollResult.status && pollResult.data) {
            polls = pollResult.data.map((poll) => ({
              ...poll,
              id: `poll-${poll.poll_id}`,
              isPollPost: true,
              type: "poll",
              created_at: poll.created_at,
            }));
          }
        } catch (pollErr) {
          console.error("Error fetching polls:", pollErr);
        }

        let mockPosts = [];
        try {
          const storedPosts = localStorage.getItem("mockPosts");
          if (storedPosts) mockPosts = JSON.parse(storedPosts);
        } catch (e) {
          console.error("Error reading mock posts", e);
        }

        let savedLikes = {},
          savedComments = {};
        try {
          savedLikes = JSON.parse(localStorage.getItem("postLikes")) || {};
          savedComments =
            JSON.parse(localStorage.getItem("postComments")) || {};
        } catch (e) {
          console.error("Error reading saved interactions", e);
        }

        setLikedPosts(savedLikes);
        setCommentsState(savedComments);

        // Build a set of poll_ids so we can filter them out of regular posts.
        // The backend returns polls also inside /post/get-posts with type="poll"
        // OR the post_text matches the poll question. We handle both cases:
        const pollPostIds = new Set(polls.map((p) => String(p.poll_id)));
        const pollQuestions = new Set(polls.map((p) => p.question?.trim()));

        const filteredApiPosts = apiPosts.filter((p) => {
          // If the post has type === "poll" → skip (it's already in polls array)
          if (p.type === "poll") return false;
          // If post_id matches a poll_id → skip
          if (pollPostIds.has(String(p.id))) return false;
          // If post_text exactly matches a poll question → skip
          if (p.post_text && pollQuestions.has(p.post_text.trim()))
            return false;
          return true;
        });

        // Merge all feed items and sort by created_at descending
        const allItems = [
          ...publishedResearch,
          ...polls,
          ...mockPosts,
          ...filteredApiPosts,
        ];
        allItems.sort((a, b) => {
          const dateA = new Date(String(a.created_at || 0).replace(" ", "T"));
          const dateB = new Date(String(b.created_at || 0).replace(" ", "T"));
          return dateB - dateA;
        });

        setFeedData(allItems);
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

  // ==================== POLL HANDLERS ====================

  const handlePollVote = async (pollId, optionId) => {
    const token = getAuthToken();
    const numericPollId = String(pollId).replace("poll-", "");

    // Find poll in feed
    const poll = feedData.find((p) => p.id === pollId);
    if (!poll) return;

    const hasVoted = poll.my_vote_option_id !== null;

    // If already voted on this option → undo
    if (hasVoted && String(poll.my_vote_option_id) === String(optionId)) {
      await handlePollUndoVote(pollId);
      return;
    }

    setPollVoting((prev) => ({ ...prev, [pollId]: true }));

    // Optimistic update
    setFeedData((prev) =>
      prev.map((item) => {
        if (item.id !== pollId) return item;
        const prevVotedId = item.my_vote_option_id;
        const updatedOptions = item.options.map((opt) => {
          let count = parseInt(opt.vote_count || 0);
          if (String(opt.id) === String(optionId)) count += 1;
          if (prevVotedId && String(opt.id) === String(prevVotedId))
            count = Math.max(0, count - 1);
          return {
            ...opt,
            vote_count: count,
            is_voted_by_me: String(opt.id) === String(optionId) ? 1 : 0,
          };
        });
        const totalVotes = updatedOptions.reduce(
          (s, o) => s + parseInt(o.vote_count || 0),
          0,
        );
        return {
          ...item,
          my_vote_option_id: optionId,
          total_votes: totalVotes,
          options: updatedOptions.map((opt) => ({
            ...opt,
            percentage:
              totalVotes > 0
                ? Math.round((parseInt(opt.vote_count || 0) / totalVotes) * 100)
                : 0,
          })),
        };
      }),
    );

    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/poll/vote-poll/${numericPollId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ option_id: optionId }),
        },
      );
      const result = await res.json();
      if (!result.status) {
        toast.error(result.message || "Failed to submit vote", {
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "light",
        });
        // Revert optimistic update
        setFeedData((prev) =>
          prev.map((item) => {
            if (item.id !== pollId) return item;
            return poll;
          }),
        );
      }
    } catch (err) {
      console.error("Poll vote error:", err);
      toast.error("Network error while voting.", {
        theme: document.documentElement.classList.contains("dark")
          ? "dark"
          : "light",
      });
      setFeedData((prev) =>
        prev.map((item) => (item.id !== pollId ? item : poll)),
      );
    } finally {
      setPollVoting((prev) => ({ ...prev, [pollId]: false }));
    }
  };

  const handlePollUndoVote = async (pollId) => {
    const token = getAuthToken();
    const numericPollId = String(pollId).replace("poll-", "");

    const poll = feedData.find((p) => p.id === pollId);
    if (!poll) return;

    setPollVoting((prev) => ({ ...prev, [pollId]: true }));

    // Optimistic update
    setFeedData((prev) =>
      prev.map((item) => {
        if (item.id !== pollId) return item;
        const prevVotedId = item.my_vote_option_id;
        const updatedOptions = item.options.map((opt) => {
          let count = parseInt(opt.vote_count || 0);
          if (prevVotedId && String(opt.id) === String(prevVotedId))
            count = Math.max(0, count - 1);
          return { ...opt, vote_count: count, is_voted_by_me: 0 };
        });
        const totalVotes = updatedOptions.reduce(
          (s, o) => s + parseInt(o.vote_count || 0),
          0,
        );
        return {
          ...item,
          my_vote_option_id: null,
          total_votes: totalVotes,
          options: updatedOptions.map((opt) => ({
            ...opt,
            percentage:
              totalVotes > 0
                ? Math.round((parseInt(opt.vote_count || 0) / totalVotes) * 100)
                : 0,
          })),
        };
      }),
    );

    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/poll/undo-vote/${numericPollId}`,
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
        toast.error(result.message || "Failed to undo vote", {
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "light",
        });
        setFeedData((prev) =>
          prev.map((item) => (item.id !== pollId ? item : poll)),
        );
      }
    } catch (err) {
      console.error("Poll undo vote error:", err);
      toast.error("Network error.", {
        theme: document.documentElement.classList.contains("dark")
          ? "dark"
          : "light",
      });
      setFeedData((prev) =>
        prev.map((item) => (item.id !== pollId ? item : poll)),
      );
    } finally {
      setPollVoting((prev) => ({ ...prev, [pollId]: false }));
    }
  };

  // ==================== END POLL HANDLERS ====================

  const toggleLike = async (postId) => {
    const token = getAuthToken();
    const postIndex = feedData.findIndex(
      (p) => p.id === postId || p.researche_id === postId,
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
      }),
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
          }),
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
        toast.success(
          result.msg || (isCurrentlySaved ? "Post unsaved" : "Post saved"),
        );
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
    const post = feedData.find(
      (p) => p.id === postId || p.researche_id === postId,
    );
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

    const post = feedData.find(
      (p) => p.id === postId || p.researche_id === postId,
    );
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
      if (isMockPost)
        localStorage.setItem("postComments", JSON.stringify(newState));
      return newState;
    });

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
              c.id === tempId ? { ...c, id: result.comment_id } : c,
            ),
          },
        }));
      }
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  const deleteComment = async (postId, commentId) => {
    const post = feedData.find(
      (p) => p.id === postId || p.researche_id === postId,
    );
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
      if (isMockPost)
        localStorage.setItem("postComments", JSON.stringify(newState));
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
          text: text
            ? text.substring(0, 100) + "..."
            : "Check out this research post!",
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

  const handleShareClick = async (postId) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      setSelectedSharePostId(postId);
      setIsShareOpen(true);

      // 1. Post details fetch logic
      try {
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/post/get-posts-id/${postId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (data.status) {
          setSelectedPost(data.data);
        }
      } catch (postErr) {
        console.error("Post detail fetch error:", postErr);
      }

      // 2. 💡 NEW API INTEGRATION: Groups fetch karne ke liye sahi endpoint
      try {
        const groupRes = await fetch(
          `${API_CONFIG.BASE_URL}/group/get-groups`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const groupData = await groupRes.json();

        // Response structure ke mutabik state update karenge
        if (groupData.status && Array.isArray(groupData.groups)) {
          setShareGroups(groupData.groups);
        } else if (Array.isArray(groupData.data)) {
          setShareGroups(groupData.data);
        } else if (Array.isArray(groupData)) {
          setShareGroups(groupData);
        }
      } catch (gErr) {
        console.error("Groups fetch error inside share click:", gErr);
      }
    } catch (err) {
      console.error("Share click error:", err);
    }
  };

  const handleSendPost = async (postId) => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one chat/group to share.");
      return;
    }

    try {
      const token = getAuthToken();
      let successCount = 0;
      let failCount = 0;

      const sharePromises = selectedUserIds.map(async (uid) => {
        // Check karein ki ye ID group ki hai ya user ki
        // Aapke code mein 'allUsers' aur 'shareGroups' alag states mein hain
        const isGroup = shareGroups.some(
          (g) => String(g.group_id || g.id) === String(uid),
        );

        let endpoint = `${API_CONFIG.BASE_URL}/message/message-send`;
        let payload = {
          receiver_id: String(uid), // Default user ke liye
          type: "text",
          message: `POST_SHARE_ID:${postId}`,
        };

        // Agar group hai, to API endpoint aur payload update karein
        if (isGroup) {
          endpoint = `${API_CONFIG.BASE_URL}/group/group-message-send/${uid}`;
          payload = {
            message: `POST_SHARE_ID:${postId}`,
            // Agar backend file expect karta hai to yahan handle karein,
            // abhi simple text message ja raha hai.
          };
        }

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();

          if (
            data &&
            (data.status === true ||
              data.status === "true" ||
              data.status === 1)
          ) {
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

  const handleDeletePost = async (postId, isMockPost, postUserId) => {
    try {
      setDeletingPost(postId);

      if (isMockPost) {
        const storedPosts = JSON.parse(localStorage.getItem("mockPosts")) || [];
        const updatedPosts = storedPosts.filter((p) => p.id !== postId);
        localStorage.setItem("mockPosts", JSON.stringify(updatedPosts));
        setFeedData((prev) =>
          prev.filter((p) => p.id !== postId && p.researche_id !== postId),
        );
        toast.success("Post deleted successfully");
      } else {
        const token = getAuthToken();
        const post = feedData.find(
          (p) => p.id === postId || p.researche_id === postId,
        );
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
            prev.filter((p) => p.id !== postId && p.researche_id !== postId),
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
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/account/block-unblock-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: String(selectedPost?.postUserId) }),
        },
      );
      const result = await response.json();

      if (result.status) {
        toast.success(result.message || "User blocked successfully.");
        setFeedData((prev) =>
          prev.filter(
            (p) => String(p.user_id) !== String(selectedPost?.postUserId),
          ),
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
      handleDeletePost(
        selectedPost.postId,
        selectedPost.isMockPost,
        selectedPost.postUserId,
      );
    }
    setShowDeletePopup(false);
    setSelectedPost(null);
  };

  // ==================== POLL CARD COMPONENT ====================
  const PollCard = ({ post }) => {
    const pollId = post.id;
    const hasVoted =
      post.my_vote_option_id !== null && post.my_vote_option_id !== undefined;
    const isVoting = pollVoting[pollId];
    const totalVotes = parseInt(post.total_votes || 0);
    const postName =
      post.user_type === "institute"
        ? post.institute_details?.institute_name ||
          post.institute_name ||
          post.name ||
          "Institute"
        : post.name || "User";
    const postType =
      post.user_type === "institute" ? "Institute" : "Individual";
    const postTime = formatDate(post.created_at);
    const isCurrentUserPoll = String(post.user_id) === String(userId);

    return (
      <article
        className="
  bg-white dark:bg-[#111814]
  rounded-[28px]
  border border-gray-200 dark:border-[#1e3a2c]
  shadow-sm
  overflow-hidden
  relative
  mb-6 sm:mb-8
"
      >
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-5 mt-2 sm:mt-4 mb-4 sm:mb-5">
            <img
              alt={postName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer"
              src={
                post.profile_image
                  ? `${API_CONFIG.BASE_URL}/${post.profile_image}`
                  : avatar
              }
              onError={(e) => {
                e.target.src = avatar;
              }}
              onClick={() => openUserProfile(post)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4
                    onClick={() => openUserProfile(post)}
                    className="font-bold text-gray-900 dark:text-white cursor-pointer capitalize truncate text-sm sm:text-base"
                  >
                    {postName}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1">
                    {postType}
                    <span className="w-1 h-1 rounded-full bg-slate-500 inline-block"></span>
                    {postTime}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Options menu — block for other users' polls */}
                  {!isCurrentUserPoll && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowOptionsId(
                            showOptionsId === pollId ? null : pollId,
                          )
                        }
                        className="
                            text-gray-500 dark:text-slate-400
                            hover:text-gray-900 dark:hover:text-white
                            p-1 rounded-full
                            hover:bg-gray-200 dark:hover:bg-[#ffffff10]
                            transition-all duration-200"
                      >
                        <span className="material-symbols-outlined text-lg text-gray-600 dark:text-slate-400">
                          more_horiz
                        </span>
                      </button>
                      {console.log("dropdown open", showOptionsId)}
                      {showOptionsId === pollId && (
                        <>
                          {console.log("dropdown visible")}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowOptionsId(null)}
                          ></div>
                          <div
                            className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-[#1e293b] 
                              rounded-lg shadow-xl 
                              border-gray-200 dark:border-white/10 overflow-hidden z-20"
                          >
                            <button
                              onClick={() => {
                                setSelectedPost({
                                  postId: pollId,
                                  isMockPost: false,
                                  postUserId: post.user_id,
                                  postName,
                                });
                                setShowBlockPopup(true);
                                setShowOptionsId(null);
                              }}
                              className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200"
                            >
                              <span className="material-symbols-outlined text-xs sm:text-sm">
                                block
                              </span>
                              <span>Block User</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="sm:ml-16 mb-4 sm:mb-5">
            <p className="text-gray-900 dark:text-white text-sm sm:text-base font-semibold leading-snug">
              {post.question}
            </p>
          </div>

          {/* Options */}
          <div className="sm:ml-16 space-y-2 sm:space-y-3 mb-4">
            {(post.options || []).map((option) => {
              const isMyVote =
                String(post.my_vote_option_id) === String(option.id);
              const pct = hasVoted ? parseInt(option.percentage || 0) : 0;

              return (
                <button
                  key={option.id}
                  onClick={() => !isVoting && handlePollVote(pollId, option.id)}
                  disabled={isVoting}
                  className={`w-full text-left relative rounded-2xl border transition-all duration-300 overflow-hidden
                    ${
                      isMyVote
                        ? "border-[#00ff88]/40 bg-[#00ff88]/10"
                        : "border-gray-200 dark:border-[#22352b] bg-white dark:bg-[#16201a] hover:border-[#00ff88]/50 hover:shadow-[0_0_0_1px_rgba(0,255,136,0.25)] dark:hover:border-[#00ff88]/50"
                    }
                    ${isVoting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {/* Progress bar fill — only shown after voting */}
                  {hasVoted && (
                    <div
                      className="absolute inset-0 bg-[#00ff88]/10 transition-all duration-700 ease-out rounded-2xl"
                      style={{ width: `${pct}%` }}
                    />
                  )}

                  <div className="relative flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="flex items-center">
                      <span
                        className={`text-xs sm:text-sm font-medium transition-colors ${isMyVote ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-slate-300"}`}
                      >
                        {option.option_text}
                      </span>
                    </div>
                    {hasVoted && (
                      <span
                        className={`text-xs sm:text-sm font-bold shrink-0 ml-2 ${
                          isMyVote
                            ? "text-[#00c96b] dark:text-[#00ff88]"
                            : "text-gray-500 dark:text-slate-400"
                        }`}
                      >
                        {pct}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Vote count + undo hint */}
          <div className="sm:ml-16 flex items-center justify-between gap-3">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gray-500 dark:text-slate-500">
              {totalVotes === 0
                ? "No votes yet — be the first!"
                : `${totalVotes} vote${totalVotes !== 1 ? "s" : ""}`}
            </p>
            {hasVoted && (
              <button
                onClick={() => !isVoting && handlePollUndoVote(pollId)}
                disabled={isVoting}
                className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-500 hover:text-red-400 transition-colors underline underline-offset-2"
              >
                Undo vote
              </button>
            )}
            {isVoting && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#00ff88]">
                <span className="w-3 h-3 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin inline-block"></span>
                Saving...
              </span>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav} user={user}>
      <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full relative">
        {/* Welcome Section */}
        <div className="mb-6">
          <div
            className="relative rounded-2xl 
            border border-gray-200 dark:border-[#1f2a25] 
            bg-gradient-to-r from-gray-50 via-white to-gray-50 
            dark:from-[#020b08] dark:via-[#041a13] dark:to-[#020b08] 
            px-5 py-6 sm:px-10 sm:py-10 
            flex flex-col items-center justify-center text-center 
            overflow-hidden gap-6 shadow-sm"
          >
            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-semibold 
              text-gray-800 dark:text-white tracking-tight"
            >
              Welcome back, <br className="sm:hidden" />
              {userName}!
            </h1>
          </div>
        </div>

        {/* Feed */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl mx-auto">
            <div className="space-y-6 sm:space-y-10">
              <section>
                <div className="space-y-4 sm:space-y-6">
                  {loadingFeed ? (
                    <div className="bg-white dark:bg-[#020f0a] rounded-xl border border-gray-200 dark:border-white/5 p-8 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
                      <span className="ml-3 text-gray-600 dark:text-slate-400">
                        Loading network feed...
                      </span>
                    </div>
                  ) : feedData.length > 0 ? (
                    (feedData || []).map((post, index) => {
                      if (!post) return null;

                      // ==================== POLL POST ====================
                      if (post.isPollPost) {
                        return (
                          <PollCard
                            key={`poll-${post.poll_id}-${index}`}
                            post={post}
                          />
                        );
                      }

                      const isMockPost = post.author !== undefined;
                      const isResearchPost = post.isResearchPost === true;
                      const postId = post.id || post.researche_id;
                      const postName = isMockPost
                        ? post.author
                        : post.user_type === "institute"
                          ? post.institute_details?.institute_name ||
                            post.institute_name ||
                            post.name ||
                            "Institute"
                          : post.name || "User";
                      const postType = isMockPost
                        ? post.authorType
                        : post.user_type === "institute"
                          ? "Institute"
                          : "Individual";
                      const postContent = isMockPost
                        ? post.content
                        : post.post_text || post.abstract;
                      const isTextOnly =
                        !isMockPost &&
                        !isResearchPost &&
                        postContent &&
                        !post.image &&
                        !post.video &&
                        !post.research_file;
                      const postTime = isMockPost
                        ? post.time
                        : formatDate(post.created_at);
                      const isLiked = isMockPost
                        ? likedPosts[postId]
                        : post.is_liked === "1";
                      const isSaved =
                        savedPosts[postId] || post.is_saved === "1";
                      const postComments = commentsState?.[String(postId)] || {
                        isOpen: false,
                        list: [],
                      };
                      const postUserId = isMockPost ? userId : post.user_id;
                      const isCurrentUserPost =
                        userId === postUserId || isMockPost;
                      const isDeleting = deletingPost === postId;
                      const hasImage =
                        !isMockPost && post.image && post.image !== "";
                      const hasVideo =
                        !isMockPost && post.video && post.video !== "";
                      const videoUrl = hasVideo
                        ? `${API_CONFIG.BASE_URL}/${post.video}`
                        : null;
                      const isVideoMuted = !videoMutedState[postId];

                      // Options dropdown (shared between research + normal)
                      const OptionsDropdown = () =>
                        showOptionsId === postId ? (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowOptionsId(null)}
                            ></div>
                            <div
                              className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-[#1e293b] 
                                rounded-lg shadow-xl 
                                border border-gray-200 dark:border-white/10 overflow-hidden z-20"
                            >
                              {isCurrentUserPost && (
                                <button
                                  onClick={() => {
                                    setSelectedPost({
                                      postId,
                                      isMockPost,
                                      postUserId,
                                      postName,
                                    });
                                    setShowDeletePopup(true);
                                  }}
                                  disabled={isDeleting}
                                  className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-xs sm:text-sm">
                                    delete
                                  </span>
                                  <span>
                                    {isDeleting ? "Deleting..." : "Delete Post"}
                                  </span>
                                </button>
                              )}
                              {!isCurrentUserPost && (
                                <button
                                  onClick={() => {
                                    setSelectedPost({
                                      postId,
                                      isMockPost,
                                      postUserId,
                                      postName,
                                    });
                                    setShowBlockPopup(true);
                                  }}
                                  className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group"
                                >
                                  <span className="material-symbols-outlined text-xs sm:text-sm">
                                    block
                                  </span>
                                  <span>Block User</span>
                                </button>
                              )}
                            </div>
                          </>
                        ) : null;

                      // ==================== RESEARCH POST ====================
                      if (
                        isResearchPost ||
                        (post.research_file && !isMockPost)
                      ) {
                        const fileInfo = getFileInfo(post.research_file);
                        return (
                          <article
                            key={`res-${postId}-${index}`}
                            className="bg-white dark:bg-[#020f0a] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-visible relative mb-6 sm:mb-8"
                          >
                            <div className="p-4 sm:p-5">
                              <div className="flex items-start gap-3 sm:gap-5 mt-2 sm:mt-4 mb-4 sm:mb-6">
                                <img
                                  alt={postName}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer"
                                  src={getPostProfileSrc(post)}
                                  onError={(e) => {
                                    e.target.src = avatar;
                                  }}
                                  onClick={() => openUserProfile(post)}
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4
                                        onClick={() => openUserProfile(post)}
                                        className="font-bold text-gray-900 dark:text-white cursor-pointer capitalize truncate text-sm sm:text-base"
                                      >
                                        {postName}
                                      </h4>

                                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1">
                                        {postType}

                                        <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-slate-500 inline-block"></span>

                                        {postTime}
                                      </p>
                                    </div>

                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setShowOptionsId(
                                            showOptionsId === postId
                                              ? null
                                              : postId,
                                          )
                                        }
                                        disabled={isDeleting}
                                        className="
              text-gray-500 dark:text-slate-400
              hover:text-gray-900 dark:hover:text-white
              p-1 rounded-full
              hover:bg-gray-200 dark:hover:bg-[#ffffff10]
              transition-all duration-200
            "
                                      >
                                        <span className="material-symbols-outlined text-lg text-gray-600 dark:text-slate-400">
                                          more_horiz
                                        </span>
                                      </button>

                                      <OptionsDropdown />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Title */}
                              <div className="sm:ml-16 mb-3 sm:mb-4">
                                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                  {post.research_title || "Published Research"}
                                </h3>
                              </div>

                              {/* Content */}
                              <div className="sm:ml-16 mb-4 sm:mb-6">
                                <p className="text-gray-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                                  {postContent}
                                </p>
                              </div>

                              {/* File Card */}
                              {post.research_file && (
                                <div className="sm:ml-16 mb-4 sm:mb-6">
                                  <div className="bg-white dark:bg-[#0e0f10] border border-gray-200 dark:border-white/10 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-gray-300 dark:hover:border-white/20 shadow-sm dark:shadow-none transition-all gap-3 sm:gap-0">
                                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-100 dark:bg-[#0f172a] border border-[#00ff88]/20 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#00ff88] text-xl sm:text-2xl">
                                          description
                                        </span>
                                      </div>

                                      <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                                          {fileInfo.name}
                                        </p>

                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 mt-1">
                                          {fileInfo.pages} • {fileInfo.size}
                                        </p>
                                      </div>
                                    </div>

                                    <a
                                      href={`${API_CONFIG.BASE_URL}/${post.research_file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full sm:w-auto px-4 py-2 bg-[#00ff88] text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-[#00dd77] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                      <span className="material-symbols-outlined text-sm sm:text-base">
                                        open_in_new
                                      </span>
                                      View PDF
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Action Bar */}
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                              <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-white/5 sm:pl-16 flex-wrap">
                                {/* LIKE */}
                                <button
                                  onClick={() => toggleLike(postId)}
                                  className={`group flex items-center gap-1 sm:gap-2 transition-colors ${
                                    isLiked
                                      ? "text-[#00ff88]"
                                      : "text-gray-500 dark:text-slate-400"
                                  } hover:text-[#00ff88]`}
                                >
                                  <span
                                    className="material-symbols-outlined text-lg opacity-80 sm:text-xl text-inherit group-hover:text-[#00ff88]"
                                    style={{
                                      fontVariationSettings: isLiked
                                        ? "'FILL' 1"
                                        : "'FILL' 0",
                                    }}
                                  >
                                    favorite
                                  </span>

                                  <span className="text-[10px] sm:text-xs font-bold group-hover:text-[#00ff88]">
                                    {parseInt(post.like_count || 0) > 0 ? (
                                      post.like_count
                                    ) : (
                                      <span className="hidden sm:inline">
                                        Like
                                      </span>
                                    )}
                                  </span>
                                </button>

                                {/* COMMENT */}
                                <button
                                  onClick={() => toggleComments(postId)}
                                  className={`group flex items-center gap-1 sm:gap-2 transition-colors ${
                                    postComments.isOpen
                                      ? "text-[#00ff88]"
                                      : "text-gray-500 dark:text-slate-400"
                                  } hover:text-[#00ff88]`}
                                >
                                  <span className="material-symbols-outlined text-lg text-inherit group-hover:text-[#00ff88]">
                                    chat_bubble
                                  </span>

                                  <span className="text-[10px] sm:text-xs font-bold group-hover:text-[#00ff88]">
                                    <span className="hidden sm:inline">
                                      Comment{" "}
                                    </span>

                                    {postComments.list.length > 0
                                      ? `(${postComments.list.length})`
                                      : post.comment_count &&
                                          !postComments.list.length
                                        ? `(${post.comment_count})`
                                        : ""}
                                  </span>
                                </button>

                                {/* SHARE */}
                                <button
                                  onClick={() => handleShareClick(post.id)}
                                  className="group flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-slate-400 hover:text-[#00ff88] transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg text-inherit group-hover:text-[#00ff88]">
                                    share
                                  </span>

                                  <span className="hidden sm:inline text-xs font-bold group-hover:text-[#00ff88]">
                                    Share
                                  </span>
                                </button>

                                {/* SAVE */}
                                <button
                                  onClick={() => toggleSave(postId)}
                                  className={`group ml-auto flex items-center gap-1 sm:gap-2 transition-colors ${
                                    isSaved
                                      ? "text-[#00ff88]"
                                      : "text-gray-500 dark:text-slate-400"
                                  } hover:text-[#00ff88]`}
                                >
                                  <span
                                    className="material-symbols-outlined text-lg opacity-80 sm:text-xl text-inherit group-hover:text-[#00ff88]"
                                    style={{
                                      fontVariationSettings: isSaved
                                        ? "'FILL' 1"
                                        : "'FILL' 0",
                                    }}
                                  >
                                    bookmark
                                  </span>

                                  <span className="hidden sm:inline text-xs font-bold group-hover:text-[#00ff88]">
                                    Save
                                  </span>
                                </button>
                              </div>

                              <CommentsSection
                                postId={post?.id || post?.researche_id}
                                post={post}
                                commentsState={commentsState}
                                addComment={addComment}
                                expandedComments={expandedComments}
                                toggleReadMore={toggleReadMore}
                                deleteComment={deleteComment}
                                userId={userId}
                                formatTimeAgo={formatTimeAgo}
                              />
                            </div>
                          </article>
                        );
                      }

                      // ==================== NORMAL POST ====================
                      return (
                        <article
                          key={`post-${postId}-${index}`}
                          className="bg-white dark:bg-[#020f0a] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-visible relative mb-6 sm:mb-8"
                        >
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start gap-3 sm:gap-5 mt-2 sm:mt-4 mb-3 sm:mb-4">
                              <img
                                alt={postName}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer"
                                src={getPostProfileSrc(post)}
                                onError={(e) => {
                                  e.target.src = avatar;
                                }}
                                onClick={() => openUserProfile(post)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4
                                      onClick={() => openUserProfile(post)}
                                      className="font-bold text-gray-900 dark:text-white cursor-pointer capitalize truncate text-sm sm:text-base"
                                    >
                                      {postName}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1">
                                      {postType}
                                      <span className="w-1 h-1 rounded-full bg-slate-500 inline-block"></span>
                                      {postTime}
                                    </p>
                                  </div>
                                  <div className="relative">
                                    <button
                                      onClick={() =>
                                        setShowOptionsId(
                                          showOptionsId === postId
                                            ? null
                                            : postId,
                                        )
                                      }
                                      disabled={isDeleting}
                                      className="
                                        text-gray-500 dark:text-slate-400
                                        hover:text-gray-900 dark:hover:text-white
                                        p-1 rounded-full
                                        hover:bg-gray-200 dark:hover:bg-[#ffffff10]
                                        transition-all duration-200"
                                    >
                                      <span className="material-symbols-outlined text-lg text-gray-600 dark:text-slate-400">
                                        more_horiz
                                      </span>
                                    </button>
                                    <OptionsDropdown />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isTextOnly ? (
                              <div className="sm:ml-16 mt-2 mb-3 sm:mb-4 max-w-full sm:max-w-[600px]">
                                <div className="bg-white dark:bg-[#000302] border border-gray-200 dark:border-white/10 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm shadow-sm">
                                  <p
                                    ref={(el) =>
                                      (textRefs.current[postId] = el)
                                    }
                                    className="text-gray-800 dark:text-slate-200 leading-relaxed break-words"
                                    style={
                                      !expandedPosts[postId]
                                        ? {
                                            display: "-webkit-box",
                                            WebkitLineClamp: 10,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                          }
                                        : {}
                                    }
                                  >
                                    {postContent}
                                  </p>

                                  {overflowMap[postId] && (
                                    <button
                                      className="text-[#00ff88] mt-1 text-xs font-medium hover:underline"
                                      onClick={() => toggleReadMorePost(postId)}
                                    >
                                      {expandedPosts[postId]
                                        ? "Show less"
                                        : "Read more"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-slate-300 mb-3 sm:mb-4 sm:ml-16">
                                <p
                                  ref={(el) => (textRefs.current[postId] = el)}
                                  className={`break-words whitespace-pre-wrap ${
                                    expandedPosts[postId]
                                      ? ""
                                      : "overflow-hidden"
                                  }`}
                                  style={
                                    !expandedPosts[postId]
                                      ? {
                                          display: "-webkit-box",
                                          WebkitLineClamp: 3,
                                          WebkitBoxOrient: "vertical",
                                        }
                                      : {}
                                  }
                                >
                                  {postContent}
                                </p>

                                {isOverflowingMap[postId] && (
                                  <button
                                    onClick={() => toggleReadMorePost(postId)}
                                    className="text-[#00ff88] mt-1 text-xs hover:underline"
                                  >
                                    {expandedPosts[postId]
                                      ? "Show less"
                                      : "Read more"}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Hash Tags - content ke neeche */}
                            {Array.isArray(post.hash_tag) &&
                              post.hash_tag.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2 mb-3 sm:ml-16">
                                  {post.hash_tag.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] sm:text-[11px] font-semibold text-[#00ff88] bg-[#00ff88]/8 border border-[#00ff88]/25 px-2.5 py-1 rounded-full cursor-pointer hover:bg-[#00ff88]/15 transition-colors"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            {isMockPost && post.media && (
                              <div className="mt-3 sm:mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-black flex justify-center max-h-[300px] sm:max-h-[500px] sm:ml-16 relative">
                                {post.mediaType === "image" ? (
                                  <img
                                    src={post.media}
                                    alt="Post media"
                                    className="object-contain max-h-[300px] sm:max-h-[500px] w-auto"
                                  />
                                ) : post.mediaType === "video" ? (
                                  <div className="relative w-full">
                                    <video
                                      ref={(el) => {
                                        if (el) {
                                          videoRefs.current[`video-${postId}`] =
                                            el;
                                          el.setAttribute(
                                            "data-video-id",
                                            postId,
                                          );
                                        }
                                      }}
                                      src={post.media}
                                      muted={isVideoMuted}
                                      playsInline
                                      className="max-h-[300px] sm:max-h-[500px] w-full bg-black cursor-pointer"
                                      loop={false}
                                      onClick={(e) =>
                                        toggleVideoPlayPause(postId, e)
                                      }
                                    />
                                    <button
                                      onClick={(e) =>
                                        toggleVideoSound(postId, e)
                                      }
                                      className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 sm:p-2 transition-all z-10"
                                    >
                                      <span className="material-symbols-outlined text-lg opacity-80 sm:text-xl">
                                        {isVideoMuted
                                          ? "volume_off"
                                          : "volume_up"}
                                      </span>
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {!isMockPost && (hasImage || hasVideo) && (
                              <div className="mt-3 sm:mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-black flex justify-center max-h-[300px] sm:max-h-[500px] sm:ml-16 relative">
                                {hasImage && (
                                  <img
                                    src={`${API_CONFIG.BASE_URL}/${post.image}`}
                                    alt="Post media"
                                    className="object-contain max-h-[300px] sm:max-h-[500px] w-auto"
                                    onError={(e) => {
                                      e.target.src = post.image;
                                    }}
                                  />
                                )}
                                {hasVideo && (
                                  <div
                                    className="relative w-full"
                                    onClick={(e) =>
                                      toggleVideoPlayPause(postId, e)
                                    }
                                  >
                                    <video
                                      ref={(el) => {
                                        if (el) {
                                          videoRefs.current[`video-${postId}`] =
                                            el;
                                          el.setAttribute(
                                            "data-video-id",
                                            postId,
                                          );
                                        }
                                      }}
                                      src={videoUrl}
                                      muted={isVideoMuted}
                                      playsInline
                                      className="max-h-[300px] sm:max-h-[500px] w-full bg-black"
                                      loop={false}
                                      onClick={(e) =>
                                        toggleVideoPlayPause(postId, e)
                                      }
                                      onError={(e) => {
                                        e.target.src = post.video;
                                      }}
                                      onPlay={() =>
                                        setPausedVideos((prev) => ({
                                          ...prev,
                                          [postId]: false,
                                        }))
                                      }
                                      onPause={() =>
                                        setPausedVideos((prev) => ({
                                          ...prev,
                                          [postId]: true,
                                        }))
                                      }
                                    />
                                    {pausedVideos[postId] && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#00ff88]/80 rounded-full flex items-center justify-center">
                                          <span className="material-symbols-outlined text-black text-3xl sm:text-4xl">
                                            play_arrow
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    <button
                                      onClick={(e) =>
                                        toggleVideoSound(postId, e)
                                      }
                                      className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 sm:p-2 transition-all z-10"
                                    >
                                      <span className="material-symbols-outlined text-lg opacity-80 sm:text-xl">
                                        {isVideoMuted
                                          ? "volume_off"
                                          : "volume_up"}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Bar */}
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                            <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-white/5 sm:pl-16 flex-wrap">
                              <button
                                onClick={() => toggleLike(postId)}
                                className={`group flex items-center gap-1 sm:gap-2 transition-colors ${
                                  isLiked
                                    ? "text-[#00ff88]"
                                    : "text-gray-500 dark:text-slate-400"
                                } hover:text-[#00ff88]`}
                              >
                                <span
                                  className="material-symbols-outlined text-lg opacity-80 sm:text-xl group-hover:text-[#00ff88]"
                                  style={{
                                    fontVariationSettings: isLiked
                                      ? "'FILL' 1"
                                      : "'FILL' 0",
                                  }}
                                >
                                  favorite
                                </span>

                                <span className="text-[10px] sm:text-xs font-bold group-hover:text-[#00ff88]">
                                  {parseInt(post.like_count || 0) > 0 ? (
                                    post.like_count
                                  ) : (
                                    <span className="hidden sm:inline">
                                      Like
                                    </span>
                                  )}
                                </span>
                              </button>
                              <button
                                onClick={() => toggleComments(postId)}
                                className={`group flex items-center gap-1 sm:gap-2 transition-colors ${
                                  postComments.isOpen
                                    ? "text-[#00ff88]"
                                    : "text-gray-500 dark:text-slate-400"
                                } hover:text-[#00ff88]`}
                              >
                                <span className="material-symbols-outlined text-lg group-hover:text-[#00ff88]">
                                  chat_bubble
                                </span>

                                <span className="text-[10px] sm:text-xs font-bold group-hover:text-[#00ff88]">
                                  <span className="hidden sm:inline">
                                    Comment{" "}
                                  </span>
                                  {postComments.list.length > 0
                                    ? `(${postComments.list.length})`
                                    : post.comment_count &&
                                        !postComments.list.length
                                      ? `(${post.comment_count})`
                                      : ""}
                                </span>
                              </button>
                              <button
                                onClick={() => handleShareClick(post.id)}
                                className="group flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-slate-400 hover:text-[#00ff88] transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg group-hover:text-[#00ff88]">
                                  share
                                </span>

                                <span className="hidden sm:inline text-xs font-bold group-hover:text-[#00ff88]">
                                  Share
                                </span>
                              </button>
                              <button
                                onClick={() => toggleSave(postId)}
                                className={`group ml-auto flex items-center gap-1 sm:gap-2 transition-colors ${
                                  isSaved
                                    ? "text-[#00ff88]"
                                    : "text-gray-500 dark:text-slate-400"
                                } hover:text-[#00ff88]`}
                              >
                                <span
                                  className="material-symbols-outlined text-lg opacity-80 sm:text-xl group-hover:text-[#00ff88]"
                                  style={{
                                    fontVariationSettings: isSaved
                                      ? "'FILL' 1"
                                      : "'FILL' 0",
                                  }}
                                >
                                  bookmark
                                </span>

                                <span className="hidden sm:inline text-xs font-bold group-hover:text-[#00ff88]">
                                  Save
                                </span>
                              </button>
                            </div>
                            <CommentsSection
                              postId={post?.id || post?.researche_id}
                              post={post}
                              commentsState={commentsState}
                              addComment={addComment}
                              expandedComments={expandedComments}
                              toggleReadMore={toggleReadMore}
                              deleteComment={deleteComment}
                              userId={userId}
                              formatTimeAgo={formatTimeAgo}
                            />
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/5 p-8 text-center">
                      <p className="text-gray-500 dark:text-slate-400">
                        No posts found in the network yet.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
          {isShareOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
              style={{ zIndex: 999999 }}
              onClick={() => {
                setIsShareOpen(false);
                setSelectedUserIds([]); // Close hone par state reset
                setShareSearchQuery("");
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 999999 }}
                className="relative w-full max-w-[440px] h-[550px] flex flex-col rounded-2xl bg-white dark:bg-[#13231a] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-colors duration-200"
              >
                {/* 1. TOP HEADER SECTION */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 shrink-0">
                  <h2 className="text-base font-extrabold text-black dark:text-white uppercase tracking-wide">
                    Share Post
                  </h2>
                  <button
                    onClick={() => {
                      setIsShareOpen(false);
                      setSelectedUserIds([]);
                      setShareSearchQuery("");
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 text-base font-bold transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* 2. WHATSAPP STYLE SEARCH BAR */}
                <div className="p-3 bg-white dark:bg-[#13231a] border-b border-gray-100 dark:border-white/5 shrink-0">
                  <div className="flex items-center bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 transition-all duration-200 focus-within:border-[#00ff88] focus-within:ring-2 focus-within:ring-[#00ff88]/20 dark:focus-within:border-[#32ff99]">
                    {" "}
                    <span className="material-symbols-outlined text-gray-400 text-sm mr-2">
                      search
                    </span>
                    <input
                      type="text"
                      className="w-full bg-transparent text-xs text-black dark:text-white outline-none border-none p-0 focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Search users to share..."
                      value={shareSearchQuery}
                      onChange={(e) => setShareSearchQuery(e.target.value)}
                    />
                    {shareSearchQuery && (
                      <button
                        onClick={() => setShareSearchQuery("")}
                        className="text-gray-400 hover:text-black dark:hover:text-white flex items-center shrink-0"
                      >
                        <span className="material-symbols-outlined text-xs">
                          close
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. MULTIPLE USERS, INSTITUTES & GROUPS LIST */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar bg-white dark:bg-[#13231a]">
                  {[
                    // 1. Individuals Filter
                    ...(Array.isArray(allUsers) ? allUsers : [])
                      .filter(
                        (u) =>
                          u &&
                          u.role !== "institute" &&
                          u.user_type !== "institute" &&
                          !u.institute_details,
                      )
                      .map((u) => ({
                        ...u,
                        displayType: "Individual",
                        finalName: u.name || u.username || "No Name",
                      })),

                    // 2. Institutes Filter
                    ...(Array.isArray(allUsers) ? allUsers : [])
                      .filter(
                        (u) =>
                          u &&
                          (u.role === "institute" ||
                            u.user_type === "institute" ||
                            u.institute_details),
                      )
                      .map((i) => ({
                        ...i,
                        displayType: "Institute",
                        finalName:
                          i.institute_details?.institute_name ||
                          i.institute_name ||
                          i.name ||
                          "Institute Name",
                      })),

                    // 3. 💡 NEW REWRITTEN GROUPS LOOP: Sahi keys (group_name, group_id, profile) ke sath
                    ...(Array.isArray(shareGroups) ? shareGroups : [])
                      .map((g) => {
                        if (!g) return null;
                        return {
                          ...g,
                          displayType: "Group",
                          // Naye API ke data keys ke mutabik keys read karenge
                          finalName: g.group_name || g.name || "Unnamed Group",
                          finalId: String(g.group_id || g.id || g._id),
                          finalImage:
                            g.profile || g.image || g.group_image || null,
                        };
                      })
                      .filter(Boolean),
                  ]
                    // Safe Search Filter
                    .filter((account) => {
                      if (!account || !account.finalName) return false;
                      const searchStr = shareSearchQuery || "";
                      return String(account.finalName)
                        .toLowerCase()
                        .includes(searchStr.toLowerCase());
                    })
                    .map((account) => {
                      const uniqueId =
                        account.displayType === "Group"
                          ? account.finalId
                          : String(account.id || account._id);
                      const isChecked =
                        Array.isArray(selectedUserIds) &&
                        selectedUserIds.includes(uniqueId);

                      // Dynamic profile image handler
                      let finalAvatar = avatar;
                      if (
                        account.displayType === "Individual" &&
                        account.profile_individual_details?.profile_image
                      ) {
                        finalAvatar = `${API_CONFIG.BASE_URL}/${account.profile_individual_details.profile_image}`;
                      } else if (
                        account.profile_image ||
                        account.institute_details?.profile_image
                      ) {
                        finalAvatar = `${API_CONFIG.BASE_URL}/${account.profile_image || account.institute_details?.profile_image}`;
                      } else if (
                        account.displayType === "Group" &&
                        account.finalImage
                      ) {
                        finalAvatar = `${API_CONFIG.BASE_URL}/${account.finalImage}`;
                      }

                      return (
                        <div
                          key={`${account.displayType}-${uniqueId}`}
                          onClick={() => {
                            if (typeof setSelectedUserIds === "function") {
                              if (isChecked) {
                                setSelectedUserIds(
                                  selectedUserIds.filter(
                                    (id) => id !== uniqueId,
                                  ),
                                );
                              } else {
                                setSelectedUserIds([
                                  ...selectedUserIds,
                                  uniqueId,
                                ]);
                              }
                            }
                          }}
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
                              onError={(e) => {
                                e.target.src = avatar;
                              }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-sm text-black dark:text-white truncate max-w-[160px]">
                                  {account.finalName}
                                </p>

                                {/* Badge pills */}
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono uppercase tracking-wider font-bold shrink-0 ${
                                    account.displayType === "Institute"
                                      ? "bg-blue-500/10 text-blue-500 dark:text-blue-400"
                                      : account.displayType === "Group"
                                        ? "bg-purple-500/10 text-purple-500 dark:text-purple-400"
                                        : "bg-gray-500/10 text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {account.displayType}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 truncate">
                                {account.displayType === "Group"
                                  ? account.total_members
                                    ? `${account.total_members} Members`
                                    : "Group Account"
                                  : account.registration_id ||
                                    `#ID_${uniqueId}`}
                              </p>
                            </div>
                          </div>

                          {/* Right Side Checkbox Icon */}
                          <span
                            className={`material-symbols-outlined text-xl transition-colors ${isChecked ? "text-[#00ff88]" : "text-gray-400"}`}
                          >
                            {isChecked
                              ? "check_box"
                              : "check_box_outline_blank"}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* 4. FLOATING ACTION ACTION PANEL (Sirf selection hone par dikhega) */}
                {selectedUserIds.length > 0 && (
                  <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex items-center justify-between shrink-0 animate-fadeIn">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-[#00ff88]">
                        {selectedUserIds.length} SELECTED
                      </span>
                      <span className="text-[9px] font-medium text-gray-400">
                        Ready to share inside chat
                      </span>
                    </div>

                    {/* Circular WhatsApp Send Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // handleSendPost ko hamara multi-selection list array bhej denge
                        handleSendPost(selectedSharePostId);
                      }}
                      className="w-10 h-10 rounded-full bg-[#00ff88] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)]"
                    >
                      <span
                        className="material-symbols-outlined text-lg font-extrabold"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        send
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== DELETE POPUP ==================== */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl">
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">
              Delete Post?
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeletePopup(false);
                  setSelectedPost(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== BLOCK POPUP ==================== */}
      {showBlockPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl">
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">
              Block User?
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
              You won't see posts from{" "}
              <span className="text-gray-900 dark:text-white font-semibold">
                {selectedPost?.postName}
              </span>{" "}
              anymore.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlockPopup(false);
                  setSelectedPost(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="flex-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
{/* 
      {showProfile && selectedUser && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[90vh]">
            <UserProfile
              user={selectedUser}
              onClose={() => {
                setShowProfile(false);
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      )} */}

      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </Layout>
  );
};

export default MainContent;
