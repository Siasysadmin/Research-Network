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
      <div className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-2xl p-12 text-center">
        <MaterialIcon
          name="inbox"
          className="text-4xl text-gray-400 dark:text-slate-600 mb-3"
        />

        <p className="text-gray-500 dark:text-slate-400">
          No pending applications
        </p>
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
    <div className="bg-white dark:bg-[#111814] border border-gray-200 dark:border-[#1e3a2c] flex flex-col h-full rounded-2xl overflow-hidden min-h-[300px]">

      {/* Scroll Area */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#111814] custom-scrollbar">
        <table className="w-full border-collapse text-left">

          {/* Sticky Header */}
          <thead className="sticky top-0 z-40 bg-gray-100 dark:bg-[#1a241e]">
            <tr>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">ID</th>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">Institute</th>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">Representative</th>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">Role</th>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">Email</th>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">Contact</th>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">Address</th>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">Website</th>
              <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c]">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-[#111814] divide-y divide-gray-100 dark:divide-[#1e3a2c]">
            {currentData.map((app) => (
              <tr
                key={app.user_id}
                className="hover:bg-gray-100/40 dark:hover:bg-[#00ff88]/[0.025] transition-all duration-200"
              >
                <td className="py-4 px-4 text-gray-900 dark:text-white text-xs">
                  {app.displayId || app.id}
                </td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300">{app.institute}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300">{app.representative}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300">{app.role}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300 break-words">{app.email}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300">{app.contact}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300">{app.address}</td>
                <td className="py-4 px-4">
  {app.website && app.website !== "N/A" ? (
    <a
      href={`https://${app.website}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 dark:text-[#00ff88] hover:underline break-words"
    >
      {app.website}
    </a>
  ) : (
    <span className="text-gray-500 dark:text-slate-500">N/A</span>
  )}
</td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleApproveClick(app)}
                    disabled={approvingId === app.user_id}
                    className="bg-[#00ff88] hover:bg-[#00e67a] text-[#0a120e] px-3 py-2 rounded-lg text-sm flex items-center gap-1 disabled:opacity-60 transition-colors"
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

      {/* PAGINATION */}
<div className="flex-shrink-0 bg-gray-100 dark:bg-[#16201a] border-t border-gray-200 dark:border-[#1e3a2c] px-6 py-4 flex items-center justify-end rounded-b-2xl">

  <div className="flex items-center gap-2">

    {/* Previous Button */}
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="p-2 rounded-lg bg-gray-100 dark:bg-[#0a0f0c] border border-gray-200 dark:border-[#1e3a2c] text-gray-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <MaterialIcon name="west" className="text-lg" />
    </button>

    {/* Dynamic Page Numbers */}
    <div className="flex items-center gap-1">

      {/* First Page */}
      {currentPage > 2 && totalPages > 3 && (
        <>
          <button
            onClick={() => setCurrentPage(1)}
            className="w-8 h-8 rounded-lg text-xs font-bold text-gray-500 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-[#1e3a2c]"
          >
            1
          </button>

          {currentPage > 3 && (
            <span className="px-1 text-gray-400">...</span>
          )}
        </>
      )}

      {/* Current Pages */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => {
          if (totalPages <= 3) return true;

          return (
            page === currentPage ||
            page === currentPage - 1 ||
            page === currentPage + 1
          );
        })
        .map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              currentPage === page
                ? "bg-[#00ff88] text-[#0a0f0c] shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                : "text-gray-500 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-[#1e3a2c]"
            }`}
          >
            {page}
          </button>
        ))}

      {/* Last Page */}
      {currentPage < totalPages - 1 && totalPages > 3 && (
        <>
          {currentPage < totalPages - 2 && (
            <span className="px-1 text-gray-400">...</span>
          )}

          <button
            onClick={() => setCurrentPage(totalPages)}
            className="w-8 h-8 rounded-lg text-xs font-bold text-gray-500 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-[#1e3a2c]"
          >
            {totalPages}
          </button>
        </>
      )}
    </div>

    {/* Next Button */}
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className="p-2 rounded-lg bg-gray-100 dark:bg-[#0a0f0c] border border-gray-200 dark:border-[#1e3a2c] text-gray-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <MaterialIcon name="east" className="text-lg" />
    </button>

  </div>
</div>
    </div>
  );
};

export default InstitutePendingTable;