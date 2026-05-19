import React, { useState } from "react";
import DashboardLayout from "../DashboardLayout";
import Myresearch from "./Myresearch";
import Savedposts from "./Savedposts";
// import Myposts from "./Myposts";

// ✅ MAIN COMPONENT
const MyPublications = () => {
  const [activeTab, setActiveTab] = useState("publications");

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

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-[#3b4b3d]/30 overflow-x-auto scrollbar-hidden">
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
          {/* <button
  onClick={() => setActiveTab("posts")}
  className={`px-4 sm:px-6 py-3 border-b-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
    activeTab === "posts"
      ? "border-[#00ff85] text-[#00ff85]"
      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-[#b9cbb9] dark:hover:text-[#e2e3e0]"
  }`}
>
  Posts
</button> */}

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

        {/* Content */}
        <div className="flex flex-col gap-4 sm:gap-6 relative">
          {activeTab === "publications" && <Myresearch />}
          {/* {activeTab === "posts" && <Myposts />} */}
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
