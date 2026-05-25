import React, { useState, useEffect } from "react";
import { MaterialIcon } from "../../Layout/Layout";

const InstitutePendingTable = ({
  applications,
  handleApprove,
  approvingId = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [applications]);

  const handleApproveClick = (app) => {
    handleApprove(app.user_id, app.email);
  };

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-[#13231a] rounded-xl p-12 text-center">
        <MaterialIcon name="inbox" className="text-4xl text-slate-600 mb-3" />
        <p className="text-slate-400">No pending applications</p>
      </div>
    );
  }

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = applications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="bg-[#13231a] flex flex-col h-full rounded-xl">

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-separate border-spacing-0 border border-[#1e3a2c]">

          {/* Sticky Header */}
          <thead className="sticky top-0 z-40 bg-[#0e1a14]">
            <tr>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">ID</th>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">Institute</th>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">Representative</th>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">Role</th>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">Email</th>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">Contact</th>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">Address</th>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">Website</th>
              <th className="py-4 px-4 text-xs text-slate-400 uppercase border-b border-[#1e3a2c]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1e3a2c]">
            {currentData.map((app) => (
              <tr key={app.user_id} className="hover:bg-[#1e3a2c]/30">
                <td className="py-4 px-4 text-white text-xs">
                  {app.displayId || app.id}
                </td>
                <td className="py-4 px-4 text-slate-300">{app.institute}</td>
                <td className="py-4 px-4 text-slate-300">{app.representative}</td>
                <td className="py-4 px-4 text-slate-300">{app.role}</td>
                <td className="py-4 px-4 text-slate-300 break-words">{app.email}</td>
                <td className="py-4 px-4 text-slate-300">{app.contact}</td>
                <td className="py-4 px-4 text-slate-300">{app.address}</td>
                <td className="py-4 px-4 text-slate-300">{app.website}</td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleApproveClick(app)}
                    disabled={approvingId === app.user_id}
                    className="bg-[#00ff88] text-[#0a120e] px-3 py-2 rounded-lg text-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    <MaterialIcon name="check" />
                    {approvingId === app.user_id
                      ? "Approving..."
                      : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Same Pagination Style */}
     {/* PAGINATION */}
<div className="flex-shrink-0 bg-[#16201a] border-t border-[#1e3a2c] px-6 py-4 flex items-center justify-between">
  <span className="text-xs text-slate-500 font-medium">
    Page {currentPage} of {totalPages || 1}
  </span>

  <div className="flex items-center gap-2">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="p-2 rounded-lg bg-[#0a0f0c] border border-[#1e3a2c] text-slate-400 hover:text-[#00ff88] disabled:opacity-30 transition-colors"
    >
      <MaterialIcon name="west" className="text-lg" />
    </button>

    <div className="flex gap-1">
      {[...Array(totalPages)]
        .map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              currentPage === i + 1
                ? "bg-[#00ff88] text-[#0a0f0c] shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                : "text-slate-500 hover:bg-[#1e3a2c]"
            }`}
          >
            {i + 1}
          </button>
        ))
        .slice(
          Math.max(0, currentPage - 3),
          Math.min(totalPages, currentPage + 2)
        )}
    </div>

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className="p-2 rounded-lg bg-[#0a0f0c] border border-[#1e3a2c] text-slate-400 hover:text-[#00ff88] disabled:opacity-30 transition-colors"
    >
      <MaterialIcon name="east" className="text-lg" />
    </button>
  </div>
</div>
    </div>
  );
};

export default InstitutePendingTable;