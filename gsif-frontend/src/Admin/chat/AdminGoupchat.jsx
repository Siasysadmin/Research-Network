import React, { useState, useEffect, useRef, useCallback } from "react";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";
import defaultAvatar from "../../assets/images/avatar.jpg";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

const GroupChat = ({ group, currentUserId, onLastMessage }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false); // ✅ NEW

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const attachBtnRef = useRef(null);
  const pollingRef = useRef(null);
  const hasFetchedOnce = useRef(false);
  const messagesContainerRef = useRef(null); // ✅ scroll container ref
  const shouldAutoScrollRef = useRef(true);

  const groupId = group.groupId || String(group.id).replace("group_", "");
  const chatId = group.id;

  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const uid = String(currentUserId);

  // 💡 CHAT ME POST DIKHANE VALE LIVE POPUP KE LIYE STATES
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPostIdForPopup, setSelectedPostIdForPopup] = useState(null);
  const [popupPostData, setPopupPostData] = useState(null);
  const [loadingPostData, setLoadingPostData] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  


 // 💡 FIXED: Shared post ke click par data pull karne ka dynamic modal hit (Super Robust)
  const handleOpenPostModal = async (postId) => {
    // strict check: agar split ke baad koi extra space ya string issues hon
    if (!postId || String(postId).trim() === "" || String(postId) === "null" || String(postId) === "undefined") {
      toast.error("Invalid or Empty Post ID");
      console.error("=== ERROR: Post ID is not valid ===", postId);
      return;
    }
    
    const cleanPostId = String(postId).trim();

    setIsPostModalOpen(true);
    setLoadingPostData(true);
    setSelectedPostIdForPopup(cleanPostId);
    setIsExpanded(false);

    try {
      const token = getAuthToken();
      
      // We will try GET first, but with full URL logging
      const url = `${API_CONFIG.BASE_URL}/post/get-posts-id/${cleanPostId}`;
      console.log("=== FETCHING POST FROM URL ===", url);

      const response = await fetch(url, {
        method: "GET", // 💡 Note: Agar backend pe yeh route POST hai, toh ise "POST" kar dena
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Pehle check karein response status thik hai ya nahi
      if (!response.ok) {
        console.error(`=== SERVER RETURNED STATUS HTTP: ${response.status} ===`);
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("=== POPUP POST DATA API RESPONSE ===", result);

      if (result && (result.status === true || result.status === "true" || result.status === 1 || result.status === "success")) {
        const targetData = result.data || result.post || result;
        setPopupPostData(targetData);
      } else if (result && result.id) {
        // Agar direct bina status ke post object hi aa gaya ho
        setPopupPostData(result);
      } else {
        setPopupPostData(null);
        toast.warn(result.message || "Post data not found on server");
      }
    } catch (error) {
      console.error("=== DIAGNOSTIC ERROR FETCHING POST ===", error);
      setPopupPostData(null);
      toast.error("Failed to load post details");
    } finally {
      setLoadingPostData(false);
    }
  };




  useEffect(() => {
  const container = messagesContainerRef.current;

  if (!container) return;

  const handleScroll = () => {
    const isNearBottom =
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      120;

    shouldAutoScrollRef.current = isNearBottom;
  };

  container.addEventListener("scroll", handleScroll);

  return () => {
    container.removeEventListener("scroll", handleScroll);
  };
}, []);





  // ✅ Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        attachBtnRef.current &&
        !attachBtnRef.current.contains(e.target)
      ) {
        setShowAttachMenu(false);
      }
    };
    if (showAttachMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttachMenu]);

  // ✅ Handle file selection (photo or video)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 50MB.");
      return;
    }

    setSelectedFile(file);
    setShowAttachMenu(false);

    if (file.type.startsWith("image/")) {
      setFilePreview({ type: "image", url: URL.createObjectURL(file), name: file.name });
    } else if (file.type.startsWith("video/")) {
      setFilePreview({ type: "video", url: URL.createObjectURL(file), name: file.name });
    } else {
      setFilePreview({ type: "other", name: file.name });
    }

    e.target.value = "";
  };

  // ✅ Remove selected file
  const handleRemoveFile = () => {
    if (filePreview?.url) URL.revokeObjectURL(filePreview.url);
    setSelectedFile(null);
    setFilePreview(null);
  };

