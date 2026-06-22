import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import avatar from "../assets/images/avatar.jpg";
import DashboardLayout from "./DashboardLayout";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const IndividualResearcherProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [connectedUsersList, setConnectedUsersList] = useState([]); // List save karne ke liye
  const [showConnectionsModal, setShowConnectionsModal] = useState(false); // Modal on/off karne ke liye

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("data:")) return path;
    if (path.startsWith("/")) return `${API_CONFIG.BASE_URL}${path}`;
    return `${API_CONFIG.BASE_URL}/${path}`;
  };

  useEffect(() => {
    Promise.all([fetchProfileData(), fetchConnectedUsers()]);
  }, [location.state]);

  const fetchConnectedUsers = async () => {
    try {
      const token = localStorage.getItem("token");
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
    // ✅ Koi setLoading nahi — profile data aate hi page show ho jayega
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
          prev.filter(
            (u) => String(u.user_id || u.id) !== String(connectedUserId),
          ),
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

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view profile");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/get-profile-individual`,
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
        setProfileData(result.data);
        setError(null);
        // ✅ Image URL pehle set karo — image load hona shuru ho jaye
        setProfileImage(getFullImageUrl(result.data.profile_image));
        if (result.data.registration_id) {
          localStorage.setItem("registration_id", result.data.registration_id);
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false); // ✅ Sirf profileData loading control karo
    }
  };

  const getProfileValue = (key, defaultValue = "") => {
    return profileData?.[key] || defaultValue;
  };

  const parseArrayField = (field) => {
    if (!profileData?.[field]) return [];
    if (Array.isArray(profileData[field])) return profileData[field];
    try {
      return JSON.parse(profileData[field]);
    } catch {
      return [];
    }
  };

  const getExperienceData = () => {
    const jobRoles = parseArrayField("job_role");
    const companies = parseArrayField("company");
    const durations = parseArrayField("duration");
    const descriptions = parseArrayField("description");

    const experiences = [];
    const maxLength = Math.max(
      jobRoles.length,
      companies.length,
      durations.length,
      descriptions.length,
    );

    for (let i = 0; i < maxLength; i++) {
      if (jobRoles[i] || companies[i] || durations[i] || descriptions[i]) {
        experiences.push({
          role: jobRoles[i] || "Not specified",
          company: companies[i] || "Not specified",
          duration: durations[i] || "Not specified",
          description: descriptions[i] || "No description provided",
        });
      }
    }

    return experiences;
  };

  // ✅ Helper to format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-[#0df287]/20 border-t-[#0df287] animate-spin" />
          <div className="text-[#0df287] text-base font-medium tracking-wide">
            Loading profile...
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
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-[#0df287] text-black font-bold rounded-xl shadow-lg shadow-[#0df287]/25 hover:bg-[#0df287]/90 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Go to Login
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const experiences = getExperienceData();

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
                      className="w-full h-full object-cover rounded-full"
                      src={profileImage || avatar}
                      alt="profile"
                      onError={(e) => {
                        e.target.src = avatar;
                      }}
                    />
                  </div>
                  <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#0df287] border-4 border-white dark:border-[#0d0d0d]" />
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0 text-center lg:text-left">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {getProfileValue("name") || ""}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287] border border-[#0df287]/30 px-3 py-1 text-xs font-semibold">
                      <MaterialIcon name="verified" className="text-sm" />
                      Individual Researcher
                    </span>
                    {getProfileValue("describes") && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-3 py-1 text-xs font-medium">
                        {getProfileValue("describes")}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-center lg:justify-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <MaterialIcon name="badge" className="text-base" />
                    <span>
                      Registration ID:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {getProfileValue("registration_id") || "—"}
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
  <span className="text-base font-black">{connectionCount}</span>
  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    Connections
  </span>
</span>
                  </button>

                  <button
                    onClick={() =>
                      navigate("/dashboard/individual-edit-profile")
                    }
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
          {/* PERSONAL INFORMATION */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-[#0d0d0d] dark:border-[#1a1a1a] dark:shadow-2xl overflow-hidden">
            <SectionSummary
              icon="person"
              title="Personal Information"
              subtitle="Basic details and location"
            />

            <div className="px-6 sm:px-8 pb-8 pt-6 border-t border-slate-100 dark:border-[#1a1a1a]">
              {/* Detail tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoTile
                  icon="cake"
                  label="Date of Birth"
                  value={formatDate(getProfileValue("date_of_birth"))}
                />
                <InfoTile
                  icon="public"
                  label="Country"
                  value={getProfileValue("country")}
                  valueClass="uppercase"
                />
                <InfoTile
                  icon="map"
                  label="State"
                  value={getProfileValue("state")}
                  valueClass="uppercase"
                />
                <InfoTile
                  icon="location_city"
                  label="City"
                  value={getProfileValue("city")}
                  valueClass="uppercase"
                />
                <InfoTile
                  icon="pin_drop"
                  label="Pincode"
                  value={getProfileValue("pincode")}
                />
              </div>

              {/* Short Bio */}
              <div className="mt-5 relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5 dark:border-[#1a1a1a] dark:bg-white/[0.02]">
                <span className="absolute left-0 top-0 h-full w-1 bg-[#0df287]/50" />
                <div className="flex items-center gap-2 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287]">
  <MaterialIcon name="description" className="text-lg" />
</span>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Short Bio
                  </label>
                </div>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300 capitalize-first">
                  {getProfileValue("short_bio") || (
                    <span className="text-slate-400 dark:text-slate-500 normal-case italic">
                      No bio added yet.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* PROFESSIONAL INFORMATION */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-[#0d0d0d] dark:border-[#1a1a1a] dark:shadow-2xl overflow-hidden">
            <SectionSummary
              icon="school"
              title="Professional Information"
              subtitle="Research focus, interests and experience"
            />

            <div className="px-6 sm:px-8 pb-8 pt-6 border-t border-slate-100 dark:border-[#1a1a1a] space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* SDG Goals */}
                <Panel icon="eco" title="Sustainable Development Goals">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(profileData?.developement_goals) &&
                    profileData.developement_goals.length > 0 ? (
                      profileData.developement_goals.map((goal, index) => (
                        <span
                          key={index}
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold"
                        >
                          {goal}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        No SDG goals selected
                      </p>
                    )}
                  </div>
                </Panel>

                {/* Interests */}
                <Panel icon="handshake" title="Collaboration Interests">
                  <div className="flex flex-wrap gap-2">
                    {parseArrayField("interest").length > 0 ? (
                      parseArrayField("interest").map((interest, index) => (
                        <span
                          key={index}
                          className="bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287] border border-[#0df287]/20 px-3 py-1.5 rounded-full text-xs font-semibold"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        No interests added
                      </p>
                    )}
                  </div>
                </Panel>
              </div>

              {/* Current Research Level — highlighted */}
<div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 dark:border-[#1a1a1a] dark:bg-white/[0.02]">                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0df287]/15 text-[#0aa866] dark:text-[#0df287]">
                  <MaterialIcon name="trending_up" />
                </span>
                <div className="min-w-0">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Current Research Level
                  </label>
                  <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                    {getProfileValue("current_research") || (
                      <span className="text-slate-400 dark:text-slate-500 font-medium">
                        Not specified
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* EXPERIENCE — timeline */}
              <div>
                <div className="flex items-center gap-3 mb-4">

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287]">
    <MaterialIcon name="work" className="text-lg" />
  </span>
                 <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
    Work Experience
  </h3>
                </div>

                {experiences.length > 0 ? (
                  <div className="space-y-0">
                    {experiences.map((exp, index) => (
                      <div
                        key={index}
                        className="relative flex gap-4 pb-4 last:pb-0"
                      >
                        {/* Timeline rail */}
                        <div className="flex flex-col items-center pt-1.5">
                          <span className="h-3 w-3 shrink-0 rounded-full bg-[#0df287] ring-4 ring-[#0df287]/15" />
                          {index < experiences.length - 1 && (
                            <span className="mt-1 w-px flex-1 bg-slate-200 dark:bg-[#1f1f1f]" />
                          )}
                        </div>

                        {/* Card */}
                        <div className="flex-1 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5 dark:bg-white/[0.02]">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {exp.role}
                            </h4>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-[#1f1f1f] px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              <MaterialIcon
                                name="schedule"
                                className="text-sm"
                              />
                              {exp.duration}
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#0aa866] dark:text-[#0df287]">
                            <MaterialIcon
                              name="business"
                              className="text-base"
                            />
                            {exp.company}
                          </p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-[#1f1f1f] px-5 py-6 text-slate-400 dark:text-slate-500">
                    <MaterialIcon name="work_history" />
                    <p className="text-sm">No work experience added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-[#0d0d0d] dark:border-[#1a1a1a] dark:shadow-2xl overflow-hidden">
            <SectionSummary
              icon="contact_support"
              title="Contact & Social"
              subtitle="Ways to reach and connect"
            />

            <div className="px-6 sm:px-8 pb-8 pt-6 border-t border-slate-100 dark:border-[#1a1a1a] grid grid-cols-1 md:grid-cols-2 gap-4">
              <ContactItem
                label="Email Address"
                value={getProfileValue("email")}
                icon="mail"
              />
              {getProfileValue("personal_website") && (
                <ContactItem
                  label="Website"
                  value={getProfileValue("personal_website")}
                  icon="language"
                  isLink
                />
              )}
              {getProfileValue("linkedin") && (
                <ContactItem
                  label="LinkedIn"
                  value={getProfileValue("linkedin")}
                  icon="share"
                  isLink
                />
              )}
              {getProfileValue("research_gate") && (
                <ContactItem
                  label="Research Gate"
                  value={getProfileValue("research_gate")}
                  icon="science"
                />
              )}
              {getProfileValue("orc_id") && (
                <ContactItem
                  label="ORCID ID"
                  value={getProfileValue("orc_id")}
                  icon="fingerprint"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Connections Modal */}
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
    </DashboardLayout>
  );
};

/* Accordion header with icon, title + subtitle and circular chevron */
const SectionSummary = ({ icon, title, subtitle }) => (
  <div className="px-6 sm:px-8 py-5 flex items-center gap-4 border-b border-slate-100 dark:border-[#1a1a1a] bg-slate-50/80 dark:bg-white/[0.02]">
    <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#0df287]/10 text-[#0aa866] dark:text-[#0df287]">
      <MaterialIcon name={icon} />
    </span>
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
        {title}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {subtitle}
      </p>
    </div>
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
          {value}
        </p>
      </div>
      {isLink && (
        <MaterialIcon
          name="north_east"
          className="text-slate-300 group-hover/card:text-[#0df287] transition-colors shrink-0"
        />
      )}
    </>
  );

  const classes =
    "group/card flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-slate-900 dark:bg-white/[0.02] dark:border-[#1a1a1a] dark:text-white hover:border-[#0df287]/40 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-sm transition-all";

  return isLink ? (
    <a
      href={value}
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

export default IndividualResearcherProfile;