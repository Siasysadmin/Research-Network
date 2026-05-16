import React from "react";
import { MaterialIcon } from "../Layout/Layout";



const RejectedRequestsTable = ({
  requests,
  currentRequests,
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange,
}) => {


const getPageNumbers = () => {
  return Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );
};


  if (!currentRequests || currentRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-xl">
        <p className="text-gray-500 dark:text-slate-500">No rejected requests</p>
      </div>
    );
  }

  const getUserTypeStyle = (type) =>
    type === "institute"
      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      : "bg-purple-500/10 text-purple-400 border border-purple-500/20";

  return (
    <div className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-xl overflow-hidden flex flex-col h-full">
      <div className="overflow-auto relative flex-1">
        <table className="w-full border-separate border-spacing-0">
          {/* TABLE HEADER */}
          <thead>
            <tr>
              <th className="py-4 px-4 text-left text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-100 dark:bg-[#0e1a14] border-b border-gray-200 dark:border-[#1e3a2c]">
                REGISTRATION ID
              </th>

              <th className="py-4 px-4 text-left text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-100 dark:bg-[#0e1a14] border-b border-gray-200 dark:border-[#1e3a2c]">
                USERNAME
              </th>

              <th className="py-4 px-4 text-left text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-100 dark:bg-[#0e1a14] border-b border-gray-200 dark:border-[#1e3a2c]">
                USER TYPE
              </th>

              <th className="py-4 px-4 text-left text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-100 dark:bg-[#0e1a14] border-b border-gray-200 dark:border-[#1e3a2c]">
               RESEARCH TITLE
              </th>

              <th className="py-4 px-4 text-left text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-100 dark:bg-[#0e1a14] border-b border-gray-200 dark:border-[#1e3a2c]">
                STATUS
              </th>

              <th className="py-4 px-6 text-right text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-100 dark:bg-[#0e1a14] border-b border-gray-200 dark:border-[#1e3a2c]">
                ACTIONS
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-gray-100 dark:divide-[#1e3a2c]">
            {currentRequests.map((request) => (
              <tr
                key={request.researche_id}
                className="hover:bg-gray-50 dark:hover:bg-[#1e3a2c]/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="text-sm font-mono text-gray-500 dark:text-slate-400">
                    {request.registration_id}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {request.user_type === "individual"
                      ? request.name
                      : request.institute_name}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded ${getUserTypeStyle(
                      request.user_type,
                    )}`}
                  >
                    {request.user_type}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {request.research_title}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 text-xs font-medium rounded bg-[#ff4d4d]/10 text-red-600 dark:text-[#ff4d4d] border border-[#ff4d4d]/20">
                    REJECTED
                  </span>
                </td>

                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => onViewDetails(request.researche_id)}
                    className="px-3 py-1.5 bg-green-100 dark:bg-[#00ff88]/10 hover:bg-[#00ff88] text-green-700 dark:text-[#00ff88] hover:text-white dark:hover:text-[#0a120e] text-xs font-medium rounded transition-all"
                  >
                    VIEW DETAILS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
<div className="bg-gray-100 dark:bg-[#0e1a14] border-t border-gray-200 dark:border-[#1e3a2c] px-6 py-4 flex items-center justify-end">

  <div className="flex items-center gap-2">
    
    {/* Previous Button */}
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] text-gray-500 dark:text-slate-400 hover:text-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <MaterialIcon name="west" className="text-lg" />
    </button>

    {/* Page Numbers */}
    <div className="flex gap-1">
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
            currentPage === pageNum
              ? "bg-[#00ff88] text-[#0a0f0c]"
              : "text-gray-500 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-[#1e3a2c]"
          }`}
        >
          {pageNum}
        </button>
      ))}
    </div>

    {/* Next Button */}
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] text-gray-500 dark:text-slate-400 hover:text-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <MaterialIcon name="east" className="text-lg" />
    </button>

  </div>
</div>
    </div>
  );
};

export default RejectedRequestsTable;
