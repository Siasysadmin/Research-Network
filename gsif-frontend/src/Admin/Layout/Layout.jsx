import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo";
import avatar from "../../assets/images/avatar.jpg"
import axios from "axios";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const HeaderNav = ({ user, toggleSidebar, isSidebarOpen }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate("/admin/create-event");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
  setLoggingOut(true);
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "https://sasedge.org/research-network/back-end/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.clear();
    navigate("/login");
  } catch (error) {
    localStorage.clear();
    navigate("/login");
  } finally {
    setLoggingOut(false);
  }
};
  const handleSettings = () => {
    navigate("/admin/settings");
    setIsMobileMenuOpen(false);
  };

  const handleProfile = () => {
  navigate("/admin/profile");
  setIsProfileOpen(false);
};

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#13231a] border-b border-[#1e3a2c] flex items-center justify-between px-4 md:px-6 z-[100]">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-[#00ff88] transition-colors"
          aria-label="Toggle sidebar"
        >
          <MaterialIcon
            name={isSidebarOpen ? "close" : "menu"}
            className="text-2xl"
          />
        </button>

        <Logo />
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={handleCreateEvent}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="hidden sm:flex items-center gap-2 bg-[#00ff88] hover:bg-[#00dd77] text-[#0a120e] px-3 md:px-4 py-1.5 rounded-lg font-bold text-xs md:text-sm transition-all shadow-[0_0_20px_-5px_rgba(0,255,136,0.3)] hover:scale-[1.02]"
        >
          <MaterialIcon
            name="add_circle"
            className={`text-lg md:text-xl transition-transform duration-300 ${isButtonHovered ? "rotate-90" : ""}`}
          />
          <span className="hidden xs:inline">Create Event</span>
        </button>

        <button className="relative p-1 text-slate-400 hover:text-[#00ff88] transition-colors">
          <MaterialIcon name="notifications" className="text-xl md:text-2xl" />
        </button>

        <div className="flex items-center gap-2 md:gap-3 border-l border-[#1e3a2c] pl-3 md:pl-6">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
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
  onClick={() => setIsProfileOpen(!isProfileOpen)}
/>
        </div>
      </div>

     {isProfileOpen && (
  <div className="absolute top-16 right-4 bg-[#13231a] border border-[#1e3a2c] rounded-lg shadow-lg p-2 w-48 z-50">
    
    <div className="border-b border-[#1e3a2c] pb-2 mb-2">
      <p className="text-sm font-bold text-white">
        {user?.name || "User Name"}
      </p>
      <p className="text-xs text-[#00ff88]">
        {user?.role || "ADMIN"}
      </p>
    </div>

    <button
      onClick={handleProfile}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    >
      <MaterialIcon name="person" className="text-lg" />
      <span>My Profile</span>
    </button>

    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    >
      <MaterialIcon name="logout" className="text-lg" />
      <span>Logout</span>
    </button>
  </div>
)}
    </header>
  );
};

const Sidebar = ({ activeNav, setActiveNav, isOpen, onClose }) => {
  const [isUserAppsOpen, setIsUserAppsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && !sidebar.contains(e.target)) {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed left-0 top-16 bottom-0 w-64 lg:w-61 bg-[#13231a] border-r border-[#1e3a2c] flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="flex-1 px-2 md:px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={handleHomeClick}
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
              activeNav === "home"
                ? "bg-[#00ff88]/10 text-[#00ff88] border-l-4 border-[#00ff88]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MaterialIcon name="home" className="text-m" />
            <span className="text-sm font-medium">Home</span>
          </button>

          <button
            onClick={() => handleNavigation("/admin/board-members", "board")}
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
              activeNav === "board"
                ? "bg-[#00ff88]/10 text-[#00ff88] border-l-4 border-[#00ff88]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MaterialIcon name="groups" className="text-m" />
            <span className="text-sm font-medium">Board Members</span>
          </button>
          <div>
            <button
              onClick={() => setIsUserAppsOpen(!isUserAppsOpen)}
              className={`w-full flex items-center justify-between gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
                activeNav === "users"
                  ? "bg-[#00ff88]/10 text-[#00ff88] border-l-4 border-[#00ff88]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <MaterialIcon name="person_add" className="text-m" />
                <span className="text-sm font-medium">User Applications</span>
              </div>
              <MaterialIcon
                name={`expand_${isUserAppsOpen ? "less" : "more"}`}
                className="text-lg transition-transform"
              />
            </button>

            {isUserAppsOpen && (
              <div className="mt-1 ml-8 md:ml-11 space-y-1 animate-slideDown">
                <button
                  onClick={() => handleUserAppClick("individual")}
                  className="w-full text-left px-3 md:px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="person" className="text-m" />
                    <span>Individual Applications</span>
                  </div>
                </button>

                <button
                  onClick={() => handleUserAppClick("institute")}
                  className="w-full text-left px-3 md:px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all"
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
            onClick={() =>
              handleNavigation("/admin/research-upload-requests", "research")
            }
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
              activeNav === "research"
                ? "bg-[#00ff88]/10 text-[#00ff88] border-l-4 border-[#00ff88]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MaterialIcon name="menu_book" className="text-m" />
            <span className="text-sm font-medium">Research Applications</span>
          </button>
          <button
            onClick={() =>
              handleNavigation("/admin/chat", "chats")
            }
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
              activeNav === "chats"
                ? "bg-[#00ff88]/10 text-[#00ff88] border-l-4 border-[#00ff88]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MaterialIcon name="chat" className="text-m" />
            <span className="text-sm font-medium">Chats</span>
          </button>
          <button
            onClick={() =>
              handleNavigation("/admin/save", "save")
            }
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
              activeNav === "save"
                ? "bg-[#00ff88]/10 text-[#00ff88] border-l-4 border-[#00ff88]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MaterialIcon name="bookmark" className="text-m" />
            <span className="text-sm font-medium">Save</span>
          </button>
          <button
            onClick={() =>
              handleNavigation("/admin/events", "events")
            }
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
              activeNav === "events"
                ? "bg-[#00ff88]/10 text-[#00ff88] border-l-4 border-[#00ff88]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MaterialIcon name="event" className="text-m" />
            <span className="text-sm font-medium">Events</span>
          </button>
        </nav>

       
      </aside>
    </>
  );
};

const Layout = ({ children, activeNav, setActiveNav }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

const [user, setUser] = useState(null);

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
    /* Fix 1: Added h-screen and overflow-hidden to main wrapper */
    <div className="h-screen overflow-hidden bg-[#0a120e] text-slate-100 antialiased flex flex-col">
      <HeaderNav
        user={user}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Fix 2: Added flex-1 and overflow-hidden to main tag */}
        <main
          className={`${mainMargin} flex-1 overflow-hidden transition-all duration-300`}
        >
          {/* Fix 3: This div now handles the scrolling for all pages */}
          <div className="h-full overflow-y-auto custom-scrollbar px-4 md:px-6 pt-2 pb-6">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body { 
          font-family: 'Inter', sans-serif; 
          background-color: #0a120e; 
          margin: 0; 
          padding: 0; 
          overflow: hidden; /* Added to ensure body never scrolls */
        }

        .custom-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: #0a120e; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #1e3a2c; 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: #00ff88; 
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        @media (min-width: 320px) {
          .xs\\:inline { display: inline; }
        }

        @media (max-width: 768px) {
          button { min-height: 44px; }
        }
      `}</style>
    </div>
  );
};

export { MaterialIcon, HeaderNav, Sidebar, Layout };
export default Layout;