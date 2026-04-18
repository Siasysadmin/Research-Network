import React, { useState, useEffect } from "react";
import InstitutePendingTable from "./InstitutePendingTable";
import API_CONFIG from "../../../config/api.config";
import { toast } from "react-toastify";

const InstitutePendingApplications = () => {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvingId, setApprovingId] = useState(null);

  // ======================
  // FETCH PENDING DATA
  // ======================
  const fetchPendingInstitutes = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/get-pending-institute-users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.status) {
        const formatted = result.data.reverse().map((item) => ({
          user_id: item.id, // ✅ API ke liye
          id: item.registration_id,
          displayId: item.registration_number,

          institute: item.institute_name,
          representative: item.name,
          email: item.email,
          role: item.professional_role,
          contact: item.contact_no,
          address: item.address,
          website: item.website || "N/A",
          status: "Pending",
        }));

        setApplications(formatted);
      }
    } catch (error) {
      toast.error("Failed to load institutes");
    }
  };

  useEffect(() => {
    fetchPendingInstitutes();
  }, []);

  // ======================
  // APPROVE INSTITUTE
  // ======================
  const handleApprove = async (userId, email) => {
    try {
      setApprovingId(userId);

      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/approve-admin/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email,
          }),
        },
      );

      const result = await response.json();
      if (result.status) {
        toast.success("Institute Approved ✅");

        // Pending se remove
        setApplications((prev) => prev.filter((app) => app.user_id !== userId));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Approve Failed");
    } finally {
      setApprovingId(null);
    }
  };

  // ======================
  // SEARCH FILTER
  // ======================
  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();

    return (
      app.institute?.toLowerCase().includes(query) ||
      app.email?.toLowerCase().includes(query) ||
      app.representative?.toLowerCase().includes(query) ||
      app.displayId?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 p-8 h-full flex flex-col">
      <InstitutePendingTable
        applications={filteredApplications}
        handleApprove={handleApprove}
        approvingId={approvingId}
      />
    </div>
  );
};

export default InstitutePendingApplications;
