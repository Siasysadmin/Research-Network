import React, { useState, useEffect, useRef, useCallback } from "react";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";
import defaultAvatar from "../../assets/images/avatar.jpg";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

// Props me prefetchedData lo
const GroupChat = ({ group, currentUserId, onLastMessage, prefetchedData }) => {
  const [messages, setMessages] = useState(
    prefetchedData ? formatMessages(prefetchedData) : [], // Pre-fill karo
  );
  const [loading, setLoading] = useState(!prefetchedData); // Agar data hai to loading skip

  useEffect(() => {
    if (prefetchedData) {
      // Data already hai, sirf format karo
      setMessages(formatMessages(prefetchedData));
      setLoading(false);
      return;
    }
    // Normal fetch
    fetchGroupMessages();
  }, [group.groupId]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
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
  const isUserScrollingUp = useRef(false); // ✅ track karo user upar hai ya nahi
  // Post modal ke liye states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPostIdForPopup, setSelectedPostIdForPopup] = useState(null);
  const [loadingPostData, setLoadingPostData] = useState(false);
  const [popupPostData, setPopupPostData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const groupId = group.groupId || String(group.id).replace("group_", "");
  const chatId = group.id;


  const shouldAutoScrollRef = useRef(true);

  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const uid = String(currentUserId);

  // ✅ Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attachBtnRef.current && !attachBtnRef.current.contains(e.target)) {
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
      setFilePreview({
        type: "image",
        url: URL.createObjectURL(file),
        name: file.name,
      });
    } else if (file.type.startsWith("video/")) {
      setFilePreview({
        type: "video",
        url: URL.createObjectURL(file),
        name: file.name,
      });
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
        const isYesterday =
          messageDate.toDateString() === yesterday.toDateString();
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
        // senderAvatar: isMine
        //   ? `https://ui-avatars.com/api/?name=You&background=00ff85&color=000`
        //   : profileImg,
        text: msg.message || "",
        time: timeString,
        timestamp: messageDate.getTime(),
        filePath: msg.file_path
          ? `${API_CONFIG.BASE_URL}/${msg.file_path}`
          : null,
        fileType: msg.file_type || null,
      };
    },
    [uid],
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
          },
        );
        const result = await res.json();

        if (result.status && Array.isArray(result.data)) {
          const formatted = result.data.map(formatMessage);
          const sortedMessages = formatted.sort(
            (a, b) => a.timestamp - b.timestamp,
          );

          setMessages(sortedMessages);

          // ✅ FIXED: Sidebar check for shared posts in background updates
          if (sortedMessages.length > 0 && onLastMessage) {
            const lastMsg = sortedMessages[sortedMessages.length - 1];
            
            const rawText = lastMsg.text || "";
            const isSharedPost = String(rawText).toUpperCase().includes("POST_SHARE_ID:");
            const cleanText = isSharedPost ? "Shared a post 📝" : (rawText || "Sent an attachment");

            onLastMessage(
              chatId,
              lastMsg.isMine ? `You: ${cleanText}` : cleanText,
              lastMsg.timestamp,
              lastMsg.time,
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
    [groupId, chatId, onLastMessage, formatMessage],
  );

  const fetchSinglePostDetails = async (postId) => {
    if (!postId) return;
    setLoadingPostData(true);
    setPopupPostData(null);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/post/get-posts-id/${postId}`,
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
        setPopupPostData(result.data);
      }
    } catch (error) {
      console.error("Error fetching shared post:", error);
    } finally {
      setLoadingPostData(false);
    }
  };
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
  const scrollToBottomIfNeeded = (force = false) => {
  if (force) {
    shouldAutoScrollRef.current = true;
  }
  if (shouldAutoScrollRef.current && messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "auto" });
  }
};

  useEffect(() => {
    scrollToBottomIfNeeded();
  }, [messages, scrollToBottomIfNeeded]);



  // 1. Jab messages load ho jayein ya naya message aaye tab niche scroll karein
useEffect(() => {
  if (!loading) {
    // Chat open hote hi instantly sabse neeche bhejne ke liye force scroll true
    scrollToBottomIfNeeded(messages.length <= 10); 
  }
}, [messages, loading]);

// 2. User ke scroll behaviour ko track karne ke liye handler
const handleScroll = () => {
  if (!messagesContainerRef.current) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
  
  // Agar user niche se 100px upar hai, toh auto-scroll temporary band kar do
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
  shouldAutoScrollRef.current = isAtBottom;
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
    const timeStr = now.toLocaleTimeString("en-US", {
      hour12: false, // matches your original format preference
      hour: "2-digit",
      minute: "2-digit",
    });

    const optimistic = {
      id: tempId,
      isMine: true,
      sender: "(YOU)",
      text: textToSend,
      time: timeStr,
      timestamp: now.getTime(),
      filePath: previewToSend?.url || null,
      fileType:
        previewToSend?.type === "image"
          ? "image"
          : previewToSend?.type === "video"
            ? "video"
            : null,
    };
    setMessages((prev) => [...prev, optimistic]);
    
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
        },
      );
      const result = await res.json();

      if (!result.status) {
        toast.error("Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        // 💡 FIXED: Naya message send hote hi sidebar ko bina ID ke instantly clean text bhejenge
        if (onLastMessage) {
          const isSharedPostMsg = String(textToSend).toUpperCase().includes("POST_SHARE_ID:");
          const dynamicSidebarText = isSharedPostMsg 
            ? "Shared a post 📝" 
            : (textToSend || "Sent an attachment");

          onLastMessage(
            chatId,
            `You: ${dynamicSidebarText}`,
            now.getTime(),
            timeStr
          );
        }

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
      {/* POST MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-left transition-colors duration-200">
            {/* Header */}
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
                  setIsExpanded(false);
                }}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              {loadingPostData ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#00ff85]"></div>
                  <span className="text-xs text-gray-500 dark:text-slate-500 font-mono">
                    FETCHING POST DATA...
                  </span>
                </div>
              ) : popupPostData ? (
                <div className="flex flex-col gap-4">
                  {/* Author */}
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

                  {/* Description */}
                  <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                    <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-slate-500 block mb-1.5">
                      Description
                    </span>
                    {popupPostData.post_text ? (
                      <div>
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

                  {/* Image */}
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
                <div className="text-center py-6 text-xs text-gray-500 dark:text-slate-500 font-mono">
                  FAILED TO LOAD POST CONTENT.
                </div>
              )}
            </div>

            {/* Footer */}
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

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMine ? "flex-row-reverse" : ""} items-start gap-3 max-w-[85%] ${msg.isMine ? "ml-auto" : ""}`}
              >
                {/* <img
                  className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover mt-1 shrink-0 ${
                    msg.isMine ? "border-2 border-[#00ff85]/30" : ""
                  }`}
                  src={msg.senderAvatar}
                  alt={msg.sender}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender)}&background=1a1c1b&color=00ff85`;
                  }}
                /> */}
                <div
                  className={`space-y-1 ${msg.isMine ? "text-right" : ""} min-w-0`}
                >
                  <div
                    className={`flex items-baseline gap-2 ${msg.isMine ? "justify-end" : ""} flex-wrap`}
                  >
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${msg.isMine ? "text-[#00ff85]" : "text-slate-800 dark:text-white"}`}
                    >
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
                          msg.isMine
                            ? "bg-[#0d0f0e] text-white"
                            : "bg-[#1e201f] text-[#e2e3e0]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // ✅ Sirf text
                    <div
                      className={`px-4 py-2.5 lg:py-3 rounded-2xl text-sm leading-relaxed inline-block max-w-full text-left ${
                        msg.isMine
                          ? ":bg-[#dcfce7] dark:bg-[#0d0f0e] text-slate-900 dark:text-white border border-[#00ff85]/30 rounded-tr-none"
                          : "bg-white dark:bg-[#1e201f] text-slate-800 dark:text-[#e2e3e0] border border-gray-300 dark:border-white/5 rounded-tl-none"
                      }`}
                    >
                      {/* Sirf text wala section — replace existing text render */}
                      {msg.text && String(msg.text).includes("POST_SHARE_ID:")
                        ? (() => {
                            const extractedId =
                              String(msg.text).split("POST_SHARE_ID:")[1] || "";
                            return (
                              <div className="p-3 bg-emerald-50 dark:bg-[#0d0f0e] border border-[#00ff85]/30 rounded-xl min-w-[220px] max-w-xs flex flex-col gap-2 my-1 shadow-md text-left">
                                <div className="flex items-center gap-2 border-b border-emerald-200 dark:border-white/10 pb-1.5">
                                  <MaterialIcon
                                    name="share"
                                    className="text-emerald-500 text-sm"
                                    style={{
                                      fontVariationSettings: "'FILL' 1",
                                    }}
                                  />
                                  <span className="text-[11px] font-mono tracking-wider text-[#00ff85] uppercase font-bold">
                                    Shared Post
                                  </span>
                                </div>
                                <div className="text-xs text-slate-700 dark:text-slate-300">
                                  View shared post
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedPostIdForPopup(extractedId);
                                    setIsPostModalOpen(true);
                                    fetchSinglePostDetails(extractedId);
                                  }}
                                  className="w-full mt-1 py-1.5 px-3 bg-[#00ff85] hover:bg-[#00e676] text-[#003919] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                                >
                                  <MaterialIcon
                                    name="visibility"
                                    className="text-xs"
                                  />{" "}
                                  View Post
                                </button>
                              </div>
                            );
                          })()
                        : msg.text && (
                            <p className="whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>
                          )}
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
        <div className="px-4 lg:px-6 pt-3 pb-2 bg-white dark:bg-[#0d0f0e] border-t border-gray-300 dark:border-[#3b4b3d]/20 flex items-center gap-3">
          {filePreview.type === "image" && (
            <img
              src={filePreview.url}
              alt="preview"
              className="w-14 h-14 rounded-lg object-cover border border-[#00ff85]/30"
            />
          )}
          {filePreview.type === "video" && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1e201f] border border-[#00ff85]/20 rounded-lg px-3 py-2">
              <MaterialIcon
                name="videocam"
                className="text-[#00ff85] text-xl"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                {filePreview.name}
              </span>
            </div>
          )}
          {filePreview.type === "other" && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1e201f] border border-[#00ff85]/20 rounded-lg px-3 py-2">
              <MaterialIcon
                name="attach_file"
                className="text-[#00ff85] text-xl"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                {filePreview.name}
              </span>
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
      <div className="px-4 lg:px-6 pb-4 pt-3 bg-white dark:bg-[#0d0f0e] shrink-0 border-t border-gray-300 dark:border-[#3b4b3d]/20">
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
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#0d0f0e] border border-gray-300 dark:border-[#3b4b3d]/50 rounded-[24px] px-4 py-2 relative">
            {/* ✅ Attach popup menu — Photo ya Video choose karo */}
            {showAttachMenu && (
              <div
                ref={attachBtnRef}
                className="absolute bottom-14 left-0 bg-white dark:bg-[#1a1c1b] border border-gray-300 dark:border-[#00ff85]/20 rounded-xl overflow-hidden z-20 shadow-2xl"
                style={{ minWidth: "150px" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    photoInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-800 dark:text-[#e2e3e0] hover:bg-gray-100 dark:hover:bg-[#1e201f] border-b border-white/5 transition-colors text-left"
                >
                  <MaterialIcon
                    name="image"
                    className="text-[#00ff85]"
                    style={{ fontSize: "20px" }}
                  />
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    videoInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-800 dark:text-[#e2e3e0] hover:bg-gray-100 dark:hover:bg-[#1e201f] border-b border-white/5 transition-colors text-left"
                >
                  <MaterialIcon
                    name="videocam"
                    className="text-[#00ff85]"
                    style={{ fontSize: "20px" }}
                  />
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
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-[#3b4b3d] font-inter resize-none py-1.5 max-h-[120px] overflow-y-auto custom-scrollbar"
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