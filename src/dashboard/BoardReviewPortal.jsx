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
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [popup, setPopup] = useState({
    open: false,
    type: "",
    message: "",
    onConfirm: null,
  });

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
        toast.success("Research approved successfully!");
      } else {
        toast.error(data.message || "Approval failed");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
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
      setPopup({
        open: true,
        type: "rejectConfirm",
        message:
          "Please enter rejection reason before rejecting this research.",
        onConfirm: () => confirmReject(research),
      });
      return;
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
        setStatus((prev) => ({
          ...prev,
          [resId]: { type: "rejected", reason: reason },
        }));

        setRejectingId(null);
        setReason("");

        toast.success("Research rejected successfully!");
      } else {
        toast.error(data.message || "Rejection failed");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  const filtered = researchList.filter((item) =>
    item.research_title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      {popup.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div
            className={`
        w-full max-w-md rounded-2xl border p-6 shadow-2xl
        animate-in fade-in zoom-in duration-300
       ${
         popup.type === "success" || popup.type === "confirm"
           ? "bg-white dark:bg-[#04150f] border-[#00b86b]/30 dark:border-[#00ff88]/30"
           : popup.type === "reject" || popup.type === "rejectConfirm"
             ? "bg-white dark:bg-[#170606] border-red-300 dark:border-red-500/30"
             : "bg-white dark:bg-[#111111] border-slate-200 dark:border-[#00ff88]/20"
       }
      `}
          >
            {/* icon */}

            <div
              className={`
    mx-auto flex h-16 w-16 items-center justify-center rounded-full border text-3xl font-bold
    ${
      popup.type === "success"
        ? "bg-[#00ff88]/10 text-[#32ff99] border-[#00ff88]/30"
        : popup.type === "confirm"
          ? "bg-[#00ff88]/10 text-[#32ff99] border-[#00ff88]/30"
          : popup.type === "rejectConfirm"
            ? "bg-red-500/10 text-red-400 border-red-500/30"
            : "bg-red-500/10 text-red-400 border-red-500/30"
    }
  `}
            >
              {popup.type === "confirm"
                ? "✓"
                : popup.type === "rejectConfirm"
                  ? "×"
                  : "!"}
            </div>

            {/* title */}
            <h2 className="mt-5 text-center text-xl font-bold text-slate-900 dark:text-white">
              {popup.type === "success"
                ? "Approved"
                : popup.type === "reject"
                  ? "Rejected"
                  : popup.type === "confirm"
                    ? "Confirm Approval"
                    : popup.type === "rejectConfirm"
                      ? "Confirm Rejection"
                      : "Error"}
            </h2>

            {/* message */}
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {popup.message}
            </p>
            {popup.type === "rejectConfirm" && (
              <textarea
                placeholder="Enter rejection reason..."
                className="mt-5 w-full rounded-xl 
bg-white dark:bg-[#061813] 
border border-slate-300 dark:border-red-500/40 
p-3 text-sm 
text-slate-900 dark:text-white 
placeholder:text-slate-400 dark:placeholder:text-slate-500 
focus:outline-none focus:border-red-500 dark:focus:border-red-500 
transition"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
              />
            )}
            {/* button */}
            {popup.type === "confirm" || popup.type === "rejectConfirm" ? (
              <div className="mt-7 flex gap-3">
                <button
                  onClick={() =>
                    setPopup({
                      open: false,
                      type: "",
                      message: "",
                      onConfirm: null,
                    })
                  }
                  className="flex-1 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/10 py-3 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    const confirmAction = popup.onConfirm;

                    setPopup({
                      open: false,
                      type: "",
                      message: "",
                      onConfirm: null,
                    });

                    confirmAction?.();
                  }}
                  className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                    popup.type === "rejectConfirm"
                      ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_25px_rgba(239,68,68,0.25)]"
                      : "bg-[#00ff88] text-black hover:bg-[#32ff99] shadow-[0_0_25px_rgba(0,255,136,0.25)]"
                  }`}
                >
                  {popup.type === "rejectConfirm"
                    ? "Yes Reject"
                    : "Yes Approve"}{" "}
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  setPopup({
                    open: false,
                    type: "",
                    message: "",
                    onConfirm: null,
                  })
                }
                className={`
      mt-6 w-full rounded-xl py-3 text-sm font-bold transition
      ${
        popup.type === "success"
          ? "bg-[#00ff88] text-black hover:bg-[#32ff99]"
          : "bg-red-500 text-white hover:bg-red-600"
      }
    `}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
      <div className="p-6 max-w-6xl space-y-6 bg-slate-50 dark:bg-transparent min-h-screen">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Board Review Portal
          </h2>

          <input
            type="text"
            placeholder="Search research..."
            className="
    px-4 py-2 rounded-xl
    bg-white dark:bg-[#0a120e]

    border border-slate-200
    dark:border-[#1f5c43]

    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500

    shadow-sm dark:shadow-none

    focus:outline-none
    focus:border-[#00b86b]
    dark:focus:border-[#00ff88]

    focus:ring-4
    focus:ring-[#00b86b]/10
    dark:focus:ring-[#00ff88]/10

    transition-all duration-300
  "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <p className="text-slate-500 dark:text-gray-400">
            Loading research...
          </p>
        )}

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
                className="relative overflow-hidden rounded-[10px] border border-slate-200 dark:border-[#123d31] bg-white dark:bg-[#02110d] px-6 py-5 shadow-sm dark:shadow-[0_0_45px_rgba(0,255,136,0.08)]"
              >
                {/* right dots */}

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Avatar + Status */}
                  <div className="flex lg:flex-col items-center gap-4 lg:w-[100px]">
                    <img
                      className="w-[72px] h-[72px] rounded-full border-2 border-[#32ff99] object-cover bg-white shadow-[0_0_18px_rgba(50,255,153,0.35)]"
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
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase border ${
                        badgeText === "Pending"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/50"
                          : badgeText === "Approved"
                            ? "bg-[#00ff88]/10 text-[#32ff99] border-[#00ff88]/40"
                            : "bg-red-500/10 text-red-400 border-red-500/40"
                      }`}
                    >
                      {badgeText === "Pending" && "◷"}
                      {badgeText === "Approved" && "✓"}
                      {badgeText === "Rejected" && "×"}
                      {badgeText}
                    </span>
                  </div>

                  {/* vertical line */}
                  <div className="hidden lg:block w-px h-[105px] bg-slate-200 dark:bg-slate-500/60" />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {research.research_title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Submitted by{" "}
                        <b className="text-[#009f5d] dark:text-[#32ff99] font-semibold">
                          {research.name}
                        </b>
                      </span>
                      <span>•</span>
                      <span>
                        {research.created_at
                          ? new Date(research.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "24 Apr 2026"}
                      </span>
                    </div>

                    <div className="mt-3 max-w-[620px]">
                      <p
                        className={`text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 ${
                          expandedAbstracts[resId] ? "" : "line-clamp-2"
                        }`}
                      >
                        {research.abstract}
                      </p>

                      {research.abstract?.length > 120 && (
                        <button
                          onClick={() =>
                            setExpandedAbstracts((prev) => ({
                              ...prev,
                              [resId]: !prev[resId],
                            }))
                          }
                          className="mt-2 text-xs font-semibold text-[#32ff99] hover:text-[#00ff88] transition"
                        >
                          {expandedAbstracts[resId] ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 dark:border-slate-500/30 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300">
                        ▣
                      </span>
                      <span>ID: {research.registration_id}</span>
                    </div>

                    {/* {badgeText === "Rejected" && displayReason && (
                      <p className="mt-2 text-xs text-red-400 italic">
                        Reason: {displayReason}
                      </p>
                    )} */}

                    {research.research_file && (
                      <a
                        href={`https://sasedge.org/research-network/back-end/${research.research_file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#00b86b]/30 bg-[#00b86b]/5 px-4 py-2 text-xs font-bold text-[#008f55] dark:text-[#32ff99] hover:bg-[#00b86b]/10 dark:hover:bg-[#00ff88]/10 transition"
                      >
                        <span>▧</span>
                        View PDF
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-start lg:justify-end gap-3 lg:min-w-[220px]">
                    {badgeText === "Pending" &&
                      adminStatus === 1 &&
                      rejectingId !== resId && (
                        <>
                          <button
                            onClick={() =>
                              setPopup({
                                open: true,
                                type: "confirm",
                                message:
                                  "Are you sure you want to approve this research?",
                                onConfirm: () => handleApprove(research),
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/5 px-5 py-2.5 text-xs font-bold text-[#32ff99] hover:bg-[#00ff88]/10 transition"
                          >
                            <span className="text-base">✓</span>
                            Approve
                          </button>

                          <button
                            onClick={() => {
                              setReason("");
                              setPopup({
                                open: true,
                                type: "rejectConfirm",
                                message:
                                  "Please enter rejection reason before rejecting this research.",
                                onConfirm: () => confirmReject(research),
                              });
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                          >
                            <span className="text-base">×</span>
                            Reject
                          </button>
                        </>
                      )}

                    {badgeText === "Approved" && (
                      <span className="rounded-lg border border-[#00b86b]/30 bg-[#00b86b]/10 px-5 py-2.5 text-xs font-bold text-[#008f55] dark:text-[#32ff99]">
                        ✓ Approved
                      </span>
                    )}

                    {badgeText === "Rejected" && (
                      <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-400">
                        × Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Reject input */}
                {rejectingId === resId &&
                  badgeText === "Pending" &&
                  adminStatus === 1 && (
                    <div className="relative z-10 mt-5 ml-0 lg:ml-[130px] max-w-xl">
                      <textarea
                        placeholder="Enter rejection reason..."
                        className="w-full rounded-xl bg-[#061813] border border-red-500/40 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows="3"
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={() => confirmReject(research)}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600"
                        >
                          Submit
                        </button>

                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/15"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BoardReviewPortal;
