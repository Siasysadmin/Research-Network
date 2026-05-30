import React, { useState } from "react";
import { MaterialIcon } from "../../Layout/Layout";

const InstituteApprovedTable = ({ applications }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-2xl p-12 text-center">
        <MaterialIcon name="inbox" className="text-4xl text-gray-400 dark:text-slate-600 mb-3" />
        <p className="text-gray-500 dark:text-slate-400">No approved applications</p>
      </div>
    );
  }

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const currentData = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white dark:bg-[#111814] border border-gray-200 dark:border-[#1e3a2c] flex flex-col h-full  rounded-2xl relative overflow-hidden min-h-[300px]">
      
      {/* Table Container with Fixed Header */}
      <div
        className="flex-1 overflow-auto relative bg-white dark:bg-[#111814] custom-scrollbar"
        style={{ maxHeight: "600px" }}
      >
        <table className="w-full border-collapse text-left">
          
          {/* Fixed Header - Yeh top par chipka rahega */}
          <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-[#1a241e]">
            <tr>
              {["ID", "Institute", "Representative", "Role", "Email", "Contact", "Address", "Website", "Status"].map((head) => (
                <th
                  key={head}
                  className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-[#00ff88] bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-[#1e3a2c] whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body - Scroll hoga */}
          <tbody className="bg-white dark:bg-[#111814] divide-y divide-gray-100 dark:divide-[#1e3a2c]">
            {currentData.map((app) => (
              <tr key={app.id} 
                className="hover:bg-gray-100/40 dark:hover:bg-[#00ff88]/[0.025] transition-all duration-200"
              >
                
                <td className="py-4 px-4 text-xs text-gray-900 dark:text-white whitespace-nowrap">{app.id}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300 whitespace-nowrap">{app.institute}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300 whitespace-nowrap">{app.representative}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300 whitespace-nowrap">{app.role}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300 max-w-[200px] truncate" title={app.email}>
                  {app.email}
                </td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300 whitespace-nowrap">{app.contact}</td>
                <td className="py-4 px-4 text-gray-700 dark:text-slate-300 max-w-[200px] truncate" title={app.address}>
                  {app.address}
                </td>
                <td className="py-4 px-4 text-green-600 dark:text-[#00ff88] whitespace-nowrap">
                  {app.website}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-xs font-semibold">
                    Approved
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Yeh neeche fixed rahega */}
      <div className="flex-shrink-0 bg-gray-100 dark:bg-[#16201a] border-t border-gray-200 dark:border-[#1e3a2c] px-6 py-4 flex items-center justify-end rounded-b-2xl">
      
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#0a0f0c] border border-gray-200 dark:border-[#1e3a2c] text-gray-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-[#00ff88] disabled:opacity-30 transition-colors"
          >
            <MaterialIcon name="west" className="text-lg" />
          </button>

          <div className="flex gap-1">
            {[
              ...Array(
                totalPages <= 3
                  ? totalPages
                  : currentPage === 1
                  ? 3
                  : Math.min(3, totalPages - 1)
              ),
            ].map((_, i) => {
              const pageNumber =
                totalPages <= 3
                  ? i + 1
                  : currentPage === 1
                  ? i + 1
                  : i + 2;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNumber
                      ? "bg-[#00ff88] text-[#0a0f0c] shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                      : "text-gray-500 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-[#1e3a2c]"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#0a0f0c] border border-gray-200 dark:border-[#1e3a2c] text-gray-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-[#00ff88] disabled:opacity-30 transition-colors"
          >
            <MaterialIcon name="east" className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstituteApprovedTable;