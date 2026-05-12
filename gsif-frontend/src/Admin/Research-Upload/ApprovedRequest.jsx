import React, { useEffect, useState } from "react";
import ApprovedRequestsTable from "./ApprovedRequestsTable";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../../config/api.config";

const ApprovedRequests = ({ searchQuery, onViewDetails }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchApprovedResearch();
  }, []);

  const fetchApprovedResearch = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/get-approved-research`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.status) {
        // ✅ REVERSE HERE - NEWEST FIRST
        setRequests((result.data || []).reverse());
      }

    } catch (error) {
      console.error("Error fetching approved research:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading approved requests...
      </div>
    );
  }

  // Map display name
  const mappedRequests = requests.map((req) => ({
    ...req,
    displayName:
      req.user_type === "individual"
        ? req.name
        : req.institute_name || "N/A",
  }));

  const handleViewDetails = (id) => {
    navigate("/admin/view-research", { state: { id } });
  };

  // Search filter
  const filteredRequests = mappedRequests.filter((request) => {
    return (
      searchQuery === "" ||
      Object.values(request).some(
        (val) =>
          val &&
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  return (
    <ApprovedRequestsTable
      requests={filteredRequests}
      onViewDetails={handleViewDetails}
    />
  );
};

export default ApprovedRequests;