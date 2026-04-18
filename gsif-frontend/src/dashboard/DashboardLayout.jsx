import React, { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/Logo";
import avatar from "../assets/images/avatar.jpg";
import API_CONFIG from "../config/api.config";

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

  const [activeNav, setActiveNav] = useState("home");
  const [isBoardMember, setIsBoardMember] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isInstituteBlocked, setIsInstituteBlocked] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileNotifOpen, setIsMobileNotifOpen] = useState(false);

  const getAuthToken = () => {
    return (
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token")
    );
  };

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path;
    if (path.startsWith('/')) return `${API_CONFIG.BASE_URL}${path}`;
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
            }
          );

          const result = await response.json();
          console.log("Institute status API response:", result);

          if (result.status && result.data) {
            const freshStatus = String(
              result.data.institute_status ??
              result.data.status ??
              "1"
            );

            console.log("Fresh institute_status from API:", freshStatus);

            const updatedUser = { ...user, institute_status: freshStatus };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setIsInstituteBlocked(freshStatus !== "2");
          } else {
            const localStatus = String(user.institute_status ?? "1");
            setIsInstituteBlocked(localStatus !== "2");
          }
        } catch (apiErr) {
          console.error("Institute status API error:", apiErr);
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
        const isInstitute = user.user_type === "institute" || user.user_type === "institution";
        const endpoint = isInstitute ? "/profile/get-profile-institute" : "/profile/get-profile-individual";

        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
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

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileImageUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileImageUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    loadImageFromStorage();
  }, [location.pathname]);

  // ✅ NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/notifications/get-notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        setNotifications(data.data || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error("Notif fetch error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = getAuthToken();
      await fetch(`${API_CONFIG.BASE_URL}/notifications/mark-all-as-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: "1" })));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleProtectedNav = (path) => {
      if (isInstituteBlocked) {
        setShowApprovalModal(true);
        return;
      }
      navigate(path);
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
    };
  }, []);

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

    if (userType === "institute" || userType === "institution") {
      return "/dashboard/institute-profile";
    }

    return "/dashboard/individual-profile";
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard/publications")) setActiveNav("publications");
    else if (path.includes("/dashboard/library")) setActiveNav("library");
    else if (path.includes("/dashboard/chats")) setActiveNav("chats");
    else if (path.includes("/dashboard/events")) setActiveNav("events");
    else if (path.includes("-profile")) setActiveNav("profile");
    else if (path.includes("/dashboard/board-review")) setActiveNav("boardReview");
    else if (path.includes("/dashboard/settings")) setActiveNav("settings");
    else if (path === "/dashboard" || path === "/dashboard/") setActiveNav("home");
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = getAuthToken();
      await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (mobileNotifRef.current && !mobileNotifRef.current.contains(event.target)) {
        setIsMobileNotifOpen(false);
      }
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
        const response = await fetch(`${API_CONFIG.BASE_URL}/research/get-board-member`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result?.status && Array.isArray(result?.data)) {
          const isMember = result.data.some(member => member.email === userEmail);
          setIsBoardMember(isMember);
        }
      } catch (error) {
        setIsBoardMember(false);
      }
    };
    checkBoardMember();
  }, []);

  // Notification Popup Component (reusable)
  const NotificationPopup = () => (
  <div className="fixed sm:absolute right-2 sm:right-0 top-[80px] sm:top-auto sm:mt-3 w-[calc(100vw-16px)] sm:w-[340px] bg-[#111f17] border border-[#32ff9920] rounded-[18px] shadow-2xl overflow-hidden z-[60]">
    
    {/* Header */}
    <div className="px-[18px] pt-4 pb-[14px] border-b border-[#32ff9914] bg-[#32ff9908]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white tracking-[0.2px]">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-semibold text-[#32ff99] bg-[#32ff9914] border border-[#32ff9926] px-2.5 py-1 rounded-lg hover:bg-[#32ff9925] transition-all"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
     {/* Filter Tabs */}
<div className="flex gap-1.5">
  <button className="text-[11px] font-semibold px-3 py-1 rounded-lg border text-[#32ff99] bg-[#32ff9915] border-[#32ff9930]">
    All
  </button>
</div>
    </div>

    {/* List */}
    <div className="max-h-[480px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a2c transparent" }}>
      {notifications.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-[14px] bg-[#32ff9910] border border-[#32ff9918] flex items-center justify-center">
            <MaterialIcon name="notifications_off" className="text-xl text-[#32ff9960]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-400">All caught up</p>
            <p className="text-[11px] text-slate-600 mt-0.5">No new notifications</p>
          </div>
        </div>
      ) : (
        notifications.map((notif, i) => (
          <div
            key={i}
            onClick={() => {
              if (notif.type === "event") {
                // double quotes ya single quotes dono se name extract karo
                const match = notif.message.match(/[""""]([^""""]+)[""""]/);
                const eventName = match ? match[1].trim() : "";
                setIsNotifOpen(false);
                setIsMobileNotifOpen(false);
                // already /dashboard pe ho tab bhi state update hoga
                navigate("/dashboard", { replace: false, state: { openEventName: eventName } });
              }
            }}
            className={`relative flex items-start gap-3 px-[18px] py-[13px] border-b border-[#32ff9908] hover:bg-[#32ff9907] transition-all cursor-pointer ${
              notif.is_read === "0" ? "bg-[#32ff9906]" : ""
            }`}
          >
            {/* Unread left bar */}
            {notif.is_read === "0" && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#32ff99] rounded-r-sm" />
            )}

            {/* Icon */}
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
              notif.type === "event" ? "bg-[#32ff9915]" :
              notif.type === "research" ? "bg-[#6383ff1e]" :
              "bg-yellow-500/10"
            }`}>
              <MaterialIcon
                name={
                  notif.type === "event" ? "event" :
                  notif.type === "research" ? "menu_book" :
                  "notifications"
                }
                className={`text-[16px] ${
                  notif.type === "event" ? "text-[#32ff99]" :
                  notif.type === "research" ? "text-indigo-400" :
                  "text-yellow-400"
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className={`text-[12px] font-bold truncate ${notif.is_read === "0" ? "text-white" : "text-slate-500"}`}>
                  {notif.title}
                </p>
                <span className="text-[10px] text-slate-600 shrink-0">
                  {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ""}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{notif.message}</p>

              {/* Tag */}
              <span className={`inline-block mt-1.5 text-[9px] font-bold uppercase tracking-[0.5px] px-1.5 py-0.5 rounded-[5px] ${
                notif.type === "event" ? "bg-[#32ff9915] text-[#32ff99]" :
                notif.type === "research" ? "bg-indigo-500/10 text-indigo-400" :
                "bg-yellow-500/10 text-yellow-400"
              }`}>
                {notif.type || "general"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>

  </div>
);

  return (
    <div className="bg-[#0a120e] text-slate-100 min-h-screen overflow-x-hidden">
      {/* HEADER */}
      <header
        className="px-4 md:px-8 flex items-center justify-between sticky top-0 left-0 w-full bg-[#13231a]/80 backdrop-blur-md z-50 border-b"
        style={{ borderColor: lightGreenBorder, height: "80px" }}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <Logo />
        </div>

        {/* DESKTOP BUTTONS */}
        <div className="hidden md:flex items-center gap-4 relative" ref={dropdownRef}>
          <button
            onClick={() => handleProtectedNav("/dashboard/create-post")}
            className="flex items-center gap-2 text-[#32ff99] border border-[#32ff99]/30 hover:border-[#32ff99] px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <MaterialIcon name="add" className="text-lg" /> Create Post
          </button>

          <button
            onClick={() => handleProtectedNav("/dashboard/upload-research")}
            className="flex items-center gap-2 text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_-5px_rgba(50,255,153,0.3)] hover:scale-105 active:scale-95"
            style={{ backgroundColor: lightGreen }}
          >
            <MaterialIcon name="upload" className="text-lg" /> Upload Research
          </button>

          {/* ✅ DESKTOP NOTIFICATION BELL */}
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
            {isNotifOpen && <NotificationPopup />}
          </div>

          <div className="h-8 w-px mx-2" style={{ backgroundColor: lightGreenBorder }}></div>

          {/* DESKTOP PROFILE DROPDOWN */}
          <div className="relative">
            <img
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full object-cover border-2 cursor-pointer transition-all hover:border-[#32ff99]"
              style={{ borderColor: lightGreenBorder }}
              src={profileImage || avatar}
              onError={(e) => { e.target.src = avatar; }}
              alt="User Profile"
            />

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-[#16291e] border border-[#5bf9aa37] rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-5 border-b border-[#5bf9aa15] flex flex-col items-center text-center">
                  <img src={profileImage || avatar} onError={(e) => { e.target.src = avatar; }} className="w-14 h-14 rounded-full border-2 border-[#32ff99] mb-3" alt="avatar" />
                  <h4 className="font-bold text-white leading-tight">{userData.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{userData.email}</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-[#32ff99]/20 text-[#32ff99] px-2 py-0.5 rounded-md border border-[#32ff99]/30">{userData.type}</span>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={() => handleNavigation(getProfilePath())} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
                    <MaterialIcon name="person" className="text-xl" /> <span className="text-sm font-medium">My Profile</span>
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 mt-1 transition-colors">
                    <MaterialIcon name="logout" className="text-xl" /> <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
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

          {/* ✅ MOBILE NOTIFICATION BELL */}
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
            {isMobileNotifOpen && <NotificationPopup />}
          </div>

          <div className="h-6 w-px" style={{ backgroundColor: lightGreenBorder }}></div>

          {/* Mobile Profile Menu */}
          <div className="relative" ref={mobileMenuRef}>
            <img
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-full object-cover border-2 cursor-pointer transition-all hover:border-[#32ff99]"
              style={{ borderColor: lightGreenBorder }}
              src={profileImage || avatar}
              onError={(e) => { e.target.src = avatar; }}
              alt="User Profile"
            />

            {isMobileMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#16291e] border border-[#5bf9aa37] rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-[#5bf9aa15] flex flex-col items-center text-center">
                  <img src={profileImage || avatar} onError={(e) => { e.target.src = avatar; }} className="w-12 h-12 rounded-full border-2 border-[#32ff99] mb-2" alt="avatar" />
                  <h4 className="font-bold text-white text-sm leading-tight">{userData.name}</h4>
                  <p className="text-xs text-slate-400 mb-2">{userData.email}</p>
                  <div className="flex gap-2">
                    <span className="text-[9px] bg-[#32ff99]/20 text-[#32ff99] px-2 py-0.5 rounded-md border border-[#32ff99]/30">{userData.type}</span>
                  </div>
                </div>

                <div className="p-2">
                  <button onClick={() => handleNavigation(getProfilePath())} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors text-sm">
                    <MaterialIcon name="person" className="text-lg" /> <span>My Profile</span>
                  </button>

                  {isBoardMember && (
                    <button onClick={() => handleNavigation("/dashboard/board-review")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-[#32ff99] transition-colors text-sm">
                      <MaterialIcon name="verified" className="text-lg" /> <span>Board Review</span>
                    </button>
                  )}

                  <button onClick={() => handleNavigation("/settings")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors text-sm">
                    <MaterialIcon name="settings" className="text-lg" /> <span>Settings</span>
                  </button>

                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 mt-1 transition-colors text-sm">
                    <MaterialIcon name="logout" className="text-lg" /> <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* RESPONSIVE LAYOUT */}
      <div className="flex flex-col md:flex-row">
        {/* SIDEBAR */}
        <aside
          className="hidden md:flex w-64 border-r bg-[#13231a] h-[calc(100vh-80px)] sticky flex-col z-30"
          style={{ borderColor: lightGreenBorder, top: `${headerHeight}px` }}
        >
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto light-scrollbar">
            <NavButton icon="home" label="Home" isActive={activeNav === "home"} onClick={() => handleNavigation("/dashboard")} />
            <NavButton icon="library_books" label="My Publications" isActive={activeNav === "publications"} onClick={() => handleNavigation("/dashboard/publications")} />
            <NavButton icon="local_library" label="Library" isActive={activeNav === "library"} onClick={() => handleNavigation("/dashboard/library")} />
            <NavButton icon="chat" label="Chats" isActive={activeNav === "chats"} onClick={() => handleProtectedNav("/dashboard/chats")} />
            <NavButton icon="event" label="Events" isActive={activeNav === "events"} onClick={() => handleNavigation("/dashboard/events")} />
          </nav>

          <div className="p-3 mt-auto border-t space-y-2" style={{ borderColor: lightGreenBorder }}>
            {isBoardMember && (
              <NavButton icon="verified" label="Board Review" isActive={activeNav === "boardReview"} onClick={() => handleNavigation("/dashboard/board-review")} />
            )}
            <NavButton icon="settings" label="Settings" isActive={activeNav === "settings"} onClick={() => handleNavigation("/settings")} />
          </div>
        </aside>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="fixed md:hidden bottom-0 left-0 right-0 bg-[#13231a]/95 backdrop-blur-md border-t z-40" style={{ borderColor: lightGreenBorder }}>
          <nav className="flex items-center justify-around h-16">
            <MobileNavButton icon="home" label="Home" isActive={activeNav === "home"} onClick={() => handleNavigation("/dashboard")} />
            <MobileNavButton icon="library_books" label="Posts" isActive={activeNav === "publications"} onClick={() => handleNavigation("/dashboard/publications")} />
            <MobileNavButton icon="local_library" label="Library" isActive={activeNav === "library"} onClick={() => handleNavigation("/dashboard/library")} />
            <MobileNavButton icon="chat" label="Chats" isActive={activeNav === "chats"} onClick={() => handleProtectedNav("/dashboard/chats")} />
            <MobileNavButton icon="event" label="Events" isActive={activeNav === "events"} onClick={() => handleNavigation("/dashboard/events")} />
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 h-[calc(100vh-80px)] light-scrollbar">

          {isInstituteBlocked && (
            <div className="mb-4 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-yellow-400 text-xl shrink-0">
                hourglass_top
              </span>
              <p className="text-yellow-300 text-xs sm:text-sm font-medium leading-relaxed">
                Your institute account is <span className="font-bold">pending admin approval</span>.
                Posting, uploading research, and chatting will be enabled once approved.
              </p>
            </div>
          )}

          {children ? children : <Outlet />}
        </main>
      </div>

      {/* APPROVAL MODAL */}
      {showApprovalModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setShowApprovalModal(false)}
        >
          <div
            className="bg-[#0d1f16] border border-[#00ff88]/20 rounded-2xl p-6 sm:p-8 w-full max-w-[420px] shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-yellow-400 text-3xl">
                hourglass_top
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Approval Pending</h2>

            <p className="text-slate-400 text-sm leading-relaxed mb-2">
              Your institute account is currently under review by our admin team.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed mb-5">
              Once approved, you'll be able to{" "}
              <span className="text-white font-medium">create posts</span>,{" "}
              <span className="text-white font-medium">upload research</span>, and{" "}
              <span className="text-white font-medium">chat</span> with other users.
              This usually takes{" "}
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-6 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-sm">schedule</span>
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">
                Status: Awaiting Admin Approval
              </span>
            </div>

            <button
              onClick={() => setShowApprovalModal(false)}
              className="w-full py-3 rounded-xl bg-[#1a2f22] border border-[#00ff88]/20 text-[#00ff88] font-bold text-sm hover:bg-[#00ff88]/10 transition-all"
            >
              Got it
            </button>
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
      isActive ? "bg-[#32ff99]/10 text-[#32ff99] border-l-4 border-[#32ff99]" : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    <MaterialIcon name={icon} />
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
    <MaterialIcon name={icon} className="text-xl" />
    <span className="text-[9px] font-medium truncate w-full text-center">{label}</span>
  </button>
);

export default DashboardLayout;