const formatMessage = useCallback(
    (msg) => {
      // 💡 FIXED: Strict key fallback check lagaya taaki sender_id ya senderId dono me se kuch bhi aaye toh match ho jaye
      const currentSenderId = msg.sender_id || msg.senderId || "";
      const isMine = String(currentSenderId) === uid;

      const profileImg = msg.sender_profile_image || msg.sender_image
        ? `${API_CONFIG.BASE_URL}/${msg.sender_profile_image || msg.sender_image}`
        : defaultAvatar;

      const messageDate = msg.created_at ? new Date(msg.created_at) : new Date();
      const now = new Date();
      const isToday = messageDate.toDateString() === now.toDateString();

      let timeString = messageDate.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });

      if (msg.created_at && !isToday) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = messageDate.toDateString() === yesterday.toDateString();
        if (isYesterday) {
          timeString = `Yesterday ${timeString}`;
        } else {
          timeString = `${messageDate.toLocaleDateString()} ${timeString}`;
        }
      } else if (!msg.created_at) {
        timeString = "Just Now";
      }

      // 💡 FIXED: Raw text backup check kiya kyuki group me message key 'message' ya 'text' ho sakti hai
      const rawText = msg.message || msg.text || "";

      return {
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        isMine,
        sender: isMine ? "(YOU)" : msg.sender_name || msg.name || "User",
        text: String(rawText).trim(), // String casting taaki components fail na hon
        time: timeString,
        timestamp: messageDate.getTime(),
        filePath: msg.file_path || msg.file ? `${API_CONFIG.BASE_URL}/${(msg.file_path || msg.file).replace(/^\//, "")}` : null,
        fileType: msg.file_type || msg.fileType || null,
      };
    },
    [uid]
  );



  const fetchGroupMessages = useCallback(
    async (showLoader = false) => {
      const token = getAuthToken();
      if (!token) return;

      if (showLoader && !hasFetchedOnce.current) {
        setLoading(true);
      }

      try {
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/group/group-messages-get/${groupId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await res.json();

        if (result.status && Array.isArray(result.data)) {
          // 💡 FIXED: message format fallback validation loop
          const formatted = result.data.map(formatMessage);
          const sortedMessages = formatted.sort((a, b) => a.timestamp - b.timestamp);

          setMessages(sortedMessages);

          if (sortedMessages.length > 0 && onLastMessage) {
            const lastMsg = sortedMessages[sortedMessages.length - 1];
            
            // 💡 FIXED: Dono keys (text aur message) ko check karega taaki sidebar text strict clean ho sake
            const rawTextContent = lastMsg.message || lastMsg.text || "";
            const isSharedPost = String(rawTextContent).toUpperCase().includes("POST_SHARE_ID:");
            const cleanText = isSharedPost ? "Shared a post 📝" : rawTextContent;

            onLastMessage(
              chatId,
              lastMsg.isMine ? `You: ${cleanText}` : `${lastMsg.sender}: ${cleanText}`,
              lastMsg.timestamp,
              lastMsg.time
            );
          }
        }
      } catch (err) {
        console.error("Error fetching group messages:", err);
      } finally {
        if (!hasFetchedOnce.current) {
          hasFetchedOnce.current = true;
          setLoading(false);
        }
      }
    },
    [groupId, chatId, onLastMessage, formatMessage]
  );

  // useEffect ke andar dependency mein 'sending' ko add karein
useEffect(() => {
  let mounted = true;
  fetchGroupMessages(true);

  pollingRef.current = setInterval(() => {
    // SIRF tab fetch karein jab message send NA ho raha ho
    if (mounted && !sending) { 
      fetchGroupMessages(false);
    }
  }, 5000);

  return () => {
    mounted = false;
    if (pollingRef.current) clearInterval(pollingRef.current);
  };
}, [fetchGroupMessages, sending]); // <--- 'sending' yahan zaroori hai

  // ✅ Smart scroll — sirf tab scroll karo jab user bottom pe ho
 const scrollToBottomIfNeeded = useCallback((force = false) => {
  const container = messagesContainerRef.current;

  if (!container) return;

  if (force || shouldAutoScrollRef.current) {
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }
}, []);

  useEffect(() => {
  setTimeout(() => {
    scrollToBottomIfNeeded();
  }, 50);
}, [messages, scrollToBottomIfNeeded]);

const handleClearChat = async () => {
  const confirmClear = window.confirm(
    "Are you sure you want to clear all messages?"
  );

  if (!confirmClear) return;

  try {
    const token = getAuthToken();

    const res = await fetch(
      `${API_CONFIG.BASE_URL}/group/group-clear-chat/${groupId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    if (result.status) {
      setMessages([]);
      toast.success("Chat cleared successfully");
    } else {
      toast.error(result.message || "Failed to clear chat");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error clearing chat");
  }
};

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || sending) return;

    const textToSend = messageText.trim();
    setMessageText("");
    const fileToSend = selectedFile;
    const previewToSend = filePreview;
    handleRemoveFile();
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    const optimistic = {
      id: tempId,
      isMine: true,
      sender: "(YOU)",
      text: textToSend,
      //senderAvatar: `https://ui-avatars.com/api/?name=You&background=00ff85&color=000`,
      time: now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      timestamp: now.getTime(),
      filePath: previewToSend?.url || null,
      fileType: previewToSend?.type === "image" ? "image" : previewToSend?.type === "video" ? "video" : null,
    };
    setMessages((prev) => [...prev, optimistic]);
    // ✅ Send karne par force scroll — user ne khud bheja hai
    setTimeout(() => scrollToBottomIfNeeded(true), 100);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("message", textToSend);

      if (fileToSend) {
        formData.append("files", fileToSend);
      }

      const res = await fetch(
        `${API_CONFIG.BASE_URL}/group/group-message-send/${groupId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const result = await res.json();

      if (!result.status) {
        toast.error("Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        await fetchGroupMessages(false);
      }
    } catch (err) {
      toast.error("Error sending message");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  // ✅ WhatsApp style — image/video render inside bubble
  const renderFile = (filePath, fileType) => {
    if (!filePath) return null;

    if (fileType === "image") {
      return (
        <div
          className="mt-1 rounded-xl overflow-hidden cursor-pointer"
          style={{ maxWidth: "220px" }}
          onClick={() => window.open(filePath, "_blank")}
        >
          <img
            src={filePath}
            alt="attachment"
            className="w-full block"
            style={{ display: "block", borderRadius: "10px" }}
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      );
    }

    if (fileType === "video") {
      return (
        <div
          className="mt-1 rounded-xl overflow-hidden"
          style={{ maxWidth: "220px" }}
        >
          <video
            src={filePath}
            controls
            className="w-full block"
            style={{ display: "block", borderRadius: "10px" }}
          />
        </div>
      );
    }

    return (
      <a
        href={filePath}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex items-center gap-2 text-xs text-[#00ff85] underline"
      >
        <MaterialIcon name="attach_file" className="text-sm" />
        View Attachment
      </a>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-3 lg:space-y-4 hide-scrollbar bg-gray-100 dark:bg-[#121413]/30 min-h-0"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-48 h-1 bg-[#1e201f] rounded-full overflow-hidden">
              <div className="h-full bg-[#00ff85] rounded-full animate-pulse w-2/3" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-widest">
              Loading messages...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-500 font-mono text-sm uppercase italic opacity-40">
            NO MESSAGES YET — SAY HI!
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              // 💡 FIXED: Check karein agar text post share token hold karta hai
              const isSharedPost = msg.text && String(msg.text).toUpperCase().includes("POST_SHARE_ID:");
              let sharedPostId = null;
              if (isSharedPost) {
                sharedPostId = String(msg.text).split(":")[1];
              }

              return (
               <div
  key={msg.id || msg.timestamp}
  className={`flex flex-col ${
    msg.isMine ? "items-end" : "items-start"
  } w-full`}
>
                  <div className={`space-y-1 ${msg.isMine ? "text-right" : ""} min-w-0 w-full`}>
                    <div className={`flex items-baseline gap-2 ${msg.isMine ? "justify-end" : ""} flex-wrap`}>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${msg.isMine ? "text-[#00ff85]" : "text-slate-800 dark:text-white"}`}>
                        {msg.sender}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                        {msg.time}
                      </span>
                    </div>

                  {/* Main Content Conditional Check */}
                    {isSharedPost ? (
                      <div
                        className={`inline-block overflow-hidden ${
                          msg.isMine ? "ml-auto" : "mr-auto"
                        }`}
                        style={{
                          width: "240px",
                          maxWidth: "100%",
                        }}
                      >
                        {/* Shared Card Base layout compatible for Dark/Light */}
                        <div
                          className="p-4 rounded-[22px] border bg-white dark:bg-[#1e201f] text-left transition-all duration-200"
                          style={{
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                            borderColor: "rgba(0, 255, 133, 0.25)",
                          }}
                        >
                          {/* Top Tag Header */}
                          <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-white/5 opacity-90">
                            <span
                              className="material-symbols-outlined text-[#00c96b]"
                              style={{ fontSize: "18px" }}
                            >
                              share
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#00c96b]">
                              Shared Post Card
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2.5 mb-3.5 leading-relaxed">
                            View shared post.
                          </p>

                          {/* 💡 FIXED UNIFORM ACTION BUTTON (WITH ACTIVE STATE HOVER) */}
                          <button
                            onClick={() => handleOpenPostModal(sharedPostId)}
                            style={{
                              backgroundColor: "#00ff85",
                              color: "#003919",
                            }}
                            className="w-full py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 border-none outline-none cursor-pointer shadow-sm"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#00e676";
                              e.currentTarget.style.transform = "scale(1.02)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 255, 133, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#00ff85";
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <span
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              visibility
                            </span>
                            View Post
                          </button>
                        </div>
                      </div>
                    ) : msg.filePath && msg.text ? (
                      <div
                        className={`inline-block rounded-2xl overflow-hidden ${
                          msg.isMine
                            ? "border border-[#00ff85]/20 rounded-tr-none"
                            : "border border-white/5 rounded-tl-none"
                        }`}
                        style={{ maxWidth: "220px" }}
                      >
                        {renderFile(msg.filePath, msg.fileType)}
                        <div
                          className={`px-3 py-2 text-sm leading-relaxed text-left ${
                            msg.isMine ? "bg-[#0d0f0e] text-white" : "bg-[#1e201f] text-[#e2e3e0]"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                      </div>
                    ) : (
                      // Sirf Simple text messages
                      <div
  className={`px-4 py-2.5 lg:py-3 rounded-2xl text-sm leading-relaxed inline-block max-w-full text-left ${
    msg.isMine
      ? "bg-white dark:bg-[#1e201f] text-slate-800 dark:text-[#e2e3e0] border border-gray-300 dark:border-white/5 rounded-tr-none"
      : "bg-white dark:bg-[#1e201f] text-slate-800 dark:text-[#e2e3e0] border border-gray-300 dark:border-white/5 rounded-tl-none"
  }`}
>
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* File Preview Bar */}
      {filePreview && (
        <div className="px-4 lg:px-6 pt-3 pb-2 bg-white dark:bg-[#0d0f0e] border-t border-gray-300 dark:border-[#3b4b3d]/20 flex items-center gap-3">
          {filePreview.type === "image" && (
            <img src={filePreview.url} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-[#00ff85]/30" />
          )}
          {filePreview.type === "video" && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1e201f] border border-[#00ff85]/20 rounded-lg px-3 py-2">
              <MaterialIcon name="videocam" className="text-[#00ff85] text-xl" />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{filePreview.name}</span>
            </div>
          )}
          <button onClick={handleRemoveFile} className="ml-auto w-7 h-7 flex items-center justify-center rounded-full bg-[#1e201f] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
            <MaterialIcon name="close" className="text-sm" />
          </button>
        </div>
      )}

      {/* Input Form Panel Area */}
      <div className="px-4 lg:px-6 pb-4 pt-3 bg-white dark:bg-[#0d0f0e] shrink-0 border-t border-gray-300 dark:border-[#3b4b3d]/20">
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />

        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#0d0f0e] border border-gray-300 dark:border-[#3b4b3d]/50 rounded-[24px] px-4 py-2 relative">
            {showAttachMenu && (
              <div ref={attachBtnRef} className="absolute bottom-14 left-0 bg-white dark:bg-[#1a1c1b] border border-gray-300 dark:border-[#00ff85]/20 rounded-xl overflow-hidden z-20 shadow-2xl" style={{ minWidth: "150px" }}>
                <button type="button" onClick={() => { photoInputRef.current?.click(); setShowAttachMenu(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-800 dark:text-[#e2e3e0] hover:bg-gray-100 dark:hover:bg-[#1e201f] transition-colors text-left">
                  <MaterialIcon name="image" className="text-[#00ff85]" style={{ fontSize: "20px" }} /> Photo
                </button>
                <button type="button" onClick={() => { videoInputRef.current?.click(); setShowAttachMenu(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-800 dark:text-[#e2e3e0] hover:bg-gray-100 dark:hover:bg-[#1e201f] transition-colors text-left">
                  <MaterialIcon name="videocam" className="text-[#00ff85]" style={{ fontSize: "20px" }} /> Video
                </button>
              </div>
            )}

            <button type="button" onClick={() => setShowAttachMenu((prev) => !prev)} className="self-end mb-2 mr-2 opacity-70 hover:opacity-100 transition-opacity">
              <MaterialIcon name="attach_file" className={`text-lg ${selectedFile ? "text-[#00ff85]" : "text-slate-500"}`} />
            </button>

            <textarea
              ref={messageInputRef}
              rows="1"
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-[#3b4b3d] font-inter resize-none py-1.5 max-h-[120px] overflow-y-auto custom-scrollbar"
              placeholder="Type a group message..."
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{ border: "none", boxShadow: "none" }}
            />
          </div>

          <button onClick={handleSendMessage} disabled={sending || (!messageText.trim() && !selectedFile)} className="w-10 h-10 lg:w-[48px] lg:h-[48px] flex items-center justify-center rounded-full bg-[#00ff85] text-[#003919] shrink-0 hover:brightness-110 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
            <MaterialIcon name="send" className="text-lg lg:text-xl" style={{ fontVariationSettings: "'FILL' 1" }} />
          </button>
        </div>
      </div>

      {/* 💡 CHAT ME POST DIKHANE VALA LIVE MODAL POP-UP */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
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
                  setIsExpanded(false);
                }}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {loadingPostData ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#00ff85]"></div>
                  <span className="text-xs text-gray-500 dark:text-slate-500 font-mono">FETCHING POST DATA...</span>
                </div>
              ) : popupPostData ? (
                <div className="flex flex-col gap-4">
                  {/* 1. AUTHOR NAME */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block mb-0.5">Posted By</span>
                    <h4 className="text-gray-900 dark:text-white font-extrabold text-lg tracking-tight">
                      {popupPostData.institute_name || popupPostData.name || "No Name Available"}
                    </h4>
                  </div>

                  {/* 2. DESCRIPTION */}
                  <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                    <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block mb-1.5">Description</span>
                    {popupPostData.post_text ? (
                      <div>
                        <p
                          className="text-gray-800 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words"
                          style={
                            !isExpanded
                              ? {
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: (popupPostData.image && popupPostData.image.trim() !== "") || (popupPostData.video && popupPostData.video.trim() !== "") ? 3 : 11,
                                  overflow: "hidden"
                                }
                              : {}
                          }
                        >
                          {popupPostData.post_text}
                        </p>
                        {((popupPostData.image && popupPostData.image.trim() !== "" && popupPostData.post_text.length > 150) ||
                          ((!popupPostData.image || popupPostData.image.trim() === "") && popupPostData.post_text.length > 400)) && (
                          <button onClick={() => setIsExpanded(!isExpanded)} className="mt-2 text-xs font-bold text-[#00ff85] hover:underline flex items-center gap-0.5">
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

                  {/* 3. ATTACHED MEDIA */}
                  {((popupPostData.image && popupPostData.image.trim() !== "") || (popupPostData.video && popupPostData.video.trim() !== "")) && (
                    <div className="w-full border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/40">
                      <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block p-3 pb-0">Attached Media</span>
                      <div className="p-3">
                        {(() => {
                          const mediaPath = popupPostData.video || popupPostData.image || "";
                          const cleanPath = mediaPath.replace(/^\//, "");
                          const fullMediaUrl = `${API_CONFIG.BASE_URL}/${cleanPath}`;
                          const isVideo = popupPostData.video || /\.(mp4|webm|ogg|mov|mkv)($|\?)/i.test(cleanPath);

                          return isVideo ? (
                            <video src={fullMediaUrl} controls playsInline className="w-full max-h-80 object-contain rounded-lg bg-black/10 dark:bg-[#1a1a1a] outline-none shadow-sm" />
                          ) : (
                            <img src={fullMediaUrl} alt="Shared Content" className="w-full max-h-80 object-contain rounded-lg bg-gray-50 dark:bg-[#1a1a1a]" onError={(e) => { e.target.parentNode.parentNode.style.display = 'none'; }} />
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 dark:text-slate-500 font-mono">FAILED TO LOAD POST CONTENT.</div>
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
                className="px-6 py-2 bg-[#00ff85] text-[#003919] font-bold text-xs rounded-lg hover:bg-[#00e676] hover:scale-[1.03] transition-all duration-200 shadow-md active:scale-95"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;