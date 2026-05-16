import React, { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/Logo";
import avatar from "../assets/images/avatar.jpg";
import API_CONFIG from "../config/api.config";
import UserProfile from "./UserProfile";
import NotificationPopup from "./NotificationPopup";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notifRef = useRef(null);
  const mobileNotifRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const [activeNav, setActiveNav] = useState("home");
  const [isBoardMember, setIsBoardMember] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEventsMenuOpen, setIsEventsMenuOpen] = useState(false); // ✅ Nayi State
  const [profileImage, setProfileImage] = useState(null);
  const [isInstituteBlocked, setIsInstituteBlocked] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // ✅ Only unreadCount stays here — for the red dot on bell icon
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileNotifOpen, setIsMobileNotifOpen] = useState(false);

  // ── Search States ──
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
const [blockedUserIds, setBlockedUserIds] = useState([]);
  // ── UserProfile Modal State ──
  const [selectedSearchUser, setSelectedSearchUser] = useState(null);

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

  const [userData, setUserData] = useState({
    name: "User Name",
    email: "user@example.com",
    type: "Individual",
  });

  useEffect(() => {
    const initUser = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        setUserData({
          name:
            user.user_type === "institute" || user.user_type === "institution"
              ? user.institute_name ||
                user.name ||
                localStorage.getItem("instituteName") ||
                "Institute Name"
              : user.name || "User Name",
          email:
            user.email ||
            localStorage.getItem("userEmail") ||
            "user@example.com",
          type: (
            user.user_type ||
            localStorage.getItem("userType") ||
            "Individual"
          ).trim(),
        });

        const isInstitute =
          user.user_type === "institute" || user.user_type === "institution";
        if (!isInstitute) return;

        const token = getAuthToken();
        if (!token) return;

        try {
          const response = await fetch(
            `${API_CONFIG.BASE_URL}/profile/get-profile-institute`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const result = await response.json();
          if (result.status && result.data) {
            const freshStatus = String(
              result.data.institute_status ?? result.data.status ?? "1",
            );
            const updatedUser = { ...user, institute_status: freshStatus };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setIsInstituteBlocked(freshStatus !== "2");
          } else {
            const localStatus = String(user.institute_status ?? "1");
            setIsInstituteBlocked(localStatus !== "2");
          }
        } catch (apiErr) {
          const localStatus = String(user.institute_status ?? "1");
          setIsInstituteBlocked(localStatus !== "2");
        }
      } catch (err) {
        console.error("User parse error:", err);
      }
    };
    initUser();
  }, []);

  const lightGreen = "#32ff99";
  const lightGreenBorder = "#5bf9aa37";
  const headerHeight = 80;

  const loadImageFromStorage = () => {
    const savedImage = localStorage.getItem("profile_image");
    if (savedImage) {
      setProfileImage(getFullImageUrl(savedImage));
    } else {
      setProfileImage(null);
    }
  };

  useEffect(() => {
    const syncImageFromDB = async () => {
      try {
        const token = getAuthToken();
        const userStr = localStorage.getItem("user");
        if (!token || !userStr) return;
        const user = JSON.parse(userStr);
        const isInstitute =
          user.user_type === "institute" || user.user_type === "institution";
        const endpoint = isInstitute
          ? "/profile/get-profile-institute"
          : "/profile/get-profile-individual";
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.status && result.data && result.data.profile_image) {
          localStorage.setItem("profile_image", result.data.profile_image);
          setProfileImage(getFullImageUrl(result.data.profile_image));
        }
      } catch (error) {
        console.error("Failed to sync image from DB:", error);
      }
    };
    loadImageFromStorage();
    syncImageFromDB();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadImageFromStorage();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileImageUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileImageUpdated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    loadImageFromStorage();
  }, [location.pathname]);

  // ── Fetch All Users for Search ──
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_CONFIG.BASE_URL}/user/get-all-users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const list =
          data.data || data.users || (Array.isArray(data) ? data : []);
        setAllUsers(list);
      } catch (err) {
        console.error("Users fetch error:", err);
      }
    };
    fetchAllUsers();
  }, []);

