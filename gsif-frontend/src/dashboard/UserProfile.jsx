import React, { useState, useEffect } from "react";
import avatar from "../assets/images/avatar.jpg";
import API_CONFIG from "../config/api.config";
import { toast } from "react-toastify";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const UserProfile = ({ user, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const lightGreen = "#32ff99";
  const lightGreenBorder = "#5bf9aa37";

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

  // ✅ Get current logged-in user ID
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      const u = JSON.parse(userStr);
      if (Array.isArray(u) && u.length > 0) {
        return String(u[0].id || u[0].user_id || "");
      }
      return String(u.id || u.user_id || "");
    } catch {
      return null;
    }
  };

  // ✅ True agar yeh profile current user ki apni hai
  const isOwnProfile = String(getCurrentUserId()) === String(user?.id);

  // Detect user type from user prop or fetched data
  useEffect(() => {
    if (user) {
      const isInstitute =
        user.type === "Research Institute" ||
        user.organization_type ||
        user.institute_name ||
        user.user_type === "institute";

      setUserType(isInstitute ? "institute" : "individual");
    }
  }, [user]);

  // Fetch profile data using the new chat user profile API
  useEffect(() => {
    if (!user?.id) {
      setProfileData(null);
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();

        const endpoint = `${API_CONFIG.BASE_URL}/profile/get-chat-user-profile/${user.id}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const result = await response.json();

        if (result.status && result.data) {
          const apiUserType =
            result.data.user?.user_type ||
            (result.data.institute ? "institute" : "individual");
          setUserType(apiUserType);
          setProfileData(result.data);
        } else {
          setProfileData({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              user_type: user.user_type || "individual",
              registration_id: user.registration_id,
            },
            [user.user_type === "institute" ? "institute" : "individual"]: {},
            [`profile_${user.user_type === "institute" ? "institute" : "individual"}`]: {},
          });
          setUserType(user.user_type === "institute" ? "institute" : "individual");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileData({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.user_type || "individual",
            registration_id: user.registration_id,
          },
          [user.user_type === "institute" ? "institute" : "individual"]: {},
          [`profile_${user.user_type === "institute" ? "institute" : "individual"}`]: {},
        });
        setUserType(user.user_type === "institute" ? "institute" : "individual");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  const getProfileImage = () => {
    if (!profileData) return user?.avatars?.[0] || avatar;

    const profileImage =
      profileData.profile_institute?.profile_image ||
      profileData.profile_individual?.profile_image ||
      profileData.user?.profile_image;

    const image = profileImage || user?.avatars?.[0];

    if (!image) return avatar;
    if (image.startsWith("http")) return image;
    if (image.startsWith("data:")) return image;
    return `${API_CONFIG.BASE_URL}${image.startsWith("/") ? image : "/" + image}`;
  };

  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  const getIndividualData = () => profileData?.profile_individual || {};
  const getInstituteProfileData = () => profileData?.profile_institute || {};
  const getInstituteData = () => profileData?.institute || {};
  const getUserData = () => profileData?.user || {};

  // ✅ Block User API
  const handleBlockUser = async () => {
    if (!user?.id) return;
    setIsBlocking(true);
    setShowMenu(false);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/account/block-unblock-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: String(user.id) }),
        }
      );
      const result = await response.json();
      if (result.status) {
        toast.success(result.message || "User blocked successfully");
        onClose(); // Profile band karo block ke baad
      } else {
        toast.error(result.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Block user error:", error);
      toast.error("Error blocking user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  const FieldInfo = ({ label, value, icon = "info" }) => {
    if (!value || value === "" || value === "N/A" || value === null) return null;
    return (
      <div className="flex items-start gap-3 p-4 bg-[#0a120e]/40 rounded-lg border border-[#5bf9aa15] hover:border-[#5bf9aa30] transition-colors">
        <MaterialIcon name={icon} className="text-[#32ff99] text-lg mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {label}
          </label>
          <p className="text-white font-medium break-words">{value}</p>
        </div>
      </div>
    );
  };

  const LinkField = ({ label, value }) => {
    if (!value || value === "") return null;
    return (
      <div className="p-4 bg-[#0a120e]/40 rounded-lg border border-[#5bf9aa15] hover:border-[#5bf9aa30] transition-colors">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          {label}
        </label>
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#32ff99] hover:text-white transition-colors break-all"
        >
          {value}
        </a>
      </div>
    );
  };

  const TagsField = ({ label, items }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="p-4 bg-[#0a120e]/40 rounded-lg border border-[#5bf9aa15]">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          {label}
        </label>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="bg-[#32ff99]/10 text-[#32ff99] border border-[#32ff99]/20 px-3 py-1 rounded-full text-xs font-bold"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const SectionHeading = ({ icon, title }) => (
    <h3 className="text-lg font-bold text-[#32ff99] mb-4 flex items-center gap-2">
      <MaterialIcon name={icon} className="text-xl" />
      {title}
    </h3>
  );

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0d0f0e]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#32ff99]"></div>
      </div>
    );
  }

  const userData = getUserData();
  const individualData = getIndividualData();
  const instituteProfileData = getInstituteProfileData();
  const instituteData = getInstituteData();

  const getDisplayName = () => {
    if (userType === "institute") {
      return instituteData.institute_name || instituteProfileData.organization_name || userData.name || "Institute";
    }
    return userData.name || user?.name || "User";
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#0d0f0e]">
      {/* Header */}
      <div
        className="bg-[#13231a]/60 backdrop-blur-md rounded-t-2xl p-4 flex items-center border-b shrink-0"
        style={{ borderColor: lightGreenBorder }}
      >
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-all mr-3"
        >
          <MaterialIcon name="arrow_back" className="text-2xl" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Profile</h3>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            {userType === "individual" ? "Individual Researcher" : "Research Institute"}
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar">
        {/* Main Profile Card */}
        <div
          className="bg-[#13231a]/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col border shadow-2xl mb-6 relative"
          style={{ borderColor: lightGreenBorder }}
        >
          {/* ✅ 3-dot menu — sirf tab dikhao jab apni profile NA ho */}
          {!isOwnProfile && (
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={isBlocking}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/20 hover:bg-black/40 text-white transition-all backdrop-blur-sm disabled:opacity-50"
                aria-label="Menu"
              >
                {isBlocking ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <MaterialIcon name="more_vert" className="text-xl" />
                )}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-9 z-20 w-40 bg-[#0f1a14] border border-red-500/20 rounded-lg overflow-hidden shadow-2xl">
                    <button
                      onClick={handleBlockUser}
                      className="w-full px-3 py-2.5 flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium"
                    >
                      <MaterialIcon name="block" className="text-base" />
                      <span>Block User</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div
            className="p-6 md:p-8 flex flex-col items-center border-b"
            style={{ borderColor: lightGreenBorder }}
          >
            {/* Avatar */}
            <div className="relative mb-6 group">
              <div className="absolute -inset-1 bg-[#32ff99]/20 rounded-full blur-2xl group-hover:bg-[#32ff99]/40 transition-all duration-500"></div>
              <img
                className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#0a120e] object-cover shadow-2xl"
                src={getProfileImage()}
                alt={getDisplayName()}
                onError={(e) => { e.target.src = avatar; }}
              />
            </div>

            {/* Name & Type */}
            <div className="w-full text-center">
              <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                {getDisplayName()}
              </h2>
              <p className="text-sm font-mono text-[#32ff99] uppercase tracking-widest mb-1">
                {userType === "individual" ? "Individual Researcher" : "Research Institute"}
              </p>
              <p className="text-xs text-slate-400">
                ID: {userData.registration_id || user?.id || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* INDIVIDUAL - Personal Information */}
        {userType === "individual" && (
          <div className="bg-[#13231a]/40 border rounded-2xl p-6 mb-6" style={{ borderColor: lightGreenBorder }}>
            <SectionHeading icon="person" title="Personal Information" />
            <div className="space-y-3">
              <FieldInfo label="Full Name" value={userData.name} icon="person" />
              <FieldInfo label="Date of Birth" value={individualData.date_of_birth} icon="cake" />
              <FieldInfo label="Short Bio" value={individualData.short_bio} icon="description" />
              <FieldInfo label="Language" value={individualData.language} icon="language" />
              <FieldInfo label="Country" value={individualData.country} icon="public" />
              <FieldInfo label="State" value={individualData.state} icon="map" />
              <FieldInfo label="City" value={individualData.city} icon="location_on" />
              <FieldInfo label="Pincode" value={individualData.pincode} icon="pin_drop" />
            </div>
          </div>
        )}

        {/* INDIVIDUAL - Professional Information */}
        {userType === "individual" && (
          <div className="bg-[#13231a]/40 border rounded-2xl p-6 mb-6" style={{ borderColor: lightGreenBorder }}>
            <SectionHeading icon="school" title="Professional Information" />
            <div className="space-y-3">
              <FieldInfo label="Research Level" value={individualData.describes} icon="school" />
              <FieldInfo label="Current Research" value={individualData.current_research} icon="science" />
              <FieldInfo label="Years of Experience" value={individualData.year_of_experience_vijay || individualData.year_of_experience} icon="workspace_premium" />
              <FieldInfo label="Skills" value={individualData.skills_vijay || individualData.skills} icon="psychology" />
              <FieldInfo label="Previous Publications" value={individualData.previous_publication_vijay || individualData.previous_publication} icon="menu_book" />
              <TagsField label="Job Roles" items={parseArrayField(individualData.job_role)} />
              <TagsField label="Companies" items={parseArrayField(individualData.company)} />
              <TagsField label="Research Interests" items={parseArrayField(individualData.interest)} />
              <TagsField label="Development Goals" items={parseArrayField(individualData.developement_goals)} />
            </div>
          </div>
        )}

        {/* INSTITUTE - Details */}
        {userType === "institute" && (
          <div className="bg-[#13231a]/40 border rounded-2xl p-6 mb-6" style={{ borderColor: lightGreenBorder }}>
            <SectionHeading icon="domain" title="Institute Details" />
            <div className="space-y-3">
              <FieldInfo label="Institute Name" value={instituteData.institute_name} icon="domain" />
              <FieldInfo label="Institute Type" value={instituteProfileData.organization_type} icon="category" />
              <FieldInfo label="Country" value={instituteProfileData.country} icon="public" />
              <FieldInfo label="State" value={instituteProfileData.state} icon="map" />
              <FieldInfo label="City" value={instituteProfileData.city} icon="location_on" />
              <FieldInfo label="Address" value={instituteData.address} icon="home" />
              <FieldInfo label="Establishment Year" value={instituteProfileData.establishment_year} icon="event" />
              <TagsField label="Research Focus" items={parseArrayField(instituteProfileData.research_focus)} />
              <TagsField label="Platforms" items={parseArrayField(instituteProfileData.platform)} />
            </div>
          </div>
        )}

        {/* INSTITUTE - Administrator Information */}
        {userType === "institute" && (
          <div className="bg-[#13231a]/40 border rounded-2xl p-6 mb-6" style={{ borderColor: lightGreenBorder }}>
            <SectionHeading icon="admin_panel_settings" title="Administrator Information" />
            <div className="space-y-3">
              <FieldInfo label="Administrator Name" value={userData.name} icon="person" />
              <FieldInfo label="Professional Role" value={instituteData.professional_role} icon="work" />
            </div>
          </div>
        )}

        {/* Contact & Social Links */}
        <div className="bg-[#13231a]/40 border rounded-2xl p-6 mb-6" style={{ borderColor: lightGreenBorder }}>
          <SectionHeading icon="contact_mail" title="Contact & Social Links" />
          <div className="space-y-3">
            <FieldInfo label="Email Address" value={userData.email} icon="mail" />
            <FieldInfo
              label="Phone Number"
              value={userType === "institute" ? instituteData.contact_no : individualData.contact_no}
              icon="phone"
            />
            <LinkField label="Website" value={userType === "institute" ? instituteData.website : individualData.website} />
            <LinkField label="LinkedIn Profile" value={userType === "institute" ? instituteProfileData.linkedin : individualData.linkedin} />
            <LinkField label="ResearchGate Profile" value={userType === "institute" ? instituteProfileData.research_gate : individualData.research_gate} />
            <LinkField label="ORCID ID" value={userType === "institute" ? instituteProfileData.orc_id : individualData.orc_id} />
            <LinkField label="Personal Website" value={userType === "institute" ? instituteProfileData.personal_website : individualData.personal_website} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default UserProfile;