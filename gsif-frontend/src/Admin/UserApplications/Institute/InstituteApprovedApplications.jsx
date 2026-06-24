import React, { useState, useEffect } from "react";
import InstituteApprovedTable from "./InstituteApprovedTable";
import API_CONFIG from "../../../config/api.config";
import { toast } from "react-toastify";

const InstituteApprovedApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovedInstitutes = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/get-approved-institute-users`,
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
        const formatted = result.data.map((item) => ({
          user_id: item.id,
          id: item.registration_id,
          displayId: item.registration_number,
          institute: item.institute_name,
          representative: item.name,
          email: item.email,
          role: item.professional_role,
          contact: item.contact_no,
          address: item.address,
          website: item.website || "N/A",
          status: "Approved",
        }));

        setApplications(formatted);
      }
    } catch (error) {
      toast.error("Failed to load approved institutes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedInstitutes();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-[#13231a] rounded-xl p-12 text-center">
          <div className="w-12 h-12 border-2 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400">Loading approved institutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full p-8">
      <div className="h-full flex flex-col">
       
        <div className="flex-1 min-h-0">
          <InstituteApprovedTable applications={applications} />
        </div>
      </div>
    </div>
  );
};

export default InstituteApprovedApplications;