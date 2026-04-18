import React from "react";

const ApprovedRequestsTable = ({ requests, onViewDetails }) => {
  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#13231a] border border-[#1e3a2c] rounded-xl">
        <p className="text-slate-500">No approved requests</p>
      </div>
    );
  }

  const getUserTypeStyle = (type) =>
    type === "institute"
      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      : "bg-purple-500/10 text-purple-400 border border-purple-500/20";

  return (
    <div className="bg-[#13231a] border border-[#1e3a2c] rounded-xl overflow-hidden flex flex-col h-full">
      {/* Table */}
      <div className="overflow-y-auto overflow-x-hidden relative flex-1">
        <table className="w-full table-fixed border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky top-0 z-20 py-4 px-4 text-left text-xs font-medium text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c] w-[120px]">
                USER ID
              </th>

              <th className="sticky top-0 z-20 py-4 px-4 text-left text-xs font-medium text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c] w-[200px]">
                USERNAME
              </th>

              <th className="sticky top-0 z-20 py-4 px-4 text-left text-xs font-medium text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c] w-[130px]">
                USER TYPE
              </th>

              <th className="sticky top-0 z-20 py-4 px-4 text-left text-xs font-medium text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c]">
                PAPER TITLE
              </th>

              <th className="sticky top-0 z-20 py-4 px-4 text-left text-xs font-medium text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c] w-[130px]">
                STATUS
              </th>

              <th className="sticky top-0 z-20 py-4 px-6 text-right text-xs font-medium text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c] w-[150px]">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1e3a2c]">
            {requests.map((request) => (
              <tr
                key={request.researche_id || request.id}
                className="hover:bg-[#1e3a2c]/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="text-sm font-mono text-slate-400 break-words">
                    {request.registration_id || request.user_id}
                  </span>
                </td>

                <td className="py-4 px-4 break-words">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {request.user_type === "individual"
                        ? request.name
                        : request.institute_name || "N/A"}
                    </span>

                    {request.user_type === "individual" && request.email && (
                      <span className="text-xs text-slate-500 break-words">
                        {request.email}
                      </span>
                    )}
                  </div>
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

                <td className="py-4 px-4 break-words">
                  <span className="text-sm text-slate-300">
                    {request.research_title || request.paperTitle}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 text-xs font-medium rounded bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                    APPROVED
                  </span>
                </td>

                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() =>
                      onViewDetails(request.researche_id || request.id)
                    }
                    className="px-3 py-1.5 bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-[#0a120e] text-xs font-medium rounded transition-all whitespace-nowrap"
                  >
                    VIEW DETAILS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-[#0e1a14] border-t border-[#1e3a2c] px-6 py-3 flex items-center justify-end flex-none">
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">
            Showing 1-{requests.length} of {requests.length} results
          </span>

          <div className="flex items-center gap-2">
            <button
              className="p-1 text-slate-400 hover:text-[#00ff88] disabled:opacity-30"
              disabled
            >
              <span className="material-symbols-outlined text-lg">
                chevron_left
              </span>
            </button>

            <button className="w-7 h-7 rounded bg-[#00ff88] text-[#0a120e] text-xs font-medium">
              1
            </button>

            <button className="w-7 h-7 rounded text-slate-400 hover:bg-[#00ff88]/10 hover:text-[#00ff88] text-xs">
              2
            </button>

            <button className="w-7 h-7 rounded text-slate-400 hover:bg-[#00ff88]/10 hover:text-[#00ff88] text-xs">
              3
            </button>

            <span className="text-slate-600">...</span>

            <button className="w-7 h-7 rounded text-slate-400 hover:bg-[#00ff88]/10 hover:text-[#00ff88] text-xs">
              5
            </button>

            <button className="p-1 text-slate-400 hover:text-[#00ff88]">
              <span className="material-symbols-outlined text-lg">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedRequestsTable;
