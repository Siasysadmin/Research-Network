import React, { useState, useEffect } from "react";
import InstituteAllTable from "./InstituteAllTable";
import API_CONFIG from "../../../config/api.config";
import { Layout, MaterialIcon } from "../../Layout/Layout";

const InstituteAllApplications = ({ searchQuery: externalSearchQuery }) => {
  const [applications, setApplications] = useState([]);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");

  // Search Query Select
  const searchQuery =
    externalSearchQuery !== undefined
      ? externalSearchQuery
      : internalSearchQuery;

  // =========================
  // API FETCH
  // =========================
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const token =
          localStorage.getItem("authToken") ||
          localStorage.getItem("token") ||
          "";

        const response = await fetch(
          `${API_CONFIG.BASE_URL}/user/get-institute-users`,
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

        if (result.status) {
          const formattedData = result.data.reverse().map((item) => ({
            id: item.registration_id,
            institute: item.institute_name,
            representative: item.name,
            email: item.email,
            role: item.professional_role,
            address: item.address,
            contact: item.contact_no,
            website: item.website,

            status: item.status === "1" ? "Pending" : "Approved",
          }));

          setApplications(formattedData);
        }
      } catch (error) {}
    };

    fetchInstitutes();
  }, []);

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    return (
      app.institute?.toLowerCase().includes(query) ||
      app.email?.toLowerCase().includes(query) ||
      app.representative?.toLowerCase().includes(query) ||
      app.id?.toLowerCase().includes(query) ||
      app.role?.toLowerCase().includes(query) ||
      app.address?.toLowerCase().includes(query) ||
      app.status?.toLowerCase().includes(query)
    );
  });

  return (
<div className="flex-1 p-8 h-full flex flex-col">      {/* ✅ NEW TABLE */}
      <InstituteAllTable applications={filteredApplications} />
    </div>
  );
};

export default InstituteAllApplications;
