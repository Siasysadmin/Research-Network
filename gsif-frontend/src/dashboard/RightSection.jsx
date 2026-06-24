import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api.config";

// ─── Event Detail Modal ───────────────────────────────────────────────────────
const EventDetailModal = ({ event, onClose, formatEventDate, formatTime, API_BASE }) => {
  if (!event) return null;

  const { month: startMonth, day: startDay } = formatEventDate(event.start_date);
  const { month: endMonth, day: endDay } = formatEventDate(event.end_date);

  const isOnline = event.event_mode === "online";

  const offlineLocation = [event.venue_name, event.full_address, event.city, event.state, event.country, event.pin_code]
    .filter(Boolean).map((s) => s.trim()).join(", ") || "Venue TBD";

  const bannerUrl = event.event_banner ? `${API_BASE}/${event.event_banner}` : null;

  const categories = Array.isArray(event.event_category_tags)
    ? event.event_category_tags
    : event.event_category_tags
    ? [event.event_category_tags]
    : [];

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0a120e] border border-[#32ff9922] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(50,255,153,0.08)] flex flex-col max-h-[90vh]">

        {/* Banner */}
        <div className="relative shrink-0">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={event.event_title}
              className="w-full h-44 object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-32 bg-[#111f17] flex items-center justify-center border-b border-[#32ff9915]">
              <span className="material-symbols-outlined text-[#32ff99] text-5xl opacity-40">event</span>
            </div>
          )}
          {/* Gradient overlay on banner */}
          {bannerUrl && <div className="absolute inset-0 bg-gradient-to-t from-[#0a120e] via-transparent to-transparent" />}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-[#0a120e]/80 hover:bg-[#32ff9915] border border-[#32ff9930] text-[#32ff99] rounded-full w-8 h-8 flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a2c transparent" }}>

          {/* Title + Organizer */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white leading-tight mb-1">
              {event.event_title?.trim()}
            </h2>
            {event.organizer_name && (
              <p className="text-xs font-semibold text-[#32ff99]">
                Organized by {event.organizer_name}
              </p>
            )}
          </div>

          {/* Mode Badge */}
          <div className="mb-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isOnline ? "bg-[#32ff9915] text-[#32ff99] border border-[#32ff9930]" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              <span className="material-symbols-outlined text-xs">{isOnline ? "videocam" : "place"}</span>
              {isOnline ? "Online / Virtual" : "In-Person"}
            </span>
          </div>

          {/* Info Grid */}
          <div className="space-y-3 mb-5">
            {/* Start Date */}
            <InfoRow icon="calendar_month" label="Start Date" value={`${startDay} ${startMonth}`} />

            {/* End Date */}
            {event.end_date && (
              <InfoRow icon="event_available" label="End Date" value={`${endDay} ${endMonth}`} />
            )}

            {/* Time */}
            <InfoRow
              icon="schedule"
              label="Time"
              value={`${formatTime(event.start_time)} – ${formatTime(event.end_time)}`}
            />

            {/* Location */}
            {isOnline ? (
              <>
                <InfoRow icon="location_on" label="Location" value="Online" />
                {event.meeting_link && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#32ff9910] border border-[#32ff9920] rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sm text-[#32ff99]">link</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Meeting Link</p>
                      <a
                        href={event.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#32ff99] hover:underline truncate block"
                      >
                        {event.meeting_link}
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {event.venue_name && <InfoRow icon="location_on" label="Venue" value={event.venue_name} />}
                {event.full_address && <InfoRow icon="map" label="Address" value={event.full_address} />}
                {(event.city || event.state || event.country) && (
                  <InfoRow
                    icon="public"
                    label="City / State / Country"
                    value={[event.city, event.state, event.country].filter(Boolean).join(", ")}
                  />
                )}
                {event.pin_code && <InfoRow icon="pin_drop" label="PIN Code" value={event.pin_code} />}
              </>
            )}

            {/* Organizer Email */}
            {event.organizer_email && (
              <InfoRow icon="mail" label="Contact Email" value={event.organizer_email} />
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#32ff9912] text-[#32ff99] border border-[#32ff9925]">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {(event.event_description || event.description) && (
            <div className="mb-5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">About this Event</p>
              <div className="bg-[#111f17] border border-[#32ff9912] rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
                {event.event_description || event.description}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[#32ff9912] bg-[#0a120e] flex gap-3">
          {event.meeting_link && isOnline && (
            <a
              href={event.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-[#32ff99] hover:bg-[#00e07a] text-black font-bold py-2.5 rounded-xl text-xs text-center transition-all"
            >
              Join Event
            </a>
          )}
          {event.registration_link && (
            <a
              href={event.registration_link}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-[#32ff99] hover:bg-[#00e07a] text-black font-bold py-2.5 rounded-xl text-xs text-center transition-all"
            >
              Register Now
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-[#32ff9910] hover:bg-[#32ff9920] border border-[#32ff9925] text-[#32ff99] font-semibold py-2.5 rounded-xl text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Helper component
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-[#32ff9910] border border-[#32ff9918] rounded-lg flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-sm text-[#32ff99]">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RightSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (result.status && result.data) {
          setEvents(result.data);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Notification click se navigate hone par event auto-open karo
  useEffect(() => {
    const openEventName = location.state?.openEventName;
    if (!openEventName || loading || events.length === 0) return;
    const matched = events.find(
      (e) => e.event_title?.trim().toLowerCase() === openEventName.trim().toLowerCase()
    );
    if (matched) setSelectedEvent(matched);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.openEventName, events, loading]);

  return (
    <div className="space-y-8">
      {/* Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          formatEventDate={formatEventDate}
          formatTime={formatTime}
          API_BASE={API_CONFIG.BASE_URL}
        />
      )}

      {/* Upcoming Events */}
      {(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingEvents = loading ? [] : events.filter((event) => new Date(event.start_date) >= today);
        if (!loading && upcomingEvents.length === 0) return null;
        const visibleEvents = showAllEvents ? upcomingEvents : upcomingEvents.slice(0, 3);
        return (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
            </div>

            <div className="space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ff88]"></div>
                  <span className="ml-3 text-slate-400 text-sm">Loading events...</span>
                </div>
              )}

              {!loading && (
                <>
                  {visibleEvents.map((event) => {
                    const { month, day } = formatEventDate(event.start_date);
                    const location =
                      event.event_mode === "online"
                        ? "Online"
                        : [event.city, event.state, event.country]
                            .filter(Boolean)
                            .map((s) => s.trim())
                            .join(", ") || "Venue TBD";

                    const bannerUrl = event.event_banner
                      ? `${API_CONFIG.BASE_URL}/${event.event_banner}`
                      : null;

                    return (
                      <div
                        key={event.id}
                        className="bg-[#141414] rounded-2xl border border-white/5 relative overflow-hidden group"
                      >
                        {bannerUrl && (
                          <div className="w-full h-28 overflow-hidden">
                            <img
                              src={bannerUrl}
                              alt={event.event_title}
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-14 bg-white/5 rounded-xl shrink-0">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">{month}</span>
                              <span className="text-xl font-bold text-[#00ff88] leading-none">{day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm leading-tight text-white truncate">
                                {event.event_title?.trim()}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                                <span className="material-symbols-outlined text-xs shrink-0">location_on</span>
                                {location}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs shrink-0">schedule</span>
                                {formatTime(event.start_time)} – {formatTime(event.end_time)}
                              </p>
                              <span
                                className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  event.event_mode === "online"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-[#00ff88]/10 text-[#00ff88]"
                                }`}
                              >
                                {event.event_mode}
                              </span>

                              <button
                                onClick={() => setSelectedEvent(event)}
                                className="mt-3 w-full bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-black font-bold py-2 rounded-lg text-xs transition-all"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {upcomingEvents.length > 3 && (
                    <button
                      onClick={() => setShowAllEvents(!showAllEvents)}
                      className="w-full mt-1 py-2.5 rounded-xl text-xs font-semibold border border-[#32ff9920] text-[#32ff9970] hover:text-[#32ff99] hover:border-[#32ff9940] transition-all"
                    >
                      {showAllEvents ? "Show less ↑" : `View all upcoming events (${upcomingEvents.length}) →`}
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        );
      })()}
    </div>
  );
};

export default RightSection;