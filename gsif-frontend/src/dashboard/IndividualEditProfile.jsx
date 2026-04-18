import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import avatar from "../assets/images/avatar.jpg";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// ✅ SDG GOALS LIST WITH COLORS

const IndividualEditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [SDG_GOALS, setSdgGoalsList] = useState([]);
  const pendingSdgIdsRef = useRef(null);
  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    describes: "",
    registration_id: "",
    email: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    date_of_birth: "",
    location: "",
    language: "",
    short_bio: "",
    current_research: "",
    linkedin: "",
    research_gate: "",
    orc_id: "",
    personal_website: "",
    profile_image: "",
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  // ✅ Date input ref — sirf icon click par calendar khule
  const dateInputRef = useRef(null);

  // ✅ SDG STATES
  const [sdgGoals, setSdgGoals] = useState([]);
  const [showSdgDropdown, setShowSdgDropdown] = useState(false);

  // ✅ Function to get full image URL
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("data:")) return path;
    if (path.startsWith("/")) return `${API_CONFIG.BASE_URL}${path}`;
    return `${API_CONFIG.BASE_URL}/${path}`;
  };

  // Helper to get Token
  const getAuthToken = () => {
    return (
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token")
    );
  };

 useEffect(() => {
  const init = async () => {
    // Dono parallel chalao, dono ka result ek saath lo
    const [profileResult, sdgResult] = await Promise.all([
      fetch(`${API_CONFIG.BASE_URL}/profile/get-profile-individual`, {
        headers: { Authorization: `Bearer ${getAuthToken()}`, "Content-Type": "application/json" }
      }).then(r => r.json()),

      fetch(`${API_CONFIG.BASE_URL}/research/get-sdg-goals`, {
        headers: { Authorization: `Bearer ${getAuthToken()}`, "Content-Type": "application/json" }
      }).then(r => r.json())
    ]);

    // SDG goals set karo
    let goals = [];
    if (sdgResult.status && Array.isArray(sdgResult.data)) {
      goals = sdgResult.data.map(item => ({
        id: parseInt(item.id),
        label: item.goals,
      }));
      setSdgGoalsList(goals);
    }

    // Profile set karo
    if (profileResult.status && profileResult.data) {
      const data = profileResult.data;
      setProfileData({
        name: data.name || "",
        describes: data.describes || "",
        registration_id: data.registration_id || "",
        email: data.email || "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        pincode: data.pincode || "",
        date_of_birth: data.date_of_birth || "",
        location: data.location || "",
        language: data.language || "",
        short_bio: data.short_bio || "",
        current_research: data.current_research || "",
        linkedin: data.linkedin || "",
        research_gate: data.research_gate || "",
        orc_id: data.orc_id || "",
        personal_website: data.personal_website || "",
        profile_image: data.profile_image || "",
      });

      setProfileImage(getFullImageUrl(data.profile_image));
      setTags(Array.isArray(data.interest) ? data.interest : []);

      // SDG match — dono data available hain ab ek saath
      const sdgNames = Array.isArray(data.developement_goals) ? data.developement_goals : [];
      const matchedIds = goals.filter(g => sdgNames.includes(g.label)).map(g => g.id);
      setSdgGoals(matchedIds);

      // Experiences
      const jobRoles = Array.isArray(data.job_role) ? data.job_role : [];
      const companies = Array.isArray(data.company) ? data.company : [];
      const durations = Array.isArray(data.duration) ? data.duration : [];
      const descriptions = Array.isArray(data.description) ? data.description : [];
      const maxLength = Math.max(jobRoles.length, companies.length, durations.length, descriptions.length);
      const expArray = Array.from({ length: maxLength }, (_, i) => ({
        role: jobRoles[i] || "",
        company: companies[i] || "",
        duration: durations[i] || "",
        description: descriptions[i] || "",
      }));
      setExperiences(expArray.length > 0 ? expArray : [{ role: "", company: "", duration: "", description: "" }]);
    }

    setLoading(false);
  };

  const savedImage = localStorage.getItem("profile_image");
  if (savedImage) setProfileImage(getFullImageUrl(savedImage));

  init().catch(() => {
    setError("Network error. Please try again.");
    setLoading(false);
  });
}, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

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
        const data = result.data;

        setProfileData({
          name: data.name || "",
          describes: data.describes || "",
          registration_id: data.registration_id || "",
          email: data.email || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          pincode: data.pincode || "",
          date_of_birth: data.date_of_birth || "",
          location: data.location || "",
          language: data.language || "",
          short_bio: data.short_bio || "",
          current_research: data.current_research || "",
          linkedin: data.linkedin || "",
          research_gate: data.research_gate || "",
          orc_id: data.orc_id || "",
          personal_website: data.personal_website || "",
          profile_image: data.profile_image || "",
        });

        setProfileImage(getFullImageUrl(data.profile_image));
        setTags(Array.isArray(data.interest) ? data.interest : []);

        // ✅ SDG load from API — multiple formats handle karo
        let sdgIds = [];
        // ❌ Pehle wala — parseInt se numbers try karta tha
        // ✅ Names ko ref mein store karo (IDs nahi, names hain)
        const rawSdg = data.developement_goals || [];
        const sdgNames = Array.isArray(rawSdg) ? rawSdg : [];
        pendingSdgIdsRef.current = sdgNames;

        // Agar SDG_GOALS pehle se loaded hain (rare case)
        if (SDG_GOALS.length > 0) {
          const matchedIds = SDG_GOALS.filter((g) =>
            sdgNames.includes(g.label),
          ).map((g) => g.id);
          setSdgGoals(matchedIds);
          pendingSdgIdsRef.current = null;
        }

        const jobRoles = Array.isArray(data.job_role) ? data.job_role : [];
        const companies = Array.isArray(data.company) ? data.company : [];
        const durations = Array.isArray(data.duration) ? data.duration : [];
        const descriptions = Array.isArray(data.description)
          ? data.description
          : [];

        const expArray = [];
        const maxLength = Math.max(
          jobRoles.length,
          companies.length,
          durations.length,
          descriptions.length,
        );

        for (let i = 0; i < maxLength; i++) {
          expArray.push({
            role: jobRoles[i] || "",
            company: companies[i] || "",
            duration: durations[i] || "",
            description: descriptions[i] || "",
          });
        }

        setExperiences(
          expArray.length > 0
            ? expArray
            : [{ role: "", company: "", duration: "", description: "" }],
        );
        setError(null);
      } else {
        setError(result.message || "Failed to fetch profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const fetchSdgGoals = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/research/get-sdg-goals`,
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
      if (result.status && Array.isArray(result.data)) {
        const goals = result.data.map((item) => ({
          id: parseInt(item.id),
          label: item.goals,
        }));
        setSdgGoalsList(goals);

        // ✅ Goals load hone ke baad — profile ke names ko IDs mein convert karo
        if (pendingSdgIdsRef.current !== null) {
          const pendingNames = pendingSdgIdsRef.current;
          const matchedIds = goals
            .filter((g) => pendingNames.includes(g.label))
            .map((g) => g.id);
          setSdgGoals(matchedIds);
          pendingSdgIdsRef.current = null;
        }
      } else {
        console.error("SDG error:", result.message);
      }
    } catch (err) {
      console.error("SDG fetch error:", err);
    }
  };
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setSuccessMessage("");
      setError(null);

      const token = getAuthToken();

      if (!token) {
        setError("Please login to save profile");
        setSaving(false);
        return;
      }

      const jobRoles = experiences
        .map((exp) => exp.role)
        .filter((r) => r.trim() !== "");
      const companies = experiences
        .map((exp) => exp.company)
        .filter((c) => c.trim() !== "");
      const durations = experiences
        .map((exp) => exp.duration)
        .filter((d) => d.trim() !== "");
      const descriptions = experiences
        .map((exp) => exp.description)
        .filter((d) => d.trim() !== "");

      const payload = {
        name: profileData.name,
        country: profileData.country,
        state: profileData.state,
        city: profileData.city,
        pincode: profileData.pincode,
        email: profileData.email,
        describes: profileData.describes,
        current_research: profileData.current_research,
        short_bio: profileData.short_bio,
        date_of_birth: profileData.date_of_birth,
        language: profileData.language,
        location: profileData.location,
        linkedin: profileData.linkedin,
        research_gate: profileData.research_gate,
        orc_id: profileData.orc_id,
        personal_website: profileData.personal_website,
        job_role: jobRoles,
        company: companies,
        duration: durations,
        description: descriptions,
        interest: tags,
        profile_image: profileData.profile_image,
        // ✅ SDG - backend strings expect karta hai
        developement_goals: sdgGoals.map((id) => {
          const goal = SDG_GOALS.find((g) => g.id === id);
          return goal ? goal.label : String(id);
        }),
      };

      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key],
      );

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/profile-individual`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (result.status) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          navigate("/dashboard/individual-profile");
        }, 1500);
      } else {
        setError(result.message || "Failed to save profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ INSTANT UPLOAD API
  const uploadProfileImage = async (file) => {
    try {
      setUploading(true);
      const token = getAuthToken();

      if (!token) {
        setError("Please login to upload image");
        return;
      }

      const formData = new FormData();
      formData.append("profile_image", file);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/individual-profile-image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const result = await response.json();

      if (result.status) {
        setSuccessMessage("Profile image updated instantly!");
        if (result.profile_image) {
          localStorage.setItem("profile_image", result.profile_image);
          setProfileImage(getFullImageUrl(result.profile_image));
          setProfileData((prev) => ({
            ...prev,
            profile_image: result.profile_image,
          }));
          window.dispatchEvent(new Event("profileImageUpdated"));
        }
      } else {
        setError(result.message || "Failed to upload image");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteProfileImage = async () => {
    try {
      setUploading(true);
      setError(null);

      const token = getAuthToken();

      if (!token) {
        setError("Please login to delete image");
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/individual-profile-image-delete`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();

      if (result.status) {
        setProfileImage(null);
        setProfileData((prev) => ({ ...prev, profile_image: "" }));
        localStorage.removeItem("profile_image");
        window.dispatchEvent(new Event("profileImageUpdated"));
        setSuccessMessage("Profile image deleted successfully!");
      } else {
        setError(result.message || "Failed to delete image");
      }
    } catch (err) {
      setError("Network error while deleting image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      await uploadProfileImage(file);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { role: "", company: "", duration: "", description: "" },
    ]);
  };

  const removeExperience = (index) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    } else {
      setExperiences([
        { role: "", company: "", duration: "", description: "" },
      ]);
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const inputClass =
    "w-full bg-black/40 border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:border-[#0df287] focus:ring-1 focus:ring-[#0df287] outline-none transition-all placeholder:text-slate-600";
  const labelClass =
    "text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-[#0df287] text-lg">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto px-4 py-4 pb-24 max-w-7xl">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-white">Edit Profile</h2>
          <p className="text-slate-400 mt-1">
            Update your personal and professional information.
          </p>
        </header>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* AVATAR SECTION */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#0a0a0a]/50 p-8 rounded-2xl border border-[#1a1a1a]">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0df287]/30 flex items-center justify-center bg-black">
                  <img
                    src={
                      profileImage
                        ? profileImage
                        : profileData?.profile_image &&
                            profileData.profile_image !== "null" &&
                            profileData.profile_image !== ""
                          ? `${API_CONFIG.BASE_URL}/${profileData.profile_image}`
                          : avatar
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = avatar;
                    }}
                  />
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <MaterialIcon
                      name="photo_camera"
                      className="text-white text-2xl"
                    />
                    <span className="text-[10px] text-white font-bold uppercase mt-1">
                      {uploading ? "Uploading..." : "Upload"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploading || saving}
                    />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-8 h-8 border-2 border-[#0df287] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              {profileImage && (
                <button
                  onClick={deleteProfileImage}
                  type="button"
                  disabled={uploading || saving}
                  className="text-xs text-red-500 font-bold hover:text-red-400 transition-colors uppercase tracking-wider flex items-center gap-1"
                >
                  <MaterialIcon name="delete" className="text-sm" /> Remove
                  Photo
                </button>
              )}
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Display Name</label>
                  <input
                    className={inputClass}
                    placeholder="Enter full name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={labelClass}>Professional Title</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Lead Scientist"
                    type="text"
                    value={profileData.describes}
                    onChange={(e) =>
                      handleInputChange("describes", e.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          {/* PERSONAL INFORMATION CARD */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-[#1a1a1a] flex items-center gap-3">
              <MaterialIcon name="person" className="text-[#0df287]" />
              <h2 className="text-xl font-bold text-white">
                Personal Information
              </h2>
            </div>
            <div className="p-8">
              <div className="mb-8 max-w-[220px]">
                <label className={labelClass}>Date of Birth</label>
                <div className="relative">
                  {/* Display box — non-interactive, sirf dikhata hai */}
                  <div
                    className="w-full bg-black/40 border border-[#1a1a1a] rounded-lg px-4 py-3 text-white outline-none transition-all flex items-center justify-between cursor-default select-none"
                    style={{ minHeight: "48px" }}
                  >
                    <span
                      className={
                        profileData.date_of_birth
                          ? "text-white"
                          : "text-slate-600"
                      }
                    >
                      {profileData.date_of_birth || "dd-mm-yyyy"}
                    </span>
                    {/* Green calendar icon — sirf isi pe click se calendar khulega */}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        if (dateInputRef.current) {
                          try {
                            dateInputRef.current.showPicker();
                          } catch {
                            dateInputRef.current.click();
                          }
                        }
                      }}
                      className="text-[#0df287] hover:text-[#0df287]/70 transition-colors ml-2 shrink-0"
                    >
                      <MaterialIcon name="calendar_month" className="text-xl" />
                    </button>
                  </div>
                  {/* Hidden date input — actual value yahi store karega */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) =>
                      handleInputChange("date_of_birth", e.target.value)
                    }
                    disabled={saving}
                    className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
                    tabIndex={-1}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    className={`${inputClass} uppercase`}
                    type="text"
                    placeholder="Country"
                    value={profileData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value.toUpperCase())
                    }
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input
                    className={`${inputClass} uppercase`}
                    type="text"
                    placeholder="State"
                    value={profileData.state}
                    onChange={(e) =>
                      handleInputChange("state", e.target.value.toUpperCase())
                    }
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    className={`${inputClass} capitalize`}
                    type="text"
                    placeholder="City"
                    value={profileData.city}
                    onChange={(e) => {
                      const capitalized = e.target.value.replace(/\b\w/g, (l) =>
                        l.toUpperCase(),
                      );
                      handleInputChange("city", capitalized);
                    }}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={labelClass}>Pincode</label>
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="Pincode"
                    value={profileData.pincode}
                    onChange={(e) =>
                      handleInputChange("pincode", e.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className={labelClass}>Short Bio</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows="3"
                  value={profileData.short_bio}
                  onChange={(e) => {
                    const value = e.target.value;
                    const capitalized =
                      value.charAt(0).toUpperCase() + value.slice(1);
                    handleInputChange("short_bio", capitalized);
                  }}
                  placeholder="Write a short bio about yourself..."
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* PROFESSIONAL INFORMATION CARD */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-[#1a1a1a] flex items-center gap-3">
              <MaterialIcon name="school" className="text-[#0df287]" />
              <h2 className="text-xl font-bold text-white">
                Professional Information
              </h2>
            </div>
            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ✅ SDG MULTI-SELECT DROPDOWN */}
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Sustainable Development Goals
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSdgDropdown(!showSdgDropdown)}
                      className="w-full flex items-center justify-between bg-black/40 border border-[#1a1a1a] rounded-lg px-4 py-3 text-white hover:border-[#0df287] transition-all text-sm"
                      disabled={saving}
                    >
                      <span
                        className={
                          sdgGoals.length > 0 ? "text-white" : "text-slate-600"
                        }
                      >
                        {SDG_GOALS.length === 0
                          ? "Loading SDG Goals..." // ✅ Yeh dikhega agar API slow hai
                          : sdgGoals.length > 0
                            ? `${sdgGoals.length} SDG Goal${sdgGoals.length > 1 ? "s" : ""} selected`
                            : "Select SDG Goals..."}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 text-base">
                        {showSdgDropdown ? "expand_less" : "expand_more"}
                      </span>
                    </button>

                    {/* Dropdown List */}
                    {showSdgDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                        {SDG_GOALS.map((goal) => {
                          const isSelected = sdgGoals.includes(goal.id);
                          return (
                            <button
                              key={goal.id}
                              type="button"
                              onClick={() =>
                                setSdgGoals((prev) =>
                                  isSelected
                                    ? prev.filter((g) => g !== goal.id)
                                    : [...prev, goal.id],
                                )
                              }
                              className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-white/5"
                            >
                              <span
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: goal.color }}
                              />
                              <span className="text-xs text-slate-300 flex-1">
                                <span className="font-bold text-slate-500 mr-1">
                                  SDG {goal.id}:
                                </span>
                                {goal.label}
                              </span>
                              <span
                                className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
                                style={{
                                  backgroundColor: isSelected
                                    ? goal.color
                                    : "transparent",
                                  borderColor: isSelected ? goal.color : "#333",
                                }}
                              >
                                {isSelected && (
                                  <span className="material-symbols-outlined text-white text-xs leading-none">
                                    check
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected SDG Tags */}
                  {sdgGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {sdgGoals.map((id) => {
                        const goal = SDG_GOALS.find((g) => g.id === id);
                        if (!goal) return null;
                        return (
                          <span
                            key={id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: goal.color + "22",
                              border: `1px solid ${goal.color}55`,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-sm"
                              style={{ backgroundColor: goal.color }}
                            />
                            <span style={{ color: goal.color }}>
                              SDG {goal.id}:
                            </span>
                            <span className="text-slate-300">{goal.label}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSdgGoals((prev) =>
                                  prev.filter((g) => g !== id),
                                )
                              }
                              className="material-symbols-outlined text-xs hover:text-red-400 transition-colors ml-0.5"
                              style={{ color: goal.color }}
                            >
                              close
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ✅ COLLABORATION INTERESTS TAGS */}
                <div>
                  <label className={labelClass}>
                    Collaboration Interests (Tags)
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-black/40 border border-[#1a1a1a] rounded-lg min-h-[48px]">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-[#0df287]/20 text-[#0df287] px-2 py-1 rounded flex items-center gap-1 text-xs font-bold"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="material-symbols-outlined text-xs hover:text-red-400"
                          disabled={saving}
                        >
                          close
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-transparent border-none p-0 text-xs text-white focus:ring-0 w-24 outline-none"
                      placeholder="+ Add tag"
                      type="text"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* CURRENT RESEARCH */}
                <div className="md:col-span-2">
                  <label className={labelClass}>Current Research</label>
                  <input
                    className={inputClass}
                    type="text"
                    value={profileData.current_research}
                    onChange={(e) =>
                      handleInputChange("current_research", e.target.value)
                    }
                    disabled={saving}
                    placeholder="Describe your current research work..."
                  />
                </div>
              </div>

              {/* WORK EXPERIENCE */}
              <div>
                <label className={labelClass}>Work Experience</label>
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div
                      key={index}
                      className="p-6 bg-black/20 rounded-2xl border border-[#1a1a1a] space-y-6 relative group"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">
                            Job Role
                          </label>
                          <input
                            className={inputClass}
                            type="text"
                            placeholder="e.g. Senior Researcher"
                            value={exp.role}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "role",
                                e.target.value,
                              )
                            }
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">
                            Company
                          </label>
                          <input
                            className={inputClass}
                            type="text"
                            placeholder="e.g. Tech Solutions"
                            value={exp.company}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "company",
                                e.target.value,
                              )
                            }
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">
                            Duration
                          </label>
                          <input
                            className={inputClass}
                            type="text"
                            placeholder="e.g. 2020 - Present"
                            value={exp.duration}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "duration",
                                e.target.value,
                              )
                            }
                            disabled={saving}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">
                          Description
                        </label>
                        <textarea
                          className={`${inputClass} resize-none h-24`}
                          placeholder="Describe your responsibilities..."
                          value={exp.description}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          disabled={saving}
                        />
                      </div>

                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="absolute top-2 right-2 text-slate-500 hover:text-red-500"
                        >
                          <MaterialIcon name="close" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addExperience}
                    className="flex items-center gap-2 text-[#0df287] text-xs font-bold hover:opacity-80 transition-opacity mt-2 ml-1"
                    disabled={saving}
                  >
                    <MaterialIcon name="add_circle" className="text-sm" />
                    Add Experience
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT & SOCIAL CARD */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-[#1a1a1a] flex items-center gap-3">
              <MaterialIcon name="contact_support" className="text-[#0df287]" />
              <h2 className="text-xl font-bold text-white">Contact & Social</h2>
            </div>
            <div className="p-8 space-y-4 max-w-2xl">
              <div className="space-y-2">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12`}
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={saving}
                  />
                  <MaterialIcon
                    name="mail"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>LinkedIn</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12`}
                    value={profileData.linkedin}
                    onChange={(e) =>
                      handleInputChange("linkedin", e.target.value)
                    }
                    disabled={saving}
                  />
                  <MaterialIcon
                    name="share_reviews"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Research Gate</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12`}
                    type="url"
                    value={profileData.research_gate}
                    onChange={(e) =>
                      handleInputChange("research_gate", e.target.value)
                    }
                    disabled={saving}
                  />
                  <MaterialIcon
                    name="science"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Personal Website</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12`}
                    type="url"
                    value={profileData.personal_website}
                    onChange={(e) =>
                      handleInputChange("personal_website", e.target.value)
                    }
                    disabled={saving}
                  />
                  <MaterialIcon
                    name="language"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>ORCID ID</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12 font-mono`}
                    type="text"
                    value={profileData.orc_id}
                    onChange={(e) =>
                      handleInputChange("orc_id", e.target.value)
                    }
                    disabled={saving}
                  />
                  <MaterialIcon
                    name="fingerprint"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0df287]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-8 pt-8 border-t border-[#1a1a1a] flex items-center justify-end gap-4">
            <button
              onClick={() => navigate("/dashboard/individual-profile")}
              className="px-8 py-3 text-slate-400 hover:text-white transition-colors font-bold text-sm"
              disabled={saving || uploading}
            >
              Discard Changes
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving || uploading}
              className={`px-10 py-3 bg-[#0df287] text-black hover:bg-[#0df287]/90 transition-all rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(13,242,135,0.3)] ${
                saving || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving || uploading ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default IndividualEditProfile;
