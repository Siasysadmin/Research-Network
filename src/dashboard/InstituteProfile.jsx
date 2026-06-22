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
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-[#0df287]/20 border-t-[#0df287] animate-spin" />
          <div className="text-[#0df287] text-base font-medium tracking-wide">
            Loading Profile...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <MaterialIcon name="error" className="text-red-500 text-3xl" />
          </div>
          <div className="text-red-500 text-xl font-semibold">{error}</div>
          <button
            onClick={fetchProfileData}
            className="px-6 py-3 bg-[#0df287] text-black font-bold rounded-xl shadow-lg shadow-[#0df287]/25 hover:bg-[#0df287]/90 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        className="mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-16 flex-1 max-w-6xl
bg-white text-slate-800
dark:bg-[#0a0a0a] dark:text-white"
      >
        {/* ===================== PROFILE HEADER ===================== */}
        <section className="mb-8">
          <div
            className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm
dark:bg-[#0d0d0d] dark:border-[#1a1a1a] dark:shadow-2xl"
          >
            {/* Banner accent */}
            <div className="h-28 sm:h-32 w-full bg-gradient-to-r from-[#0df287]/20 via-emerald-400/10 to-transparent dark:from-[#0df287]/15 dark:via-emerald-500/5 dark:to-transparent" />

            <div className="px-6 sm:px-8 pb-7">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                {/* Avatar (overlaps banner) */}
                <div className="relative -mt-16 sm:-mt-20 shrink-0 self-center lg:self-auto">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white dark:ring-[#0d0d0d] bg-white dark:bg-[#0d0d0d] shadow-xl overflow-hidden">
                    <img
                      src={profileImage || profileData?.profile_image || avatar}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = avatar;
                      }}
                      className="w-full h-full object-cover rounded-full"
                      alt="institute profile"
                    />
                  </div>
                  <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#0df287] border-4 border-white dark:border-[#0d0d0d]" />
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0 text-center lg:text-left">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white capitalize">
                    {profileData.organization_name || "Institute Name"}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287] border border-[#0df287]/30 px-3 py-1 text-xs font-semibold capitalize">
                      <MaterialIcon name="domain" className="text-sm" />
                      {profileData.organization_type || "Institute Type"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-center lg:justify-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <MaterialIcon name="badge" className="text-base" />
                    <span>
                      Registration ID:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {profileData.registration_id || "N/A"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Stat + Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  {/* Clickable connections stat (opens same modal) */}
                  <button
                    onClick={() => setShowConnectionsModal(true)}
                    className="group flex h-14 min-w-[180px] items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-left transition-all hover:border-[#0df287]/50 hover:bg-[#0df287]/5 dark:bg-white/5 dark:border-[#1f1f1f] dark:hover:bg-[#0df287]/10"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0df287]/15 text-[#0aa866] dark:text-[#0df287]">
                      <MaterialIcon name="group" />
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="text-base font-black">
                        {connectionCount}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Connections
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/dashboard/institute-edit-profile")}
                    className="flex h-14 min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-[#0df287] px-6 text-black font-extrabold text-sm shadow-lg shadow-[#0df287]/20 hover:bg-[#0df287]/90 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    <MaterialIcon name="edit" className="text-lg" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTIONS ===================== */}
        <div className="flex flex-col gap-5">
          {/* INSTITUTE DETAILS */}
          <Section
            icon="domain"
            title="Institute Details"
            subtitle="Organization overview and focus"
            defaultOpen
          >
            {/* Detail tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoTile
                icon="calendar_month"
                label="Establishment Year"
                value={profileData.establishment_year || "N/A"}
              />
              <InfoTile
                icon="public"
                label="Country"
                value={profileData.country || "N/A"}
                valueClass="uppercase"
              />
              <InfoTile
                icon="map"
                label="State"
                value={profileData.state || "N/A"}
                valueClass="uppercase"
              />
              <InfoTile
                icon="location_city"
                label="City"
                value={profileData.city || "N/A"}
                valueClass="capitalize"
              />
              <InfoTile
                icon="location_on"
                label="Address"
                value={profileData.address || "N/A"}
                valueClass="capitalize"
              />
            </div>

            {/* Institute Description */}
            <div className="mt-5 relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5 dark:border-[#1a1a1a] dark:bg-white/[0.02]">
              <span className="absolute left-0 top-0 h-full w-1 bg-[#0df287]/50" />
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287]">
                  <MaterialIcon name="description" className="text-lg" />
                </span>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Institute Description
                </label>
              </div>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                {profileData.institute_description || "No description provided"}
              </p>
            </div>

            {/* Focus Area + Platform Goals */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
<Panel icon="track_changes" title={<span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Focus Area</span>}>                <div className="flex flex-wrap gap-2">
                  {profileData.research_focus.length > 0 ? (
                    profileData.research_focus.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287] border border-[#0df287]/20 px-3 py-1.5 rounded-full text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      No focus areas added
                    </p>
                  )}
                </div>
              </Panel>

              <Panel
  icon="rocket_launch"
  title={<span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">What would you like to achieve in this platform</span>}
>
                <div className="flex flex-wrap gap-2">
                  {profileData.platform.length > 0 ? (
                    profileData.platform.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287] border border-[#0df287]/20 px-3 py-1.5 rounded-full text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      No platform goals added
                    </p>
                  )}
                </div>
              </Panel>
            </div>
          </Section>

          {/* ADMINISTRATOR INFORMATION */}
          <Section
            icon="admin_panel_settings"
            title="Administrator Information"
            subtitle="Primary point of contact"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoTile
                icon="account_circle"
                label="Administrator Name"
                value={profileData.name || "N/A"}
                valueClass="capitalize"
              />
              <InfoTile
                icon="work"
                label="Role"
                value={profileData.professional_role || "N/A"}
                valueClass="capitalize"
              />
            </div>
          </Section>

          {/* CONTACT */}
          <Section
            icon="contact_support"
            title="Contact & Social"
            subtitle="Ways to reach and connect"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              />
              <ContactItem
                label="ORCID ID"
                value={profileData.orc_id}
                icon="fingerprint"
              />
            </div>
          </Section>
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

        /* Native <details> marker hide (Safari/Chrome) */
        summary::-webkit-details-marker {
          display: none;
        }
      `}</style>

      {showConnectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div
            className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-3xl
      bg-white dark:bg-[#050505]
      border border-slate-200 dark:border-[#1f1f1f]
      shadow-2xl flex flex-col"
          >
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

/* ===================== Presentational helpers ===================== */

/* Collapsible section that visually matches the IndividualResearcherProfile
   section header (icon tile + title + subtitle bar). Native <details> keeps
   the institute page's existing expand/collapse behavior. */
const Section = ({ icon, title, subtitle, children }) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:bg-[#0d0d0d] dark:border-[#1a1a1a] dark:shadow-2xl overflow-hidden">
    <div className="px-6 sm:px-8 py-5 flex items-center gap-4 border-b border-slate-100 dark:border-[#1a1a1a] bg-slate-50/80 dark:bg-white/[0.02]">
      <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287]">
        <MaterialIcon name={icon} />
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>
    </div>

    <div className="px-6 sm:px-8 pb-8 pt-6">{children}</div>
  </div>
);
/* Compact icon + label + value detail tile */
const InfoTile = ({ icon, label, value, valueClass = "" }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 transition-all hover:border-[#0df287]/40 hover:bg-white hover:shadow-sm dark:border-[#1a1a1a] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287]">
        <MaterialIcon name={icon} className="text-lg" />
      </span>
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </label>
    </div>
    <p
      className={`mt-3 text-base font-semibold text-slate-900 dark:text-white break-words ${valueClass}`}
    >
      {value ? (
        value
      ) : (
        <span className="text-slate-400 dark:text-slate-500 normal-case font-medium">
          —
        </span>
      )}
    </p>
  </div>
);

/* Framed sub-panel with header used for grouped content */
const Panel = ({ icon, title, children }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5 dark:border-[#1a1a1a] dark:bg-white/[0.02]">
    <div className="flex items-center gap-2 mb-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287]">
        <MaterialIcon name={icon} className="text-lg" />
      </span>
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const ContactItem = ({ label, value, icon, isLink }) => {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0df287]/10 text-[#0aa866] group-hover/card:bg-[#0df287]/20 dark:text-[#0df287] transition-colors">
        <MaterialIcon name={icon} className="text-xl" />
      </span>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {label}
        </label>
        <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white truncate">
          {value || "Not provided"}
        </p>
      </div>
      {isLink && value && value !== "Not provided" && (
        <MaterialIcon
          name="north_east"
          className="text-slate-300 group-hover/card:text-[#0df287] transition-colors shrink-0"
        />
      )}
    </>
  );

  const classes =
    "group/card flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-slate-900 dark:bg-white/[0.02] dark:border-[#1a1a1a] dark:text-white hover:border-[#0df287]/40 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-sm transition-all";

  return isLink && value && value !== "Not provided" ? (
    <a
      href={value?.startsWith("http") ? value : `https://${value}`}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {inner}
    </a>
  ) : (
    <div className={classes}>{inner}</div>
  );
};

export default InstituteProfile;