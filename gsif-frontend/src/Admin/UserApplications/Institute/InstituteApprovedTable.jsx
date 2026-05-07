import React, { useState } from "react";
import { MaterialIcon } from "../../Layout/Layout";

const InstituteApprovedTable = ({ applications }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-[#13231a] rounded-xl p-12 text-center">
        <MaterialIcon name="inbox" className="text-4xl text-slate-600 mb-3" />
        <p className="text-slate-400">No approved applications</p>
      </div>
    );
  }

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const currentData = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#13231a] flex flex-col rounded-xl h-full relative">
      
      {/* Table Container with Fixed Header */}
      <div className="flex-1 overflow-auto relative" style={{ maxHeight: '600px' }}>
        <table className="w-full border-separate border-spacing-0">
          
          {/* Fixed Header - Yeh top par chipka rahega */}
          <thead className="sticky top-0 z-20">
            <tr>
              {["ID", "Institute", "Representative", "Role", "Email", "Contact", "Address", "Website", "Status"].map((head) => (
                <th
                  key={head}
                  className="py-4 px-4 text-xs text-slate-400 uppercase bg-[#0e1a14] border-b border-[#1e3a2c] whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body - Scroll hoga */}
          <tbody className="divide-y divide-[#1e3a2c]">
            {currentData.map((app) => (
              <tr key={app.id} className="hover:bg-[#1e3a2c]/30">
                
                <td className="py-4 px-4 text-xs text-white whitespace-nowrap">{app.id}</td>
                <td className="py-4 px-4 text-slate-300 whitespace-nowrap">{app.institute}</td>
                <td className="py-4 px-4 text-slate-300 whitespace-nowrap">{app.representative}</td>
                <td className="py-4 px-4 text-slate-300 whitespace-nowrap">{app.role}</td>
                <td className="py-4 px-4 text-slate-300 max-w-[200px] truncate" title={app.email}>
                  {app.email}
                </td>
                <td className="py-4 px-4 text-slate-300 whitespace-nowrap">{app.contact}</td>
                <td className="py-4 px-4 text-slate-300 max-w-[200px] truncate" title={app.address}>
                  {app.address}
                </td>
                <td className="py-4 px-4 text-[#00ff88] whitespace-nowrap">
                  {app.website}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs font-semibold">
                    Approved
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Yeh neeche fixed rahega */}
      <div className="flex-shrink-0 bg-[#16201a] border-t border-[#1e3a2c] px-6 py-4 flex items-center justify-between rounded-b-xl">
        
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

          <span className="text-sm text-slate-400">
            {currentPage} / {totalPages}
          </span>

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

export default InstituteApprovedTable;