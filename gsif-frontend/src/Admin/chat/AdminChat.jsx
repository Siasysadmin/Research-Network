import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../Layout/Layout";
import AdminUserProfile from "../porfile/AdminUserProfile";
import AdminGroupchat from "../porfile/AdminGroupDetails";
import GroupChat from "./AdminGoupchat";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";
import defaultAvatar from "../../assets/images/avatar.jpg";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

const Chats = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [groupChatKey, setGroupChatKey] = useState(0);

  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [activeNav, setActiveNav] = useState("chats");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);

  const addMenuRef = useRef(null);
  const groupMenuRef = useRef(null);
  const attachMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const imageAttachRef = useRef(null);
  const videoAttachRef = useRef(null);

  const activeChatIdRef = useRef(null);
  const chatsRef = useRef([]);
  const currentUserIdRef = useRef("");

  // Pop-up ko kholne aur band karne ke liye state
const [isPostModalOpen, setIsPostModalOpen] = useState(false);
const [selectedPostIdForPopup, setSelectedPostIdForPopup] = useState(null);

// State for post loader and detailed object
const [loadingPostData, setLoadingPostData] = useState(false);
const [popupPostData, setPopupPostData] = useState(null);
// 💡 Read More / Show Less toggle karne ke liye state
const [isExpanded, setIsExpanded] = useState(false);


const messagesContainerRef = useRef(null);
const shouldAutoScrollRef = useRef(true);
const prevMessageCountRef = useRef(0);


const fetchSinglePostDetails = async (postId) => {
  if (!postId) return;
  setLoadingPostData(true);
  setPopupPostData(null); 
  
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/post/get-posts-id/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    const result = await response.json();
    if (result.status && result.data) {
      setPopupPostData(result.data);
    }
  } catch (error) {
    console.error("Error fetching shared post:", error);
  } finally {
    setLoadingPostData(false);
  }
};


  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (Array.isArray(user) && user.length > 0) {
          return String(user[0].id || user[0].user_id || user[0].userId || "");
        }
        return String(user.id || user.user_id || user.userId || "");
      }
      return "";
    } catch (e) {
      return "";
    }
  };

  const [currentUserId] = useState(() => getCurrentUserId());


const activeChatData = chats.find((c) => String(c.id) === String(activeChatId));






useEffect(() => {
  const container = messagesContainerRef.current;

  if (!container) return;

  const handleScroll = () => {
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    shouldAutoScrollRef.current = isNearBottom;
  };

  container.addEventListener("scroll", handleScroll);

  return () => {
    container.removeEventListener("scroll", handleScroll);
  };
}, []);







useEffect(() => {
  if (!activeChatData?.messages) return;

  const currentMessageCount = activeChatData.messages.length;

  // first open par niche scroll
  if (prevMessageCountRef.current === 0) {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
    }, 100);
  }

  // sirf new message aaye aur user niche ho tabhi scroll
  else if (
    currentMessageCount > prevMessageCountRef.current &&
    shouldAutoScrollRef.current
  ) {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }

  prevMessageCountRef.current = currentMessageCount;
}, [activeChatData?.messages]);



