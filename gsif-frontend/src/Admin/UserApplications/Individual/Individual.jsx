import React, { useState, useEffect } from "react";
import { Layout, MaterialIcon } from "../../Layout/Layout";
import API_CONFIG from "../../../config/api.config";
import { toast } from "react-toastify";

const IndividualResearchersTable = () => {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchResearchers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/get-individual-users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      const result = await response.json();

      if (response.ok && result.status === true) {
        const transformedData = result.data
          .reverse() // ✅ Newest users pehle (upar) aayenge
          .map((user, index) => ({
            id: `${user.registration_id || String(index + 1).padStart(3, "0")}`,
            name: user.name || "N/A",
            email: user.email || "N/A",
            country: user.country || "N/A",
            state: user.state || "N/A",
            city: user.city || "N/A",
            pincode: user.pincode || "N/A",
          }));
        setResearchers(transformedData);
      } else {
          toast.error("Failed to fetch data", {
          toastId: "fetch-error",
          className: "dark:!bg-[#1a1a1a] dark:!text-white",
        });
        setResearchers([]);
      }
    } catch (error) {
      toast.error("Network error", {
      toastId: "network-error",
      className: "dark:!bg-[#1a1a1a] dark:!text-white",
    });
      setResearchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchers();
  }, []);

  const filteredResearchers = researchers.filter((r) =>
    Object.values(r).some((val) =>
      val.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filteredResearchers.length / itemsPerPage);

  const currentData = filteredResearchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
  return (
    // Yahan bg-[#0a0f0c] hardcoded hai, ise change karein
    <div className="h-full w-full flex items-center justify-center bg-white dark:bg-[#0a0f0c]">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

  return (
    <div className="flex flex-col h-full p-6 lg:p-10 bg-white dark:bg-[#0a0f0c]">
      {/* HEADER */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Individual Researchers
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            Manage and monitor individual researcher applications.
          </p>
        </div>
   
        <div className="relative group focus-within:rounded-lg focus-within:border-[#00ff88] dark:focus-within:border-[#00ff88] focus-within:ring-1 focus-within:ring-[#00ff88]/40 dark:focus-within:ring-[#00ff88]/30 transition-all">

  <div className="absolute -inset-0.2 bg-gradient-to-r from-[#00ff88] to-[#00a365] rounded-lg blur opacity-20 group-hover:opacity-40 group-focus-within:opacity-50 transition duration-300 pointer-events-none"></div>

  <div className="relative flex items-center bg-white dark:bg-[#131a15] border border-gray-200 dark:border-[#1e2922] rounded-lg">

    <MaterialIcon
      name="search"
      className="ml-3 text-slate-400 dark:text-slate-400"
    />

    <input
      className="bg-transparent border-none py-2.5 pl-2 pr-4 text-sm focus:ring-0 outline-none w-64 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600"
      placeholder="Filter by name, email or ID..."
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>
</div>
      </div>

      {/* TABLE */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        
        <div className="absolute inset-[1px] bg-gradient-to-r from-[#00ff88] to-[#00a365] rounded-2xl opacity-20 blur-[1px] pointer-events-none hidden dark:block"></div>

        <div className="relative flex flex-col h-full min-h-[350px] bg-white dark:bg-[#111814] rounded-2xl border border-gray-200 dark:border-none overflow-hidden">
        <div className="flex-1 overflow-x-auto overflow-y-auto rounded-t-2xl bg-[#fcfcfc] dark:bg-[#111814] custom-scrollbar">            
          <table className="min-w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-[#1a241e]">
                <tr className="bg-gray-100 dark:bg-[#1a241e] border-b border-gray-200 dark:border-none">
                  {[
                    "User ID",
                    "Full Name",
                    "Contact Info",
                    "Location",
                    "Pincode",
                  ].map((head) => (
                    <th
                      key={head}
                      className="py-4 px-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-green-600 dark:text-[#00ff88]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-[#111814] divide-y divide-gray-100 dark:divide-[#1e2922]">
                {currentData.length > 0 ? (
                  currentData.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#00ff88]/[0.03] transition-all duration-200 group"
                    >
                      <td className="py-6 px-8">
                        <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-transparent text-gray-700 dark:text-slate-300">
                          {res.id}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-slate-100">
                        {res.name}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700 dark:text-slate-300">
                            {res.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700 dark:text-slate-300">
                            {res.city}, {res.state}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-slate-500 uppercase">
                            {res.country}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm font-mono text-gray-500 dark:text-slate-400">
                        {res.pincode}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-gray-500 dark:text-slate-500 italic"
                    >
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex-shrink-0 bg-gray-100 dark:bg-[#16201a] px-6 py-4 flex items-center justify-end rounded-b-2xl">
      
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-[#0a0f0c] border border-gray-200 dark:border-[#1e2922] text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-[#1e2922] disabled:opacity-30 transition-colors"
              >
                <MaterialIcon name="west" className="text-lg" />
              </button>

              <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((pageNumber, index, array) => (
                  <React.Fragment key={pageNumber}>
                    {index > 0 && array[index - 1] !== pageNumber - 1 && (
                      <span className="px-1 text-gray-400">...</span>
                    )}

                    <button
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNumber
                          ? "bg-[#00ff88] text-[#0a0f0c] shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                          : "text-gray-500 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-[#1e2922]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  </React.Fragment>
                ))}
            </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-[#0a0f0c] border border-gray-200 dark:border-[#1e2922] text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-[#1e2922] disabled:opacity-30 transition-colors"
              >
                <MaterialIcon name="east" className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div> 

    </div>
  );
};

export default function UserIndividual() {
  const [activeNav, setActiveNav] = useState("users");

  return (
    <Layout
      activeNav={activeNav}
      setActiveNav={setActiveNav}
    >
      <IndividualResearchersTable />
    </Layout>
  );
}