import { useEffect } from "react";
import API_CONFIG from "../../../config/api.config";
import avatar from "../../../assets/images/avatar.jpg";

export default function useChatWidget(deps) {
  const {
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
  } = deps;

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


const markMessagesSeen = async (chatId) => {
    if (!chatId) return;
    try {
      const token = getAuthToken();
      await fetch(`${API_CONFIG.BASE_URL}/message/message-seen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sender_id: chatId }), // wahi key jo Chats.jsx use karta
      });
    } catch (e) {
      console.error("seen error", e);
    }
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
    // first poll after 5s → chat list paints instantly on open

    return () => {
      if (bgPollingRef.current) clearInterval(bgPollingRef.current);
    };
  }, [chats.length, isInstituteApprovalPending]);

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


  return {
    handlePopupScroll,
    saveFloatingTimestamps,
    fetchChatUsers,
    formatMsgTime,
    handleChatSend,
    activeChatData,
  };
}