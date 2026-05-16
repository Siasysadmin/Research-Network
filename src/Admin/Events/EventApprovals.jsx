import React, { useState, useRef, useEffect } from "react";
import Layout from "../Layout/Layout";
import { toast } from "react-toastify";
import API_CONFIG from "../../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80";

// ✅ Changed 'Published' (3) to map to 'Approved' for Admin view
const STATUS_MAP = {
  1: "Pending",
  2: "Approved",
  3: "Approved", 
  4: "Rejected",
  "1": "Pending",
  "2": "Approved",
  "3": "Approved", 
  "4": "Rejected",
  "pending": "Pending",
  "approved": "Approved",
  "published": "Approved", 
  "rejected": "Rejected",
  "PENDING": "Pending",
  "APPROVED": "Approved",
  "PUBLISHED": "Approved"
};

const getAuthToken = () => {
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token")
  );
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  try {
    const [hourStr, minute] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  } catch (err) {
    return timeStr;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return { month: "---", day: "--" };
  try {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: String(date.getDate()).padStart(2, "0"),
      fullDate: date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
  } catch (err) {
    return { month: "---", day: "--" };
  }
};

const mapEventToCard = (event) => {
  const { month, day, fullDate } = formatDate(event?.start_date);
  
  const rawStatus = String(event?.status).trim();
  const status = STATUS_MAP[rawStatus] || "Pending"; 
  
  const location = event?.venue_name || event?.meeting_link || "TBD";
  const submittedBy = event?.user_name || event?.organizer_name || "Unknown";
  const imageUrl = event?.event_banner ? `${API_CONFIG.BASE_URL}/${event.event_banner}` : FALLBACK_IMAGE;

  const timeRange = event?.start_time && event?.end_time
      ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
      : "Time TBD";

  return {
    id: event?.id,
    month,
    day,
    title: event?.event_title || "Untitled Event",
    submittedBy,
    time: timeRange,
    location,
    status,
    dateSubtext: `${status.charAt(0) + status.slice(1).toLowerCase()} on ${fullDate}`,
    image: imageUrl,
    fullEvent: event,
  };
};

const getStatusStyles = (status) => {
  switch (status) {
    case "Pending":
      return { text: "text-amber-400", border: "border-amber-400/30", bg: "bg-amber-400/10" };
    case "Approved":
      return { text: "text-emerald-500 dark:text-[#32ff99]", border: "border-[#32ff99]/30", bg: "bg-[#32ff99]/10" };
    case "Rejected":
      return { text: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/10" };
    default:
      return { text: "text-gray-500 dark:text-slate-400", border: "border-slate-500/20", bg: "bg-slate-500/5" };
  }
};

const ActionMenu = ({ status, onViewDetails, onEdit, onDuplicate, onViewReason, onDelete, onClose }) => {
  const isPending = status === "Pending";
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";

  return (
    <div className="absolute right-0 top-8 sm:top-10 w-40 sm:w-44 bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-lg sm:rounded-xl shadow-xl z-50 py-1 overflow-hidden text-xs sm:text-sm">
      <button onClick={onViewDetails} className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
        <MaterialIcon name="visibility" className="text-sm sm:text-base text-gray-500 dark:text-slate-400 shrink-0" />
        <span>View Details</span>
      </button>
    </div>
  );
};

const EventApprovals = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeNav, setActiveNav] = useState("events");
  const [processingEvents, setProcessingEvents] = useState(new Set());
  
  // Modal States
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${API_CONFIG.BASE_URL}/user-event/get-all-events`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const eventsList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setEvents(eventsList.map(mapEventToCard));
      } catch (err) {
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // View Details Handler
  const handleViewDetails = (event) => {
    setSelectedEvent(event.fullEvent);
    setShowDetailsModal(true);
    setOpenMenuId(null);
  };

  // Approve Modal Handlers
  const openApproveModal = (eventId) => {
    setSelectedEventId(eventId);
    setShowApproveModal(true);
    setOpenMenuId(null);
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedEvent(null);
    setSelectedEventId(null);
  };

  const confirmApprove = async () => {
  if (!selectedEventId) return;

  try {
    setProcessingEvents((prev) => new Set(prev).add(selectedEventId));
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_CONFIG.BASE_URL}/user-event/approve-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ event_id: selectedEventId }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.status || response.ok) {
      setEvents((prev) =>
        prev.map((e) => e.id === selectedEventId ? {
            ...e, status: "Approved",
            dateSubtext: `Approved on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
          } : e
        )
      );
      closeModals();
      // ✅ Removed alert from here
    } else {
      console.error(data.message || "Failed to approve event");
    }
  } catch (err) {
    console.error(`Failed to approve event: ${err.message}`);
  } finally {
    setProcessingEvents((prev) => { const newSet = new Set(prev); newSet.delete(selectedEventId); return newSet; });
  }
};

  // Reject Modal Handlers
  const openRejectModal = (eventId) => {
    setSelectedEventId(eventId);
    setShowRejectModal(true);
    setOpenMenuId(null);
  };

