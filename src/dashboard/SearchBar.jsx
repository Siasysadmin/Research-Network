import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import API_CONFIG from "../config/api.config";
import avatar from "../assets/images/avatar.jpg";
import SearchOverlay from "./SearchOverlay";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined select-none ${className}`}>{name}</span>
);

// Shared input styling — green accent ONLY on focus/typing, NOT on hover.
// Dark-mode default border is a subtle muted green-gray instead of near-white.
const INPUT_CLASS =
  "w-full h-[44px] pl-11 pr-10 rounded-[14px] text-sm font-medium transition-all duration-200 " +
  "bg-white dark:bg-[#0d0f0e] text-[#191c1e] dark:text-[#e2e3e0] " +
  "placeholder:text-slate-400 dark:placeholder:text-[#5f6f65] " +
  "border border-[#d7ded8] dark:border-[#27322c] " +
  "hover:border-[#bccabf] dark:hover:border-[#34433b] " +
  "focus:outline-none focus:border-[#00b86b] dark:focus:border-[#00ff85] " +
  "focus:ring-2 focus:ring-[#00ff85]/20 " +
  "focus:shadow-[0_0_18px_rgba(0,255,133,0.18)]";

const SearchBar = ({ desktopContainerRef, mobileContainerRef, onUserSelect }) => {
  const searchRootRef = useRef(null);
  const mobileRootRef = useRef(null);
  const overlayRootRef = useRef(null);
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [userResults, setUserResults] = useState([]);
  const [hashtagResults, setHashtagResults] = useState([]);
  const [researchResults, setResearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [targetsReady, setTargetsReady] = useState(false);

  const [inputCoords, setInputCoords] = useState({ top: 0, left: 0, width: 0, headerBottom: 0 });

  const getAuthToken = () => {
    return (
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token")
    );
  };

  const captureCoords = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Find the surrounding header so the overlay backdrop can start BELOW it,
    // keeping the whole top header visible & clickable while search is open.
    const header = el.closest("header");
    const headerBottom = header ? header.getBoundingClientRect().bottom : rect.bottom + 12;
    setInputCoords({ top: rect.top, left: rect.left, width: rect.width, headerBottom });
  };

  const handleDesktopFocus = () => {
    captureCoords(desktopInputRef.current);
    setIsSearchFocused(true);
  };

  const handleMobileFocus = () => {
    captureCoords(mobileInputRef.current);
    setIsMobileSearchFocused(true);
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_CONFIG.BASE_URL}/user/get-all-users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const list = data.data || data.users || (Array.isArray(data) ? data : []);
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
        const res = await fetch(`${API_CONFIG.BASE_URL}/account/get-blocked-users`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
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

  // --- LIVE API FETCH LOGIC ---
  const fetchLiveResults = async (query) => {
    const trimmedQuery = query.trim();
    const token = getAuthToken();

    if (!trimmedQuery || trimmedQuery.length < 2) {
      setHashtagResults([]);
      setResearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const hashtagKeyword = trimmedQuery.startsWith("#") ? trimmedQuery : `#${trimmedQuery}`;

      const [hashtagRes, researchRes] = await Promise.all([
        fetch(`https://sasedge.org/research-network/back-end/post/search-posts-hashtag`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ keyword: hashtagKeyword }),
        }),
        fetch(`https://sasedge.org/research-network/back-end/research/search-research-keyword`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ keyword: trimmedQuery }),
        }),
      ]);

      const hashtagData = await hashtagRes.json();
      const researchData = await researchRes.json();

      setHashtagResults(hashtagData.status && Array.isArray(hashtagData.data) ? hashtagData.data : []);
      setResearchResults(researchData.status && Array.isArray(researchData.data) ? researchData.data : []);
    } catch (err) {
      console.error("Live search api error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchLiveResults(searchQuery);
      } else {
        setHashtagResults([]);
        setResearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

 const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setUserResults([]);
      setHashtagResults([]);
      setResearchResults([]);
      return;
    }

    const cleanQuery = query.startsWith("#") ? query.substring(1) : query;
    const q = cleanQuery.toLowerCase().trim();

    const filteredUsers = allUsers.filter((u) => {
      // 1. Blocked users ko pehle hi filter out kar dein
      const isBlocked = blockedUserIds.includes(String(u.id));
      if (isBlocked) return false;

      const userType = (u.user_type || "").toLowerCase();
      
      // 2. User Type ke mutabik sahi Name extract karein
      let name = "";
      if (userType === "institute" || userType === "institution") {
        name = u.institute_details?.institute_name || u.name || "";
      } else {
        name = u.name || "";
      }

      const email = u.email || "";
      const id = String(u.id || "");
      const registrationId = String(u.registration_id || "");

      // 3. Agar user exact "individual" ya "institute" likhkar filter karna chahe (Spelling typos ke sath)
      if (q === "individual" || q === "indivual") return userType === "individual";
      if (q === "institute" || q === "institution" || q === "innstiute") {
        return userType === "institute" || userType === "institution";
      }

      // 4. Name, Email, ID, Registration ID ya User Type mein se kuch bhi match ho jaye
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        id.includes(q) ||
        registrationId.toLowerCase().includes(q) ||
        userType.includes(q)
      );
    });

    setUserResults(filteredUsers);
  };

  const handleUserClick = (u) => {
    const name =
      u.user_type === "institute"
        ? u.institute_details?.institute_name || u.name || "Institute"
        : u.name || "User";

    if (onUserSelect) {
      onUserSelect({
        id: u.id,
        name,
        user_type: u.user_type || "individual",
      });
    }
  };

  const handleHashtagClick = (post) => {
    alert(`Post Clicked! ID: ${post.id}`);
    clearSearch();
  };

  const handleResearchClick = (res) => {
    if (res.research_file) {
      window.open(`${API_CONFIG.BASE_URL}/${res.research_file}`, "_blank");
    }
    clearSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setUserResults([]);
    setHashtagResults([]);
    setResearchResults([]);
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
  };

  useEffect(() => {
    const ready = Boolean(desktopContainerRef?.current || mobileContainerRef?.current);
    setTargetsReady(ready);
  }, [desktopContainerRef, mobileContainerRef]);

  const showOverlay = isSearchFocused || isMobileSearchFocused;
  const overlayPortalTarget = typeof document !== "undefined" ? document.body : null;

  const overlayPortal =
    showOverlay && overlayPortalTarget
      ? ReactDOM.createPortal(
          <SearchOverlay
            ref={overlayRootRef}
            searchQuery={searchQuery}
            isLoading={isLoading}
            userResults={userResults}
            hashtagResults={hashtagResults}
            researchResults={researchResults}
            clearSearch={clearSearch}
            handleUserClick={handleUserClick}
            handleHashtagClick={handleHashtagClick}
            handleResearchClick={handleResearchClick}
            handleSearch={handleSearch}
            isOpen={showOverlay}
            inputCoords={inputCoords}
          />,
          overlayPortalTarget
        )
      : null;

  return (
    <>
      {overlayPortal}

      {/* 🖥️ Navbar Desktop Search Input — stays interactive + highlighted while overlay is open */}
      {targetsReady && desktopContainerRef?.current &&
        ReactDOM.createPortal(
          <div ref={searchRootRef} className="relative group z-[10001] w-[420px]">
            <MaterialIcon
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#5f6f65] text-[20px] pointer-events-none"
            />
            <input
              ref={desktopInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleDesktopFocus}
              placeholder="Search users, research, tags..."
              className={INPUT_CLASS}
            />
          </div>,
          desktopContainerRef.current
        )}

      {/* 📱 Navbar Mobile Search Input */}
      {targetsReady && mobileContainerRef?.current &&
        ReactDOM.createPortal(
          <div ref={mobileRootRef} className="relative w-full group z-[10001]">
            <MaterialIcon
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#5f6f65] text-[20px] pointer-events-none"
            />
            <input
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleMobileFocus}
              placeholder="Search users, research, tags..."
              className={INPUT_CLASS}
            />
          </div>,
          mobileContainerRef.current
        )}
    </>
  );
};

export default SearchBar;