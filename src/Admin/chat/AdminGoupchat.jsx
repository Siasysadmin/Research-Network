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
  const isUserScrollingUp = useRef(false);   // ✅ track karo user upar hai ya nahi

  const groupId = group.groupId || String(group.id).replace("group_", "");
  const chatId = group.id;

  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const uid = String(currentUserId);

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
      const isMine = String(msg.sender_id) === uid;
      const profileImg = msg.sender_profile_image
        ? `${API_CONFIG.BASE_URL}/${msg.sender_profile_image}`
        : defaultAvatar;

      const messageDate = new Date(msg.created_at);
      const now = new Date();
      const isToday = messageDate.toDateString() === now.toDateString();

      let timeString = messageDate.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!isToday) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = messageDate.toDateString() === yesterday.toDateString();
        if (isYesterday) {
          timeString = `Yesterday ${timeString}`;
        } else {
          timeString = `${messageDate.toLocaleDateString()} ${timeString}`;
        }
      }

      return {
        id: msg.id,
        isMine,
        sender: isMine ? "(YOU)" : msg.sender_name || "Unknown",
        senderAvatar: isMine
          ? `https://ui-avatars.com/api/?name=You&background=00ff85&color=000`
          : profileImg,
        text: msg.message || "",
        time: timeString,
        timestamp: messageDate.getTime(),
        filePath: msg.file_path ? `${API_CONFIG.BASE_URL}/${msg.file_path}` : null,
        fileType: msg.file_type || null,
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
          const formatted = result.data.map(formatMessage);
          const sortedMessages = formatted.sort((a, b) => a.timestamp - b.timestamp);

          setMessages(sortedMessages);

          if (sortedMessages.length > 0 && onLastMessage) {
            const lastMsg = sortedMessages[sortedMessages.length - 1];
            onLastMessage(
              chatId,
              lastMsg.isMine ? `You: ${lastMsg.text}` : lastMsg.text,
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
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    if (force || distanceFromBottom < 100) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottomIfNeeded();
  }, [messages, scrollToBottomIfNeeded]);

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
      senderAvatar: `https://ui-avatars.com/api/?name=You&background=00ff85&color=000`,
      text: textToSend,
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
        className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-3 lg:space-y-4 hide-scrollbar bg-[#121413]/30 min-h-0"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-48 h-1 bg-[#1e201f] rounded-full overflow-hidden">
              <div className="h-full bg-[#00ff85] rounded-full animate-pulse w-2/3" />
            </div>
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              Loading messages...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm uppercase italic opacity-40">
            NO MESSAGES YET — SAY HI!
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMine ? "flex-row-reverse" : ""} items-start gap-3 max-w-[85%] ${msg.isMine ? "ml-auto" : ""}`}
              >
                <img
                  className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover mt-1 shrink-0 ${
                    msg.isMine ? "border-2 border-[#00ff85]/30" : ""
                  }`}
                  src={msg.senderAvatar}
                  alt={msg.sender}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender)}&background=1a1c1b&color=00ff85`;
                  }}
                />
                <div className={`space-y-1 ${msg.isMine ? "text-right" : ""} min-w-0`}>
                  <div className={`flex items-baseline gap-2 ${msg.isMine ? "justify-end" : ""} flex-wrap`}>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${msg.isMine ? "text-[#00ff85]" : "text-white"}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                      {msg.time}
                    </span>
                  </div>

                  {/* ✅ WhatsApp style: agar sirf image/video hai aur koi text nahi */}
                  {msg.filePath && !msg.text ? (
                    <div
                      className={`inline-block rounded-2xl overflow-hidden ${
                        msg.isMine
                          ? "border border-[#00ff85]/20 rounded-tr-none"
                          : "border border-white/5 rounded-tl-none"
                      }`}
                      style={{ maxWidth: "220px" }}
                    >
                      {renderFile(msg.filePath, msg.fileType)}
                    </div>
                  ) : msg.filePath && msg.text ? (
                    // ✅ Image/video + text dono hain
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
                    // ✅ Sirf text
                    <div
                      className={`px-4 py-2.5 lg:py-3 rounded-2xl text-sm leading-relaxed inline-block max-w-full text-left ${
                        msg.isMine
                          ? "bg-[#0d0f0e] text-white border border-[#00ff85]/30 rounded-tr-none"
                          : "bg-[#1e201f] text-[#e2e3e0] border border-white/5 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ✅ File Preview Bar */}
      {filePreview && (
        <div className="px-4 lg:px-6 pt-3 pb-2 bg-[#0d0f0e] border-t border-[#3b4b3d]/20 flex items-center gap-3">
          {filePreview.type === "image" && (
            <img
              src={filePreview.url}
              alt="preview"
              className="w-14 h-14 rounded-lg object-cover border border-[#00ff85]/30"
            />
          )}
          {filePreview.type === "video" && (
            <div className="flex items-center gap-2 bg-[#1e201f] border border-[#00ff85]/20 rounded-lg px-3 py-2">
              <MaterialIcon name="videocam" className="text-[#00ff85] text-xl" />
              <span className="text-xs text-slate-300 truncate max-w-[180px]">{filePreview.name}</span>
            </div>
          )}
          {filePreview.type === "other" && (
            <div className="flex items-center gap-2 bg-[#1e201f] border border-[#00ff85]/20 rounded-lg px-3 py-2">
              <MaterialIcon name="attach_file" className="text-[#00ff85] text-xl" />
              <span className="text-xs text-slate-300 truncate max-w-[180px]">{filePreview.name}</span>
            </div>
          )}
          <button
            onClick={handleRemoveFile}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-full bg-[#1e201f] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
          >
            <MaterialIcon name="close" className="text-sm" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 lg:px-6 pb-4 pt-3 bg-[#0d0f0e] shrink-0 border-t border-[#3b4b3d]/20">

        {/* ✅ Hidden file inputs — alag alag photo aur video ke liye */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex-1 flex items-center bg-[#0d0f0e] border border-[#3b4b3d]/50 rounded-[24px] px-4 py-2 relative">

            {/* ✅ Attach popup menu — Photo ya Video choose karo */}
            {showAttachMenu && (
              <div
                ref={attachBtnRef}
                className="absolute bottom-14 left-0 bg-[#1a1c1b] border border-[#00ff85]/20 rounded-xl overflow-hidden z-20 shadow-2xl"
                style={{ minWidth: "150px" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    photoInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#e2e3e0] hover:bg-[#1e201f] border-b border-white/5 transition-colors text-left"
                >
                  <MaterialIcon name="image" className="text-[#00ff85]" style={{ fontSize: "20px" }} />
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    videoInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#e2e3e0] hover:bg-[#1e201f] transition-colors text-left"
                >
                  <MaterialIcon name="videocam" className="text-[#00ff85]" style={{ fontSize: "20px" }} />
                  Video
                </button>
              </div>
            )}

            {/* ✅ Attach button — click karo to menu toggle ho */}
            <button
              type="button"
              onClick={() => setShowAttachMenu((prev) => !prev)}
              className="self-end mb-2 mr-2 opacity-70 hover:opacity-100 transition-opacity"
              title="Photo ya Video attach karo"
            >
              <MaterialIcon
                name="attach_file"
                className={`text-lg ${selectedFile ? "text-[#00ff85]" : "text-slate-500"}`}
              />
            </button>

            <textarea
              ref={messageInputRef}
              rows="1"
              className="flex-1 bg-transparent text-sm text-white outline-none focus:ring-0 placeholder:text-[#3b4b3d] font-inter resize-none py-1.5 max-h-[120px] overflow-y-auto custom-scrollbar"
              placeholder="Type a group message..."
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
            disabled={sending || (!messageText.trim() && !selectedFile)}
            className="w-10 h-10 lg:w-[48px] lg:h-[48px] flex items-center justify-center rounded-full bg-[#00ff85] text-[#003919] shrink-0 hover:brightness-110 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MaterialIcon
              name="send"
              className="text-lg lg:text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;