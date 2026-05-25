import React, { useEffect, useState } from "react";
import PendingResearchRequestsTable from "./PendingRequestsTable";
import API_CONFIG from "../../config/api.config";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PendingRequests = ({ searchQuery, onApprove, onReject, onViewDetails }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchPendingResearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `${API_CONFIG.BASE_URL}/admin/get-pending-research`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      
      let researchData = [];
      
      if (res.data?.status && Array.isArray(res.data.data)) {
        researchData = res.data.data;
      } else if (Array.isArray(res.data)) {
        researchData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        researchData = res.data.data;
      } else {
        console.warn("Unexpected response structure:", res.data);
        setRequests([]);
        return;
      }
      
      const formatted = researchData.reverse().map((item) => ({
        ...item,
        id: item.id || item._id,
        name: item.name || item.institute_name || item.username || item.full_name || "Unknown",
        primary_author_id: item.primary_author_id || item.author_id || item.registration_id || "N/A",
        research_title: item.research_title || item.title || item.paper_title || item.topic || "Untitled",
        user_type: item.user_type || item.type || item.role || "researcher",
        status: item.status || "1"
      }));

      const pending = formatted.filter(item => 
        item.status === "1" || item.status?.toLowerCase() === "pending"
      );
      
      setRequests(pending);
      setCurrentPage(1); // Reset to first page on new data
      
    } catch (error) {
      console.error("Error fetching research:", error);
      setError(error.message || "Failed to fetch research requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingResearch();
  }, []);

  // Filter by search query
  const filteredRequests = requests.filter((request) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      request.name?.toLowerCase().includes(query) ||
      request.primary_author_id?.toLowerCase().includes(query) ||
      request.research_title?.toLowerCase().includes(query) ||
      request.id?.toString().includes(query)
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

   const handleViewDetails = (id) => {
  navigate("/admin/view-research", { state: { id } });
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#13231a] border border-[#1e3a2c] rounded-xl">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00ff88]"></div>
          <p className="text-white">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#13231a] border border-red-900/30 rounded-xl">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  
  return (
    <PendingResearchRequestsTable
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

export default PendingRequests;