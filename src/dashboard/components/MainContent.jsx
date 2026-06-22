import React, { useState, useEffect, useRef, useCallback } from "react";
import RightSection from "../RightSection";
import avatar from "../../assets/images/avatar.jpg";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";
import ShareModal from "../ShareModal";
import PollSection from "./polls/PollSection";
import ResearchSection from "./research/ResearchSection";
import PostSection from "./posts/PostSection";
import RightMessageBox from "./messages/RightMessageBox";
import PostActionModals from "./modals/PostActionModals";
import usePollActions from "./hooks/usePollActions";
import usePostInteractions from "./hooks/usePostInteractions";
import useChatWidget from "./hooks/useChatWidget";
import useFeed from "./hooks/useFeed";

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
  const navigate = useNavigate();
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
  const activeChatIdRef = useRef(null);
  const chatsRef = useRef([]);
  const bgPollingRef = useRef(null);

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

  const openApprovalModal = () => {
    setShowApprovalModal(true);
  };

  const _pollApi = usePollActions({
    feedDataRef,
    getAuthToken,
    pollActionLoading,
    setDeletingPollId,
    setFeedData,
    setPollActionLoading,
  });
  const _postApi = usePostInteractions({
    commentsState,
    currentPlayingVideo,
    feedData,
    getAuthToken,
    getCurrentUserAvatar,
    likedPosts,
    observerRef,
    savedPosts,
    setCommentsState,
    setExpandedComments,
    setExpandedPosts,
    setFeedData,
    setLikedPosts,
    setNewCommentText,
    setPausedVideos,
    setSavedPosts,
    setShowReadMore,
    setVideoMutedState,
    textRefs,
    userAvatar,
    userId,
    userName,
    videoMutedState,
    videoRefs,
  });
  const _chatApi = useChatWidget({
    activeChatId,
    activeChatIdRef,
    bgPollingRef,
    blockedUserIds,
    chatInput,
    chatMessages,
    chatWidgetRef,
    chats,
    chatsRef,
    getAuthToken,
    getCurrentUserId,
    isInstituteApprovalPending,
    openApprovalModal,
    pollingRef,
    popupMessagesContainerRef,
    popupMessagesEndRef,
    popupShouldAutoScrollRef,
    setActiveChatId,
    setChatInput,
    setChatMessages,
    setChats,
    setIsChatListOpen,
    userId,
  });
  const _feedApi = useFeed({
    blockedUserIds,
    checkInstituteApprovalPending,
    connectedUsers,
    feedData,
    feedDataRef,
    fetchChatUsers: _chatApi.fetchChatUsers,
    getAuthToken,
    getCurrentUserAvatar,
    getCurrentUserId,
    getCurrentUserName,
    isInstituteApprovalPending,
    loadingFeed,
    navigate,
    savedPosts,
    setBlockedUserIds,
    setCommentsState,
    setConnectedUsers,
    setFeedData,
    setIsInstituteApprovalPending,
    setLikedPosts,
    setLoadingFeed,
    setProfilePercent,
    setSavedPosts,
    setUserAvatar,
    setUserId,
    setUserName,
    setVideoMutedState,
    userId,
    userName,
  });

  const {
    recomputePollPercentages,
    updatePollInFeed,
    pollVoteRequest,
    pollUndoRequest,
    applyLocalVote,
    applyLocalSwitchVote,
    applyLocalUndo,
    clonePoll,
    handlePollOptionClick,
    handlePollUndo,
    deletePollRequest,
    handleDeletePoll,
  } = _pollApi;
  const {
    handleVideoPlayback,
    toggleVideoPlayPause,
    toggleVideoSound,
    toggleReadMorePost,
    toggleLike,
    toggleSave,
    fetchComments,
    toggleComments,
    addComment,
    deleteComment,
    toggleReadMore,
  } = _postApi;
  const {
    handlePopupScroll,
    saveFloatingTimestamps,
    fetchChatUsers,
    formatMsgTime,
    handleChatSend,
    activeChatData,
  } = _chatApi;
  const {
    handleOpenUserProfile,
    toggleConnect,
    fetchConnectedUsersList,
    fetchPendingStatuses,
    fetchBlockedUserIds,
  } = _feedApi;

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

  const getInitials = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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

  const getPostProfileSrc = (post) => {
    if (post.profile_image) {
      return `${API_CONFIG.BASE_URL}/${post.profile_image}`;
    }
    return avatar;
  };

  const ctx = {
    userName,
    setUserName,
    userId,
    setUserId,
    userAvatar,
    setUserAvatar,
    feedData,
    setFeedData,
    loadingFeed,
    setLoadingFeed,
    pollActionLoading,
    setPollActionLoading,
    deletingPollId,
    setDeletingPollId,
    likedPosts,
    setLikedPosts,
    commentsState,
    setCommentsState,
    showOptionsId,
    setShowOptionsId,
    savedPosts,
    setSavedPosts,
    videoMutedState,
    setVideoMutedState,
    deletingPost,
    setDeletingPost,
    showDeletePopup,
    setShowDeletePopup,
    showReportPopup,
    setShowReportPopup,
    showBlockPopup,
    setShowBlockPopup,
    selectedPost,
    setSelectedPost,
    reportReason,
    setReportReason,
    pausedVideos,
    setPausedVideos,
    newCommentText,
    setNewCommentText,
    expandedComments,
    setExpandedComments,
    expandedPosts,
    setExpandedPosts,
    selectedProfileUser,
    setSelectedProfileUser,
    navigate,
    connectedUsers,
    setConnectedUsers,
    reportStep,
    setReportStep,
    isReportingLoading,
    setIsReportingLoading,
    isShareOpen,
    setIsShareOpen,
    selectedSharePostId,
    setSelectedSharePostId,
    shareSearchQuery,
    setShareSearchQuery,
    selectedUserIds,
    setSelectedUserIds,
    allUsers,
    setAllUsers,
    shareGroups,
    setShareGroups,
    chatWidgetRef,
    profilePercent,
    setProfilePercent,
    popupMessagesContainerRef,
    popupShouldAutoScrollRef,
    popupMessagesEndRef,
    reportReasons,
    isChatListOpen,
    setIsChatListOpen,
    activeChatId,
    setActiveChatId,
    chatInput,
    setChatInput,
    chatMessages,
    setChatMessages,
    pollingRef,
    feedDataRef,
    blockedUserIds,
    setBlockedUserIds,
    currentPlayingVideo,
    videoRefs,
    observerRef,
    isPostModalOpen,
    setIsPostModalOpen,
    selectedPostIdForPopup,
    setSelectedPostIdForPopup,
    popupPostData,
    setPopupPostData,
    loadingPostData,
    setLoadingPostData,
    isExpanded,
    setIsExpanded,
    chats,
    setChats,
    isInstituteApprovalPending,
    setIsInstituteApprovalPending,
    showApprovalModal,
    setShowApprovalModal,
    getAuthToken,
    textRefs,
    showReadMore,
    setShowReadMore,
    getCurrentUserId,
    getCurrentUserAvatar,
    getCurrentUserName,
    checkInstituteApprovalPending,
    getFileInfo,
    formatDate,
    handleVideoPlayback,
    handlePopupScroll,
    toggleVideoPlayPause,
    toggleVideoSound,
    toggleReadMorePost,
    handleOpenUserProfile,
    toggleConnect,
    fetchConnectedUsersList,
    fetchPendingStatuses,
    fetchBlockedUserIds,
    getInitials,
    recomputePollPercentages,
    updatePollInFeed,
    pollVoteRequest,
    pollUndoRequest,
    applyLocalVote,
    applyLocalSwitchVote,
    applyLocalUndo,
    clonePoll,
    handlePollOptionClick,
    handlePollUndo,
    deletePollRequest,
    handleDeletePoll,
    _uploadProfileImage,
    saveFloatingTimestamps,
    fetchChatUsers,
    activeChatIdRef,
    chatsRef,
    formatMsgTime,
    bgPollingRef,
    handleShareClick,
    handleSendPost,
    toggleLike,
    toggleSave,
    fetchComments,
    toggleComments,
    addComment,
    deleteComment,
    toggleReadMore,
    formatTimeAgo,
    handleDeletePost,
    handleReportPost,
    handleBlockUser,
    confirmDelete,
    closeDeletePopup,
    closeReportPopup,
    closeBlockPopup,
    handleChatSend,
    activeChatData,
    openApprovalModal,
    getPostProfileSrc,
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

                  {/* 👇 Sirf tab dikhega jab profile 100% se kam ho */}
                  {/* Profile < 100% → progress card */}
                  {profilePercent < 100 && (
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
                  )}

                  {/* Profile 100% → completed badge (same size, no empty gap) */}
                  {profilePercent >= 100 && (
                    <div className="w-full lg:w-[360px] rounded-2xl border border-emerald-200 dark:border-[#00ff88]/20 bg-emerald-50/70 dark:bg-[#00ff88]/5 p-5 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-[#00ff88]/10 border border-emerald-200 dark:border-[#00ff88]/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-2xl">
                          verified
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Profile Complete
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          You've reached Top Contributor status.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden sm:block absolute right-0 top-0 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] lg:w-[300px] lg:h-[300px] bg-[#00ff88]/10 blur-[80px] sm:blur-[100px] lg:blur-[140px]"></div>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 auto-rows-max lg:auto-rows-auto">
          <div className="lg:col-span-2 w-full space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 main-feed-scroll">
            {" "}
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
                      return (
                        <PollSection
                          key={`poll-${String(poll.poll_id)}-${index}`}
                          post={post}
                          index={index}
                          ctx={ctx}
                        />
                      );
                    }

                    const isMockPost = post.author !== undefined;
                    const isResearchPost = post.isResearchPost === true;
                    const postId = post.id || post.researche_id;

                    if (isResearchPost || (post.research_file && !isMockPost)) {
                      return (
                        <ResearchSection
                          key={`res-${postId}-${index}`}
                          post={post}
                          index={index}
                          ctx={ctx}
                        />
                      );
                    }

                    return (
                      <PostSection
                        key={`post-${postId}-${index}`}
                        post={post}
                        index={index}
                        ctx={ctx}
                      />
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
      <PostActionModals ctx={ctx} />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setSelectedUserIds([]);
          setShareSearchQuery("");
        }}
        allUsers={allUsers}
        shareGroups={shareGroups}
        selectedUserIds={selectedUserIds}
        setSelectedUserIds={setSelectedUserIds}
        shareSearchQuery={shareSearchQuery}
        setShareSearchQuery={setShareSearchQuery}
        onSend={handleSendPost}
        selectedSharePostId={selectedSharePostId}
        avatarFallback={avatar}
      />

      {/* User Profile now opens as a dedicated /user-profile page (see handleOpenUserProfile) */}

      {/* Chat Floating Widget */}
      <RightMessageBox ctx={ctx} />

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

        /* ── LIGHT MODE DEFAULTS (DESKTOP) ── */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }

        /* ── DARK MODE PREMIUM CUSTOM STYLE (DESKTOP) ── */
        .dark ::-webkit-scrollbar {
          width: 6px !important;
          height: 6px !important;
          display: block !important;
        }
        .dark ::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12) !important;
          border-radius: 9999px !important;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25) !important;
        }

        /* Prevent system overrides for Desktop dark mode */
        .dark {
          scrollbar-width: thin !important;
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent !important;
        }

        /* ── PHONE / MOBILE VIEW SPECIFIC OVERRIDE (Hide Scrollbar Completely) ── */
        @media (max-width: 768px) {
          ::-webkit-scrollbar,
          .dark ::-webkit-scrollbar,
          html::-webkit-scrollbar,
          body::-webkit-scrollbar,
          .dark::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
        }

        /* ── FIX DUAL SCROLLBAR: Hide Outer Window Bar strictly for BOTH Themes ── */
        html,
        body,
        :root,
        .dark,
        html.dark {
          scrollbar-width: none !important; /* Firefox global window fix */
          -ms-overflow-style: none !important; /* IE global window fix */
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        html.dark::-webkit-scrollbar,
        body.dark::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* ── ENHANCED SCROLLBAR VISIBILITY (Inner Layout Bars) ── */
        /* Light mode thumb - clearly visible grey */
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.25) !important;
          border-radius: 9999px !important;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5) !important;
        }

        /* Dark mode thumb - clearly visible frosted white line */
        .dark ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.22) !important;
          border-radius: 9999px !important;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.45) !important;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default MainContent;
