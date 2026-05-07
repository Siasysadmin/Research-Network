import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResearchAllRequestsTable from "./ResearchAllRequestsTable";
import API_CONFIG from "../../config/api.config";

const ResearchAllRequests = ({ searchQuery, onApprove, onReject }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
  
const handleViewDetails = (id) => {
  console.log("Clicked research ID:", id);
 navigate("/admin/view-research", { state: { id } });
};

  useEffect(() => {
    const fetchResearchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token) throw new Error("Please login first");

        const response = await fetch(
          `${API_CONFIG.BASE_URL}/research/get-research`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();

        if (data.status === true) {
          // Process the data to add a displayName field
          const processedData = Array.isArray(data.data)
            ? data.data.reverse().map((item) => {
                return {
                  ...item,
                  id: item.researche_id,
                  status: String(item.research_status ?? item.status ?? "1"),
                  displayName:
                    item.user_type === "individual"
                      ? item.name
                      : item.institute_name || item.name,
                };
              })
            : [];

          setRequests(processedData);
          setCurrentPage(1); // Reset to first page on new data
        } else {
          throw new Error(data.message || "Failed to fetch");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchRequests();
  }, []);

  // Filter Logic
  const filteredRequests = requests.filter((request) => {
    if (!searchQuery) return true;
    const values = [
      request.research_title,
      request.registration_id,
      request.displayName,
      request.user_type,
    ];
    return values.some(
      (val) =>
        val && String(val).toLowerCase().includes(searchQuery.toLowerCase()),
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading)
    return (
      <div className="text-center p-8 bg-[#13231a] border border-[#1e3a2c] rounded-xl">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ff88]"></div>
          <p className="text-gray-400">Loading research data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center p-8 bg-[#13231a] border border-red-900/30 rounded-xl">
        <p className="text-red-400">{error}</p>
      </div>
    );

  return (
    <ResearchAllRequestsTable
      requests={currentRequests}
      onApprove={onApprove}
      onReject={onReject}
      onViewDetails={handleViewDetails}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      totalItems={filteredRequests.length}
      itemsPerPage={itemsPerPage}
    />
  );
};

export default ResearchAllRequests;