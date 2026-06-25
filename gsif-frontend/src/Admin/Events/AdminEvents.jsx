import React, { useState, useEffect } from "react";
import Layout, { MaterialIcon } from "../Layout/Layout";
import { toast } from "react-toastify";
import API_CONFIG from "../../config/api.config";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-green-50 dark:bg-[#00ff8810] border border-green-200 dark:border-[#00ff8818] rounded-lg flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-sm text-[#00ff88]">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

const EventDetailModal = ({ event, onClose, formatEventDate, formatTime }) => {
  if (!event) return null;

  const { month: startMonth, day: startDay } = formatEventDate(event.start_date);
  const { month: endMonth, day: endDay } = formatEventDate(event.end_date);
  const isOnline = event.event_mode === "online";
  const bannerUrl = event.event_banner ? `${API_CONFIG.BASE_URL}/${event.event_banner}` : null;

  const categories = Array.isArray(event.event_category_tags)
    ? event.event_category_tags
    : event.event_category_tags ? [event.event_category_tags] : [];

  return (
    <div
  className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 dark:bg-black/85 backdrop-blur-sm"
  onClick={(e) => e.target === e.currentTarget && onClose()}
>
      <div className="bg-white dark:bg-[#0a120e] border border-gray-200 dark:border-[#00ff8822] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(0,255,136,0.08)] flex flex-col max-h-[90vh]">
        <div className="relative shrink-0">
          {bannerUrl ? (
            <img src={bannerUrl} alt={event.event_title} className="w-full h-44 object-cover"
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div className="w-full h-32 bg-gray-100 dark:bg-[#111f17] flex items-center justify-center border-b border-[#00ff8815]">
              <span className="material-symbols-outlined text-[#00ff88] text-5xl opacity-40">event</span>
            </div>
          )}
          {bannerUrl && <div className="absolute inset-0 bg-gradient-to-t from-[#0a120e] via-transparent to-transparent" />}
          <button onClick={onClose}
            className="absolute top-3 right-3 bg-gray-100 dark:bg-[#0a120e] hover:bg-[#00ff8815] border border-gray-200 dark:border-[#00ff8830] text-[#00ff88] rounded-full w-8 h-8 flex items-center justify-center transition-all">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a2c transparent" }}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{event.event_title?.trim()}</h2>
            {event.organizer_name && <p className="text-xs font-semibold text-[#00ff88]">Organized by {event.organizer_name}</p>}
          </div>

          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isOnline ? "bg-[#00ff8815] text-[#00ff88] border border-gray-200 dark:border-[#00ff8830]" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              <span className="material-symbols-outlined text-xs">{isOnline ? "videocam" : "place"}</span>
              {isOnline ? "Online" : "In-Person"}
            </span>
          </div>

          <div className="space-y-3 mb-5">
            <InfoRow icon="calendar_month" label="Start Date" value={`${startDay} ${startMonth}`} />
            {event.end_date && <InfoRow icon="event_available" label="End Date" value={`${endDay} ${endMonth}`} />}
            <InfoRow icon="schedule" label="Time" value={`${formatTime(event.start_time)} – ${formatTime(event.end_time)}`} />
            {isOnline ? (
              <InfoRow icon="location_on" label="Location" value="Online" />
            ) : (
              <>
                {event.venue_name && <InfoRow icon="location_on" label="Venue" value={event.venue_name} />}
                {event.full_address && <InfoRow icon="map" label="Address" value={event.full_address} />}
                {(event.city || event.state || event.country) && (
                  <InfoRow icon="public" label="City / State / Country" value={[event.city, event.state, event.country].filter(Boolean).join(", ")} />
                )}
              </>
            )}
            {event.organizer_email && <InfoRow icon="mail" label="Contact Email" value={event.organizer_email} />}
          </div>

          {categories.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00ff8812] text-[#00ff88] border border-[#00ff8825]">{cat}</span>
                ))}
              </div>
            </div>
          )}

          {(event.event_description || event.description) && (
            <div className="mb-5">
              <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-2">About this Event</p>
              <div className="bg-gray-100 dark:bg-[#111f17] border border-gray-200 dark:border-[#00ff8812] rounded-xl p-4 text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                {event.event_description || event.description}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-[#00ff8812] bg-gray-50 dark:bg-[#0a120e]">
          <button onClick={onClose}
            className="w-full bg-green-100 dark:bg-[#00ff8810] hover:bg-[#00ff8820] border border-[#00ff8825] text-[#00ff88] font-semibold py-2.5 rounded-xl text-xs transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ThreeDotMenu Component - Small and on right side of card
const ThreeDotMenu = ({ onViewDetails, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.three-dot-menu')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="three-dot-menu relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-[#00ff8815] rounded-lg transition-colors"
      >
        <MaterialIcon name="more_vert" className="text-gray-500 dark:text-slate-400 text-lg" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#00ff8830] rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              onViewDetails();
              setIsOpen(false);
            }}
            className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-slate-300 hover:bg-[#00ff8815] hover:text-[#00ff88] rounded-t-lg transition-colors flex items-center gap-2"
          >
            <MaterialIcon name="visibility" className="text-sm" />
            View Details
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-b-lg transition-colors flex items-center gap-2"
          >
            <MaterialIcon name="delete" className="text-sm" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const AdminEvents = () => {
  const [activeNav, setActiveNav] = useState("events");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    eventId: null,
  });

  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const formatEventDate = (dateStr) => {
    if (!dateStr) return { month: "---", day: "--" };
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const date = new Date();
    date.setHours(+h, +m);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_CONFIG.BASE_URL}/event/get-events`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
       
        let result = {};

        try {
          result = await res.json();
        } catch (e) {
          console.log("Not JSON response");
        }

        if (result.status && result.data) setEvents(result.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

const handleDeleteEvent = async (eventId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/event/delete-event`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
        }),
      }
    );

    const result = await response.json();

    if (result.status) {
      setEvents((prev) =>
        prev.filter((event) => event.event_id !== eventId)
      );
      alert("Event deleted successfully");
    } else {
      alert(result.message || "Event delete failed");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};

  return (

    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>

      {deleteModal.open && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-[#1e3a2c] bg-white dark:bg-[#13231a] p-6 shadow-2xl">

      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Delete Event
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Are you sure you want to delete this event? This action cannot be undone.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() =>
            setDeleteModal({ open: false, eventId: null })
          }
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-[#1e3a2c] text-gray-700 dark:text-slate-300 text-sm"
        >
          Cancel
        </button>

        <button
          onClick={() => handleDeleteEvent(deleteModal.eventId)}
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          formatEventDate={formatEventDate}
          formatTime={formatTime}
        />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Events</h2>
          <p className="text-gray-500 dark:text-slate-400 text-lg">All published GSIF events</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ff88]"></div>
            <span className="ml-3 text-gray-500 dark:text-slate-400 text-sm">Loading events...</span>
          </div>
        )}

        {/* No events */}
        {!loading && events.length === 0 && (
          <div className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-2xl p-16 text-center">
            <MaterialIcon name="event_busy" className="text-[#00ff88] text-5xl opacity-30" />
            <p className="text-gray-600 dark:text-slate-400 text-sm mt-4 font-semibold">No events published yet</p>
            <p className="text-gray-500 dark:text-slate-600 text-xs mt-1">Published events will appear here</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const { month, day } = formatEventDate(event.start_date);
              const location = event.event_mode === "online"
                ? "Online"
                : [event.city, event.state, event.country].filter(Boolean).join(", ") || "Venue TBD";
              const bannerUrl = event.event_banner ? `${API_CONFIG.BASE_URL}/${event.event_banner}` : null;

              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = new Date(event.start_date) < today;

              return (
                <div key={event.id} className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-2xl overflow-hidden hover:border-green-400 dark:hover:border-[#00ff88]/30 transition-all">
                  {bannerUrl ? (
                    <div className="w-full h-36 overflow-hidden relative">
                      <img src={bannerUrl} alt={event.event_title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }} />
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isPast
                            ? "bg-gray-100 text-gray-700 dark:bg-black/40 dark:text-slate-300 border border-gray-300 dark:border-slate-600"
                            : "bg-green-100 text-green-700 dark:bg-[#00ff88]/20 dark:text-[#00ff88] border border-green-300 dark:border-[#00ff88]/40"
                        }`}>
                          {isPast ? "Past" : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 bg-white dark:bg-[#0a120e] flex items-center justify-center border-b border-gray-200 dark:border-[#1e3a2c]">
                      <MaterialIcon name="event" className="text-[#00ff88] text-4xl opacity-20" />
                    </div>
                  )}

                  <div className="p-5">
                    {/* Main row with date, info and 3-dot menu */}
                    <div className="flex gap-3">
                      {/* Date Box */}
                      <div className="flex flex-col items-center justify-center w-12 h-14 bg-[#00ff8815] border border-gray-200 dark:border-[#00ff8830] rounded-xl shrink-0">
                        <span className="text-[10px] font-bold text-[#00ff8880] uppercase">{month}</span>
                        <span className="text-xl font-bold text-[#00ff88] leading-none">{day}</span>
                      </div>

                      {/* Event Info - Takes remaining space */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate pr-2">{event.event_title?.trim()}</h4>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                          <MaterialIcon name="location_on" className="text-xs shrink-0" />
                          {location}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <MaterialIcon name="schedule" className="text-xs shrink-0" />
                          {formatTime(event.start_time)} – {formatTime(event.end_time)}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          event.event_mode === "online"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-[#00ff8815] text-[#00ff88]"
                        }`}>
                          {event.event_mode}
                        </span>
                      </div>

                      {/* 3-dot menu - Right side */}
                      <div className="shrink-0 self-start">
                        <ThreeDotMenu 
                          onViewDetails={() => setSelectedEvent(event)}
                          onDelete={() =>
                            setDeleteModal({
                              open: true,
                              eventId: event.id,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style jsx global>{`
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  * {
    scrollbar-width: none;
  }

  * {
    -ms-overflow-style: none;
  }
`}</style>
    </Layout>
  );
};

export default AdminEvents;