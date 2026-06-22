import React from "react";
import avatar from "../../../assets/images/avatar.jpg";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

const PollSection = ({ post, index, ctx }) => {
  const {
    userId,
    pollActionLoading,
    deletingPollId,
    showOptionsId,
    setShowOptionsId,
    setShowDeletePopup,
    setShowReportPopup,
    setShowBlockPopup,
    setSelectedPost,
    connectedUsers,
    formatDate,
    handleOpenUserProfile,
    toggleConnect,
    handlePollOptionClick,
    handlePollUndo,
    getPostProfileSrc,
  } = ctx;
  const poll = post?.poll || (post?.isPollPost ? post : null);
                      const pollId = String(poll.poll_id);
                      const pollUserId = poll.user_id;
                      const pollName =
                        poll.user_type === "institute"
                          ? poll.name || "Institute"
                          : poll.name || "User";
                      const pollTime = formatDate(
                        `${poll.created_at.replace(" ", "T")}+05:30`,
                      );
                      const isCurrentUserPoll =
                        String(userId) === String(pollUserId);
                      const isBusy = Boolean(pollActionLoading[pollId]);
                      const pollOptionsKey = `poll-${pollId}`;
                      const isDeletingPoll =
                        String(deletingPollId) === String(pollId);
                      const totalVotes = Number(poll.total_votes) || 0;
                      const myVote = poll.my_vote_option_id;

                      return (
                        <article
                          key={`poll-${pollId}-${index}`}
                          className=" bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden relative w-full"
                        >
                          <div className="p-3 sm:p-4 md:p-5">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <button
                                  type="button"
                                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-emerald-100 dark:bg-[#031a11] border border-[#00ff88]/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.12)] shrink-0 hover:opacity-90 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenUserProfile(
                                      {
                                        user_id: pollUserId,
                                        name: pollName,
                                        user_type: poll.user_type,
                                        profile_image: poll.profile_image,
                                      },
                                      false,
                                    );
                                  }}
                                >
                                  {poll.profile_image ? (
                                    <img
                                      alt={pollName}
                                      src={getPostProfileSrc(poll)}
                                      className="w-full h-full rounded-lg sm:rounded-2xl object-cover"
                                      onError={(e) => {
                                        e.target.src = avatar;
                                      }}
                                    />
                                  ) : (
                                    <img
                                      alt={pollName}
                                      src={avatar}
                                      className="w-full h-full rounded-lg sm:rounded-2xl object-cover"
                                    />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-wrap">
                                    <h4 className="text-slate-900 dark:text-white font-bold truncate text-xs sm:text-sm">
                                      {pollName}
                                    </h4>
                                  </div>
                                  <p className="text-[9px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-0.5 flex-wrap">
                                    {(poll.user_type || "user")
                                      .toLowerCase()
                                      .replace(/^./, (c) => c.toUpperCase())}
                                    <span className="text-slate-500 text-[9px] sm:text-xs shrink-0">
                                      • {pollTime}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                {!isCurrentUserPoll && (
                                  <button
                                    onClick={(e) =>
                                      toggleConnect(pollUserId, e)
                                    }
                                    disabled={connectedUsers[pollUserId] === 1}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                                      connectedUsers[pollUserId] === 2
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-[#00ff88]/10 dark:text-[#00ff88] dark:border-[#00ff88]/40"
                                        : connectedUsers[pollUserId] === 1
                                          ? "bg-yellow-50 text-yellow-600 border-yellow-300 cursor-not-allowed dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/40"
                                          : "bg-[#00ff88] text-black border-[#00ff88] hover:bg-[#00dd77]"
                                    }`}
                                  >
                                    {connectedUsers[pollUserId] === 2
                                      ? "✓ CONNECTED"
                                      : connectedUsers[pollUserId] === 1
                                        ? "⏳ PENDING"
                                        : "+ CONNECT"}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={isDeletingPoll}
                                  className="text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowOptionsId(
                                      showOptionsId === pollOptionsKey
                                        ? null
                                        : pollOptionsKey,
                                    );
                                  }}
                                >
                                  <MaterialIcon
                                    name="more_horiz"
                                    className="text-base sm:text-lg"
                                  />
                                </button>

                                {showOptionsId === pollOptionsKey && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowOptionsId(null);
                                      }}
                                    ></div>
                                    <div className="absolute right-4 top-[68px] w-40 sm:w-48 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 animate-fadeInScale">
                                      {" "}
                                      {isCurrentUserPoll ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPost({
                                              isPollPost: true,
                                              pollId,
                                              postUserId: pollUserId,
                                              postName: pollName,
                                            });
                                            setShowDeletePopup(true);
                                            setShowOptionsId(null);
                                          }}
                                          disabled={isDeletingPoll}
                                          className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                            delete
                                          </span>
                                          <span>
                                            {isDeletingPoll
                                              ? "Deleting..."
                                              : "Delete Poll"}
                                          </span>
                                        </button>
                                      ) : (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedPost({
                                                postId: pollOptionsKey,
                                                isMockPost: false,
                                                postUserId: pollUserId,
                                                postName: pollName,
                                                isReportPost: true,
                                              });
                                              setShowReportPopup(true);
                                              setShowOptionsId(null);
                                            }}
                                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-slate-200 dark:border-white/10"
                                          >
                                            <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                              flag
                                            </span>
                                            <span>Report Poll</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedPost({
                                                postId: pollOptionsKey,
                                                isMockPost: false,
                                                postUserId: pollUserId,
                                                postName: pollName,
                                                isBlockUser: true,
                                              });
                                              setShowBlockPopup(true);
                                              setShowOptionsId(null);
                                            }}
                                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group"
                                          >
                                            <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                              block
                                            </span>
                                            <span>Block User</span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <h3 className="mt-3 sm:mt-4 md:mt-5 text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                              {poll.question}
                            </h3>

                            <div className="mt-3 sm:mt-4 md:mt-5 space-y-2 sm:space-y-3">
                              {poll.options.map((opt) => {
                                const percent = Math.max(
                                  0,
                                  Math.min(100, Number(opt.percentage) || 0),
                                );
                                const isSelected =
                                  String(opt.id) === String(myVote) ||
                                  Number(opt.is_voted_by_me) === 1;

                                return (
                                  <button
                                    key={`${pollId}-${opt.id}`}
                                    type="button"
                                    disabled={isBusy}
                                    onClick={(e) =>
                                      handlePollOptionClick(e, poll, opt.id)
                                    }
                                    className={`relative w-full rounded-xl border bg-white dark:bg-[#000302] overflow-hidden transition-all text-left min-h-[44px] sm:min-h-[52px] shadow-sm ${
                                      isSelected
                                        ? "border-emerald-400 bg-emerald-50 dark:border-[#00ff88]/35 dark:bg-[#000302]"
                                        : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-white/10 dark:hover:border-white/15 dark:hover:bg-white/5"
                                    } ${isBusy ? "opacity-70 cursor-wait" : ""}`}
                                  >
                                    <div
                                      className={`absolute inset-y-0 left-0 ${
                                        isSelected
                                          ? "bg-gradient-to-r from-[#00ff88]/45 to-[#00ff88]/10"
                                          : "bg-gradient-to-r from-[#00ff88]/25 to-[#00ff88]/5"
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    />
                                    <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5">
                                      <span
                                        className={`text-xs sm:text-sm font-semibold pr-1 sm:pr-2 break-words flex-1 ${
                                          isSelected
                                            ? "text-emerald-700 dark:text-white"
                                            : "text-slate-700 dark:text-slate-200"
                                        }`}
                                      >
                                        {opt.option_text}
                                      </span>
                                      <span className="flex items-center gap-1 sm:gap-2 shrink-0">
                                        {isSelected && (
                                          <MaterialIcon
                                            name="check_circle"
                                            className={`text-emerald-600 dark:text-[#00ff88] text-base sm:text-lg ${
                                              isSelected ? "scale-110" : ""
                                            }`}
                                          />
                                        )}
                                        <span
                                          className={`text-xs sm:text-sm font-black tabular-nums ${
                                            isSelected
                                              ? "text-emerald-600 dark:text-[#00ff88]"
                                              : "text-slate-500"
                                          }`}
                                        >
                                          {percent}%
                                        </span>
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="mt-3 sm:mt-4 flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-500 gap-2">
                              <span className="truncate">
                                {totalVotes.toLocaleString()} votes
                              </span>
                              {myVote ? (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={(e) => handlePollUndo(e, poll)}
                                  className="text-emerald-600 dark:text-[#00ff88] hover:text-emerald-600 dark:text-[#00ff88]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                  Undo vote
                                </button>
                              ) : (
                                <span className="text-slate-600 whitespace-nowrap">
                                  Tap to vote
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
};

export default PollSection;
