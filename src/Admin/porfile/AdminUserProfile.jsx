import React, { useState, useEffect, useRef } from "react";
import avatar from "../../assets/images/avatar.jpg";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

// ✅ FIX 1: Module-level cache — component unmount hone pe bhi survive karta hai
// Pehle cacheRef = useRef tha jo har baar component close hone pe destroy ho jata tha
const profileCache = new Map();
const isAdmin = true; // temporary (for testing)


const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const SkeletonLoader = () => (
  <div
    className="
h-full w-full flex flex-col rounded-3xl relative
bg-white text-slate-800
dark:bg-[#0d0f0e] dark:text-white
"
  >
    {" "}
    <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-5 md:pt-6 pb-6">
      <div
        className="
bg-gray-100 border border-gray-200
dark:bg-[#0b100d] dark:border-white/5
rounded-2xl p-4 sm:p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-24 h-24 sm:w-[100px] sm:h-[100px] rounded-full bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] animate-shimmer"></div>
          <div className="flex-1 text-center sm:text-left">
            <div className="h-8 bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] rounded-lg w-48 mx-auto sm:mx-0 animate-shimmer mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] rounded-lg w-32 mx-auto sm:mx-0 animate-shimmer mb-2"></div>
            <div className="h-3 bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] rounded-lg w-40 mx-auto sm:mx-0 animate-shimmer"></div>
          </div>
          <div className="w-24 h-10 bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] rounded-lg animate-shimmer"></div>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gray-100 border border-gray-200 dark:bg-[#0b100d] dark:border-white/5 rounded-xl mb-4 p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] rounded-full animate-shimmer"></div>
            <div className="h-6 bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] rounded-lg w-32 animate-shimmer"></div>
          </div>
          <div className="space-y-3">
            <div className="h-16 bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] rounded-lg animate-shimmer"></div>
            <div className="h-16 bg-gradient-to-r from-[#1a2a22] via-[#24362e] to-[#1a2a22] rounded-lg animate-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
    <style jsx>{`
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .animate-shimmer {
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
      }
    `}</style>
  </div>
);

const UserProfile = ({ user, onClose, initialConnectionStatus = 3, isAdmin = false }) => {
  // ✅ FIX 2: Pehle se hi user prop ka basic data set karo — skeleton nahi dikhega
  const [connectionStatus, setConnectionStatus] = useState(
    initialConnectionStatus,
  );
  const [profileData, setProfileData] = useState(() => {
    // Agar cache me already hai toh wahi lo (instant!)
    if (user?.id) {
      const cached = profileCache.get(`profile_${user.id}`);
      if (cached && Date.now() - cached.time < 60000) {
        return cached.data;
      }
    }
    // Nahi toh user prop se basic data
    return {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        user_type: user?.user_type || "individual",
        registration_id: user?.registration_id,
      },
      individual: {},
      profile_individual: {},
      institute: {},
      profile_institute: {},
    };
  });

  // ✅ FIX 3: loading = false by default — skeleton sirf tab dikhao jab cache bhi nahi ho
  const [loading, setLoading] = useState(() => {
    if (user?.id) {
      const cached = profileCache.get(`profile_${user.id}`);
      if (cached && Date.now() - cached.time < 60000) return false;
    }
    return false; // Basic data already set hai upar, skeleton zaroorat nahi
  });

  const [userType, setUserType] = useState(() => {
    if (user?.id) {
      const cached = profileCache.get(`profile_${user.id}`);
      if (cached && Date.now() - cached.time < 60000) return cached.userType;
    }
    const isInstitute =
      user?.type === "Research Institute" ||
      user?.organization_type ||
      user?.institute_name ||
      user?.user_type === "institute";
    return isInstitute ? "institute" : "individual";
  });

  const [isFlipping, setIsFlipping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [openSections, setOpenSections] = useState({
    personal: false,
    professional: false,
    institute: false,
    admin: false,
    contact: false,
  });

  const [showMenu, setShowMenu] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  // ✅ Connected users list + popup
  const [connectedUsersList, setConnectedUsersList] = useState([]);
  const [connectedCount, setConnectedCount] = useState(null);
  const [showConnectedPopup, setShowConnectedPopup] = useState(false);
  const [loadingConnected, setLoadingConnected] = useState(false);

  const requestRef = useRef(null);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

  // ✅ Fetch connected users list for this profile
  const fetchConnectedUsers = async () => {
    if (!user?.id) return;
    setLoadingConnected(true);
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/user/connected-users-list-user/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await res.json();
      if (result.status && result.data) {
        setConnectedUsersList(result.data);
        setConnectedCount(result.data.length);
      } else {
        setConnectedUsersList([]);
        setConnectedCount(0);
      }
    } catch (err) {
      console.error("fetchConnectedUsers error:", err);
      setConnectedCount(0);
    } finally {
      setLoadingConnected(false);
    }
  };

  const handleOpenConnectedPopup = () => {
    setShowConnectedPopup(true);
    if (connectedUsersList.length === 0) {
      fetchConnectedUsers();
    }
  };

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

  const isOwnProfile = String(getCurrentUserId()) === String(user?.id);

  // NAYA useEffect — API se real status fetch karo:
  useEffect(() => {
    if (!user?.id || isOwnProfile) return;

    // ✅ Agar parent se already connected status mila hai toh API call skip karo
    if (initialConnectionStatus === 2) {
      setConnectionStatus(2);
      return;
    }

    const fetchConnectionStatus = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/user/connection-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ connected_user_id: Number(user.id) }),
          },
        );
        const result = await res.json();
        if (result.status && result.data) {
          setConnectionStatus(result.data.connection_status);
        }
      } catch (err) {
        console.error("Connection status fetch error:", err);
      }
    };
    fetchConnectionStatus();
  }, [user?.id, initialConnectionStatus]);

  // ✅ Fetch connected count on mount (just count, no popup yet)
  useEffect(() => {
    if (!user?.id) return;
    const fetchCount = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/user/connected-users-list-user/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const result = await res.json();
        if (result.status && result.data) {
          setConnectedUsersList(result.data);
          setConnectedCount(result.data.length);
        } else {
          setConnectedCount(0);
        }
      } catch {
        setConnectedCount(0);
      }
    };
    fetchCount();
  }, [user?.id]);

  // ✅ FIX 4: API background me fetch karo — UI block mat karo
  useEffect(() => {
    if (!user?.id) return;

    const cacheKey = `profile_${user.id}`;
    const cached = profileCache.get(cacheKey);

    // ✅ Cache valid hai — kuch karne ki zaroorat nahi
    if (cached && Date.now() - cached.time < 60000) {
      return;
    }

    // Cancel previous request
    if (requestRef.current) {
      requestRef.current.abort();
    }
    requestRef.current = new AbortController();

    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const endpoint = `${API_CONFIG.BASE_URL}/profile/get-chat-user-profile/${user.id}`;

        const timeoutId = setTimeout(() => {
          if (requestRef.current) {
            requestRef.current.abort();
          }
        }, 5000);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: requestRef.current.signal,
        });

        clearTimeout(timeoutId);
        const result = await response.json();

        if (result.status && result.data) {
          const apiUserType =
            result.data.user?.user_type ||
            (result.data.institute ? "institute" : "individual");

          setUserType(apiUserType);
          setProfileData(result.data);

          // ✅ FIX 5: Module-level profileCache me save karo
          profileCache.set(cacheKey, {
            data: result.data,
            userType: apiUserType,
            time: Date.now(),
          });

          // if (result.data.is_connected !== undefined) {
          //   const apiStatus =
          //     result.data.is_connected === true ||
          //     result.data.is_connected === "1";
          //   setIsConnected(apiStatus);
          //   const currentId = getCurrentUserId();
          //   if (currentId) {
          //     localStorage.setItem(
          //       `connection_${currentId}_${user.id}`,
          //       JSON.stringify(apiStatus)
          //     );
          //   }
          // }
        }
        // Agar API fail ho — basic data already show ho raha hai, kuch karne ki zaroorat nahi
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Profile fetch error:", error);
        }
        // Basic data pehle se render ho raha hai — koi error nahi dikhana
      }
    };

    fetchData();

    return () => {
      if (requestRef.current) {
        requestRef.current.abort();
      }
    };
  }, [user?.id]);

  // Ye useEffect add karo:
  useEffect(() => {
    const handleUpdate = (e) => {
      if (String(e.detail.userId) === String(user?.id)) {
        setConnectionStatus(e.detail.status);
      }
    };
    window.addEventListener("connectionStatusUpdated", handleUpdate);
    return () =>
      window.removeEventListener("connectionStatusUpdated", handleUpdate);
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


  const handleConnect = async () => {
    if (!user?.id || isFlipping) return;
    if (connectionStatus === 1) return; // already pending

    setIsFlipping(true);
    const token = getAuthToken();

    setTimeout(async () => {
      try {
        if (connectionStatus === 2) {
          // Disconnect
          const res = await fetch(
            `${API_CONFIG.BASE_URL}/user/disconnect-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ connected_user_id: String(user.id) }),
            },
          );
          const result = await res.json();
          if (result.status) {
            setConnectionStatus(3);
            window.dispatchEvent(
              new CustomEvent("connectionStatusUpdated", {
                detail: { userId: String(user.id), status: 3 },
              }),
            );
          }
        } else {
          // Connect request → pending
          const res = await fetch(`${API_CONFIG.BASE_URL}/user/connect-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ connected_user_id: String(user.id) }),
          });
          const result = await res.json();
          if (result.status) {
            setConnectionStatus(1); // pending
            window.dispatchEvent(
              new CustomEvent("connectionStatusUpdated", {
                detail: { userId: String(user.id), status: 1 },
              }),
            );
          }
        }
      } catch {
        toast.error("Error. Please try again.");
      } finally {
        setTimeout(() => setIsFlipping(false), 400);
      }
    }, 50);
  };


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
      onClose();
    } else {
      toast.error(result.message || "Failed to block user");
    }
  } catch (error) {
    toast.error("Error blocking user");
  } finally {
    setIsBlocking(false);
  }
};

  const FieldInfo = ({ label, value, icon = "info" }) => {
    if (!value || value === "" || value === "N/A" || value === null)
      return null;
    return (
      <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg dark:bg-[#0a120e]/40 dark:border-white/5 hover:border-[#5bf9aa30] transition-colors">
        <MaterialIcon
          name={icon}
          className="text-[#32ff99] text-lg mt-1 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {label}
          </label>
          <p className="text-slate-900 dark:text-white font-medium break-words">
            {value}
          </p>
        </div>
      </div>
    );
  };

  const LinkField = ({ label, value }) => {
    if (!value || value === "") return null;
    return (
      <div className="p-4 bg-gray-50 dark:bg-[#0a120e]/40 rounded-lg border border-gray-200 dark:border-white/5">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
          {label}
        </label>
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#32ff99] hover:text-slate-900 dark:hover:text-white transition-colors break-all"
        >
          {value}
        </a>
      </div>
    );
  };

  const TagsField = ({ label, items }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="p-4 bg-gray-50 dark:bg-[#0a120e]/40 rounded-lg border border-gray-200 dark:border-white/5">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-3">
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

  const AccordionSection = ({ id, icon, title, children }) => {
    const isOpen = openSections[id];
    return (
      <div
        className="
bg-white border border-gray-200
dark:bg-[#0b100d] dark:border-white/5 rounded-xl mb-4 overflow-hidden shadow-sm"
      >
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MaterialIcon name={icon} className="text-[#32ff99] text-xl" />
            <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg">
              {title}
            </h3>
          </div>
          <MaterialIcon
            name={isOpen ? "expand_less" : "expand_more"}
            className="text-slate-600 dark:text-slate-400"
          />
        </button>
        {isOpen && (
          <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a120e]/50">
            <div className="space-y-3">{children}</div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  const userData = getUserData();
  const individualData = getIndividualData();
  const instituteProfileData = getInstituteProfileData();
  const instituteData = getInstituteData();

  const getDisplayName = () => {
    if (userType === "institute") {
      return (
        instituteData.institute_name ||
        instituteProfileData.organization_name ||
        userData.name ||
        "Institute"
      );
    }
    return userData.name || user?.name || "User";
  };

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-[#0d0f0e] rounded-3xl relative">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-5 md:pt-6 pb-6 hide-scrollbar">
        <div className="bg-gray-100 border border-gray-200 dark:bg-[#0b100d] dark:border-white/5 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
            <button
              onClick={onClose}
              className="absolute sm:static top-4 left-4 group flex items-center justify-center bg-transparent border-none cursor-pointer shrink-0"
            >
              <MaterialIcon
                name="arrow_back"
                className="text-xl text-slate-900 dark:text-white group-hover:-translate-x-1 transition-transform"
              />
            </button>

            <div className="relative w-24 h-24 sm:w-[100px] sm:h-[100px] rounded-full border border-[#32ff99]/40 p-1 shrink-0 bg-gray-100 dark:bg-[#0b100d] mt-4 sm:mt-0">
              <img
                className="w-full h-full rounded-full object-cover bg-gray-200 dark:bg-[#13231a]"
                src={getProfileImage()}
                alt={getDisplayName()}
                loading="lazy"
                onError={(e) => {
                  e.target.src = avatar;
                }}
              />
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0 mt-2 sm:mt-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1.5 truncate">
                {getDisplayName()}
              </h2>
              <p className="text-[#32ff99] text-sm font-medium mb-1.5 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                {userType === "individual"
                  ? "Individual Researcher"
                  : "Research Institute"}
                {individualData.short_bio && (
                  <>
                    <span className="text-[#32ff99]"> • </span>
                    <span className="truncate">{individualData.short_bio}</span>
                  </>
                )}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                Registration ID:{" "}
                <span className="text-slate-600 dark:text-slate-400">
                  {userData.registration_id || user?.id || "N/A"}
                </span>
              </p>
              {/* ✅ Connected count — click to open popup */}
              <button
                onClick={handleOpenConnectedPopup}
                className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-[#32ff99] transition-colors group"
              >
                <MaterialIcon name="group" className="text-sm text-[#32ff99]" />
                <span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {connectedCount === null ? "..." : connectedCount}
                  </span>{" "}
                  Connected
                </span>
                <MaterialIcon
                  name="chevron_right"
                  className="text-xs text-slate-500 group-hover:text-[#32ff99] transition-colors"
                />
              </button>
            </div>

            <div className="shrink-0 mt-4 sm:mt-0 flex items-center gap-2 sm:gap-3">
              {!isOwnProfile ? (
                <>

                  <div className="relative">
  {!isOwnProfile && (
    <button
      onClick={() => setShowMenu(!showMenu)}
      disabled={isBlocking}
      className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/20 text-slate-900 dark:text-white"
    >
      {isBlocking ? (
        <div className="w-4 h-4 border-2 border-gray-400 border-t-black dark:border-t-white rounded-full animate-spin" />
      ) : (
        <MaterialIcon name="more_vert" />
      )}
    </button>
  )}

  {showMenu && (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={() => setShowMenu(false)}
      />

      <div className="absolute right-0 mt-2 z-20 w-40 bg-white dark:bg-[#0f1a14] border border-red-200 dark:border-red-500/20 rounded-lg shadow-2xl">
        <button
          onClick={handleBlockUser}
          className="w-full px-3 py-2 flex items-center gap-2 text-red-500 hover:bg-red-500/10"
        >
          <MaterialIcon name="block" />
          Block User
        </button>
      </div>
    </>
  )}
</div>
                  
                </>
              ) : (
                <button className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#32ff99] hover:bg-[#2be58a] rounded-xl text-[#0a120e] transition-all text-sm font-bold shadow-md border-none">
                  <MaterialIcon name="edit" className="text-base sm:text-lg" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {userType === "individual" && (
          <AccordionSection
            id="personal"
            icon="person"
            title="Personal Information"
          >
            <FieldInfo label="Full Name" value={userData.name} icon="person" />
            <FieldInfo
              label="Date of Birth"
              value={individualData.date_of_birth}
              icon="cake"
            />
            <FieldInfo
              label="Short Bio"
              value={individualData.short_bio}
              icon="description"
            />
            <FieldInfo
              label="Language"
              value={individualData.language}
              icon="language"
            />
            <FieldInfo
              label="Country"
              value={individualData.country}
              icon="public"
            />
            <FieldInfo label="State" value={individualData.state} icon="map" />
            <FieldInfo
              label="City"
              value={individualData.city}
              icon="location_on"
            />
            <FieldInfo
              label="Pincode"
              value={individualData.pincode}
              icon="pin_drop"
            />
          </AccordionSection>
        )}

        {userType === "individual" && (
          <AccordionSection
            id="professional"
            icon="school"
            title="Professional Information"
          >
            <FieldInfo
              label="Research Level"
              value={individualData.describes}
              icon="school"
            />
            <FieldInfo
              label="Current Research"
              value={individualData.current_research}
              icon="science"
            />
            <FieldInfo
              label="Years of Experience"
              value={
                individualData.year_of_experience_vijay ||
                individualData.year_of_experience
              }
              icon="workspace_premium"
            />
            <FieldInfo
              label="Skills"
              value={individualData.skills_vijay || individualData.skills}
              icon="psychology"
            />
            <FieldInfo
              label="Previous Publications"
              value={
                individualData.previous_publication_vijay ||
                individualData.previous_publication
              }
              icon="menu_book"
            />
            <TagsField
              label="Job Roles"
              items={parseArrayField(individualData.job_role)}
            />
            <TagsField
              label="Companies"
              items={parseArrayField(individualData.company)}
            />
            <TagsField
              label="Research Interests"
              items={parseArrayField(individualData.interest)}
            />
            <TagsField
              label="Development Goals"
              items={parseArrayField(individualData.developement_goals)}
            />
          </AccordionSection>
        )}

        {userType === "institute" && (
          <AccordionSection
            id="institute"
            icon="domain"
            title="Institute Details"
          >
            <FieldInfo
              label="Institute Name"
              value={instituteData.institute_name}
              icon="domain"
            />
            <FieldInfo
              label="Institute Type"
              value={instituteProfileData.organization_type}
              icon="category"
            />
            <FieldInfo
              label="Country"
              value={instituteProfileData.country}
              icon="public"
            />
            <FieldInfo
              label="State"
              value={instituteProfileData.state}
              icon="map"
            />
            <FieldInfo
              label="City"
              value={instituteProfileData.city}
              icon="location_on"
            />
            <FieldInfo
              label="Address"
              value={instituteData.address}
              icon="home"
            />
            <FieldInfo
              label="Establishment Year"
              value={instituteProfileData.establishment_year}
              icon="event"
            />
            <TagsField
              label="Research Focus"
              items={parseArrayField(instituteProfileData.research_focus)}
            />
            <TagsField
              label="Platforms"
              items={parseArrayField(instituteProfileData.platform)}
            />
          </AccordionSection>
        )}

        {userType === "institute" && (
          <AccordionSection
            id="admin"
            icon="admin_panel_settings"
            title="Administrator Information"
          >
            <FieldInfo
              label="Administrator Name"
              value={userData.name}
              icon="person"
            />
            <FieldInfo
              label="Professional Role"
              value={instituteData.professional_role}
              icon="work"
            />
          </AccordionSection>
        )}

        <AccordionSection
          id="contact"
          icon="contact_mail"
          title="Contact & Social"
        >
          <FieldInfo label="Email Address" value={userData.email} icon="mail" />
          <FieldInfo
            label="Phone Number"
            value={
              userType === "institute"
                ? instituteData.contact_no
                : individualData.contact_no
            }
            icon="phone"
          />
          <LinkField
            label="Website"
            value={
              userType === "institute"
                ? instituteData.website
                : individualData.website
            }
          />
          <LinkField
            label="LinkedIn Profile"
            value={
              userType === "institute"
                ? instituteProfileData.linkedin
                : individualData.linkedin
            }
          />
          <LinkField
            label="ResearchGate Profile"
            value={
              userType === "institute"
                ? instituteProfileData.research_gate
                : individualData.research_gate
            }
          />
          <LinkField
            label="ORCID ID"
            value={
              userType === "institute"
                ? instituteProfileData.orc_id
                : individualData.orc_id
            }
          />
          <LinkField
            label="Personal Website"
            value={
              userType === "institute"
                ? instituteProfileData.personal_website
                : individualData.personal_website
            }
          />
        </AccordionSection>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .flip {
          animation: flip 0.3s ease-in-out;
        }
        @keyframes flip {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>

      {/* ✅ Connected Users Popup */}
      {showConnectedPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowConnectedPopup(false)}
        >
          <div
            className="bg-white dark:bg-[#0b100d] border border-gray-200 dark:border-[#32ff99]/20 rounded-2xl w-full max-w-sm shadow-2xl animate-fadeInUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <MaterialIcon name="group" className="text-[#32ff99] text-xl" />
                <h3 className="text-slate-900 dark:text-white font-bold text-base">
                  Connected Users
                  {connectedCount !== null && (
                    <span className="ml-2 text-xs font-normal bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-[#32ff99] dark:text-[#0a120e] px-2 py-0.5 rounded-full border border-[#32ff99]/20">
                      {connectedCount}
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setShowConnectedPopup(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto hide-scrollbar">
              {loadingConnected ? (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="w-5 h-5 border-2 border-[#32ff99]/30 border-t-[#32ff99] rounded-full animate-spin" />
                  <span className="text-slate-600 dark:text-slate-400 text-sm">
                    Loading...
                  </span>
                </div>
              ) : connectedUsersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <MaterialIcon
                    name="group_off"
                    className="text-3xl text-slate-500 dark:text-slate-600"
                  />
                  <p className="text-slate-500 text-sm">No connections yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-white/5">
                  {connectedUsersList.map((u) => {
                    const imgSrc = u.profile_image
                      ? u.profile_image.startsWith("http")
                        ? u.profile_image
                        : `${API_CONFIG.BASE_URL}/${u.profile_image}`
                      : null;
                    return (
                      <div
                        key={u.user_id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full border border-[#32ff99]/20 overflow-hidden shrink-0 bg-gray-200 dark:bg-[#13231a]">
                          <img
                            src={imgSrc || avatar}
                            alt={u.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = avatar;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 dark:text-white font-semibold text-sm truncate capitalize">
                            {u.user_type === "institute" && u.institute_name
                              ? u.institute_name
                              : u.name}
                          </p>
                          <p className="text-slate-500 text-xs truncate">
                            {u.registration_id} •{" "}
                            <span className="capitalize">{u.user_type}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;