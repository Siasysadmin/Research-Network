import React, { useState } from "react";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

// Dummy avatar
const AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=roshni";

const DUMMY_POSTS = [
  {
    id: 1,
    author: "Roshni",
    date: "24 Apr 2026",
    text: "exam ka time table aa gaya kya sabka?",
    image: null,
    video: null,
    poll: null,
    likes: 12,
    comments: 4,
    type: "text",
  },
  {
    id: 2,
    author: "Roshni",
    date: "23 Apr 2026",
    text: "Sunset view from my campus 🌅",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    video: null,
    poll: null,
    likes: 28,
    comments: 7,
    type: "image",
  },
  {
    id: 3,
    author: "Roshni",
    date: "21 Apr 2026",
    text: "Climate change awareness event highlights 🎬",
    image:
      "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?w=600&q=80",
    video: true,
    videoDuration: "01:24",
    poll: null,
    likes: 36,
    comments: 9,
    type: "video",
  },
  {
    id: 4,
    author: "Roshni",
    date: "19 Apr 2026",
    text: "Great discussion in today's research meeting. Learned so much!",
    image: null,
    video: null,
    poll: null,
    likes: 18,
    comments: 3,
    type: "text",
  },
  {
    id: 5,
    author: "Roshni",
    date: "18 Apr 2026",
    text: "Some clicks from the sustainability workshop 📸",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    extraImages: [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=200&q=80",
    ],
    video: null,
    poll: null,
    likes: 22,
    comments: 5,
    type: "multi-image",
  },
  {
    id: 6,
    author: "Roshni",
    date: "17 Apr 2026",
    text: "Which topic should be our next research focus?",
    image: null,
    video: null,
    poll: {
      options: [
        { label: "Renewable Energy", percent: 45 },
        { label: "Sustainable Cities", percent: 35 },
        { label: "Waste Management", percent: 20 },
      ],
      totalVotes: 20,
    },
    likes: 0,
    comments: 0,
    type: "poll",
  },
];

