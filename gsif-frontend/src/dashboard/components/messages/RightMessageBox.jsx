import React from "react";
import avatar from "../../../assets/images/avatar.jpg";
import API_CONFIG from "../../../config/api.config";

// WhatsApp-style day label (Today / Yesterday / DD Month YYYY)
const _msgDate = (s) => {
  if (!s) return null;
  const d = new Date(String(s).replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
};

const isSameDay = (a, b) => {
  const da = _msgDate(a);
  const db = _msgDate(b);
  if (!da || !db) return false;
  return da.toDateString() === db.toDateString();
};

const getDateLabel = (s) => {
  const d = _msgDate(s);
  if (!d) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const SharedPostCard = ({ postId, onOpen }) => {
  return (
    <div
      onClick={() => onOpen && onOpen(postId, null)}
      className="mt-1 rounded-xl border border-emerald-200 dark:border-[#00ff85]/30 bg-emerald-50 dark:bg-[#0d1a12] overflow-hidden max-w-[220px] cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-[#00ff85]">
          <span className="material-symbols-outlined text-sm">share</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Shared Post
          </span>
        </div>
        <div className="border-t border-white/10 pt-2">
          <p className="text-[10px] text-slate-600 dark:text-slate-300">
            View shared post
          </p>{" "}
        </div>
        <button className="w-full bg-[#00ff85] text-black text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-xs">visibility</span>
          View Post
        </button>
      </div>
    </div>
  );
};

const RightMessageBox = ({ ctx }) => {
  const {
    chatWidgetRef,
    popupMessagesContainerRef,
    popupMessagesEndRef,
    isChatListOpen,
    setIsChatListOpen,
    activeChatId,
    setActiveChatId,
    chatInput,
    setChatInput,
    chatMessages,
    setIsPostModalOpen,
    setSelectedPostIdForPopup,
    setPopupPostData,
    setLoadingPostData,
    setIsExpanded,
    chats,
    isInstituteApprovalPending,
    handlePopupScroll,
    handleChatSend,
    activeChatData,
    openApprovalModal,
  } = ctx;
  return (
    <div
      ref={chatWidgetRef}
      className="hidden sm:flex fixed bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 items-end gap-3 sm:gap-4 pointer-events-none"
      style={{ zIndex: 60 }}
    >
      {/* Active Chat Window */}
      {activeChatId && isChatListOpen && (
        <div className="pointer-events-auto bg-white dark:bg-[#161817] border border-[#3b4b3d]/30 rounded-lg sm:rounded-xl w-[calc(100vw-1rem)] sm:w-[280px] md:w-[320px] max-w-[350px] h-[60vh] sm:h-[400px] md:h-[450px] max-h-[500px] shadow-2xl flex flex-col overflow-hidden animate-fadeInScale absolute bottom-full right-0 sm:relative sm:bottom-auto sm:right-auto mb-2">
          {/* Header */}
          <div className="p-2.5 sm:p-3 md:p-4 border-b border-[#3b4b3d]/30 flex items-center justify-between bg-slate-50 dark:bg-[#1a1c1b] shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center shrink-0 relative">
                {activeChatData?.isGroup ? (
                  <>
                    <img
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#1a1c1b] z-10"
                      src={activeChatData.avatars[0]}
                      alt="User 1"
                    />
                    <img
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#1a1c1b] -ml-3 sm:-ml-4 z-0"
                      src={activeChatData.avatars[1]}
                      alt="User 2"
                    />
                  </>
                ) : (
                  <img
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    src={activeChatData?.avatars[0]}
                    alt={activeChatData?.name}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                  {activeChatData?.name}
                </h4>

                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[7px] sm:text-[9px] text-slate-400 font-semibold capitalize tracking-wide">
                    {activeChatData?.type || "Individual"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveChatId(null)}
              className="text-slate-400 hover:text-slate-900 dark:text-white transition-colors p-0.5 shrink-0"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">
                close
              </span>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={popupMessagesContainerRef}
            onScroll={handlePopupScroll}
            className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4 hide-scrollbar bg-slate-50 dark:bg-[#121413]"
          >
            {(chatMessages[activeChatId] || []).length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center mt-4 italic">
                No messages yet. Say hi! 👋
              </p>
            ) : (
              (chatMessages[activeChatId] || []).map((m, _idx, _arr) => (
                <React.Fragment key={m.id}>
                  {(_idx === 0 ||
                    !isSameDay(_arr[_idx - 1]?.created_at, m.created_at)) && (
                    <div className="flex justify-center my-2">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-white/10 px-2.5 py-1 rounded-full">
                        {getDateLabel(m.created_at)}
                      </span>
                    </div>
                  )}
                  {m.isMine ? (
                    <div className="ml-auto w-[85%] sm:w-[80%] flex flex-col items-end mt-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono">
                          {m.created_at?.slice(11, 16)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-[#00ff85] font-bold uppercase tracking-wider">
                          You
                        </span>
                      </div>
                      <div className="bg-slate-100 dark:bg-[#0d0f0e] px-3 py-2.5 rounded-2xl rounded-tr-none text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed border border-[#00ff85]/30 text-left w-full break-words">
                        {m.file?.path &&
                          (() => {
                            const base = API_CONFIG.BASE_URL.replace(/\/$/, "");
                            const path = m.file.path.replace(/^\//, "");
                            const url = m.file.path.startsWith("http")
                              ? m.file.path
                              : `${base}/${path}`;
                            return m.file.type === "video" ? (
                              <video
                                src={url}
                                controls
                                className="max-w-full rounded-lg mb-1 bg-slate-100 dark:bg-[#000302] border border-slate-200 dark:border-white/10"
                              />
                            ) : (
                              <img
                                src={url}
                                alt="attachment"
                                className="max-w-full rounded-lg mb-1 object-cover border border-slate-200 dark:border-white/10"
                              />
                            );
                          })()}
                        {m.message &&
                          (m.message.startsWith("POST_SHARE_ID:") ? (
                            <SharedPostCard
                              postId={m.message.replace("POST_SHARE_ID:", "")}
                              onOpen={(pid) => {
                                setIsPostModalOpen(true);
                                setSelectedPostIdForPopup(pid);
                                setPopupPostData(null);
                                setLoadingPostData(true);
                                setIsExpanded(false);

                                const token =
                                  localStorage.getItem("auth_token") ||
                                  localStorage.getItem("token") ||
                                  sessionStorage.getItem("auth_token") ||
                                  localStorage.getItem("authToken") ||
                                  null;

                                fetch(
                                  `${API_CONFIG.BASE_URL}/post/get-posts-id/${pid}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                )
                                  .then((r) => r.json())
                                  .then((res) => {
                                    if (res.status) setPopupPostData(res.data);
                                    setLoadingPostData(false);
                                  })
                                  .catch(() => setLoadingPostData(false));
                              }}
                            />
                          ) : (
                            <span>{m.message}</span>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 w-[90%] sm:w-[85%] mt-4">
                      <img
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 mt-1"
                        src={activeChatData?.avatars[0]}
                        alt={activeChatData?.name}
                      />
                      <div className="min-w-0 w-full">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                            {activeChatData?.name}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono shrink-0">
                            {m.created_at?.slice(11, 16)}
                          </span>
                        </div>
                        <div
                          className="bg-slate-100 dark:bg-[#1e201f] 
                         text-slate-900 dark:text-[#e2e3e0]
                          border border-slate-200 dark:border-white/5 text-xs sm:text-sm p-2.5 sm:p-3 rounded-2xl rounded-tl-none border border-white/5 relative break-words"
                        >
                          {m.file?.path &&
                            (() => {
                              const base = API_CONFIG.BASE_URL.replace(
                                /\/$/,
                                "",
                              );
                              const path = m.file.path.replace(/^\//, "");
                              const url = m.file.path.startsWith("http")
                                ? m.file.path
                                : `${base}/${path}`;
                              return m.file.type === "video" ? (
                                <video
                                  src={url}
                                  controls
                                  className="max-w-full rounded-lg mb-1 bg-slate-100 dark:bg-[#000302] border border-slate-200 dark:border-white/10"
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt="attachment"
                                  className="max-w-full rounded-lg mb-1 object-cover border border-slate-200 dark:border-white/10"
                                />
                              );
                            })()}
                          {m.message &&
                            (m.message.startsWith("POST_SHARE_ID:") ? (
                              <SharedPostCard
                                postId={m.message.replace("POST_SHARE_ID:", "")}
                                onOpen={(pid) => {
                                  setIsPostModalOpen(true);
                                  setSelectedPostIdForPopup(pid);
                                  setPopupPostData(null);
                                  setLoadingPostData(true);
                                  setIsExpanded(false);

                                  const token =
                                    localStorage.getItem("auth_token") ||
                                    localStorage.getItem("token") ||
                                    sessionStorage.getItem("auth_token") ||
                                    localStorage.getItem("authToken") ||
                                    null;

                                  fetch(
                                    `${API_CONFIG.BASE_URL}/post/get-posts-id/${pid}`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  )
                                    .then((r) => r.json())
                                    .then((res) => {
                                      if (res.status)
                                        setPopupPostData(res.data);
                                      setLoadingPostData(false);
                                    })
                                    .catch(() => setLoadingPostData(false));
                                }}
                              />
                            ) : (
                              <span>{m.message}</span>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
            <div ref={popupMessagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-1.5 sm:p-2 md:p-3 bg-slate-50 dark:bg-[#121413] shrink-0">
            <div className="relative flex items-center gap-1 sm:gap-2">
              <div className="flex-1 flex items-center bg-slate-100 dark:bg-[#0d0f0e]  border border-[#3b4b3d]/50 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 focus-within:border-[#00ff85]/50 transition-colors min-w-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleChatSend();
                  }}
                  placeholder="Type message..."
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-0 placeholder:text-[#3b4b3d]"
                />
              </div>
              <button
                onClick={handleChatSend}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#00ff85] text-[#003919] shrink-0 hover:brightness-110 transition-all"
              >
                <span
                  className="material-symbols-outlined text-sm sm:text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat List & Toggle Button */}
      <div className="pointer-events-auto flex flex-col items-end gap-2 relative">
        {/* Chat List Popup */}
        {isChatListOpen && (
          <div className="bg-white dark:bg-[#161817] border border-[#3b4b3d]/30 rounded-lg sm:rounded-xl w-[calc(100vw-1rem)] sm:w-[280px] md:w-[300px] max-w-[350px] shadow-2xl overflow-hidden animate-fadeInScale mb-2 absolute bottom-full right-0 sm:relative sm:bottom-auto sm:right-auto">
            <div className="p-2.5 sm:p-3 md:p-4 border-b border-[#3b4b3d]/30 bg-slate-50 dark:bg-[#1a1c1b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#fce4d6] flex items-center justify-center relative">
                  <span className="material-symbols-outlined text-[#cf9c7b] text-xs">
                    phone_iphone
                  </span>
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#00ff88] rounded-full border border-[#161817]"></div>
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                  Messages
                </h3>
              </div>
              <button
                onClick={() => setIsChatListOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:text-white transition-colors p-0.5"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">
                  keyboard_arrow_down
                </span>
              </button>
            </div>
            <div className="p-1.5 space-y-0.5 max-h-[50vh] sm:max-h-[350px] overflow-y-auto hide-scrollbar">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  // ✅ SAHI — ye karo
                  // Chat list item click handler mein
                  onClick={() => {
                    if (isInstituteApprovalPending) {
                      openApprovalModal();
                      return;
                    }
                    setActiveChatId(chat.id);
                    setIsChatListOpen(true);

                    // ✅ Yeh add karo
                    const seen = JSON.parse(
                      localStorage.getItem("recentlySeenChats") || "{}",
                    );
                    seen[String(chat.id)] = Date.now();
                    localStorage.setItem(
                      "recentlySeenChats",
                      JSON.stringify(seen),
                    );
                  }}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg cursor-pointer transition-colors gap-2 ${activeChatId === chat.id ? "bg-slate-50 dark:bg-[#1e201f] border-l-2 border-[#00ff85]" : "hover:bg-slate-100 dark:hover:bg-[#2a2d2b] dark:bg-[#1e201f]"}`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    <div className="relative flex items-center shrink-0">
                      {chat.isGroup ? (
                        <>
                          <img
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#1a1c1b] z-10"
                            src={chat.avatars[0]}
                            alt="User 1"
                          />
                          <img
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#1a1c1b] -ml-3 z-0"
                            src={chat.avatars[1]}
                            alt="User 2"
                          />
                        </>
                      ) : (
                        <img
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                          src={chat.avatars[0]}
                          alt={chat.name}
                        />
                      )}
                    </div>
                    <div className="min-w-0 pr-1.5">
                      <h5 className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[100px] flex items-center gap-1">
                        <span className="truncate">{chat.name}</span>
                        {chat.isYou && (
                          <span className="shrink-0 text-[7px] font-mono px-1 py-0.5 rounded-full bg-[#00ff88]/10 text-emerald-600 dark:text-[#00ff88] border border-[#00ff88]/30">
                            You
                          </span>
                        )}
                      </h5>
                      <p className="text-slate-400 text-[9px] sm:text-xs truncate max-w-[90px] sm:max-w-[100px]">
                        {chat.lastMsg}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-slate-500 text-[8px] sm:text-[9px]">
                      {chat.time}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="bg-[#00ff88] text-black text-[7px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none px-0.5">
                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="p-1.5 sm:p-2 md:p-3 border-t border-[#3b4b3d]/30 bg-slate-50 dark:bg-[#1a1c1b]">
                <button className="w-full bg-[#00ff88]/10 text-emerald-600 dark:text-[#00ff88] font-bold text-[9px] sm:text-xs py-1.5 sm:py-2 rounded-lg hover:bg-[#00ff88]/20 transition-colors uppercase tracking-wider">
                  View All Messages
                </button>
              </div> */}
          </div>
        )}

        {/* Minimized Toggle Button */}
        {!isChatListOpen && (
          <div
            className="bg-white dark:bg-[#161817] border border-[#3b4b3d]/30 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between cursor-pointer w-[calc(100vw-1rem)] max-w-[280px] sm:max-w-[300px] shadow-lg hover:bg-slate-100 dark:hover:bg-[#2a2d2b] dark:bg-[#1e201f] transition-all gap-2"
            // ✅ SAHI — ye karo
            onClick={() => {
              if (isInstituteApprovalPending) {
                openApprovalModal();
                return;
              }
              // ← yeh add karo
              setIsChatListOpen(true);
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="relative">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fce4d6] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#cf9c7b] text-xs sm:text-sm">
                    phone_iphone
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#00ff88] rounded-full border border-[#161817]"></div>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                Messages
              </span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-lg shrink-0">
              expand_less
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightMessageBox;
