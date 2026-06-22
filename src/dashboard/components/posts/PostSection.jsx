import React from "react";
import avatar from "../../../assets/images/avatar.jpg";
import API_CONFIG from "../../../config/api.config";
import LikeCommentSave from "../interactions/LikeCommentSave";

const PostSection = ({ post, index, ctx }) => {
  const {
    userId,
    likedPosts,
    commentsState,
    showOptionsId,
    setShowOptionsId,
    savedPosts,
    videoMutedState,
    deletingPost,
    setShowDeletePopup,
    setShowReportPopup,
    setShowBlockPopup,
    setSelectedPost,
    pausedVideos,
    setPausedVideos,
    expandedPosts,
    connectedUsers,
    videoRefs,
    textRefs,
    showReadMore,
    formatDate,
    toggleVideoPlayPause,
    toggleVideoSound,
    toggleReadMorePost,
    handleOpenUserProfile,
    toggleConnect,
    getPostProfileSrc,
  } = ctx;
                    const isMockPost = post.author !== undefined;
                    const isResearchPost = post.isResearchPost === true;
                    const postId = post.id || post.researche_id;
                    const postName = isMockPost
                      ? post.author
                      : post.user_type === "institute"
                        ? post.institute_details?.institute_name ||
                          post.institute_name ||
                          post.name ||
                          "Institute"
                        : post.name || "User";
                    const postType = isMockPost
                      ? post.authorType
                      : post.user_type === "institute"
                        ? " Institute"
                        : "Individual";
                    const postContent = isMockPost
                      ? post.content
                      : post.post_text || post.abstract;
                    const isTextOnly =
                      !isMockPost &&
                      !isResearchPost &&
                      postContent &&
                      !post.image &&
                      !post.video &&
                      !post.research_file;
                    const postTime = isMockPost
                      ? post.time
                      : formatDate(post.created_at);

                    const isLiked = isMockPost
                      ? likedPosts[postId]
                      : post.is_liked === "1";
                    const isSaved = savedPosts[postId] || post.is_saved === "1";

                    const postComments = commentsState[postId] || {
                      isOpen: false,
                      list: [],
                    };
                    const postUserId = isMockPost ? userId : post.user_id;
                    const isCurrentUserPost =
                      String(userId) === String(postUserId) || isMockPost;
                    const isDeleting = deletingPost === postId;
                    const hasImage =
                      !isMockPost && post.image && post.image !== "";
                    const hasVideo =
                      !isMockPost && post.video && post.video !== "";
                    const videoUrl = hasVideo
                      ? `${API_CONFIG.BASE_URL}/${post.video}`
                      : null;
                    const isVideoMuted = !videoMutedState[postId];
                    return (
                      <article
                        key={`post-${postId}-${index}`}
                        className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-white/5 shadow-sm overflow-visible relative w-full"
                      >
                        <div className="p-3 sm:p-4 md:p-5">
                          <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 md:mt-3 mb-2 sm:mb-3 md:mb-4">
                            <img
                              alt={postName}
                              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              src={getPostProfileSrc(post)}
                              onError={(e) => {
                                e.target.src = avatar;
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenUserProfile(post, isMockPost);
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <h4
                                    className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:text-[#00ff88] cursor-pointer transition-colors capitalize truncate text-xs sm:text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenUserProfile(post, isMockPost);
                                    }}
                                  >
                                    {postName}
                                  </h4>
                                  <p className="text-[9px] sm:text-xs text-slate-500 capitalize mt-0.5 truncate flex items-center gap-0.5 flex-wrap">
                                    {postType}{" "}
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-500 inline-block"></span>{" "}
                                    {postTime}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                  {!isCurrentUserPost && (
                                    <button
                                      onClick={(e) =>
                                        toggleConnect(postUserId, e)
                                      }
                                      disabled={
                                        connectedUsers[postUserId] === 1
                                      }
                                      className={`min-w-[115px] h-8 px-3 sm:px-4 rounded-lg text-[9px] sm:text-xs font-bold transition-all duration-200 tracking-wide whitespace-nowrap flex items-center justify-center border ${
                                        connectedUsers[postUserId] === 2
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-[#092016] dark:text-[#00ff88] dark:border-[#00ff88]/40 dark:hover:bg-[#00ff88]/10"
                                          : connectedUsers[postUserId] === 1
                                            ? "bg-yellow-50 text-yellow-700 border-yellow-300 cursor-not-allowed dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/40"
                                            : "bg-[#00ff88] text-[#001f12] border-[#00ff88] hover:bg-[#00dd77] hover:scale-[1.02] shadow-[0_0_10px_rgba(0,255,136,0.25)]"
                                      }`}
                                    >
                                      {connectedUsers[postUserId] === 2
                                        ? "✓ CONNECTED"
                                        : connectedUsers[postUserId] === 1
                                          ? "⏳ PENDING"
                                          : "+ CONNECT"}
                                    </button>
                                  )}
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowOptionsId(
                                          showOptionsId === postId
                                            ? null
                                            : postId,
                                        );
                                      }}
                                      disabled={isDeleting}
                                      className="text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full hover:bg-white/5 transition-all duration-200"
                                    >
                                      <span className="material-symbols-outlined text-lg sm:text-xl">
                                        more_horiz
                                      </span>
                                    </button>
                                    {showOptionsId === postId && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowOptionsId(null);
                                          }}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-[#1e293b] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 animate-fadeInScale">
                                          {" "}
                                          {isCurrentUserPost ? (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPost({
                                                  postId,
                                                  isMockPost,
                                                  postUserId,
                                                  postName,
                                                });
                                                setShowDeletePopup(true);
                                              }}
                                              disabled={isDeleting}
                                              className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              <span className="material-symbols-outlined text-xs sm:text-sm group-hover:scale-110 transition-transform">
                                                delete
                                              </span>
                                              <span>
                                                {isDeleting
                                                  ? "Deleting..."
                                                  : "Delete Post"}
                                              </span>
                                            </button>
                                          ) : (
                                            <>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedPost({
                                                    postId,
                                                    isMockPost,
                                                    postUserId,
                                                    postName,
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
                                                <span>Report Post</span>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedPost({
                                                    postId,
                                                    isMockPost,
                                                    postUserId,
                                                    postName,
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
                              </div>
                            </div>
                          </div>

                          {isTextOnly ? (
                            <div className="mb-2 sm:mb-3 md:mb-4 w-full">
                              <p
                                ref={(el) => {
                                  if (el) textRefs.current[postId] = el;
                                }}
                                className={`text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words ${
                                  expandedPosts[postId] ? "" : "line-clamp-10"
                                }`}
                              >
                                {postContent}
                              </p>

                              {/* 👇 yahi add karna hai */}
                              {showReadMore[postId] && (
                                <button
                                  onClick={() => toggleReadMorePost(postId)}
                                  className="text-emerald-600 dark:text-[#00ff88] text-[10px] sm:text-xs hover:underline mt-2 block font-semibold"
                                >
                                  {expandedPosts[postId]
                                    ? " Show less"
                                    : "... Read more"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="mb-2 sm:mb-3 md:mb-4">
                              <div
                                className={`text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 break-words whitespace-pre-wrap ${expandedPosts[postId] ? "" : "line-clamp-4"}`}
                              >
                                {postContent}
                              </div>
                              {postContent?.length > 150 && (
                                <span
                                  onClick={() => toggleReadMorePost(postId)}
                                  className="text-emerald-600 dark:text-[#00ff88] cursor-pointer text-[9px] sm:text-xs hover:underline block mt-1"
                                >
                                  {expandedPosts[postId]
                                    ? "Show less"
                                    : "... Read more"}
                                </span>
                              )}
                            </div>
                          )}

                          {Array.isArray(post.hash_tag) &&
                            post.hash_tag.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
                                {post.hash_tag.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          {isMockPost && post.media && (
                            <div className="mt-2 sm:mt-3 md:mt-4 rounded-lg sm:rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#000302] flex justify-center max-h-[200px] sm:max-h-[350px] md:max-h-[500px] relative w-full">
                              {post.mediaType === "image" ? (
                                <img
                                  src={post.media}
                                  alt="Post media"
                                  className="object-contain max-h-[200px] sm:max-h-[350px] md:max-h-[500px] w-auto"
                                />
                              ) : post.mediaType === "video" ? (
                                <div className="relative w-full">
                                  <video
                                    ref={(el) => {
                                      if (el) {
                                        videoRefs.current[`video-${postId}`] =
                                          el;
                                        el.setAttribute(
                                          "data-video-id",
                                          postId,
                                        );
                                      }
                                    }}
                                    src={post.media}
                                    muted={isVideoMuted}
                                    playsInline
                                    className="max-h-[200px] sm:max-h-[350px] md:max-h-[500px] w-full bg-slate-100 dark:bg-[#000302] cursor-pointer"
                                    loop={false}
                                    onClick={(e) =>
                                      toggleVideoPlayPause(postId, e)
                                    }
                                  />
                                  <button
                                    onClick={(e) => toggleVideoSound(postId, e)}
                                    className="absolute bottom-2 sm:bottom-3 md:bottom-4 right-2 sm:right-3 md:right-4 bg-slate-100 dark:bg-[#000302]/70 hover:bg-slate-100 dark:bg-[#000302]/90 text-slate-900 dark:text-white rounded-full p-1 sm:p-1.5 md:p-2 transition-all z-10"
                                  >
                                    <span className="material-symbols-outlined text-base sm:text-lg">
                                      {isVideoMuted
                                        ? "volume_off"
                                        : "volume_up"}
                                    </span>
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          )}

                          {!isMockPost && (hasImage || hasVideo) && (
                            <div className="mt-2 sm:mt-3 md:mt-4 rounded-lg sm:rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#000302] flex justify-center max-h-[200px] sm:max-h-[350px] md:max-h-[500px] relative w-full">
                              {hasImage && (
                                <img
                                  src={`${API_CONFIG.BASE_URL}/${post.image}`}
                                  alt="Post media"
                                  className="object-contain max-h-[200px] sm:max-h-[350px] md:max-h-[500px] w-auto"
                                  onError={(e) => {
                                    e.target.src = post.image;
                                  }}
                                />
                              )}
                              {hasVideo && (
                                <div
                                  className="relative w-full"
                                  onClick={(e) =>
                                    toggleVideoPlayPause(postId, e)
                                  }
                                >
                                  <video
                                    ref={(el) => {
                                      if (el) {
                                        videoRefs.current[`video-${postId}`] =
                                          el;
                                        el.setAttribute(
                                          "data-video-id",
                                          postId,
                                        );
                                      }
                                    }}
                                    src={videoUrl}
                                    muted={isVideoMuted}
                                    playsInline
                                    className="max-h-[200px] sm:max-h-[350px] md:max-h-[500px] w-full bg-slate-100 dark:bg-[#000302]"
                                    loop={false}
                                    onClick={(e) =>
                                      toggleVideoPlayPause(postId, e)
                                    }
                                    onError={(e) => {
                                      console.error(
                                        "Video failed to load:",
                                        videoUrl,
                                      );
                                      e.target.src = post.video;
                                    }}
                                    onPlay={() =>
                                      setPausedVideos((prev) => ({
                                        ...prev,
                                        [postId]: false,
                                      }))
                                    }
                                    onPause={() =>
                                      setPausedVideos((prev) => ({
                                        ...prev,
                                        [postId]: true,
                                      }))
                                    }
                                  />
                                  {pausedVideos[postId] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/25 pointer-events-none">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#00ff88]/90 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.35)] animate-fadeInScale">
                                        <span className="material-symbols-outlined text-black text-2xl sm:text-3xl md:text-4xl">
                                          play_arrow
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => toggleVideoSound(postId, e)}
                                    className="absolute bottom-2 sm:bottom-3 md:bottom-4 right-2 sm:right-3 md:right-4 bg-slate-100 dark:bg-[#000302]/70 hover:bg-slate-100 dark:bg-[#000302]/90 text-slate-900 dark:text-white rounded-full p-1 sm:p-1.5 md:p-2 transition-all z-10"
                                  >
                                    <span className="material-symbols-outlined text-base sm:text-lg">
                                      {isVideoMuted
                                        ? "volume_off"
                                        : "volume_up"}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <LikeCommentSave
                          post={post}
                          postId={postId}
                          isLiked={isLiked}
                          isSaved={isSaved}
                          isMockPost={isMockPost}
                          postComments={postComments}
                          showShare={true}
                          commentsContainerClassName="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 scrollbar-hidden"
                          ctx={ctx}
                        />
                      </article>
                    );
};

export default PostSection;