// ✅ SINGLE POST CARD (with onClick handler)
const PostCard = ({ post, isGrid, onPostClick }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation(); // ✅ Prevent modal from opening when clicking like
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation(); // ✅ Prevent modal from opening when clicking menu
    setMenuOpen(!menuOpen);
  };

  const handleCardClick = () => {
    if (onPostClick) {
      onPostClick(post); // ✅ Open modal with full post
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        bg-white dark:bg-[#141414]
        border border-gray-200 dark:border-white/10
        rounded-2xl overflow-hidden
        flex flex-col
        transition-all duration-200
        hover:border-gray-300 dark:hover:border-white/20
        hover:shadow-xl
        cursor-pointer
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <img
            src={AVATAR}
            alt={post.author}
            className="w-9 h-9 rounded-full border-2 border-[#00ff85]/30 object-cover bg-gray-200"
          />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
              {post.author}
            </p>
            <p className="text-[11px] text-slate-400">{post.date}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-lg"
          >
            <MaterialIcon name="more_vert" className="text-xl" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-1 min-w-[130px]">
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
              >
                <MaterialIcon name="edit" className="text-base" /> Edit
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
              >
                <MaterialIcon name="delete" className="text-base" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {post.text}
        </p>
      </div>

      {/* Media - Thumbnail version for card */}
      {post.type === "image" && post.image && (
        <div className="w-full bg-gray-100 dark:bg-black">
          <img
            src={post.image}
            alt="post"
            className="w-full object-cover max-h-[280px]"
          />
        </div>
      )}

      {post.type === "video" && post.image && (
        <div className="relative w-full bg-black">
          <img
            src={post.image}
            alt="video thumb"
            className="w-full object-cover max-h-[280px] opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-[#00ff85] rounded-full flex items-center justify-center shadow-lg">
              <MaterialIcon
                name="play_arrow"
                className="text-3xl text-black ml-1"
              />
            </div>
          </div>
          <div className="absolute bottom-2 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-mono">
            {post.videoDuration}
          </div>
        </div>
      )}

      {post.type === "multi-image" && post.image && (
        <div className="grid grid-cols-3 gap-0.5">
          <img
            src={post.image}
            alt="post"
            className="w-full h-32 object-cover col-span-1"
          />
          {post.extraImages?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="post"
              className="w-full h-32 object-cover"
            />
          ))}
        </div>
      )}

      {/* Poll - Thumbnail version */}
      {post.type === "poll" && post.poll && (
        <div className="px-4 pb-3 space-y-2">
          {post.poll.options.map((opt, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                <span>{opt.label}</span>
                <span>{opt.percent}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-[#00ff85]"
                  style={{ width: `${opt.percent}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-slate-400 pt-1">
            {post.poll.totalVotes} votes •{" "}
            <button
              onClick={(e) => e.stopPropagation()}
              className="text-[#00ff85] hover:underline font-semibold"
            >
              View results
            </button>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 px-4 py-3 border-t border-gray-100 dark:border-white/5 mt-auto">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
            liked ? "text-[#00ff85]" : "text-slate-400 hover:text-[#00ff85]"
          }`}
        >
          <MaterialIcon
            name="favorite"
            className="text-lg"
            style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
          />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#00ff85] transition-all"
        >
          <MaterialIcon name="chat_bubble" className="text-lg" />
          {post.comments > 0 && <span>{post.comments}</span>}
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#00ff85] transition-all ml-auto"
        >
          <MaterialIcon name="share" className="text-lg" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

// ✅ POST MODAL COMPONENT (Full size view)
const PostModal = ({ post, onClose }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Amit Kumar",
      text: "Great post! 🔥",
      time: "2 hours ago",
    },
    {
      id: 2,
      author: "Priya Singh",
      text: "Very informative 👍",
      time: "5 hours ago",
    },
  ]);

  if (!post) return null;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now(),
          author: "You",
          text: commentText,
          time: "Just now",
        },
      ]);
      setCommentText("");
    }
  };

  // Close modal on Escape key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="relative max-w-5xl w-full max-h-[90vh] bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all flex items-center justify-center"
          >
            <MaterialIcon name="close" className="text-2xl" />
          </button>

          <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
            {/* Left Side - Media */}
            <div className="flex-1 bg-black/5 dark:bg-black/50 flex items-center justify-center p-4 md:p-6 min-h-[300px] md:min-h-0">
              {post.type === "image" && post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              )}

              {post.type === "video" && post.image && (
                <div className="relative w-full max-h-[60vh] flex items-center justify-center">
                  <img
                    src={post.image}
                    alt="Video thumbnail"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-[#00ff85] rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform">
                      <MaterialIcon
                        name="play_arrow"
                        className="text-5xl text-black ml-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {post.type === "multi-image" && post.image && (
                <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-auto">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full object-cover rounded-lg"
                  />
                  {post.extraImages?.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Post"
                      className="w-full object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {post.type === "text" && (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-[#00ff85]/20 rounded-full flex items-center justify-center mb-4">
                    <MaterialIcon
                      name="article"
                      className="text-4xl text-[#00ff85]"
                    />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Text post
                  </p>
                </div>
              )}

              {post.type === "poll" && post.poll && (
                <div className="w-full max-h-[60vh] overflow-auto p-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                    {post.text}
                  </h3>
                  <div className="space-y-3">
                    {post.poll.options.map((opt, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300">
                            {opt.label}
                          </span>
                          <span className="text-[#00ff85] font-bold">
                            {opt.percent}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-[#00ff85] transition-all"
                            style={{ width: `${opt.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 mt-4">
                    {post.poll.totalVotes} total votes
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Comments & Interactions */}
            <div className="w-full md:w-96 flex flex-col bg-white dark:bg-[#111111] border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10">
              {/* Post Info Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-white/10">
                <img
                  src={AVATAR}
                  alt={post.author}
                  className="w-10 h-10 rounded-full border-2 border-[#00ff85]/30"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {post.author}
                  </p>
                  <p className="text-xs text-slate-400">{post.date}</p>
                </div>
              </div>

              {/* Post Text */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {post.text}
                </p>
              </div>

              {/* Like & Share Actions */}
              <div className="flex items-center gap-6 p-4 border-b border-gray-200 dark:border-white/10">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 text-sm font-bold transition-all ${
                    liked
                      ? "text-[#00ff85]"
                      : "text-slate-500 hover:text-[#00ff85]"
                  }`}
                >
                  <MaterialIcon
                    name="favorite"
                    className="text-2xl"
                    style={{
                      fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
                    }}
                  />
                  <span>{likeCount} likes</span>
                </button>
                <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#00ff85] transition-all">
                  <MaterialIcon name="share" className="text-2xl" />
                  <span>Share</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Comments ({comments.length + (post.comments || 0)})
                </p>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {comment.author}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {comment.text}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {comment.time}
                      </p>
                    </div>
                    <button className="text-slate-400 hover:text-[#00ff85]">
                      <MaterialIcon name="favorite" className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <form
                onSubmit={handleAddComment}
                className="p-4 border-t border-gray-200 dark:border-white/10"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 rounded-xl text-sm bg-gray-100 dark:bg-white/10 border-0 focus:ring-2 focus:ring-[#00ff85] outline-none text-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-2 rounded-xl bg-[#00ff85] text-black font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00ff85]/90 transition-all"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </>
  );
};

// ✅ MAIN Myposts COMPONENT
const Myposts = () => {
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [filter, setFilter] = useState("All Posts");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); // ✅ For modal

  const filters = ["All Posts", "Images", "Videos", "Polls", "Text"];

  const filteredPosts = DUMMY_POSTS.filter((p) => {
    if (filter === "All Posts") return true;
    if (filter === "Images")
      return p.type === "image" || p.type === "multi-image";
    if (filter === "Videos") return p.type === "video";
    if (filter === "Polls") return p.type === "poll";
    if (filter === "Text") return p.type === "text";
    return true;
  });

  const handlePostClick = (post) => {
    setSelectedPost(post);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-3 mb-5">
        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              bg-white dark:bg-[#1a1a1a]
              border border-gray-200 dark:border-white/10
              text-xs font-bold text-slate-700 dark:text-slate-300
              hover:border-[#00ff85]/50 transition-all
            "
          >
            {filter}
            <MaterialIcon name="keyboard_arrow_down" className="text-base" />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-10 z-20 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-1 min-w-[130px]">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-all ${
                    filter === f
                      ? "text-[#00ff85] font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-all ${
              viewMode === "list"
                ? "bg-[#00ff85] text-black"
                : "bg-white dark:bg-[#1a1a1a] text-slate-400 hover:text-slate-600 dark:hover:text-white"
            }`}
          >
            <MaterialIcon name="view_list" className="text-xl" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-all ${
              viewMode === "grid"
                ? "bg-[#00ff85] text-black"
                : "bg-white dark:bg-[#1a1a1a] text-slate-400 hover:text-slate-600 dark:hover:text-white"
            }`}
          >
            <MaterialIcon name="grid_view" className="text-xl" />
          </button>
        </div>
      </div>

      {/* Posts Grid/List */}
      {filteredPosts.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-4"
          }
        >
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isGrid={viewMode === "grid"}
              onPostClick={handlePostClick} // ✅ Pass click handler
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl opacity-60">
          <MaterialIcon
            name="article"
            className="text-5xl text-slate-300 dark:text-white/20 mb-3"
          />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
            No posts found
          </p>
        </div>
      )}

      {/* ✅ Post Modal */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Myposts;