useEffect(() => {
  prevMessageCountRef.current = 0;
}, [activeChatId]);




  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.user_type === "institute") {
          setUserName(u.institute_details?.institute_name || u.institute_name || u.name || "Institute");
        } else {
          setUserName(u.name || u.username || "User");
        }
        const profileImg = u.profile_image || u.avatar || u.profile_pic || null;
        if (profileImg) setUserAvatar(`${API_CONFIG.BASE_URL}/${profileImg}`);
      }
    } catch (e) {
      console.error("Error getting user info:", e);
    }
  }, []);

  const user = {
    name: userName,
    role: "Admin",
    avatar: userAvatar,
  };

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
  useEffect(() => { chatsRef.current = chats; }, [chats]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

  const fetchBlockedUserIds = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/account/get-blocked-users`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        const ids = data.data.map((u) => String(u.id));
        setBlockedUserIds(ids);
      }
    } catch (err) {
      console.error("Error fetching blocked users:", err);
    }
  }, []);

  useEffect(() => { fetchBlockedUserIds(); }, [fetchBlockedUserIds]);

  useEffect(() => {
    const newGroup = location.state?.newGroup;
    if (!newGroup || loading) return;
    setChats((prev) => {
      const alreadyExists = prev.some((c) => String(c.id) === String(newGroup.id));
      if (alreadyExists) return prev;
      return [newGroup, ...prev];
    });
    setActiveChatId(newGroup.id);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, loading, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) setShowAddMenu(false);
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target)) setShowGroupMenu(false);
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) setShowAttachMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const [usersRes, groupsRes] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}/user/get-all-users`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_CONFIG.BASE_URL}/group/get-groups`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          }),
        ]);

        const usersData = await usersRes.json();
        const groupsData = await groupsRes.json();

        let formattedUsers = [];
        const userList = usersData.data || usersData.users || (Array.isArray(usersData) ? usersData : null);

        if (userList) {
          formattedUsers = userList.map((user) => {
            let finalName = "";
            let finalType = "";
            if (user.user_type === "institute") {
              finalName = user.institute_details?.institute_name || user.name || "Unknown Institute";
              finalType = "Research Institute";
            } else {
              finalName = user.name || "Unknown Individual";
              finalType = "Individual";
            }
            let profileImg = null;
            if (user.user_type === "institute") {
              profileImg = user.profile_institute_details?.profile_image
                ? `${API_CONFIG.BASE_URL}/${user.profile_institute_details.profile_image}` : null;
            } else {
              profileImg = user.profile_individual_details?.profile_image
                ? `${API_CONFIG.BASE_URL}/${user.profile_individual_details.profile_image}` : null;
            }
            return {
              id: String(user.id || user.user_id || Math.random().toString()),
              name: finalName,
              isYou: String(user.id || user.user_id || "") === String(currentUserId),
              type: finalType,
              lastMsg: `Say hi to ${finalName}...`,
              isActive: false,
              isGroup: false,
              timestamp: 0,
              unreadCount: 0,
              avatars: [profileImg || defaultAvatar],
              messages: [],
              messagesLoaded: false,
            };
          });
        }

        let formattedGroups = [];
        if (groupsData.status && Array.isArray(groupsData.groups)) {
          formattedGroups = groupsData.groups.map((group) => {
            const profileUrl = group.profile ? `${API_CONFIG.BASE_URL}/${group.profile}` : null;
            return {
              id: `group_${group.group_id}`,
              groupId: String(group.group_id),
              name: group.group_name,
              isYou: false,
              type: `Group · ${group.total_members} member${group.total_members !== 1 ? "s" : ""}`,
              lastMsg: "Tap to open group chat",
              isActive: false,
              isGroup: true,
              isAdmin: group.is_admin === 1,
              timestamp: 0,
              unreadCount: 0,
              avatars: [profileUrl || defaultAvatar],
              messages: [],
              messagesLoaded: false,
            };
          });
        }

        setChats([...formattedGroups, ...formattedUsers]);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setChats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentUserId]);

  const fetchMessagesForChat = useCallback(async (chatId) => {
    if (!chatId) return;
    const token = getAuthToken();
    const uid = currentUserIdRef.current;
    const currentChats = chatsRef.current;
    const chatData = currentChats.find((c) => String(c.id) === String(chatId));
    if (!chatData || chatData.isGroup) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/message/message-get`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: chatId }),
      });
      const result = await response.json();
      if (result.status && result.data) {
        const formattedMessages = result.data.map((msg) => {
          let extractedFile = null;
          if (msg.file_path) {
            extractedFile = msg.file_path;
          } else if (msg.files && Array.isArray(msg.files) && msg.files.length > 0) {
            extractedFile = msg.files[0];
          }
          let safeFileType = msg.file_type;
          if (!safeFileType && extractedFile) {
            safeFileType = extractedFile.toLowerCase().endsWith(".mp4") ? "video" : "image";
          }
          return {
            id: msg.id,
            sender: String(msg.sender_id) === uid ? "(YOU)" : null,
            senderAvatar: String(msg.sender_id) === uid
              ? `https://ui-avatars.com/api/?name=You&background=00ff85&color=000` : null,
            time: new Date(msg.created_at).toLocaleTimeString("en-IN", {
              hour12: true, hour: "numeric", minute: "2-digit",
            }),
            timestamp: new Date(msg.created_at).getTime(),
            text: msg.message,
            isMine: String(msg.sender_id) === uid,
            isSystem: false,
            file: extractedFile ? { path: extractedFile, type: safeFileType } : null,
          };
        });

        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (String(chat.id) !== String(chatId)) return chat;
            const msgs = formattedMessages.map((msg) => ({
              ...msg,
              sender: msg.isMine ? "(YOU)" : chat.name,
              senderAvatar: msg.isMine
                ? `https://ui-avatars.com/api/?name=You&background=00ff85&color=000`
                : chat.avatars[0],
            }));
            const latestMsg = msgs[msgs.length - 1];
            
            // 💡 FIXED: Chat open karne par sidebar ka text clean rakhne ke liye check
            let cleanLastMsgText = chat.lastMsg;
            if (latestMsg) {
              const rawMessageText = latestMsg.text || "";
              const isSharedPost = String(rawMessageText).toUpperCase().includes("POST_SHARE_ID:");
              const cleanText = isSharedPost ? "Shared a post 📝" : (rawMessageText || "Sent an attachment");
              
              cleanLastMsgText = latestMsg.isMine ? `You: ${cleanText}` : cleanText;
            }

            const unreadCount = result.data.filter(
              (m) => String(m.sender_id) !== uid && String(m.receiver_id) === uid && String(m.is_seen) === "0",
            ).length;
            
            return {
              ...chat,
              messages: msgs,
              messagesLoaded: true,
              lastMsg: cleanLastMsgText, // Ab yahan filter kiya hua saaf text jayega
              time: latestMsg?.time || chat.time,
              timestamp: latestMsg?.timestamp || chat.timestamp,
              unreadCount: activeChatIdRef.current === chatId ? 0 : unreadCount,
            };
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  useEffect(() => {
    if (!initialLoadComplete || chats.length === 0) return;
    const alreadyLoaded = chats.some((c) => c.messagesLoaded);
    if (alreadyLoaded) return;
    const activeChat = chats.find((c) => String(c.id) === String(activeChatId));
    if (activeChat && !activeChat.isGroup && !activeChat.messagesLoaded) {
      fetchMessagesForChat(activeChat.id);
    }
    const timer = setTimeout(() => {
      const otherChats = chats
        .filter((c) => !c.isGroup && !c.messagesLoaded && String(c.id) !== String(activeChatId))
        .slice(0, 5);
      Promise.allSettled(otherChats.map((chat) => fetchMessagesForChat(chat.id)));
    }, 1000);
    return () => clearTimeout(timer);
  }, [initialLoadComplete, chats.length, activeChatId, fetchMessagesForChat]);

  useEffect(() => {
    if (chats.length === 0) return;
    const activePollInterval = setInterval(() => {
      const activeId = activeChatIdRef.current;
      if (activeId) fetchMessagesForChat(activeId);
    }, 3000);

    const backgroundPollInterval = setInterval(async () => {
      const token = getAuthToken();
      const uid = currentUserIdRef.current;
      const currentChats = chatsRef.current;
      const activeId = activeChatIdRef.current;
      const otherChats = currentChats.filter((c) => !c.isGroup && String(c.id) !== String(activeId));
      if (otherChats.length === 0) return;

      const results = await Promise.allSettled(
        otherChats.map((chat) =>
          fetch(`${API_CONFIG.BASE_URL}/message/message-get`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ receiver_id: chat.id }),
          }).then((r) => r.json()),
        ),
      );

      let hasUpdates = false;
      const updates = {};
      results.forEach((result, idx) => {
        if (result.status !== "fulfilled") return;
        const data = result.value;
        const chat = otherChats[idx];
        if (!data.status || !data.data) return;
        const msgs = data.data;
        const unreadCount = msgs.filter(
          (m) => String(m.sender_id) !== uid && String(m.receiver_id) === uid && String(m.is_seen) === "0",
        ).length;
        // 💡 FIXED: Sidebar text cleaning filter for shared posts under active monitoring
        const latestMsg = msgs[msgs.length - 1];
        let lastMsgText = null;

        if (latestMsg) {
          const rawMessageText = latestMsg.message || "";
          const isSharedPost = String(rawMessageText).toUpperCase().includes("POST_SHARE_ID:");
          const cleanText = isSharedPost ? "Shared a post 📝" : (rawMessageText || "Sent an attachment");

          lastMsgText = String(latestMsg.sender_id) === uid
            ? `You: ${cleanText}`
            : cleanText;
        }
        const lastTimestamp = latestMsg ? new Date(latestMsg.created_at).getTime() : 0;
        if (chat.unreadCount !== unreadCount || chat.timestamp !== lastTimestamp) {
          hasUpdates = true;
          updates[chat.id] = { unreadCount, lastMsgText, lastTimestamp };
        }
      });

      if (hasUpdates) {
        setChats((prevChats) => {
          const updated = prevChats.map((chat) => {
            const update = updates[chat.id];
            if (!update) return chat;
            return {
              ...chat,
              unreadCount: update.unreadCount,
              lastMsg: update.lastMsgText || chat.lastMsg,
              timestamp: update.lastTimestamp || chat.timestamp,
            };
          });
          return [...updated].sort((a, b) => b.timestamp - a.timestamp);
        });
      }
    }, 5000);

    return () => {
      clearInterval(activePollInterval);
      clearInterval(backgroundPollInterval);
    };
  }, [chats.length, fetchMessagesForChat]);

  const handleChatClick = async (chatId) => {
    setActiveChatId(chatId);
    setShowProfile(false);
    setChats((prevChats) =>
      prevChats.map((c) => String(c.id) === String(chatId) ? { ...c, unreadCount: 0 } : c),
    );
    const chatData = chatsRef.current.find((c) => String(c.id) === String(chatId));
    if (chatData?.isGroup) return;
    try {
      const token = getAuthToken();
      await fetch(`${API_CONFIG.BASE_URL}/message/message-seen`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sender_id: chatId }),
      });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
    fetchMessagesForChat(chatId);
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({ file, type });
      setShowAttachMenu(false);
    }
    e.target.value = null;
  };

  const handleSendMessage = async () => {
    if (!activeChatId) return;
    if (!messageText.trim() && !selectedFile) return;
    const textToSend = messageText.trim();
    const fileToSend = selectedFile?.file;
    const fileTypeToSend = selectedFile?.type;
    setMessageText("");
    setSelectedFile(null);
    const currentTime = new Date();
    let localPreviewUrl = null;
    if (fileToSend) localPreviewUrl = URL.createObjectURL(fileToSend);

    const newMsg = {
      id: `temp-${Date.now()}`,
      sender: "(YOU)",
      senderAvatar: `https://ui-avatars.com/api/?name=You&background=00ff85&color=000`,
      time: currentTime.toLocaleTimeString("en-IN", { hour12: true, hour: "numeric", minute: "2-digit" }),
      timestamp: currentTime.getTime(),
      text: textToSend,
      isMine: true,
      isSystem: false,
      localFile: fileToSend ? { url: localPreviewUrl, type: fileTypeToSend } : null,
    };

    setChats((prevChats) => {
      const updated = prevChats.map((chat) => {
        if (String(chat.id) !== String(activeChatId)) return chat;
        //  Isse replace kijiye:
const isSharedPostMsg = String(textToSend).toUpperCase().includes("POST_SHARE_ID:");
const dynamicSidebarText = isSharedPostMsg ? "Shared a post 📝" : (textToSend || "Sent an attachment");

return {
  ...chat,
  messages: [...(chat.messages || []), newMsg],
  lastMsg: `You: ${dynamicSidebarText}`,
  time: newMsg.time,
          timestamp: newMsg.timestamp,
          unreadCount: 0,
        };
      });
      return [...updated].sort((a, b) => b.timestamp - a.timestamp);
    });

    try {
      const token = getAuthToken();
      let response;
      if (fileToSend) {
        const formData = new FormData();
        formData.append("receiver_id", activeChatId);
        formData.append("message", textToSend || "");
        formData.append("file", fileToSend);
        response = await fetch(`${API_CONFIG.BASE_URL}/message/message-send`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        response = await fetch(`${API_CONFIG.BASE_URL}/message/message-send`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ receiver_id: activeChatId, message: textToSend }),
        });
      }
      const result = await response.json();
      if (!result.status) toast.error("Failed to send message");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  const handleClearChat = async () => {
    if (!activeChatId) return;
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/message/message-clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ other_user_id: activeChatId }),
      });
      const result = await response.json();
      if (result.status) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (String(chat.id) !== String(activeChatId)) return chat;
            return { ...chat, messages: [], lastMsg: `Say hi to ${chat.name}...`, unreadCount: 0 };
          }),
        );
        setShowGroupMenu(false);
        toast.success("Chat cleared successfully");
      } else {
        toast.error("Failed to clear chat");
      }
    } catch (error) {
      toast.error("An error occurred while clearing the chat");
    }
  };

  const handleGroupClearChat = async () => {
    if (!activeChatId || !activeChatData?.isGroup) return;
    try {
      const token = getAuthToken();
      const groupId = activeChatData.groupId;
      const response = await fetch(`${API_CONFIG.BASE_URL}/group/group-clear-chat/${groupId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.status) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (String(chat.id) !== String(activeChatId)) return chat;
            return { ...chat, lastMsg: "Chat cleared", timestamp: 0 };
          }),
        );
        setGroupChatKey((prev) => prev + 1);
        setShowGroupMenu(false);
        toast.success("Group chat cleared successfully");
      } else {
        toast.error("Failed to clear group chat");
      }
    } catch (error) {
      toast.error("An error occurred while clearing the group chat");
    }
  };

  const filteredChats = (searchQuery.trim()
    ? chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats
  ).filter((chat) => chat.isGroup || !blockedUserIds.includes(String(chat.id)));

  

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
    
{/* 👇 CHAT ME POST DIKHANE VALA LIVE MODAL POP-UP (UPDATED WIDTH & DUAL MODE) */}
{isPostModalOpen && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
    {/* Width badhakar max-w-2xl kar di hai aur light/dark mode dono ke liye colors set hain */}
    <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-left transition-colors duration-200">
      
      {/* Modal Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
        <div className="flex items-center gap-2 text-[#00ff85]">
          <span className="material-symbols-outlined text-lg">description</span>
          <h3 className="font-bold text-sm tracking-wide uppercase text-gray-900 dark:text-white">Shared Post Details</h3>
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
            <span className="text-xs text-gray-500 dark:text-slate-500 font-mono">FETCHING POST DATA...</span>
          </div>
        ) : popupPostData ? (
          /* Actual Data Loaded State */
          <div className="flex flex-col gap-4">
            
            {/* 1. AUTHOR NAME / TITLE (Pele Name Aaye) */}
            <div>
              <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block mb-0.5">Posted By</span>
              <h4 className="text-gray-900 dark:text-white font-extrabold text-lg tracking-tight">
                {popupPostData.institute_name || popupPostData.name || "No Name Available"}
              </h4>
            </div>

            {/* 2. POST TEXT / CONTENT WITH DYNAMIC INLINE LINE CLAMP */}
<div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5">
  <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block mb-1.5">Description</span>
  
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
        // 💡 Video ya image dono me se kuch bhi hone par 3 lines dikhayega, varna 11 lines
        WebkitLineClamp: (popupPostData.image && popupPostData.image.trim() !== "") || (popupPostData.video && popupPostData.video.trim() !== "") ? 3 : 11,
        overflow: "hidden"
      }
    : {}
}
      >
        {popupPostData.post_text}
      </p>
      
      {/* Dynamic Read More / Show Less Button logic */}
      {((popupPostData.image && popupPostData.image.trim() !== "" && popupPostData.post_text.length > 150) || 
        ((!popupPostData.image || popupPostData.image.trim() === "") && popupPostData.post_text.length > 400)) && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-bold text-[#00ff85] hover:underline flex items-center gap-0.5"
        >
          {isExpanded ? (
            <>Show Less <span className="material-symbols-outlined text-xs">expand_less</span></>
          ) : (
            <>Read More <span className="material-symbols-outlined text-xs">expand_more</span></>
          )}
        </button>
      )}
    </div>
  ) : (
    <p className="text-gray-400 dark:text-slate-500 text-xs italic">No text description provided for this post.</p>
  )}
</div>

           {/* 3. 💡 FIXED: POST MEDIA CONTAINER (Handles both Images and Videos dynamically) */}
{((popupPostData.image && popupPostData.image.trim() !== "") || (popupPostData.video && popupPostData.video.trim() !== "")) && (
  <div className="w-full border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/40">
    <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block p-3 pb-0">
      Attached Media
    </span>
    <div className="p-3">
      {(() => {
        // Find if a video key exists or if the image path points to a video file
        const mediaPath = popupPostData.video || popupPostData.image || "";
        const cleanPath = mediaPath.replace(/^\//, "");
        const fullMediaUrl = `${API_CONFIG.BASE_URL}/${cleanPath}`;
        
        // Dynamic detection based on file extensions
        const isVideo = 
          popupPostData.video || 
          /\.(mp4|webm|ogg|mov|mkv)($|\?)/i.test(cleanPath);

        if (isVideo) {
          return (
            <video 
              src={fullMediaUrl} 
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-80 object-contain rounded-lg bg-black/10 dark:bg-[#1a1a1a] outline-none shadow-sm"
            >
              Your browser does not support the video tag.
            </video>
          );
        } else {
          return (
            <img 
              src={fullMediaUrl} 
              alt="Shared Content" 
              className="w-full max-h-80 object-contain rounded-lg bg-gray-50 dark:bg-[#1a1a1a]"
              onError={(e) => {
                // If rendering fails entirely, hide container safely
                e.target.parentNode.parentNode.style.display = 'none';
              }}
            />
          );
        }
      })()}
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
      {/* ✅ FIX: h-[calc(100vh-80px)] hataya, ab flex-1 h-full use ho raha hai */}
      <div className="flex-1 h-full overflow-hidden flex flex-col font-inter bg-gray-50 dark:bg-[#0d0f0e] w-full">
        <div className="flex flex-1 p-3 lg:p-4 gap-4 lg:gap-6 h-full min-h-0 max-w-[1800px] mx-auto w-full bg-gray-50 dark:bg-[#0d0f0e]">

          {/* LEFT SIDEBAR */}
          <div className={`${activeChatId ? "hidden md:flex" : "flex"} w-full md:w-[340px] lg:w-[350px] flex-col bg-white dark:bg-[#1a1c1b] rounded-2xl border border-gray-200 dark:border-[#3b4b3d]/30 shrink-0 shadow-lg min-h-0 h-full`}>
            <div className="p-4 lg:p-5 flex items-center justify-between border-b border-gray-200 dark:border-[#3b4b3d]/20 relative shrink-0">
              <h2 className="text-xl lg:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Active Feeds
              </h2>
              <div className="relative flex items-center" ref={addMenuRef}>
                {showAddMenu && (
                  <div
                    onClick={() => navigate("/admin/CreateGroup")}
                    className="absolute right-full top-0 mr-3 w-48 bg-white dark:bg-[#1a1c1b] border border-gray-200 dark:border-[#3b4b3d]/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn"
                  >
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#3b4b3d]/20 hover:text-black dark:hover:text-white transition-all text-sm font-bold">
                      <MaterialIcon name="group_add" className="text-[18px]" /> NEW GROUP
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-10 h-10 bg-[#00ff85] text-[#003919] rounded-xl flex items-center justify-center hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,255,133,0.3)]"
                >
                  <MaterialIcon name="add_comment" className="text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                </button>
              </div>
            </div>

            <div className="px-3 pt-3 pb-2 shrink-0">
              <div className="flex items-center bg-gray-100 dark:bg-[#121413] border border-gray-200 dark:border-[#3b4b3d]/40 rounded-full px-4 py-2">
                <MaterialIcon name="search" className="text-slate-500 text-[18px] mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none focus:ring-0 focus:border-transparent"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-black dark:hover:text-white transition-colors ml-1 shrink-0">
                    <MaterialIcon name="close" className="text-[16px]" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 lg:p-3 space-y-1.5 hide-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff85]"></div>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs">
                  {searchQuery ? "NO RESULTS FOUND" : "NO USERS FOUND"}
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className={`group cursor-pointer p-3 lg:p-3.5 rounded-xl transition-all relative ${
                      String(activeChatId) === String(chat.id)
                        ? "bg-green-50 dark:bg-[#121413] border-l-4 border-l-[#00ff85] border-y border-r border-green-200 dark:border-[#3b4b3d]/20 shadow-sm"
                        : "border border-transparent hover:bg-gray-100 dark:hover:bg-[#121413]/50"
                    }`}
                  >
                    <div className="flex gap-3 lg:gap-4 items-center">
                      <div className="flex items-center shrink-0 relative">
                        <img
                          className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border border-gray-200 dark:border-transparent"
                          src={chat.avatars[0]}
                          alt={chat.name}
                          onError={(e) => { e.target.src = defaultAvatar; }}
                        />
                        {chat.isGroup && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#00ff85] rounded-full flex items-center justify-center">
                            <MaterialIcon name="group" className="text-[9px] text-[#003919]" style={{ fontSize: "9px" }} />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex justify-between items-start">
                        <div className="min-w-0 pr-2 flex-1">
                          <h4 className={`text-sm font-bold truncate flex items-center gap-1.5 ${String(activeChatId) === String(chat.id)
  ? "text-[#00ff85]"
  : "text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-[#e2e3e0]"
}`}>
                            <span className="truncate">{chat.name}</span>
                            {chat.isYou && (
                              <span className="shrink-0 text-[9px] font-mono font-normal px-1.5 py-0.5 rounded-full bg-[#00ff85]/10 text-[#00ff85] border border-[#00ff85]/30 normal-case tracking-normal">
                                You
                              </span>
                            )}
                          </h4>
                          <p className={`text-[11px] lg:text-xs truncate mt-1 ${String(activeChatId) === String(chat.id)
  ? "text-gray-700 dark:text-[#e2e3e0]"
  : "text-slate-500"
}`}>
                            {chat.lastMsg}
                          </p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 pl-2">
                          <span className={`text-[9px] lg:text-[10px] font-mono ${chat.unreadCount > 0 ? "text-[#00ff85]" : "text-slate-500"}`}>
                            {chat.time}
                          </span>
                          {chat.unreadCount > 0 && (
                            <span className="bg-[#00ff85] text-[#0d0f0e] text-[9px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full mt-1.5 shadow-[0_0_8px_rgba(0,255,133,0.5)]">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT CHAT WINDOW */}
          <div className={`${activeChatId ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white dark:bg-[#0d0f0e] rounded-2xl overflow-hidden min-w-0 relative h-full`}>
            {activeChatData ? (
              showProfile ? (
                activeChatData.isGroup ? (
                  <AdminGroupchat group={activeChatData} onClose={() => setShowProfile(false)} />
                ) : (
                  <AdminUserProfile user={activeChatData} onClose={() => setShowProfile(false)} />
                )
              ) : (
                <>
                  <div
                    onClick={() => setShowProfile(true)}
                    className="h-14 lg:h-16 border-b border-gray-200 dark:border-[#3b4b3d]/30 px-4 lg:px-6 flex items-center justify-between shrink-0 bg-white dark:bg-[#0d0f0e] cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChatId(null);
                        }}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      >
                        <MaterialIcon
                          name="arrow_back"
                          className="text-gray-700 dark:text-white"
                        />
                      </button>
                      <div className="relative">
                        <img
                          className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white dark:border-[#1a1c1b] z-10 object-cover"
                          src={activeChatData.avatars[0]}
                          alt={activeChatData.name}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChatData.name)}&background=1a1c1b&color=00ff85`; }}
                        />
                        {activeChatData.isGroup && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#00ff85] rounded-full flex items-center justify-center">
                            <MaterialIcon name="group" className="text-[#003919]" style={{ fontSize: "9px" }} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white truncate">{activeChatData.name}</h3>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{activeChatData.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 lg:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div className="relative flex items-center justify-center h-full" ref={groupMenuRef}>
                        {showGroupMenu && (
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-white dark:bg-[#1a1c1b] border border-gray-200 dark:border-[#3b4b3d]/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                            <button
                              onClick={activeChatData.isGroup ? handleGroupClearChat : handleClearChat}
                              className="flex items-center gap-3 px-5 py-3 text-[#ffb4ab] hover:bg-[#93000a]/20 transition-all text-sm font-bold uppercase tracking-wider whitespace-nowrap"
                            >
                              <MaterialIcon name="delete_sweep" className="text-[18px]" /> CLEAR CHAT
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => setShowGroupMenu(!showGroupMenu)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${showGroupMenu
  ? "bg-green-100 dark:bg-[#3b4b3d]/30 text-gray-900 dark:text-white"
  : "hover:bg-gray-100 dark:hover:bg-[#3b4b3d]/20 text-slate-500 dark:text-slate-300"
}`}
                        >
                          <MaterialIcon name="more_vert" className="text-lg lg:text-xl" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {activeChatData.isGroup ? (
                    <GroupChat
                      key={groupChatKey}
                      group={activeChatData}
                      currentUserId={currentUserId}
                      onLastMessage={(groupId, lastMsg, timestamp, time) => {
                        setChats((prev) => {
                          const updated = prev.map((c) =>
                            String(c.id) === String(groupId) ? { ...c, lastMsg, timestamp, time } : c,
                          );
                          return [...updated].sort((a, b) => b.timestamp - a.timestamp);
                        });
                      }}
                    />
                  ) : (
                    <>
   {/* 👇 CHAT MESSAGES WINDOW CONTAINER (CRASH PROOF VERSION) */}
<div
  ref={messagesContainerRef}
  className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-3 lg:space-y-4 hide-scrollbar bg-gray-50 dark:bg-[#121413]/30 min-h-0"
>
  {/* 👇 Sabse pehle strict check lagayein ki data sahi se aa raha hai ya nahi */}
  {!activeChatData || !activeChatData.messages || activeChatData.messages.length === 0 ? (
    <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm uppercase italic opacity-40">
      SAY HI TO START MESSAGING
    </div>
  ) : (
    <>
      {/* Safe Map loop chalayein */}
      {activeChatData.messages.map((msg) => {
        if (!msg) return null; // Breakage protection
        return (
          <div
            key={msg.id || Math.random().toString()}
            className={`flex ${msg.isMine ? "flex-row-reverse" : ""} items-start gap-2 sm:gap-3 max-w-[92%] sm:max-w-[85%] ${msg.isMine ? "ml-auto" : ""}`}
          >
            <div className={`space-y-1 ${msg.isMine ? "text-right" : ""} min-w-0`}>
              <div className={`flex items-baseline gap-2 ${msg.isMine ? "justify-end" : ""}`}>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${msg.isMine ? "text-[#00ff85]" : "text-gray-900 dark:text-white"}`}>
                  {msg.sender || "User"}
                </span>
                <span className="text-[9px] font-mono text-slate-500">{msg.time || ""}</span>
              </div>
              
              <div className={`px-3 sm:px-4 py-2.5 lg:py-3 rounded-2xl text-sm leading-relaxed inline-block max-w-full text-left ${
                msg.isMine
                  ? "bg-green-50 dark:bg-[#0d0f0e] text-gray-900 dark:text-white border border-[#00ff85]/30 rounded-tr-none"
                  : "bg-white dark:bg-[#1e201f] text-gray-800 dark:text-[#e2e3e0] border border-gray-200 dark:border-white/5 rounded-tl-none"
              }`}>
                
                {/* Local attachments previews */}
                {msg.localFile && (
                  msg.localFile.type === "image" || msg.localFile.type?.includes("image") ? (
                    <img src={msg.localFile.url} alt="attachment preview" className="max-w-full sm:max-w-[250px] rounded-lg mb-2 object-cover border border-white/10" />
                  ) : (
                    <video src={msg.localFile.url} controls className="max-w-full sm:max-w-[250px] rounded-lg mb-2 bg-black border border-white/10" />
                  )
                )}

                {/* Database attachments views */}
                {msg.file && msg.file.path && (
                  (() => {
                    const cleanBaseUrl = (API_CONFIG?.BASE_URL || "").replace(/\/$/, "");
                    const cleanPath = msg.file.path.replace(/^\//, "");
                    const safeUrl = msg.file.path.startsWith("http") ? msg.file.path : `${cleanBaseUrl}/${cleanPath}`;
                    const isImg = msg.file.type === "image" || msg.file.path.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i);
                    const isVid = msg.file.type === "video" || msg.file.path.match(/\.(mp4|webm|ogg|mov)$/i);
                    if (isImg) return <img src={safeUrl} alt="attachment" className="max-w-full sm:max-w-[250px] rounded-lg mb-2 object-cover border border-white/10" />;
                    else if (isVid) return <video src={safeUrl} controls className="max-w-full sm:max-w-[250px] rounded-lg mb-2 bg-black border border-white/10" />;
                    else return <a href={safeUrl} target="_blank" rel="noreferrer" className="text-[#00ff85] underline text-xs mb-2 block font-bold">📂 View Attachment</a>;
                  })()
                )}

                {/* Shared Post condition check or Normal message logic */}
                {msg.text && String(msg.text).includes("POST_SHARE_ID:") ? (
                  (() => {
                    const extractedId = String(msg.text).split("POST_SHARE_ID:")[1] || "53";
                    return (
                      <div className="p-3 bg-green-50 dark:bg-[#0d0f0e] border border-[#00ff85]/30 rounded-xl min-w-[220px] max-w-xs flex flex-col gap-2 my-1 shadow-md text-left animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-green-200 dark:border-white/10 pb-1.5">
                          <span className="material-symbols-outlined text-emerald-500 dark:text-emerald-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            share
                          </span>
                          <span className="text-[11px] font-mono tracking-wider text-[#00ff85] uppercase font-bold">Shared Post</span>
                        </div>
                        <div className="text-xs text-gray-700 dark:text-slate-300">
  View shared post.
</div>
                        <button 
                          onClick={() => {
                            if (typeof setSelectedPostIdForPopup === "function") setSelectedPostIdForPopup(extractedId); 
                            if (typeof setIsPostModalOpen === "function") setIsPostModalOpen(true);
                            if (typeof fetchSinglePostDetails === "function") fetchSinglePostDetails(extractedId);
                          }}
                          className="w-full mt-1 py-1.5 px-3 bg-[#00ff85] hover:bg-[#00e676] hover:scale-[1.02] text-[#003919] font-bold text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-1 shadow-lg active:scale-95"
                        >
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          View Post
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* 💡 TARGET LOWER ANCHOR (Yahan safe execution check laga diya hai) */}
      <div ref={messagesEndRef} className="h-1 w-full clear-both" />
    </>
  )}
</div>

                      <div className="px-4 lg:px-6 pb-4 pt-3 bg-white dark:bg-[#0d0f0e] shrink-0">
                        {selectedFile && (
                          <div className="w-full flex mb-2 pl-4">
                            <div className="bg-white dark:bg-[#1a1c1b] border border-gray-200 dark:border-[#3b4b3d] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-lg">
                              <MaterialIcon name={selectedFile.type === "image" ? "image" : "videocam"} className="text-[#00ff85] text-[16px]" />
                              <span className="text-[11px] text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px]">{selectedFile.file.name}</span>
                              <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-400 ml-1 flex items-center">
                                <MaterialIcon name="close" className="text-[14px]" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#0d0f0e] border border-gray-300 dark:border-[#3b4b3d]/50 rounded-[24px] px-4 py-2">
                            <div className="relative self-end mb-1 flex items-center mr-2" ref={attachMenuRef}>
                              {showAttachMenu && (
                                <div className="absolute bottom-full left-0 mb-4 w-40 bg-white dark:bg-[#1a1c1b] border border-gray-200 dark:border-[#3b4b3d]/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                                  <button
                                    onClick={() => { setShowAttachMenu(false); imageAttachRef.current?.click(); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#3b4b3d]/20 hover:text-black dark:hover:text-white transition-all text-sm font-bold"
                                  >
                                    <MaterialIcon name="image" className="text-[18px]" /> Images
                                  </button>
                                  <div className="h-px w-full bg-gray-200 dark:bg-[#3b4b3d]/30"></div>
                                  <button
                                    onClick={() => { setShowAttachMenu(false); videoAttachRef.current?.click(); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#3b4b3d]/20 hover:text-black dark:hover:text-white transition-all text-sm font-bold"
                                  >
                                    <MaterialIcon name="videocam" className="text-[18px]" /> Videos
                                  </button>
                                </div>
                              )}
                              <span onClick={() => setShowAttachMenu(!showAttachMenu)}>
                                <MaterialIcon name="attach_file" className="text-slate-500 hover:text-[#00ff85] transition-colors text-lg cursor-pointer block" />
                              </span>
                              <input type="file" accept="image/*" className="hidden" ref={imageAttachRef} onChange={(e) => handleFileSelect(e, "image")} />
                              <input type="file" accept="video/*" className="hidden" ref={videoAttachRef} onChange={(e) => handleFileSelect(e, "video")} />
                            </div>

                            <textarea
                              ref={messageInputRef}
                              rows="1"
                              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-[#3b4b3d] font-inter resize-none py-1.5 max-h-[120px] overflow-y-auto custom-scrollbar"
                              placeholder="Type a message..."
                              value={messageText}
                              onChange={(e) => {
                                setMessageText(e.target.value);
                                e.target.style.height = "auto";
                                const newHeight = Math.min(e.target.scrollHeight, 120);
                                e.target.style.height = `${newHeight}px`;
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                  e.target.style.height = "auto";
                                }
                              }}
                              style={{ border: "none", boxShadow: "none" }}
                            />
                          </div>
                          <button
                            onClick={handleSendMessage}
                            className="w-10 h-10 lg:w-[48px] lg:h-[48px] flex items-center justify-center rounded-full bg-[#00ff85] text-[#003919] shrink-0 hover:brightness-110 active:scale-95 transition-all shadow-lg"
                          >
                            <MaterialIcon name="send" className="text-lg lg:text-xl" style={{ fontVariationSettings: "'FILL' 1" }} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm tracking-widest opacity-50 italic">
                SELECT A CHAT TO START MONITORING
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        input, input:focus, input:active {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b4b3d; border-radius: 10px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #3b4b3d transparent; }
      `}</style>
    </Layout>
  );
};

export default Chats;