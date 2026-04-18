import React, { useState, useEffect } from "react";
import {
  User,
  Bell,
  Ban,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Lock,
  Laptop,
  ShieldCheck,
  Search,
  Mail,
  Globe,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api.config";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [mobileShowContent, setMobileShowContent] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [webNotif, setWebNotif] = useState(false);
  const [eventNotif, setEventNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);

  // ── Blocked Users State ──
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [blockedError, setBlockedError] = useState("");
  const [unblockingId, setUnblockingId] = useState(null);

  // ── Change Password State ──
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwData, setPwData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPass, setShowPass] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" });
  const [pwLoading, setPwLoading] = useState(false);

  // ── Delete Account State ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState({ text: "", type: "" });

  // ── Logout State ──
  const [logoutLoading, setLogoutLoading] = useState(false);

  const navigate = useNavigate();

  // ── Helper: Get Auth Token ──
  const getAuthToken = () => {
    return localStorage.getItem("token") || "";
  };

  // ── Helper: Clear Auth Data ──
  const clearAuthData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log("Storage cleared successfully");
    } catch (err) {
      console.error("Error clearing storage:", err);
    }
  };

  // ── Password Visibility Toggle ──
  const togglePassVisibility = (field) => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePwInput = (e) => {
    const { name, value } = e.target;
    setPwData((prev) => ({ ...prev, [name]: value }));
    if (pwMsg.text) setPwMsg({ text: "", type: "" });
  };

  const cancelPwForm = () => {
    setShowPwForm(false);
    setPwData({ old_password: "", new_password: "", confirm_password: "" });
    setShowPass({ old_password: false, new_password: false, confirm_password: false });
    setPwMsg({ text: "", type: "" });
  };

  // ── Blocked User Display Helper (Shows Institute Name for Institutes) ──
  const getBlockedUserDisplay = (user) => {
    // For institute type, show institute name instead of representative name
    if (user.user_type === "institute") {
      // Check both possible locations for institute name
      const instituteName = user.institute_details?.institute_name || 
                           user.profile_institute_details?.institute_name ||
                           user.name; // fallback to name if institute name not found
      return instituteName;
    }
    // For individual users, show their name
    return user.name || "User";
  };

  // ── Blocked User Profile Image Helper (updated to handle institute images) ──
  const getBlockedUserImage = (user) => {
    if (user.user_type === "institute") {
      // Try to get institute logo/image
      if (user.institute_details?.logo_image) {
        return `${API_CONFIG.BASE_URL}/${user.institute_details.logo_image}`;
      }
      if (user.profile_institute_details?.profile_image) {
        return `${API_CONFIG.BASE_URL}/${user.profile_institute_details.profile_image}`;
      }
      if (user.institute_details?.profile_image) {
        return `${API_CONFIG.BASE_URL}/${user.institute_details.profile_image}`;
      }
    }
    if (user.user_type === "individual" && user.profile_indivisual_details?.profile_image) {
      return `${API_CONFIG.BASE_URL}/${user.profile_indivisual_details.profile_image}`;
    }
    return null;
  };

  // ── Get Initials for Avatar (updated to handle institute names) ──
  const getUserInitials = (user) => {
    const displayName = getBlockedUserDisplay(user);
    if (!displayName) return "?";
    
    // For institute names, take first two characters or first letter of each word
    if (user.user_type === "institute") {
      // If it's an institute name, try to get first letter of first two words
      const words = displayName.split(" ").filter(w => w.length > 0);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    
    // For individual users, get first letter of first two names
    return displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  // ── Get Secondary Info for Blocked User ──
  const getSecondaryInfo = (user) => {
    const info = [];
    
    // Add registration ID if exists
    if (user.registration_id) {
      info.push(user.registration_id);
    }
    
    // For institutes, show "Institute" as type
    if (user.user_type === "institute") {
      info.push("Institute");
    } else if (user.user_type === "individual") {
      info.push("Individual");
    } else if (user.user_type) {
      info.push(user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1));
    }
    
    return info.join(" · ");
  };

  // ── Fetch Blocked Users API ──
  const fetchBlockedUsers = async () => {
    setBlockedLoading(true);
    setBlockedError("");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/account/get-blocked-users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.status) {
        setBlockedUsers(data.data || []);
      } else {
        setBlockedError(data.message || "Failed to load blocked users");
      }
    } catch (err) {
      setBlockedError("Network error. Please try again.");
    } finally {
      setBlockedLoading(false);
    }
  };

  // ── Unblock User API (same block-unblock-user endpoint) ──
  const handleUnblock = async (userId) => {
    setUnblockingId(userId);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/account/block-unblock-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: String(userId) }),
      });
      const data = await res.json();
      // user_status: 1 = unblocked, user_status: 2 = blocked
      if (data.status && data.user_status === 1) {
        setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      } else if (data.status) {
        // fallback: agar user_status na mile toh bhi list se hata do
        setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error("Unblock error:", err);
    } finally {
      setUnblockingId(null);
    }
  };

  // ── Change Password API ──
  const handleChangePw = async () => {
    const { old_password, new_password, confirm_password } = pwData;

    if (!old_password || !new_password || !confirm_password) {
      return setPwMsg({ text: "Please fill all fields", type: "error" });
    }
    if (new_password !== confirm_password) {
      return setPwMsg({ text: "New passwords do not match", type: "error" });
    }
    if (new_password.length < 6) {
      return setPwMsg({ text: "Password must be at least 6 characters", type: "error" });
    }

    setPwLoading(true);
    setPwMsg({ text: "", type: "" });

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/account/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ old_password, new_password, confirm_password }),
      });

      const data = await res.json();

      if (data.status) {
        setPwMsg({ text: data.message || "Password changed successfully!", type: "success" });
        setTimeout(() => cancelPwForm(), 2000);
      } else {
        setPwMsg({ text: data.message || "Something went wrong", type: "error" });
      }
    } catch (err) {
      setPwMsg({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setPwLoading(false);
    }
  };

  // ── Logout API ──
  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      clearAuthData();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      clearAuthData();
      navigate("/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  // ── Delete Account API ──
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteMsg({ text: "", type: "" });

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/account/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (data.status) {
        setDeleteMsg({ text: data.message || "Account deleted permanently", type: "success" });
        setTimeout(() => {
          clearAuthData();
          navigate("/login");
        }, 2000);
      } else {
        setDeleteMsg({ text: data.message || "Failed to delete account", type: "error" });
        setTimeout(() => {
          setShowDeleteConfirm(false);
          setDeleteMsg({ text: "", type: "" });
        }, 2000);
      }
    } catch (err) {
      console.error("Delete account error:", err);
      setDeleteMsg({ text: "Network error. Please try again.", type: "error" });
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setDeleteMsg({ text: "", type: "" });
      }, 2000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const menu = [
    { id: "account",        label: "Account",          icon: <User size={18} /> },
    { id: "notifications",  label: "Notifications",    icon: <Bell size={18} /> },
    { divider: true },
    { id: "blocked",        label: "Blocked Users",    icon: <Ban size={18} /> },
    { id: "legal",          label: "Legal & Policies", icon: <FileText size={18} /> },
    { id: "support",        label: "Help & Support",   icon: <HelpCircle size={18} /> },
    { divider: true },
    { id: "accountControl", label: "Account Control",  icon: <LogOut size={18} /> },
  ];

  // ── Fetch blocked users jab tab switch ho ──
  useEffect(() => {
    if (activeTab === "blocked") {
      fetchBlockedUsers();
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen font-sans overflow-x-hidden" style={{ background: "#000000", color: "#e6fff5" }}>

      {/* ── Sidebar ── */}
      <div
        className={`${mobileShowContent ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-60 md:flex-shrink-0 px-4 py-6 gap-1`}
        style={{ background: "#0a1a12", borderRight: "1px solid #1a3d2b" }}
      >
        <p
          className="text-xs font-black uppercase tracking-[0.2em] px-3 pb-4"
          style={{ color: "#00ffae" }}
        >
          Settings
        </p>

        {menu.map((item, i) => {
          if (item.divider) {
            return <div key={i} className="my-2 mx-2 h-px" style={{ background: "#1a3d2b" }} />;
          }
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileShowContent(true);
                if (item.id !== "account") setShowPwForm(false);
              }}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer"
              style={{
                background: isActive ? "#0d2e1f" : "transparent",
                color: isActive ? "#00ffae" : "#6b9e82",
                fontWeight: 600,
                borderLeft: isActive ? "2px solid #00ffae" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#0d2e1f";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6b9e82";
                }
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div
        className={`${!mobileShowContent ? 'hidden md:block' : 'block'} flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-5 md:py-8`}
        style={{ background: "#000000" }}
      >
        {/* Mobile back button */}
        <button
          className="md:hidden flex items-center gap-2 text-sm font-semibold mb-5"
          style={{ color: "#00ffae", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setMobileShowContent(false)}
        >
          ← Back
        </button>
        <div className="max-w-2xl">

          {/* ══════════ ACCOUNT TAB ══════════ */}
          {activeTab === "account" && (
            <div>
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black" style={{ color: "#00ffae" }}>Account</h2>
                  <p className="text-sm mt-1" style={{ color: "#6b9e82" }}>Manage your profile and login details</p>
                </div>
              </div>

              <div
                className="rounded-xl"
                style={{ background: "#060f0a", border: "1px solid #1a3d2b" }}
              >
                <div className="flex items-center justify-between py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "#0d2e1f", border: "1px solid #1a3d2b" }}
                    >
                      <Lock size={16} style={{ color: "#00ffae" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#ffffff" }}>Password</p>
                      <p className="text-xs mt-0.5" style={{ color: "#6b9e82" }}>Last changed 3 months ago</p>
                    </div>
                  </div>
                  {!showPwForm && (
                    <button
                      onClick={() => setShowPwForm(true)}
                      className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-150 active:scale-95"
                      style={{ background: "#0d2e1f", border: "1px solid #00ffae", color: "#00ffae" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#00ffae25")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#0d2e1f")}
                    >
                      Change
                    </button>
                  )}
                </div>

                {showPwForm && (
                  <div className="px-4 pb-4" style={{ borderTop: "1px solid #1a3d2b" }}>
                    <div className="pt-4 flex flex-col gap-3">
                      {[
                        { name: "old_password",     label: "Old Password",         placeholder: "Enter current password" },
                        { name: "new_password",     label: "New Password",         placeholder: "Enter new password" },
                        { name: "confirm_password", label: "Confirm New Password", placeholder: "Re-enter new password" },
                      ].map(({ name, label, placeholder }) => (
                        <div key={name}>
                          <p className="text-xs mb-1.5" style={{ color: "#6b9e82" }}>{label}</p>
                          <div className="relative">
                            <input
                              type={showPass[name] ? "text" : "password"}
                              name={name}
                              value={pwData[name]}
                              onChange={handlePwInput}
                              placeholder={placeholder}
                              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none pr-10"
                              style={{
                                background: "#0d2e1f",
                                border: "1px solid #1a3d2b",
                                color: "#ffffff",
                              }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "#00ffae66")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "#1a3d2b")}
                            />
                            <button
                              type="button"
                              onClick={() => togglePassVisibility(name)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: "#3a6b50", background: "none", border: "none", cursor: "pointer" }}
                            >
                              {showPass[name] ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                      ))}

                      {pwMsg.text && (
                        <p
                          className="text-xs text-center"
                          style={{ color: pwMsg.type === "success" ? "#00ffae" : "#f87171" }}
                        >
                          {pwMsg.text}
                        </p>
                      )}

                      <button
                        onClick={handleChangePw}
                        disabled={pwLoading}
                        className="w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-150 active:scale-[0.98]"
                        style={{
                          background: pwLoading ? "#00ffae66" : "#00ffae",
                          color: "#000",
                          cursor: pwLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        {pwLoading ? "Saving..." : "Save Password"}
                      </button>

                      <button
                        onClick={cancelPwForm}
                        className="w-full py-1.5 text-xs font-semibold transition-colors"
                        style={{ color: "#6b9e82", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#00ffae")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b9e82")}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ NOTIFICATIONS TAB ══════════ */}
          {activeTab === "notifications" && (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-black" style={{ color: "#00ffae" }}>Notifications</h2>
                <p className="text-sm mt-1" style={{ color: "#6b9e82" }}>Choose how and when you get notified</p>
              </div>

              <div className="rounded-2xl mb-4 px-6 py-5" style={{ background: "#0a1a12", border: "1px solid #1a3d2b" }}>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: "#00ffae" }}>Channels</p>

                <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #1a3d2b" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#060f0a", border: "1px solid #1a3d2b" }}>
                      <Mail size={14} style={{ color: "#00ffae" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>Email notifications</p>
                      <p className="text-xs mt-0.5" style={{ color: "#6b9e82" }}>Receive updates via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailNotif(!emailNotif)}
                    className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
                    style={{ background: emailNotif ? "#00ffae" : "#1a3d2b" }}
                  >
                    <span
                      className={`inline-block w-4 h-4 rounded-full transition-transform duration-200 ${emailNotif ? "translate-x-[22px]" : "translate-x-[2px]"}`}
                      style={{ background: emailNotif ? "#000" : "#6b9e82" }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#060f0a", border: "1px solid #1a3d2b" }}>
                      <Globe size={14} style={{ color: "#00ffae" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>Web notifications</p>
                      <p className="text-xs mt-0.5" style={{ color: "#6b9e82" }}>Browser push alerts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWebNotif(!webNotif)}
                    className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
                    style={{ background: webNotif ? "#00ffae" : "#1a3d2b" }}
                  >
                    <span
                      className={`inline-block w-4 h-4 rounded-full transition-transform duration-200 ${webNotif ? "translate-x-[22px]" : "translate-x-[2px]"}`}
                      style={{ background: webNotif ? "#000" : "#6b9e82" }}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ BLOCKED USERS TAB ══════════ */}
          {activeTab === "blocked" && (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-black" style={{ color: "#00ffae" }}>
                  Blocked Users
                  {blockedUsers.length > 0 && (
                    <span
                      className="ml-3 text-sm px-2 py-0.5 rounded-full"
                      style={{ background: "#0d2e1f", border: "1px solid #1a3d2b", color: "#00ffae" }}
                    >
                      {blockedUsers.length}
                    </span>
                  )}
                </h2>
                <p className="text-sm mt-1" style={{ color: "#6b9e82" }}>
                  People you've blocked won't be able to contact you
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: "#0a1a12", border: "1px solid #1a3d2b" }}>

                {/* Loading */}
                {blockedLoading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div
                      className="w-7 h-7 rounded-full border-2 animate-spin"
                      style={{ borderColor: "#1a3d2b", borderTopColor: "#00ffae" }}
                    />
                    <p className="text-sm" style={{ color: "#6b9e82" }}>Loading...</p>
                  </div>
                )}

                {/* Error */}
                {!blockedLoading && blockedError && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "#060f0a", border: "1px solid #1a3d2b" }}
                    >
                      <Ban size={20} style={{ color: "#f87171" }} />
                    </div>
                    <p className="text-sm" style={{ color: "#f87171" }}>{blockedError}</p>
                    <button
                      onClick={fetchBlockedUsers}
                      className="text-xs px-4 py-1.5 rounded-full font-semibold"
                      style={{ background: "#0d2e1f", border: "1px solid #00ffae", color: "#00ffae" }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty */}
                {!blockedLoading && !blockedError && blockedUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "#060f0a", border: "1px solid #1a3d2b" }}
                    >
                      <Ban size={24} style={{ color: "#1a3d2b" }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "#6b9e82" }}>No blocked users</p>
                    <p className="text-xs" style={{ color: "#3a5e4a" }}>Users you block will appear here</p>
                  </div>
                )}

                {/* Users List - UPDATED WITH FIX */}
                {!blockedLoading && !blockedError && blockedUsers.map((user, i) => {
                  const imgSrc = getBlockedUserImage(user);
                  const displayName = getBlockedUserDisplay(user);
                  const isLast = i === blockedUsers.length - 1;
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: isLast ? "none" : "1px solid #1a3d2b" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden text-sm font-bold"
                          style={{ background: "#0d2e1f", border: "1px solid #1a3d2b", color: "#00ffae" }}
                        >
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={displayName}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            getUserInitials(user)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>{displayName}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#6b9e82" }}>
                            {getSecondaryInfo(user)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnblock(user.id)}
                        disabled={unblockingId === user.id}
                        className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-95"
                        style={{
                          background: "#1a0808",
                          border: "1px solid #3d1a1a",
                          color: "#f87171",
                          opacity: unblockingId === user.id ? 0.5 : 1,
                          cursor: unblockingId === user.id ? "not-allowed" : "pointer",
                        }}
                        onMouseEnter={(e) => { if (unblockingId !== user.id) e.currentTarget.style.background = "#2d0f0f"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#1a0808"; }}
                      >
                        {unblockingId === user.id ? "Unblocking..." : "Unblock"}
                      </button>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

          {/* ══════════ LEGAL & POLICIES TAB ══════════ */}
          {activeTab === "legal" && (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-black" style={{ color: "#00ffae" }}>Legal & Policies</h2>
                <p className="text-sm mt-1" style={{ color: "#6b9e82" }}>Review our terms and policies</p>
              </div>
              <div className="rounded-2xl px-6 py-2" style={{ background: "#0a1a12", border: "1px solid #1a3d2b" }}>
                {[
                  { label: "Privacy Policy", path: "/privacy" },
                  { label: "Terms & Conditions", path: "/terms" },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="flex items-center justify-between py-4 cursor-pointer group"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #1a3d2b" : "none" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#060f0a", border: "1px solid #1a3d2b" }}>
                        <FileText size={14} style={{ color: "#00ffae" }} />
                      </div>
                      <span className="text-sm font-semibold transition-colors group-hover:text-[#00ffae]" style={{ color: "#ffffff" }}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={16} style={{ color: "#1a3d2b" }} className="group-hover:text-[#00ffae] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ HELP & SUPPORT TAB ══════════ */}
          {activeTab === "support" && (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-black" style={{ color: "#00ffae" }}>Help & Support</h2>
                <p className="text-sm mt-1" style={{ color: "#6b9e82" }}>Get help or report an issue</p>
              </div>
              <div className="rounded-2xl px-6 py-2" style={{ background: "#0a1a12", border: "1px solid #1a3d2b" }}>
                {[
                  { label: "Contact Support", icon: <Mail size={14} style={{ color: "#00ffae" }} /> },
                  { label: "Frequently Asked Questions", icon: <HelpCircle size={14} style={{ color: "#00ffae" }} /> },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-4 cursor-pointer group"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #1a3d2b" : "none" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#060f0a", border: "1px solid #1a3d2b" }}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-semibold transition-colors group-hover:text-[#00ffae]" style={{ color: "#ffffff" }}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={16} style={{ color: "#1a3d2b" }} className="group-hover:text-[#00ffae] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ ACCOUNT CONTROL TAB ══════════ */}
          {activeTab === "accountControl" && (
            <div>
              <div className="mb-7">
                <h2 className="text-2xl font-black" style={{ color: "#00ffae" }}>Account Control</h2>
                <p className="text-sm mt-1" style={{ color: "#6b9e82" }}>Manage or close your account</p>
              </div>

              {/* Logout */}
              <div className="rounded-2xl mb-4 px-6 py-5" style={{ background: "#0a1a12", border: "1px solid #1a3d2b" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#060f0a", border: "1px solid #1a3d2b" }}>
                      <LogOut size={16} style={{ color: "#00ffae" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#ffffff" }}>Logout</p>
                      <p className="text-xs mt-0.5" style={{ color: "#6b9e82" }}>Sign out of this device</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#0d2e1f", border: "1px solid #1a3d2b", color: "#6b9e82" }}
                    onMouseEnter={(e) => { if (!logoutLoading) e.currentTarget.style.borderColor = "#00ffae"; }}
                    onMouseLeave={(e) => { if (!logoutLoading) e.currentTarget.style.borderColor = "#1a3d2b"; }}
                  >
                    {logoutLoading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>

              {/* Danger Zone - Delete Account */}
              <div className="rounded-2xl px-6 py-5" style={{ background: "#0a0808", border: "1px solid #3d1a1a" }}>
                {!showDeleteConfirm ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#1a0808", border: "1px solid #3d1a1a" }}>
                        <Trash2 size={16} style={{ color: "#f87171" }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#ffffff" }}>Delete account</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6b6b6b" }}>Permanently delete your account and all data</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-150 active:scale-95"
                      style={{ background: "#1a0808", border: "1px solid #f87171", color: "#f87171" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#2d0f0f")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#1a0808")}
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#1a0808", border: "1px solid #f87171" }}>
                        <Trash2 size={16} style={{ color: "#f87171" }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#f87171" }}>Are you sure?</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6b6b6b" }}>This action cannot be undone</p>
                      </div>
                    </div>

                    {deleteMsg.text && (
                      <p
                        className="text-xs text-center"
                        style={{ color: deleteMsg.type === "success" ? "#00ffae" : "#f87171" }}
                      >
                        {deleteMsg.text}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "#f87171", color: "#000" }}
                        onMouseEnter={(e) => { if (!deleteLoading) e.currentTarget.style.background = "#ff6b6b"; }}
                        onMouseLeave={(e) => { if (!deleteLoading) e.currentTarget.style.background = "#f87171"; }}
                      >
                        {deleteLoading ? "Deleting..." : "Yes, Delete My Account"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteMsg({ text: "", type: "" });
                        }}
                        disabled={deleteLoading}
                        className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 active:scale-95"
                        style={{ background: "#0d2e1f", border: "1px solid #1a3d2b", color: "#6b9e82" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1a3d2b")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#0d2e1f")}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;