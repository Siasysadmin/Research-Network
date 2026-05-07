import React, { useState } from "react";
import { Layout } from "../Layout/Layout";
import ResearchAllRequests from "./ResearchAllRequests";
import PendingRequests from "./PendingRequest";
import ApprovedRequests from "./ApprovedRequest";
import RejectedRequests from "./RejectedRequests";

const ResearchUploadRequests = () => {
  const [activeNav, setActiveNav] = useState("research");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [requests, setRequests] = useState([

    {
      id: 12,
      userId: "#USR-10123",
      username: "Cambridge Lab",
      email: "lab@cam.ac.uk",
      paperTitle: "Biotechnology",
      userType: "Institute",
      status: "approved",
    },
  ]);

  const user = {
    name: "Vansh Jain",
    role: " Admin",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAf7JwUiWz356JA-gFPnQTqEINhjvPJlbat1E1kZDW_fE_fcrgZngWngd_e7DoJ3h9q-M449WVP7y4yTvpFrGBNekRqj1yCiPHPpOIYnxk0gIQ5_sO3tFTDsnd3OhWwKNJnI_SSBc00wLB-gU347GUeX7ILKrljQYpBe-1JKkqbzN8BBuKY6zCWULxirg2_1kikZ9Y3O0TrKl2UZ8R7aynHXI4PgvlX5xqXcmzFvFRTLMeESxtRsolTgOrxvS6WRLF3XBFc-W4LgzR4",
  };

  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req)),
    );
  };

  const handleReject = (id) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req)),
    );
  };

  const handleViewDetails = (id) => {
    console.log("View details for request:", id);
    // Navigation ya modal open karne ka logic yahan aayega
  };

  const tabs = [
    {
      id: "all",
      label: "Reserach All Requests",
      component: ResearchAllRequests,
    },
    { id: "pending", label: "Pending", component: PendingRequests },
    { id: "approved", label: "Approved", component: ApprovedRequests },
    { id: "rejected", label: "Rejected", component: RejectedRequests },
  ];

  const getCount = (status) =>
    requests.filter((req) => req.status === status).length;

  const ActiveTabComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || AllRequests;

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav} user={user}>
      <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#0a120e] overflow-hidden ">
        {/* Fixed Header */}
        <div className="flex-none border-b border-[#1e3a2c] bg-[#0a120e] z-30 w-full max-w-full overflow-hidden">
          <div className="pt-1 px-6 pb-4 max-w-full overflow-hidden">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 min-w-0 overflow-hidden">
               <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
  Research Upload Requests
</h2>

                <p className="text-sm text-slate-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  Monitor and manage all research paper upload submissions.
                </p>
              </div>

              <div className="hidden md:block relative w-[320px] max-w-full flex-shrink-0">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                  search
                </span>

                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg py-2.5 pl-12 pr-4 text-sm text-white outline-none focus:ring-0 focus:border-[#1e3a2c] transition-all"
                  placeholder="Search requests..."
                />
              </div>
            </div>

            <div className="mt-3 flex gap-6 overflow-hidden">
              {tabs.map((tab) => {
                const count = tab.id === "all" ? null : getCount(tab.id);

                const colors = {
                  pending:
                    "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
                  approved:
                    "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                  rejected: "text-red-500 bg-red-500/10 border-red-500/20",
                };

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-[#00ff88] border-b-2 border-[#00ff88]"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}

                    {/* {count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded border ${colors[tab.id]}`}
                      >
                        {count}
                      </span>
                    )} */}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Content - Active Tab Component yahan render hoga */}
        <div className="flex-1 overflow-hidden p-6">
          <ActiveTabComponent
            requests={requests}
            searchQuery={searchQuery}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ResearchUploadRequests;
