import { useState, useEffect, useRef } from "react";
import API_CONFIG from "../../config/api.config";
import avatar from "../../assets/images/avatar.jpg";

const getAuthToken = () => localStorage.getItem("auth_token") || localStorage.getItem("token") || null;
const getCurrentUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user"));
    if (Array.isArray(u)) return String(u[0]?.id || "");
    return String(u?.id || "");
  } catch { return null; }
};

export const useChat = () => {
  const [chats, setChats] = useState([]);
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const pollingRef = useRef(null);
  const bgPollingRef = useRef(null);
  const activeChatIdRef = useRef(null);
  const chatsRef = useRef([]);

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
  useEffect(() => { chatsRef.current = chats; }, [chats]);

  const formatMsgTime = (created_at) => {
    if (!created_at) return "";
    return new Date(created_at).toLocaleTimeString("en-IN", { hour12: true, hour: "numeric", minute: "2-digit" });
  };

  const saveFloatingTimestamps = (list) => {
    const t = {};
    list.forEach(c => { if (c.timestamp > 0) t[c.id] = c.timestamp; });
    localStorage.setItem("floatingChatTimestamps", JSON.stringify(t));
  };

  const fetchChatUsers = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/user/get-all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const userList = data.data || data.users || (Array.isArray(data) ? data : []);
      const savedTimestamps = JSON.parse(localStorage.getItem("floatingChatTimestamps") || "{}");
      const currentId = getCurrentUserId();

      const formatted = userList.map(user => {
        const uid = String(user.id);
        const name = user.user_type === "institute"
          ? user.institute_details?.institute_name || user.name || "Unknown"
          : user.name || "Unknown";
        const img = user.user_type === "institute"
          ? user.profile_institute_details?.profile_image
          : user.profile_individual_details?.profile_image;
        return {
          id: uid, name, isYou: uid === String(currentId),
          timestamp: savedTimestamps[uid] || 0,
          lastMsg: `Say hi to ${name}...`,
          type: user.user_type === "institute" ? "Institute" : "Individual",
          time: "", isGroup: false, unreadCount: 0,
          avatars: [img ? `${API_CONFIG.BASE_URL}/${img}` : avatar],
          messages: [],
        };
      });

      const sorted = [...formatted].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setChats(sorted);
      saveFloatingTimestamps(sorted);
    } catch (err) { console.error(err); }
  };

  // Active chat polling
  useEffect(() => {
    if (!activeChatId) { if (pollingRef.current) clearInterval(pollingRef.current); return; }
    const fetchMessages = async () => {
      try {
        const token = getAuthToken();
        const currentId = getCurrentUserId();
        const res = await fetch(`${API_CONFIG.BASE_URL}/message/message-get`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ receiver_id: activeChatId }),
        });
        const result = await res.json();
        if (result.status && result.data) {
          const formatted = result.data.map(m => ({
            id: m.id, sender_id: m.sender_id, receiver_id: m.receiver_id,
            message: m.message, created_at: m.created_at,
            isMine: String(m.sender_id) === String(currentId),
            file: m.file_path ? { path: m.file_path, type: m.file_path.match(/\.(mp4|webm|ogg|mov)$/i) ? "video" : "image" } : null,
          }));
          setChatMessages(prev => ({ ...prev, [activeChatId]: formatted }));
          if (formatted.length > 0) {
            const last = formatted[formatted.length - 1];
            setChats(prev => {
              const updated = prev.map(c => c.id === activeChatId ? {
                ...c,
                lastMsg: last.isMine ? `You: ${last.message || "Attachment"}` : last.message || "Attachment",
                time: formatMsgTime(last.created_at),
                timestamp: new Date(last.created_at).getTime(),
                unreadCount: 0,
              } : c);
              return [...updated].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            });
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [activeChatId]);

  // Background polling
  useEffect(() => {
    if (chats.length === 0) return;
    const pollBackground = async () => {
      const token = getAuthToken();
      const currentId = String(getCurrentUserId());
      const inactiveChats = chatsRef.current.filter(c => !c.isGroup && String(c.id) !== String(activeChatIdRef.current));
      if (inactiveChats.length === 0) return;
      const results = await Promise.allSettled(
        inactiveChats.map(chat =>
          fetch(`${API_CONFIG.BASE_URL}/message/message-get`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ receiver_id: chat.id }),
          }).then(r => r.json())
        )
      );
      let hasUpdates = false;
      const updates = {};
      results.forEach((result, idx) => {
        if (result.status !== "fulfilled") return;
        const data = result.value;
        const chat = inactiveChats[idx];
        if (!data.status || !data.data?.length) return;
        const msgs = data.data;
        const latest = msgs[msgs.length - 1];
        const unread = msgs.filter(m => String(m.sender_id) !== currentId && String(m.receiver_id) === currentId && String(m.is_seen) === "0").length;
        const newLastMsg = String(latest.sender_id) === currentId ? `You: ${latest.message || "Attachment"}` : latest.message || "Attachment";
        if (chat.unreadCount !== unread || chat.lastMsg !== newLastMsg) {
          hasUpdates = true;
          updates[chat.id] = { lastMsg: newLastMsg, time: formatMsgTime(latest.created_at), unreadCount: unread, timestamp: new Date(latest.created_at).getTime() };
        }
      });
      if (hasUpdates) {
        setChats(prev => {
          const mapped = prev.map(c => updates[c.id] ? { ...c, ...updates[c.id] } : c);
          const sorted = [...mapped].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          saveFloatingTimestamps(sorted);
          return sorted;
        });
      }
    };
    bgPollingRef.current = setInterval(pollBackground, 5000);
    pollBackground();
    return () => { if (bgPollingRef.current) clearInterval(bgPollingRef.current); };
  }, [chats.length]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || !activeChatId) return;
    const messageText = chatInput.trim();
    const currentId = getCurrentUserId();
    setChatInput("");
    const tempMsg = { id: `temp-${Date.now()}`, sender_id: String(currentId), receiver_id: String(activeChatId), message: messageText, isMine: true, created_at: new Date().toISOString() };
    setChatMessages(prev => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), tempMsg] }));
    setChats(prev => {
      const now = Date.now();
      const updated = prev.map(c => c.id === activeChatId ? { ...c, lastMsg: `You: ${messageText}`, timestamp: now, time: formatMsgTime(new Date().toISOString()) } : c);
      const sorted = [...updated].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      saveFloatingTimestamps(sorted);
      return sorted;
    });
    try {
      const token = getAuthToken();
      await fetch(`${API_CONFIG.BASE_URL}/message/message-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: activeChatId, message: messageText }),
      });
    } catch (err) { console.error(err); }
  };

  return {
    chats, setChats, isChatListOpen, setIsChatListOpen,
    activeChatId, setActiveChatId, chatInput, setChatInput,
    chatMessages, fetchChatUsers, handleChatSend,
    activeChatData: chats.find(c => c.id === activeChatId),
  };
};