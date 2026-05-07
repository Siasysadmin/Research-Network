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
        toast.error("Failed to fetch data");
        setResearchers([]);
      }
    } catch (error) {
      toast.error("Network error");
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
      <div className="h-full w-full flex items-center justify-center bg-[#0a0f0c]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-2 border-[#00ff88]/10 rounded-full blur-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 lg:p-10 bg-[#0a0f0c] ">
      {/* HEADER */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
            Individual Researchers
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage and monitor individual researcher applications.
          </p>
        </div>
   
        <div className="relative group ">
          
          <div className="absolute -inset-0.2 bg-gradient-to-r from-[#00ff88] to-[#00a365] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative flex items-center bg-[#131a15] rounded-lg border border-[#1e2922]">
            <MaterialIcon name="search" className="ml-3 text-slate-400" />
            <input
              className="bg-transparent border-none py-2.5 pl-2 pr-4 text-sm focus:ring-0 outline-none w-64 text-white placeholder-slate-600"
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
        {/* Border gradient - SIRF YAHI AADHA KIYA HAI */}
        <div className="absolute -inset-0.4 bg-gradient-to-r from-[#00ff88] to-[#00a365] rounded-2xl opacity-20 blur-[1px]"></div>
        
        <div className="relative flex flex-col h-full bg-[#111814] rounded-2xl">
          <div className="flex-1 overflow-auto custom-scrollbar rounded-t-2xl">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#1a241e]">
                  {[
                    "User ID",
                    "Full Name",
                    "Contact Info",
                    "Location",
                    "Pincode",
                  ].map((head) => (
                    <th
                      key={head}
                      className="py-4 px-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#00ff88] border-b border-[#1e2922]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1e2922]">
                {currentData.length > 0 ? (
                  currentData.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-[#00ff88]/[0.03] transition-all duration-200 group"
                    >
                      <td className="py-6 px-8">
                        <span className="text-xs font-mono px-2 py-1  rounded">
                          {res.id}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-100">
                        {res.name}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-300">
                            {res.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-300">
                            {res.city}, {res.state}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase">
                            {res.country}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm font-mono text-slate-400">
                        {res.pincode}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-20 text-center text-slate-500 italic"
                    >
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex-shrink-0 bg-[#16201a] border-t border-[#1e2922] px-6 py-4 flex items-center justify-between rounded-b-2xl">
            <span className="text-xs text-slate-500 font-medium">
              Page {currentPage} of {totalPages || 1}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-lg bg-[#0a0f0c] border border-[#1e2922] text-slate-400 hover:text-[#00ff88] disabled:opacity-30 transition-colors"
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
                          : "text-slate-500 hover:bg-[#1e2922]"
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
                className="p-2 rounded-lg bg-[#0a0f0c] border border-[#1e2922] text-slate-400 hover:text-[#00ff88] disabled:opacity-30 transition-colors"
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