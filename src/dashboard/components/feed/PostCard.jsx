import React from "react";
import avatar from "../../../assets/images/avatar.jpg";
import API_CONFIG from "../../../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const PostCard = ({
  post, userId, connectedUsers,
  likedPosts, savedPosts, commentsState, newCommentText, setNewCommentText,
  expandedComments, setExpandedComments, expandedPosts, setExpandedPosts,
  showOptionsId, setShowOptionsId, deletingPost,
  onConnect, onOpenProfile, onToggleLike, onToggleSave,
  onToggleComments, onAddComment, onDeleteComment,
  onShowDelete, onShowBlock, onShare,
  videoRefs, pausedVideos, videoMutedState,
  onToggleVideoPlayPause, onToggleVideoSound,
  formatDate, formatTimeAgo,
}) => {
  const isMockPost = post.author !== undefined;
  const postId = post.id || post.researche_id;
  const postName = isMockPost ? post.author
    : post.user_type === "institute"
    ? post.institute_details?.institute_name || post.name || "Institute"
    : post.name || "User";
  const postType = isMockPost ? post.authorType : post.user_type === "institute" ? "Institute" : "Individual";
  const postContent = isMockPost ? post.content : post.post_text;
  const postTime = isMockPost ? post.time : formatDate(post.created_at);
  const postUserId = isMockPost ? userId : post.user_id;
  const isCurrentUserPost = String(userId) === String(postUserId) || isMockPost;
  const isDeleting = deletingPost === postId;
  const isLiked = isMockPost ? likedPosts[postId] : post.is_liked === "1";
  const isSaved = savedPosts[postId] || post.is_saved === "1";
  const postComments = commentsState[postId] || { isOpen: false, list: [] };
  const hasImage = !isMockPost && post.image;
  const hasVideo = !isMockPost && post.video;
  const isVideoMuted = !videoMutedState[postId];
  const isTextOnly = !isMockPost && postContent && !post.image && !post.video;

  const getProfileSrc = () => post.profile_image ? `${API_CONFIG.BASE_URL}/${post.profile_image}` : avatar;

  return (
    <article className="bg-[#020f0a] rounded-2xl border border-white/5 shadow-sm overflow-visible relative mb-6">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-5 mt-2 mb-3">
          <img
            alt={postName}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00ff88]/20 object-cover shrink-0 cursor-pointer"
            src={getProfileSrc()}
            onError={(e) => { e.target.src = avatar; }}
            onClick={(e) => { e.stopPropagation(); onOpenProfile(post, isMockPost); }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white hover:text-[#00ff88] cursor-pointer text-sm sm:text-base truncate"
                  onClick={(e) => { e.stopPropagation(); onOpenProfile(post, isMockPost); }}>
                  {postName}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  {postType} <span className="w-1 h-1 rounded-full bg-slate-500 inline-block" /> {postTime}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isCurrentUserPost && (
                  <button onClick={(e) => onConnect(postUserId, e)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all tracking-wider ${
                      connectedUsers[postUserId] === 2 ? "text-slate-400 border border-slate-600"
                      : connectedUsers[postUserId] === 1 ? "text-yellow-400 border border-yellow-600 cursor-not-allowed"
                      : "text-[#00ff88] hover:bg-[#00ff88] hover:text-black border border-transparent"
                    }`}>
                    {connectedUsers[postUserId] === 2 ? "✓ CONNECTED" : connectedUsers[postUserId] === 1 ? "⏳ PENDING" : "+ CONNECT"}
                  </button>
                )}
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setShowOptionsId(showOptionsId === postId ? null : postId); }}
                    disabled={isDeleting}
                    className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5">
                    <MaterialIcon name="more_horiz" />
                  </button>
                  {showOptionsId === postId && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowOptionsId(null); }} />
                      <div className="absolute right-0 mt-2 w-44 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 overflow-hidden z-20">
                        {isCurrentUserPost && (
                          <button onClick={(e) => { e.stopPropagation(); onShowDelete(postId, isMockPost, postUserId, postName); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3">
                            <MaterialIcon name="delete" className="text-sm" />
                            {isDeleting ? "Deleting..." : "Delete Post"}
                          </button>
                        )}
                        {!isCurrentUserPost && (
                          <button onClick={(e) => { e.stopPropagation(); onShowBlock(postId, isMockPost, postUserId, postName); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-3">
                            <MaterialIcon name="block" className="text-sm" />
                            Block User
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isTextOnly ? (
          <div className="sm:ml-16 mb-3">
            <div className="bg-[#000302] border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-200 leading-relaxed">
              <span className={expandedPosts[postId] ? "" : "line-clamp-10"}>{postContent}</span>
              {postContent?.length > 300 && (
                <span onClick={() => setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }))}
                  className="text-[#00ff88] cursor-pointer ml-1 text-xs hover:underline">
                  {expandedPosts[postId] ? "Show less" : "... Read more"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-300 break-words whitespace-pre-wrap mb-3 sm:ml-16">{postContent}</div>
        )}

        {/* Media */}
        {(hasImage || hasVideo || (isMockPost && post.media)) && (
          <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black flex justify-center max-h-[400px] sm:ml-16 relative">
            {hasImage && <img src={`${API_CONFIG.BASE_URL}/${post.image}`} alt="Post" className="object-contain max-h-[400px] w-auto" onError={(e) => { e.target.src = post.image; }} />}
            {hasVideo && (
              <div className="relative w-full" onClick={(e) => onToggleVideoPlayPause(postId, e)}>
                <video
                  ref={(el) => { if (el) { videoRefs.current[`video-${postId}`] = el; } }}
                  src={`${API_CONFIG.BASE_URL}/${post.video}`}
                  muted={isVideoMuted} playsInline
                  className="max-h-[400px] w-full bg-black"
                />
                {pausedVideos[postId] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="w-14 h-14 bg-[#00ff88]/80 rounded-full flex items-center justify-center">
                      <MaterialIcon name="play_arrow" className="text-black text-4xl" />
                    </div>
                  </div>
                )}
                <button onClick={(e) => onToggleVideoSound(postId, e)} className="absolute bottom-4 right-4 bg-black/70 text-white rounded-full p-2">
                  <MaterialIcon name={isVideoMuted ? "volume_off" : "volume_up"} />
                </button>
              </div>
            )}
            {isMockPost && post.media && post.mediaType === "image" && <img src={post.media} alt="Post" className="object-contain max-h-[400px] w-auto" />}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-6 pt-4 border-t border-white/5 sm:pl-16 flex-wrap">
          <button onClick={() => onToggleLike(postId)} className={`flex items-center gap-2 transition-colors ${isLiked ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}>
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            <span className="text-xs font-bold">{parseInt(post.like_count || 0) > 0 ? post.like_count : <span className="hidden sm:inline">Like</span>}</span>
          </button>
          <button onClick={() => onToggleComments(postId)} className={`flex items-center gap-2 transition-colors ${postComments.isOpen ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}>
            <MaterialIcon name="chat_bubble" className="text-xl" />
            <span className="text-xs font-bold">
              <span className="hidden sm:inline">Comment </span>
              {postComments.list.length > 0 ? `(${postComments.list.length})` : post.comment_count ? `(${post.comment_count})` : ""}
            </span>
          </button>
          <button onClick={() => onShare(postName, postContent)} className="flex items-center gap-2 text-slate-500 hover:text-[#00ff88] transition-colors">
            <MaterialIcon name="share" className="text-xl" />
            <span className="hidden sm:inline text-xs font-bold">Share</span>
          </button>
          <button onClick={() => onToggleSave(postId)} className={`ml-auto flex items-center gap-2 transition-colors ${isSaved ? "text-[#00ff88]" : "text-slate-500 hover:text-[#00ff88]"}`}>
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
            <span className="hidden sm:inline text-xs font-bold">Save</span>
          </button>
        </div>

        {/* Comments */}
        {postComments.isOpen && (
          <div className="mt-5 sm:pl-16 space-y-4">
            <div className="relative">
              <input type="text" value={newCommentText[postId] || ""}
                onChange={(e) => setNewCommentText(prev => ({ ...prev, [postId]: e.target.value }))}
                onKeyPress={(e) => { if (e.key === "Enter") onAddComment(postId, newCommentText[postId] || ""); }}
                placeholder="Add a comment..."
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00ff88]/50 pr-10 text-white" />
              <button onClick={() => onAddComment(postId, newCommentText[postId] || "")}
                className="absolute right-3 top-2.5 text-[#00ff88]">
                <MaterialIcon name="send" className="text-sm" />
              </button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hidden">
              {postComments.list.length > 0 ? postComments.list.map(comment => (
                <div key={comment.id} className="flex gap-3 group">
                  <img alt={comment.author} className="w-8 h-8 rounded-full border border-white/10 object-cover shrink-0 cursor-pointer"
                    src={comment.authorAvatar || avatar} onError={(e) => { e.target.src = avatar; }}
                    onClick={() => onOpenProfile({ user_id: comment.authorId, name: comment.author }, false)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white cursor-pointer hover:text-[#00ff88]"
                        onClick={() => onOpenProfile({ user_id: comment.authorId, name: comment.author }, false)}>
                        {comment.author}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{formatTimeAgo(comment.timestamp)}</span>
                        {comment.authorId === userId && (
                          <button onClick={() => onDeleteComment(postId, comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                            <MaterialIcon name="delete" className="text-sm" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs text-slate-300 mt-1 leading-relaxed ${expandedComments[comment.id] ? "" : "line-clamp-3"}`}>{comment.text}</p>
                    {comment.text.length > 120 && (
                      <button onClick={() => setExpandedComments(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                        className="text-[10px] text-[#00ff88] mt-1 hover:underline">
                        {expandedComments[comment.id] ? "Show less" : "Read more"}
                      </button>
                    )}
                    <div className="border-b border-white/10 mt-3" />
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-slate-500 text-center py-4 uppercase tracking-widest italic">No comments yet. Be the first!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;