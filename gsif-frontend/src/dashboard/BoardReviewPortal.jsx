import React, { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import defaultAvatar from "../assets/images/avatar.jpg";
import API_CONFIG from "../config/api.config";

const BoardReviewPortal = () => {
  const [researchList, setResearchList] = useState([]);
  const [status, setStatus] = useState({}); // UI instantly update karne ke liye
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  // Helper to get Current Logged In Member ID
  const getBoardMemberId = () => {
    return (
      localStorage.getItem("user_id") ||
      localStorage.getItem("email") ||
      "unknown_member"
    );
  };

  useEffect(() => {
    const loadResearch = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/research/get-research`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        console.log("✅ Fetched research list");

        const list = data.data || [];

        // ✅ API CALL FOR EVERY RESEARCH TO GET THIS USER'S STATUS
        const updatedList = await Promise.all(
          list.reverse().map(async (item) => {
            const resId = item.researche_id || item.id;
            const boardStatusData = await fetchBoardStatus(resId);

            // Maintain a local mapping for instant UI changes
            if (boardStatusData.status === 2) {
              setStatus((prev) => ({ ...prev, [resId]: { type: "approved" } }));
            } else if (
              boardStatusData.status === 3 ||
              boardStatusData.status === 4
            ) {
              setStatus((prev) => ({
                ...prev,
                [resId]: { type: "rejected", reason: boardStatusData.remark },
              }));
            }

            return {
              ...item,
              boardMemberStatus: boardStatusData.status, // Specific to this board member
            };
          }),
        );

        setResearchList(updatedList);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching research list:", err);
        setLoading(false);
      }
    };

    loadResearch();
  }, []);

  // ✅ Sir's logic: Fetch specific board member status for a research
  const fetchBoardStatus = async (researchId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/research/board-member-research-status/${researchId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      // Return status and remark if found
      if (data.status && data.data && data.data.length > 0) {
        return {
          status: Number(data.data[0].status),
          remark: data.data[0].remark || "",
        };
      }

      return { status: 1, remark: "" }; // default pending
    } catch (err) {
      console.error("Status fetch error:", err);
      return { status: 1, remark: "" };
    }
  };

  const handleApprove = async (research) => {
    const resId = research.researche_id || research.id;
    const token = localStorage.getItem("token");
    const boardMemberId = getBoardMemberId();

    if (!resId) return alert("❌ Research ID not found");
    if (boardMemberId === "unknown_member")
      return alert("❌ Board Member ID not found. Please login again.");

    try {
      const apiUrl = `${API_CONFIG.BASE_URL}/research/approve-research-board-member/${resId}`;
      const requestBody = { user_id: boardMemberId };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.status) {
        // UI instantly update
        setStatus((prev) => ({ ...prev, [resId]: { type: "approved" } }));
        alert("✅ Research approved successfully!");
      } else {
        alert("❌ Approval failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ NETWORK ERROR:", err);
      alert("❌ Network error: " + err.message);
    }
  };

  const openRejectInput = (resId) => {
    setRejectingId(resId);
    setReason("");
  };

  const confirmReject = async (research) => {
    const resId = research.researche_id || research.id;
    const token = localStorage.getItem("token");
    const boardMemberId = getBoardMemberId();

    if (!reason.trim()) {
      return alert("Please enter a reason for rejection.");
    }

    try {
      const apiUrl = `${API_CONFIG.BASE_URL}/research/rejected-research-board-member/${resId}`;
      const requestBody = {
        user_id: boardMemberId,
        remark: reason,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.status) {
        // UI instantly update
        setStatus((prev) => ({
          ...prev,
          [resId]: { type: "rejected", reason: reason },
        }));

        setRejectingId(null);
        setReason("");
        alert("✅ Research Rejected Successfully!");
      } else {
        alert("❌ Rejection failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ NETWORK ERROR:", err);
      alert("❌ Network error: " + err.message);
    }
  };

  const filtered = researchList.filter((item) =>
    item.research_title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Board Review Portal</h2>
          <input
            type="text"
            placeholder="Search research..."
            className="px-4 py-2 rounded bg-[#0a120e] border border-[#1e3a2c] text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className="text-gray-400">Loading research...</p>}

        <div className="space-y-4">
          {filtered.map((research, index) => {
            const resId = research.researche_id || research.id;

            // Check realtime status map first (for instant feedback), then fall back to API fetched status
            const actionType = status[resId]?.type;
            const displayReason = status[resId]?.reason;

            const adminStatus = Number(
              research.status ||
                research.research_status ||
                research.admin_status,
            );

            const isAdminApproved = adminStatus === 2 || adminStatus === 3;
            const isAdminRejected = adminStatus === 4;

            let badgeText = "Pending";
            let badgeClass =
              "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

            if (
              isAdminApproved ||
              actionType === "approved" ||
              research.boardMemberStatus === 2
            ) {
              badgeText = "Approved";
              badgeClass = "bg-green-500/20 text-green-400 border-green-500/30";
            } else if (
              isAdminRejected ||
              actionType === "rejected" ||
              research.boardMemberStatus === 3 ||
              research.boardMemberStatus === 4
            ) {
              badgeText = "Rejected";
              badgeClass = "bg-red-500/20 text-red-400 border-red-500/30";
            }

            return (
              <div
                key={resId || index}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-6"
              >
                {/* Avatar + Status Badge */}
                <div className="flex flex-col items-center">
                  <img
                    className="w-16 h-16 rounded-full border-2 border-[#32ff99]/30 object-cover"
                    src={
                      research.profile_image
                        ? `${API_CONFIG.BASE_URL}/${research.profile_image}`
                        : defaultAvatar
                    }
                    alt="avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                  />

                  <span
                    className={`mt-2 px-2 py-1 text-[10px] font-bold rounded border ${badgeClass}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {research.research_title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Submitted by <b>{research.name}</b>
                    {research.institute_name && (
                      <> • {research.institute_name}</>
                    )}
                  </p>
                  <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                    {research.abstract}
                  </p>
                  <p className="text-sm text-slate-300 mt-2">
                    ID: {research.registration_id}
                  </p>

                  {/* Rejection Reason Display */}
                  {badgeText === "Rejected" && displayReason && (
                    <p className="mt-2 text-xs text-red-400 italic">
                      Reason: {displayReason}
                    </p>
                  )}

                  {research.research_file && (
                    <a
                      href={`https://sasedge.org/research-network/back-end/${research.research_file}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 px-4 py-2 bg-[#32ff99] text-black text-xs font-bold rounded-lg hover:bg-[#2fd989]"
                    >
                      View PDF
                    </a>
                  )}
                </div>

                {/* Action Buttons & Rejection Input (Right Side) */}
                <div className="flex flex-col justify-center gap-3 min-w-[200px]">
                  {/* Show Buttons ONLY if status is Pending */}
                  {badgeText === "Pending" &&
                    adminStatus === 1 &&
                    rejectingId !== resId && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(research)}
                          className="px-5 py-2 bg-[#32ff99] text-black text-xs font-bold rounded-xl hover:bg-[#2fd989] transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectInput(resId)}
                          className="px-5 py-2 text-xs font-bold rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition border border-red-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                  {/* The Input Box that appears on Reject click */}
                  {rejectingId === resId &&
                    badgeText === "Pending" &&
                    adminStatus === 1 && (
                      <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                        <textarea
                          placeholder="Enter rejection reason..."
                          className="p-2 text-xs rounded bg-[#1a1a1a] border border-red-500/50 text-white focus:outline-none focus:ring-0 focus:border-red-500"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmReject(research)}
                            className="flex-1 px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600 transition"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-3 py-1.5 bg-gray-700 text-white text-[10px] font-bold rounded hover:bg-gray-600 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Final Status Indicators (Right Side) */}
                  {badgeText === "Approved" && (
                    <span className="text-center px-4 py-3 font-bold bg-green-500/20 text-green-400 text-xs rounded-xl border border-green-500/30">
                      ✅ Approved
                    </span>
                  )}
                  {badgeText === "Rejected" && (
                    <span className="text-center px-4 py-3 font-bold bg-red-500/20 text-red-400 text-xs rounded-xl border border-red-500/20">
                      ❌ Rejected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BoardReviewPortal;
