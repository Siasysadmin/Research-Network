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
  const data = await res.json();
  return data;
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
      return { text: "text-amber-400", border: "border-amber-400/30", bg: "bg-amber-400/10", dot: "bg-amber-400" };
    case "APPROVED":
      return { text: "text-[#32ff99]", border: "border-[#32ff99]/30", bg: "bg-[#32ff99]/10", dot: "bg-[#32ff99]" };
    case "PUBLISHED":
      return { text: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/10", dot: "bg-blue-400" };
    case "REJECTED":
      return { text: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/10", dot: "bg-red-400" };
    default:
      return { text: "text-slate-400", border: "border-slate-500/20", bg: "bg-slate-500/5", dot: "bg-slate-400" };
  }
};

const MyEvents = () => {
  const navigate = useNavigate();
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [processingEvents, setProcessingEvents] = useState(new Set());
  const [openDropdownId, setOpenDropdownId] = useState(null);

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

  const toggleDropdown = (eventId) => {
    setOpenDropdownId(openDropdownId === eventId ? null : eventId);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleViewDetails = (event) => {
    setSelectedEvent(event.fullEvent);
    setShowDetailsModal(true);
    setOpenDropdownId(null);
  };

  const openPublishModal = (eventId) => {
    setSelectedEventId(eventId);
    setPublishError(null);
    setShowPublishModal(true);
  };

  const closeModal = () => {
    setShowPublishModal(false);
    setShowDetailsModal(false);
    setSelectedEvent(null);
    setSelectedEventId(null);
    setPublishError(null);
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ event_id: selectedEventId }),
      });

      const data = await response.json();

      if (data.status) {
        setEventList((prev) =>
          prev.map((e) =>
            e.id === selectedEventId ? {
                ...e, status: "PUBLISHED",
                dateSubtext: `Published on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
              } : e
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
      setProcessingEvents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedEventId);
        return newSet;
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">My Events</h1>
            <p className="text-xs sm:text-sm text-slate-400">Track your event submissions</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-event")}
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-[#32ff99] border border-[#32ff99]/30 hover:border-[#32ff99] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0"
          >
            <MaterialIcon name="add" className="text-base sm:text-lg" />
            <span className="hidden xs:inline">Create Event</span>
            <span className="inline xs:hidden">Add</span>
          </button>
        </div>

        {/* STATES */}
        {loading && <div className="flex justify-center items-center py-16 sm:py-20 text-slate-400 text-xs sm:text-sm"><MaterialIcon name="hourglass_empty" className="animate-spin mr-2" /> Loading events...</div>}
        {error && !loading && <div className="flex justify-center items-center py-16 sm:py-20 text-red-400 text-xs sm:text-sm gap-2"><MaterialIcon name="error_outline" /> Failed to load events: {error}</div>}
        {!loading && !error && eventList.length === 0 && <div className="flex justify-center items-center py-16 sm:py-20 text-slate-500 text-xs sm:text-sm gap-2"><MaterialIcon name="event_busy" /> No events found.</div>}

        {/* EVENTS LIST */}
        {!loading && !error && eventList.length > 0 && (
          <div className="flex flex-col gap-3 sm:gap-4">
            {eventList.map((event) => {
              const styles = getStatusStyles(event.status);
              return (
                <div key={event.id} className="bg-[#0d1a12] border border-white/5 hover:border-white/10 transition-colors rounded-lg sm:rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-5 relative overflow-hidden">
                  
                  {/* DATE BADGE */}
                  <div className="flex sm:flex-col items-center gap-3 sm:gap-0 order-2 sm:order-1 shrink-0">
                    <div className="flex sm:flex-col items-center justify-center w-auto sm:w-12">
                      <span className={`text-[9px] sm:text-[10px] font-semibold tracking-widest ${styles.text}`}>{event.month}</span>
                      <span className={`text-xl sm:text-2xl font-bold leading-tight ${styles.text}`}>{event.day}</span>
                    </div>
                  </div>

                  {/* IMAGE */}
                  <div className="w-full sm:w-[80px] md:w-[100px] h-[160px] sm:h-[80px] md:h-[100px] shrink-0 order-1 sm:order-2">
                    <img src={event.image} alt={event.title} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} className="w-full h-full object-cover rounded-lg" />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0 order-3">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <MaterialIcon name="schedule" className="!text-base shrink-0" />
                        <span className="truncate">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MaterialIcon name="location_on" className="!text-base shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* STATUS + ACTIONS */}
                  <div className="flex flex-col sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto order-4 pt-2 sm:pt-0 sm:shrink-0 sm:pr-0">
                    <span className={`px-3 sm:px-4 py-1 rounded-full border ${styles.border} ${styles.bg} ${styles.text} text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wider whitespace-nowrap`}>
                      {event.status}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1">{event.dateSubtext}</span>
                    
                    <div className="flex items-center gap-2 mt-1 w-full sm:w-auto">
                      {event.status === "APPROVED" && (
                        <button
                          onClick={() => openPublishModal(event.id)}
                          className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg border border-blue-400/40 text-blue-400 hover:bg-blue-400/10 transition-colors text-[10px] sm:text-xs font-bold whitespace-nowrap"
                        >
                          Publish Event
                        </button>
                      )}
                    </div>
                  </div>

                  {/* THREE DOTS MENU - Only View Details */}
                  <div className="relative order-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(event.id);
                      }}
                      className="text-slate-500 hover:text-white transition-colors p-1 shrink-0"
                    >
                      <MaterialIcon name="more_horiz" className="text-base sm:text-lg" />
                    </button>
                    
                    {/* Dropdown Menu - Only View Details Option */}
                    {openDropdownId === event.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-[#1a2a1f] border border-white/10 rounded-lg shadow-lg z-10 overflow-hidden">
                        <button
                          onClick={() => handleViewDetails(event)}
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <MaterialIcon name="visibility" className="!text-sm" />
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL - IMPROVED UI */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-8">
          <div className="bg-gradient-to-br from-[#0d1f16] to-[#0a1610] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
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
              
              {/* Close Button */}
              <button 
                onClick={closeModal} 
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-all"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
              
              {/* Status Badge on Image */}
              <div className="absolute bottom-4 left-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusStyles(STATUS_MAP[selectedEvent.status])?.text} ${getStatusStyles(STATUS_MAP[selectedEvent.status])?.bg} ${getStatusStyles(STATUS_MAP[selectedEvent.status])?.border}`}>
                  {STATUS_MAP[selectedEvent.status] || "PENDING"}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{selectedEvent.event_title}</h2>
              
              {/* Date & Time Row */}
              <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-slate-400">
                  <MaterialIcon name="calendar_today" className="!text-lg" />
                  <span className="text-sm">{selectedEvent.start_date} {selectedEvent.end_date !== selectedEvent.start_date && `- ${selectedEvent.end_date}`}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MaterialIcon name="schedule" className="!text-lg" />
                  <span className="text-sm">{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</span>
                </div>
              </div>
              
              {/* Event Mode & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <MaterialIcon name="public" className="!text-lg" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Event Mode</span>
                  </div>
                  <p className="text-white font-medium">
                    {selectedEvent.event_mode === 'online' ? '🌐 Online Event' : '📍 In-Person Event'}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <MaterialIcon name="location_on" className="!text-lg" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
                  </div>
                  {selectedEvent.event_mode === 'online' ? (
                    <a 
                      href={selectedEvent.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:underline break-all"
                    >
                      {selectedEvent.meeting_link || "N/A"}
                    </a>
                  ) : (
                    <div>
                      <p className="text-white">{selectedEvent.venue_name || "N/A"}</p>
                      {selectedEvent.full_address && (
                        <p className="text-slate-400 text-sm mt-1">{selectedEvent.full_address}</p>
                      )}
                      {(selectedEvent.city || selectedEvent.state || selectedEvent.country) && (
                        <p className="text-slate-400 text-sm mt-1">
                          {[selectedEvent.city, selectedEvent.state, selectedEvent.country].filter(Boolean).join(", ")}
                          {selectedEvent.pin_code && ` - ${selectedEvent.pin_code}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <MaterialIcon name="description" className="!text-lg" />
                  <span className="text-xs font-semibold uppercase tracking-wider">About Event</span>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.event_description || "No description provided"}
                </p>
              </div>
              
              {/* Organizer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-xl">
                <div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                    <MaterialIcon name="person" className="!text-sm" />
                    <span>Organizer</span>
                  </div>
                  <p className="text-white font-medium">{selectedEvent.organizer_name || "N/A"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                    <MaterialIcon name="email" className="!text-sm" />
                    <span>Email</span>
                  </div>
                  <p className="text-white">{selectedEvent.organizer_email || "N/A"}</p>
                </div>
              </div>
              
              {/* Categories */}
              {selectedEvent.event_category_tags && selectedEvent.event_category_tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <MaterialIcon name="sell" className="!text-lg" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.event_category_tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Supporting Documents */}
              {selectedEvent.supporting_documents && selectedEvent.supporting_documents.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <MaterialIcon name="attach_file" className="!text-lg" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Supporting Documents</span>
                  </div>
                  <div className="space-y-2">
                    {selectedEvent.supporting_documents.map((doc, index) => (
                      <a 
                        key={index}
                        href={`${API_CONFIG.BASE_URL}/${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:underline text-sm p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <MaterialIcon name="description" className="!text-sm" />
                        <span className="flex-1 truncate">{doc.split('/').pop() || `Document ${index + 1}`}</span>
                        <MaterialIcon name="open_in_new" className="!text-sm opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all font-medium flex items-center gap-2"
                >
                  <MaterialIcon name="close" className="!text-sm" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH CONFIRMATION MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#0d1f16] border border-blue-500/30 rounded-2xl p-6 sm:p-8 w-full max-w-[400px] shadow-2xl text-center relative overflow-hidden">
            
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon name="public" className="text-blue-400 text-3xl" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Publish Event?</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Are you sure you want to publish this event? It will become visible to all users.
            </p>

            {publishError && (
              <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {publishError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={processingEvents.has(selectedEventId)}
                className="flex-1 py-2.5 rounded-xl border border-slate-500/30 text-slate-300 font-bold text-sm hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublish}
                disabled={processingEvents.has(selectedEventId)}
                className="flex-1 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-sm hover:bg-blue-500/20 transition-all flex justify-center items-center gap-2"
              >
                {processingEvents.has(selectedEventId) ? (
                  <>
                    <MaterialIcon name="hourglass_empty" className="animate-spin !text-sm" />
                    Publishing...
                  </>
                ) : (
                  "Yes, Publish"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        ::-webkit-scrollbar { display: none; width: 0; height: 0; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </DashboardLayout>
  );
};

export default MyEvents;