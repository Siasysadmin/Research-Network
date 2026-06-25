import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../DashboardLayout";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const DEFAULT_CATEGORIES = [
  "Climate Change",
  "Sustainability",
  "Circular Economy",
  "Renewable Energy",
  "Policy Research",
  "Bio-Diversity",
];

const inputCls =
  "w-full rounded-xl px-4 py-3 sm:py-4 text-sm sm:text-base outline-none transition-all shadow-sm " +
  // LIGHT THEME
  "bg-[#f5f7fa] border border-slate-300 text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-400 " +
  // DARK THEME
  "dark:bg-[#0a120e] dark:border-[#1e3a2c] dark:text-white dark:placeholder:text-slate-400 " +
  // FOCUS
  "focus:border-[#00b86b] dark:focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20";

const CreateEvent = () => {
  const startDateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endDateRef = useRef(null);
  const endTimeRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [eventMode, setEventMode] = useState("online");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    event_title: "",
    event_description: "",
    meeting_link: "",
    venue_name: "",
    full_address: "",
    country: "",
    state: "",
    city: "",
    pin_code: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    organizer_name: "",
    organizer_email: "",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) setDocuments((prev) => [...prev, file]);
  };
  const handleRemoveDoc = (index) =>
    setDocuments((prev) => prev.filter((_, i) => i !== index));

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    setCategories((prev) => [...prev, newCategory.trim()]);
    setSelectedCategories((prev) => [...prev, newCategory.trim()]);
    setNewCategory("");
    setShowInput(false);
  };

  const handleRemoveCategory = (cat) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
    setSelectedCategories((prev) => prev.filter((c) => c !== cat));
  };

  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const handlePublish = async () => {
    if (!formData.event_title.trim()) {
      toast.error("Event title is required.");
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      toast.error("Start and end date are required.");
      return;
    }
    if (!bannerFile) {
      toast.error("Please upload an event banner.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const body = new FormData();

      Object.entries(formData).forEach(([k, v]) => body.append(k, v));
      body.append("event_mode", eventMode);
      selectedCategories.forEach((cat) =>
        body.append("event_category_tags[]", cat),
      );
      body.append("event_banner", bannerFile);
      documents.forEach((doc) => body.append("supporting_documents[]", doc));

      const res = await fetch(
        `${API_CONFIG.BASE_URL}/user-event/create-event`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        },
      );
      const result = await res.json();

      if (result.status) {
        toast.success(result.message || "Event created successfully!");
        setFormData({
          event_title: "",
          event_description: "",
          meeting_link: "",
          venue_name: "",
          full_address: "",
          country: "",
          state: "",
          city: "",
          pin_code: "",
          start_date: "",
          end_date: "",
          start_time: "",
          end_time: "",
          organizer_name: "GSIF",
          organizer_email: "",
        });
        setBannerFile(null);
        setBannerPreview(null);
        setDocuments([]);
        setCategories(DEFAULT_CATEGORIES);
        setSelectedCategories([]);
        setEventMode("online");
      } else {
        toast.error(result.message || "Failed to create event.");
      }
    } catch (err) {
      console.error("Create event error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reusable date/time field ─────────────────────────────────────────────
  const DateTimeField = ({ label, inputRef, type, name, value }) => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          onClick={(e) => e.target.showPicker?.()}
          className={`${inputCls} pr-10`}
        />
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff88] cursor-pointer z-10"
          onClick={() => inputRef.current?.showPicker?.()}
        >
          <MaterialIcon
            name={type === "date" ? "calendar_month" : "schedule"}
            className="text-base sm:text-lg"
          />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Create Event
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Add and publish a new GSIF event with all required details.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-8 sm:pb-12">
            {/* 1. Basic Information */}
            <section className="bg-white/95 dark:bg-[#13231a] backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-[#1e3a2c] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              {" "}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <MaterialIcon
                  name="info"
                  className="text-[#00ff88] text-xl sm:text-2xl"
                />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Basic Information
                </h3>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="event_title"
                    value={formData.event_title}
                    onChange={handleChange}
                    className={`${inputCls} text-base sm:text-xl`}
                    placeholder="Enter a compelling title"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">
                    Description
                  </label>
                  <textarea
                    name="event_description"
                    value={formData.event_description}
                    onChange={handleChange}
                    className={`${inputCls} resize-none`}
                    placeholder="Describe the purpose and goals of the event..."
                    rows={5}
                  />
                </div>
              </div>
            </section>

            {/* 2. Media */}
            <section className="bg-white/95 dark:bg-[#13231a] backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-[#1e3a2c] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              {" "}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <MaterialIcon
                  name="image"
                  className="text-[#00ff88] text-xl sm:text-2xl"
                />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Media
                </h3>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Banner */}
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                    Event Banner *
                  </label>
                  <label className="aspect-video rounded-xl bg-[#f8fafc] dark:bg-[#0a120e] border-2 border-dashed border-[#1e3a2c] flex items-center justify-center hover:border-[#00ff88]/50 transition-all cursor-pointer overflow-hidden">
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Event Banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-500 dark:text-slate-400 p-4 text-center">
                        <MaterialIcon
                          name="cloud_upload"
                          className="text-2xl sm:text-3xl mb-2"
                        />
                        <p className="text-xs font-bold uppercase">
                          {isMobile ? "Tap to Upload" : "Drag & Drop Image"}
                        </p>
                        <p className="text-[10px] opacity-50 mt-1 hidden sm:block">
                          PNG, JPG up to 10MB (1920×1080)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Documents */}
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                    Documents
                  </label>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#f8fafc] dark:bg-[#0a120e] rounded-xl border border-[#1e3a2c]"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <MaterialIcon
                            name="description"
                            className="text-[#00ff88] shrink-0"
                          />
                          <div className="text-[10px] flex-1 min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {doc.name}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveDoc(index)}
                          className="text-slate-500 dark:text-slate-400 hover:text-red-400 shrink-0 ml-2"
                        >
                          <MaterialIcon name="close" className="text-sm" />
                        </button>
                      </div>
                    ))}
                    <label className="w-full py-3 bg-[#f8fafc] dark:bg-[#0a120e] border-2 border-dashed border-[#1e3a2c] rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-[#00ff88]/50">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleDocUpload}
                      />
                      <MaterialIcon name="add" className="text-sm" />
                      {isMobile ? "ADD DOC" : "UPLOAD DOCUMENT"}
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Event Mode */}
            <section className="bg-white/95 dark:bg-[#13231a] backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-[#1e3a2c] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              {" "}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <MaterialIcon
                    name="location_on"
                    className="text-[#00ff88] text-xl sm:text-2xl"
                  />
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Event Mode
                  </h3>
                </div>
                <div className="flex bg-[#f8fafc] dark:bg-[#0a120e] p-1 rounded-xl border border-[#1e3a2c] w-full sm:w-auto">
                  {["online", "offline"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setEventMode(mode)}
                      className={`flex-1 sm:flex-none px-4 sm:px-6 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                        eventMode === mode
                          ? "bg-[#00ff88] text-[#0a120e]"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                {eventMode === "online" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">
                      Meeting Link
                    </label>
                    <div className="relative">
                      <MaterialIcon
                        name="link"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg"
                      />
                      <input
                        name="meeting_link"
                        value={formData.meeting_link}
                        onChange={handleChange}
                        type="url"
                        className={`${inputCls} pl-11`}
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  </div>
                )}

                {eventMode === "offline" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      {
                        label: "Venue Name",
                        name: "venue_name",
                        placeholder: "e.g. Convention Hall",
                      },
                      {
                        label: "Full Address",
                        name: "full_address",
                        placeholder: "Street, Area",
                      },
                      {
                        label: "Country",
                        name: "country",
                        placeholder: "e.g. India",
                      },
                      { label: "State", name: "state", placeholder: "e.g. MP" },
                      {
                        label: "City",
                        name: "city",
                        placeholder: "e.g. Khargone",
                      },
                      {
                        label: "PIN Code",
                        name: "pin_code",
                        placeholder: "e.g. 454552",
                      },
                    ].map(({ label, name, placeholder }) => (
                      <div key={name}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">
                          {label}
                        </label>
                        <input
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          className={inputCls}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Organizer */}
            <section className="bg-white/95 dark:bg-[#13231a] backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-[#1e3a2c] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <MaterialIcon
                  name="badge"
                  className="text-[#00ff88] text-xl sm:text-2xl"
                />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Organizer
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Organization Name
                  </label>
                  <input
                    name="organizer_name"
                    value={formData.organizer_name}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. GSIF"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Contact Email
                  </label>
                  <input
                    name="organizer_email"
                    value={formData.organizer_email}
                    onChange={handleChange}
                    type="email"
                    className={inputCls}
                    placeholder="Enter your email "
                  />
                </div>
              </div>
            </section>

            {/* 5. Date & Time */}
            <section className="bg-white/95 dark:bg-[#13231a] backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-[#1e3a2c] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              {" "}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <MaterialIcon
                  name="schedule"
                  className="text-[#00ff88] text-xl sm:text-2xl"
                />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Date & Time
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <DateTimeField
                    label="START DATE *"
                    inputRef={startDateRef}
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                  />
                  <DateTimeField
                    label="START TIME *"
                    inputRef={startTimeRef}
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                  />
                </div>
                <div className="space-y-4">
                  <DateTimeField
                    label="END DATE *"
                    inputRef={endDateRef}
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                  />
                  <DateTimeField
                    label="END TIME *"
                    inputRef={endTimeRef}
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                  />
                </div>
              </div>
            </section>

            {/* 6. Category & Tags */}
            <section className="bg-white/95 dark:bg-[#13231a] backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-[#1e3a2c] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              {" "}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <MaterialIcon
                  name="label"
                  className="text-[#00ff88] text-xl sm:text-2xl"
                />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Category & Tags
                </h3>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 ml-1">
                  Select Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border text-[10px] sm:text-xs font-medium transition-all ${
                        selectedCategories.includes(cat)
                          ? "border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10"
                          : "border-[#1e3a2c] text-slate-500 dark:text-slate-400 hover:border-[#00ff88]/50"
                      }`}
                    >
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedCategories((prev) =>
                            prev.includes(cat)
                              ? prev.filter((c) => c !== cat)
                              : [...prev, cat],
                          )
                        }
                      >
                        {cat}
                      </span>
                      {!DEFAULT_CATEGORIES.includes(cat) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCategory(cat);
                          }}
                          className="text-slate-500 dark:text-slate-400 hover:text-red-400"
                        >
                          <MaterialIcon
                            name="close"
                            className="text-xs sm:text-sm"
                          />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setShowInput(!showInput)}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#f8fafc] dark:bg-[#0a120e] text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold border border-[#1e3a2c] flex items-center gap-1 hover:text-slate-900 dark:text-white transition-all"
                  >
                    <MaterialIcon name="add" className="text-xs sm:text-sm" />
                    Add New
                  </button>
                </div>

                {showInput && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddCategory()
                      }
                      placeholder="Enter new category"
                      className={inputCls}
                    />
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-[#00ff88] text-black rounded-xl text-xs font-bold hover:scale-105 transition-all"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 7. Publish */}
            <div className="pt-4 pb-8 sm:pt-6 sm:pb-10">
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 rounded-full bg-[#00ff88] text-[#0a120e] font-black uppercase tracking-widest text-xs sm:text-sm shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:scale-105 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Publishing...
                  </>
                ) : (
                  "Publish Event"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Global styles: hide scrollbar + autofill fix ─────────────────────── */}
      <style jsx global>{`
        /* Hide scrollbar across the board */
        ::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        /* ── Autofill override — keeps dark theme on browser-filled fields ── */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        select:-webkit-autofill {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px #06110d inset !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: white;
        }

        /* date/time picker icon tint in webkit */
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default CreateEvent;
