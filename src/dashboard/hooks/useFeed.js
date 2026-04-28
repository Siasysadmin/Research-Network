git checkout mainimport { useState, useRef } from "react";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  null;

const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    if (Array.isArray(user)) return user[0]?.id || null;
    return user.id || null;
  } catch { return null; }
};

export const useFeed = () => {
  const [feedData, setFeedData] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [commentsState, setCommentsState] = useState({});
  const [newCommentText, setNewCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showOptionsId, setShowOptionsId] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [deletingPollId, setDeletingPollId] = useState(null);
  const [pollActionLoading, setPollActionLoading] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const feedDataRef = useRef([]);

  // ── Feed Fetch ──
  const fetchFeed = async () => {
    try {
      const token = getAuthToken();
      let apiPosts = [], publishedResearch = [], pollList = [];

      const [postsRes, researchRes, pollRes] = await Promise.allSettled([
        fetch(`${API_CONFIG.BASE_URL}/post/get-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
        fetch(`${API_CONFIG.BASE_URL}/research/get-published-research`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
        fetch(`${API_CONFIG.BASE_URL}/poll/poll-list`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
      ]);

      if (postsRes.status === "fulfilled" && postsRes.value.status)
        apiPosts = postsRes.value.data || [];

      if (researchRes.status === "fulfilled" && researchRes.value.status)
        publishedResearch = (researchRes.value.data || []).map(r => ({
          ...r,
          id: r.researche_id,
          isResearchPost: true,
          post_text: r.abstract || "Published Research",
          type: "research",
          created_at: r.published_at || r.created_at || new Date().toISOString(),
        }));

      if (pollRes.status === "fulfilled" && pollRes.value.status)
        pollList = pollRes.value.data || [];

      let mockPosts = [];
      try { mockPosts = JSON.parse(localStorage.getItem("mockPosts")) || []; } catch {}

      const pollQuestions = new Set(pollList.map(p => p.question?.trim()));
      const cleanApiPosts = apiPosts.filter(p =>
        !p?.poll_id && !p?.pollId && !pollQuestions.has((p?.post_text || "").trim())
      );

      const pollFeedItems = pollList.map(p => ({
        ...p, id: `poll_${p.poll_id}`, isPollPost: true, type: "poll",
      }));

      const allPosts = [...publishedResearch, ...mockPosts, ...cleanApiPosts, ...pollFeedItems];

      allPosts.sort((a, b) => {
        const normalize = (v) => {
          if (!v) return 0;
          let s = String(v).replace(" ", "T");
          if (!s.endsWith("Z") && !s.includes("+") && !s.includes("-", 10)) s += "+05:30";
          return s;
        };
        return new Date(normalize(b.created_at || b.published_at || 0)) -
               new Date(normalize(a.created_at || a.published_at || 0));
      });

      setFeedData(allPosts);
      feedDataRef.current = allPosts;
    } catch (err) {
      console.error("Feed fetch error:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  // ── Like ──
  const toggleLike = async (postId) => {
    const token = getAuthToken();
    const post = feedData.find(p => p.id === postId || p.researche_id === postId);
    if (!post) return;
    const isCurrentlyLiked = post.is_liked === "1" || likedPosts[postId];
    const isMockPost = post.author !== undefined;
    const isResearchPost = post.isResearchPost === true;

    setLikedPosts(prev => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setFeedData(prev => prev.map(p =>
      (p.id === postId || p.researche_id === postId)
        ? { ...p, is_liked: isCurrentlyLiked ? "0" : "1", like_count: isCurrentlyLiked ? Math.max(0, (p.like_count || 0) - 1) : (parseInt(p.like_count || 0) + 1) }
        : p
    ));
    if (isMockPost) return;

    try {
      const actualId = isResearchPost ? post.researche_id || post.id : post.id;
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/like-research/${actualId}`
        : `${API_CONFIG.BASE_URL}/post/like-post/${actualId}`;
      await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { console.error(err); }
  };

  // ── Save ──
  const toggleSave = async (postId) => {
    const token = getAuthToken();
    const post = feedData.find(p => p.id === postId || p.researche_id === postId);
    if (!post) return;
    const isCurrentlySaved = savedPosts[postId] || false;
    const isResearchPost = post.isResearchPost === true;

    setSavedPosts(prev => ({ ...prev, [postId]: !isCurrentlySaved }));
    if (post.author !== undefined) { toast.success(isCurrentlySaved ? "Unsaved" : "Saved"); return; }

    try {
      const actualId = isResearchPost ? post.researche_id || post.id : post.id;
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/research-save/${actualId}`
        : `${API_CONFIG.BASE_URL}/post/save-post/${actualId}`;
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (!result.status) {
        setSavedPosts(prev => ({ ...prev, [postId]: isCurrentlySaved }));
        toast.error("Failed to save");
      }
    } catch { toast.error("Network error"); }
  };

  // ── Comments ──
  const fetchComments = async (postId, post) => {
    const token = getAuthToken();
    const isResearchPost = post?.isResearchPost === true;
    const actualId = isResearchPost ? post.researche_id || post.id : post.id;
    const endpoint = isResearchPost
      ? `${API_CONFIG.BASE_URL}/research/get-comments/${actualId}`
      : `${API_CONFIG.BASE_URL}/post/get-comments/${actualId}`;
    try {
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      const list = (result.data || []).map(c => ({
        id: c.id, text: c.comment, author: c.name,
        authorId: c.user_id,
        authorAvatar: c.profile_image ? `${API_CONFIG.BASE_URL}/${c.profile_image}` : null,
        timestamp: c.created_at,
      }));
      setCommentsState(prev => ({ ...prev, [postId]: { ...prev[postId], isOpen: true, list } }));
    } catch { console.error("Fetch comments error"); }
  };

  const toggleComments = async (postId) => {
    const isOpen = commentsState[postId]?.isOpen;
    const post = feedData.find(p => p.id === postId || p.researche_id === postId);
    if (isOpen) {
      setCommentsState(prev => ({ ...prev, [postId]: { ...prev[postId], isOpen: false } }));
      return;
    }
    if (post?.author !== undefined) {
      setCommentsState(prev => ({ ...prev, [postId]: { ...prev[postId], isOpen: true, list: prev[postId]?.list || [] } }));
      return;
    }
    await fetchComments(postId, post);
  };

  const addComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    const token = getAuthToken();
    const post = feedData.find(p => p.id === postId || p.researche_id === postId);
    const isResearchPost = post?.isResearchPost === true;
    setNewCommentText(prev => ({ ...prev, [postId]: "" }));
    try {
      const actualId = isResearchPost ? post.researche_id || post.id : post.id;
      const endpoint = isResearchPost
        ? `${API_CONFIG.BASE_URL}/research/add-comment/${actualId}`
        : `${API_CONFIG.BASE_URL}/post/add-comment/${actualId}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: commentText.trim() }),
      });
      const result = await res.json();
      if (result.status) {
        await fetchComments(postId, post);
        setFeedData(prev => prev.map(p =>
          (p.id === postId || p.researche_id === postId)
            ? { ...p, comment_count: parseInt(p.comment_count || 0) + 1 }
            : p
        ));
      }
    } catch { toast.error("Comment add error"); }
  };

  const deleteComment = async (postId, commentId) => {
    const token = getAuthToken();
    const post = feedData.find(p => p.id === postId || p.researche_id === postId);
    setCommentsState(prev => ({
      ...prev,
      [postId]: { ...prev[postId], list: prev[postId].list.filter(c => c.id != commentId) }
    }));
    if (post?.author !== undefined) return;
    try {
      await fetch(`${API_CONFIG.BASE_URL}/post/delete-comment/${commentId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
    } catch { console.error("Delete comment error"); }
  };

  // ── Delete Post ──
  const handleDeletePost = async (postId, isMockPost) => {
    setDeletingPost(postId);
    try {
      if (isMockPost) {
        const stored = JSON.parse(localStorage.getItem("mockPosts")) || [];
        localStorage.setItem("mockPosts", JSON.stringify(stored.filter(p => p.id !== postId)));
        setFeedData(prev => prev.filter(p => p.id !== postId));
        toast.success("Deleted");
      } else {
        const token = getAuthToken();
        const post = feedData.find(p => p.id === postId || p.researche_id === postId);
        const isResearch = post?.isResearchPost === true;
        const endpoint = isResearch
          ? `${API_CONFIG.BASE_URL}/research/research-delete/${postId}`
          : `${API_CONFIG.BASE_URL}/post/delete-post/${postId}`;
        const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        if (result.status) {
          setFeedData(prev => prev.filter(p => p.id !== postId && p.researche_id !== postId));
          toast.success("Deleted");
        } else toast.error("Failed to delete");
      }
    } catch { toast.error("Error deleting"); }
    finally { setDeletingPost(null); setShowDeletePopup(false); setSelectedPost(null); setShowOptionsId(null); }
  };

  // ── Poll Actions ──
  const recomputePollPercentages = (options, totalVotes) => {
    const total = Number(totalVotes) || 0;
    return options.map(o => ({
      ...o,
      percentage: total > 0 ? Math.round((Number(o.vote_count) || 0) * 100 / total) : 0,
    }));
  };

  const updatePollInFeed = (pollId, updater) => {
    const pollIdStr = String(pollId);
    setFeedData(prev => prev.map(item => {
      const poll = item?.poll || (item?.isPollPost ? item : null);
      const itemPollId = String(poll?.poll_id ?? item?.poll_id ?? "");
      if (!poll || itemPollId !== pollIdStr) return item;
      const nextPoll = updater(poll);
      if (item.poll) return { ...item, poll: nextPoll, isPollPost: true };
      return { ...item, ...nextPoll, isPollPost: true };
    }));
  };

  const handlePollOptionClick = async (e, poll, optionId) => {
    e.preventDefault(); e.stopPropagation();
    const pollId = poll?.poll_id;
    if (!pollId || pollActionLoading[String(pollId)]) return;
    const token = getAuthToken();
    setPollActionLoading(prev => ({ ...prev, [String(pollId)]: true }));
    const snapshot = { ...poll, options: poll.options.map(o => ({ ...o })) };
    try {
      const myVote = poll.my_vote_option_id;
      if (myVote && String(myVote) === String(optionId)) {
        updatePollInFeed(pollId, p => {
          const nextTotal = Math.max(0, (Number(p.total_votes) || 0) - 1);
          return { ...p, total_votes: nextTotal, my_vote_option_id: null, options: recomputePollPercentages(p.options.map(o => ({ ...o, vote_count: String(o.id) === String(myVote) ? Math.max(0, (Number(o.vote_count) || 0) - 1) : o.vote_count, is_voted_by_me: 0 })), nextTotal) };
        });
        await fetch(`${API_CONFIG.BASE_URL}/poll/undo-vote/${pollId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        return;
      }
      if (myVote) {
        updatePollInFeed(pollId, p => ({ ...p, my_vote_option_id: String(optionId), options: recomputePollPercentages(p.options.map(o => ({ ...o, vote_count: Math.max(0, (Number(o.vote_count) || 0) - (String(o.id) === String(myVote) ? 1 : 0) + (String(o.id) === String(optionId) ? 1 : 0)), is_voted_by_me: String(o.id) === String(optionId) ? 1 : 0 })), Number(p.total_votes) || 0) }));
        await fetch(`${API_CONFIG.BASE_URL}/poll/undo-vote/${pollId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      } else {
        const nextTotal = (Number(poll.total_votes) || 0) + 1;
        updatePollInFeed(pollId, p => ({ ...p, total_votes: nextTotal, my_vote_option_id: String(optionId), options: recomputePollPercentages(p.options.map(o => ({ ...o, vote_count: (Number(o.vote_count) || 0) + (String(o.id) === String(optionId) ? 1 : 0), is_voted_by_me: String(o.id) === String(optionId) ? 1 : 0 })), nextTotal) }));
      }
      await fetch(`${API_CONFIG.BASE_URL}/poll/vote-poll/${pollId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ option_id: Number(optionId) }),
      });
    } catch (err) {
      updatePollInFeed(pollId, () => snapshot);
      toast.error("Poll action failed");
    } finally {
      setPollActionLoading(prev => { const n = { ...prev }; delete n[String(pollId)]; return n; });
    }
  };

  const handlePollUndo = async (e, poll) => {
    e.preventDefault(); e.stopPropagation();
    const pollId = poll?.poll_id;
    if (!pollId || pollActionLoading[String(pollId)]) return;
    const token = getAuthToken();
    setPollActionLoading(prev => ({ ...prev, [String(pollId)]: true }));
    const snapshot = { ...poll, options: poll.options.map(o => ({ ...o })) };
    try {
      const myVote = poll.my_vote_option_id;
      const nextTotal = Math.max(0, (Number(poll.total_votes) || 0) - 1);
      updatePollInFeed(pollId, p => ({ ...p, total_votes: nextTotal, my_vote_option_id: null, options: recomputePollPercentages(p.options.map(o => ({ ...o, vote_count: String(o.id) === String(myVote) ? Math.max(0, (Number(o.vote_count) || 0) - 1) : o.vote_count, is_voted_by_me: 0 })), nextTotal) }));
      await fetch(`${API_CONFIG.BASE_URL}/poll/undo-vote/${pollId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch {
      updatePollInFeed(pollId, () => snapshot);
      toast.error("Undo failed");
    } finally {
      setPollActionLoading(prev => { const n = { ...prev }; delete n[String(pollId)]; return n; });
    }
  };

  const handleDeletePoll = async (pollId) => {
    const pollIdStr = String(pollId);
    setDeletingPollId(pollIdStr);
    const snapshot = feedDataRef.current;
    setFeedData(prev => prev.filter(item => {
      const poll = item?.poll || (item?.isPollPost ? item : null);
      return String(poll?.poll_id ?? item?.poll_id ?? "") !== pollIdStr;
    }));
    try {
      const token = getAuthToken();
      await fetch(`${API_CONFIG.BASE_URL}/poll/delete-poll/${pollIdStr}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Poll deleted");
    } catch {
      setFeedData(snapshot);
      toast.error("Failed to delete poll");
    } finally { setDeletingPollId(null); }
  };

  // ── Report / Block ──
  const handleReportPost = async () => {
    if (!reportReason.trim()) { alert("Please provide a reason"); return; }
    const token = getAuthToken();
    try {
      await fetch(`${API_CONFIG.BASE_URL}/post/report-post/${selectedPost?.postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reportReason }),
      });
      toast.success("Reported");
    } catch { toast.error("Report failed"); }
    finally { setShowReportPopup(false); setReportReason(""); setSelectedPost(null); setShowOptionsId(null); }
  };

  const handleBlockUser = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/account/block-unblock-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: String(selectedPost?.postUserId) }),
      });
      const result = await res.json();
      if (result.status) {
        toast.success("Blocked");
        setFeedData(prev => prev.filter(p => String(p.user_id ?? p.poll?.user_id ?? "") !== String(selectedPost?.postUserId)));
      } else toast.error("Failed to block");
    } catch { toast.error("Error blocking"); }
    finally { setShowBlockPopup(false); setSelectedPost(null); setShowOptionsId(null); }
  };

  const confirmDelete = () => {
    if (!selectedPost) return;
    if (selectedPost.isPollPost) handleDeletePoll(selectedPost.pollId);
    else handleDeletePost(selectedPost.postId, selectedPost.isMockPost);
    setShowDeletePopup(false);
    setSelectedPost(null);
  };

  return {
    feedData, setFeedData, loadingFeed,
    likedPosts, savedPosts, commentsState, newCommentText, setNewCommentText,
    expandedComments, setExpandedComments, expandedPosts, setExpandedPosts,
    showOptionsId, setShowOptionsId,
    deletingPost, deletingPollId, pollActionLoading,
    showDeletePopup, setShowDeletePopup,
    showReportPopup, setShowReportPopup,
    showBlockPopup, setShowBlockPopup,
    selectedPost, setSelectedPost,
    reportReason, setReportReason,
    fetchFeed, toggleLike, toggleSave,
    toggleComments, addComment, deleteComment,
    handleDeletePost, handleDeletePoll,
    handlePollOptionClick, handlePollUndo,
    handleReportPost, handleBlockUser, confirmDelete,
  };
};