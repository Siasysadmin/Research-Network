import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// ─── InfoRow Helper ───────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-[#32ff9910] border border-[#32ff9918] rounded-lg flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-sm text-[#32ff99]">
        {icon}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  </div>
);

// ─── Event Detail Modal ───────────────────────────────────────────────────────
const EventDetailModal = ({ event, onClose, formatEventDate, formatTime }) => {
  if (!event) return null;

  const { month: startMonth, day: startDay } = formatEventDate(
    event.start_date,
  );
  const { month: endMonth, day: endDay } = formatEventDate(event.end_date);
  const isOnline = event.event_mode === "online";
  const bannerUrl = event.event_banner
    ? `${API_CONFIG.BASE_URL}/${event.event_banner}`
    : null;

  const categories = Array.isArray(event.event_category_tags)
    ? event.event_category_tags
    : event.event_category_tags
      ? [event.event_category_tags]
      : [];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0a120e] border border-[#32ff9922] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(50,255,153,0.08)] flex flex-col max-h-[90vh]">
        <div className="relative shrink-0">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={event.event_title}
              className="w-full h-44 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-32 bg-[#111f17] flex items-center justify-center border-b border-[#32ff9915]">
              <span className="material-symbols-outlined text-[#32ff99] text-5xl opacity-40">
                event
              </span>
            </div>
          )}
          {bannerUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a120e] via-transparent to-transparent" />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-[#0a120e]/80 hover:bg-[#32ff9915] border border-[#32ff9930] text-[#32ff99] rounded-full w-8 h-8 flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div
          className="overflow-y-auto flex-1 px-6 py-5"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#1e3a2c transparent",
          }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white leading-tight mb-1">
              {event.event_title?.trim()}
            </h2>
            {event.organizer_name && (
              <p className="text-xs font-semibold text-[#32ff99]">
                Organized by {event.organizer_name}
              </p>
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">
              <span className="material-symbols-outlined text-xs">history</span>
              Past Event
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOnline ? "bg-[#32ff9915] text-[#32ff99] border border-[#32ff9930]" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}
            >
              <span className="material-symbols-outlined text-xs">
                {isOnline ? "videocam" : "place"}
              </span>
              {isOnline ? "Online" : "In-Person"}
            </span>
          </div>

          <div className="space-y-3 mb-5">
            <InfoRow
              icon="calendar_month"
              label="Start Date"
              value={`${startDay} ${startMonth}`}
            />
            {event.end_date && (
              <InfoRow
                icon="event_available"
                label="End Date"
                value={`${endDay} ${endMonth}`}
              />
            )}
            <InfoRow
              icon="schedule"
              label="Time"
              value={`${formatTime(event.start_time)} – ${formatTime(event.end_time)}`}
            />
            {isOnline ? (
              <InfoRow icon="location_on" label="Location" value="Online" />
            ) : (
              <>
                {event.venue_name && (
                  <InfoRow
                    icon="location_on"
                    label="Venue"
                    value={event.venue_name}
                  />
                )}
                {event.full_address && (
                  <InfoRow
                    icon="map"
                    label="Address"
                    value={event.full_address}
                  />
                )}
                {(event.city || event.state || event.country) && (
                  <InfoRow
                    icon="public"
                    label="City / State / Country"
                    value={[event.city, event.state, event.country]
                      .filter(Boolean)
                      .join(", ")}
                  />
                )}
              </>
            )}
            {event.organizer_email && (
              <InfoRow
                icon="mail"
                label="Contact Email"
                value={event.organizer_email}
              />
            )}
          </div>

          {categories.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#32ff9912] text-[#32ff99] border border-[#32ff9925]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(event.event_description || event.description) && (
            <div className="mb-5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                About this Event
              </p>
              <div className="bg-[#111f17] border border-[#32ff9912] rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
                {event.event_description || event.description}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-[#32ff9912] bg-[#0a120e]">
          <button
            onClick={onClose}
            className="w-full bg-[#32ff9910] hover:bg-[#32ff9920] border border-[#32ff9925] text-[#32ff99] font-semibold py-2.5 rounded-xl text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Event Card ───────────────────────────────────────────────────────────────
const EventCard = ({ event, index, onSelect, formatEventDate, formatTime }) => {
  const { month, day } = formatEventDate(event.start_date);
  const { month: endMonth, day: endDay } = formatEventDate(event.end_date);
  const isMultiDay = event.end_date && event.end_date !== event.start_date;
  const isOnline = event.event_mode === "online";

  const location = isOnline
    ? "Online"
    : [event.city, event.state, event.country].filter(Boolean).join(", ") ||
      "Venue TBD";

  const bannerUrl = event.event_banner
    ? `${API_CONFIG.BASE_URL}/${event.event_banner}`
    : null;

  const categories = Array.isArray(event.event_category_tags)
    ? event.event_category_tags
    : event.event_category_tags
      ? [event.event_category_tags]
      : [];

  return (
    <div className="group relative bg-[#0d1a12] border border-[#1a3525] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#32ff9935] hover:shadow-[0_4px_32px_rgba(50,255,153,0.06)]">
      {/* Banner / Header */}
      <div className="relative w-full h-36 overflow-hidden">
        {bannerUrl ? (
          <>
            <img
              src={bannerUrl}
              alt={event.event_title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a12] via-[#0d1a12]/30 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f2318] via-[#0d1a12] to-[#081510] flex items-center justify-center relative">
            <span className="material-symbols-outlined text-[#32ff99]/8 text-8xl">
              event
            </span>
            <div className="absolute top-4 right-6 w-14 h-14 rounded-full border border-[#32ff9910]" />
            <div className="absolute bottom-3 left-5 w-8 h-8 rounded-full border border-[#32ff9908]" />
            <div className="absolute top-2 left-10 w-4 h-4 rounded-full bg-[#32ff9906]" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-slate-400 border border-slate-600/30">
            Past
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm border ${
              isOnline
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : "bg-[#32ff9915] text-[#32ff99] border-[#32ff9930]"
            }`}
          >
            {isOnline ? "Online" : "In-Person"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Date + Title */}
        <div className="flex gap-3 mb-3">
          <div className="flex flex-col items-center justify-center min-w-[46px] h-[54px] bg-[#32ff9910] border border-[#32ff9925] rounded-xl shrink-0">
            <span className="text-[9px] font-black text-[#32ff9960] uppercase tracking-wider leading-none">
              {month}
            </span>
            <span className="text-2xl font-black text-[#32ff99] leading-tight">
              {day}
            </span>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-bold text-[13px] text-white leading-snug line-clamp-2 group-hover:text-[#e8fff4] transition-colors">
              {event.event_title?.trim()}
            </h4>
            {event.organizer_name && (
              <p className="text-[10px] text-[#32ff9960] mt-0.5 truncate">
                by {event.organizer_name}
              </p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="material-symbols-outlined text-[12px] text-[#32ff9950] shrink-0">
              location_on
            </span>
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="material-symbols-outlined text-[12px] text-[#32ff9950] shrink-0">
              schedule
            </span>
            <span>
              {formatTime(event.start_time)} – {formatTime(event.end_time)}
            </span>
          </div>
          {isMultiDay && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="material-symbols-outlined text-[12px] text-[#32ff9950] shrink-0">
                date_range
              </span>
              <span>
                {day} {month} – {endDay} {endMonth}
              </span>
            </div>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.slice(0, 3).map((cat, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#32ff9908] text-[#32ff9970] border border-[#32ff9918]"
              >
                {cat}
              </span>
            ))}
            {categories.length > 3 && (
              <span className="px-2 py-0.5 text-[9px] text-slate-600">
                +{categories.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-[#32ff9915] to-transparent mb-3" />

        {/* CTA */}
        <button
          onClick={() => onSelect(event)}
          className="w-full flex items-center justify-center gap-1.5 bg-[#32ff9908] hover:bg-[#32ff99] border border-[#32ff9920] hover:border-[#32ff99] text-[#32ff9970] hover:text-black font-bold py-2 rounded-xl text-[11px] transition-all duration-200 group/btn"
        >
          <span className="material-symbols-outlined text-[13px]">
            open_in_new
          </span>
          View Details
        </button>
      </div>
    </div>
  );
};

// ─── Main Events Page ─────────────────────────────────────────────────────────
const Events = () => {
  const navigate = useNavigate();
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
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = getAuthToken();
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [res1, res2] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}/event/get-events`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_CONFIG.BASE_URL}/user-event/get-publish-event`, {
            method: "GET",
            headers,
          }),
        ]);

        const [result1, result2] = await Promise.all([
          res1.json(),
          res2.json(),
        ]);

        let combined = [];
        if (result1.status && Array.isArray(result1.data))
          combined = [...combined, ...result1.data];
        if (result2.status && Array.isArray(result2.data))
          combined = [...combined, ...result2.data];

        // Duplicate remove
        const seen = new Set();
        combined = combined.filter((e) => {
          if (seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });

        // Latest pehle
        combined.sort(
          (a, b) => new Date(b.start_date) - new Date(a.start_date),
        );

        setEvents(combined);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Sirf past events — end_date ya start_date check
  const pastEvents = events.filter((event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(event.end_date || event.start_date);
    checkDate.setHours(23, 59, 59, 999);
    return checkDate < today;
  });

  return (
    <DashboardLayout>
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          formatEventDate={formatEventDate}
          formatTime={formatTime}
        />
      )}

     <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full bg-gradient-to-b from-[#32ff99] to-[#32ff9940]" />
            <h2 className="text-2xl font-black text-white tracking-tight">
              Events
            </h2>
           
          </div>
          <p className="text-sm text-slate-500 ml-4">
            Past events organized by GSIF
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-[#32ff9920] border-t-[#32ff99] animate-spin" />
              <div
                className="absolute inset-1 rounded-full border-2 border-[#32ff9910] border-b-[#32ff9940] animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              />
            </div>
            <span className="text-slate-500 text-sm">Loading events...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && pastEvents.length === 0 && (
          <div className="relative bg-[#0d1a12] border border-[#1a3525] rounded-2xl p-16 text-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
              <span
                className="material-symbols-outlined text-[#32ff99]"
                style={{ fontSize: "180px" }}
              >
                event_busy
              </span>
            </div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#32ff9910] border border-[#32ff9920] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[#32ff99] text-3xl">
                  event_busy
                </span>
              </div>
              <p className="text-white font-bold text-base mb-1">
                No past events yet
              </p>
              <p className="text-slate-500 text-sm">
                Completed events will appear here
              </p>
            </div>
          </div>
        )}

        {/* Events Grid — 2 column on sm+ */}
        {!loading && pastEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {" "}
            {pastEvents.map((event, index) => (
              <EventCard
                key={`${event.id}-${index}`}
                event={event}
                index={index}
                onSelect={setSelectedEvent}
                formatEventDate={formatEventDate}
                formatTime={formatTime}
              />
            ))}
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
          -ms-overflow-style: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Events;
