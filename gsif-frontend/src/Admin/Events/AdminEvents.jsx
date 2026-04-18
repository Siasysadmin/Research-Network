import React, { useState, useEffect } from "react";
import Layout, { MaterialIcon } from "../Layout/Layout";
import API_CONFIG from "../../config/api.config";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-[#00ff8810] border border-[#00ff8818] rounded-lg flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-sm text-[#00ff88]">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-slate-200">{value}</p>
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0a120e] border border-[#00ff8822] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(0,255,136,0.08)] flex flex-col max-h-[90vh]">
        <div className="relative shrink-0">
          {bannerUrl ? (
            <img src={bannerUrl} alt={event.event_title} className="w-full h-44 object-cover"
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div className="w-full h-32 bg-[#111f17] flex items-center justify-center border-b border-[#00ff8815]">
              <span className="material-symbols-outlined text-[#00ff88] text-5xl opacity-40">event</span>
            </div>
          )}
          {bannerUrl && <div className="absolute inset-0 bg-gradient-to-t from-[#0a120e] via-transparent to-transparent" />}
          <button onClick={onClose}
            className="absolute top-3 right-3 bg-[#0a120e]/80 hover:bg-[#00ff8815] border border-[#00ff8830] text-[#00ff88] rounded-full w-8 h-8 flex items-center justify-center transition-all">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a2c transparent" }}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white leading-tight mb-1">{event.event_title?.trim()}</h2>
            {event.organizer_name && <p className="text-xs font-semibold text-[#00ff88]">Organized by {event.organizer_name}</p>}
          </div>

          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isOnline ? "bg-[#00ff8815] text-[#00ff88] border border-[#00ff8830]" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00ff8812] text-[#00ff88] border border-[#00ff8825]">{cat}</span>
                ))}
              </div>
            </div>
          )}

          {(event.event_description || event.description) && (
            <div className="mb-5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">About this Event</p>
              <div className="bg-[#111f17] border border-[#00ff8812] rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
                {event.event_description || event.description}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-[#00ff8812] bg-[#0a120e]">
          <button onClick={onClose}
            className="w-full bg-[#00ff8810] hover:bg-[#00ff8820] border border-[#00ff8825] text-[#00ff88] font-semibold py-2.5 rounded-xl text-xs transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminEvents = () => {
  const [activeNav, setActiveNav] = useState("events");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
        const result = await res.json();
        if (result.status && result.data) setEvents(result.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
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
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">Events</h2>
          <p className="text-slate-400 text-lg">All published GSIF events</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ff88]"></div>
            <span className="ml-3 text-slate-400 text-sm">Loading events...</span>
          </div>
        )}

        {/* No events */}
        {!loading && events.length === 0 && (
          <div className="bg-[#13231a] border border-[#1e3a2c] rounded-2xl p-16 text-center">
            <MaterialIcon name="event_busy" className="text-[#00ff88] text-5xl opacity-30" />
            <p className="text-slate-400 text-sm mt-4 font-semibold">No events published yet</p>
            <p className="text-slate-600 text-xs mt-1">Published events will appear here</p>
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
                <div key={event.id} className="bg-[#13231a] border border-[#1e3a2c] rounded-2xl overflow-hidden hover:border-[#00ff88]/30 transition-all">
                  {bannerUrl ? (
                    <div className="w-full h-36 overflow-hidden relative">
                      <img src={bannerUrl} alt={event.event_title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }} />
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isPast
                            ? "bg-black/60 text-slate-300 border-slate-500/40"
                            : "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/40"
                        }`}>
                          {isPast ? "Past" : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 bg-[#0a120e] flex items-center justify-center border-b border-[#1e3a2c]">
                      <MaterialIcon name="event" className="text-[#00ff88] text-4xl opacity-20" />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-14 bg-[#00ff8815] border border-[#00ff8830] rounded-xl shrink-0">
                        <span className="text-[10px] font-bold text-[#00ff8880] uppercase">{month}</span>
                        <span className="text-xl font-bold text-[#00ff88] leading-none">{day}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">{event.event_title?.trim()}</h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                          <MaterialIcon name="location_on" className="text-xs shrink-0" />
                          {location}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
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
                    </div>

                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="mt-4 w-full bg-[#00ff8810] hover:bg-[#00ff88] border border-[#00ff8830] text-[#00ff88] hover:text-black font-bold py-2 rounded-lg text-xs transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style jsx global>{`
  /* Chrome, Safari aur Opera ke liye */
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  /* Firefox ke liye */
  * {
    scrollbar-width: none;
  }

  /* IE aur Edge ke liye */
  * {
    -ms-overflow-style: none;
  }
`}</style>
    </Layout>
  );
};

export default AdminEvents;