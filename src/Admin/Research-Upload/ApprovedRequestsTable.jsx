import React from "react";

const ApprovedRequestsTable = ({
  requests,
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-xl">
        <p className="text-gray-500 dark:text-slate-500">
          No approved requests
        </p>
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  };

  const getResearchMode = (updateCount) => {
    return Number(updateCount) === 0 ? "New" : "Resubmitted";
  };

  const getResearchModeStyle = (updateCount) => {
    return Number(updateCount) === 0
      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
      : "bg-orange-500/10 text-orange-500 border border-orange-500/20";
  };

  const getUserTypeStyle = (type) =>
    type === "institute"
      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      : "bg-purple-500/10 text-purple-400 border border-purple-500/20";

  return (
    <div className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-xl overflow-hidden flex flex-col h-full">
      {/* Table */}
      <div className="overflow-auto relative flex-1">
        <table className="w-full table-fixed border-separate border-spacing-0">
          <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-[#0e1a14]">
            <tr className="bg-gray-100 dark:bg-[#0e1a14] text-gray-500 dark:text-slate-400 text-xs uppercase">
              <th className="py-4 px-4 text-left w-[100px]">REGISTRATION ID</th>
              <th className="py-4 px-4 text-left w-[120px]">USERNAME</th>
              <th className="py-4 px-4 text-left w-[100px]">USER TYPE</th>
              <th className="py-4 px-4 text-left w-[250px]">RESEARCH TITLE</th>
              <th className="py-4 px-4 text-left w-[100px]">STATUS</th>
              <th className="py-4 px-4 text-left w-[100px]">MODE</th>
              <th className="py-4 px-6 text-right w-[90px]">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-[#1e3a2c]">
            {requests.map((request) => {
              const updateCount = request.update_count || "0";

              return (
                <tr
                  key={request.researche_id || request.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#1e3a2c]/30"
                >
                  <td className="py-4 px-4 font-mono text-gray-500 dark:text-slate-400 truncate">
                    {request.registration_id || request.user_id}
                  </td>

                  <td className="py-4 px-4 break-words">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.user_type === "individual"
                          ? request.name
                          : request.institute_name || "N/A"}
                      </span>

                      {request.user_type === "individual" && request.email && (
                        <span className="text-xs text-gray-500 dark:text-slate-500 break-words">
                          {request.email}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getUserTypeStyle(
                        request.user_type,
                      )}`}
                    >
                      {request.user_type}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-gray-600 dark:text-slate-300">
                    <span className="whitespace-normal break-words leading-5">
                      {request.research_title || request.paperTitle}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded bg-[#00ff88]/10 text-[#00aa66] dark:text-[#00ff88] border border-[#00ff88]/20">
                      APPROVED
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded border ${
                        Number(updateCount) === 0
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      }`}
                    >
                      {Number(updateCount) === 0 ? "NEW" : "RESUBMITTED"}
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() =>
                          onViewDetails(request.researche_id || request.id)
                        }
                        className="px-3 py-1.5 bg-green-100 dark:bg-[#00ff88]/10 hover:bg-[#00ff88] text-green-700 dark:text-[#00ff88] hover:text-white dark:hover:text-[#0a120e] text-xs font-medium rounded transition-all whitespace-nowrap"
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-100 dark:bg-[#0e1a14] border-t border-gray-200 dark:border-[#1e3a2c] px-6 py-4 flex items-center justify-end">
        <div className="flex items-center gap-2">
          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] text-gray-500 dark:text-slate-400 hover:text-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              chevron_left
            </span>
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

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] text-gray-500 dark:text-slate-400 hover:text-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovedRequestsTable;
