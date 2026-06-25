import React, { useState } from "react";
import DashboardLayout from "../DashboardLayout";
import Myresearch from "./Myresearch";
import Savedposts from "./Savedposts";
import Myposts from "./Myposts";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

// ✅ MAIN COMPONENT
const MyPublications = () => {
  const [activeTab, setActiveTab] = useState("publications");

  // ✅ Filter + ViewMode state yahan (sirf posts tab ke liye)
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("All Posts");
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = ["All Posts", "Images", "Videos", "Polls", "Text"];

  return (
    <DashboardLayout>
      <div
        className="
flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-8 font-inter relative z-10
bg-slate-50 text-slate-800
dark:bg-transparent dark:text-[#e2e3e0]
"
      >
        {/* Header */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase
text-slate-900 dark:text-[#e2e3e0]"
          >
            My Publication
          </h1>
          <div className="flex items-center gap-2 text-slate-600 dark:text-[#b9cbb9]">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Personal Workspace
            </span>
            <div className="w-2 h-2 rounded-full bg-[#61ff97] shadow-[0_0_8px_rgba(97,255,151,0.6)]"></div>
          </div>
        </div>

        {/* ✅ Tabs + Filter same line */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#3b4b3d]/30">

          {/* Left - Tab Buttons */}
          <div className="flex items-center overflow-x-auto scrollbar-hidden">
            <button
              onClick={() => setActiveTab("publications")}
              className={`px-4 sm:px-6 py-3 border-b-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === "publications"
                  ? "border-[#00ff85] text-[#00ff85]"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-[#b9cbb9] dark:hover:text-[#e2e3e0]"
              }`}
            >
              My Research
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-4 sm:px-6 py-3 border-b-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === "posts"
                  ? "border-[#00ff85] text-[#00ff85]"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-[#b9cbb9] dark:hover:text-[#e2e3e0]"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 sm:px-6 py-3 border-b-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === "saved"
                  ? "border-[#00ff85] text-[#00ff85]"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-[#b9cbb9] dark:hover:text-[#e2e3e0]"
              }`}
            >
              Saved
            </button>
          </div>

          {/* ✅ Right - Filter toolbar (sirf posts tab pe dikhega) */}
          {activeTab === "posts" && (
            <div className="flex items-center gap-2 pb-1 shrink-0">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#00ff85]/50 transition-all"
                >
                  {filter}
                  <MaterialIcon name="keyboard_arrow_down" className="text-base" />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-9 z-20 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-1 min-w-[130px]">
                    {filters.map((f) => (
                      <button
                        key={f}
                        onClick={() => { setFilter(f); setFilterOpen(false); }}
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
                  className={`p-1.5 transition-all ${
                    viewMode === "list"
                      ? "bg-[#00ff85] text-black"
                      : "bg-white dark:bg-[#1a1a1a] text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  }`}
                >
                  <MaterialIcon name="view_list" className="text-xl" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 transition-all ${
                    viewMode === "grid"
                      ? "bg-[#00ff85] text-black"
                      : "bg-white dark:bg-[#1a1a1a] text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  }`}
                >
                  <MaterialIcon name="grid_view" className="text-xl" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 sm:gap-6 relative">
          {activeTab === "publications" && <Myresearch />}
          {activeTab === "posts" && <Myposts viewMode={viewMode} filter={filter} />}
          {activeTab === "saved" && <Savedposts />}
        </div>
      </div>

      {/* Background Glow */}
      <div className="fixed bottom-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-200/40 dark:bg-[#00ff85]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <style jsx>{`
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        ::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        * {
          scrollbar-width: none;
        }
        * {
          -ms-overflow-style: none;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default MyPublications;