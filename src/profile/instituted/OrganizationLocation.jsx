import React, { useState, useEffect } from "react";

const OrganizationLocation = ({ progress, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
  });

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("orgStep2");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData({
          country: parsedData.country || "",
          state: parsedData.state || "",
          city: parsedData.city || "",
        });
      } catch (error) {
        console.error("Error parsing saved location data:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all fields are filled (since they're required)
    if (!formData.country || !formData.state || !formData.city) {
      alert("Please fill in all fields or click Skip");
      return;
    }

    // Save karo aur next step pe jao
    localStorage.setItem(
      "orgStep2",
      JSON.stringify({
        country: formData.country,
        state: formData.state,
        city: formData.city,
      }),
    );
    if (onNext) onNext();
  };

  const handleSkip = () => {
    localStorage.setItem(
      "orgStep2",
      JSON.stringify({ country: "", state: "", city: "" }),
    );
    if (onNext) onNext();
  };

  return (
    <main
      className="
min-h-screen flex flex-col items-center py-20 px-4 md:px-0 font-sans

bg-white text-slate-900
dark:bg-[#10221a] dark:text-white
"
    >
      {" "}
      <div className="w-full max-w-[640px] flex flex-col gap-12">
        {/* Step Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3 w-32">
            <p className="text-slate-700 dark:text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
              Step 2 of 5
            </p>
            <div
              className="
h-1 w-28 rounded-full overflow-hidden relative

bg-gray-300
dark:bg-white/10
"
            >
              {" "}
              <div
                className="
h-1 w-28 rounded-full overflow-hidden relative
bg-gray-300 dark:bg-white/10
"
              >
                <div
                  className="h-full bg-[#00ff88] rounded-full absolute left-0 top-0 transition-all duration-500"
                  style={{ width: `${progress || 20}%` }} // fallback
                />
              </div>
            </div>
          </div>
 <button
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-900
dark:text-white/60 dark:hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 mt-0.5"
              type="button"
            >
              Skip{" "}
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl md:text-[40px] font-bold tracking-tight leading-tight text-slate-900 dark:text-white">
              Where is your institutions based?
            </h2>

            <p className="text-gray-600 dark:text-white/40 text-lg">
              Help other institutions find you by specifying your headquarters
              location.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-6">
              {/* Country Input */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold text-slate-700 dark:text-white uppercase tracking-[0.15em]">
                  Country <span className="text-[#00ff88]">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  placeholder="e.g. India"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="
w-full rounded-xl border-2 p-4 outline-none transition-all

bg-gray-100 border-gray-300 text-slate-900 placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#1a2e25] dark:border-[#31684e] dark:text-white dark:placeholder:text-white/20
"
                />
              </div>

              {/* State & City Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-white uppercase tracking-[0.15em]">
                    State / Province <span className="text-[#00ff88]">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. Madhya Pradesh"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="
w-full rounded-xl border-2 p-4 outline-none transition-all

bg-gray-100 border-gray-300 text-slate-900 placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#1a2e25] dark:border-[#31684e] dark:text-white dark:placeholder:text-white/20
"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-white uppercase tracking-[0.15em]">
                    City <span className="text-[#00ff88]">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Dewas"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="
w-full rounded-xl border-2 p-4 outline-none transition-all

bg-gray-100 border-gray-300 text-slate-900 placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#1a2e25] dark:border-[#31684e] dark:text-white dark:placeholder:text-white/20
"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#214a37]">
              <button
                type="button"
                onClick={onBack}
                className="px-8 py-3 rounded-lg border-2 border-[#00ff88]/30 text-[#00ff88] font-bold hover:bg-[#00ff88]/5 flex items-center gap-2 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_back
                </span>
                Back
              </button>
              <button
                type="submit"
                className="px-10 py-3 rounded-lg bg-[#00ff88] text-[#0b1410] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center gap-2 active:scale-95"
              >
                Next
                <span className="material-symbols-outlined text-xl">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default OrganizationLocation;
