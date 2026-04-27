import React, { useState, useEffect, useRef, useCallback } from "react";
import RightSection from "./RightSection";
import avatar from "../assets/images/avatar.jpg";
import UserProfile from "./UserProfile";
import DashboardLayout from "./DashboardLayout";
import API_CONFIG from "../config/api.config";
import { toast } from "react-toastify";

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
const reportReasons = [
  "I just don't like it",
  "Bullying or unwanted contact",
  "Suicide, self-injury or eating disorders",
  "Violence, hate or exploitation",
  "Selling or promoting restricted items",
  "Nudity or sexual activity",
  "Scam, fraud or spam",
  "False information",
  "Intellectual property"
];
  // States for Chat Widget
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const pollingRef = useRef(null);
  const feedDataRef = useRef([]);

  const currentPlayingVideo = useRef(null);
  const videoRefs = useRef({});
  const observerRef = useRef(null);

  const [chats, setChats] = useState([]);

  const getAuthToken = () => {
    return (
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("authToken") ||
      null
    );
  };

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
      console.error("Error getting user ID:", e);
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
      console.error("Error getting user avatar:", e);
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
      console.error("Error getting user name:", e);
      return "User";
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
    console.log("Opening Profile for Data: ", postData);

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

    const currentStatus = connectedUsers[postUserId];
    if (currentStatus === 1) return;

    const token = getAuthToken();

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
            body: JSON.stringify({ connected_user_id: String(postUserId) }),
          },
        );
        const result = await response.json();
        if (result.status) {
          setConnectedUsers((prev) => ({ ...prev, [postUserId]: 3 }));
          window.dispatchEvent(
            new CustomEvent("connectionStatusUpdated", {
              detail: { userId: String(postUserId), status: 3 },
            }),
          );
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
            body: JSON.stringify({ connected_user_id: String(postUserId) }),
          },
        );
        const result = await response.json();
        if (result.status) {
          setConnectedUsers((prev) => ({ ...prev, [postUserId]: 1 }));
          window.dispatchEvent(
            new CustomEvent("connectionStatusUpdated", {
              detail: { userId: String(postUserId), status: 1 },
            }),
          );
        }
      }
    } catch (err) {
      console.error("Connection toggle error:", err);
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
        setConnectedUsers(statusMap);
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
          merged[uid] = statusMap[uid];
        });
        return merged;
      });
    } catch (err) {
      console.error("Error fetching pending statuses:", err);
    }
  };

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
      console.error("Profile image upload error:", err);
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

      const savedTimestamps = JSON.parse(
        localStorage.getItem("floatingChatTimestamps") || "{}",
      );
      const currentUserId = getCurrentUserId();

      const formattedUsers = userList.map((user) => {
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
          type: user.user_type === "institute" ? "Institute" : "Individual",
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
                research.published_at ||
                research.created_at ||
                research.updated_at ||
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
    fetchChatUsers();
    fetchConnectedUsersList();
  }, []);
  
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
              return [...updated].sort((a, b) => {
                if (a.id === activeChatId) return -1;
                if (b.id === activeChatId) return 1;
                return (b.timestamp || 0) - (a.timestamp || 0);
              });
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
  }, [activeChatId]);

  const bgPollingRef = useRef(null);

  useEffect(() => {
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

        if (
          chat.unreadCount !== unreadCount ||
          chat.lastMsg !== newLastMsg ||
          chat.time !== newTime
        ) {
          hasUpdates = true;
          updates[chat.id] = {
            lastMsg: newLastMsg,
            time: newTime,
            unreadCount,
            timestamp: newTimestamp,
          };
        }
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
  }, [chats.length]);

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
        [postId]: {
          ...prev[postId],
          isOpen: false,
        },
      }));
      return;
    }

    if (isMockPost) {
      setCommentsState((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isOpen: true,
          list: prev[postId]?.list || [],
        },
      }));
      return;
    }

    await fetchComments(postId, post);
  };

  const addComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    const post = feedData.find(
      (p) => p.id === postId || p.researche_id === postId,
    );

    const isMockPost = post?.author !== undefined;
    const isResearchPost = post?.isResearchPost === true;

    const cleanComment = commentText.trim();

    if (isMockPost) {
      const fallbackAvatar =
        userAvatar ||
        getCurrentUserAvatar() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          userName || "User",
        )}&background=random&color=fff`;

      const newLocalComment = {
        id: `temp_${Date.now()}`,
        text: cleanComment,
        author: userName,
        authorId: userId,
        authorAvatar: fallbackAvatar,
        timestamp: new Date().toISOString(),
      };

      setCommentsState((prev) => {
        const newState = {
          ...prev,
          [postId]: {
            ...prev[postId],
            isOpen: true,
            list: [newLocalComment, ...(prev[postId]?.list || [])],
          },
        };

        localStorage.setItem("postComments", JSON.stringify(newState));
        return newState;
      });

      setNewCommentText((prev) => ({ ...prev, [postId]: "" }));
      return;
    }

    const _newLocalComment = {
      id: `temp_${Date.now()}`,
      text: cleanComment,
      author: userName,
      authorId: userId,
      authorAvatar: userAvatar || getCurrentUserAvatar() || null,
      timestamp: new Date().toISOString(),
    };
    setNewCommentText((prev) => ({ ...prev, [postId]: "" }));

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
        toast.error(result.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("Add comment error:", err);
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
      console.error("Error deleting post:", error);
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
      `${API_CONFIG.BASE_URL}/post/report-post`,  // ✅ base url + no ID in path
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: selectedPost.postId,  // ✅ post_id (snake_case)
          reason: reason,
        }),
      }
    );

    const result = await response.json();

    if (result.status) {
      setFeedData((prev) =>
        prev.filter((p) => (p.id || p.researche_id) !== selectedPost.postId)
      );
      setReportStep(2);
    } else {
      toast.error(result.message || "Failed to report post");
    }
  } catch (error) {
    console.error("Error reporting post:", error);
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
        }
      );

      const result = await response.json();

      if (result.status) {
        toast.success(result.message || "User blocked successfully.");
        setFeedData((prev) =>
          prev.filter(
            (p) =>
              String(p.user_id ?? p.poll?.user_id ?? "") !==
              String(selectedPost?.postUserId)
          )
        );
      } else {
        toast.error(result.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
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

  const getPostProfileSrc = (post) => {
    if (post.profile_image) {
      return `${API_CONFIG.BASE_URL}/${post.profile_image}`;
    }
    return avatar;
  };

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto w-full relative">
        <div className="mb-4 sm:mb-6 lg:mb-8 flex justify-center">
          <div className="relative w-full max-w-5xl rounded-2xl border border-[#1f2a25] bg-gradient-to-r from-[#020b08] via-[#03130e] to-[#020b08] px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8 lg:px-10 lg:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between overflow-hidden gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6 z-10 w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.15)] shrink-0">
                <span className="material-symbols-outlined text-[#00ff88] text-3xl sm:text-4xl">
                  verified_user
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white tracking-tight">
                  Welcome back, <br className="sm:hidden" />
                  {userName}!
                </h1>
                <p className="text-slate-400 mt-2 sm:mt-3 text-sm sm:text-base max-w-2xl leading-relaxed">
                  <span className="block">
                    Your research network is active. Reviewing today's
                  </span>
                  <span>
                    {" "}
                    network data throughput and peer-reviewed updates.
                  </span>
                </p>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-[#00ff88]/10 blur-[100px] sm:blur-[140px]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-10">
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00ff88]">
                    rss_feed
                  </span>
                  Network Feed
                </h3>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {loadingFeed ? (
                  <div className="bg-[2 15 10] rounded-xl border border-white/5 p-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
                    <span className="ml-3 text-slate-400">
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
                      const pollTime = formatDate(poll.created_at);
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
                          className="bg-[#020f0a] rounded-2xl border border-white/5 shadow-sm overflow-hidden relative"
                        >
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  type="button"
                                  className="w-11 h-11 rounded-2xl bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.12)] shrink-0 hover:opacity-90 transition-opacity"
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
                                      className="w-full h-full rounded-2xl object-cover"
                                      onError={(e) => {
                                        e.target.src = avatar;
                                      }}
                                    />
                                  ) : (
                                    <img
                                      alt={pollName}
                                      src={avatar}
                                      className="w-full h-full rounded-2xl object-cover"
                                    />
                                  )}
                                </button>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <h4 className="text-white font-bold truncate">
                                      {pollName}
                                    </h4>
                                    <span className="text-slate-500 text-xs shrink-0">
                                      • {pollTime}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.18em] truncate mt-0.5">
                                    {(poll.user_type || "user").toUpperCase()}
                                    {poll.registration_id
                                      ? ` • ${poll.registration_id}`
                                      : ""}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {!isCurrentUserPoll && (
                                  <button
                                    onClick={(e) =>
                                      toggleConnect(pollUserId, e)
                                    }
                                    className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all tracking-wider ${
                                      connectedUsers[pollUserId]
                                        ? "bg-transparent text-slate-400 border border-slate-600 hover:bg-white/10 hover:text-white"
                                        : "bg-transparent text-[#00ff88] hover:bg-[#00ff88] hover:text-black border border-transparent"
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
                                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
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
                                    className="text-lg sm:text-xl"
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
                                    <div className="absolute right-4 top-[68px] w-40 sm:w-48 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 overflow-hidden z-20 animate-fadeInScale">
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
                                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-white/10"
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

                            <h3 className="mt-5 text-[18px] sm:text-[22px] md:text-2xl font-extrabold text-white leading-snug">
                              {poll.question}
                            </h3>

                            <div className="mt-5 space-y-3">
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
                                    className={`relative w-full rounded-xl border bg-[#000302] overflow-hidden transition-all text-left ${
                                      isSelected
                                        ? "border-[#00ff88]/35"
                                        : "border-white/10 hover:border-white/15 hover:bg-white/5"
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
                                    <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
                                      <span
                                        className={`text-sm sm:text-[15px] font-bold pr-2 ${
                                          isSelected
                                            ? "text-white"
                                            : "text-slate-200"
                                        }`}
                                      >
                                        {opt.option_text}
                                      </span>
                                      <span className="flex items-center gap-2 shrink-0">
                                        {isSelected && (
                                          <MaterialIcon
                                            name="check_circle"
                                            className="text-[#00ff88] text-[18px]"
                                          />
                                        )}
                                        <span
                                          className={`text-sm font-black tabular-nums ${
                                            isSelected
                                              ? "text-[#00ff88]"
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

                            <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
                              <span>{totalVotes.toLocaleString()} votes</span>
                              {myVote ? (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={(e) => handlePollUndo(e, poll)}
                                  className="text-[#00ff88] hover:text-[#00ff88]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  Undo vote
                                </button>
                              ) : (
                                <span className="text-slate-600">
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
                          className="bg-[#020f0a] rounded-2xl border border-white/5 shadow-sm overflow-visible relative mb-6 sm:mb-8"
                        >
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start gap-3 sm:gap-5 mt-2 sm:mt-4 mb-4 sm:mb-6">
                              <img
                                alt={postName}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
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
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4
                                      className="font-bold text-white hover:text-[#00ff88] cursor-pointer transition-colors capitalize truncate text-sm sm:text-base"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenUserProfile(post, isMockPost);
                                      }}
                                    >
                                      {postName}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1">
                                      {postType}{" "}
                                      <span className="w-1 h-1 rounded-full bg-slate-500 inline-block"></span>{" "}
                                      {postTime}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    {!isCurrentUserPost && (
                                      <button
                                        onClick={(e) =>
                                          toggleConnect(postUserId, e)
                                        }
                                        className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all tracking-wider ${
                                          connectedUsers[postUserId]
                                            ? "bg-transparent text-slate-400 border border-slate-600 hover:bg-white/10 hover:text-white"
                                            : "bg-transparent text-[#00ff88] hover:bg-[#00ff88] hover:text-black border border-transparent"
                                        }`}
                                      >
                                        {connectedUsers[postUserId] === 2
                                          ? "✓ CONNECTED"
                                          : connectedUsers[postUserId] === 1
                                            ? "⏳ PENDING"
                                            : "+ CONNECT"}{" "}
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
                                        className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
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
                                          <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 overflow-hidden z-20 animate-fadeInScale">
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
                                                  className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-white/10"
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

                            <div className="sm:ml-16 mb-3 sm:mb-4">
                              <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight">
                                {post.research_title || "Published Research"}
                              </h3>
                            </div>

                            <div className="sm:ml-16 mb-4 sm:mb-6">
                              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                                {postContent}
                              </p>
                            </div>

                            {post.research_file && (
                              <div className="sm:ml-16 mb-4 sm:mb-6">
                                <div className="bg-[#0e0f10] border border-white/10 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-white/20 transition-all gap-3 sm:gap-0">
                                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-[#0f172a] border border-[#00ff88]/20 flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-[#00ff88] text-xl sm:text-2xl">
                                        description
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                                        {fileInfo.name}
                                      </p>
                                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
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
                                    View on Library
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                            <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-white/5 sm:pl-16 flex-wrap">
                              <button
                                onClick={() => toggleLike(postId)}
                                className={`flex items-center gap-1 sm:gap-2 transition-colors ${isLiked ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                              >
                                <span
                                  className="material-symbols-outlined text-lg sm:text-xl"
                                  style={{
                                    fontVariationSettings: isLiked
                                      ? "'FILL' 1"
                                      : "'FILL' 0",
                                  }}
                                >
                                  favorite
                                </span>
                                <span className="text-[10px] sm:text-xs font-bold">
                                  {parseInt(post.like_count || 0) > 0 ||
                                  (isMockPost && isLiked) ? (
                                    isMockPost ? (
                                      isLiked ? (
                                        1
                                      ) : (
                                        0
                                      )
                                    ) : (
                                      post.like_count
                                    )
                                  ) : (
                                    <span className="hidden sm:inline">
                                      Like
                                    </span>
                                  )}
                                </span>
                              </button>
                              <button
                                onClick={() => toggleComments(postId)}
                                className={`flex items-center gap-1 sm:gap-2 transition-colors ${postComments.isOpen ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                              >
                                <span className="material-symbols-outlined text-lg sm:text-xl">
                                  chat_bubble
                                </span>
                                <span className="text-[10px] sm:text-xs font-bold">
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
                                onClick={() =>
                                  handleShare(post.research_title, postContent)
                                }
                                className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-[#00ff88] transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg sm:text-xl">
                                  share
                                </span>
                                <span className="hidden sm:inline text-xs font-bold">
                                  Share
                                </span>
                              </button>
                              <button
                                onClick={() => toggleSave(postId)}
                                className={`ml-auto flex items-center gap-1 sm:gap-2 transition-colors ${isSaved ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                              >
                                <span
                                  className="material-symbols-outlined text-lg sm:text-xl"
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
                                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors pr-10 text-white"
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
                                      className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-[#00ff88] hover:text-[#00ff88]/80 transition-colors"
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
                                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 object-cover shrink-0 cursor-pointer"
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
                                              className="text-[10px] sm:text-xs font-bold text-white truncate pr-2 cursor-pointer hover:text-[#00ff88]"
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
                                            className={`text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}
                                          >
                                            {comment.text}
                                          </p>
                                          {comment.text.length > 120 && (
                                            <button
                                              onClick={() =>
                                                toggleReadMore(comment.id)
                                              }
                                              className="text-[9px] sm:text-[10px] text-[#00ff88] mt-1 hover:underline"
                                            >
                                              {expandedComments[comment.id]
                                                ? "Show less"
                                                : "Read more"}
                                            </button>
                                          )}
                                          <div className="border-b border-white/10 mt-2 sm:mt-3"></div>
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
                        className="bg-[#020f0a] rounded-2xl border border-white/5 shadow-sm overflow-visible relative mb-6 sm:mb-8"
                      >
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start gap-3 sm:gap-5 mt-2 sm:mt-4 mb-3 sm:mb-4">
                            <img
                              alt={postName}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
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
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4
                                    className="font-bold text-white hover:text-[#00ff88] cursor-pointer transition-colors capitalize truncate text-sm sm:text-base"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenUserProfile(post, isMockPost);
                                    }}
                                  >
                                    {postName}
                                  </h4>
                                  <p className="text-[10px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-1">
                                    {postType}{" "}
                                    <span className="w-1 h-1 rounded-full bg-slate-500 inline-block"></span>{" "}
                                    {postTime}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  {!isCurrentUserPost && (
                                    <button
                                      onClick={(e) =>
                                        toggleConnect(postUserId, e)
                                      }
                                      className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all tracking-wider ${
                                        connectedUsers[postUserId] === 2
                                          ? "bg-transparent text-slate-400 border border-slate-600 hover:bg-white/10 hover:text-white"
                                          : connectedUsers[postUserId] === 1
                                            ? "bg-transparent text-yellow-400 border border-yellow-600 cursor-not-allowed"
                                            : "bg-transparent text-[#00ff88] hover:bg-[#00ff88] hover:text-black border border-transparent"
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
                                      className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
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
                                        <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 overflow-hidden z-20 animate-fadeInScale">
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
                                                className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-white/10"
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
                            <div className="sm:ml-16 mt-2 mb-3 sm:mb-4 max-w-full sm:max-w-[600px]">
                              <div
                                className={`bg-[#000302] border border-white/10 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-sm`}
                              >
                                <span
                                  className={`${expandedPosts[postId] ? "" : "line-clamp-10"}`}
                                >
                                  {postContent}
                                </span>
                                {postContent?.length > 300 && (
                                  <span
                                    onClick={() => toggleReadMorePost(postId)}
                                    className="text-[#00ff88] cursor-pointer ml-1 text-[10px] sm:text-xs hover:underline"
                                  >
                                    {expandedPosts[postId]
                                      ? "Show less"
                                      : "... Read more"}
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
                                    onClick={(e) => toggleVideoSound(postId, e)}
                                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 sm:p-2 transition-all z-10"
                                  >
                                    <span className="material-symbols-outlined text-lg sm:text-xl">
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
                            <div className="mt-3 sm:mt-4 rounded-xl overflow-hidden border border-white/10 bg-black flex justify-center max-h-[300px] sm:max-h-[500px] sm:ml-16 relative">
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
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#00ff88]/80 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)] animate-fadeInScale">
                                        <span className="material-symbols-outlined text-black text-3xl sm:text-4xl fill-current">
                                          play_arrow
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => toggleVideoSound(postId, e)}
                                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 sm:p-2 transition-all z-10"
                                  >
                                    <span className="material-symbols-outlined text-lg sm:text-xl">
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

                        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                          <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-white/5 sm:pl-16 flex-wrap">
                            <button
                              onClick={() => toggleLike(postId)}
                              className={`flex items-center gap-1 sm:gap-2 transition-colors ${isLiked ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                            >
                              <span
                                className="material-symbols-outlined text-lg sm:text-xl"
                                style={{
                                  fontVariationSettings: isLiked
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                                }}
                              >
                                favorite
                              </span>
                              <span className="text-[10px] sm:text-xs font-bold">
                                {parseInt(post.like_count || 0) > 0 ||
                                (isMockPost && isLiked) ? (
                                  isMockPost ? (
                                    isLiked ? (
                                      1
                                    ) : (
                                      0
                                    )
                                  ) : (
                                    post.like_count
                                  )
                                ) : (
                                  <span className="hidden sm:inline">Like</span>
                                )}
                              </span>
                            </button>
                            <button
                              onClick={() => toggleComments(postId)}
                              className={`flex items-center gap-1 sm:gap-2 transition-colors ${postComments.isOpen ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                            >
                              <span className="material-symbols-outlined text-lg sm:text-xl">
                                chat_bubble
                              </span>
                              <span className="text-[10px] sm:text-xs font-bold">
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
                              onClick={() => handleShare(postName, postContent)}
                              className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-[#00ff88] transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg sm:text-xl">
                                share
                              </span>
                              <span className="hidden sm:inline text-xs font-bold">
                                Share
                              </span>
                            </button>
                            <button
                              onClick={() => toggleSave(postId)}
                              className={`ml-auto flex items-center gap-1 sm:gap-2 transition-colors ${isSaved ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}
                            >
                              <span
                                className="material-symbols-outlined text-lg sm:text-xl"
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
                                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors pr-10 text-white"
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
                                    className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-[#00ff88] hover:text-[#00ff88]/80 transition-colors"
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
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 object-cover shrink-0 cursor-pointer"
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
                                            className="text-[10px] sm:text-xs font-bold text-white pr-2 truncate cursor-pointer hover:text-[#00ff88]"
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
                                          className={`text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}
                                        >
                                          {comment.text}
                                        </p>
                                        {comment.text.length > 120 && (
                                          <button
                                            onClick={() =>
                                              toggleReadMore(comment.id)
                                            }
                                            className="text-[9px] sm:text-[10px] text-[#00ff88] mt-1 hover:underline"
                                          >
                                            {expandedComments[comment.id]
                                              ? "Show less"
                                              : "Read more"}
                                          </button>
                                        )}
                                        <div className="border-b border-white/10 mt-2 sm:mt-3"></div>
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
                  <div className="bg-[#141414] rounded-2xl border border-white/5 p-8 text-center">
                    <p className="text-slate-400">
                      No posts found in the network yet.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <RightSection />
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showDeletePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeDeletePopup}
        >
          <div
            className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 w-full max-w-[350px] border border-white/10 shadow-xl animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base sm:text-lg font-bold text-white mb-3">
              {selectedPost?.isPollPost ? "Delete Poll" : "Delete Post"}
            </h2>
            <p className="text-sm text-slate-400 mb-5 sm:mb-6">
              {selectedPost?.isPollPost
                ? "Are you sure you want to delete this poll?"
                : "Are you sure you want to delete this post?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeletePopup}
                className="px-4 py-2 rounded-lg text-sm bg-white/5 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

{showReportPopup && (
  <div
    className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md px-4"
    onClick={closeReportPopup}
  >
    <div
      className="bg-[#0d0f0e] rounded-t-[25px] sm:rounded-2xl w-full max-w-[450px] overflow-hidden animate-fadeInScale border border-[#00ff88]/20 shadow-[0_0_50px_rgba(0,255,136,0.1)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mobile Handle Bar */}
      <div className="w-12 h-1.5 bg-[#00ff88]/20 rounded-full mx-auto mt-3 mb-2 sm:hidden"></div>

      {reportStep === 1 ? (
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00ff88]">flag</span>
                Report Content
             </h2>
             <button onClick={closeReportPopup} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#00ff88] mb-2">Why are you reporting this?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your report is anonymous. We use this feedback to improve your network experience.
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
                <span className="text-sm text-slate-300 group-hover:text-white">{reason}</span>
                <span className="material-symbols-outlined text-[#00ff88]/40 group-hover:text-[#00ff88] group-hover:translate-x-1 transition-all">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
          
          {isReportingLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
            </div>
          )}
        </div>
      ) : (
        /* Step 2: Success Screen */
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,136,0.2)]">
            <span className="material-symbols-outlined text-[#00ff88] text-4xl">check_circle</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Feedback Received</h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-[280px]">
            Thank you for helping us keep the network safe. We'll review this post shortly.
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeBlockPopup}
        >
          <div
            className="bg-[#1e293b] rounded-2xl p-5 sm:p-6 w-full max-w-[350px] border border-white/10 shadow-xl animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base sm:text-lg font-bold text-white mb-3">
              Block User
            </h2>
            <p className="text-sm text-slate-400 mb-5 sm:mb-6">
              Are you sure you want to block this user? You won't see their
              posts anymore.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeBlockPopup}
                className="px-4 py-2 rounded-lg text-sm bg-white/5 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="px-4 py-2 rounded-lg text-sm bg-orange-500 text-white hover:bg-orange-600"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedProfileUser && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-6 md:p-8"
          style={{ zIndex: 9999 }}
          onClick={() => setSelectedProfileUser(null)}
        >
          <div
            className="w-full max-w-5xl h-[95vh] sm:h-[85vh] bg-[#0d0f0e] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.1)] border border-[#00ff88]/20 animate-fadeInScale relative"
            onClick={(e) => e.stopPropagation()}
          >
            <UserProfile
              user={selectedProfileUser}
              onClose={() => setSelectedProfileUser(null)}
              initialConnectionStatus={connectedUsers[selectedProfileUser?.id] ?? 3}
            />
          </div>
        </div>
      )}

      {/* Chat Floating Widget */}
      <div
        className="hidden sm:flex fixed bottom-4 right-4 sm:bottom-6 sm:right-6 items-end gap-4 pointer-events-none"
        style={{ zIndex: 60 }}
      >
        {/* Active Chat Window */}
        {activeChatId && isChatListOpen && (
          <div className="pointer-events-auto bg-[#161817] border border-[#3b4b3d]/30 rounded-xl w-[calc(100vw-2rem)] sm:w-[320px] max-w-[350px] h-[65vh] sm:h-[450px] max-h-[500px] shadow-2xl flex flex-col mb-2 overflow-hidden animate-fadeInScale absolute bottom-full right-0 sm:relative sm:bottom-auto sm:right-auto">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-[#3b4b3d]/30 flex items-center justify-between bg-[#1a1c1b] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center shrink-0 relative">
                  {activeChatData?.isGroup ? (
                    <>
                      <img
                        className="w-8 h-8 rounded-full object-cover border border-[#1a1c1b] z-10"
                        src={activeChatData.avatars[0]}
                        alt="User 1"
                      />
                      <img
                        className="w-8 h-8 rounded-full object-cover border border-[#1a1c1b] -ml-4 z-0"
                        src={activeChatData.avatars[1]}
                        alt="User 2"
                      />
                    </>
                  ) : (
                    <img
                      className="w-8 h-8 rounded-full object-cover"
                      src={activeChatData?.avatars[0]}
                      alt={activeChatData?.name}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px]">
                    {activeChatData?.name}
                  </h4>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold capitalize tracking-wide">
                      {activeChatData?.type || "Individual"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveChatId(null)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">
                  close
                </span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 hide-scrollbar bg-[#121413]">
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
                      <div className="bg-[#0d0f0e] px-3 py-2.5 rounded-2xl rounded-tr-none text-xs sm:text-sm text-white leading-relaxed border border-[#00ff85]/30 text-left w-full break-words">
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
                                className="max-w-full rounded-lg mb-1 bg-black border border-white/10"
                              />
                            ) : (
                              <img
                                src={url}
                                alt="attachment"
                                className="max-w-full rounded-lg mb-1 object-cover border border-white/10"
                              />
                            );
                          })()}
                        {m.message && <span>{m.message}</span>}
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
                          <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider truncate">
                            {activeChatData?.name}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono shrink-0">
                            {m.created_at?.slice(11, 16)}
                          </span>
                        </div>
                        <div className="bg-[#1e201f] text-[#e2e3e0] text-xs sm:text-sm p-2.5 sm:p-3 rounded-2xl rounded-tl-none border border-white/5 relative break-words">
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
                                  className="max-w-full rounded-lg mb-1 bg-black border border-white/10"
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt="attachment"
                                  className="max-w-full rounded-lg mb-1 object-cover border border-white/10"
                                />
                              );
                            })()}
                          {m.message && <span>{m.message}</span>}
                        </div>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>

            {/* Input */}
            <div className="p-2 sm:p-3 bg-[#121413] shrink-0">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 flex items-center bg-[#0d0f0e] border border-[#3b4b3d]/50 rounded-full px-3 py-1.5 sm:py-2 focus-within:border-[#00ff85]/50 transition-colors min-w-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleChatSend();
                    }}
                    placeholder="Type message..."
                    className="w-full bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none focus:ring-0 placeholder:text-[#3b4b3d]"
                  />
                </div>
                <button
                  onClick={handleChatSend}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#00ff85] text-[#003919] shrink-0 hover:brightness-110 transition-all"
                >
                  <span
                    className="material-symbols-outlined text-base sm:text-lg"
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
            <div className="bg-[#161817] border border-[#3b4b3d]/30 rounded-xl w-[calc(100vw-2rem)] sm:w-[300px] max-w-[350px] shadow-2xl overflow-hidden animate-fadeInScale mb-2 absolute bottom-full right-0 sm:relative sm:bottom-auto sm:right-auto">
              <div className="p-3 sm:p-4 border-b border-[#3b4b3d]/30 bg-[#1a1c1b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fce4d6] flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-[#cf9c7b] text-xs sm:text-sm">
                      phone_iphone
                    </span>
                    <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#00ff88] rounded-full border-2 border-[#161817]"></div>
                  </div>
                  <h3 className="text-white font-bold text-sm">Messages</h3>
                </div>
                <button
                  onClick={() => setIsChatListOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">
                    keyboard_arrow_down
                  </span>
                </button>
              </div>
              <div className="p-2 space-y-1 max-h-[40vh] sm:max-h-[350px] overflow-y-auto hide-scrollbar">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setChats((prev) =>
                        prev.map((c) =>
                          c.id === chat.id ? { ...c, unreadCount: 0 } : c,
                        ),
                      );
                      if (window.innerWidth < 640) {
                        setIsChatListOpen(false);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg cursor-pointer transition-colors ${activeChatId === chat.id ? "bg-[#1e201f] border-l-2 border-[#00ff85]" : "hover:bg-[#1e201f]"}`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="relative flex items-center shrink-0">
                        {chat.isGroup ? (
                          <>
                            <img
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-[#1a1c1b] z-10"
                              src={chat.avatars[0]}
                              alt="User 1"
                            />
                            <img
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-[#1a1c1b] -ml-4 sm:-ml-5 z-0"
                              src={chat.avatars[1]}
                              alt="User 2"
                            />
                          </>
                        ) : (
                          <img
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                            src={chat.avatars[0]}
                            alt={chat.name}
                          />
                        )}
                      </div>
                      <div className="min-w-0 pr-2">
                        <h5 className="text-white font-bold text-xs sm:text-sm truncate w-28 sm:w-32 flex items-center gap-1">
                          <span className="truncate">{chat.name}</span>
                          {chat.isYou && (
                            <span className="shrink-0 text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30">
                              You
                            </span>
                          )}
                        </h5>
                        <p className="text-slate-400 text-[10px] sm:text-xs truncate w-28 sm:w-32">
                          {chat.lastMsg}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-slate-500 text-[9px] sm:text-[10px]">
                        {chat.time}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-[#00ff88] text-black text-[8px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 leading-none">
                          {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 sm:p-3 border-t border-[#3b4b3d]/30 bg-[#1a1c1b]">
                <button className="w-full bg-[#00ff88]/10 text-[#00ff88] font-bold text-[10px] sm:text-xs py-2 sm:py-3 rounded-lg hover:bg-[#00ff88]/20 transition-colors uppercase tracking-wider">
                  View All Messages
                </button>
              </div>
            </div>
          )}

          {/* Minimized Toggle Button */}
          {!isChatListOpen && (
            <div
              className="bg-[#161817] border border-[#3b4b3d]/30 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer w-[calc(100vw-2rem)] max-w-[250px] sm:max-w-[300px] shadow-lg hover:bg-[#1e201f] transition-all"
              onClick={() => setIsChatListOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#fce4d6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#cf9c7b] text-sm">
                      phone_iphone
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ff88] rounded-full border-2 border-[#161817]"></div>
                </div>
                <span className="font-bold text-white text-sm">Messages</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-xl">
                expand_less
              </span>
            </div>
          )}
        </div>
      </div>

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