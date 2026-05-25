import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const typeMeta = {
  event: {
    icon: "event",
    iconColor: "text-[#32ff99]",
    iconBg: "bg-[#32ff9915]",
    badgeBg: "bg-[#32ff9912]",
    badgeText: "text-[#32ff99]",
    badgeBorder: "border-[#32ff9930]",
    label: "Event",
  },
  research: {
    icon: "menu_book",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-400",
    badgeBorder: "border-indigo-500/20",
    label: "Research",
  },
  user_connected: {
    icon: "person_add",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/20",
    label: "Connection",
  },
  general: {
    icon: "notifications",
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-500/10",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-600 dark:text-slate-400",
    badgeBorder: "border-slate-500/20",
    label: "General",
  },
};

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token");

const NotificationItem = ({
  notif,
  onClose,
  navigate,
  actionState,
  onAccept,
  onReject,
}) => {
  // ✅ States ab parent se aa rahi hain - reset nahi hongi
  const {
    accepting = false,
    rejecting = false,
    accepted = false,
    rejected = false,
  } = actionState || {};

  const type = notif.type?.toLowerCase() || "general";
  const meta = typeMeta[type] || typeMeta.general;

  const handleClick = () => {
    if (type === "event") {
      const match = notif.message?.match(/[""""]([^""""]+)[""""]/);
      const eventName = match ? match[1].trim() : "";
      onClose?.();
      navigate("/dashboard", {
        replace: false,
        state: { openEventName: eventName },
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-start gap-3 px-[18px] py-[14px] border-b border-[#32ff9908] transition-all cursor-pointer
        ${type === "event" ? "hover:bg-[#32ff9907]" : "hover:bg-gray-100 dark:hover:bg-white/[0.02]"}
        ${notif.is_read === "0" ? "bg-[#32ff9904]" : ""}
      `}
    >
      {notif.is_read === "0" && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#32ff99] rounded-r-full" />
      )}

      <div
        className={`w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 mt-0.5 border ${meta.iconBg}`}
        style={{ borderColor: "transparent" }}
      >
        <MaterialIcon
          name={meta.icon}
          className={`text-[17px] ${meta.iconColor}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-[3px]">
          <p
            className={`text-[12.5px] font-semibold leading-tight ${notif.is_read === "0" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-600 dark:text-slate-400"}`}
          >
            {notif.title}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-600 shrink-0 mt-[1px]">
            {notif.created_at
              ? new Date(notif.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
              : ""}
          </span>
        </div>

        <p className="text-[11.5px] text-slate-500 leading-relaxed mb-2">
          {notif.message}
        </p>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-[3px] rounded-full border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
          >
            <span
              className={`w-[5px] h-[5px] rounded-full ${meta.iconColor.replace("text-", "bg-")}`}
            />
            {meta.label}
          </span>

          {/* ✅ Buttons - parent state se control ho rahi hain */}
          {type === "user_connected" && !accepted && !rejected && (
            <div className="flex items-center gap-2">
              {/* ✗ Reject */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(notif);
                }}
                disabled={rejecting || accepting}
                className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {rejecting ? (
                  <div className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                ) : (
                  <MaterialIcon name="close" className="text-[13px]" />
                )}
              </button>

              {/* ✓ Accept */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(notif);
                }}
                disabled={accepting || rejecting}
                className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#32ff9915] text-[#32ff99] border border-[#32ff9930] hover:bg-[#32ff9925] active:scale-95 transition-all disabled:opacity-50"
              >
                {accepting ? (
                  <div className="w-3 h-3 border border-[#32ff99]/40 border-t-[#32ff99] rounded-full animate-spin" />
                ) : (
                  <MaterialIcon name="check" className="text-[13px]" />
                )}
              </button>
            </div>
          )}

          {type === "user_connected" && accepted && (
            <span className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#32ff9915] text-[#32ff99] border border-[#32ff9930]">
              <MaterialIcon name="check_circle" className="text-[13px]" />
              Connected
            </span>
          )}

          {type === "user_connected" && rejected && (
            <span className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <MaterialIcon name="cancel" className="text-[13px]" />
              Declined
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationPopup = ({ onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Sabhi connection actions ka state yahan - notif id se track hoga
  const [connectionActions, setConnectionActions] = useState({});
  // Structure: { [notifId]: { accepting, rejecting, accepted, rejected } }

  const getActionState = (notifId) => ({
    accepting: connectionActions[notifId]?.accepting || false,
    rejecting: connectionActions[notifId]?.rejecting || false,
    accepted: connectionActions[notifId]?.accepted || false,
    rejected: connectionActions[notifId]?.rejected || false,
  });

  const updateAction = (notifId, update) => {
    setConnectionActions((prev) => ({
      ...prev,
      [notifId]: {
        ...(prev[notifId] || {}),
        ...update,
      },
    }));
  };

  // ✅ Accept handler - parent mein
  const handleAccept = async (notif) => {
    const notifId = notif.id;
    const userId =
      notif.sender_id ||
      notif.connected_user_id ||
      notif.user_id ||
      notif.from_id;
    if (!userId || getActionState(notifId).accepting) return;

    updateAction(notifId, { accepting: true });
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/user/accept-connection`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connected_user_id: userId }),
      });
      const data = await res.json();
      if (data.status) {
        updateAction(notifId, { accepted: true, accepting: false });
      } else {
        updateAction(notifId, { accepting: false });
      }
    } catch (err) {
      console.error("Accept error:", err);
      updateAction(notifId, { accepting: false });
    }
  };

  // ✅ Reject handler - parent mein
  const handleReject = async (notif) => {
    const notifId = notif.id;
    const userId =
      notif.sender_id ||
      notif.connected_user_id ||
      notif.user_id ||
      notif.from_id;
    if (!userId || getActionState(notifId).rejecting) return;

    updateAction(notifId, { rejecting: true });
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/user/disconnect-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connected_user_id: String(userId) }),
      });
      const data = await res.json();
      if (data.status) {
        updateAction(notifId, { rejected: true, rejecting: false });
      } else {
        updateAction(notifId, { rejecting: false });
      }
    } catch (err) {
      console.error("Reject error:", err);
      updateAction(notifId, { rejecting: false });
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/notifications/get-notifications`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.status) {
        setNotifications(data.data || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error("Notif fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const token = getAuthToken();
      await fetch(`${API_CONFIG.BASE_URL}/notifications/mark-all-as-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: "1" })));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      await fetchNotifications();

      // LinkedIn jaisa: popup open hote hi unread notifications read ho jaye
      setTimeout(() => {
        markAllRead();
      }, 500);
    };

    loadNotifications();
  }, []);

  return (
    <div
      className="
fixed sm:absolute right-2 sm:right-0 top-[80px] sm:top-auto sm:mt-3 
w-[calc(100vw-16px)] sm:w-[340px] md:w-[360px] lg:w-[380px] 
max-h-[480px] bg-white text-slate-800 
border border-gray-200 
rounded-[18px] shadow-2xl overflow-hidden z-[60]

dark:bg-[#0e1c14] 
dark:text-white 
dark:border-[#32ff9918]
"
    >
      <div
        className="px-[18px] pt-4 pb-[13px] border-b bg-gray-50 border-gray-200 text-slate-800
dark:bg-[#32ff9906] dark:border-[#32ff9912] dark:text-white"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900 dark:text-white tracking-wide">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-[2px] rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold text-[#32ff99] bg-[#32ff9912] border border-[#32ff9926] px-2.5 py-1 rounded-lg hover:bg-[#32ff9922] transition-all"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          <button className="text-[11px] font-semibold px-3 py-1 rounded-lg border text-[#32ff99] bg-[#32ff9915] border-[#32ff9930]">
            All
          </button>
        </div>
      </div>

      <div
        className="
    h-[340px]
    overflow-y-auto
    scrollbar-thin
    scrollbar-thumb-gray-300
    dark:scrollbar-thumb-[#1e3a2c]
    scrollbar-track-transparent
  "
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-3">
            <div className="w-5 h-5 border-2 border-[#32ff99]/30 border-t-[#32ff99] rounded-full animate-spin" />
            <span className="text-slate-600 dark:text-slate-400 text-sm">
              Loading…
            </span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-[14px] bg-[#32ff9910] border border-[#32ff9918] flex items-center justify-center">
              <MaterialIcon
                name="notifications_off"
                className="text-xl text-[#32ff9960]"
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">
                All caught up
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">
                No new notifications
              </p>
            </div>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <NotificationItem
              key={notif.id || i}
              notif={notif}
              onClose={onClose}
              navigate={navigate}
              actionState={connectionActions[notif.id] || {}}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
