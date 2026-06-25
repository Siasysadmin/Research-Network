import React from "react";
import avatar from "../../../assets/images/avatar.jpg";
import API_CONFIG from "../../../config/api.config";
import LikeCommentSave from "../interactions/LikeCommentSave";

const ResearchSection = ({ post, index, ctx }) => {
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
    expandedPosts,
    connectedUsers,
    getFileInfo,
    formatDate,
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
                      const fileInfo = getFileInfo(post.research_file);
                      return (
                        <article
                          key={`res-${postId}-${index}`}
                          className="bg-white dark:bg-[#020f0a] rounded-lg sm:rounded-xl border border-white/5 shadow-sm overflow-visible relative w-full"
                        >
                          <div className="p-3 sm:p-4 md:p-5">
                            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 md:mt-4 mb-3 sm:mb-4 md:mb-5">
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
                                          <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-[#1e293b] rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-20 animate-fadeInScale">
                                            {isCurrentUserPost && (
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
                                            )}

                                            {!isCurrentUserPost && (
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

                           <div className="mb-2 sm:mb-3 md:mb-4">
                              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-snug break-words">
                                {post.research_title || "Published Research"}
                              </h3>
                            </div>

                           
                           {/* ── RESEARCH ABSTRACT 3-LINE CLAMP WITH READ MORE ── */}
                            <div className="mb-3 sm:mb-4 md:mb-5">
                              <p 
                                className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap"
                                style={!expandedPosts[postId] ? {
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  WebkitLineClamp: 3,
                                } : {}}
                              >
                                {postContent}
                              </p>
                              
                              {/* Show Read More / Less conditionally based on text length */}
                              {postContent?.length > 160 && (
                                <button
                                  type="button"
                                  onClick={() => toggleReadMorePost(postId)}
                                  className="text-emerald-600 dark:text-[#00ff88] text-[10px] sm:text-xs font-semibold hover:underline mt-1.5 block"
                                >
                                  {expandedPosts[postId] ? "Show less" : "... Read more"}
                                </button>
                              )}
                            </div>

                            {/* ── 💡 NEW: KEYWORDS DISPLAY GENERATION ── */}
                            {Array.isArray(post.keywords) && post.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {post.keywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] sm:text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-medium"
                                  >
                                    {kw}
                                  </span>
                                ))}
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
                            {post.research_file && (
                              <div className="mb-3 sm:mb-4 md:mb-5">
                                <div className="bg-slate-100 dark:bg-[#0e0f10] border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-white/20 transition-all gap-2 sm:gap-3">
                                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg bg-slate-200 dark:bg-[#0f172a] border border-emerald-200 dark:border-[#00ff88]/20 flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ff88] text-lg sm:text-xl md:text-2xl">
                                        description
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {fileInfo.name}
                                      </p>
                                      <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                                        {fileInfo.pages} • {fileInfo.size}
                                      </p>
                                    </div>
                                  </div>
                                  <a
                                    href={`${API_CONFIG.BASE_URL}/${post.research_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00ff88] text-black font-bold text-xs sm:text-sm rounded-lg hover:bg-[#00dd77] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                                  >
                                    <span className="material-symbols-outlined text-xs sm:text-sm">
                                      open_in_new
                                    </span>
                                    <span>View</span>
                                  </a>
                                </div>
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
                            showShare={false}
                            commentsContainerClassName="space-y-3 sm:space-y-4 max-h-[200px] sm:max-h-[280px] overflow-y-auto pr-2 scrollbar-hidden"
                            ctx={ctx}
                          />
                        </article>
                      );
};

export default ResearchSection;
