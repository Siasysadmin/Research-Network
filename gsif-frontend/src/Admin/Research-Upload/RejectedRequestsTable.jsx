import React from "react";

const RejectedRequestsTable = ({ requests, onViewDetails }) => {
  if (!requests || requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#13231a] border border-[#1e3a2c] rounded-xl">
        <p className="text-slate-500">No rejected requests</p>
      </div>
    );
  }

  const getUserTypeStyle = (type) =>
    type === "institute"
      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      : "bg-purple-500/10 text-purple-400 border border-purple-500/20";

  return (
    <div className="bg-[#13231a] border border-[#1e3a2c] rounded-xl overflow-hidden flex flex-col h-full">
      <div className="overflow-auto relative flex-1">
        <table className="w-full border-separate border-spacing-0">
          {/* TABLE HEADER */}
          <thead>
            <tr>
              <th className="py-4 px-4 text-left text-xs text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c]">
                REGISTRATION ID
              </th>

              <th className="py-4 px-4 text-left text-xs text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c]">
                USERNAME
              </th>

              <th className="py-4 px-4 text-left text-xs text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c]">
                USER TYPE
              </th>

              <th className="py-4 px-4 text-left text-xs text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c]">
               RESEARCH TITLE
              </th>

              <th className="py-4 px-4 text-left text-xs text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c]">
                STATUS
              </th>

              <th className="py-4 px-6 text-right text-xs text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c]">
                ACTIONS
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-[#1e3a2c]">
            {requests.map((request) => (
              <tr
                key={request.researche_id}
                className="hover:bg-[#1e3a2c]/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="text-sm font-mono text-slate-400">
                    {request.registration_id}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-sm font-medium text-white">
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
                  <span className="text-sm text-slate-300">
                    {request.research_title}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 text-xs font-medium rounded bg-[#ff4d4d]/10 text-[#ff4d4d] border border-[#ff4d4d]/20">
                    REJECTED
                  </span>
                </td>

                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => onViewDetails(request.researche_id)}
                    className="px-3 py-1.5 bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-[#0a120e] text-xs font-medium rounded transition-all"
                  >
                    VIEW DETAILS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="bg-[#0e1a14] border-t border-[#1e3a2c] px-6 py-3 flex items-center justify-end">
        <span className="text-xs text-slate-500">
          Showing 1-{requests.length} of {requests.length} results
        </span>
      </div>
    </div>
  );
};

export default RejectedRequestsTable;
