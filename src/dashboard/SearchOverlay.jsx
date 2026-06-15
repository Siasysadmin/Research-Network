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
              {searchQuery.trim() && hasResults && (activeTab === "all" || activeTab === "accounts") && (
                <section>
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

              {/* Research */}
              {searchQuery.trim() && hasResults && (activeTab === "all" || activeTab === "research") && (
                <section>
                  <h3 className="text-xs font-semibold text-[#3b4b3d] dark:text-[#b9cbb9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MaterialIcon name="description" className="text-[16px]" />
                    Research Documents
                  </h3>
                  <div className="space-y-2">
                    {activeTab === "research" && researchResults.length === 0 && searchQuery && (
                      <div className="text-sm text-center py-6 text-[#3b4b3d] dark:text-[#b9cbb9]">
                        No research documents found
                      </div>
                    )}

                    {researchResults.map((res) => (
                      <div
                        key={res.researche_id}
                        onMouseDown={() => handleResearchClick(res)}
                        className="p-2 hover:bg-[#f2f4f6] dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors border-l-2 border-transparent hover:border-[#006d35] dark:hover:border-[#00ff85]"
                      >
                        <div className="text-sm font-medium text-[#191c1e] dark:text-[#e2e3e0] mb-1 flex items-center gap-2">
                          <MaterialIcon
                            name="picture_as_pdf"
                            className="text-[18px] text-[#505f76] dark:text-[#7c8b81]"
                          />
                          <span className="truncate">{res.research_title}</span>
                        </div>
                        <div className="text-xs text-[#3b4b3d] dark:text-[#b9cbb9]">By {res.name}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Posts */}
              {searchQuery.trim() && hasResults && (activeTab === "all" || activeTab === "posts") && (
                <section>
                  <h3 className="text-xs font-semibold text-[#3b4b3d] dark:text-[#b9cbb9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MaterialIcon name="forum" className="text-[16px]" />
                    Network Posts
                  </h3>
                  <div className="space-y-4">
                    {activeTab === "posts" && hashtagResults.length === 0 && searchQuery && (
                      <div className="text-sm text-center py-6 text-[#3b4b3d] dark:text-[#b9cbb9]">
                        No posts found
                      </div>
                    )}

                    {hashtagResults.map((post) => {
                      const name =
                        post.user_type === "institute"
                          ? post.institute_details?.institute_name || post.name || "Institute"
                          : post.name || "User";

                      return (
                        <div
                          key={post.id}
                          onMouseDown={() => handleHashtagClick(post)}
                          className="p-4 bg-white dark:bg-[#0b110e] border border-[#e0e3e5] dark:border-[#1f2a24] rounded-lg transition-all hover:shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-[#dae2fd] dark:bg-[#007037] flex items-center justify-center text-[10px] font-bold">
                              {name?.charAt(0)}
                            </div>
                            <span className="text-xs font-semibold text-[#191c1e] dark:text-[#e2e3e0]">
                              {name}
                            </span>
                          </div>

                          <p className="text-sm text-[#191c1e] dark:text-[#e2e3e0] leading-relaxed mb-2 line-clamp-3">
                            {post.post_text}
                          </p>

                          {Array.isArray(post.hash_tag) && post.hash_tag.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.hash_tag.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] text-[#006d35] dark:text-[#00ff85] bg-[#00ff85]/15 px-2 py-0.5 rounded-full"
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