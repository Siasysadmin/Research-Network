import { useEffect } from "react";
import API_CONFIG from "../../../config/api.config";
import { toast } from "react-toastify";
import {
  calculateIndividualProfileCompletion,
  calculateInstituteProfileCompletion,
} from "../../../utils/profileCompletion";

export default function useFeed(deps) {
  const {
    blockedUserIds,
    checkInstituteApprovalPending,
    connectedUsers,
    feedData,
    feedDataRef,
    fetchChatUsers,
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
  } = deps;

  useEffect(() => {
    feedDataRef.current = feedData;
  }, [feedData]);

  const handleOpenUserProfile = (postData, isMockPost = false) => {
    const profileUser = isMockPost
      ? { id: userId, name: userName, user_type: "individual" }
      : {
          id: postData.user_id || postData.id,
          name:
            postData.name ||
            postData.institute_name ||
            postData.institute_details?.institute_name ||
            "User",
          user_type: postData.user_type || "individual",
        };
    // Open as a dedicated full page (not a popup) via the /user-profile route
    navigate("/user-profile", {
      state: {
        user: profileUser,
        initialConnectionStatus: connectedUsers[profileUser.id] ?? 3,
      },
    });
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

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // 🚀 3 calls parallel chalein, sequential nahi — load time ~3x kam
        const [postsResult, researchResult, pollResultSettled] =
          await Promise.allSettled([
            fetch(`${API_CONFIG.BASE_URL}/post/get-posts`, {
              method: "GET",
              headers,
            }).then((r) => r.json()),
            fetch(`${API_CONFIG.BASE_URL}/research/get-published-research`, {
              method: "GET",
              headers,
            }).then((r) => r.json()),
            fetch(`${API_CONFIG.BASE_URL}/poll/poll-list`, {
              method: "GET",
              headers,
            }).then((r) => r.json()),
          ]);

        if (postsResult.status === "fulfilled") {
          const result = postsResult.value;
          if (result.status && result.data) apiPosts = result.data;
        } else {
          console.error("Error fetching API posts:", postsResult.reason);
        }

        if (researchResult.status === "fulfilled") {
          const researchData = researchResult.value;
          if (researchData.status && researchData.data) {
            publishedResearch = researchData.data.map((research) => ({
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
        } else {
          console.error(
            "Error fetching published research:",
            researchResult.reason,
          );
        }

        if (pollResultSettled.status === "fulfilled") {
          const pollResult = pollResultSettled.value;
          if (pollResult.status && pollResult.data) pollList = pollResult.data;
        } else {
          console.error(
            "Error fetching poll list:",
            pollResultSettled.reason,
          );
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
          },
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

        console.log(
          "PROFILE FOR PERCENT:",
          userType === "institute"
            ? JSON.parse(localStorage.getItem("latestInstituteProfile") || "{}")
            : apiProfile,
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


  return {
    handleOpenUserProfile,
    toggleConnect,
    fetchConnectedUsersList,
    fetchPendingStatuses,
    fetchBlockedUserIds,
  };
}