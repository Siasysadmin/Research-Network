import React, { useState, useEffect, useRef, useCallback } from "react";
import RightSection from "./RightSection";
import avatar from "../assets/images/avatar.jpg";
import UserProfile from "./UserProfile";
import {
  calculateIndividualProfileCompletion,
  calculateInstituteProfileCompletion,
} from "../utils/profileCompletion";
import DashboardLayout from "./DashboardLayout";
import API_CONFIG from "../config/api.config";
import { toast } from "react-toastify";

const SharedPostCard = ({ postId, onOpen }) => {
  return (
    <div
      onClick={() => onOpen && onOpen(postId, null)}
      className="mt-1 rounded-xl border border-emerald-200 dark:border-[#00ff85]/30 bg-emerald-50 dark:bg-[#0d1a12] overflow-hidden max-w-[220px] cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-[#00ff85]">
          <span className="material-symbols-outlined text-sm">share</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Shared Post
          </span>
        </div>
        <div className="border-t border-white/10 pt-2">
          <p className="text-[10px] text-slate-600 dark:text-slate-300">
            View shared post
          </p>{" "}
        </div>
        <button className="w-full bg-[#00ff85] text-black text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-xs">visibility</span>
          View Post
        </button>
      </div>
    </div>
  );
};

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

const MainContent = () => {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [feedData, setFeedData] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [pollActionLoading, setPollActionLoading] = useState({});
  const [deletingPollId, setDeletingPollId] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [commentsState, setCommentsState] = useState({});
  const [showOptionsId, setShowOptionsId] = useState(null);
  const [savedPosts, setSavedPosts] = useState({});
  const [videoMutedState, setVideoMutedState] = useState({});
  const [deletingPost, setDeletingPost] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [pausedVideos, setPausedVideos] = useState({});
  const [newCommentText, setNewCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState({});
  const [reportStep, setReportStep] = useState(1); // 1: Reasons, 2: Thanks
  const [isReportingLoading, setIsReportingLoading] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedSharePostId, setSelectedSharePostId] = useState(null);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [shareGroups, setShareGroups] = useState([]);
  const chatWidgetRef = useRef(null);
  const [profilePercent, setProfilePercent] = useState(0);
  // 💡 Group Chat jaisa scroll track karne ke liye Refs
  const popupMessagesContainerRef = useRef(null);
  const popupShouldAutoScrollRef = useRef(true);
  const popupMessagesEndRef = useRef(null);
  const reportReasons = [
    "I just don't like it",
    "Bullying or unwanted contact",
    "Suicide, self-injury or eating disorders",
    "Violence, hate or exploitation",
    "Selling or promoting restricted items",
    "Nudity or sexual activity",
    "Scam, fraud or spam",
    "False information",
    "Intellectual property",
  ];
  // States for Chat Widget
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const pollingRef = useRef(null);
  const feedDataRef = useRef([]);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const currentPlayingVideo = useRef(null);
  const videoRefs = useRef({});
  const observerRef = useRef(null);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPostIdForPopup, setSelectedPostIdForPopup] = useState(null);
  const [popupPostData, setPopupPostData] = useState(null);
  const [loadingPostData, setLoadingPostData] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [chats, setChats] = useState([]);
  const [isInstituteApprovalPending, setIsInstituteApprovalPending] =
    useState(false);

  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const getAuthToken = () => {
    return (
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("authToken") ||
      null
    );
  };

  const textRefs = useRef({});
  const [showReadMore, setShowReadMore] = useState({});

  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (Array.isArray(user) && user.length > 0) {
          return user[0].id || user[0].user_id || null;
        }
        return user.id || user.user_id || null;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const getCurrentUserAvatar = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      const profileImg =
        user.profile_image ||
        user.avatar ||
        user.profile_pic ||
        user.profile_individual_details?.profile_image ||
        user.profile_institute_details?.profile_image ||
        user.individual_details?.profile_image ||
        user.institute_details?.profile_image ||
        null;

      if (!profileImg) return null;

      if (String(profileImg).startsWith("http")) {
        return profileImg;
      }

      return `${API_CONFIG.BASE_URL}/${profileImg}`;
    } catch (e) {
      return null;
    }
  };

  const getCurrentUserName = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);

        if (user.user_type === "institute") {
          return (
            user.institute_details?.institute_name ||
            user.institute_name ||
            user.name ||
            "Institute"
          );
        }

        return user.name || user.username || "User";
      }

      return "User";
    } catch (e) {
      return "User";
    }
  };

  const checkInstituteApprovalPending = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return false;

      const parsedUser = JSON.parse(userStr);
      const user = Array.isArray(parsedUser) ? parsedUser[0] : parsedUser;

      const userType = String(user.user_type || "").toLowerCase();

      const approvalStatus =
        user.approval_status ||
        user.admin_approval_status ||
        user.institute_approval_status ||
        user.is_approved ||
        user.status ||
        user.profile_institute_details?.approval_status ||
        user.profile_institute_details?.admin_approval_status ||
        user.institute_details?.approval_status ||
        user.institute_details?.admin_approval_status;

      const status = String(approvalStatus || "").toLowerCase();

      const isApproved =
        status === "approved" ||
        status === "approve" ||
        status === "1" ||
        status === "true" ||
        status === "active";

      return userType === "institute" && !isApproved;
    } catch (error) {
      return false;
    }
  };

  const getFileInfo = (filePath) => {
    if (!filePath) return { name: "Research File", size: "Unknown" };

    const fileName = filePath.split("/").pop() || "research_file.pdf";
    const fileSize = "4.2 MB";
    const pageCount = "12 PAGES";

    return {
      name: fileName,
      size: fileSize,
      pages: pageCount,
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

  // 💡 Group Chat ka original scroll monitor logic
  const handlePopupScroll = () => {
    if (!popupMessagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      popupMessagesContainerRef.current;
    // Agar user bottom se 100px se upar jata hai toh auto-scroll rok do
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    popupShouldAutoScrollRef.current = isAtBottom;
  };

  // 💡 Naye message aane par ya chat click hone par control karne wala effect
  useEffect(() => {
    if (!activeChatId) return;

    const messagesCount = (chatMessages[activeChatId] || []).length;

    if (popupShouldAutoScrollRef.current && popupMessagesEndRef.current) {
      setTimeout(() => {
        popupMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    }

    // Jab user pehli baar kisi naye user par click karke chat box khole (0 messages state clear ho tab)
    if (messagesCount === 0) {
      popupShouldAutoScrollRef.current = true;
      setTimeout(() => {
        popupMessagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    }
  }, [activeChatId, chatMessages]);

  useEffect(() => {
    feedDataRef.current = feedData;
  }, [feedData]);

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
      setVideoMutedState((prev) => ({
        ...prev,
        [postId]: !newMutedState,
      }));
      if (!newMutedState && videoElement.paused) {
        videoElement.play().catch((err) => {
          console.error("Error playing video on unmute:", err);
        });
      }
    }
  };

  const toggleReadMorePost = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleOpenUserProfile = (postData, isMockPost = false) => {
    if (isMockPost) {
      setSelectedProfileUser({
        id: userId,
        name: userName,
        user_type: "individual",
      });
    } else {
      setSelectedProfileUser({
        id: postData.user_id || postData.id,
        name:
          postData.name ||
          postData.institute_name ||
          postData.institute_details?.institute_name ||
          "User",
        user_type: postData.user_type || "individual",
      });
    }
  };

  const toggleConnect = async (postUserId, e) => {
    e.stopPropagation();

    const userKey = String(postUserId);
    const currentStatus = connectedUsers[userKey] || connectedUsers[postUserId];

    if (currentStatus === 1) return;

    const token = getAuthToken();

    if (!token) {
      toast.error("Please login again.");
      return;
    }

    const nextStatus = currentStatus === 2 ? 3 : 1;

    // ✅ Click hote hi instant UI update
    setConnectedUsers((prev) => ({
      ...prev,
      [userKey]: nextStatus,
      [postUserId]: nextStatus,
    }));

    window.dispatchEvent(
      new CustomEvent("connectionStatusUpdated", {
        detail: { userId: userKey, status: nextStatus },
      }),
    );

    try {
      if (currentStatus === 2) {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/user/disconnect-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ connected_user_id: userKey }),
          },
        );

        const result = await response.json();

        if (!result.status) {
          setConnectedUsers((prev) => ({
            ...prev,
            [userKey]: 2,
            [postUserId]: 2,
          }));
          toast.error(result.message || "Disconnect failed");
        }
      } else {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/user/connect-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ connected_user_id: userKey }),
          },
        );

        const result = await response.json();

        if (!result.status) {
          setConnectedUsers((prev) => ({
            ...prev,
            [userKey]: 3,
            [postUserId]: 3,
          }));
          toast.error(result.message || "Connect request failed");
        }
      }
    } catch (err) {
      setConnectedUsers((prev) => ({
        ...prev,
        [userKey]: currentStatus || 3,
        [postUserId]: currentStatus || 3,
      }));
      toast.error("Connection error. Please try again.");
    }
  };
  const fetchConnectedUsersList = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/connected-users-list`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.status && result.data) {
        const statusMap = {};
        result.data.forEach((user) => {
          statusMap[user.id] = 2;
        });
        setConnectedUsers((prev) => ({
          ...prev,
          ...statusMap,
        }));
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  const fetchPendingStatuses = async () => {
    try {
      const token = getAuthToken();
      if (!token || feedData.length === 0) return;

      const currentUserId = String(getCurrentUserId());

      const userIds = [
        ...new Set(
          feedData
            .map((p) => String(p.user_id || p.poll?.user_id || ""))
            .filter((id) => id && id !== currentUserId),
        ),
      ];

      const results = await Promise.allSettled(
        userIds.map((uid) =>
          fetch(`${API_CONFIG.BASE_URL}/user/connection-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ connected_user_id: Number(uid) }),
          })
            .then((r) => r.json())
            .then((res) => ({ uid, res })),
        ),
      );

      const statusMap = {};
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.res?.status) {
          const { uid, res } = result.value;
          const status = res.data?.connection_status;
          if (status !== undefined && status !== null) {
            statusMap[uid] = status;
          }
        }
      });

      setConnectedUsers((prev) => {
        const merged = { ...prev };
        Object.keys(statusMap).forEach((uid) => {
          if (prev[uid] !== 2) {
            merged[uid] = statusMap[uid];
          }
        });
        return merged;
      });
    } catch (err) {
      console.error("Error fetching pending statuses:", err);
    }
  };

  const fetchBlockedUserIds = async () => {
    try {
      const token = getAuthToken();

      const res = await fetch(
        `${API_CONFIG.BASE_URL}/account/get-blocked-users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (data.status && Array.isArray(data.data)) {
        setBlockedUserIds(data.data.map((u) => String(u.id)));
      }
    } catch (err) {
      console.error("Blocked users fetch error:", err);
    }
  };

  useEffect(() => {
    if (!loadingFeed && feedData.length > 0) {
      fetchPendingStatuses();
    }
  }, [loadingFeed, feedData]);

  const getInitials = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const recomputePollPercentages = (options, totalVotes) => {
    const total = Number(totalVotes) || 0;
    return options.map((o) => {
      const count = Number(o.vote_count) || 0;
      const percentage = total > 0 ? Math.round((count * 100) / total) : 0;
      return { ...o, percentage };
    });
  };

  const updatePollInFeed = (pollId, updater) => {
    const pollIdStr = String(pollId);
    setFeedData((prev) =>
      prev.map((item) => {
        const poll = item?.poll || (item?.isPollPost ? item : null);
        const itemPollId = String(poll?.poll_id ?? item?.poll_id ?? "");
        if (!poll || itemPollId !== pollIdStr) return item;

        const nextPoll = updater(poll);
        if (item.poll) return { ...item, poll: nextPoll, isPollPost: true };
        return { ...item, ...nextPoll, isPollPost: true };
      }),
    );
  };

  const pollVoteRequest = async ({ pollId, optionId }) => {
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

  const clonePoll = (poll) => ({
    ...poll,
    options: Array.isArray(poll.options)
      ? poll.options.map((o) => ({ ...o }))
      : [],
  });

  const handlePollOptionClick = async (e, poll, optionId) => {
    e.preventDefault();
    e.stopPropagation();

    const pollId = poll?.poll_id;
    if (!pollId) return;

    const pollKey = String(pollId);
    if (pollActionLoading[pollKey]) return;

    setPollActionLoading((prev) => ({ ...prev, [pollKey]: true }));

    const snapshot = clonePoll(poll);

    try {
      const myVote = poll.my_vote_option_id;

      if (myVote && String(myVote) === String(optionId)) {
        updatePollInFeed(pollId, (p) =>
          applyLocalUndo({ ...p, options: p.options || [] }),
        );
        await pollUndoRequest({ pollId });
        return;
      }

      if (myVote && String(myVote) !== String(optionId)) {
        updatePollInFeed(pollId, (p) =>
          applyLocalSwitchVote({ ...p, options: p.options || [] }, optionId),
        );
        await pollUndoRequest({ pollId });
        await pollVoteRequest({ pollId, optionId });
        return;
      }

      updatePollInFeed(pollId, (p) =>
        applyLocalVote({ ...p, options: p.options || [] }, optionId),
      );
      await pollVoteRequest({ pollId, optionId });
    } catch (err) {
      updatePollInFeed(pollId, () => snapshot);
      toast.error(err?.message || "Poll action failed");
    } finally {
      setPollActionLoading((prev) => {
        const next = { ...prev };
        delete next[pollKey];
        return next;
      });
    }
  };

  const handlePollUndo = async (e, poll) => {
    e.preventDefault();
    e.stopPropagation();

    const pollId = poll?.poll_id;
    if (!pollId) return;

    const pollKey = String(pollId);
    if (pollActionLoading[pollKey]) return;

    setPollActionLoading((prev) => ({ ...prev, [pollKey]: true }));

    const snapshot = clonePoll(poll);

    try {
      updatePollInFeed(pollId, (p) =>
        applyLocalUndo({ ...p, options: p.options || [] }),
      );
      await pollUndoRequest({ pollId });
    } catch (err) {
      updatePollInFeed(pollId, () => snapshot);
      toast.error(err?.message || "Undo vote failed");
    } finally {
      setPollActionLoading((prev) => {
        const next = { ...prev };
        delete next[pollKey];
        return next;
      });
    }
  };

  const deletePollRequest = async ({ pollId }) => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required. Please login again.");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let response;
    try {
      response = await fetch(
        `${API_CONFIG.BASE_URL}/poll/delete-poll/${pollId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        },
      );
    } catch (err) {
      if (err?.name === "AbortError") {
        throw new Error("Delete poll timed out. Please try again.");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    const responseText = await response.text();
    if (responseText.includes("PHP Error") || responseText.includes("<div")) {
      throw new Error("Server error occurred while deleting poll.");
    }

    const data = JSON.parse(responseText);
    if (!data?.status)
      throw new Error(data?.message || "Failed to delete poll.");
    return data;
  };

  const handleDeletePoll = async (pollId) => {
    const pollIdStr = String(pollId);
    setDeletingPollId(pollIdStr);

    const snapshot = feedDataRef.current;
    setFeedData((prev) =>
      prev.filter((item) => {
        const poll = item?.poll || (item?.isPollPost ? item : null);
        const itemPollId = String(poll?.poll_id ?? item?.poll_id ?? "");
        return itemPollId !== pollIdStr;
      }),
    );

    try {
      await deletePollRequest({ pollId: pollIdStr });
      toast.success("Poll deleted successfully");
    } catch (err) {
      setFeedData(snapshot);
      toast.error(err?.message || "Failed to delete poll");
    } finally {
      setDeletingPollId(null);
    }
  };

  const _uploadProfileImage = async (file) => {
    const token = getAuthToken();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};

    const isInstitute = user.user_type === "institute";

    const endpoint = isInstitute
      ? `${API_CONFIG.BASE_URL}/profile/institute-profile-image`
      : `${API_CONFIG.BASE_URL}/profile/individual-profile-image`;

    const formData = new FormData();
    formData.append("profile_image", file);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (result.status) {
        const updatedUser = { ...user, profile_image: result.profile_image };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        const newAvatarUrl = `${API_CONFIG.BASE_URL}/${result.profile_image}`;
        setUserAvatar(newAvatarUrl);

        const currentUserId = getCurrentUserId();
        setFeedData((prevFeed) =>
          prevFeed.map((post) => {
            if (
              post.user_id === currentUserId ||
              post.user_id === user.id ||
              post.user_id === user.user_id
            ) {
              return {
                ...post,
                profile_image: result.profile_image,
              };
            }
            return post;
          }),
        );

        toast.success(result.message || "Profile image updated!");
      } else {
        toast.error("Failed to update profile image");
      }
    } catch (err) {
      toast.error("Network error while uploading image.");
    }
  };

  const saveFloatingTimestamps = (chatsList) => {
    const timestamps = {};
    chatsList.forEach((c) => {
      if (c.timestamp && c.timestamp > 0) timestamps[c.id] = c.timestamp;
    });
    localStorage.setItem("floatingChatTimestamps", JSON.stringify(timestamps));
  };

  const fetchChatUsers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/get-all-users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      const userList =
        data.data || data.users || (Array.isArray(data) ? data : []);
      const visibleUserList = userList.filter(
        (user) => !blockedUserIds?.includes(String(user.id)),
      );
      const savedTimestamps = JSON.parse(
        localStorage.getItem("floatingChatTimestamps") || "{}",
      );
      const currentUserId = getCurrentUserId();

      const formattedUsers = visibleUserList.map((user) => {
        const userId = String(user.id);
        const name =
          user.user_type === "institute"
            ? user.institute_details?.institute_name ||
              user.name ||
              "Unknown Institute"
            : user.name || "Unknown";

        return {
          id: userId,
          name,
          isYou: userId === String(currentUserId),
          timestamp: savedTimestamps[userId] || 0,
          lastMsg: `Say hi to ${name}...`,
          type:
            user.user_type === "institute"
              ? "Institute"
              : user.user_type === "admin"
                ? "Admin"
                : "Individual",
          time: "",
          isActive: false,
          isGroup: false,
          unreadCount: 0,
          avatars: [
            user.user_type === "institute"
              ? user.profile_institute_details?.profile_image
                ? `${API_CONFIG.BASE_URL}/${user.profile_institute_details.profile_image}`
                : avatar
              : user.profile_individual_details?.profile_image
                ? `${API_CONFIG.BASE_URL}/${user.profile_individual_details.profile_image}`
                : avatar,
          ],
          messages: [],
        };
      });

      const sortedUsers = [...formattedUsers].sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
      );
      setChats(sortedUsers);
      saveFloatingTimestamps(sortedUsers);
    } catch (error) {
      console.error("Error fetching chat users:", error);
    }
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleVideoPlayback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    });
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
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
    const newShowReadMore = {};

    Object.keys(textRefs.current).forEach((id) => {
      const el = textRefs.current[id];
      if (el) {
        newShowReadMore[id] = el.scrollHeight > el.clientHeight;
      }
    });

    setShowReadMore(newShowReadMore);
  }, [feedData]); // ✅ sirf feedData

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId);
    setUserAvatar(getCurrentUserAvatar());
    setUserName(getCurrentUserName());

    const pendingApproval = checkInstituteApprovalPending();
    setIsInstituteApprovalPending(pendingApproval);

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
        let pollList = [];

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
            },
          );
          const researchResult = await researchRes.json();
          if (researchResult.status && researchResult.data) {
            publishedResearch = researchResult.data.map((research) => ({
              ...research,
              id: research.researche_id,
              user_id: research.user_id,
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

        try {
          const pollRes = await fetch(`${API_CONFIG.BASE_URL}/poll/poll-list`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const pollResult = await pollRes.json();
          if (pollResult.status && pollResult.data) pollList = pollResult.data;
        } catch (pollErr) {
          console.error("Error fetching poll list:", pollErr);
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

        const pollIdSet = new Set(pollList.map((p) => String(p.poll_id)));

        const pollQuestions = new Set(pollList.map((p) => p.question?.trim()));
        const cleanApiPosts = apiPosts.filter((p) => {
          const hasPollId = p?.poll_id || p?.pollId;
          const isPollQuestion = pollQuestions.has((p?.post_text || "").trim());
          return !hasPollId && !isPollQuestion;
        });

        const pollFeedItems = pollList.map((p) => ({
          ...p,
          id: `poll_${p.poll_id}`,
          isPollPost: true,
          type: "poll",
        }));

        const allPosts = [
          ...publishedResearch,
          ...mockPosts,
          ...cleanApiPosts,
          ...pollFeedItems,
        ];

        allPosts.sort((a, b) => {
          const normalize = (v) => {
            if (!v) return 0;
            let s = String(v).replace(" ", "T");
            if (!s.endsWith("Z") && !s.includes("+") && !s.includes("-", 10)) {
              s += "+05:30";
            }
            return s;
          };
          const dateA = new Date(
            normalize(a.created_at || a.published_at || 0),
          );
          const dateB = new Date(
            normalize(b.created_at || b.published_at || 0),
          );
          return dateB - dateA;
        });

        setFeedData(allPosts);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchFeed();
    // fetchChatUsers();
    if (!pendingApproval) {
      fetchChatUsers();
    }
    fetchConnectedUsersList();
    fetchBlockedUserIds();
  }, []);
  useEffect(() => {
    if (!isInstituteApprovalPending && blockedUserIds !== null) {
      fetchChatUsers();
    }
  }, [blockedUserIds, isInstituteApprovalPending]);

  useEffect(() => {
    localStorage.setItem("videoMuteStates", JSON.stringify(videoMutedState));
  }, [videoMutedState]);

  useEffect(() => {
    const handleConnectionUpdate = (e) => {
      const { userId: updatedUserId, status } = e.detail;
      setConnectedUsers((prev) => ({ ...prev, [updatedUserId]: status }));
    };
    window.addEventListener("connectionStatusUpdated", handleConnectionUpdate);
    return () => {
      window.removeEventListener(
        "connectionStatusUpdated",
        handleConnectionUpdate,
      );
    };
  }, []);

  const activeChatIdRef = useRef(null);
  const chatsRef = useRef([]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const formatMsgTime = (created_at) => {
    if (!created_at) return "";
    const date = new Date(created_at);
    return date.toLocaleTimeString("en-IN", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (isInstituteApprovalPending) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setActiveChatId(null);
      return;
    }

    if (!activeChatId) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_CONFIG.BASE_URL}/message/message-get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ receiver_id: activeChatId }),
        });
        const result = await res.json();
        if (result.status && result.data) {
          const currentId = String(getCurrentUserId());
          const formatted = result.data.map((m) => {
            let fileObj = null;
            if (m.file_path) {
              const isVideo = m.file_path.match(/\.(mp4|webm|ogg|mov)$/i);
              fileObj = {
                path: m.file_path,
                type: isVideo ? "video" : "image",
              };
            }

            return {
              id: m.id,
              sender_id: m.sender_id,
              receiver_id: m.receiver_id,
              message: m.message,
              created_at: m.created_at,
              isMine: String(m.sender_id) === currentId,
              file: fileObj,
            };
          });
          setChatMessages((prev) => ({ ...prev, [activeChatId]: formatted }));

          if (formatted.length > 0) {
            const last = formatted[formatted.length - 1];

            setChats((prev) => {
              const updated = prev.map((c) =>
                c.id === activeChatId
                  ? {
                      ...c,
                      lastMsg: last.isMine
                        ? `You: ${last.message || "Sent an attachment"}`
                        : last.message || "Sent an attachment",
                      time: formatMsgTime(last.created_at),
                      timestamp: new Date(last.created_at).getTime(),
                      unreadCount: 0,
                    }
                  : c,
              );
              return [...updated].sort(
                (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
              );
            });
          }
        }
      } catch (err) {
        console.error("Message fetch error:", err);
      }
    };

    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeChatId, isInstituteApprovalPending]);

  const bgPollingRef = useRef(null);

  useEffect(() => {
    if (isInstituteApprovalPending) return;
    if (chats.length === 0) return;

    const pollBackground = async () => {
      const token = getAuthToken();
      const currentId = String(getCurrentUserId());
      const currentChats = chatsRef.current;
      const activeId = activeChatIdRef.current;

      const inactiveChats = currentChats.filter(
        (c) => !c.isGroup && String(c.id) !== String(activeId),
      );

      if (inactiveChats.length === 0) return;

      const results = await Promise.allSettled(
        inactiveChats.map((chat) =>
          fetch(`${API_CONFIG.BASE_URL}/message/message-get`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ receiver_id: chat.id }),
          }).then((r) => r.json()),
        ),
      );

      let hasUpdates = false;
      const updates = {};

      results.forEach((result, idx) => {
        if (result.status !== "fulfilled") return;
        const data = result.value;
        const chat = inactiveChats[idx];
        if (!data.status || !data.data || data.data.length === 0) return;

        const msgs = data.data;
        const latestMsg = msgs[msgs.length - 1];

        const newLastMsg =
          String(latestMsg.sender_id) === currentId
            ? `You: ${latestMsg.message || "Sent an attachment"}`
            : latestMsg.message || "Sent an attachment";

        const newTime = formatMsgTime(latestMsg.created_at);
        const newTimestamp = new Date(latestMsg.created_at).getTime();

        const unreadCount = msgs.filter(
          (m) =>
            String(m.sender_id) !== currentId &&
            String(m.receiver_id) === currentId &&
            String(m.is_seen) === "0",
        ).length;

        fetchShareData();
      });

      if (hasUpdates) {
        setChatMessages((prevMsgs) => {
          const updatedMsgs = { ...prevMsgs };
          results.forEach((result, idx) => {
            if (result.status !== "fulfilled") return;
            const data = result.value;
            const chat = inactiveChats[idx];
            if (!data.status || !data.data) return;
            updatedMsgs[chat.id] = data.data.map((m) => ({
              id: m.id,
              sender_id: m.sender_id,
              receiver_id: m.receiver_id,
              message: m.message,
              created_at: m.created_at,
              isMine: String(m.sender_id) === currentId,
            }));
          });
          return updatedMsgs;
        });

        setChats((prev) => {
          const mapped = prev.map((chat) => {
            const update = updates[chat.id];
            if (!update) return chat;
            return {
              ...chat,
              lastMsg: update.lastMsg,
              time: update.time,
              unreadCount: update.unreadCount,
              timestamp: update.timestamp,
            };
          });

          const sorted = [...mapped].sort(
            (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
          );
          saveFloatingTimestamps(sorted);
          return sorted;
        });
      }
    };

    bgPollingRef.current = setInterval(pollBackground, 5000);
    pollBackground();

    return () => {
      if (bgPollingRef.current) clearInterval(bgPollingRef.current);
    };
  }, [chats.length, isInstituteApprovalPending]);

  useEffect(() => {
    const fetchShareData = async () => {
      try {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };

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

        try {
          const groupRes = await fetch(
            `${API_CONFIG.BASE_URL}/group/get-groups`,
            {
              headers: { "Content-Type": "application/json", ...headers },
            },
          );
          const groupData = await groupRes.json();
          if (groupData.status && Array.isArray(groupData.groups))
            setShareGroups(groupData.groups);
          else if (Array.isArray(groupData.data))
            setShareGroups(groupData.data);
          else if (Array.isArray(groupData)) setShareGroups(groupData);
        } catch (e) {
          console.error("Groups fetch error:", e);
        }
      } catch (err) {
        console.error("Share data fetch error:", err);
      }
    };
    fetchShareData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatWidgetRef.current && !chatWidgetRef.current.contains(e.target)) {
        setActiveChatId(null);
        setIsChatListOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchProfilePercent = async () => {
      try {
        const token = getAuthToken();

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userType = user.user_type;

        const response = await fetch(
          userType === "institute"
            ? `${API_CONFIG.BASE_URL}/profile/get-profile-institute`
            : `${API_CONFIG.BASE_URL}/profile/get-profile-individual`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        const apiProfile = result.data || {};

        let percent = 0;

        if (userType === "institute") {
          percent = calculateInstituteProfileCompletion(apiProfile);
        } else {
          percent = calculateIndividualProfileCompletion(apiProfile);
        }

        setProfilePercent(percent);

        console.log("PROFILE FOR PERCENT:", userType === "institute"
          ? JSON.parse(localStorage.getItem("latestInstituteProfile") || "{}")
          : apiProfile
        );
        console.log("FINAL PERCENT:", percent);
      } catch (error) {
        console.log("Profile percent error:", error);
      }
    };

    fetchProfilePercent();

    window.addEventListener("profileUpdated", fetchProfilePercent);

    return () => {
      window.removeEventListener("profileUpdated", fetchProfilePercent);
    };
  }, []);

  const handleShareClick = async (postId) => {
    setSelectedSharePostId(postId);
    setIsShareOpen(true);
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
    const isCurrentlySaved = !!savedPosts[postId];

    // ✅ Pehle UI + localStorage instantly update
    setSavedPosts((prev) => {
      const newSavedPosts = {
        ...prev,
        [postId]: !isCurrentlySaved,
      };

      localStorage.setItem("savedPosts", JSON.stringify(newSavedPosts));
      return newSavedPosts;
    });

    // ✅ Toast bhi instantly show hoga
    toast.success(
      isCurrentlySaved ? "Post removed from saved" : "Post saved successfully",
    );

    // ✅ Agar unsave hua hai to saved page ko bhi notify karo
    if (isCurrentlySaved) {
      window.dispatchEvent(
        new CustomEvent("postUnsaved", {
          detail: { postId },
        }),
      );
    }

    if (isMockPost) return;

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

      if (!result.status) {
        // ❌ API fail ho to old state wapas
        setSavedPosts((prev) => {
          const rollback = {
            ...prev,
            [postId]: isCurrentlySaved,
          };

          localStorage.setItem("savedPosts", JSON.stringify(rollback));
          return rollback;
        });

        toast.error(result.message || "Failed to update save status");
      }
    } catch (err) {
      console.error("Save API error:", err);

      setSavedPosts((prev) => {
        const rollback = {
          ...prev,
          [postId]: isCurrentlySaved,
        };

        localStorage.setItem("savedPosts", JSON.stringify(rollback));
        return rollback;
      });

      toast.error("Network error while saving.");
    }
  };

  const fetchComments = async (postId, post) => {
    const token = getAuthToken();
    const isResearchPost = post?.isResearchPost === true;

    try {
      const actualId = isResearchPost ? post.researche_id || post.id : post.id;
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/get-comments/${actualId}`
        : `${API_CONFIG.BASE_URL}/post/get-comments/${actualId}`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      const fetchedComments = (result.data || []).map((c) => ({
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
        [postId]: {
          ...prev[postId],
          isOpen: true,
          list: fetchedComments,
        },
      }));
    } catch (err) {
      console.error("Fetch comments error:", err);
      setCommentsState((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isOpen: true,
          list: prev[postId]?.list || [],
        },
      }));
    }
  };

  const toggleComments = async (postId) => {
    const isCurrentlyOpen = commentsState[postId]?.isOpen;
    const post = feedData.find(
      (p) => p.id === postId || p.researche_id === postId,
    );
    const isMockPost = post?.author !== undefined;

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

    setCommentsState((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], loading: false },
    }));
    if (isMockPost) return;

    // ✅ Cache hit — already loaded hai to skip
    if (commentsState[postId]?.list?.length > 0) return;

    fetchComments(postId, post);
  };
  const addComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    const post = feedData.find(
      (p) => p.id === postId || p.researche_id === postId,
    );

    const isMockPost = post?.author !== undefined;
    const isResearchPost = post?.isResearchPost === true;
    const cleanComment = commentText.trim();

    // ✅ Instant local add — API ka wait nahi
    const tempComment = {
      id: `temp_${Date.now()}`,
      text: cleanComment,
      author: userName,
      authorId: userId,
      authorAvatar: userAvatar || getCurrentUserAvatar() || null,
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
        body: JSON.stringify({ comment: cleanComment }),
      });

      const result = await res.json();

      if (result.status) {
        // ✅ Real comments se replace karo (temp hata ke)
        await fetchComments(postId, post);
        setFeedData((prevFeed) =>
          prevFeed.map((p) => {
            if (p.id === postId || p.researche_id === postId) {
              return {
                ...p,
                comment_count: parseInt(p.comment_count || 0) + 1,
              };
            }
            return p;
          }),
        );
      } else {
        // ✅ Fail hone par temp comment hatao
        setCommentsState((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            list: prev[postId].list.filter((c) => c.id !== tempComment.id),
          },
        }));
        toast.error(result.message || "Failed to add comment");
      }
    } catch (err) {
      // ✅ Error par bhi temp hatao
      setCommentsState((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          list: prev[postId].list.filter((c) => c.id !== tempComment.id),
        },
      }));
      toast.error("Network error while adding comment");
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
      if (!result.status) {
        console.error("Failed to delete comment on server");
      }
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  const toggleReadMore = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

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

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
      alert(
        "Sharing is not supported on this browser. Link copied to clipboard!",
      );
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDeletePost = async (postId, isMockPost) => {
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
      toast.error("Error deleting. Please try again.");
    } finally {
      setDeletingPost(null);
      setShowOptionsId(null);
      setShowDeletePopup(false);
    }
  };

  const handleReportPost = async (reason) => {
    if (!selectedPost?.postId) return;

    setIsReportingLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/post/report-post`, // ✅ base url + no ID in path
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            post_id: selectedPost.postId, // ✅ post_id (snake_case)
            reason: reason,
          }),
        },
      );

      const result = await response.json();

      if (result.status) {
        setFeedData((prev) =>
          prev.filter((p) => (p.id || p.researche_id) !== selectedPost.postId),
        );
        setReportStep(2);
      } else {
        toast.error(result.message || "Failed to report post");
      }
    } catch (error) {
      toast.error("Error reporting post. Please try again.");
    } finally {
      setIsReportingLoading(false);
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
            (p) =>
              String(p.user_id ?? p.poll?.user_id ?? "") !==
              String(selectedPost?.postUserId),
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
      if (selectedPost.isPollPost) {
        handleDeletePoll(selectedPost.pollId);
      } else {
        handleDeletePost(selectedPost.postId, selectedPost.isMockPost);
      }
    }
    setShowDeletePopup(false);
    setSelectedPost(null);
  };

  const closeDeletePopup = () => {
    setShowDeletePopup(false);
    setSelectedPost(null);
  };

  const closeReportPopup = () => {
    setShowReportPopup(false);
    setReportReason("");
    setSelectedPost(null);
    setReportStep(1); // Reset to first screen
  };

  const closeBlockPopup = () => {
    setShowBlockPopup(false);
    setSelectedPost(null);
  };

  const handleChatSend = async () => {
    if (isInstituteApprovalPending) {
      openApprovalModal();
      return;
    }

    if (!chatInput.trim() || !activeChatId) return;

    const messageText = chatInput.trim();
    setChatInput("");

    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: String(userId),
      receiver_id: String(activeChatId),
      message: messageText,
      isMine: true,
      created_at: new Date().toISOString(),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), tempMsg],
    }));

    setChats((prev) => {
      const now = Date.now();
      const updated = prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMsg: `You: ${messageText}`,
              timestamp: now,
              time: formatMsgTime(new Date().toISOString()),
            }
          : c,
      );
      const sorted = [...updated].sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
      );
      saveFloatingTimestamps(sorted);
      return sorted;
    });

    try {
      const token = getAuthToken();
      await fetch(`${API_CONFIG.BASE_URL}/message/message-send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: activeChatId,
          message: messageText,
        }),
      });
    } catch (err) {
      console.error("Message send error:", err);
    }
  };

  const activeChatData = chats.find((c) => c.id === activeChatId);

  const openApprovalModal = () => {
    setShowApprovalModal(true);
  };

  const getPostProfileSrc = (post) => {
    if (post.profile_image) {
      return `${API_CONFIG.BASE_URL}/${post.profile_image}`;
    }
    return avatar;
  };

  return (
    <DashboardLayout>
      <div className=" w-full min-h-screen overflow-x-hidden  px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8 max-w-full bg-slate-100 text-slate-800 dark:bg-[#0b0f0d] dark:text-slate-900 dark:text-white">
        {" "}
        <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 flex justify-center w-full">
          <div
            className="
            relative w-full max-w-5xl
           rounded-xl sm:rounded-2xl

            border border-slate-200
           bg-white

          dark:border-[#1f2a25]
         dark:bg-gradient-to-r
         dark:from-[#020b08]
         dark:via-[#03130e]
         dark:to-[#020b08]

         shadow-sm  px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-5 md:py-6 lg:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between overflow-hidden gap-3 sm:gap-4 md:gap-6"
          >
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 md:gap-6 z-10 w-full">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-2xl bg-emerald-100 dark:bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.15)] shrink-0">
                <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-2xl sm:text-3xl md:text-4xl">
                  verified_user
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-slate-900 dark:text-white">
                      Welcome back,{" "}
                      <span className="break-words">{userName}!</span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base max-w-2xl leading-relaxed">
                      Your research network is active. Tracking collaborations
                      <br className="hidden sm:block" />
                      research activity, and latest updates.
                    </p>
                  </div>

                  <div className="w-full lg:w-[360px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/35 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Profile Status
                      </p>

                      <p className="text-sm font-extrabold text-[#00ff88]">
                        {profilePercent}% Complete
                      </p>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00ff88] transition-all duration-500"
                        style={{ width: `${profilePercent}%` }}
                      />
                    </div>

                    <p className="mt-3 text-xs italic text-slate-500 dark:text-slate-400">
                      Complete your bio to reach Top Contributor status.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block absolute right-0 top-0 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] lg:w-[300px] lg:h-[300px] bg-[#00ff88]/10 blur-[80px] sm:blur-[100px] lg:blur-[140px]"></div>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 auto-rows-max lg:auto-rows-auto">
          <div className="lg:col-span-2 w-full space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
            <section className="w-full">
              <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6 gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 whitespace-nowrap">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-lg sm:text-xl">
                    rss_feed
                  </span>
                  <span className="hidden sm:inline">Network Feed</span>
                  <span className="sm:hidden">Feed</span>
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 w-full">
                {loadingFeed ? (
                  <div className="bg-[2 15 10] rounded-lg sm:rounded-xl border border-white/5 p-6 sm:p-8 flex flex-col sm:flex-row justify-center items-center gap-3 w-full">
                    <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-[#00ff88]"></div>
                    <span className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                      Loading network feed...
                    </span>
                  </div>
                ) : feedData.length > 0 ? (
                  feedData.map((post, index) => {
                    const poll = post?.poll || (post?.isPollPost ? post : null);
                    const hasPollCard = Boolean(
                      poll?.poll_id && Array.isArray(poll?.options),
                    );

                    if (hasPollCard) {
                      const pollId = String(poll.poll_id);
                      const pollUserId = poll.user_id;
                      const pollName =
                        poll.user_type === "institute"
                          ? poll.name || "Institute"
                          : poll.name || "User";
                      const pollTime = formatDate(
                        `${poll.created_at.replace(" ", "T")}+05:30`,
                      );
                      const isCurrentUserPoll =
                        String(userId) === String(pollUserId);
                      const isBusy = Boolean(pollActionLoading[pollId]);
                      const pollOptionsKey = `poll-${pollId}`;
                      const isDeletingPoll =
                        String(deletingPollId) === String(pollId);
                      const totalVotes = Number(poll.total_votes) || 0;
                      const myVote = poll.my_vote_option_id;

                      return (
                        <article
                          key={`poll-${pollId}-${index}`}
                          className=" bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden relative w-full"
                        >
                          <div className="p-3 sm:p-4 md:p-5">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <button
                                  type="button"
                                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-emerald-100 dark:bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.12)] shrink-0 hover:opacity-90 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenUserProfile(
                                      {
                                        user_id: pollUserId,
                                        name: pollName,
                                        user_type: poll.user_type,
                                        profile_image: poll.profile_image,
                                      },
                                      false,
                                    );
                                  }}
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

                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                {!isCurrentUserPoll && (
                                  <button
                                    onClick={(e) =>
                                      toggleConnect(pollUserId, e)
                                    }
                                    disabled={connectedUsers[pollUserId] === 1}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                                      connectedUsers[pollUserId] === 2
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-[#00ff88]/10 dark:text-[#00ff88] dark:border-[#00ff88]/40"
                                        : connectedUsers[pollUserId] === 1
                                          ? "bg-yellow-50 text-yellow-600 border-yellow-300 cursor-not-allowed dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/40"
                                          : "bg-[#00ff88] text-black border-[#00ff88] hover:bg-[#00dd77]"
                                    }`}
                                  >
                                    {connectedUsers[pollUserId] === 2
                                      ? "✓ CONNECTED"
                                      : connectedUsers[pollUserId] === 1
                                        ? "⏳ PENDING"
                                        : "+ CONNECT"}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={isDeletingPoll}
                                  className="text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowOptionsId(
                                      showOptionsId === pollOptionsKey
                                        ? null
                                        : pollOptionsKey,
                                    );
                                  }}
                                >
                                  <MaterialIcon
                                    name="more_horiz"
                                    className="text-base sm:text-lg"
                                  />
                                </button>

                                {showOptionsId === pollOptionsKey && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowOptionsId(null);
                                      }}
                                    ></div>
                                    <div className="absolute right-4 top-[68px] w-40 sm:w-48 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 animate-fadeInScale">
                                      {" "}
                                      {isCurrentUserPoll ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPost({
                                              isPollPost: true,
                                              pollId,
                                              postUserId: pollUserId,
                                              postName: pollName,
                                            });
                                            setShowDeletePopup(true);
                                            setShowOptionsId(null);
                                          }}
                                          disabled={isDeletingPoll}
                                          className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                            delete
                                          </span>
                                          <span>
                                            {isDeletingPoll
                                              ? "Deleting..."
                                              : "Delete Poll"}
                                          </span>
                                        </button>
                                      ) : (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedPost({
                                                postId: pollOptionsKey,
                                                isMockPost: false,
                                                postUserId: pollUserId,
                                                postName: pollName,
                                                isReportPost: true,
                                              });
                                              setShowReportPopup(true);
                                              setShowOptionsId(null);
                                            }}
                                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-slate-200 dark:border-white/10"
                                          >
                                            <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                              flag
                                            </span>
                                            <span>Report Poll</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedPost({
                                                postId: pollOptionsKey,
                                                isMockPost: false,
                                                postUserId: pollUserId,
                                                postName: pollName,
                                                isBlockUser: true,
                                              });
                                              setShowBlockPopup(true);
                                              setShowOptionsId(null);
                                            }}
                                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group"
                                          >
                                            <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                              block
                                            </span>
                                            <span>Block User</span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <h3 className="mt-3 sm:mt-4 md:mt-5 text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                              {poll.question}
                            </h3>

                            <div className="mt-3 sm:mt-4 md:mt-5 space-y-2 sm:space-y-3">
                              {poll.options.map((opt) => {
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
                                    onClick={(e) =>
                                      handlePollOptionClick(e, poll, opt.id)
                                    }
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
                              <span className="truncate">
                                {totalVotes.toLocaleString()} votes
                              </span>
                              {myVote ? (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={(e) => handlePollUndo(e, poll)}
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
                        ? " Institute"
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
                    const isSaved = savedPosts[postId] || post.is_saved === "1";

                    const postComments = commentsState[postId] || {
                      isOpen: false,
                      list: [],
                    };
                    const postUserId = isMockPost ? userId : post.user_id;
                    const isCurrentUserPost =
                      String(userId) === String(postUserId) || isMockPost;
                    const isDeleting = deletingPost === postId;
                    const hasImage =
                      !isMockPost && post.image && post.image !== "";
                    const hasVideo =
                      !isMockPost && post.video && post.video !== "";
                    const videoUrl = hasVideo
                      ? `${API_CONFIG.BASE_URL}/${post.video}`
                      : null;
                    const isVideoMuted = !videoMutedState[postId];

                    if (isResearchPost || (post.research_file && !isMockPost)) {
                      const fileInfo = getFileInfo(post.research_file);
                      return (
                        <article
                          key={`res-${postId}-${index}`}
                          className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-white/5 shadow-sm overflow-visible relative w-full"
                        >
                          <div className="p-3 sm:p-4 md:p-5">
                            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 md:mt-4 mb-3 sm:mb-4 md:mb-5">
                              <img
                                alt={postName}
                                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                src={getPostProfileSrc(post)}
                                onError={(e) => {
                                  e.target.src = avatar;
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenUserProfile(post, isMockPost);
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4
                                      className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:text-[#00ff88] cursor-pointer transition-colors capitalize truncate text-xs sm:text-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenUserProfile(post, isMockPost);
                                      }}
                                    >
                                      {postName}
                                    </h4>
                                    <p className="text-[9px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-0.5 flex-wrap">
                                      {postType}{" "}
                                      <span className="w-0.5 h-0.5 rounded-full bg-slate-500 inline-block"></span>{" "}
                                      {postTime}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                    {!isCurrentUserPost && (
                                      <button
                                        onClick={(e) =>
                                          toggleConnect(postUserId, e)
                                        }
                                        disabled={
                                          connectedUsers[postUserId] === 1
                                        }
                                        className={`min-w-[115px] h-8 px-3 sm:px-4 rounded-lg text-[9px] sm:text-xs font-bold transition-all duration-200 tracking-wide whitespace-nowrap flex items-center justify-center border ${
                                          connectedUsers[postUserId] === 2
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-[#092016] dark:text-[#00ff88] dark:border-[#00ff88]/40 dark:hover:bg-[#00ff88]/10"
                                            : connectedUsers[postUserId] === 1
                                              ? "bg-yellow-50 text-yellow-700 border-yellow-300 cursor-not-allowed dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/40"
                                              : "bg-[#00ff88] text-[#001f12] border-[#00ff88] hover:bg-[#00dd77] hover:scale-[1.02] shadow-[0_0_10px_rgba(0,255,136,0.25)]"
                                        }`}
                                      >
                                        {connectedUsers[postUserId] === 2
                                          ? "✓ CONNECTED"
                                          : connectedUsers[postUserId] === 1
                                            ? "⏳ PENDING"
                                            : "+ CONNECT"}
                                      </button>
                                    )}
                                    <div className="relative">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowOptionsId(
                                            showOptionsId === postId
                                              ? null
                                              : postId,
                                          );
                                        }}
                                        disabled={isDeleting}
                                        className="text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
                                      >
                                        <span className="material-symbols-outlined text-lg sm:text-xl">
                                          more_horiz
                                        </span>
                                      </button>

                                      {showOptionsId === postId && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowOptionsId(null);
                                            }}
                                          ></div>
                                          <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 animate-fadeInScale">
                                            {isCurrentUserPost && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedPost({
                                                    postId,
                                                    isMockPost,
                                                    postUserId,
                                                    postName,
                                                  });
                                                  setShowDeletePopup(true);
                                                }}
                                                disabled={isDeleting}
                                                className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                                              >
                                                <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                                  delete
                                                </span>
                                                <span>
                                                  {isDeleting
                                                    ? "Deleting..."
                                                    : "Delete Post"}
                                                </span>
                                              </button>
                                            )}

                                            {!isCurrentUserPost && (
                                              <>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPost({
                                                      postId,
                                                      isMockPost,
                                                      postUserId,
                                                      postName,
                                                      isReportPost: true,
                                                    });
                                                    setShowReportPopup(true);
                                                    setShowOptionsId(null);
                                                  }}
                                                  className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-slate-200 dark:border-white/10"
                                                >
                                                  <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                                    flag
                                                  </span>
                                                  <span>Report Post</span>
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPost({
                                                      postId,
                                                      isMockPost,
                                                      postUserId,
                                                      postName,
                                                      isBlockUser: true,
                                                    });
                                                    setShowBlockPopup(true);
                                                    setShowOptionsId(null);
                                                  }}
                                                  className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group"
                                                >
                                                  <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                                    block
                                                  </span>
                                                  <span>Block User</span>
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mb-2 sm:mb-3 md:mb-4">
                              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-snug break-words">
                                {post.research_title || "Published Research"}
                              </h3>
                            </div>

                            <div className="mb-3 sm:mb-4 md:mb-5">
                              <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed break-words">
                                {postContent}
                              </p>
                            </div>

                            {Array.isArray(post.hash_tag) &&
                              post.hash_tag.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
                                  {post.hash_tag.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-0.5 rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            {post.research_file && (
                              <div className="mb-3 sm:mb-4 md:mb-5">
                                <div className="bg-slate-100 dark:bg-[#0e0f10] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-white/20 transition-all gap-2 sm:gap-3">
                                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg bg-slate-200 dark:bg-[#0f172a] border border-emerald-200 dark:border-[#00ff88]/20 flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-lg sm:text-xl md:text-2xl">
                                        description
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {fileInfo.name}
                                      </p>
                                      <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                                        {fileInfo.pages} • {fileInfo.size}
                                      </p>
                                    </div>
                                  </div>
                                  <a
                                    href={`${API_CONFIG.BASE_URL}/${post.research_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00ff88] text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-[#00dd77] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                                  >
                                    <span className="material-symbols-outlined text-xs sm:text-sm">
                                      open_in_new
                                    </span>
                                    <span>View</span>
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 pt-2 sm:pt-3 md:pt-4 border-t border-white/5 flex-wrap w-full">
                              <button
                                onClick={() => toggleLike(postId)}
                                className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${isLiked ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                              >
                                <span
                                  className="material-symbols-outlined text-base sm:text-lg"
                                  style={{
                                    fontVariationSettings: isLiked
                                      ? "'FILL' 1"
                                      : "'FILL' 0",
                                  }}
                                >
                                  favorite
                                </span>
                                <span className="text-[9px] sm:text-xs font-bold hidden sm:inline">
                                  {parseInt(post.like_count || 0) > 0 ||
                                  (isMockPost && isLiked)
                                    ? isMockPost
                                      ? isLiked
                                        ? 1
                                        : 0
                                      : post.like_count
                                    : "Like"}
                                </span>
                              </button>
                              <button
                                onClick={() => toggleComments(postId)}
                                className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${postComments.isOpen ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                              >
                                <span className="material-symbols-outlined text-base sm:text-lg">
                                  chat_bubble
                                </span>
                                <span className="text-[9px] sm:text-xs font-bold">
                                  {postComments.list.length > 0
                                    ? `(${postComments.list.length})`
                                    : post.comment_count &&
                                        !postComments.list.length
                                      ? `(${post.comment_count})`
                                      : ""}
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  handleShare(post.research_title, postContent)
                                }
                                className="flex items-center gap-0.5 sm:gap-1 text-slate-500 hover:text-emerald-600 dark:text-[#00ff88] transition-colors text-xs sm:text-sm"
                              >
                                <span className="material-symbols-outlined text-base sm:text-lg">
                                  share
                                </span>
                                <span className="hidden sm:inline text-xs font-bold">
                                  Share
                                </span>
                              </button>
                              <button
                                onClick={() => toggleSave(postId)}
                                className={`ml-auto flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${isSaved ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                              >
                                <span
                                  className="material-symbols-outlined text-base sm:text-lg"
                                  style={{
                                    fontVariationSettings: isSaved
                                      ? "'FILL' 1"
                                      : "'FILL' 0",
                                  }}
                                >
                                  bookmark
                                </span>
                                <span className="hidden sm:inline text-xs font-bold">
                                  Save
                                </span>
                              </button>
                            </div>

                            {postComments.isOpen && (
                              <div className="mt-4 sm:mt-6 sm:pl-16 space-y-4 sm:space-y-5">
                                <div className="flex gap-2 sm:gap-3 items-start">
                                  <div className="flex-1 relative">
                                    <input
                                      type="text"
                                      value={newCommentText[postId] || ""}
                                      onChange={(e) =>
                                        setNewCommentText((prev) => ({
                                          ...prev,
                                          [postId]: e.target.value,
                                        }))
                                      }
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          addComment(
                                            postId,
                                            newCommentText[postId] || "",
                                          );
                                        }
                                      }}
                                      placeholder="Add a comment..."
                                      className="w-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 dark:focus:border-[#00ff88]/50 transition-colors pr-10 text-slate-800 dark:text-white placeholder:text-slate-400"
                                      style={{
                                        outline: "none",
                                        boxShadow: "none",
                                      }}
                                    />
                                    <button
                                      onClick={() =>
                                        addComment(
                                          postId,
                                          newCommentText[postId] || "",
                                        )
                                      }
                                      className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-emerald-600 dark:text-[#00ff88] hover:text-emerald-600 dark:text-[#00ff88]/80 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        send
                                      </span>
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-3 sm:space-y-4 max-h-[200px] sm:max-h-[280px] overflow-y-auto pr-2 scrollbar-hidden">
                                  {postComments.list.length > 0 ? (
                                    postComments.list.map((comment) => (
                                      <div
                                        key={comment.id}
                                        className="flex gap-2 sm:gap-3 group"
                                      >
                                        <img
                                          alt={comment.author}
                                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-white/10 object-cover shrink-0 cursor-pointer"
                                          src={comment.authorAvatar || avatar}
                                          onError={(e) => {
                                            e.target.src = avatar;
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenUserProfile(
                                              {
                                                user_id: comment.authorId,
                                                name: comment.author,
                                              },
                                              false,
                                            );
                                          }}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <span
                                              className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white truncate pr-2 cursor-pointer hover:text-emerald-600 dark:text-[#00ff88]"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenUserProfile(
                                                  {
                                                    user_id: comment.authorId,
                                                    name: comment.author,
                                                  },
                                                  false,
                                                );
                                              }}
                                            >
                                              {comment.author}
                                            </span>
                                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                              <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">
                                                {formatTimeAgo(
                                                  comment.timestamp,
                                                )}
                                              </span>
                                              {comment.authorId === userId && (
                                                <button
                                                  onClick={() =>
                                                    deleteComment(
                                                      postId,
                                                      comment.id,
                                                    )
                                                  }
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
                                            className={`text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}
                                          >
                                            {comment.text}
                                          </p>
                                          {comment.text.length > 120 && (
                                            <button
                                              onClick={() =>
                                                toggleReadMore(comment.id)
                                              }
                                              className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-[#00ff88] mt-1 hover:underline"
                                            >
                                              {expandedComments[comment.id]
                                                ? "Show less"
                                                : "Read more"}
                                            </button>
                                          )}
                                          <div className="border-b border-slate-200 dark:border-white/10 mt-2 sm:mt-3"></div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 sm:py-6">
                                      <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest italic">
                                        No comments yet. Be the first to
                                        discuss!
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    }

                    return (
                      <article
                        key={`post-${postId}-${index}`}
                        className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-white/5 shadow-sm overflow-visible relative w-full"
                      >
                        <div className="p-3 sm:p-4 md:p-5">
                          <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 md:mt-3 mb-2 sm:mb-3 md:mb-4">
                            <img
                              alt={postName}
                              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              src={getPostProfileSrc(post)}
                              onError={(e) => {
                                e.target.src = avatar;
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenUserProfile(post, isMockPost);
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <h4
                                    className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:text-[#00ff88] cursor-pointer transition-colors capitalize truncate text-xs sm:text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenUserProfile(post, isMockPost);
                                    }}
                                  >
                                    {postName}
                                  </h4>
                                  <p className="text-[9px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-0.5 flex-wrap">
                                    {postType}{" "}
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-500 inline-block"></span>{" "}
                                    {postTime}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                  {!isCurrentUserPost && (
                                    <button
                                      onClick={(e) =>
                                        toggleConnect(postUserId, e)
                                      }
                                      disabled={
                                        connectedUsers[postUserId] === 1
                                      }
                                      className={`min-w-[115px] h-8 px-3 sm:px-4 rounded-lg text-[9px] sm:text-xs font-bold transition-all duration-200 tracking-wide whitespace-nowrap flex items-center justify-center border ${
                                        connectedUsers[postUserId] === 2
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-[#092016] dark:text-[#00ff88] dark:border-[#00ff88]/40 dark:hover:bg-[#00ff88]/10"
                                          : connectedUsers[postUserId] === 1
                                            ? "bg-yellow-50 text-yellow-700 border-yellow-300 cursor-not-allowed dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/40"
                                            : "bg-[#00ff88] text-[#001f12] border-[#00ff88] hover:bg-[#00dd77] hover:scale-[1.02] shadow-[0_0_10px_rgba(0,255,136,0.25)]"
                                      }`}
                                    >
                                      {connectedUsers[postUserId] === 2
                                        ? "✓ CONNECTED"
                                        : connectedUsers[postUserId] === 1
                                          ? "⏳ PENDING"
                                          : "+ CONNECT"}
                                    </button>
                                  )}
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowOptionsId(
                                          showOptionsId === postId
                                            ? null
                                            : postId,
                                        );
                                      }}
                                      disabled={isDeleting}
                                      className="text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
                                    >
                                      <span className="material-symbols-outlined text-lg sm:text-xl">
                                        more_horiz
                                      </span>
                                    </button>
                                    {showOptionsId === postId && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowOptionsId(null);
                                          }}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-[#1e293b] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 animate-fadeInScale">
                                          {" "}
                                          {isCurrentUserPost ? (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPost({
                                                  postId,
                                                  isMockPost,
                                                  postUserId,
                                                  postName,
                                                });
                                                setShowDeletePopup(true);
                                              }}
                                              disabled={isDeleting}
                                              className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                                delete
                                              </span>
                                              <span>
                                                {isDeleting
                                                  ? "Deleting..."
                                                  : "Delete Post"}
                                              </span>
                                            </button>
                                          ) : (
                                            <>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedPost({
                                                    postId,
                                                    isMockPost,
                                                    postUserId,
                                                    postName,
                                                    isReportPost: true,
                                                  });
                                                  setShowReportPopup(true);
                                                  setShowOptionsId(null);
                                                }}
                                                className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-slate-200 dark:border-white/10"
                                              >
                                                <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                                  flag
                                                </span>
                                                <span>Report Post</span>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedPost({
                                                    postId,
                                                    isMockPost,
                                                    postUserId,
                                                    postName,
                                                    isBlockUser: true,
                                                  });
                                                  setShowBlockPopup(true);
                                                  setShowOptionsId(null);
                                                }}
                                                className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group"
                                              >
                                                <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                                  block
                                                </span>
                                                <span>Block User</span>
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {isTextOnly ? (
                            <div className="mb-2 sm:mb-3 md:mb-4 w-full">
                              <p
                                ref={(el) => {
                                  if (el) textRefs.current[postId] = el;
                                }}
                                className={`text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words ${
                                  expandedPosts[postId] ? "" : "line-clamp-10"
                                }`}
                              >
                                {postContent}
                              </p>

                              {/* 👇 yahi add karna hai */}
                              {showReadMore[postId] && (
                                <button
                                  onClick={() => toggleReadMorePost(postId)}
                                  className="text-emerald-600 dark:text-[#00ff88] text-[10px] sm:text-xs hover:underline mt-2 block font-semibold"
                                >
                                  {expandedPosts[postId]
                                    ? " Show less"
                                    : "... Read more"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="mb-2 sm:mb-3 md:mb-4">
                              <div
                                className={`text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 break-words whitespace-pre-wrap ${expandedPosts[postId] ? "" : "line-clamp-4"}`}
                              >
                                {postContent}
                              </div>
                              {postContent?.length > 150 && (
                                <span
                                  onClick={() => toggleReadMorePost(postId)}
                                  className="text-emerald-600 dark:text-[#00ff88] cursor-pointer text-[9px] sm:text-xs hover:underline block mt-1"
                                >
                                  {expandedPosts[postId]
                                    ? "Show less"
                                    : "... Read more"}
                                </span>
                              )}
                            </div>
                          )}

                          {Array.isArray(post.hash_tag) &&
                            post.hash_tag.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
                                {post.hash_tag.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          {isMockPost && post.media && (
                            <div className="mt-2 sm:mt-3 md:mt-4 rounded-lg sm:rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#000302] flex justify-center max-h-[200px] sm:max-h-[350px] md:max-h-[500px] relative w-full">
                              {post.mediaType === "image" ? (
                                <img
                                  src={post.media}
                                  alt="Post media"
                                  className="object-contain max-h-[200px] sm:max-h-[350px] md:max-h-[500px] w-auto"
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
                                    className="max-h-[200px] sm:max-h-[350px] md:max-h-[500px] w-full bg-slate-100 dark:bg-[#000302] cursor-pointer"
                                    loop={false}
                                    onClick={(e) =>
                                      toggleVideoPlayPause(postId, e)
                                    }
                                  />
                                  <button
                                    onClick={(e) => toggleVideoSound(postId, e)}
                                    className="absolute bottom-2 sm:bottom-3 md:bottom-4 right-2 sm:right-3 md:right-4 bg-slate-100 dark:bg-[#000302]/70 hover:bg-slate-100 dark:bg-[#000302]/90 text-slate-900 dark:text-white rounded-full p-1 sm:p-1.5 md:p-2 transition-all z-10"
                                  >
                                    <span className="material-symbols-outlined text-base sm:text-lg">
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
                            <div className="mt-2 sm:mt-3 md:mt-4 rounded-lg sm:rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#000302] flex justify-center max-h-[200px] sm:max-h-[350px] md:max-h-[500px] relative w-full">
                              {hasImage && (
                                <img
                                  src={`${API_CONFIG.BASE_URL}/${post.image}`}
                                  alt="Post media"
                                  className="object-contain max-h-[200px] sm:max-h-[350px] md:max-h-[500px] w-auto"
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
                                    className="max-h-[200px] sm:max-h-[350px] md:max-h-[500px] w-full bg-slate-100 dark:bg-[#000302]"
                                    loop={false}
                                    onClick={(e) =>
                                      toggleVideoPlayPause(postId, e)
                                    }
                                    onError={(e) => {
                                      console.error(
                                        "Video failed to load:",
                                        videoUrl,
                                      );
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
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/25 pointer-events-none">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#00ff88]/90 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.35)] animate-fadeInScale">
                                        <span className="material-symbols-outlined text-black text-2xl sm:text-3xl md:text-4xl">
                                          play_arrow
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => toggleVideoSound(postId, e)}
                                    className="absolute bottom-2 sm:bottom-3 md:bottom-4 right-2 sm:right-3 md:right-4 bg-slate-100 dark:bg-[#000302]/70 hover:bg-slate-100 dark:bg-[#000302]/90 text-slate-900 dark:text-white rounded-full p-1 sm:p-1.5 md:p-2 transition-all z-10"
                                  >
                                    <span className="material-symbols-outlined text-base sm:text-lg">
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

                        <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 pt-2 sm:pt-3 md:pt-4 border-t border-white/5 flex-wrap w-full">
                            <button
                              onClick={() => toggleLike(postId)}
                              className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${isLiked ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                            >
                              <span
                                className="material-symbols-outlined text-base sm:text-lg"
                                style={{
                                  fontVariationSettings: isLiked
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                                }}
                              >
                                favorite
                              </span>
                              <span className="text-[9px] sm:text-xs font-bold hidden sm:inline">
                                {parseInt(post.like_count || 0) > 0 ||
                                (isMockPost && isLiked)
                                  ? isMockPost
                                    ? isLiked
                                      ? 1
                                      : 0
                                    : post.like_count
                                  : "Like"}
                              </span>
                            </button>
                            <button
                              onClick={() => toggleComments(postId)}
                              className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${postComments.isOpen ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                            >
                              <span className="material-symbols-outlined text-base sm:text-lg">
                                chat_bubble
                              </span>
                              <span className="text-[9px] sm:text-xs font-bold">
                                {postComments.list.length > 0
                                  ? `(${postComments.list.length})`
                                  : post.comment_count &&
                                      !postComments.list.length
                                    ? `(${post.comment_count})`
                                    : ""}
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                handleShareClick(post.id || post.researche_id)
                              }
                              className="flex items-center gap-0.5 sm:gap-1 text-slate-500 hover:text-emerald-600 dark:text-[#00ff88] transition-colors text-xs sm:text-sm"
                            >
                              <span className="material-symbols-outlined text-base sm:text-lg">
                                share
                              </span>
                              <span className="hidden sm:inline text-xs font-bold">
                                Share
                              </span>
                            </button>
                            <button
                              onClick={() => toggleSave(postId)}
                              className={`ml-auto flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${isSaved ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                            >
                              <span
                                className="material-symbols-outlined text-base sm:text-lg"
                                style={{
                                  fontVariationSettings: isSaved
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                                }}
                              >
                                bookmark
                              </span>
                              <span className="hidden sm:inline text-xs font-bold">
                                Save
                              </span>
                            </button>
                          </div>

                          {postComments.isOpen && (
                            <div className="mt-4 sm:mt-6 sm:pl-16 space-y-4 sm:space-y-5">
                              <div className="flex gap-2 sm:gap-3 items-start">
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={newCommentText[postId] || ""}
                                    onChange={(e) =>
                                      setNewCommentText((prev) => ({
                                        ...prev,
                                        [postId]: e.target.value,
                                      }))
                                    }
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        addComment(
                                          postId,
                                          newCommentText[postId] || "",
                                        );
                                      }
                                    }}
                                    placeholder="Add a comment..."
                                    className="w-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 dark:focus:border-[#00ff88]/50 transition-colors pr-10 text-slate-800 dark:text-white placeholder:text-slate-400"
                                    style={{
                                      outline: "none",
                                      boxShadow: "none",
                                    }}
                                  />
                                  <button
                                    onClick={() =>
                                      addComment(
                                        postId,
                                        newCommentText[postId] || "",
                                      )
                                    }
                                    className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-emerald-600 dark:text-[#00ff88] hover:text-emerald-600 dark:text-[#00ff88]/80 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      send
                                    </span>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 scrollbar-hidden">
                                {postComments.list.length > 0 ? (
                                  postComments.list.map((comment) => (
                                    <div
                                      key={comment.id}
                                      className="flex gap-2 sm:gap-3 group"
                                    >
                                      <img
                                        alt={comment.author}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-white/10 object-cover shrink-0 cursor-pointer"
                                        src={comment.authorAvatar || avatar}
                                        onError={(e) => {
                                          e.target.src = avatar;
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenUserProfile(
                                            {
                                              user_id: comment.authorId,
                                              name: comment.author,
                                            },
                                            false,
                                          );
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span
                                            className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white pr-2 truncate cursor-pointer hover:text-emerald-600 dark:text-[#00ff88]"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenUserProfile(
                                                {
                                                  user_id: comment.authorId,
                                                  name: comment.author,
                                                },
                                                false,
                                              );
                                            }}
                                          >
                                            {comment.author}
                                          </span>
                                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">
                                              {formatTimeAgo(comment.timestamp)}
                                            </span>
                                            {comment.authorId === userId && (
                                              <button
                                                onClick={() =>
                                                  deleteComment(
                                                    postId,
                                                    comment.id,
                                                  )
                                                }
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
                                          className={`text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}
                                        >
                                          {comment.text}
                                        </p>
                                        {comment.text.length > 120 && (
                                          <button
                                            onClick={() =>
                                              toggleReadMore(comment.id)
                                            }
                                            className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-[#00ff88] mt-1 hover:underline"
                                          >
                                            {expandedComments[comment.id]
                                              ? "Show less"
                                              : "Read more"}
                                          </button>
                                        )}
                                        <div className="border-b border-slate-200 dark:border-white/10 mt-2 sm:mt-3"></div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 sm:py-6">
                                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest italic">
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
                  })
                ) : (
                  <div className="bg-white dark:bg-[#141414] rounded-lg sm:rounded-xl border border-gray-200 dark:border-white/5 p-6 sm:p-8 text-center w-full">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                      No posts found in the network yet.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 w-full">
            <div className="lg:sticky lg:top-24">
              <RightSection />
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showDeletePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-[#000302]/60 backdrop-blur-sm px-2 sm:px-4"
          onClick={closeDeletePopup}
        >
          <div
            className="
    bg-white dark:bg-[#1e293b]
    rounded-lg sm:rounded-2xl
    p-4 sm:p-5 md:p-6
    w-full max-w-[350px]
    border border-slate-200 dark:border-white/10
    shadow-[0_10px_40px_rgba(0,0,0,0.08)]
    dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]
    animate-fadeInScale
  "
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              {selectedPost?.isPollPost ? "Delete Poll" : "Delete Post"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-5 md:mb-6 break-words">
              {" "}
              {selectedPost?.isPollPost
                ? "Are you sure you want to delete this poll?"
                : "Are you sure you want to delete this post?"}
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={closeDeletePopup}
                className="
  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
  bg-slate-100 dark:bg-white/5
  text-slate-700 dark:text-slate-300
  hover:bg-slate-200 dark:hover:bg-white/10
  transition-colors
"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="
  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
  bg-red-500 text-white
  hover:bg-red-600
  transition-colors
"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportPopup && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-100 dark:bg-[#000302]/80 backdrop-blur-md px-4"
          onClick={closeReportPopup}
        >
          <div
            className="bg-slate-100 dark:bg-[#0d0f0e] rounded-t-[25px] sm:rounded-2xl w-full max-w-[450px] overflow-hidden animate-fadeInScale border border-[#00ff88]/20 shadow-[0_0_50px_rgba(0,255,136,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Handle Bar */}
            <div className="w-12 h-1.5 bg-[#00ff88]/20 rounded-full mx-auto mt-3 mb-2 sm:hidden"></div>

            {reportStep === 1 ? (
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88]">
                      flag
                    </span>
                    Report Content
                  </h2>
                  <button
                    onClick={closeReportPopup}
                    className="text-slate-400 hover:text-slate-900 dark:text-white"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-emerald-600 dark:text-[#00ff88] mb-2">
                    Why are you reporting this?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your report is anonymous. We use this feedback to improve
                    your network experience.
                  </p>
                </div>

                <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 scrollbar-hidden">
                  {reportReasons.map((reason, index) => (
                    <button
                      key={index}
                      onClick={() => handleReportPost(reason)}
                      disabled={isReportingLoading}
                      className="w-full flex items-center justify-between px-3 py-4 hover:bg-[#00ff88]/5 border-b border-white/5 last:border-0 group transition-all rounded-lg"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {" "}
                        {reason}
                      </span>
                      <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88]/40 group-hover:text-emerald-600 dark:text-[#00ff88] group-hover:translate-x-1 transition-all">
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>

                {isReportingLoading && (
                  <div className="absolute inset-0 bg-slate-100 dark:bg-[#000302]/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Success Screen */
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-4xl">
                    check_circle
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Feedback Received
                </h2>
                <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-[280px]">
                  Thank you for helping us keep the network safe. We'll review
                  this post shortly.
                </p>
                <button
                  onClick={closeReportPopup}
                  className="w-full py-3 bg-[#00ff88] text-[#003919] font-black rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)] uppercase tracking-widest text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showBlockPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-[#000302]/60 backdrop-blur-sm px-2 sm:px-4"
          onClick={closeBlockPopup}
        >
          <div
            className="
  bg-white dark:bg-[#1e293b]
  rounded-lg sm:rounded-2xl
  p-4 sm:p-5 md:p-6
  w-full max-w-[350px]
  border border-slate-200 dark:border-white/10
  shadow-[0_10px_40px_rgba(0,0,0,0.08)]
  dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]
  animate-fadeInScale
"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Block User
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-5 md:mb-6 break-words">
              {" "}
              Are you sure you want to block this user? You won't see their
              posts anymore.
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={closeBlockPopup}
                className="
  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
  bg-slate-100 dark:bg-white/5
  text-slate-700 dark:text-slate-300
  hover:bg-slate-200 dark:hover:bg-white/10
  transition-colors
"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="
  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
  bg-orange-500 text-white
  hover:bg-orange-600
  transition-colors
"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {isShareOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeInScale"
          style={{ zIndex: 999999 }}
          onClick={() => {
            setIsShareOpen(false);
            setSelectedUserIds([]);
            setShareSearchQuery("");
          }}
        >
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
                onClick={() => {
                  setIsShareOpen(false);
                  setSelectedUserIds([]);
                  setShareSearchQuery("");
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="p-3 bg-white dark:bg-[#13231a] border-b border-gray-100 dark:border-white/5 shrink-0">
              <div className="flex items-center bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 transition-all duration-200 focus-within:border-[#00ff88] focus-within:ring-2 focus-within:ring-[#00ff88]/20 dark:focus-within:border-[#32ff99]">
                {" "}
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
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-white dark:bg-[#13231a]">
              {[
                ...(Array.isArray(allUsers) ? allUsers : [])
                  .filter(
                    (u) =>
                      u && u.user_type !== "institute" && !u.institute_details,
                  )
                  .map((u) => ({
                    ...u,
                    displayType: "Individual",
                    finalName: u.name || u.username || "No Name",
                  })),
                ...(Array.isArray(allUsers) ? allUsers : [])
                  .filter(
                    (u) =>
                      u && (u.user_type === "institute" || u.institute_details),
                  )
                  .map((i) => ({
                    ...i,
                    displayType: "Institute",
                    finalName:
                      i.institute_details?.institute_name ||
                      i.name ||
                      "Institute",
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
                  a?.finalName
                    ?.toLowerCase()
                    .includes(shareSearchQuery.toLowerCase()),
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
                  else if (
                    account.displayType === "Group" &&
                    account.finalImage
                  )
                    finalAvatar = `${API_CONFIG.BASE_URL}/${account.finalImage}`;

                  return (
                    <div
                      key={`${account.displayType}-${uniqueId}`}
                      onClick={() =>
                        isChecked
                          ? setSelectedUserIds(
                              selectedUserIds.filter((id) => id !== uniqueId),
                            )
                          : setSelectedUserIds([...selectedUserIds, uniqueId])
                      }
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${isChecked ? "bg-emerald-500/10 border-emerald-500/30 dark:bg-[#00ff88]/10 dark:border-[#00ff88]/20" : "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-[#1e3a2c]"}`}
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
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono uppercase font-bold shrink-0 ${account.displayType === "Institute" ? "bg-blue-500/10 text-blue-500" : account.displayType === "Group" ? "bg-purple-500/10 text-purple-500" : "bg-gray-500/10 text-gray-500"}`}
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
                        className={`material-symbols-outlined text-xl ${isChecked ? "text-[#00ff88]" : "text-gray-400"}`}
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
                  <span className="block text-[9px] text-gray-400">
                    Ready to share
                  </span>
                </div>
                <button
                  onClick={() => handleSendPost(selectedSharePostId)}
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
      )}

      {/* User Profile Modal */}
      {selectedProfileUser && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-slate-100 dark:bg-[#000302]/80 backdrop-blur-sm p-2 sm:p-6 md:p-8"
          style={{ zIndex: 9999 }}
          onClick={() => setSelectedProfileUser(null)}
        >
          <div
            className="w-full max-w-5xl h-[95vh] sm:h-[85vh] bg-slate-100 dark:bg-[#0d0f0e] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.1)] border border-[#00ff88]/20 animate-fadeInScale relative"
            onClick={(e) => e.stopPropagation()}
          >
            <UserProfile
              user={selectedProfileUser}
              onClose={() => setSelectedProfileUser(null)}
              initialConnectionStatus={
                connectedUsers[selectedProfileUser?.id] ?? 3
              }
            />
          </div>
        </div>
      )}

      {/* Chat Floating Widget */}

      <div
        ref={chatWidgetRef}
        className="hidden sm:flex fixed bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 items-end gap-3 sm:gap-4 pointer-events-none"
        style={{ zIndex: 60 }}
      >
        {/* Active Chat Window */}
        {activeChatId && isChatListOpen && (
          <div className="pointer-events-auto bg-white dark:bg-[#161817] border border-[#3b4b3d]/30 rounded-lg sm:rounded-xl w-[calc(100vw-1rem)] sm:w-[280px] md:w-[320px] max-w-[350px] h-[60vh] sm:h-[400px] md:h-[450px] max-h-[500px] shadow-2xl flex flex-col overflow-hidden animate-fadeInScale absolute bottom-full right-0 sm:relative sm:bottom-auto sm:right-auto mb-2">
            {/* Header */}
            <div className="p-2.5 sm:p-3 md:p-4 border-b border-[#3b4b3d]/30 flex items-center justify-between bg-slate-50 dark:bg-[#1a1c1b] shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex items-center shrink-0 relative">
                  {activeChatData?.isGroup ? (
                    <>
                      <img
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#1a1c1b] z-10"
                        src={activeChatData.avatars[0]}
                        alt="User 1"
                      />
                      <img
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#1a1c1b] -ml-3 sm:-ml-4 z-0"
                        src={activeChatData.avatars[1]}
                        alt="User 2"
                      />
                    </>
                  ) : (
                    <img
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                      src={activeChatData?.avatars[0]}
                      alt={activeChatData?.name}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                    {activeChatData?.name}
                  </h4>

                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[7px] sm:text-[9px] text-slate-400 font-semibold capitalize tracking-wide">
                      {activeChatData?.type || "Individual"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveChatId(null)}
                className="text-slate-400 hover:text-slate-900 dark:text-white transition-colors p-0.5 shrink-0"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">
                  close
                </span>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={popupMessagesContainerRef}
              onScroll={handlePopupScroll}
              className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4 hide-scrollbar bg-slate-50 dark:bg-[#121413]"
            >
              {(chatMessages[activeChatId] || []).length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center mt-4 italic">
                  No messages yet. Say hi! 👋
                </p>
              ) : (
                (chatMessages[activeChatId] || []).map((m) =>
                  m.isMine ? (
                    <div
                      key={m.id}
                      className="ml-auto w-[85%] sm:w-[80%] flex flex-col items-end mt-4"
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono">
                          {m.created_at?.slice(11, 16)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-[#00ff85] font-bold uppercase tracking-wider">
                          You
                        </span>
                      </div>
                      <div className="bg-slate-100 dark:bg-[#0d0f0e] px-3 py-2.5 rounded-2xl rounded-tr-none text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed border border-[#00ff85]/30 text-left w-full break-words">
                        {m.file?.path &&
                          (() => {
                            const base = API_CONFIG.BASE_URL.replace(/\/$/, "");
                            const path = m.file.path.replace(/^\//, "");
                            const url = m.file.path.startsWith("http")
                              ? m.file.path
                              : `${base}/${path}`;
                            return m.file.type === "video" ? (
                              <video
                                src={url}
                                controls
                                className="max-w-full rounded-lg mb-1 bg-slate-100 dark:bg-[#000302] border border-slate-200 dark:border-white/10"
                              />
                            ) : (
                              <img
                                src={url}
                                alt="attachment"
                                className="max-w-full rounded-lg mb-1 object-cover border border-slate-200 dark:border-white/10"
                              />
                            );
                          })()}
                        {m.message &&
                          (m.message.startsWith("POST_SHARE_ID:") ? (
                            <SharedPostCard
                              postId={m.message.replace("POST_SHARE_ID:", "")}
                              onOpen={(pid) => {
                                setIsPostModalOpen(true);
                                setSelectedPostIdForPopup(pid);
                                setPopupPostData(null);
                                setLoadingPostData(true);
                                setIsExpanded(false);

                                const token =
                                  localStorage.getItem("auth_token") ||
                                  localStorage.getItem("token") ||
                                  sessionStorage.getItem("auth_token") ||
                                  localStorage.getItem("authToken") ||
                                  null;

                                fetch(
                                  `${API_CONFIG.BASE_URL}/post/get-posts-id/${pid}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                )
                                  .then((r) => r.json())
                                  .then((res) => {
                                    if (res.status) setPopupPostData(res.data);
                                    setLoadingPostData(false);
                                  })
                                  .catch(() => setLoadingPostData(false));
                              }}
                            />
                          ) : (
                            <span>{m.message}</span>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={m.id}
                      className="flex items-start gap-2 w-[90%] sm:w-[85%] mt-4"
                    >
                      <img
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 mt-1"
                        src={activeChatData?.avatars[0]}
                        alt={activeChatData?.name}
                      />
                      <div className="min-w-0 w-full">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                            {activeChatData?.name}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono shrink-0">
                            {m.created_at?.slice(11, 16)}
                          </span>
                        </div>
                        <div
                          className="bg-slate-100 dark:bg-[#1e201f] 
                         text-slate-900 dark:text-[#e2e3e0]
                          border border-slate-200 dark:border-white/5 text-xs sm:text-sm p-2.5 sm:p-3 rounded-2xl rounded-tl-none border border-white/5 relative break-words"
                        >
                          {m.file?.path &&
                            (() => {
                              const base = API_CONFIG.BASE_URL.replace(
                                /\/$/,
                                "",
                              );
                              const path = m.file.path.replace(/^\//, "");
                              const url = m.file.path.startsWith("http")
                                ? m.file.path
                                : `${base}/${path}`;
                              return m.file.type === "video" ? (
                                <video
                                  src={url}
                                  controls
                                  className="max-w-full rounded-lg mb-1 bg-slate-100 dark:bg-[#000302] border border-slate-200 dark:border-white/10"
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt="attachment"
                                  className="max-w-full rounded-lg mb-1 object-cover border border-slate-200 dark:border-white/10"
                                />
                              );
                            })()}
                          {m.message &&
                            (m.message.startsWith("POST_SHARE_ID:") ? (
                              <SharedPostCard
                                postId={m.message.replace("POST_SHARE_ID:", "")}
                                onOpen={(pid) => {
                                  setIsPostModalOpen(true);
                                  setSelectedPostIdForPopup(pid);
                                  setPopupPostData(null);
                                  setLoadingPostData(true);
                                  setIsExpanded(false);

                                  const token =
                                    localStorage.getItem("auth_token") ||
                                    localStorage.getItem("token") ||
                                    sessionStorage.getItem("auth_token") ||
                                    localStorage.getItem("authToken") ||
                                    null;

                                  fetch(
                                    `${API_CONFIG.BASE_URL}/post/get-posts-id/${pid}`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  )
                                    .then((r) => r.json())
                                    .then((res) => {
                                      if (res.status)
                                        setPopupPostData(res.data);
                                      setLoadingPostData(false);
                                    })
                                    .catch(() => setLoadingPostData(false));
                                }}
                              />
                            ) : (
                              <span>{m.message}</span>
                            ))}
                        </div>
                      </div>
                    </div>
                  ),
                )
              )}
              <div ref={popupMessagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-1.5 sm:p-2 md:p-3 bg-slate-50 dark:bg-[#121413] shrink-0">
              <div className="relative flex items-center gap-1 sm:gap-2">
                <div className="flex-1 flex items-center bg-slate-100 dark:bg-[#0d0f0e]  border border-[#3b4b3d]/50 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 focus-within:border-[#00ff85]/50 transition-colors min-w-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleChatSend();
                    }}
                    placeholder="Type message..."
                    className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-0 placeholder:text-[#3b4b3d]"
                  />
                </div>
                <button
                  onClick={handleChatSend}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#00ff85] text-[#003919] shrink-0 hover:brightness-110 transition-all"
                >
                  <span
                    className="material-symbols-outlined text-sm sm:text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    send
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat List & Toggle Button */}
        <div className="pointer-events-auto flex flex-col items-end gap-2 relative">
          {/* Chat List Popup */}
          {isChatListOpen && (
            <div className="bg-white dark:bg-[#161817] border border-[#3b4b3d]/30 rounded-lg sm:rounded-xl w-[calc(100vw-1rem)] sm:w-[280px] md:w-[300px] max-w-[350px] shadow-2xl overflow-hidden animate-fadeInScale mb-2 absolute bottom-full right-0 sm:relative sm:bottom-auto sm:right-auto">
              <div className="p-2.5 sm:p-3 md:p-4 border-b border-[#3b4b3d]/30 bg-slate-50 dark:bg-[#1a1c1b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#fce4d6] flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-[#cf9c7b] text-xs">
                      phone_iphone
                    </span>
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#00ff88] rounded-full border border-[#161817]"></div>
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                    Messages
                  </h3>
                </div>
                <button
                  onClick={() => setIsChatListOpen(false)}
                  className="text-slate-400 hover:text-slate-900 dark:text-white transition-colors p-0.5"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">
                    keyboard_arrow_down
                  </span>
                </button>
              </div>
              <div className="p-1.5 space-y-0.5 max-h-[50vh] sm:max-h-[350px] overflow-y-auto hide-scrollbar">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    // ✅ SAHI — ye karo
                    // Chat list item click handler mein
                    onClick={() => {
                      if (isInstituteApprovalPending) {
                        openApprovalModal();
                        return;
                      }
                      setActiveChatId(chat.id);
                      setIsChatListOpen(true);

                      // ✅ Yeh add karo
                      const seen = JSON.parse(
                        localStorage.getItem("recentlySeenChats") || "{}",
                      );
                      seen[String(chat.id)] = Date.now();
                      localStorage.setItem(
                        "recentlySeenChats",
                        JSON.stringify(seen),
                      );
                    }}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg cursor-pointer transition-colors gap-2 ${activeChatId === chat.id ? "bg-slate-50 dark:bg-[#1e201f] border-l-2 border-[#00ff85]" : "hover:bg-slate-100 dark:hover:bg-[#2a2d2b] dark:bg-[#1e201f]"}`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <div className="relative flex items-center shrink-0">
                        {chat.isGroup ? (
                          <>
                            <img
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#1a1c1b] z-10"
                              src={chat.avatars[0]}
                              alt="User 1"
                            />
                            <img
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#1a1c1b] -ml-3 z-0"
                              src={chat.avatars[1]}
                              alt="User 2"
                            />
                          </>
                        ) : (
                          <img
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                            src={chat.avatars[0]}
                            alt={chat.name}
                          />
                        )}
                      </div>
                      <div className="min-w-0 pr-1.5">
                        <h5 className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[100px] flex items-center gap-1">
                          <span className="truncate">{chat.name}</span>
                          {chat.isYou && (
                            <span className="shrink-0 text-[7px] font-mono px-1 py-0.5 rounded-full bg-[#00ff88]/10 text-emerald-600 dark:text-[#00ff88] border border-[#00ff88]/30">
                              You
                            </span>
                          )}
                        </h5>
                        <p className="text-slate-400 text-[9px] sm:text-xs truncate max-w-[90px] sm:max-w-[100px]">
                          {chat.lastMsg}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-slate-500 text-[8px] sm:text-[9px]">
                        {chat.time}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-[#00ff88] text-black text-[7px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none px-0.5">
                          {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* <div className="p-1.5 sm:p-2 md:p-3 border-t border-[#3b4b3d]/30 bg-slate-50 dark:bg-[#1a1c1b]">
                <button className="w-full bg-[#00ff88]/10 text-emerald-600 dark:text-[#00ff88] font-bold text-[9px] sm:text-xs py-1.5 sm:py-2 rounded-lg hover:bg-[#00ff88]/20 transition-colors uppercase tracking-wider">
                  View All Messages
                </button>
              </div> */}
            </div>
          )}

          {/* Minimized Toggle Button */}
          {!isChatListOpen && (
            <div
              className="bg-white dark:bg-[#161817] border border-[#3b4b3d]/30 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between cursor-pointer w-[calc(100vw-1rem)] max-w-[280px] sm:max-w-[300px] shadow-lg hover:bg-slate-100 dark:hover:bg-[#2a2d2b] dark:bg-[#1e201f] transition-all gap-2"
              // ✅ SAHI — ye karo
              onClick={() => {
                if (isInstituteApprovalPending) {
                  openApprovalModal();
                  return;
                }
                // ← yeh add karo
                setIsChatListOpen(true);
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fce4d6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#cf9c7b] text-xs sm:text-sm">
                      phone_iphone
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#00ff88] rounded-full border border-[#161817]"></div>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Messages
                </span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-lg shrink-0">
                expand_less
              </span>
            </div>
          )}
        </div>
      </div>

      {showApprovalModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setShowApprovalModal(false)}
        >
          <div
            className="
        bg-white text-slate-800
        dark:bg-[#0d1f16] dark:text-white
        border border-slate-200
        dark:border-[#00ff88]/20
        rounded-2xl p-6 sm:p-8 w-full max-w-[420px] shadow-2xl text-center
      "
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="
          w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5
          bg-yellow-100 border border-yellow-300
          dark:bg-yellow-500/10 dark:border-yellow-500/30
        "
            >
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-3xl">
                hourglass_top
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Approval Pending
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-2">
              Your institute account is currently under review by our admin
              team.
            </p>

            <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed mb-5">
              Once approved, you'll be able to{" "}
              <span className="text-slate-900 dark:text-white font-medium">
                create posts
              </span>
              ,{" "}
              <span className="text-slate-900 dark:text-white font-medium">
                upload research
              </span>
              , and{" "}
              <span className="text-slate-900 dark:text-white font-medium">
                chat
              </span>{" "}
              with other users.
            </p>

            <div
              className="
          rounded-xl px-4 py-3 mb-6 flex items-center justify-center gap-2
          bg-yellow-50 border border-yellow-200
          dark:bg-yellow-500/10 dark:border-yellow-500/20
        "
            >
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">
                schedule
              </span>

              <span className="text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider">
                Status: Awaiting Admin Approval
              </span>
            </div>

            <button
              onClick={() => setShowApprovalModal(false)}
              className="
          w-full py-3 rounded-xl font-bold text-sm transition-all
          bg-slate-100 text-slate-800 border border-slate-300
          hover:bg-slate-200
          dark:bg-[#1a2f22] dark:border-[#00ff88]/20 dark:text-[#00ff88]
          dark:hover:bg-[#00ff88]/10
        "
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {isPostModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          {/* Width badhakar max-w-2xl kar di hai aur light/dark mode dono ke liye colors set hain */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-left transition-colors duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-2 text-[#00ff85]">
                <span className="material-symbols-outlined text-lg">
                  description
                </span>
                <h3 className="font-bold text-sm tracking-wide uppercase text-gray-900 dark:text-white">
                  Shared Post Details
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPostModalOpen(false);
                  setSelectedPostIdForPopup(null);
                  setPopupPostData(null);
                  setIsExpanded(false); // Reset expand state on close
                }}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {loadingPostData ? (
                /* API loading State */
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#00ff85]"></div>
                  <span className="text-xs text-gray-500 dark:text-slate-500 font-mono">
                    FETCHING POST DATA...
                  </span>
                </div>
              ) : popupPostData ? (
                /* Actual Data Loaded State */
                <div className="flex flex-col gap-4">
                  {/* 1. AUTHOR NAME / TITLE (Pele Name Aaye) */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block mb-0.5">
                      Posted By
                    </span>
                    <h4 className="text-gray-900 dark:text-white font-extrabold text-lg tracking-tight">
                      {popupPostData.institute_name ||
                        popupPostData.name ||
                        "No Name Available"}
                    </h4>
                  </div>

                  {/* 2. POST TEXT / CONTENT WITH DYNAMIC INLINE LINE CLAMP */}
                  <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                    <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block mb-1.5">
                      Description
                    </span>

                    {popupPostData.post_text ? (
                      <div>
                        {/* 💡 FIX: Yahan humne Tailwind class ki jagah inline style (-webkit-line-clamp) use kiya hai, 
                jo image hone par 3 lines aur image na hone par direct 10 lines strict apply karega */}
                        <p
                          className="text-gray-800 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words"
                          style={
                            !isExpanded
                              ? {
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp:
                                    popupPostData.image &&
                                    popupPostData.image.trim() !== ""
                                      ? 3
                                      : 11,
                                  overflow: "hidden",
                                }
                              : {}
                          }
                        >
                          {popupPostData.post_text}
                        </p>

                        {/* Dynamic Read More / Show Less Button logic */}
                        {((popupPostData.image &&
                          popupPostData.image.trim() !== "" &&
                          popupPostData.post_text.length > 150) ||
                          ((!popupPostData.image ||
                            popupPostData.image.trim() === "") &&
                            popupPostData.post_text.length > 400)) && (
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-xs font-bold text-[#00ff85] hover:underline flex items-center gap-0.5"
                          >
                            {isExpanded ? (
                              <>
                                Show Less{" "}
                                <span className="material-symbols-outlined text-xs">
                                  expand_less
                                </span>
                              </>
                            ) : (
                              <>
                                Read More{" "}
                                <span className="material-symbols-outlined text-xs">
                                  expand_more
                                </span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-slate-500 text-xs italic">
                        No text description provided for this post.
                      </p>
                    )}
                  </div>

                  {/* 3. POST IMAGE CONTAINER (Fir Image Aaye) */}
                  {popupPostData.image && (
                    <div className="w-full border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/40">
                      <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block p-3 pb-0">
                        Attached Media
                      </span>
                      <div className="p-3">
                        <img
                          src={`${API_CONFIG.BASE_URL}/${popupPostData.image.replace(/^\//, "")}`}
                          alt="Shared Content"
                          className="w-full max-h-80 object-contain rounded-lg bg-gray-50 dark:bg-[#1a1a1a]"
                          onError={(e) => {
                            e.target.parentNode.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Error or Empty State */
                <div className="text-center py-6 text-xs text-gray-500 dark:text-slate-500 font-mono">
                  FAILED TO LOAD POST CONTENT.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex justify-end">
              <button
                onClick={() => {
                  setIsPostModalOpen(false);
                  setSelectedPostIdForPopup(null);
                  setPopupPostData(null);
                  setIsExpanded(false);
                }}
                className="px-6 py-2 bg-[#00ff85] text-[#003919] font-bold text-xs rounded-lg hover:bg-[#00e676] hover:scale-[1.03] transition-all duration-200 shadow-md hover:shadow-[0_0_15px_rgba(0,255,133,0.45)] active:scale-95"
              >
                Close Preview
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .line-clamp-10 {
          display: -webkit-box;
          -webkit-line-clamp: 10;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        ::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        * {
          scrollbar-width: none;
        }
        * {
          -ms-overflow-style: none;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default MainContent;
