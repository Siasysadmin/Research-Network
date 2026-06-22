import { useCallback, useEffect } from "react";
import API_CONFIG from "../../../config/api.config";
import { toast } from "react-toastify";

export default function usePostInteractions(deps) {
  const {
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
  } = deps;

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
    localStorage.setItem("videoMuteStates", JSON.stringify(videoMutedState));
  }, [videoMutedState]);

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


  return {
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
  };
}