useEffect(() => {
  const fetchBlockedUsers = async () => {
    try {
      const token = getAuthToken();

      const res = await fetch(
        `${API_CONFIG.BASE_URL}/account/get-blocked-users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.status && Array.isArray(data.data)) {
        const ids = data.data.map((user) => String(user.id));
        setBlockedUserIds(ids);
      }
    } catch (err) {
      console.error("Blocked users fetch error:", err);
    }
  };

  fetchBlockedUsers();
}, []);


  // ✅ Only fetch unread count for bell dot — full data fetched inside NotificationPopup
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/notifications/get-notifications`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (data.status) {
          setUnreadCount(data.unread_count || 0);
        }
      } catch (err) {
        console.error("Unread count fetch error:", err);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Search Handler ──
  const handleSearch = (query) => {
  setSearchQuery(query);

  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  const q = query.toLowerCase();

  const filtered = allUsers.filter((u) => {
    const isBlocked = blockedUserIds.includes(String(u.id));
    if (isBlocked) return false;

    const name =
      u.user_type === "institute"
        ? u.institute_details?.institute_name || u.name || ""
        : u.name || "";

    return name.toLowerCase().includes(q);
  });

  setSearchResults(filtered.slice(0, 8));
};

  // ── Open UserProfile from search result ──
  const handleSearchUserClick = (u) => {
    const name =
      u.user_type === "institute"
        ? u.institute_details?.institute_name || u.name || "Institute"
        : u.name || "User";

    setSelectedSearchUser({
      id: u.id,
      name,
      user_type: u.user_type || "individual",
    });

    setSearchQuery("");
    setSearchResults([]);
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
  };

  const handleProtectedNav = (path) => {
    if (isInstituteBlocked) {
      setShowApprovalModal(true);
      return;
    }
    navigate(path);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const getProfilePath = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userType = (user.user_type || localStorage.getItem("userType") || "")
      .toLowerCase()
      .trim();
    if (userType === "institute" || userType === "institution")
      return "/dashboard/institute-profile";
    return "/dashboard/individual-profile";
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard/publications")) setActiveNav("publications");
    else if (path.includes("/dashboard/library")) setActiveNav("library");
    else if (path.includes("/dashboard/chats")) setActiveNav("chats");
    else if (
      path.includes("/dashboard/events") ||
      path.includes("/dashboard/my-event")
    )
      setActiveNav("events");
    else if (path.includes("/dashboard/board-members"))
      setActiveNav("boardMembers");
    else if (path.includes("-profile")) setActiveNav("profile");
    else if (path.includes("/dashboard/board-review"))
      setActiveNav("boardReview");
    else if (path.includes("/dashboard/settings")) setActiveNav("settings");
    else if (path === "/dashboard" || path === "/dashboard/")
      setActiveNav("home");
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsEventsMenuOpen(false);
  };

 const handleLogout = () => {
  const token = getAuthToken();

  // ✅ Pehle instantly logout
  localStorage.clear();
  sessionStorage.clear();

  setIsProfileOpen(false);
  setIsMobileMenuOpen(false);

  navigate("/login", { replace: true });

  // ✅ API background me call
  if (token) {
    fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch((error) => {
      console.error("Logout API Error:", error);
    });
  }
};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsProfileOpen(false);
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      )
        setIsMobileMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setIsNotifOpen(false);
      if (
        mobileNotifRef.current &&
        !mobileNotifRef.current.contains(event.target)
      )
        setIsMobileNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target))
        setIsSearchFocused(false);
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target)
      )
        setIsMobileSearchFocused(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkBoardMember = async () => {
      try {
        const token = getAuthToken();
        const userEmail = localStorage.getItem("userEmail");
        if (!token) return;
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/research/get-board-member`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const result = await response.json();
        if (result?.status && Array.isArray(result?.data)) {
          const isMember = result.data.some(
            (member) => member.email === userEmail,
          );
          setIsBoardMember(isMember);
        }
      } catch (error) {
        setIsBoardMember(false);
      }
    };
    checkBoardMember();
  }, []);

  // ── Search Dropdown ──
  const SearchDropdown = ({ results }) => {
    if (results.length === 0) return null;
    return (
      <div
        className="
absolute top-full mt-2 left-0 w-full min-w-[260px] rounded-xl shadow-xl overflow-hidden z-[70]

bg-white border border-gray-200
dark:bg-[#111f17] dark:border-[#32ff9920]
"
      >
        {" "}
        {results.map((u) => {
          const name =
            u.user_type === "institute"
              ? u.institute_details?.institute_name || u.name || "Institute"
              : u.name || "User";
          const img =
            u.user_type === "institute"
              ? u.profile_institute_details?.profile_image
              : u.profile_individual_details?.profile_image;
          const imgUrl = img ? `${API_CONFIG.BASE_URL}/${img}` : avatar;
          return (
            <div
              key={u.id}
              onMouseDown={() => handleSearchUserClick(u)}
              className="
flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors

hover:bg-gray-100
dark:hover:bg-[#32ff9910]
"
            >
              <img
                src={imgUrl}
                onError={(e) => {
                  e.target.src = avatar;
                }}
                className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                alt={name}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {u.user_type || "individual"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0a120e] text-slate-100 min-h-[100dvh] overflow-x-hidden">
      {/* HEADER */}
      <header
        className="
    px-6 md:px-10 sticky top-0 z-50 border-b backdrop-blur-xl

    bg-white border-gray-200
    dark:bg-[#13231a] dark:border-[#5bf9aa37]
  "
      >
        {/* Top row */}
        <div className="flex items-center justify-between h-[90px]">
          {" "}
          {/* LOGO */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <Logo />
          </div>
          {/* DESKTOP BUTTONS */}
          <div
            className="hidden md:flex items-center gap-4 relative"
            ref={dropdownRef}
          >
            {/* Desktop Search */}
            <div className="relative" ref={searchRef}>
              <MaterialIcon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search users..."
                className="
    pl-9 pr-4 py-2 rounded-xl text-sm transition-all w-48

    bg-gray-100 text-slate-800 border border-gray-300 placeholder:text-gray-400
    focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20 outline-none

    dark:bg-white/5 dark:text-white dark:border-[#5bf9aa20]
    dark:placeholder:text-slate-500 dark:focus:border-[#32ff99]
  "
              />
              {isSearchFocused && searchResults.length > 0 && (
                <SearchDropdown results={searchResults} />
              )}
            </div>

            <button
              onClick={() => handleProtectedNav("/dashboard/create-post")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
           bg-[#00ff88] text-black hover:scale-105 active:scale-95 transition-all"
            >
              <MaterialIcon name="add" className="text-lg" /> Create Post
            </button>

            <button
              onClick={() => handleProtectedNav("/dashboard/upload-research")}
              className="
  flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all

  bg-[#00ff88] text-black border border-[#00ff88]
  hover:scale-105 active:scale-95

  dark:bg-transparent dark:text-[#32ff99] dark:border-[#32ff99]/40
  dark:hover:bg-[#32ff99]/10
"
            >
              <MaterialIcon name="upload" className="text-lg" />
              Upload Research
            </button>

            {/* Desktop Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-[#32ff99] relative hover:bg-white/5 transition-all"
              >
                <MaterialIcon name="notifications" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a120e]" />
                )}
              </button>
              {/* ✅ NotificationPopup — alag file se import */}
              {isNotifOpen && (
                <NotificationPopup
                  onClose={() => {
                    setIsNotifOpen(false);
                    setUnreadCount(0);
                  }}
                />
              )}
            </div>

            <div
              className="h-8 w-px mx-2"
              style={{ backgroundColor: lightGreenBorder }}
            ></div>

            {/* Desktop Profile Dropdown */}
            <div className="relative">
              <img
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full object-cover border-2 cursor-pointer transition-all hover:border-[#32ff99]"
                style={{ borderColor: lightGreenBorder }}
                src={profileImage || avatar}
                onError={(e) => {
                  e.target.src = avatar;
                }}
                alt="User Profile"
              />
              {isProfileOpen && (
                <div
                  className="
absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl overflow-hidden z-50 border

bg-white border-gray-200
dark:bg-[#16291e] dark:border-[#5bf9aa37]
"
                >
                  {" "}
                  <div className="p-5 border-b border-[#5bf9aa15] flex flex-col items-center text-center">
                    <img
                      src={profileImage || avatar}
                      onError={(e) => {
                        e.target.src = avatar;
                      }}
                      className="w-14 h-14 rounded-full border-2 border-[#32ff99] mb-3"
                      alt="avatar"
                    />
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      {userData.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userData.email}
                    </p>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-[#32ff99]/20 text-[#32ff99] px-2 py-0.5 rounded-md border border-[#32ff99]/30">
                        {userData.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => handleNavigation(getProfilePath())}
                      className="
      w-full flex items-center gap-3 px-4 py-3 rounded-xl 
      
      text-slate-800 hover:bg-gray-100
      transition-colors

      dark:text-slate-300 dark:hover:bg-white/5
    "
                    >
                      <MaterialIcon name="person" className="text-xl" />
                      <span className="text-sm font-medium">My Profile</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="
      w-full flex items-center gap-3 px-4 py-3 rounded-xl 
      
      text-red-500 hover:bg-red-50
      mt-1 transition-colors

      dark:text-red-400 dark:hover:bg-red-500/10
    "
                    >
                      <MaterialIcon name="logout" className="text-xl" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* MOBILE BUTTONS */}
          <div className="flex md:hidden items-center gap-3 relative">
            <button
              onClick={() => handleProtectedNav("/dashboard/create-post")}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[#32ff99] hover:bg-white/5 transition-all"
              title="Create Post"
            >
              <MaterialIcon name="add" className="text-xl" />
            </button>

            <button
              onClick={() => handleProtectedNav("/dashboard/upload-research")}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[#32ff99] hover:bg-white/5 transition-all"
              title="Upload Research"
            >
              <MaterialIcon name="upload" className="text-xl" />
            </button>

            {/* Mobile Notification Bell */}
            <div className="relative" ref={mobileNotifRef}>
              <button
                onClick={() => setIsMobileNotifOpen(!isMobileNotifOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-[#32ff99] relative hover:bg-white/5 transition-all"
              >
                <MaterialIcon name="notifications" className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a120e]" />
                )}
              </button>
              {/* ✅ NotificationPopup — alag file se import */}
              {isMobileNotifOpen && (
                <NotificationPopup
                  onClose={() => {
                    setIsMobileNotifOpen(false);
                    setUnreadCount(0);
                  }}
                />
              )}
            </div>

            <div
              className="h-6 w-px"
              style={{ backgroundColor: lightGreenBorder }}
            ></div>

            {/* Mobile Profile Menu */}
            <div className="relative" ref={mobileMenuRef}>
              <img
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 rounded-full object-cover border-2 cursor-pointer transition-all hover:border-[#32ff99]"
                style={{ borderColor: lightGreenBorder }}
                src={profileImage || avatar}
                onError={(e) => {
                  e.target.src = avatar;
                }}
                alt="User Profile"
              />
              {isMobileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#16291e] border border-slate-200 dark:border-[#5bf9aa37] rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-200 dark:border-[#5bf9aa15] flex flex-col items-center text-center">
                    <img
                      src={profileImage || avatar}
                      onError={(e) => {
                        e.target.src = avatar;
                      }}
                      className="w-12 h-12 rounded-full border-2 border-[#32ff99] mb-2"
                      alt="avatar"
                    />

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                      {userData.name}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {userData.email}
                    </p>

                    <div className="flex gap-2">
                      <span className="text-[9px] bg-[#32ff99]/15 dark:bg-[#32ff99]/20 text-[#04935a] dark:text-[#32ff99] px-2 py-0.5 rounded-md border border-[#32ff99]/30">
                        {userData.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => handleNavigation(getProfilePath())}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors text-sm"
                    >
                      <MaterialIcon name="person" className="text-lg" />
                      <span>My Profile</span>
                    </button>

                    {isBoardMember && (
                      <button
                        onClick={() =>
                          handleNavigation("/dashboard/board-review")
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#32ff99]/10 text-[#04935a] dark:text-[#32ff99] transition-colors text-sm"
                      >
                        <MaterialIcon name="verified" className="text-lg" />
                        <span>Board Review</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigation("/settings")}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors text-sm"
                    >
                      <MaterialIcon name="settings" className="text-lg" />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400 mt-1 transition-colors text-sm"
                    >
                      <MaterialIcon name="logout" className="text-lg" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="flex md:hidden pb-3 w-full" ref={mobileSearchRef}>
          <div className="relative w-full">
            <MaterialIcon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsMobileSearchFocused(true)}
              placeholder="Search users..."
              className="
    w-full pl-9 pr-4 py-2 rounded-xl text-sm transition-all outline-none

    bg-white text-slate-900 border border-slate-300 placeholder:text-slate-400
    focus:border-[#00b86b] focus:ring-2 focus:ring-[#00b86b]/20

    dark:bg-white/5 dark:text-white dark:border-[#5bf9aa20]
    dark:placeholder:text-slate-500 dark:focus:border-[#32ff99]
  "
            />
            {isMobileSearchFocused && searchResults.length > 0 && (
              <SearchDropdown results={searchResults} />
            )}
          </div>
        </div>
      </header>

      {/* RESPONSIVE LAYOUT */}
      <div className="flex flex-col md:flex-row min-h-[calc(100dvh-90px)]">
        {" "}
        {/* SIDEBAR */}
        <aside
          className="
  hidden md:flex w-64 h-[calc(100vh-80px)] sticky flex-col z-30 border-r

  bg-white border-gray-200
  dark:bg-[#13231a] dark:border-[#5bf9aa37]
  "
        >
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto light-scrollbar">
            <NavButton
              icon="home"
              label="Home"
              isActive={activeNav === "home"}
              onClick={() => handleNavigation("/dashboard")}
            />
            <NavButton
              icon="library_books"
              label="My Publications"
              isActive={activeNav === "publications"}
              onClick={() => handleNavigation("/dashboard/publications")}
            />
            <NavButton
              icon="local_library"
              label="Library"
              isActive={activeNav === "library"}
              onClick={() => handleNavigation("/dashboard/library")}
            />
            <NavButton
              icon="chat"
              label="Chats"
              isActive={activeNav === "chats"}
              onClick={() => handleProtectedNav("/dashboard/chats")}
            />
            {/* NAYA DESKTOP CODE: */}
            <div>
              <div
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  activeNav === "events"
                    ? "bg-[#32ff99]/10 text-[#32ff99] border-l-4 border-[#32ff99]"
                    : "text-slate-600 hover:bg-gray-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
                onClick={() => setIsEventsMenuOpen(!isEventsMenuOpen)}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">event</span>
                  <span className="text-sm font-medium">Events</span>
                </div>
                <span className="material-symbols-outlined text-sm transition-transform">
                  {isEventsMenuOpen ? "expand_less" : "expand_more"}
                </span>
              </div>

              {/* Dropdown Items */}
              {isEventsMenuOpen && (
                <div
                  className="
    ml-4 mt-2 pl-4 border-l flex flex-col gap-1

    border-gray-200
    dark:border-[#32ff99]/20
  "
                >
                  <button
                    onClick={() => handleNavigation("/dashboard/events")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      location.pathname === "/dashboard/events"
                        ? "text-[#32ff99] bg-[#32ff99]/10"
                        : "text-slate-600 hover:text-slate-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      list
                    </span>
                    All Events
                  </button>

                  <button
                    onClick={() => handleNavigation("/dashboard/my-event")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      location.pathname === "/dashboard/my-event"
                        ? "text-[#32ff99] bg-[#32ff99]/10"
                        : "text-slate-600 hover:text-slate-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      person
                    </span>
                    My Events
                  </button>
                </div>
              )}
            </div>{" "}
            <NavButton
              icon="people"
              label="Board Members"
              isActive={activeNav === "boardMembers"}
              onClick={() => handleNavigation("/dashboard/board-members")}
            />
          </nav>
          <div
            className="p-3 mt-auto border-t space-y-2"
            style={{ borderColor: lightGreenBorder }}
          >
            {isBoardMember && (
              <NavButton
                icon="verified"
                label="Board Review"
                isActive={activeNav === "boardReview"}
                onClick={() => handleNavigation("/dashboard/board-review")}
              />
            )}
            <NavButton
              icon="settings"
              label="Settings"
              isActive={activeNav === "settings"}
              onClick={() => handleNavigation("/settings")}
            />
          </div>
        </aside>
        {/* MOBILE BOTTOM NAVIGATION */}
        <div
          className="
  fixed md:hidden bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md

  bg-white/90 border-gray-200
  dark:bg-[#13231a]/95 dark:border-[#5bf9aa37]
  "
        >
          <nav className="flex items-center justify-around h-16">
            <MobileNavButton
              icon="home"
              label="Home"
              isActive={activeNav === "home"}
              onClick={() => handleNavigation("/dashboard")}
            />
            <MobileNavButton
              icon="library_books"
              label="Posts"
              isActive={activeNav === "publications"}
              onClick={() => handleNavigation("/dashboard/publications")}
            />
            <MobileNavButton
              icon="local_library"
              label="Library"
              isActive={activeNav === "library"}
              onClick={() => handleNavigation("/dashboard/library")}
            />
            <MobileNavButton
              icon="chat"
              label="Chats"
              isActive={activeNav === "chats"}
              onClick={() => handleProtectedNav("/dashboard/chats")}
            />
            <MobileNavButton
              icon="people"
              label="Board"
              isActive={activeNav === "boardMembers"}
              onClick={() => handleNavigation("/dashboard/board-members")}
            />
            {/* PURANA: <MobileNavButton icon="event" label="Events" isActive={activeNav === "events"} onClick={() => handleNavigation("/dashboard/events")} /> */}

            {/* NAYA MOBILE POPUP CODE: */}
            <div className="relative flex-1">
              <MobileNavButton
                icon="event"
                label="Events"
                isActive={activeNav === "events"}
                onClick={() => setIsEventsMenuOpen(!isEventsMenuOpen)}
              />

              {isEventsMenuOpen && (
                <div className="absolute bottom-[110%] right-0 bg-[#16291e] border border-[#5bf9aa37] rounded-xl py-2 min-w-[150px] shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50">
                  {" "}
                  <button
                    onClick={() => handleNavigation("/dashboard/events")}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${location.pathname === "/dashboard/events" ? "text-[#32ff99]" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      list
                    </span>
                    All Events
                  </button>
                  <button
                    onClick={() => handleNavigation("/dashboard/my-event")}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${location.pathname === "/dashboard/my-event" ? "text-[#32ff99]" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      person
                    </span>
                    My Events
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
        {/* MAIN CONTENT */}
        <main
          className="
flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 h-[calc(100dvh-90px)]
bg-slate-50
dark:bg-transparent
"
        >
          {" "}
          {isInstituteBlocked && (
            <div className="mb-4 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-yellow-400 text-xl shrink-0">
                hourglass_top
              </span>
              <p className="text-yellow-300 text-xs sm:text-sm font-medium leading-relaxed">
                Your institute account is{" "}
                <span className="font-bold">pending admin approval</span>.
                Posting, uploading research, and chatting will be enabled once
                approved.
              </p>
            </div>
          )}
          {children ? children : <Outlet />}
        </main>
      </div>

      {/* APPROVAL MODAL */}
      {showApprovalModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center 
    bg-black/50 dark:bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setShowApprovalModal(false)}
        >
          <div
            className="
      bg-white text-slate-800
      dark:bg-[#0d1f16] dark:text-white

      border border-slate-200
      dark:border-[#00ff88]/20

      rounded-2xl p-6 sm:p-8 w-full max-w-[420px] shadow-2xl text-center
      "
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="
        w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5

        bg-yellow-100 border border-yellow-300
        dark:bg-yellow-500/10 dark:border-yellow-500/30
        "
            >
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-3xl">
                hourglass_top
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Approval Pending
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-2">
              Your institute account is currently under review by our admin
              team.
            </p>

            <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed mb-5">
              Once approved, you'll be able to{" "}
              <span className="text-slate-900 dark:text-white font-medium">
                create posts
              </span>
              ,{" "}
              <span className="text-slate-900 dark:text-white font-medium">
                upload research
              </span>
              , and{" "}
              <span className="text-slate-900 dark:text-white font-medium">
                chat
              </span>{" "}
              with other users.
            </p>

            <div
              className="
        rounded-xl px-4 py-3 mb-6 flex items-center justify-center gap-2

        bg-yellow-50 border border-yellow-200
        dark:bg-yellow-500/10 dark:border-yellow-500/20
        "
            >
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">
                schedule
              </span>

              <span className="text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider">
                Status: Awaiting Admin Approval
              </span>
            </div>

            <button
              onClick={() => setShowApprovalModal(false)}
              className="
        w-full py-3 rounded-xl font-bold text-sm transition-all

        bg-slate-100 text-slate-800 border border-slate-300
        hover:bg-slate-200

        dark:bg-[#1a2f22] dark:border-[#00ff88]/20 dark:text-[#00ff88]
        dark:hover:bg-[#00ff88]/10
        "
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ✅ UserProfile Modal */}
      {selectedSearchUser && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-6 md:p-8"
          style={{ zIndex: 9999 }}
          onClick={() => setSelectedSearchUser(null)}
        >
          <div
            className="w-full max-w-5xl h-[95vh] sm:h-[85vh] bg-[#0d0f0e] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.1)] border border-[#00ff88]/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <UserProfile
              user={selectedSearchUser}
              onClose={() => setSelectedSearchUser(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive
        ? "bg-[#00ff88]/10 text-[#00ff88] border-l-4 border-[#00ff88]"
        : "text-slate-600 hover:bg-gray-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
    }`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const MobileNavButton = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-all flex-1 min-w-0 ${
      isActive ? "text-[#32ff99]" : "text-slate-400"
    }`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
    <span className="text-[9px] font-medium truncate w-full text-center">
      {label}
    </span>
  </button>
);

export default DashboardLayout;
