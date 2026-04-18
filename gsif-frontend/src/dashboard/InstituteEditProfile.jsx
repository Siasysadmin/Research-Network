import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import avatar from "../assets/images/avatar.jpg";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const EditInstituteProfile = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Form States
  const [profileData, setProfileData] = useState({
    organization_name: "",
    organization_type: "",
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
    establishment_year: "",
    institute_description: "",
    profile_image: "",
  });

  const [researchFocus, setResearchFocus] = useState([]);
  const [focusInput, setFocusInput] = useState("");

  const [platforms, setPlatforms] = useState([]);
  const [platformInput, setPlatformInput] = useState("");

  const [profileImage, setProfileImage] = useState(null);

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

  // GET API - Fetch profile data
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
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          address: data.address || "",
          linkedin: data.linkedin || "",
          research_gate: data.research_gate || "",
          orc_id: data.orc_id || "",
          personal_website: data.personal_website || data.website || "",
          email: data.email || "",
          contact_no: data.contact_no || "",
          name: data.name || "",
          professional_role: data.professional_role || "",
          establishment_year: data.establishment_year || "",
          institute_description: data.institute_description || "",
          profile_image: data.profile_image || "",
        });

        setResearchFocus(
          Array.isArray(data.research_focus) ? data.research_focus : [],
        );
        setPlatforms(Array.isArray(data.platform) ? data.platform : []);

        // Load profile image
        if (data.profile_image) {
          setProfileImage(getFullImageUrl(data.profile_image));
          localStorage.setItem("profile_image", data.profile_image);
        }

        setError(null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load data from API on mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const finalImage =
    profileImage ||
    (profileData?.profile_image &&
    profileData.profile_image !== "null" &&
    profileData.profile_image !== ""
      ? getFullImageUrl(profileData.profile_image)
      : avatar);

  // POST API - Save profile data
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();

      const payload = {
        organization_name: profileData.organization_name,
        organization_type: profileData.organization_type,
        country: profileData.country,
        state: profileData.state,
        city: profileData.city,
        address: profileData.address,
        name: profileData.name,
        professional_role: profileData.professional_role,
        contact_no: profileData.contact_no,
        email: profileData.email,
        establishment_year: profileData.establishment_year,
        institute_description: profileData.institute_description,
        research_focus: researchFocus,
        platform: platforms,
        linkedin: profileData.linkedin,
        research_gate: profileData.research_gate,
        orc_id: profileData.orc_id,
        personal_website: profileData.personal_website,
        // Always send profile_image, even if empty string (for deletion)
        profile_image: profileData.profile_image || "",
      };

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/profile-institute`,
        {
          method: "POST", // Changed to POST as per standard form updates, adjust if your backend specifically requires PATCH
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (result.status || response.ok) {
        setSuccessMessage("Profile updated successfully!");

        // Trigger update event for profile page
        window.dispatchEvent(new Event("profileUpdated"));

        setTimeout(() => navigate("/dashboard/institute-profile"), 1500);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Upload profile image API - Fixed
  const uploadProfileImage = async (file) => {
    try {
      setUploading(true);
      setError(null); // Clear any previous errors
      const token = getAuthToken();

      if (!token) {
        setError("Authentication token missing.");
        return false;
      }

      const formData = new FormData();
      // Ensure the key matches exactly what the backend expects
      formData.append("profile_image", file);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/institute-profile-image`,
        {
          method: "POST", // Using POST for image upload as requested
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type header when sending FormData
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (result.status && result.profile_image) {
        const fullUrl = getFullImageUrl(result.profile_image);

        setProfileImage(fullUrl);
        setProfileData((prev) => ({
          ...prev,
          profile_image: result.profile_image,
        }));

        // Update local storage instantly
        localStorage.setItem("profile_image", result.profile_image);

        // Dispatch event for sidebar/header updates
        window.dispatchEvent(new Event("profileImageUpdated"));

        setSuccessMessage("Profile image uploaded successfully!");
        return true;
      } else {
        setError(result.message || "Upload failed from server.");
        return false;
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Network error during upload.");
      return false;
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
        setError("Please login first");
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/institute-profile-image-delete`,
        {
          method: "DELETE", // ⚠️ agar backend POST use karta ho to POST kar dena
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.status) {
        // ✅ UI update
        setProfileImage(null);
        setProfileData((prev) => ({ ...prev, profile_image: "" }));

        localStorage.removeItem("profile_image");

        // 🔥 notify whole app
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
    if (!file) return;

    // Temporary preview
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    // Upload instantly
    const success = await uploadProfileImage(file);

    if (!success) {
      // Rollback on failure, reset to previous state or null
      setProfileImage(
        profileData.profile_image
          ? getFullImageUrl(profileData.profile_image)
          : null,
      );
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFocus = (e) => {
    if (e.key === "Enter" && focusInput.trim() !== "") {
      e.preventDefault();
      if (!researchFocus.includes(focusInput.trim())) {
        setResearchFocus([...researchFocus, focusInput.trim()]);
      }
      setFocusInput("");
    }
  };

  const removeFocus = (index) =>
    setResearchFocus(researchFocus.filter((_, i) => i !== index));

  const handleAddPlatform = (e) => {
    if (e.key === "Enter" && platformInput.trim() !== "") {
      e.preventDefault();
      if (!platforms.includes(platformInput.trim())) {
        setPlatforms([...platforms, platformInput.trim()]);
      }
      setPlatformInput("");
    }
  };

  const removePlatform = (index) =>
    setPlatforms(platforms.filter((_, i) => i !== index));

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
          <h2 className="text-3xl font-bold text-white">
            Edit Institute Profile
          </h2>
          <p className="text-slate-400 mt-1">
            Update your institute's information, focus areas, and external
            links.
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

        <div className="flex flex-col gap-6">
          <section className="bg-[#0a0a0a]/50 p-8 rounded-2xl border border-[#1a1a1a] flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full ring-4 ring-[#0df287]/20 p-1 overflow-hidden relative bg-black/40 flex items-center justify-center">
                  <img
                    src={finalImage}
                    className="w-full h-full object-cover rounded-full"
                    alt="institute profile"
                    onError={(e) => (e.target.src = avatar)}
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
                  type="button"
                  onClick={deleteProfileImage}
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
                  <label className={labelClass}>Institute Name</label>
                  <input
                    className={`${inputClass} bg-black/60 cursor-not-allowed`}
                    placeholder="Enter institute name"
                    type="text"
                    value={profileData.organization_name}
                    disabled={true}
                  />
                </div>
                <div>
                  <label className={labelClass}>Institute Type</label>
                  <select
                    className={inputClass}
                    value={profileData.organization_type}
                    onChange={(e) =>
                      handleInputChange("organization_type", e.target.value)
                    }
                    disabled={saving}
                  >
                    <option value="" disabled>
                      Select Institute Type
                    </option>
                    <option value="university">University</option>
                    <option value="research institute">
                      Research Institute
                    </option>
                    <option value="ngo">NGO</option>
                    <option value="company">Company</option>
                    <option value="government">Government</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-[#1a1a1a] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MaterialIcon name="domain" className="text-[#0df287]" />
                <h2 className="text-xl font-bold text-white">
                  Institute Details
                </h2>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Establishment Year</label>
                  <input
                    className={inputClass}
                    placeholder="YYYY"
                    type="number"
                    value={profileData.establishment_year}
                    max={new Date().getFullYear()} // ✅ current year se aage nahi
                    min={1800}
                   onChange={(e) => {
    const val = parseInt(e.target.value);
    const currentYear = new Date().getFullYear();
    if (val <= currentYear || e.target.value === "") {
      handleInputChange("establishment_year", e.target.value);
    }
  }}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={labelClass}>Street Address</label>
                  <input
                    className={inputClass}
                    placeholder="Street Address"
                    type="text"
                    value={profileData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    className={inputClass}
                    placeholder="Country"
                    type="text"
                    value={profileData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={labelClass}>State / Province</label>
                  <input
                    className={inputClass}
                    placeholder="State"
                    type="text"
                    value={profileData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    className={inputClass}
                    placeholder="City"
                    type="text"
                    value={profileData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Institute Description</label>
                <textarea
                  className={`${inputClass} resize-y`}
                  placeholder="Describe the institute..."
                  rows="4"
                  value={profileData.institute_description}
                  onChange={(e) =>
                    handleInputChange("institute_description", e.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div>
                <label className={labelClass}>Focus Areas</label>
                <div className="flex flex-wrap gap-2 p-3 bg-black/40 border border-[#1a1a1a] rounded-xl">
                  {researchFocus.map((area, index) => (
                    <span
                      key={index}
                      className="bg-[#0df287]/10 text-[#0df287] border border-[#0df287]/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-2"
                    >
                      {area}
                      <MaterialIcon
                        name="close"
                        className="text-xs cursor-pointer hover:text-white"
                        onClick={() => removeFocus(index)}
                      />
                    </span>
                  ))}
                  <input
                    className="!bg-transparent !border-none !p-0 focus:ring-0 text-xs w-32 text-white outline-none placeholder:text-slate-500 ml-2"
                    placeholder="+ Add Focus Area"
                    type="text"
                    value={focusInput}
                    onChange={(e) => setFocusInput(e.target.value)}
                    onKeyDown={handleAddFocus}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1a1a]">
                <label className={labelClass}>
                  Sustainability / Platform Goals
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-black/40 border border-[#1a1a1a] rounded-xl">
                  {platforms.map((goal, index) => (
                    <span
                      key={index}
                      className="bg-[#0df287]/10 text-[#0df287] border border-[#0df287]/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-2"
                    >
                      {goal}
                      <MaterialIcon
                        name="close"
                        className="text-xs cursor-pointer hover:text-white"
                        onClick={() => removePlatform(index)}
                      />
                    </span>
                  ))}
                  <input
                    className="!bg-transparent !border-none !p-0 focus:ring-0 text-xs w-32 text-white outline-none placeholder:text-slate-500 ml-2"
                    placeholder="+ Add Goal"
                    type="text"
                    value={platformInput}
                    onChange={(e) => setPlatformInput(e.target.value)}
                    onKeyDown={handleAddPlatform}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <MaterialIcon
                  name="admin_panel_settings"
                  className="text-[#0df287]"
                />
                <h2 className="text-xl font-bold text-white">
                  Administrator Information
                </h2>
              </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Administrator Name</label>
                <input
                  className={inputClass}
                  placeholder="Full Name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label className={labelClass}>Role / Title</label>
                <input
                  className={inputClass}
                  placeholder="Role"
                  type="text"
                  value={profileData.professional_role}
                  onChange={(e) =>
                    handleInputChange("professional_role", e.target.value)
                  }
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-[#1a1a1a] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MaterialIcon
                  name="contact_support"
                  className="text-[#0df287]"
                />
                <h2 className="text-xl font-bold text-white">
                  Contact & Social
                </h2>
              </div>
            </div>

            <div className="p-8 space-y-4 max-w-2xl">
              <div className="space-y-2">
                <label className={labelClass}>Institute Email</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12 bg-black/60 cursor-not-allowed`}
                    placeholder="institute@email.com"
                    type="email"
                    value={profileData.email}
                    disabled={true}
                  />
                  <MaterialIcon
                    name="mail"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Contact Number</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12`}
                    placeholder="Enter contact number"
                    type="tel"
                    value={profileData.contact_no}
                    onChange={(e) =>
                      handleInputChange("contact_no", e.target.value)
                    }
                    disabled={saving}
                  />
                  <MaterialIcon
                    name="call"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Institute Website</label>
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
                <label className={labelClass}>ResearchGate ID</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12`}
                    type="text"
                    value={profileData.research_gate}
                    onChange={(e) =>
                      handleInputChange("research_gate", e.target.value)
                    }
                    disabled={saving}
                  />
                  <MaterialIcon
                    name="groups"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>LinkedIn Page</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pl-12`}
                    type="text"
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

          <div className="mt-8 pt-8 border-t border-[#1a1a1a] flex items-center justify-end gap-4">
            <button
              onClick={() => navigate("/dashboard/institute-profile")}
              className="px-8 py-3 text-slate-400 hover:text-white transition-colors font-bold text-sm"
              disabled={saving || uploading}
            >
              Discard Changes
            </button>
            <button
              onClick={handleSaveChanges}
              className={`px-10 py-3 bg-[#0df287] text-black hover:bg-[#0df287]/90 transition-all rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(13,242,135,0.3)] ${saving || uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={saving || uploading}
            >
              {saving || uploading ? "Saving..." : "Save All Changes"}
            </button>
          </div>
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

export default EditInstituteProfile;
