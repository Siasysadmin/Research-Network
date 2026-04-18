import React, { useState, useRef } from "react";
import Layout, { MaterialIcon } from "../Layout/Layout";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

const DEFAULT_CATEGORIES = [
  "Climate Change",
  "Sustainability",
  "Circular Economy",
  "Renewable Energy",
  "Policy Research",
  "Bio-Diversity",
];

const CreateEvent = () => {
  const startDateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endDateRef = useRef(null);
  const endTimeRef = useRef(null);

  const [activeNav, setActiveNav] = useState("home");
  const [eventMode, setEventMode] = useState("online");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([
    "Climate Change",
    "Sustainability",
    "Circular Economy",
    "Renewable Energy",
    "Policy Research",
    "Bio-Diversity",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form Fields ──
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
    organizer_email: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  const handleRemoveDoc = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === "") return;
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

  // ── PUBLISH ──
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

      // ── Text fields ──
      body.append("event_title",       formData.event_title);
      body.append("event_description", formData.event_description);
      body.append("event_mode",        eventMode);
      body.append("meeting_link",      formData.meeting_link);
      body.append("venue_name",        formData.venue_name);
      body.append("full_address",      formData.full_address);
      body.append("country",           formData.country);
      body.append("state",             formData.state);
      body.append("city",              formData.city);
      body.append("pin_code",          formData.pin_code);
      body.append("start_date",        formData.start_date);
      body.append("end_date",          formData.end_date);
      body.append("start_time",        formData.start_time);
      body.append("end_time",          formData.end_time);
      body.append("organizer_name",    "GSIF");
      body.append("organizer_email",   formData.organizer_email);

      // ── Categories array ──
      selectedCategories.forEach((cat) =>
        body.append("event_category_tags[]", cat)
      );

      // ── Files ──
      body.append("event_banner", bannerFile);
      documents.forEach((doc) =>
        body.append("supporting_documents[]", doc)
      );

      const res = await fetch(`${API_CONFIG.BASE_URL}/event/create-event`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ Content-Type mat do — browser khud multipart boundary set karega
        },
        body,
      });

      const result = await res.json();

      if (result.status) {
        toast.success(result.message || "Event created successfully!");
        // Reset
        setFormData({
          event_title: "", event_description: "", meeting_link: "",
          venue_name: "", full_address: "", country: "", state: "",
          city: "", pin_code: "", start_date: "", end_date: "",
          start_time: "", end_time: "", organizer_email: "",
        });
        setBannerFile(null);
        setBannerPreview(null);
        setDocuments([]);
        setCategories([]);
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

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Create Event
          </h2>
          <p className="text-slate-400 text-lg">
            Add and publish a new GSIF event with all required details.
          </p>
        </div>

        <div className="space-y-8 pb-24">
          {/* 1. Basic Information */}
          <section className="bg-[#13231a] p-8 rounded-xl border border-[#1e3a2c]">
            <div className="flex items-center gap-3 mb-6">
              <MaterialIcon name="info" className="text-[#00ff88]" />
              <h3 className="text-xl font-bold text-white">Basic Information</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Event Title
                </label>
                <input
                  type="text"
                  name="event_title"
                  value={formData.event_title}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-[#1e3a2c] py-3 text-xl focus:border-[#00ff88] transition-all text-white outline-none"
                  placeholder="Enter a compelling title"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Description
                </label>
                <textarea
                  name="event_description"
                  value={formData.event_description}
                  onChange={handleChange}
                  className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-xl p-4 text-slate-300 focus:border-[#00ff88] outline-none resize-none"
                  placeholder="Describe the purpose and goals of the event..."
                  rows="5"
                />
              </div>
            </div>
          </section>

          {/* 2. Media */}
          <section className="bg-[#13231a] p-8 rounded-xl border border-[#1e3a2c]">
            <div className="flex items-center gap-3 mb-6">
              <MaterialIcon name="image" className="text-[#00ff88]" />
              <h3 className="text-xl font-bold text-white">Media</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Banner */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Event Banner
                </label>
                <label className="aspect-video rounded-xl bg-[#0a120e] border-2 border-dashed border-[#1e3a2c] flex items-center justify-center hover:border-[#00ff88]/50 transition-all cursor-pointer overflow-hidden">
                  <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleBannerUpload} />
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Event Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <MaterialIcon name="cloud_upload" className="text-3xl mb-2" />
                      <p className="text-xs font-bold uppercase">Drag & Drop Image</p>
                      <p className="text-[10px] opacity-50 mt-1">PNG, JPG up to 10MB (1920x1080)</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Documents */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Documents
                </label>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0a120e] rounded-lg border border-[#1e3a2c]">
                      <div className="flex items-center gap-3">
                        <MaterialIcon name="description" className="text-[#00ff88]" />
                        <div className="text-[10px]">
                          <p className="font-bold text-white">{doc.name}</p>
                          <p className="text-slate-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveDoc(index)} className="text-slate-500 hover:text-red-400">
                        <MaterialIcon name="close" className="text-sm" />
                      </button>
                    </div>
                  ))}
                  <label className="w-full py-3 border-2 border-dashed border-[#1e3a2c] rounded-lg text-[10px] font-bold text-slate-400 hover:text-white flex items-center justify-center gap-2 cursor-pointer">
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleDocUpload} />
                    <MaterialIcon name="add" className="text-sm" />
                    UPLOAD DOC
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Event Mode */}
          <section className="bg-[#13231a] p-8 rounded-xl border border-[#1e3a2c]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <MaterialIcon name="location_on" className="text-[#00ff88]" />
                <h3 className="text-xl font-bold text-white">Event Mode</h3>
              </div>
              <div className="flex bg-[#0a120e] p-1 rounded-lg border border-[#1e3a2c]">
                <button
                  onClick={() => setEventMode("online")}
                  className={`px-6 py-1.5 rounded-md text-xs font-bold transition-all ${eventMode === "online" ? "bg-[#00ff88] text-[#0a120e]" : "text-slate-500"}`}
                >Online</button>
                <button
                  onClick={() => setEventMode("offline")}
                  className={`px-6 py-1.5 rounded-md text-xs font-bold transition-all ${eventMode === "offline" ? "bg-[#00ff88] text-[#0a120e]" : "text-slate-500"}`}
                >Offline</button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Online → Meeting Link */}
              {eventMode === "online" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Meeting Link
                  </label>
                  <div className="relative">
                    <MaterialIcon name="link" className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      name="meeting_link"
                      value={formData.meeting_link}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-[#1e3a2c] pl-8 py-3 text-white focus:border-[#00ff88] outline-none"
                      placeholder="https://zoom.us/j/..."
                      type="url"
                    />
                  </div>
                </div>
              )}

              {/* Offline → Venue Details */}
              {eventMode === "offline" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Venue Name",    name: "venue_name",   placeholder: "e.g. Convention Hall" },
                    { label: "Full Address",  name: "full_address", placeholder: "Street, Area" },
                    { label: "Country",       name: "country",      placeholder: "e.g. India" },
                    { label: "State",         name: "state",        placeholder: "e.g. MP" },
                    { label: "City",          name: "city",         placeholder: "e.g. Khargone" },
                    { label: "PIN Code",      name: "pin_code",     placeholder: "e.g. 454552" },
                  ].map(({ label, name, placeholder }) => (
                    <div key={name}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        {label}
                      </label>
                      <input
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg p-3 text-white focus:border-[#00ff88] outline-none"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 4. Organizer */}
          <section className="bg-[#13231a] p-8 rounded-xl border border-[#1e3a2c]">
            <div className="flex items-center gap-3 mb-6">
              <MaterialIcon name="badge" className="text-[#00ff88]" />
              <h3 className="text-xl font-bold text-white">Organizer</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Organization Name
                </label>
                <input
                  className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg p-3 text-slate-400 font-bold outline-none cursor-not-allowed"
                  disabled value="GSIF"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Contact Email
                </label>
                <input
                  name="organizer_email"
                  value={formData.organizer_email}
                  onChange={handleChange}
                  className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg p-3 text-white focus:border-[#00ff88] outline-none"
                  placeholder="network@gsif.org"
                  type="email"
                />
              </div>
            </div>
          </section>

          {/* 5. Date & Time */}
          <section className="bg-[#13231a] p-8 rounded-xl border border-[#1e3a2c]">
            <div className="flex items-center gap-3 mb-8">
              <MaterialIcon name="schedule" className="text-[#00ff88]" />
              <h3 className="text-xl font-bold text-white">Date & Time</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Start */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">START DATE</label>
                  <div className="relative">
                    <input ref={startDateRef} type="date" name="start_date" value={formData.start_date} onChange={handleChange}
                      className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg p-3 pr-12 text-white outline-none focus:border-[#00ff88]"
                      onClick={(e) => e.target.showPicker()} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff88] cursor-pointer z-10"
                      onClick={() => startDateRef.current.showPicker()}>
                      <MaterialIcon name="calendar_month" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">START TIME</label>
                  <div className="relative">
                    <input ref={startTimeRef} type="time" name="start_time" value={formData.start_time} onChange={handleChange}
                      className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg p-3 pr-12 text-white outline-none focus:border-[#00ff88]"
                      onClick={(e) => e.target.showPicker()} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff88] cursor-pointer z-10"
                      onClick={() => startTimeRef.current.showPicker()}>
                      <MaterialIcon name="schedule" />
                    </div>
                  </div>
                </div>
              </div>

              {/* End */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">END DATE</label>
                  <div className="relative">
                    <input ref={endDateRef} type="date" name="end_date" value={formData.end_date} onChange={handleChange}
                      className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg p-3 pr-12 text-white outline-none focus:border-[#00ff88]"
                      onClick={(e) => e.target.showPicker()} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff88] cursor-pointer z-10"
                      onClick={() => endDateRef.current.showPicker()}>
                      <MaterialIcon name="calendar_month" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">END TIME</label>
                  <div className="relative">
                    <input ref={endTimeRef} type="time" name="end_time" value={formData.end_time} onChange={handleChange}
                      className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg p-3 pr-12 text-white outline-none focus:border-[#00ff88]"
                      onClick={(e) => e.target.showPicker()} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff88] cursor-pointer z-10"
                      onClick={() => endTimeRef.current.showPicker()}>
                      <MaterialIcon name="schedule" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Category & Tags */}
          <section className="bg-[#13231a] p-8 rounded-xl border border-[#1e3a2c]">
            <div className="flex items-center gap-3 mb-6">
              <MaterialIcon name="label" className="text-[#00ff88]" />
              <h3 className="text-xl font-bold text-white">Category & Tags</h3>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">
                Select Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, index) => (
                  <div key={index}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                      selectedCategories.includes(cat)
                        ? "border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10"
                        : "border-[#1e3a2c] text-slate-400 hover:border-[#00ff88]/50"
                    }`}
                  >
                    <span className="cursor-pointer"
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                        )
                      }
                    >{cat}</span>
                    {!DEFAULT_CATEGORIES.includes(cat) && (
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveCategory(cat); }}
                        className="text-slate-400 hover:text-red-400">
                        <MaterialIcon name="close" className="text-sm" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setShowInput(!showInput)}
                  className="px-4 py-2 rounded-full bg-[#0a120e] text-slate-400 text-xs font-bold border border-[#1e3a2c] flex items-center gap-1 hover:text-white">
                  <MaterialIcon name="add" className="text-xs" />
                  Add New
                </button>
              </div>

              {showInput && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    placeholder="Enter new category"
                    className="bg-[#0a120e] border border-[#1e3a2c] text-white px-3 py-2 rounded-lg outline-none focus:border-[#00ff88]"
                  />
                  <button onClick={handleAddCategory}
                    className="px-4 py-2 bg-[#00ff88] text-black rounded-lg text-xs font-bold hover:scale-105 transition">
                    Add
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Publish Button */}
        <div className="fixed bottom-0 left-64 right-0 h-20 bg-[#0a120e]/80 backdrop-blur-md flex items-center justify-end px-12 z-40 border-t border-[#00ff88]">
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="px-10 py-3 rounded-full bg-[#00ff88] text-[#0a120e] font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:scale-105 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Publishing...
              </>
            ) : (
              "Publish Event"
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEvent;