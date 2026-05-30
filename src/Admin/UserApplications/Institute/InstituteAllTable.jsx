import React, { useState } from "react";
import { MaterialIcon } from "../../Layout/Layout";

const InstituteAllTable = ({ applications }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!applications || applications.length === 0) {
  return (
    <div className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-gray-200 dark:border-[#1e2922] rounded-xl shadow-sm overflow-hidden">
      <div className="p-12 text-center">
        <MaterialIcon
          name="inbox"
          className="text-4xl text-gray-400 dark:text-slate-600 mb-3"
        />

        <p className="text-gray-500 dark:text-gray-600 dark:text-slate-400">
          No applications found
        </p>
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
  <div className="bg-white dark:bg-[#111814] border border-gray-200 dark:border-[#1e3a2c] flex flex-col h-full rounded-2xl overflow-hidden">

    {/* TABLE */}
    <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-[#111814]">

      <table className="w-full border-collapse text-left">

        {/* HEADER */}
        <thead className="sticky top-0 z-40 bg-gray-100 dark:bg-[#1a241e]">
          <tr>
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
                className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] border-b border-gray-200 dark:border-[#1e3a2c]"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-gray-100 dark:divide-[#1e3a2c] bg-white dark:bg-[#111814]">

          {currentData.map((app) => (
            <tr
              key={app.id}
              className="hover:bg-gray-50 dark:hover:bg-[#00ff88]/[0.03] transition-all duration-200"
            >
              <td className="py-4 px-4 text-xs font-mono text-gray-900 dark:text-white">
                {app.id}
              </td>

              <td className="py-4 px-4 text-gray-700 dark:text-slate-300">
                {app.institute}
              </td>

              <td className="py-4 px-4 text-gray-700 dark:text-slate-300 w-[180px] break-words">
                {app.representative}
              </td>

              <td className="py-4 px-4 text-gray-700 dark:text-slate-300">
                {app.role}
              </td>

              <td className="py-4 px-4 text-gray-700 dark:text-slate-300 break-words">
                {app.email}
              </td>

              <td className="py-4 px-4 text-gray-700 dark:text-slate-300">
                {app.contact}
              </td>

              <td className="py-4 px-4 text-gray-700 dark:text-slate-300 truncate max-w-[200px]">
                {app.address}
              </td>

              <td className="py-4 px-4">
                {app.website && app.website !== "N/A" ? (
                  <a
                    href={`https://${app.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-[#00ff88] hover:underline"
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
                      ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      : "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
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
<div className="flex-shrink-0 bg-gray-100 dark:bg-[#16201a] border-t border-gray-200 dark:border-[#1e3a2c] px-6 py-4 flex items-center justify-end">

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

      {/* Middle Pages */}
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

export default InstituteAllTable;
