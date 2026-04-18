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

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("data:")) return path;
    if (path.startsWith("/")) return `${API_CONFIG.BASE_URL}${path}`;
    return `${API_CONFIG.BASE_URL}/${path}`;
  };

  useEffect(() => {
    fetchProfileData();
  }, [location.state]);

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
        setProfileImage(getFullImageUrl(result.data.profile_image));
      }
      if (result.data.registration_id) {
    localStorage.setItem("registration_id", result.data.registration_id);
  }

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-[#0df287] text-lg">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-red-500 text-xl">⚠️ {error}</div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-[#0df287] text-black font-bold rounded-lg hover:bg-[#0df287]/90 transition-colors"
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
      <div className="mx-auto px-4 py-10 pb-12 flex-1 max-w-7xl">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#0a0a0a]/50 p-8 rounded-2xl border border-[#1a1a1a]">
            <div className="relative">
              <div className="w-32 h-32 rounded-full ring-4 ring-[#0df287]/20 p-1 overflow-hidden">
                <img
                  className="w-full h-full object-cover rounded-full"
                  src={profileImage || avatar}
                  alt="profile"
                  onError={(e) => {
                    console.log("Image failed to load, using avatar");
                    e.target.src = avatar;
                  }}
                />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">
                {getProfileValue("name") || ""}
              </h1>
              <p className="text-[#0df287] font-medium">
                Individual Researcher •{" "}
                {getProfileValue("describes", "")}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Registration ID:{" "}
                {getProfileValue("registration_id") || ""}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate("/dashboard/individual-edit-profile")}
                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-700 text-slate-300 hover:bg-white/5 hover:border-slate-500 transition-all rounded-lg font-bold text-sm"
              >
                <MaterialIcon name="edit" className="text-lg" />
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          {/* PERSONAL INFORMATION */}
          <details
            className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl"
            open
          >
            <summary className="px-8 py-6 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MaterialIcon name="person" className="text-[#0df287]" />
                <h2 className="text-xl font-bold text-white">
                  Personal Information
                </h2>
              </div>
              <MaterialIcon name="expand_more" className="text-slate-400" />
            </summary>
            <div className="p-8 border-t border-[#1a1a1a] space-y-8">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Date of Birth
                </label>
                <p className="text-lg text-white font-medium">
                  {/* ✅ Formatted Date output */}
                  {formatDate(getProfileValue("date_of_birth"))}
                </p>
              </div>
              {/* Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Country
                  </label>
                  <p className="text-lg text-white font-medium uppercase">
                    {getProfileValue("country") || ""}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    State
                  </label>
                  <p className="text-lg text-white font-medium uppercase">
                    {getProfileValue("state") || ""}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    City
                  </label>
                  <p className="text-lg text-white font-medium capitalize">
                    {getProfileValue("city") || ""}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Pincode
                  </label>
                  <p className="text-lg text-white font-medium">
                    {getProfileValue("pincode") || ""}
                  </p>
                </div>
              </div>

              {/* Short Bio */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Short Bio
                </label>
                <p className="text-slate-300 capitalize-first">
                  {getProfileValue("short_bio")}
                </p>
              </div>
            </div>
          </details>

          {/* PROFESSIONAL INFORMATION */}
          <details className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <summary className="px-8 py-6 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MaterialIcon name="school" className="text-[#0df287]" />
                <h2 className="text-xl font-bold text-white">
                  Professional Information
                </h2>
              </div>
              <MaterialIcon name="expand_more" className="text-slate-400" />
            </summary>
            <div className="p-8 border-t border-[#1a1a1a] space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Sustainable Development Goals
                  </label>
                 
<div className="flex flex-wrap gap-2 mt-2">
  {Array.isArray(profileData?.developement_goals) &&
  profileData.developement_goals.length > 0 ? (
    profileData.developement_goals.map((goal, index) => (
      <span
        key={index}
        className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold"
      >
        {goal}
      </span>
    ))
  ) : (
    <p className="text-slate-400 text-sm">No SDG goals selected</p>
  )}
</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                   Collaborations Interests 
                  </label>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {parseArrayField("interest").length > 0 &&
                      parseArrayField("interest").map((interest, index) => (
                        <span
                          key={index}
                          className="bg-[#0df287]/10 text-[#0df287] border border-[#0df287]/20 px-3 py-1 rounded-full text-xs font-bold"
                        >
                          {interest}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Current Research  Level 
                  </label>
                  <p className="text-lg text-white font-medium">
                    {getProfileValue("current_research") || ""}
                  </p>
                </div>
              </div>

              {/* EXPERIENCE */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                 Work  Experience
                </label>
                <div className="space-y-4 mt-3">
                  {experiences.length > 0 ? (
                    experiences.map((exp, index) => (
                      <div
                        key={index}
                        className="p-4 bg-black/40 rounded-lg border border-[#1a1a1a]"
                      >
                        <h4 className="text-sm font-bold text-white">
                          {exp.role}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {exp.company} • {exp.duration}
                        </p>
                        <p className="text-sm text-slate-300 mt-2">
                          {exp.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400"></p>
                  )}
                </div>
              </div>
            </div>
          </details>

          {/* CONTACT */}
          <details className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <summary className="px-8 py-6 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MaterialIcon
                  name="contact_support"
                  className="text-[#0df287]"
                />
                <h2 className="text-xl font-bold text-white">
                  Contact & Social
                </h2>
              </div>
              <MaterialIcon name="expand_more" className="text-slate-400" />
            </summary>
            <div className="p-8 border-t border-[#1a1a1a] space-y-4 max-w-2xl">
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
                  isLink
                />
              )}
              {getProfileValue("orc_id") && (
                <ContactItem
                  label="ORCID ID"
                  value={getProfileValue("orc_id")}
                  icon="fingerprint"
                  isLink
                />
              )}
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
  <div className="flex flex-col gap-2 w-full">
    {/* Label ab box ke bahar hai */}
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>

    {/* Input-style Container */}
    <div className="flex items-center gap-3 p-4 bg-[#050505] border border-[#1a1a1a] rounded-xl hover:border-slate-700 transition-all group">
      {/* Icon with specific color */}
      <div className="flex items-center justify-center text-slate-500 group-hover:text-[#0df287] transition-colors">
        <MaterialIcon name={icon} className="text-xl" />
      </div>

      {/* Value/Link */}
      <div className="flex-1 truncate">
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white hover:text-[#0df287] transition-colors font-medium"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-white font-medium">{value}</p>
        )}
      </div>
    </div>
  </div>
);

export default IndividualResearcherProfile;