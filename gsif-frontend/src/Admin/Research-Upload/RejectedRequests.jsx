import React, { useEffect, useState } from "react";
import RejectedRequestsTable from "./RejectedRequestsTable";
import API_CONFIG from "../../config/api.config";
import { useNavigate } from "react-router-dom";

const RejectedRequests = ({ searchQuery }) => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  useEffect(() => {
    fetchRejectedResearch();
  }, []);

  const fetchRejectedResearch = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/get-rejected-research`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.status) {
        setRequests(result.data || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Rejected fetch error:", error);
    }
  };

  // SEARCH FILTER
  const filteredRequests = (requests || []).filter((request) => {
    return (
      searchQuery === "" ||
      Object.values(request).some(
        (val) =>
          val &&
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  // PAGINATION
  const totalPages = Math.ceil(
    filteredRequests.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const currentRequests = filteredRequests.slice(
    startIndex,
    endIndex
  );

  const handleViewDetails = (id) => {
    navigate("/admin/view-research", { state: { id } });
  };

  return (
    <RejectedRequestsTable
  currentRequests={currentRequests}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  onViewDetails={handleViewDetails}
/>
  );
};

export default RejectedRequests;