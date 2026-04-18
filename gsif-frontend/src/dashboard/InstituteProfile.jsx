import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import avatar from "../assets/images/avatar.jpg";

import API_CONFIG from "../config/api.config";

// Reusable Material Icon component
const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const InstituteProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [profileData, setProfileData] = useState({
    organization_name: "",
    organization_type: "",
    registration_id: "",
    country: "",
    state: "",
    city: "",
    address: "",
    linkedin: "",
    research_gate: "",
    orc_id: "",
    personal_website: "",
    email: "",
    contact_no: "",
    name: "",
    professional_role: "",
    institute_description: "",
    establishment_year: "",
    research_focus: [],
    platform: [],
  });

  const getAuthToken = () => {
    return (
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token")
    );
  };

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("data:")) return path;
    if (path.startsWith("/")) return `${API_CONFIG.BASE_URL}${path}`;
    return `${API_CONFIG.BASE_URL}/${path}`;
  };

  const loadImageFromStorage = () => {
    const savedImage = localStorage.getItem("profile_image");
    if (savedImage) {
      setProfileImage(getFullImageUrl(savedImage));
    } else {
      setProfileImage(null);
    }
  };

  // Fetch profile data from API
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/get-profile-institute`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.status && result.data) {
        const data = result.data;
        console.log("🚀 API Response:", data);

        setProfileData({
          organization_name:
            data.organization_name || data.institute_name || "",
          organization_type: data.organization_type || "",
          registration_id: data.registration_id || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          address: data.address || data.street_address || data.location || "",
          linkedin: data.linkedin || "",
          research_gate: data.research_gate || "",
          orc_id: data.orc_id || "",
          personal_website: data.personal_website || data.website || "",
          email: data.email || "",
          contact_no: data.contact_no || "",
          name: data.name || data.admin_name || "",
          professional_role:
            data.professional_role || data.role || data.designation || "",
          institute_description:
            data.institute_description || data.description || "",
          establishment_year: data.establishment_year || "",
          research_focus: Array.isArray(data.research_focus)
            ? data.research_focus
            : [],
          platform: Array.isArray(data.platform) ? data.platform : [],
        });
        setError(null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    loadImageFromStorage();
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfileData();
    };

    const handleImageUpdate = () => {
      loadImageFromStorage();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("profileImageUpdated", handleImageUpdate);
    window.addEventListener("storage", handleImageUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("profileImageUpdated", handleImageUpdate);
      window.removeEventListener("storage", handleImageUpdate);
    };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-[#0df287] text-lg font-bold">
            Loading Profile...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-red-500 text-xl font-bold">⚠️ {error}</div>
          <button
            onClick={fetchProfileData}
            className="px-6 py-2 bg-[#0df287] text-black rounded-lg font-bold text-sm hover:bg-[#0df287]/90 transition-all"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto px-4 py-10 pb-12 flex-1 max-w-7xl">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#0a0a0a]/50 p-8 rounded-2xl border border-[#1a1a1a]">
            <div className="relative">
              <div className="w-32 h-32 rounded-full ring-4 ring-[#0df287]/20 p-1 overflow-hidden bg-black/40 flex items-center justify-center">
                <img
  src={profileImage || profileData?.profile_image || avatar}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = aatar;
  }}
  className="w-full h-full object-cover rounded-full"
  alt="institute profile"
/>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">
                <span>Institute Name </span>
                <span className="text-slate-600">:</span>
                <span>
                  {" "}
                  {profileData.organization_name || "Institute Name"}
                </span>
              </h1>
              <p className="text-[#0df287] font-medium flex items-center justify-center md:justify-start gap-2">
                <span>Institute Type</span>
                <span className="text-slate-600">:</span>
                <span>{profileData.organization_type || "Institute Type"}</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Registration ID: {profileData.registration_id || "N/A"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate("/dashboard/institute-edit-profile")}
                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-700 text-slate-300 hover:bg-white/5 hover:border-slate-500 transition-all rounded-lg font-bold text-sm"
              >
                <MaterialIcon name="edit" className="text-lg" />
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <details
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl"
            open
          >
            <summary className="px-8 py-6 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <MaterialIcon name="domain" className="text-[#0df287]" />
                <h2 className="text-xl font-bold text-white">
                  Institute Details
                </h2>
              </div>
              <MaterialIcon
                name="expand_more"
                className="text-slate-400 group-open:rotate-180 transition-transform"
              />
            </summary>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Establishment Year
                  </label>
                  <p className="text-lg text-white font-medium">
                    {profileData.establishment_year || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Address
                  </label>
                  <p className="text-lg text-white font-medium capitalize">
                    {profileData.address || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Country
                  </label>
                  <p className="text-lg text-white font-medium uppercase">
                    {profileData.country || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    State
                  </label>
                  <p className="text-lg text-white font-medium uppercase">
                    {profileData.state || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    City
                  </label>
                  <p className="text-lg text-white font-medium capitalize">
                    {profileData.city || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Institute Description
                </label>
                <p className="text-slate-300 leading-relaxed">
                  {profileData.institute_description ||
                    "No description provided"}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Focus Area
                </label>
                <div className="flex flex-wrap gap-2">
                  {profileData.research_focus.length > 0 ? (
                    profileData.research_focus.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#0df287]/10 text-[#0df287] border border-[#0df287]/20 px-3 py-1 rounded-full text-xs font-bold uppercase"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">
                      No focus areas added
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  What would you like to achieve in this platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {profileData.platform.length > 0 ? (
                    profileData.platform.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#0df287]/10 text-[#0df287] border border-[#0df287]/20 px-3 py-1 rounded-full text-xs font-bold uppercase"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">
                      No platform goals added
                    </span>
                  )}
                </div>
              </div>
            </div>
          </details>

          <details className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <summary className="px-8 py-6 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <MaterialIcon
                  name="admin_panel_settings"
                  className="text-[#0df287]"
                />
                <h2 className="text-xl font-bold text-white">
                  Administrator Information
                </h2>
              </div>
              <MaterialIcon
                name="expand_more"
                className="text-slate-400 group-open:rotate-180 transition-transform"
              />
            </summary>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Administrator Name
                </label>
                <p className="text-lg text-white font-medium capitalize">
                  {profileData.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Role
                </label>
                <p className="text-lg text-white font-medium capitalize">
                  {profileData.professional_role || "N/A"}
                </p>
              </div>
            </div>
          </details>

          <details className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <summary className="px-8 py-6 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <MaterialIcon
                  name="contact_support"
                  className="text-[#0df287]"
                />
                <h2 className="text-xl font-bold text-white">
                  Contact & Social
                </h2>
              </div>
              <MaterialIcon
                name="expand_more"
                className="text-slate-400 group-open:rotate-180 transition-transform"
              />
            </summary>
            <div className="p-8 space-y-8">
              <div className="flex flex-col gap-6 max-w-2xl">
                <ContactItem
                  label="Institute Email"
                  value={profileData.email}
                  icon="mail"
                />

                <ContactItem
                  label="Contact Number"
                  value={profileData.contact_no || "Not provided"}
                  icon="call"
                />
              </div>

              <div className="space-y-6 border-t border-[#1a1a1a]/50 flex flex-col gap-2">
                <div className="flex flex-col gap-6 max-w-2xl pt-4">
                  <ContactItem
                    label="Institute Website"
                    value={profileData.personal_website}
                    icon="language"
                    isLink
                  />
                  <ContactItem
                    label="LinkedIn Page"
                    value={profileData.linkedin}
                    icon="share"
                    isLink
                  />
                  <ContactItem
                    label="ResearchGate ID"
                    value={profileData.research_gate}
                    icon="groups"
                    isLink
                  />
                  <ContactItem
                    label="ORCID ID"
                    value={profileData.orc_id}
                    icon="fingerprint"
                    isLink
                  />
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
      <style jsx global>{`
  /* Chrome, Safari aur Opera ke liye */
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  /* Firefox ke liye */
  * {
    scrollbar-width: none;
  }

  /* IE aur Edge ke liye */
  * {
    -ms-overflow-style: none;
  }
`}</style>
    </DashboardLayout>
  );
};

const ContactItem = ({ label, value, icon, isLink }) => (
  <div className="flex flex-col gap-2 w-full max-w-2xl">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>

    <div className="flex items-center gap-3 p-4 bg-[#050505] border border-[#1a1a1a] rounded-xl group">
      <div className="text-slate-500 group-hover:text-[#0df287] transition-colors">
        <MaterialIcon name={icon} className="text-xl" />
      </div>

      <div className="flex-1 truncate">
        {isLink && value && value !== "Not provided" ? (
          <a
            href={value?.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white hover:text-[#0df287] transition-colors font-medium"
          >
            {value || "Not provided"}
          </a>
        ) : (
          <p className="text-sm text-white font-medium">
            {value || "Not provided"}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default InstituteProfile;
