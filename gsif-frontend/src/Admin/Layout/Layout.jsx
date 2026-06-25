import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo";
import avatar from "../../assets/images/avatar.jpg";
import axios from "axios";
import UserProfile from "../porfile/AdminUserProfile";
import SearchBar from "../../dashboard/SearchBar";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const getNavStyle = (isActive, isDark) => ({
  color: isActive ? "#00ff88" : isDark ? "#94a3b8" : "#334155",
  background: isActive ? "rgba(0,255,136,0.1)" : "transparent",
  borderLeft: isActive ? "4px solid #00ff88" : "4px solid transparent",
});

const handleHover = (e, isActive, isDark) => {
  if (isActive) return;
  e.currentTarget.style.background = isDark ? "#ffffff10" : "#f1f5f9";
  e.currentTarget.style.color = isDark ? "#ffffff" : "#0f172a";
};

const handleLeave = (e, isActive, isDark) => {
  if (isActive) return;
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.color = isDark ? "#94a3b8" : "#334155";
};

const HeaderNav = ({ user, toggleSidebar, isSidebarOpen, isDark }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  // Containers that the shared SearchBar portals its desktop/mobile inputs into.
  const searchDesktopContainerRef = useRef(null);
  const searchMobileContainerRef = useRef(null);

  // Click Outside Wrapper (Profile Menu ke liye)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreateEvent = () => {
    navigate("/admin/create-event");
    setIsMobileMenuOpen(false);
  };

 const handleLogout = async () => {
    // 💡 1. theme ko TRY block se BAHAR nikala taaki FINALLY ise use kar sake
    const currentTheme = localStorage.getItem("theme") || "light"; 

    try {
      // Token nikalen
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      
      // Agar token hai, toh hi backend ko logout request bhejein
      if (token) {
        await fetch("https://sasedge.org/research-network/back-end/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Logout API Error:", error);
    } finally {
      // 💡 2. Local storage ko clear karo
      localStorage.clear();
      
      // 💡 3. Ab 'currentTheme' yahan aaram se milega bina kisi error ke
      localStorage.setItem("theme", currentTheme); 

      // DOM Par theme set karein
      document.documentElement.setAttribute("data-theme", currentTheme);
      if (currentTheme === "dark") {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
      } else {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
      }

      // 💡 4. Ab bina ruke user automatic login page par chala jayega
      window.location.href = "/login";
    }
  };

  const handleLogoutClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await handleLogout();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 md:px-6 z-[100]"
      style={{
        background: isDark ? "#13231a" : "#ffffff",
        borderBottom: isDark ? "1px solid #1e3a2c" : "1px solid #e2e8f0",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:text-[#00ff88] transition-colors"
          aria-label="Toggle sidebar"
          style={{ transform: "translateY(6px)" }}
        >
          <MaterialIcon name={isSidebarOpen ? "close" : "menu"} className="text-2xl" />
        </button>

        <Logo />
      </div>

      {/* Search (rendered into these containers by the shared SearchBar) */}
      <div className="ml-auto mr-4 flex items-center justify-end">
        {/* Desktop Search */}
        <div ref={searchDesktopContainerRef} className="relative hidden md:block" />
        {/* Mobile Search */}
        <div
          ref={searchMobileContainerRef}
          className="relative w-40 sm:w-52 md:hidden"
        />
      </div>

      {/* Main Profile Control Div - ref lagaya taaki pure area ko track kare */}
      <div ref={profileRef} className="relative flex items-center gap-3 md:gap-6">
        <button
          onClick={handleCreateEvent}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="scale-[0.80] md:scale-100 flex items-center gap-2 bg-[#00ff88] hover:bg-[#00dd77] text-[#0a120e] px-3 md:px-4 py-1.5 rounded-lg font-bold text-xs md:text-sm transition-all shadow-[0_0_20px_-5px_rgba(0,255,136,0.3)] hover:scale-[1.02]"
        >
          <MaterialIcon
            name="add_circle"
            className={`text-lg md:text-xl transition-transform duration-300 ${isButtonHovered ? "rotate-90" : ""}`}
          />
          <span className="hidden xs:inline">Create Event</span>
        </button>

        <button
          onClick={() => {
            const newTheme = isDark ? "light" : "dark";
            localStorage.setItem("theme", newTheme);
            document.documentElement.classList.toggle("dark", newTheme === "dark");
            window.location.reload();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-[#1e3a2c] bg-gray-100 dark:bg-[#1a2b21] text-gray-700 dark:text-[#00ff88] hover:scale-105 hover:border-[#00ff88]/40 transition-all duration-300"
        >
          <MaterialIcon name={isDark ? "light_mode" : "dark_mode"} className="text-xl" />
        </button>

        <div className="relative flex items-center gap-2 md:gap-3 border-l border-[#1e3a2c] pl-3 md:pl-6">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold leading-none truncate max-w-[120px]" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
              {user?.name || "User Name"}
            </p>
            <p className="text-[10px] text-[#00ff88] uppercase tracking-widest mt-1">
              {user?.role || "ADMIN"}
            </p>
          </div>
          <div
            className="size-8 md:size-9 rounded-full bg-cover bg-center border-2 border-[#00ff88]/30 cursor-pointer"
            style={{
              backgroundImage: `url('${user?.avatar || avatar}')`,
            }}
            onClick={() => setIsProfileOpen((prev) => !prev)}
          />
        </div>

        {/* Dropdown Profile Menu - Isko wrapper ke andar le liya taaki click-outside track ho ske */}
        {isProfileOpen && (
          <div
            className="absolute top-[56px] right-0 w-72 rounded-3xl overflow-hidden z-[999] animate-slideDown"
            style={{
              background: isDark ? "linear-gradient(180deg,#16271d 0%, #13231a 100%)" : "#ffffff",
              border: isDark ? "1px solid rgba(0,255,136,0.12)" : "1px solid #e2e8f0",
              boxShadow: isDark ? "0 25px 50px -12px rgba(0,0,0,0.45)" : "0 20px 45px rgba(15,23,42,0.12)",
              backdropFilter: "blur(14px)",
            }}
          >
            {/* TOP PROFILE SECTION */}
            <div
              className="px-6 pt-6 pb-5 flex flex-col items-center text-center"
              style={{
                background: isDark ? "#13231a" : "#ffffff",
                borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #edf2f7",
              }}
            >
              <div
                className="w-20 h-20 rounded-full border-4 overflow-hidden"
                style={{
                  borderColor: "rgba(0,255,136,0.55)",
                  boxShadow: "0 0 30px rgba(0,255,136,0.18)",
                }}
              >
                <img src={user?.avatar || avatar} alt="profile" className="w-full h-full object-cover" />
              </div>

              <h3 className="mt-4 text-lg font-bold" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
                {user?.name || "Admin"}
              </h3>

              <p className="text-sm mt-1" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
                {user?.email || "admin@gmail.com"}
              </p>

              <div
                className="mt-3 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  background: "rgba(0,255,136,0.12)",
                  color: "#00ff88",
                  border: "1px solid rgba(0,255,136,0.18)",
                }}
              >
                {user?.role || "ADMIN"}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="p-3">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group"
                style={{
                  color: isDark ? "#cbd5e1" : "#475569",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,59,59,0.12)",
                    color: "#ff4d4f",
                  }}
                >
                  <MaterialIcon name="logout" className="text-[20px]" />
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">Logout</span>
                  <span className="text-xs" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>
                    End your current session
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Shared Search Bar — same component/behavior as DashboardLayout */}
      <SearchBar
        desktopContainerRef={searchDesktopContainerRef}
        mobileContainerRef={searchMobileContainerRef}
        onUserSelect={setSelectedUser}
        isProfileModalOpen={!!selectedUser}
      />

      {showProfile && selectedUser && (
  <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
    <div className="w-full max-w-5xl h-[90vh]">
      <UserProfile
        user={selectedUser}
        onClose={() => setShowProfile(false)}
      />
    </div>
  </div>
)}
    </header>
  );
};

/* Rest of your Sidebar and Layout Component remains exactly the same */
const Sidebar = ({ activeNav, setActiveNav, isOpen, onClose, isDark }) => {
  const [isUserAppsOpen, setIsUserAppsOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path, navItem) => {
    setActiveNav(navItem);
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleHomeClick = () => {
    handleNavigation("/admin", "home");
  };

  const handleUserAppClick = (type) => {
    setActiveNav("users");
    setIsUserAppsOpen(false);
    if (type === "institute" || type === "admin/institute-applications") {
      handleNavigation("/admin/institute-applications", "users");
    } else if (type === "individual") {
      handleNavigation("/admin/individual-applications", "users");
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        id="sidebar"
        className={`fixed left-0 top-16 bottom-0 w-64 lg:w-61 flex flex-col z-[50] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: isDark ? "#13231a" : "#ffffff",
          borderRight: isDark ? "1px solid #1e3a2c" : "1px solid #e2e8f0",
        }}
      >
        <nav className="flex-1 px-2 md:px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={handleHomeClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all"
            style={getNavStyle(activeNav === "home", isDark)}
            onMouseEnter={(e) => handleHover(e, activeNav === "home", isDark)}
            onMouseLeave={(e) => handleLeave(e, activeNav === "home", isDark)}
          >
            <MaterialIcon name="home" className="text-m" />
            <span className="text-sm font-medium">Home</span>
          </button>

          <button
            onClick={() => handleNavigation("/admin/board-members", "board")}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all"
            style={getNavStyle(activeNav === "board", isDark)}
            onMouseEnter={(e) => handleHover(e, activeNav === "board", isDark)}
            onMouseLeave={(e) => handleLeave(e, activeNav === "board", isDark)}
          >
            <MaterialIcon name="groups" className="text-m" />
            <span className="text-sm font-medium">Board Members</span>
          </button>

          <div>
            <button
              onClick={() => setIsUserAppsOpen(!isUserAppsOpen)}
              className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all"
              style={getNavStyle(activeNav === "users", isDark)}
              onMouseEnter={(e) => handleHover(e, activeNav === "users", isDark)}
              onMouseLeave={(e) => handleLeave(e, activeNav === "users", isDark)}
            >
              <div className="flex items-center gap-3">
                <MaterialIcon name="person_add" className="text-m" />
                <span className="text-sm font-medium">User Applications</span>
              </div>
              <MaterialIcon name={`expand_${isUserAppsOpen ? "less" : "more"}`} className="text-lg transition-transform" />
            </button>

            {isUserAppsOpen && (
              <div className="mt-1 ml-8 md:ml-11 space-y-1 animate-slideDown">
                <button
                  onClick={() => handleUserAppClick("individual")}
                  className="w-full text-left px-3 md:px-4 py-2 rounded-lg text-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="person" className="text-m" />
                    <span>Individual Applications</span>
                  </div>
                </button>

                <button
                  onClick={() => handleUserAppClick("institute")}
                  className="w-full text-left px-3 md:px-4 py-2 rounded-lg text-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="business" className="text-m" />
                    <span>Institute Applications</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavigation("/admin/research-upload-requests", "research")}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all"
            style={getNavStyle(activeNav === "research", isDark)}
            onMouseEnter={(e) => handleHover(e, activeNav === "research", isDark)}
            onMouseLeave={(e) => handleLeave(e, activeNav === "research", isDark)}
          >
            <MaterialIcon name="menu_book" className="text-m" />
            <span className="text-sm font-medium">Research Applications</span>
          </button>

          <button
            onClick={() => handleNavigation("/admin/chat", "chats")}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all"
            style={getNavStyle(activeNav === "chats", isDark)}
            onMouseEnter={(e) => handleHover(e, activeNav === "chats", isDark)}
            onMouseLeave={(e) => handleLeave(e, activeNav === "chats", isDark)}
          >
            <MaterialIcon name="chat" className="text-m" />
            <span className="text-sm font-medium">Chats</span>
          </button>

          <button
            onClick={() => handleNavigation("/admin/save", "save")}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all"
            style={getNavStyle(activeNav === "save", isDark)}
            onMouseEnter={(e) => handleHover(e, activeNav === "save", isDark)}
            onMouseLeave={(e) => handleLeave(e, activeNav === "save", isDark)}
          >
            <MaterialIcon name="bookmark" className="text-m" />
            <span className="text-sm font-medium">Save</span>
          </button>

          <div>
            <button
              onClick={() => setIsEventsOpen(!isEventsOpen)}
              className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all"
              style={getNavStyle(activeNav === "events", isDark)}
              onMouseEnter={(e) => handleHover(e, activeNav === "events", isDark)}
              onMouseLeave={(e) => handleLeave(e, activeNav === "events", isDark)}
            >
              <div className="flex items-center gap-3">
                <MaterialIcon name="event" className="text-m" />
                <span className="text-sm font-medium">Events</span>
              </div>
              <MaterialIcon name={`expand_${isEventsOpen ? "less" : "more"}`} className="text-lg transition-transform" />
            </button>

            {isEventsOpen && (
              <div className="mt-1 ml-8 md:ml-11 space-y-1 animate-slideDown">
                <button
                  onClick={() => handleNavigation("/admin/events", "events")}
                  className="w-full text-left px-3 md:px-4 py-2 rounded-lg text-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="event_note" className="text-m" />
                    <span>My Events</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigation("/admin/event-approvals", "events")}
                  className="w-full text-left px-3 md:px-4 py-2 rounded-lg text-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="how_to_reg" className="text-m" />
                    <span>User Events</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

const Layout = ({ children, activeNav, setActiveNav }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDark(savedTheme === "dark");
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const mainMargin = windowWidth >= 1024 ? "lg:pl-64" : "pl-0";

  return (
    <div
      className="h-screen overflow-hidden antialiased flex flex-col"
      style={{
        background: isDark ? "#0a120e" : "#f8fafc",
        color: isDark ? "#f1f5f9" : "#0f172a",
      }}
    >
      <HeaderNav user={user} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isDark={isDark} />

      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isDark={isDark} />
        <main className={`${mainMargin} flex-1 overflow-hidden transition-all duration-300`}>
          <div className="h-full overflow-y-auto custom-scrollbar px-4 md:px-6 pt-2 pb-6">{children}</div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #0a120e; margin: 0; padding: 0; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a120e; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e3a2c; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00ff88; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
        @media (min-width: 320px) { .xs\\:inline { display: inline; } }
        @media (max-width: 768px) { button { min-height: 44px; } }
      `}</style>
    </div>
  );
};

export { MaterialIcon, HeaderNav, Sidebar, Layout };
export default Layout;