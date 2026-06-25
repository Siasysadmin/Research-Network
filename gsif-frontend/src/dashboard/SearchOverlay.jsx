import React, { useState } from "react";
import API_CONFIG from "../config/api.config";
import avatar from "../assets/images/avatar.jpg";

const MaterialIcon = ({ name, className = "", filled = false }) => (
  <span
    className={`material-symbols-outlined select-none ${className}`}
    style={{
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
    }}
  >
    {name}
  </span>
);

const SearchOverlay = React.forwardRef(
  (
    {
      searchQuery,
      isLoading,
      userResults,
      hashtagResults,
      researchResults,
      clearSearch,
      handleUserClick,
      handleHashtagClick,
      handleResearchClick,
      isOpen,
      inputCoords,
    },
    ref
  ) => {
    const [activeTab, setActiveTab] = useState("all");

    const hasResults =
      userResults.length > 0 || hashtagResults.length > 0 || researchResults.length > 0;

    if (!isOpen) return null;

    // Position the dropdown panel directly under the focused input.
    // Falls back to a centered top sheet if coords aren't available.
    const hasCoords = inputCoords && inputCoords.width > 0;
    const panelStyle = hasCoords
      ? {
          position: "fixed",
          top: Math.round(inputCoords.top + 50),
          left: Math.round(inputCoords.left),
          width: Math.round(inputCoords.width),
          maxWidth: "calc(100vw - 16px)",
        }
      : {
          position: "fixed",
          top: 120,
          left: 8,
          right: 8,
        };

    const tabs = [
      { id: "all", label: "All" },
      { id: "accounts", label: "Accounts" },
      { id: "posts", label: "Posts" },
      { id: "research", label: "Research" },
    ];

    // Backdrop starts BELOW the header so the whole top header stays visible.
    const headerBottom = inputCoords && inputCoords.headerBottom ? inputCoords.headerBottom : 0;

    return (
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Backdrop — dims & blurs everything BELOW the header. Click to close. */}
        <div
          className="absolute left-0 right-0 bottom-0 bg-black/30 dark:bg-black/60 backdrop-blur-[3px] pointer-events-auto"
          style={{ top: headerBottom }}
          onClick={clearSearch}
        />

        {/* Dropdown panel */}
        <div
          ref={ref}
          style={panelStyle}
          className="pointer-events-auto z-[9999] bg-[#ffffff] dark:bg-[#0e1512] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-[#e0e3e5] dark:border-[#1f2a24] overflow-hidden"
        >
          {/* Tabs */}
          <div className="p-2 border-b border-[#e0e3e5] dark:border-[#1f2a24] flex justify-center gap-2 bg-[#f2f4f6] dark:bg-[#0b110e] overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 h-[30px] flex items-center justify-center rounded-[14px] text-[11px] font-semibold transition-colors whitespace-nowrap border ${
                  activeTab === tab.id
                    ? "bg-[#00ff85]/15 border-[#00b86b] dark:border-[#00ff85]/50 text-[#006d35] dark:text-[#00ff85]"
                    : "bg-white dark:bg-[#0e1512] border-[#d7ded8] dark:border-[#27322c] text-[#191c1e] dark:text-[#b9cbb9] hover:bg-[#e0e3e5] dark:hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-[65vh] scrollbar-none">
            <div className="p-4 space-y-6">
              {isLoading && (
                <div className="p-4 text-sm text-center text-[#3b4b3d] dark:text-[#b9cbb9]">
                  Searching...
                </div>
              )}

              {!isLoading && !hasResults && searchQuery && (
                <div className="text-center py-8 text-sm text-[#3b4b3d] dark:text-[#b9cbb9]">
                  No results found.
                </div>
              )}

              {!isLoading && !searchQuery && (
                <div className="text-center py-8 text-sm text-[#3b4b3d] dark:text-[#7c8b81]">
                  Start typing to search users, research and tags.
                </div>
              )}

              {/* Accounts */}

{searchQuery.trim() && (userResults.length > 0 || activeTab === "accounts") && (activeTab === "all" || activeTab === "accounts") && (               <section>
                  <h3 className="text-xs font-semibold text-[#3b4b3d] dark:text-[#b9cbb9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MaterialIcon name="group" className="text-[16px]" />
                    Researchers
                  </h3>
                  <div className="space-y-2">
                    {activeTab === "accounts" && userResults.length === 0 && searchQuery && (
                      <div className="text-sm text-center py-6 text-[#3b4b3d] dark:text-[#b9cbb9]">
                        No accounts found
                      </div>
                    )}

                    {userResults.map((u) => {
                      const name =
                        u.user_type === "institute"
                          ? u.institute_details?.institute_name || u.name || "Institute"
                          : u.name || "User";

                      const img =
                        u.user_type === "institute"
                          ? u.profile_institute_details?.profile_image
                          : u.profile_individual_details?.profile_image;

                      const imgUrl = img ? `${API_CONFIG.BASE_URL}/${img}` : avatar;

                      return (
                        <div
                          key={u.id}
                          onMouseDown={() => handleUserClick(u)}
                          className="flex items-center gap-3 p-2 hover:bg-[#f2f4f6] dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                        >
                          <img
                            src={imgUrl}
                            onError={(e) => {
                              e.target.src = avatar;
                            }}
                            className="w-10 h-10 rounded-full object-cover"
                            alt={name}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#191c1e] dark:text-[#e2e3e0] truncate">
                              {name}
                            </div>
                            <div className="text-xs text-[#3b4b3d] dark:text-[#b9cbb9] truncate capitalize">
                              {u.user_type || "individual"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

         {/* ✅ UPDATED PREMIUM BOX LAYOUT (No Green Hover on Name/Title) */}

{searchQuery.trim() && (researchResults.length > 0 || activeTab === "research") && (activeTab === "all" || activeTab === "research") && (
    <section className="mb-5">
    <h3 className="text-xs font-semibold text-[#3b4b3d] dark:text-[#b9cbb9] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
      <MaterialIcon name="description" className="text-[16px]" />
      Research Documents
    </h3>
    
    <div className="grid grid-cols-1 gap-3">
      {activeTab === "research" && researchResults.length === 0 && searchQuery && (
        <div className="text-sm text-center py-6 text-[#3b4b3d] dark:text-[#b9cbb9] bg-white dark:bg-[#0d100e] border border-gray-100 dark:border-[#1f2621] rounded-xl">
          No research documents found
        </div>
      )}

      {researchResults.map((res) => {
        // Safe check for fields, spellings and IDs
        const actualId = res.research_id || res.researche_id || res.id;
        const authorName = res.name || res.author_name || res.user_name || "User";
        
        // Setup user avatar profile image safely
        const avatarSrc = res.profile_image 
          ? (res.profile_image.startsWith("http") ? res.profile_image : `${API_CONFIG?.BASE_URL || ""}/${res.profile_image}`)
          : avatar;

        return (
          <div
            key={actualId}
            onMouseDown={() => handleResearchClick(res)}
            // 👇 Card ka border aur shadow hover par subtle change hota rahega
            className="p-3.5 bg-white dark:bg-[#0d100e] border border-gray-100 dark:border-[#1f2621] hover:border-emerald-500/40 dark:hover:border-[#00ff85]/40 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col gap-2.5 group"
          >
            {/* 1. User Header: Avatar aur Name (Hover par color change NO) */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/5 shrink-0">
                <img 
                  src={avatarSrc} 
                  alt={authorName} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = avatar; }} 
                />
              </div>
              {/* ✅ FIXED: Yahan se group-hover:text-emerald-600/dark:group-hover:text-[#00ff85] hata di hai */}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors capitalize">
                {authorName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-[#5f6f65] ml-auto flex items-center gap-1">
                <MaterialIcon name="picture_as_pdf" className="text-[12px] text-red-500" />
                Research
              </span>
            </div>

            {/* 2. Research Title Block: Title (Hover par color change NO) */}
            {/* ✅ FIXED: Yahan se bhi group-hover:text-emerald-600/dark:group-hover:text-[#00ff85] hata di hai */}
            <div className="text-sm font-semibold text-[#191c1e] dark:text-[#e2e3e0] leading-snug line-clamp-2 pl-0.5 transition-colors">
              {res.research_title}
            </div>

            {/* 3. Keywords / Tags Grid: Inka soft green highlight bana rahega */}
            {res.keywords && (Array.isArray(res.keywords) ? res.keywords : typeof res.keywords === 'string' ? JSON.parse(res.keywords || "[]") : []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {(Array.isArray(res.keywords) ? res.keywords : JSON.parse(res.keywords || "[]")).map((tag, idx) => (
                  <span
                    key={idx}
                    // Yahan ye bright aura bana rahega taki interaction responsive lage
                    className="text-[10px] font-medium text-emerald-700 dark:text-[#00ff85] bg-emerald-50 dark:bg-[#00ff85]/10 px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-[#00ff85]/5"
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </section>
)}

            {/* ✅ UPDATED NETWORK POSTS LAYOUT (Same Avatar & No Green Hover on Text) */}

{searchQuery.trim() && (hashtagResults.length > 0 || activeTab === "posts") && (activeTab === "all" || activeTab === "posts") && (
    <section className="mb-5">
    <h3 className="text-xs font-semibold text-[#3b4b3d] dark:text-[#b9cbb9] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
      <MaterialIcon name="forum" className="text-[16px]" />
      Network Posts
    </h3>
    <div className="grid grid-cols-1 gap-3">
      {activeTab === "posts" && hashtagResults.length === 0 && searchQuery && (
        <div className="text-sm text-center py-6 text-[#3b4b3d] dark:text-[#b9cbb9] bg-white dark:bg-[#0d100e] border border-gray-100 dark:border-[#1f2621] rounded-xl">
          No posts found
        </div>
      )}

      {hashtagResults.map((post) => {
        const name =
          post.user_type === "institute"
            ? post.institute_details?.institute_name || post.name || "Institute"
            : post.name || "User";

        // Setup user avatar profile image safely (Same as Research card layout)
        const avatarSrc = post.profile_image 
          ? (post.profile_image.startsWith("http") ? post.profile_image : `${API_CONFIG?.BASE_URL || ""}/${post.profile_image}`)
          : avatar;

        return (
          <div
            key={post.id}
            onMouseDown={() => handleHashtagClick(post)}
            // 👇 Same premium box hover effect as Research card
            className="p-3.5 bg-white dark:bg-[#0d100e] border border-gray-100 dark:border-[#1f2621] hover:border-emerald-500/40 dark:hover:border-[#00ff85]/40 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col gap-2.5 group"
          >
            {/* 1. User Header: Circle letter hata kar exact Avatar Image lagayi hai */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/5 shrink-0">
                <img 
                  src={avatarSrc} 
                  alt={name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = avatar; }} 
                />
              </div>
              {/* Text color rigid rakha hai (Hover par change nahi hoga) */}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors capitalize">
                {name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-[#5f6f65] ml-auto flex items-center gap-1">
                <MaterialIcon name="forum" className="text-[12px] text-emerald-600 dark:text-[#00ff85]" />
                Post
              </span>
            </div>

            {/* 2. Post Text Block (Hover par text color green nahi hoga) */}
            <p className="text-sm text-[#191c1e] dark:text-[#e2e3e0] leading-relaxed line-clamp-3 pl-0.5 transition-colors">
              {post.post_text}
            </p>

            {/* 3. Hash Tags Grid */}
            {Array.isArray(post.hash_tag) && post.hash_tag.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {post.hash_tag.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-emerald-700 dark:text-[#00ff85] bg-emerald-50 dark:bg-[#00ff85]/10 px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-[#00ff85]/5"
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </section>
)}
            </div>

            {/* Footer */}
            {searchQuery.trim() && hasResults && (
              <div className="p-3 border-t border-[#e0e3e5] dark:border-[#1f2a24] bg-white dark:bg-[#0e1512]">
                <button className="w-full py-2.5 bg-[#f2f4f6] dark:bg-white/5 hover:bg-[#e6e8ea] dark:hover:bg-white/10 text-[#191c1e] dark:text-[#e2e3e0] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span className="truncate">See all results for "{searchQuery}"</span>
                  <MaterialIcon name="arrow_forward" className="text-[18px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default SearchOverlay;