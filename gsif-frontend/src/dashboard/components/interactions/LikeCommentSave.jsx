import React from "react";
import avatar from "../../../assets/images/avatar.jpg";

const LikeCommentSave = ({
  post,
  postId,
  isLiked,
  isSaved,
  isMockPost,
  postComments,
  showShare,
  commentsContainerClassName,
  ctx,
}) => {
  const {
    userId,
    newCommentText,
    setNewCommentText,
    expandedComments,
    handleOpenUserProfile,
    handleShareClick,
    toggleLike,
    toggleSave,
    toggleComments,
    addComment,
    deleteComment,
    toggleReadMore,
    formatTimeAgo,
  } = ctx;
  return (
                        <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 pt-2 sm:pt-3 md:pt-4 border-t border-white/5 flex-wrap w-full">
                            <button
                              onClick={() => toggleLike(postId)}
                              className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${isLiked ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                            >
                              <span
                                className="material-symbols-outlined text-base sm:text-lg"
                                style={{
                                  fontVariationSettings: isLiked
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                                }}
                              >
                                favorite
                              </span>
                              <span className="text-[9px] sm:text-xs font-bold">
                                {parseInt(post.like_count || 0) > 0 ||
                                (isMockPost && isLiked)
                                  ? isMockPost
                                    ? isLiked
                                      ? 1
                                      : 0
                                    : post.like_count
                                  : "Like"}
                              </span>
                            </button>
                            <button
                              onClick={() => toggleComments(postId)}
                              className={`flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${postComments.isOpen ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                            >
                              <span className="material-symbols-outlined text-base sm:text-lg">
                                chat_bubble
                              </span>
                              <span className="text-[9px] sm:text-xs font-bold">
                                {postComments.list.length > 0
                                  ? `(${postComments.list.length})`
                                  : post.comment_count &&
                                      !postComments.list.length
                                    ? `(${post.comment_count})`
                                    : ""}
                              </span>
                            </button>
                            {showShare && (
                              <button
                                onClick={() =>
                                  handleShareClick(post.id || post.researche_id)
                                }
                                className="flex items-center gap-0.5 sm:gap-1 text-slate-500 hover:text-emerald-600 dark:text-[#00ff88] transition-colors text-xs sm:text-sm"
                              >
                                <span className="material-symbols-outlined text-base sm:text-lg">
                                  share
                                </span>
                                <span className="hidden sm:inline text-xs font-bold">
                                  Share
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => toggleSave(postId)}
                              className={`ml-auto flex items-center gap-0.5 sm:gap-1 transition-colors text-xs sm:text-sm ${isSaved ? "text-emerald-600 dark:text-[#00ff88]" : "text-slate-500 hover:text-emerald-600 dark:text-[#00ff88]"}`}
                            >
                              <span
                                className="material-symbols-outlined text-base sm:text-lg"
                                style={{
                                  fontVariationSettings: isSaved
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                                }}
                              >
                                bookmark
                              </span>
                              <span className="hidden sm:inline text-xs font-bold">
                                Save
                              </span>
                            </button>
                          </div>

                          {postComments.isOpen && (
                            <div className="mt-4 sm:mt-6 sm:pl-16 space-y-4 sm:space-y-5">
                              <div className="flex gap-2 sm:gap-3 items-start">
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={newCommentText[postId] || ""}
                                    onChange={(e) =>
                                      setNewCommentText((prev) => ({
                                        ...prev,
                                        [postId]: e.target.value,
                                      }))
                                    }
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        addComment(
                                          postId,
                                          newCommentText[postId] || "",
                                        );
                                      }
                                    }}
                                    placeholder="Add a comment..."
                                    className="w-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 dark:focus:border-[#00ff88]/50 transition-colors pr-10 text-slate-800 dark:text-white placeholder:text-slate-400"
                                    style={{
                                      outline: "none",
                                      boxShadow: "none",
                                    }}
                                  />
                                  <button
                                    onClick={() =>
                                      addComment(
                                        postId,
                                        newCommentText[postId] || "",
                                      )
                                    }
                                    className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-emerald-600 dark:text-[#00ff88] hover:text-emerald-600 dark:text-[#00ff88]/80 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      send
                                    </span>
                                  </button>
                                </div>
                              </div>

                              <div className={commentsContainerClassName}>
                                {postComments.list.length > 0 ? (
                                  postComments.list.map((comment) => (
                                    <div
                                      key={comment.id}
                                      className="flex gap-2 sm:gap-3 group"
                                    >
                                      <img
                                        alt={comment.author}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-white/10 object-cover shrink-0 cursor-pointer"
                                        src={comment.authorAvatar || avatar}
                                        onError={(e) => {
                                          e.target.src = avatar;
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenUserProfile(
                                            {
                                              user_id: comment.authorId,
                                              name: comment.author,
                                            },
                                            false,
                                          );
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span
                                            className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white pr-2 truncate cursor-pointer hover:text-emerald-600 dark:text-[#00ff88]"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenUserProfile(
                                                {
                                                  user_id: comment.authorId,
                                                  name: comment.author,
                                                },
                                                false,
                                              );
                                            }}
                                          >
                                            {comment.author}
                                          </span>
                                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">
                                              {formatTimeAgo(comment.timestamp)}
                                            </span>
                                            {comment.authorId === userId && (
                                              <button
                                                onClick={() =>
                                                  deleteComment(
                                                    postId,
                                                    comment.id,
                                                  )
                                                }
                                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                                              >
                                                <span className="material-symbols-outlined text-xs sm:text-sm">
                                                  delete
                                                </span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <p
                                          className={`text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}
                                        >
                                          {comment.text}
                                        </p>
                                        {comment.text.length > 120 && (
                                          <button
                                            onClick={() =>
                                              toggleReadMore(comment.id)
                                            }
                                            className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-[#00ff88] mt-1 hover:underline"
                                          >
                                            {expandedComments[comment.id]
                                              ? "Show less"
                                              : "Read more"}
                                          </button>
                                        )}
                                        <div className="border-b border-slate-200 dark:border-white/10 mt-2 sm:mt-3"></div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 sm:py-6">
                                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest italic">
                                      No comments yet. Be the first to discuss!
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
  );
};

export default LikeCommentSave;
