import React, { useState, useEffect } from "react";

const Step4 = ({ progress, onNext, onBack }) => {
  // Array of objects to store multiple experiences
  const [experiences, setExperiences] = useState([
    {
      id: Date.now(),
      jobRole: "",
      companyName: "",
      duration: "",
      description: "",
    },
  ]);

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("step4");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Array.isArray(data) && data.length > 0) {
          setExperiences(data);
        }
      } catch (error) {
        console.error("Error loading data", error);
      }
    }
  }, []);

  const handleChange = (id, e) => {
    const { name, value } = e.target;
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [name]: value } : exp)),
    );
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: Date.now(),
        jobRole: "",
        companyName: "",
        duration: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (id) => {
    if (experiences.length > 1) {
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
    }
  };

  const handleNext = () => {
    // API ke liye console check
    localStorage.setItem("step4", JSON.stringify(experiences));
    onNext();
  };

  return (
    <div
      className="
min-h-screen font-display flex flex-col

bg-white text-slate-900
dark:bg-[#10221a] dark:text-white
"
    >
      {" "}
      <main className="flex-1 flex justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="w-full max-w-[640px] flex flex-col gap-6 sm:gap-8 md:gap-10">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1.5">
              <p
                className="
text-[11px] sm:text-[13px] uppercase tracking-[0.2em] font-semibold

text-slate-700
dark:text-white
"
              >
                {" "}
                Step 4 of 6
              </p>
              <div className="rounded-full bg-gray-200 dark:bg-[#10221a]/10 h-1 overflow-hidden">
                {" "}
                <div
                  className="h-full rounded-full bg-[#0df287] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="
flex items-center gap-1 px-0 py-0 border-none bg-transparent text-xs font-semibold tracking-wider transition-all

text-gray-500 hover:text-black
dark:text-white/60 dark:hover:text-white
"
            >
              {" "}
              Skip
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>

          <div className="text-center">
            <h1
              className="
tracking-tight text-2xl sm:text-3xl md:text-4xl font-bold

text-slate-900
dark:text-white
"
            >
              {" "}
              Work Experience
            </h1>
            <p
              className="
text-sm sm:text-base

text-gray-500
dark:text-gray-300
"
            >
              {" "}
              Add your professional research background.
            </p>
          </div>

          {/* Experience List */}
          <div className="flex flex-col gap-8">
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className="
relative p-5 rounded-2xl border-2 flex flex-col gap-4

bg-gray-50 border-gray-200
dark:bg-[#1a2e25]/30 dark:border-[#31684e]
"
              >
                {/* Remove Button */}
                {experiences.length > 1 && (
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute -top-3 -right-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-all border border-red-500/50"
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                )}

                <p className="text-[#0df287] text-[10px] font-bold uppercase tracking-widest">
                  Experience #{index + 1}
                </p>

                {/* Job Role */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="
text-[11px] font-semibold uppercase

text-gray-600
dark:text-white/70
"
                  >
                    Job Role
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    value={exp.jobRole}
                    onChange={(e) => handleChange(exp.id, e)}
                    placeholder="e.g. Lead Researcher"
className="
w-full rounded-xl px-4 py-2.5 outline-none transition-all

bg-white border border-gray-300 text-slate-900
placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#1a2e25] dark:border-[#31684e] dark:text-white
dark:placeholder:text-[#8eccaf]/40
"                  />
                </div>

                {/* Company & Duration Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="
text-[11px] font-semibold uppercase

text-gray-600
dark:text-white/70
"
                    >
                      {" "}
                      Company
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={exp.companyName}
                      onChange={(e) => handleChange(exp.id, e)}
                      placeholder="e.g. Stanford University"
className="
w-full rounded-xl px-4 py-2.5 outline-none transition-all

bg-white border border-gray-300 text-slate-900
placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#1a2e25] dark:border-[#31684e] dark:text-white
dark:placeholder:text-[#8eccaf]/40
"                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="
text-[11px] font-semibold uppercase

text-gray-600
dark:text-white/70
"
                    >
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={exp.duration}
                      onChange={(e) => handleChange(exp.id, e)}
                      placeholder="2021 - Present"
className="
w-full rounded-xl px-4 py-2.5 outline-none transition-all

bg-white border border-gray-300 text-slate-900
placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#1a2e25] dark:border-[#31684e] dark:text-white
dark:placeholder:text-[#8eccaf]/40
"                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="
text-[11px] font-semibold uppercase
text-gray-600
dark:text-white/70
"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={exp.description}
                    onChange={(e) => handleChange(exp.id, e)}
                    rows="3"
className="
w-full rounded-xl px-4 py-2.5 outline-none transition-all

bg-white border border-gray-300 text-slate-900
placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#1a2e25] dark:border-[#31684e] dark:text-white
dark:placeholder:text-[#8eccaf]/40
"                  ></textarea>
                </div>
              </div>
            ))}

            {/* Add Experience Button */}
            <button
              onClick={addExperience}
              className="
w-full py-4 border-2 border-dashed rounded-2xl transition-all flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest

border-gray-300 text-gray-500 hover:text-[#00ff88] hover:border-[#00ff88] hover:bg-[#00ff88]/5

dark:border-[#31684e] dark:text-[#8eccaf] dark:hover:text-[#0df287] dark:hover:border-[#0df287] dark:hover:bg-[#0df287]/5
"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Add Another Experience
            </button>
          </div>

          {/* Navigation Buttons (Updated to match Step 3) */}
          <div className="flex items-center justify-between gap-3 p-4 mt-8 border-t border-gray-200
dark:border-[#214a37]">
            <button
              onClick={onBack}
              className="px-8 sm:px-10 py-3 rounded-[10px] border-2 border-[#06f988]/30 text-[#06f988] font-bold hover:bg-[#06f988]/5 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">
                arrow_back
              </span>
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-8 sm:px-10 py-3 rounded-lg bg-[#06f988] text-[#0f231a] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Next
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </main>
      {/* Footer gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0df287]/40 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Step4;
