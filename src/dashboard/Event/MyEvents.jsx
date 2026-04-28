import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80";

const STATUS_MAP = {
  1: "PENDING",
  2: "APPROVED",
  3: "PUBLISHED",
  4: "REJECTED",
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return { month: "---", day: "--" };
  const date = new Date(dateStr);
  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
  };
};

const getAuthToken = () => {
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token")
  );
};

const fetchEvents = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_CONFIG.BASE_URL}/user-event/get-events`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
};

const mapEventToCard = (event) => {
  const { month, day } = formatDate(event?.start_date);
  const status = STATUS_MAP[event?.status] ?? "PENDING";
  const location = event?.venue_name || event?.meeting_link || "TBD";
  const imageUrl = event?.event_banner
    ? `${API_CONFIG.BASE_URL}/${event.event_banner}`
    : FALLBACK_IMAGE;
  const timeRange =
    event?.start_time && event?.end_time
      ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
      : "Time TBD";
  return {
    id: event?.id,
    month,
    day,
    title: event?.event_title ?? "Untitled Event",
    time: timeRange,
    location,
    status,
    dateSubtext: `${status.charAt(0) + status.slice(1).toLowerCase()} on ${event?.start_date ?? ""}`,
    image: imageUrl,
    fullEvent: event,
  };
};

const getStatusStyles = (status) => {
  switch (status) {
    case "PENDING":
      return { text: "text-amber-400", border: "border-amber-400/30", bg: "bg-amber-400/10" };
    case "APPROVED":
      return { text: "text-[#32ff99]", border: "border-[#32ff99]/30", bg: "bg-[#32ff99]/10" };
    case "PUBLISHED":
      return { text: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/10" };
    case "REJECTED":
      return { text: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/10" };
    default:
      return { text: "text-slate-400", border: "border-slate-500/20", bg: "bg-slate-500/5" };
  }
};

// Dropdown Menu Component
const DropdownMenu = ({ event, onViewDetails, onPublish, onDelete, onClose, position }) => {
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: position?.top || "50%",
        left: position?.left || "50%",
        zIndex: 9999
      }}
      className="w-40 sm:w-44 bg-[#1a2a1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeInScale"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onViewDetails}
        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2 border-b border-white/5 transition-colors"
      >
        <MaterialIcon name="visibility" className="!text-xs sm:!text-sm" />
        View Details
      </button>
      {event.status === "APPROVED" && (
        <button
          onClick={() => onPublish(event.id)}
          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-blue-400 hover:bg-blue-400/10 flex items-center gap-2 border-b border-white/5 transition-colors"
        >
          <MaterialIcon name="public" className="!text-xs sm:!text-sm" />
          Publish Event
        </button>
      )}
      <button
        onClick={() => onDelete(event.id)}
        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors"
      >
        <MaterialIcon name="delete" className="!text-xs sm:!text-sm" />
        Delete Event
      </button>
    </div>
  );
};

const MyEvents = () => {
  const navigate = useNavigate();
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [processingEvents, setProcessingEvents] = useState(new Set());
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const dropdownBtnRefs = React.useRef({});

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEvents();
        const events = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setEventList(events.map(mapEventToCard));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const toggleDropdown = (e, eventId) => {
    e.stopPropagation();
    if (openDropdownId === eventId) {
      setOpenDropdownId(null);
      return;
    }
    
    const btn = dropdownBtnRefs.current[eventId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 176,
      });
    }
    setOpenDropdownId(eventId);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event.fullEvent);
    setShowDetailsModal(true);
    setOpenDropdownId(null);
  };

  const openPublishModal = (eventId) => {
    setSelectedEventId(eventId);
    setPublishError(null);
    setShowPublishModal(true);
    setOpenDropdownId(null);
  };

  const openDeleteModal = (eventId) => {
    setSelectedEventId(eventId);
    setDeleteError(null);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setShowPublishModal(false);
    setShowDetailsModal(false);
    setShowDeleteModal(false);
    setSelectedEvent(null);
    setSelectedEventId(null);
    setPublishError(null);
    setDeleteError(null);
  };

  const confirmPublish = async () => {
    if (!selectedEventId) return;
    try {
      setProcessingEvents((prev) => new Set(prev).add(selectedEventId));
      setPublishError(null);
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${API_CONFIG.BASE_URL}/user-event/publish-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_id: selectedEventId }),
      });
      const data = await response.json();
      if (data.status) {
        setEventList((prev) =>
          prev.map((e) =>
            e.id === selectedEventId
              ? { ...e, status: "PUBLISHED", dateSubtext: `Published on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}` }
              : e
          )
        );
        closeModal();
        toast.success(data.message || "Event published successfully!");
      } else {
        setPublishError(data.message || "Failed to publish event.");
      }
    } catch (err) {
      setPublishError(`An error occurred: ${err.message}`);
    } finally {
      setProcessingEvents((prev) => { const s = new Set(prev); s.delete(selectedEventId); return s; });
    }
  };

  const confirmDelete = async () => {
    if (!selectedEventId) return;
    try {
      setProcessingEvents((prev) => new Set(prev).add(selectedEventId));
      setDeleteError(null);
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${API_CONFIG.BASE_URL}/user-event/delete-user-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_id: selectedEventId }),
      });
      const data = await response.json();
      if (data.status) {
        setEventList((prev) => prev.filter((e) => e.id !== selectedEventId));
        closeModal();
        toast.success(data.message || "Event deleted successfully!");
      } else {
        setDeleteError(data.message || "Failed to delete event.");
      }
    } catch (err) {
      setDeleteError(`An error occurred: ${err.message}`);
    } finally {
      setProcessingEvents((prev) => { const s = new Set(prev); s.delete(selectedEventId); return s; });
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full mx-auto overflow-x-hidden">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          {/* HEADER - Responsive */}
          <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 truncate">
                My Events
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Track your event submissions
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/create-event")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[#32ff99] border border-[#32ff99]/30 hover:border-[#32ff99] px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              <MaterialIcon name="add" className="text-base sm:text-lg" />
              Create Event
            </button>
          </div>

          {/* STATES - Loading, Error, Empty */}
          {loading && (
            <div className="flex justify-center items-center py-16 sm:py-20 md:py-24 text-slate-400 text-xs sm:text-sm gap-2">
              <MaterialIcon name="hourglass_empty" className="animate-spin" />
              Loading events...
            </div>
          )}
          
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 text-red-400 text-xs sm:text-sm gap-3">
              <MaterialIcon name="error_outline" className="text-3xl sm:text-4xl" />
              <p>Failed to load: {error}</p>
            </div>
          )}
          
          {!loading && !error && eventList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 text-slate-500 text-xs sm:text-sm gap-3">
              <MaterialIcon name="event_busy" className="text-3xl sm:text-4xl" />
              <p>No events found. Create your first event!</p>
            </div>
          )}

          {/* EVENTS LIST - Responsive Cards */}
          {!loading && !error && eventList.length > 0 && (
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 pb-24 sm:pb-10">
              {eventList.map((event) => {
                const styles = getStatusStyles(event.status);
                const isProcessing = processingEvents.has(event.id);

                return (
                  <div
                    key={event.id}
                    className="bg-[#0d1a12] border border-white/5 hover:border-white/10 transition-all rounded-xl sm:rounded-2xl overflow-hidden"
                  >
                    {/* MOBILE LAYOUT */}
                    <div className="block sm:hidden">
                      <div className="flex">
                        {/* Image */}
                        <div className="w-28 shrink-0 overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                            className="w-full h-full object-cover"
                            style={{ minHeight: "120px" }}
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-3 flex flex-col gap-2 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1">
                              {event.title}
                            </h3>
                            
                            {/* Three Dots Button */}
                            <div className="relative shrink-0">
                              <button
                                ref={(el) => { dropdownBtnRefs.current[`m-${event.id}`] = el; }}
                                onClick={(e) => toggleDropdown(e, `m-${event.id}`)}
                                className="text-slate-500 hover:text-white p-1 transition-colors active:bg-white/10 rounded-lg"
                              >
                                <MaterialIcon name="more_vert" className="text-lg" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <span className={`self-start px-2 py-0.5 rounded-full border ${styles.border} ${styles.bg} ${styles.text} text-[9px] font-bold tracking-wider`}>
                            {event.status}
                          </span>
                          
                          {/* Time */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <MaterialIcon name="schedule" className="!text-sm shrink-0" />
                            <span className="truncate">{event.time}</span>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <MaterialIcon name="location_on" className="!text-sm shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          
                          {/* Publish Button for Mobile */}
                          {event.status === "APPROVED" && (
                            <button
                              onClick={() => openPublishModal(event.id)}
                              disabled={isProcessing}
                              className="mt-1 w-full py-1.5 rounded-lg border border-blue-400/40 text-blue-400 hover:bg-blue-400/10 transition-colors text-[10px] font-bold disabled:opacity-50"
                            >
                              Publish Event
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DESKTOP/TABLET LAYOUT */}
                    <div className="hidden sm:flex items-center gap-3 md:gap-4 lg:gap-5 p-3 md:p-4 lg:p-5">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center w-12 md:w-14 shrink-0">
                        <span className={`text-[9px] md:text-[10px] font-semibold tracking-widest ${styles.text}`}>
                          {event.month}
                        </span>
                        <span className={`text-xl md:text-2xl font-bold leading-tight ${styles.text}`}>
                          {event.day}
                        </span>
                      </div>

                      {/* Event Image */}
                      <div className="w-16 md:w-20 h-16 md:h-20 shrink-0 rounded-lg overflow-hidden bg-[#0a120e]">
                        <img
                          src={event.image}
                          alt={event.title}
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base lg:text-lg font-bold text-white mb-1 truncate">
                          {event.title}
                        </h3>
                        <div className="flex flex-col gap-0.5 text-xs md:text-sm text-slate-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <MaterialIcon name="schedule" className="!text-sm md:!text-base shrink-0" />
                            <span className="truncate">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <MaterialIcon name="location_on" className="!text-sm md:!text-base shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 md:px-3 py-1 rounded-full border ${styles.border} ${styles.bg} ${styles.text} text-[9px] md:text-[10px] lg:text-[11px] font-bold tracking-wider whitespace-nowrap`}>
                          {event.status}
                        </span>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 whitespace-nowrap">
                          {event.dateSubtext}
                        </span>
                        {event.status === "APPROVED" && (
                          <button
                            onClick={() => openPublishModal(event.id)}
                            disabled={isProcessing}
                            className="px-3 md:px-4 py-1 rounded-lg border border-blue-400/40 text-blue-400 hover:bg-blue-400/10 transition-colors text-[10px] md:text-xs font-bold whitespace-nowrap disabled:opacity-50"
                          >
                            Publish Event
                          </button>
                        )}
                      </div>

                      {/* Three Dots Menu */}
                      <div className="relative shrink-0">
                        <button
                          ref={(el) => { dropdownBtnRefs.current[event.id] = el; }}
                          onClick={(e) => toggleDropdown(e, event.id)}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <MaterialIcon name="more_horiz" className="text-lg md:text-xl" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Menu Portal */}
      {openDropdownId && (
        <DropdownMenu
          event={eventList.find(e => e.id === (openDropdownId.toString().startsWith('m-') ? openDropdownId.toString().replace('m-', '') : openDropdownId))}
          onViewDetails={() => handleViewDetails(eventList.find(e => e.id === (openDropdownId.toString().startsWith('m-') ? openDropdownId.toString().replace('m-', '') : openDropdownId)))}
          onPublish={openPublishModal}
          onDelete={openDeleteModal}
          onClose={() => setOpenDropdownId(null)}
          position={dropdownPosition}
        />
      )}

      {/* VIEW DETAILS MODAL - Responsive */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-3 sm:px-4 overflow-y-auto py-4 sm:py-8">
          <div className="bg-gradient-to-br from-[#0d1f16] to-[#0a1610] border border-white/10 rounded-xl sm:rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeInScale">
            <div className="relative h-40 sm:h-48 md:h-64 rounded-t-xl sm:rounded-t-2xl overflow-hidden">
              {selectedEvent.event_banner ? (
                <>
                  <img 
                    src={`${API_CONFIG.BASE_URL}/${selectedEvent.event_banner}`} 
                    alt={selectedEvent.event_title}
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f16] via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <MaterialIcon name="event" className="text-4xl sm:text-6xl text-white/20" />
                </div>
              )}
              <button 
                onClick={closeModal} 
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-white hover:bg-black/70 transition-all active:scale-95"
              >
                <MaterialIcon name="close" className="text-base sm:text-xl" />
              </button>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border text-[9px] sm:text-xs font-bold ${getStatusStyles(STATUS_MAP[selectedEvent.status])?.text} ${getStatusStyles(STATUS_MAP[selectedEvent.status])?.bg} ${getStatusStyles(STATUS_MAP[selectedEvent.status])?.border}`}>
                  {STATUS_MAP[selectedEvent.status] || "PENDING"}
                </span>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 break-words">
                {selectedEvent.event_title}
              </h2>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400">
                  <MaterialIcon name="calendar_today" className="!text-base sm:!text-lg" />
                  <span className="text-xs sm:text-sm">{selectedEvent.start_date}{selectedEvent.end_date !== selectedEvent.start_date && ` - ${selectedEvent.end_date}`}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400">
                  <MaterialIcon name="schedule" className="!text-base sm:!text-lg" />
                  <span className="text-xs sm:text-sm">{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400 mb-1.5 sm:mb-2">
                    <MaterialIcon name="public" className="!text-base sm:!text-lg" />
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Event Mode</span>
                  </div>
                  <p className="text-white text-sm sm:text-base">{selectedEvent.event_mode === "online" ? "🌐 Online Event" : "📍 In-Person Event"}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400 mb-1.5 sm:mb-2">
                    <MaterialIcon name="location_on" className="!text-base sm:!text-lg" />
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Location</span>
                  </div>
                  {selectedEvent.event_mode === "online" ? (
                    <a href={selectedEvent.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all text-sm sm:text-base">
                      {selectedEvent.meeting_link || "N/A"}
                    </a>
                  ) : (
                    <div>
                      <p className="text-white text-sm sm:text-base">{selectedEvent.venue_name || "N/A"}</p>
                      {selectedEvent.full_address && <p className="text-slate-400 text-xs sm:text-sm mt-1 break-words">{selectedEvent.full_address}</p>}
                      {(selectedEvent.city || selectedEvent.state || selectedEvent.country) && (
                        <p className="text-slate-400 text-xs sm:text-sm mt-1">
                          {[selectedEvent.city, selectedEvent.state, selectedEvent.country].filter(Boolean).join(", ")}
                          {selectedEvent.pin_code && ` - ${selectedEvent.pin_code}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400 mb-2 sm:mb-3">
                  <MaterialIcon name="description" className="!text-base sm:!text-lg" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">About Event</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {selectedEvent.event_description || "No description provided"}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl">
                <div>
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] sm:text-xs mb-1">
                    <MaterialIcon name="person" className="!text-sm sm:!text-base" />
                    <span>Organizer</span>
                  </div>
                  <p className="text-white text-sm sm:text-base break-words">{selectedEvent.organizer_name || "N/A"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] sm:text-xs mb-1">
                    <MaterialIcon name="email" className="!text-sm sm:!text-base" />
                    <span>Email</span>
                  </div>
                  <p className="text-white text-sm sm:text-base break-words">{selectedEvent.organizer_email || "N/A"}</p>
                </div>
              </div>
              
              {selectedEvent.event_category_tags?.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400 mb-2 sm:mb-3">
                    <MaterialIcon name="sell" className="!text-base sm:!text-lg" />
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedEvent.event_category_tags.map((tag, i) => (
                      <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] sm:text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.supporting_documents?.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400 mb-2 sm:mb-3">
                    <MaterialIcon name="attach_file" className="!text-base sm:!text-lg" />
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Supporting Documents</span>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {selectedEvent.supporting_documents.map((doc, i) => (
                      <a key={i} href={`${API_CONFIG.BASE_URL}/${doc}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 sm:gap-2 text-blue-400 text-xs sm:text-sm p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all group">
                        <MaterialIcon name="description" className="!text-sm sm:!text-base shrink-0" />
                        <span className="flex-1 truncate">{doc.split("/").pop() || `Document ${i + 1}`}</span>
                        <MaterialIcon name="open_in_new" className="!text-sm sm:!text-base opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-3 sm:pt-4 border-t border-white/10">
                <button 
                  onClick={closeModal} 
                  className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 active:scale-95"
                >
                  <MaterialIcon name="close" className="!text-sm sm:!text-base" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL - Responsive */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-3 sm:px-4">
          <div className="bg-[#0d1f16] border border-blue-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 w-full max-w-[350px] sm:max-w-[400px] shadow-2xl text-center animate-fadeInScale">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MaterialIcon name="public" className="text-blue-400 text-2xl sm:text-3xl" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Publish Event?</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
              Are you sure? It will become visible to all users.
            </p>
            {publishError && (
              <div className="mb-4 sm:mb-5 p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-xs break-words">
                {publishError}
              </div>
            )}
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={closeModal} 
                disabled={processingEvents.has(selectedEventId)}
                className="flex-1 py-2 rounded-lg sm:rounded-xl border border-slate-500/30 text-slate-300 font-bold text-xs sm:text-sm hover:bg-white/5 transition-all disabled:opacity-50 active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPublish} 
                disabled={processingEvents.has(selectedEventId)}
                className="flex-1 py-2 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs sm:text-sm hover:bg-blue-500/20 transition-all flex justify-center items-center gap-1.5 sm:gap-2 disabled:opacity-50 active:scale-95"
              >
                {processingEvents.has(selectedEventId) ? (
                  <><MaterialIcon name="hourglass_empty" className="animate-spin !text-xs sm:!text-sm" />Publishing...</>
                ) : (
                  "Yes, Publish"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL - Responsive */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-3 sm:px-4">
          <div className="bg-[#1a0d0d] border border-red-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 w-full max-w-[350px] sm:max-w-[400px] shadow-2xl text-center animate-fadeInScale">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MaterialIcon name="delete_forever" className="text-red-400 text-2xl sm:text-3xl" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Delete Event?</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
              This action cannot be undone.
            </p>
            {deleteError && (
              <div className="mb-4 sm:mb-5 p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-xs break-words">
                {deleteError}
              </div>
            )}
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={closeModal} 
                disabled={processingEvents.has(selectedEventId)}
                className="flex-1 py-2 rounded-lg sm:rounded-xl border border-slate-500/30 text-slate-300 font-bold text-xs sm:text-sm hover:bg-white/5 transition-all disabled:opacity-50 active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={processingEvents.has(selectedEventId)}
                className="flex-1 py-2 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs sm:text-sm hover:bg-red-500/20 transition-all flex justify-center items-center gap-1.5 sm:gap-2 disabled:opacity-50 active:scale-95"
              >
                {processingEvents.has(selectedEventId) ? (
                  <><MaterialIcon name="hourglass_empty" className="animate-spin !text-xs sm:!text-sm" />Deleting...</>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.2s ease-out;
        }
        ::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default MyEvents;