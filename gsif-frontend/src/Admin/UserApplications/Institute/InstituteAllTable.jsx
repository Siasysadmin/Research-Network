import React, { useState } from "react";
import { MaterialIcon } from "../../Layout/Layout";

const InstituteAllTable = ({ applications }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-[#13231a] rounded-xl shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <MaterialIcon name="inbox" className="text-4xl text-slate-600 mb-3" />
          <p className="text-slate-400">No applications found</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(applications.length / itemsPerPage);

  const currentData = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="bg-[#13231a] flex flex-col rounded-xl h-full">
     
      {/* TABLE */}
      <div className="flex-1 overflow-y-auto max-h-[700px] ">
        <table className="w-full table-fixed  border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-30 bg-[#0e1a14]">
           
            <tr className="bg-[#0e1a14]">
              {[
                "ID",
                "Institute",
                "Representative",
                "Role",
                "Email",
                "Contact",
                "Address",
                "Website",
                "Status",
              ].map((head) => (
                <th
                  key={head}
                  className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-[#00ff88] border-b border-[#1e3a2c]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1e3a2c]">
            {currentData.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-[#00ff88]/[0.04] transition-all duration-200"
              >
                <td className="py-4 px-4 text-xs font-mono text-white">
                  {app.id}
                </td>

                <td className="py-4 px-4 text-slate-300">{app.institute}</td>

                <td className="py-4 px-4 text-slate-300">
                  {app.representative}
                </td>

                <td className="py-4 px-4 text-slate-300">{app.role}</td>

                <td className="py-4 px-4 text-slate-300 w-[220px] break-words">
                  {app.email}
                </td>

                <td className="py-4 px-4 text-slate-300">{app.contact}</td>

                <td className="py-4 px-4 text-slate-300 truncate max-w-[200px]">
                  {app.address}
                </td>

<td className="py-4 px-4 text-slate-300 w-[230px] break-words">                  {app.website && app.website !== "N/A" ? (
                    <a
                      href={`https://${app.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00ff88] hover:underline"
                    >
                      {app.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      app.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
                Math.min(totalPages, currentPage + 2),
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

export default InstituteAllTable;
