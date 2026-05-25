import React, { useEffect, useState } from "react";
import RejectedRequestsTable from "./RejectedRequestsTable";
import API_CONFIG from "../../config/api.config";
import { useNavigate } from "react-router-dom";

const RejectedRequests = ({ searchQuery, onViewDetails }) => {
const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

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
      }

    } catch (error) {
      console.error("Rejected fetch error:", error);
    }
  };

  // search filter
  const filteredRequests = requests.filter((request) => {
    return (
      searchQuery === "" ||
      Object.values(request).some(
        (val) =>
          val &&
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

   const handleViewDetails = (id) => {
  navigate("/admin/view-research", { state: { id } });
};
  return (
    <RejectedRequestsTable
      requests={filteredRequests}
      onViewDetails={ handleViewDetails }
    />
  );
};

export default RejectedRequests;