const confirmReject = async () => {
  if (!selectedEventId) return;

  try {
    setProcessingEvents((prev) => new Set(prev).add(selectedEventId));
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_CONFIG.BASE_URL}/user-event/reject-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ event_id: selectedEventId }), 
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.status || response.ok) {
      setEvents((prev) =>
        prev.map((e) => e.id === selectedEventId ? {
            ...e, status: "Rejected",
            dateSubtext: `Rejected on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
          } : e
        )
      );
      closeModals();
      // ✅ Removed alert from here - direct reject ho jayega
    } else {
      // ✅ Error case mein bhi alert nahi, console error de sakte ho
      console.error(data.message || "Failed to reject event");
    }
  } catch (err) {
    // ✅ Error case mein bhi alert nahi
    console.error(`Failed to reject event: ${err.message}`);
  } finally {
    setProcessingEvents((prev) => { const newSet = new Set(prev); newSet.delete(selectedEventId); return newSet; });
  }
};

  const handleEdit = () => alert("Edit functionality coming soon");
  const handleDuplicate = () => alert("Duplicate functionality coming soon");
  const handleViewReason = () => alert("View reason functionality coming soon");
  const handleDelete = () => alert("Delete functionality coming soon");

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden 
        bg-gray-50 dark:bg-[#0a120e]
text-gray-900 dark:text-white min-h-screen transition-colors">
        <div className="mb-6 sm:mb-8 lg:mb-10 mt-2 sm:mt-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Event Approvals</h1>
          <p className="text-xs sm:text-sm md:text-base dark:text-gray-500 dark:text-slate-400">Review and approve user submitted events</p>
        </div>

        {loading && <div className="flex justify-center py-20 text-gray-500 dark:text-slate-400">Loading events...</div>}
        {error && !loading && <div className="flex justify-center py-20 text-red-400">Failed to load events: {error}</div>}
        {!loading && !error && events.length === 0 && <div className="flex justify-center py-20 text-slate-500">No events found.</div>}

        {!loading && !error && events.length > 0 && (
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 pb-6">
            {events.map((event) => {
              const styles = getStatusStyles(event.status);
              const isPending = event.status === "Pending";

              return (
                <div key={event.id} className="bg-white dark:bg-[#0d1a12] 
                    border border-gray-200 dark:border-white/10
                    text-gray-900 dark:text-white
                    hover:border-gray-300 dark:hover:border-white/20 
                    transition-colors rounded-lg sm:rounded-2xl 
                    p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row sm:items-center 
                    gap-3 sm:gap-4 md:gap-5 relative overflow-hidden">
                  
                  <div className="flex sm:flex-col items-center gap-3 sm:gap-0 order-2 sm:order-1 shrink-0">
                    <div className="flex sm:flex-col items-center justify-center w-auto sm:w-12">
                      <span className={`text-[8px] sm:text-[10px] font-semibold tracking-widest ${styles.text}`}>{event.month}</span>
                      <span className={`text-lg sm:text-2xl font-bold leading-tight ${styles.text}`}>{event.day}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 order-1 sm:order-2">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold 
                        text-gray-900 dark:text-white line-clamp-2">{event.title}</h3>
                    <p className="text-[10px] sm:text-xs 
                        text-gray-500 dark:text-slate-400 mb-2 sm:mb-1.5">by {event.submittedBy}</p>
                    <div className="flex flex-col gap-1 sm:gap-0.5 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <MaterialIcon name="schedule" className="!text-sm sm:!text-base shrink-0" />
                        <span className="truncate text-[10px] sm:text-xs 
                          text-gray-500 dark:text-slate-400">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <MaterialIcon name="location_on" className="!text-sm sm:!text-base shrink-0" />
                        <span className="truncate text-[10px] sm:text-xs 
                          text-gray-500 dark:text-slate-400">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2 w-full sm:w-auto order-3 pt-2 sm:pt-0 sm:shrink-0 border-t sm:border-t-0 border-white/5">
                    <span className={`px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-full border ${styles.border} ${styles.bg} ${styles.text} text-[8px] sm:text-[10px] md:text-[11px] font-bold tracking-wider whitespace-nowrap`}>
                      {event.status}
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-slate-500 line-clamp-1">{event.dateSubtext}</span>

                    {isPending && (
                      <div className="flex items-center gap-2 mt-1 w-full sm:w-auto">
                        <button 
                          onClick={() => openApproveModal(event.id)} 
                          disabled={processingEvents.has(event.id)} 
                          className="flex-1 sm:flex-none px-2.5 sm:px-4 py-1.5 sm:py-1.5 rounded-lg border border-[#32ff99]/40 text-emerald-600 dark:text-[#32ff99] hover:bg-[#32ff99]/10 transition-colors text-[9px] sm:text-xs font-semibold whitespace-nowrap"
                        >
                          {processingEvents.has(event.id) ? "Processing..." : "Approve"}
                        </button>
                        <button 
                          onClick={() => openRejectModal(event.id)} 
                          disabled={processingEvents.has(event.id)} 
                          className="flex-1 sm:flex-none px-2.5 sm:px-4 py-1.5 sm:py-1.5 rounded-lg border border-red-400/40 text-red-400 hover:bg-red-400/10 transition-colors text-[9px] sm:text-xs font-semibold whitespace-nowrap"
                        >
                          {processingEvents.has(event.id) ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto shrink-0 order-4 sm:order-4" ref={openMenuId === event.id ? menuRef : null}>
                    <button onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)} className="p-1 text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                      <MaterialIcon name="more_vert" className="!text-lg sm:!text-xl" />
                    </button>
                    {openMenuId === event.id && (
                      <ActionMenu 
                        status={event.status}
                        onViewDetails={() => handleViewDetails(event)}
                        onEdit={handleEdit}
                        onDuplicate={handleDuplicate}
                        onViewReason={handleViewReason}
                        onDelete={handleDelete}
                        onClose={() => setOpenMenuId(null)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-8">
          <div className="bg-white dark:bg-[#0d1f16] dark:to-[#0a1610] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Header with Cover Image */}
            <div className="relative h-48 sm:h-64 rounded-t-2xl overflow-hidden">
              {selectedEvent.event_banner ? (
                <>
                  <img 
                    src={`${API_CONFIG.BASE_URL}/${selectedEvent.event_banner}`}
                    alt={selectedEvent.event_title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f16] via-transparent to-transparent"></div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <MaterialIcon name="event" className="text-6xl text-white/20" />
                </div>
              )}
              
              <button 
                onClick={closeModals} 
                className="absolute top-4 right-4 
                  bg-white/80 dark:bg-black/50 
                  backdrop-blur-md 
                  rounded-full p-2 
                  text-gray-700 dark:text-white 
                  hover:bg-white dark:hover:bg-black/70 
                  transition-all shadow-md border border-gray-200 dark:border-white/10"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
              
              <div className="absolute bottom-4 left-4">
                {/* Changed how Status is displayed in Modal so 'Published' acts as 'Approved' here too */}
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusStyles(STATUS_MAP[selectedEvent.status] || "Pending")?.text} ${getStatusStyles(STATUS_MAP[selectedEvent.status] || "Pending")?.bg} ${getStatusStyles(STATUS_MAP[selectedEvent.status] || "Pending")?.border}`}>
                  {STATUS_MAP[selectedEvent.status] || "Pending"}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedEvent.event_title}</h2>
              
              <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <MaterialIcon name="calendar_today" className="!text-lg" />
                  <span className="text-sm">{selectedEvent.start_date} {selectedEvent.end_date !== selectedEvent.start_date && `- ${selectedEvent.end_date}`}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <MaterialIcon name="schedule" className="!text-lg" />
                  <span className="text-sm">{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <MaterialIcon name="public" className="!text-lg" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-slate-300">Event Mode</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedEvent.event_mode === 'online' ? '🌐 Online Event' : '📍 In-Person Event'}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <MaterialIcon name="location_on" className="!text-lg" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-slate-300">Location</span>
                  </div>
                  {selectedEvent.event_mode === 'online' ? (
                    <a href={selectedEvent.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                      {selectedEvent.meeting_link || "N/A"}
                    </a>
                  ) : (
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedEvent.venue_name?.trim() || "N/A"}
                      </p>
                      {selectedEvent.full_address && <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{selectedEvent.full_address}</p>}
                      {(selectedEvent.city || selectedEvent.state || selectedEvent.country) && (
                        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                          {[selectedEvent.city, selectedEvent.state, selectedEvent.country].filter(Boolean).join(", ")}
                          {selectedEvent.pin_code && ` - ${selectedEvent.pin_code}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <MaterialIcon name="description" className="!text-lg" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-slate-300">About Event</span>
                </div>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.event_description || "No description provided"}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                    <MaterialIcon name="person" className="!text-sm" />
                    <span>Organizer</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    GSIF
                  </p>
                </div>
               <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                    <MaterialIcon name="email" className="!text-sm" />
                    <span>Email</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    N/A
                  </p>
                </div>
              </div>
              
              {selectedEvent.event_category_tags && selectedEvent.event_category_tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <MaterialIcon name="sell" className="!text-lg" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-slate-300">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.event_category_tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/10">
                <button onClick={closeModals} className="px-6 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all font-medium flex items-center gap-2">
                  <MaterialIcon name="close" className="!text-sm" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE CONFIRMATION MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0d1f16] border border-[#32ff99]/30 rounded-2xl p-6 sm:p-8 w-full max-w-[400px] shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#32ff99]/10 border border-[#32ff99]/30 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon name="check_circle" className="text-emerald-500 dark:text-[#32ff99] text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Approve Event?</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-5">
              Are you sure you want to approve this event? It will be moved to approved status.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModals} className="flex-1 py-2.5 rounded-xl border border-slate-500/30 text-gray-700 dark:text-slate-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                Cancel
              </button>
              <button onClick={confirmApprove} className="flex-1 py-2.5 rounded-xl bg-[#32ff99]/10 border border-[#32ff99]/30 text-emerald-500 dark:text-[#32ff99] font-bold text-sm hover:bg-[#32ff99]/20 transition-all">
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0d1f16] border border-red-500/30 rounded-2xl p-6 sm:p-8 w-full max-w-[400px] shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon name="cancel" className="text-red-400 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reject Event?</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-5">
              Are you sure you want to reject this event? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModals} className="flex-1 py-2.5 rounded-xl border border-slate-500/30 text-gray-700 dark:text-slate-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                Cancel
              </button>
              <button onClick={confirmReject} className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all">
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        ::-webkit-scrollbar { display: none; width: 0; height: 0; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </Layout>
  );
};

export default EventApprovals;