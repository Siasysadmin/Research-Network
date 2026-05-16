import React, { useState, useEffect } from "react";
import InstituteAllApplications from "./InstituteAllApplications";
import InstitutePendingApplications from "./InstitutePendingApplications";
import InstituteApprovedApplications from "./InstituteApprovedApplications";
import { Layout, MaterialIcon } from "../../Layout/Layout";

const InstituteApplications = () => {
  const [activeNav, setActiveNav] = useState("users");
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [applications, setApplications] = useState([
    {
      id: "#INS-651895",
      institute: "zxc",
      representative: "kdfjkld",
      role: "kdjflk",
      email: "zxc@gmail.com",
      contact: "2147483647",
      status: "Approved",
    },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setIsMobileSearchVisible(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleApprove = (id) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: "Approved" } : app,
      ),
    );
  };

  const pendingCount = applications.filter(
    (app) => app.status === "Pending",
  ).length;
  const approvedCount = applications.filter(
    (app) => app.status === "Approved",
  ).length;

  return (
    <Layout
      activeNav={activeNav}
      setActiveNav={setActiveNav}
    >
      <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#0a0f0c]">
        {/* FIXED HEADER & TABS SECTION */}
        <div className="flex-none bg-white dark:bg-[#0a120e] z-20">
          <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
            {/* Is 'pt-4 sm:pt-6' ko kam karke 'pt-2 sm:pt-3' kar dein */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Institute Applications
              </h1>
              <div className="hidden md:block relative w-80 group focus-within:rounded-lg focus-within:border-[#00ff88] dark:focus-within:border-[#00ff88] focus-within:ring-1 focus-within:ring-[#00ff88]/40 dark:focus-within:ring-[#00ff88]/30 transition-all">

                <div className="absolute -inset-0.2 bg-gradient-to-r from-[#00ff88] to-[#00a365] rounded-lg blur opacity-20 group-hover:opacity-40 group-focus-within:opacity-50 transition duration-300 pointer-events-none"></div>

                <div className="relative flex items-center bg-white dark:bg-[#131a15] border border-gray-200 dark:border-[#1e2922] rounded-lg">

                  <MaterialIcon
                    name="search"
                    className="ml-3 text-gray-400 dark:text-slate-400"
                  />

                  <input
                    className="w-full bg-transparent border-none py-2.5 pl-2 pr-4 text-sm focus:ring-0 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600"
                    placeholder="Search institute applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                </div>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-8 flex gap-8 border-b border-gray-200 dark:border-[#1e3a2c]">
            {[
              { id: "all", label: "All Applications" },
              { id: "pending", label: "Pending", count: pendingCount },
              { id: "approved", label: "Approved", count: approvedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? "text-green-600 dark:text-[#00ff88]"
                    : "text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-[#00ff88]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE TABLE AREA */}
        <div className="flex-1 overflow-y-auto px-0 py-0 custom-scrollbar bg-white dark:bg-[#0a0f0c]">
          {activeTab === "all" && (
            <InstituteAllApplications
              applications={applications}
              handleApprove={handleApprove}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "pending" && (
            <InstitutePendingApplications
              applications={applications}
              handleApprove={handleApprove}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "approved" && (
            <InstituteApprovedApplications
              applications={applications}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InstituteApplications;
