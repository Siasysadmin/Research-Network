import React, { useState } from "react";
import { MaterialIcon } from "../Layout/Layout";

const PendingResearchRequestsTable = ({
  requests = [],
  onViewDetails,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
}) => {
  const [activeStatusId, setActiveStatusId] = useState(null);

  if (!requests.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-xl transition-colors duration-300">
        <p className="text-gray-500 dark:text-slate-500">
          No pending research requests
        </p>
      </div>
    );
  }

  const getUserTypeStyle = (type) => {
    const t = type?.toLowerCase();
    if (t === "institute")
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (t === "individual")
      return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
  };

  const getStatusStyle = (status) => {
    if (status === "1" || status?.toLowerCase() === "pending")
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    if (status?.toLowerCase() === "approved")
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    if (status?.toLowerCase() === "rejected")
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  const getDisplayStatus = (status) =>
    status === "1" ? "Pending" : status || "Pending";

  const getDisplayName = (request) => {
    if (request.displayName) return request.displayName;

    const userType = request.user_type || request.type || request.role;

    if (userType?.toLowerCase() === "individual") {
      return request.name || request.username || request.full_name || "N/A";
    } else if (userType?.toLowerCase() === "institute") {
      return (
        request.institute_name || request.name || request.username || "N/A"
      );
    }

    return request.name || request.username || request.institute_name || "N/A";
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!totalPages || totalPages < 1) return [];
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };
  const getResearchMode = (updateCount) => {
    return Number(updateCount) === 0 ? "New" : "Resubmitted";
  };

  const getResearchModeStyle = (updateCount) => {
    return Number(updateCount) === 0
      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
      : "bg-orange-500/10 text-orange-500 border border-orange-500/20";
  };

  return (
    <div className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-xl overflow-hidden flex flex-col h-full transition-colors duration-300">
      {/* Table with Fixed Header */}
      <div className="overflow-auto flex-1" style={{ maxHeight: "550px" }}>
        <table className="w-full table-fixed">
          <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-[#0e1a14]">
            <tr className="bg-gray-100 dark:bg-[#0e1a14] text-gray-500 dark:text-slate-400 text-xs uppercase">
              <th className="py-4 px-4 text-left w-[100px]">REGISTRATION ID</th>
              <th className="py-4 px-4 text-left w-[100px]">USERNAME</th>
              <th className="py-4 px-4 text-left w-[100px]">USER TYPE</th>
              <th className="py-4 px-4 text-left w-[250px]">PAPER TITLE</th>
              <th className="py-4 px-4 text-left w-[100px]">STATUS</th>
              <th className="py-4 px-4 text-left w-[100px]">MODE</th>
              <th className="py-4 px-6 text-right w-[100px]">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-[#1e3a2c]">
            {requests.map((request, index) => {
              const id =
                request.id || request._id || request.requestId || index;
              const registrationId =
                request.primary_author_id ||
                request.author_id ||
                request.registrationId ||
                request.id ||
                "N/A";

              const username = getDisplayName(request);

              const paperTitle =
                request.research_title ||
                request.title ||
                request.paper_title ||
                request.topic ||
                request.research_topic ||
                "Untitled";

              const userType =
                request.user_type ||
                request.type ||
                request.role ||
                request.account_type ||
                "Researcher";

              const status = request.status || "1";
              const updateCount = request.update_count || "0";
              return (
                <tr
                  key={id}
                  className="hover:bg-gray-50 dark:hover:bg-[#1e3a2c]/30 transition-colors"
                >
                  <td
                    className="py-4 px-4 font-mono text-gray-500 dark:text-slate-400 truncate"
                    title={registrationId}
                  >
                    {registrationId}
                  </td>
                  <td
                    className="py-4 px-4 text-gray-900 dark:text-white"
                    title={username}
                  >
                    <div className="whitespace-normal break-words leading-5">
                      {username}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getUserTypeStyle(userType)}`}
                    >
                      {userType
                        ? userType.charAt(0).toUpperCase() +
                          userType.slice(1).toLowerCase()
                        : "Researcher"}
                    </span>
                  </td>
                  <td
                    className="py-4 px-4 text-gray-600 dark:text-slate-300"
                    title={paperTitle}
                  >
                    <div className="whitespace-normal break-words leading-5">
                      {paperTitle}
                    </div>
                  </td>
                  <td className="py-4 px-4 relative">
                    <span
                      onClick={() =>
                        setActiveStatusId(activeStatusId === id ? null : id)
                      }
                      className={`cursor-pointer text-xs px-2 py-1 rounded ${getStatusStyle(status)}`}
                    >
                      {getDisplayStatus(status)}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getResearchModeStyle(updateCount)}`}
                    >
                      {getResearchMode(updateCount)}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        if (onViewDetails) {
                          onViewDetails(request.researche_id || request.id);
                        }
                      }}
                      className="px-3 py-1 bg-green-100 dark:bg-[#00ff88]/10 hover:bg-green-500 dark:hover:bg-[#00ff88] text-green-700 dark:text-[#00ff88] hover:text-white dark:hover:text-black text-xs rounded transition-colors"
                    >
                      VIEW DETAILS
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="bg-gray-100 dark:bg-[#0e1a14] border-t border-gray-200 dark:border-[#1e3a2c] px-6 py-4 flex items-center justify-end transition-colors duration-300">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
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
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
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

export default PendingResearchRequestsTable;
