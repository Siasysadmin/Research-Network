import API_CONFIG from "../../../config/api.config";
import { toast } from "react-toastify";

export default function usePollActions(deps) {
  const {
    feedDataRef,
    getAuthToken,
    pollActionLoading,
    setDeletingPollId,
    setFeedData,
    setPollActionLoading,
  } = deps;

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


  return {
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
  };
}
