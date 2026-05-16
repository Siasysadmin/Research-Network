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
  const [connectionCount, setConnectionCount] = useState(0);
  const [connectedUsersList, setConnectedUsersList] = useState([]);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
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

  const fetchConnectedUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/connected-users-list`,
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
        setConnectionCount(result.data.length);
        setConnectedUsersList(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch connections", err);
    }
  };

  const disconnectUser = async (connectedUserId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/disconnect-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ connected_user_id: String(connectedUserId) }),
        },
      );

      const result = await response.json();

      if (result.status) {
        // 1. Profile modal ki list se remove karo aur count ghata do
        setConnectedUsersList((prev) =>
          prev.filter((u) => u.id !== connectedUserId),
        );
        setConnectionCount((prev) => prev - 1);

        // 2. ✅ Home Feed (MainContent) ke liye LocalStorage bhi update karo
        const savedFeedConnections = localStorage.getItem("feedConnectedUsers");
        if (savedFeedConnections) {
          const parsedConnections = JSON.parse(savedFeedConnections);
          parsedConnections[connectedUserId] = false; // Is user ko feed me disconnected mark kar do
          localStorage.setItem(
            "feedConnectedUsers",
            JSON.stringify(parsedConnections),
          );
        }
      }
    } catch (err) {
      console.error("Failed to disconnect user", err);
    }
  };

  useEffect(() => {
    fetchProfileData();
    loadImageFromStorage();
    fetchConnectedUsers();
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
          <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-[#0a0a0a]/50 p-8 rounded-2xl border border-slate-200 dark:border-[#1a1a1a]">
            <div className="relative">
              <div className="w-32 h-32 rounded-full ring-4 ring-[#0df287]/20 p-1 overflow-hidden bg-slate-100 dark:bg-black/40 flex items-center justify-center">
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
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
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Registration ID: {profileData.registration_id || "N/A"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              {" "}
              <button
                onClick={() => setShowConnectionsModal(true)}
                className="px-4 py-2 border border-[#0df287]/50 text-[#0df287] bg-[#0df287]/10 hover:bg-[#0df287]/20 transition-all rounded-full font-medium text-xs sm:text-sm"
              >
                View Connections
              </button>
              <button
                onClick={() => navigate("/dashboard/institute-edit-profile")}
                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-400 dark:hover:border-slate-500 transition-all rounded-lg font-bold text-sm"
              >
                <MaterialIcon name="edit" className="text-lg" />
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <details
            className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl"
            open
          >
            <summary className="px-8 py-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between border-b border-slate-200 dark:border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <MaterialIcon name="domain" className="text-[#0df287]" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
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
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Establishment Year
                  </label>
                  <p className="text-lg text-slate-900 dark:text-white font-medium">
                    {profileData.establishment_year || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Address
                  </label>
                  <p className="text-lg text-slate-900 dark:text-white font-medium capitalize">
                    {profileData.address || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Country
                  </label>
                  <p className="text-lg text-slate-900 dark:text-white font-medium uppercase">
                    {profileData.country || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    State
                  </label>
                  <p className="text-lg text-slate-900 dark:text-white font-medium uppercase">
                    {profileData.state || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    City
                  </label>
                  <p className="text-lg text-slate-900 dark:text-white font-medium capitalize">
                    {profileData.city || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Institute Description
                </label>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {profileData.institute_description ||
                    "No description provided"}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      No focus areas added
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      No platform goals added
                    </span>
                  )}
                </div>
              </div>
            </div>
          </details>

          <details className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
            <summary className="px-8 py-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between border-b border-slate-200 dark:border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <MaterialIcon
                  name="admin_panel_settings"
                  className="text-[#0df287]"
                />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
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
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Administrator Name
                </label>
                <p className="text-lg text-slate-900 dark:text-white font-medium capitalize">
                 
                  {profileData.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </label>
                <p className="text-lg text-slate-900 dark:text-white font-medium capitalize">
                  {profileData.professional_role || "N/A"}
                </p>
              </div>
            </div>
          </details>

          <details className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
            <summary className="px-8 py-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between border-b border-slate-200 dark:border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <MaterialIcon
                  name="contact_support"
                  className="text-[#0df287]"
                />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
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

              <div className="space-y-6 border-t border-slate-200 dark:border-[#1a1a1a]/50 flex flex-col gap-2">
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
 {showConnectionsModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
    
    <div className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-3xl
      bg-white dark:bg-[#050505]
      border border-slate-200 dark:border-[#1f1f1f]
      shadow-2xl flex flex-col">

      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#1f1f1f]">
        
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <MaterialIcon
            name="group"
            className="text-[#00b86b] dark:text-[#00ff88]"
          />

          Connections :

          <span className="text-[#00b86b] dark:text-[#00ff88]">
            {connectionCount}
          </span>
        </h3>

        <button
          onClick={() => setShowConnectionsModal(false)}
          className="w-9 h-9 rounded-full flex items-center justify-center
          text-slate-500 dark:text-slate-300
          hover:bg-slate-100 dark:hover:bg-[#111]
          hover:text-red-500 transition-all"
        >
          <MaterialIcon name="close" />
        </button>
      </div>

      <div className="overflow-y-auto p-4 space-y-3 flex-1">
        {connectedUsersList.length > 0 ? (
          connectedUsersList.map((connUser) => (
            <div
              key={connUser.id}
              className="group flex items-center gap-4 p-4 rounded-2xl
              bg-slate-50 dark:bg-[#0b0b0b]
              border border-slate-200 dark:border-[#202020]
              hover:bg-white dark:hover:bg-[#111]
              hover:border-[#00ff88]/40
              transition-all duration-300"
            >
              <img
                src={getFullImageUrl(connUser.profile_image) || avatar}
                alt={connUser.name}
                className="w-14 h-14 rounded-full object-cover
                border-2 border-slate-300 dark:border-[#2a2a2a]
                group-hover:border-[#00ff88]/60
                transition-all"
                onError={(e) => {
                  e.target.src = avatar;
                }}
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate">
                  {connUser.user_type === "institute"
                    ? connUser.institute_name || connUser.name
                    : connUser.name}
                </h4>

                <p className="text-sm text-[#00b86b] dark:text-[#00ff88] capitalize truncate">
                  {connUser.user_type} Researcher
                </p>
              </div>

              <button
                onClick={() => disconnectUser(connUser.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center
                text-slate-500 dark:text-slate-300
                hover:bg-red-500/10 hover:text-red-500
                transition-all"
              >
                <MaterialIcon
                  name="person_remove"
                  className="text-[22px]"
                />
              </button>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-slate-500 dark:text-slate-400">
            No connections found.
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </DashboardLayout>
  );
};

const ContactItem = ({ label, value, icon, isLink }) => (
  <div className="flex flex-col gap-2 w-full max-w-2xl">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>

    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-[#1a1a1a] rounded-xl group">
      <div className="text-slate-500 group-hover:text-[#0df287] transition-colors">
        <MaterialIcon name={icon} className="text-xl" />
      </div>

      <div className="flex-1 truncate">
        {isLink && value && value !== "Not provided" ? (
          <a
            href={value?.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
className="text-sm text-slate-900 dark:text-white hover:text-[#0df287] transition-colors font-medium"          >
            {value || "Not provided"}
          </a>
        ) : (
          <p className="text-sm text-slate-900 dark:text-white font-medium">
            {value || "Not provided"}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default InstituteProfile;
