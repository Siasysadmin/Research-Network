import React, { useState, useEffect } from 'react';

const Step4 = ({ progress, onNext, onBack }) => {
  // Array of objects to store multiple experiences
  const [experiences, setExperiences] = useState([
    { id: Date.now(), jobRole: '', companyName: '', duration: '', description: '' }
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
    setExperiences(prev => 
      prev.map(exp => exp.id === id ? { ...exp, [name]: value } : exp)
    );
  };

  const addExperience = () => {
    setExperiences(prev => [
      ...prev,
      { id: Date.now(), jobRole: '', companyName: '', duration: '', description: '' }
    ]);
  };

  const removeExperience = (id) => {
    if (experiences.length > 1) {
      setExperiences(prev => prev.filter(exp => exp.id !== id));
    }
  };

  const handleNext = () => {
    // API ke liye console check
    console.log("Saving Step 4 Data:", experiences);
    localStorage.setItem("step4", JSON.stringify(experiences));
    onNext();
  };

  return (
    <div className="min-h-screen bg-[#10221a] font-display flex flex-col">
      <main className="flex-1 flex justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="w-full max-w-[640px] flex flex-col gap-6 sm:gap-8 md:gap-10">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1.5">
              <p className="text-white text-[11px] sm:text-[13px] uppercase tracking-[0.2em] font-semibold">
                Step 4 of 6
              </p>
              <div className="rounded-full bg-white/10 h-1 overflow-hidden w-20 sm:w-28">
                <div
                  className="h-full rounded-full bg-[#0df287] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={handleNext}
              className="flex items-center gap-1 px-0 py-0 border-none bg-transparent hover:text-white text-white/50 text-[11px] sm:text-xs font-semibold tracking-wider transition-all">
              Skip 
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-white tracking-tight text-2xl sm:text-3xl md:text-4xl font-bold leading-tight pb-3">
              Work Experience
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Add your professional research background.
            </p>
          </div>

          {/* Experience List */}
          <div className="flex flex-col gap-8">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="relative p-5 rounded-2xl border-2 border-[#31684e] bg-[#1a2e25]/30 flex flex-col gap-4">
                
                {/* Remove Button */}
                {experiences.length > 1 && (
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="absolute -top-3 -right-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-all border border-red-500/50"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}

                <p className="text-[#0df287] text-[10px] font-bold uppercase tracking-widest">Experience #{index + 1}</p>

                {/* Job Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-white/70 uppercase">Job Role</label>
                  <input
                    type="text"
                    name="jobRole"
                    value={exp.jobRole}
                    onChange={(e) => handleChange(exp.id, e)}
                    placeholder="e.g. Lead Researcher"
                    className="w-full bg-[#1a2e25]/50 border border-[#31684e] rounded-xl px-4 py-2.5 text-white focus:border-[#0df287] outline-none transition-all placeholder:text-[#8eccaf]/30"
                  />
                </div>

                {/* Company & Duration Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-white/70 uppercase">Company</label>
                    <input
                      type="text"
                      name="companyName"
                      value={exp.companyName}
                      onChange={(e) => handleChange(exp.id, e)}
                      placeholder="e.g. Stanford University"
                      className="w-full bg-[#1a2e25]/50 border border-[#31684e] rounded-xl px-4 py-2.5 text-white focus:border-[#0df287] outline-none transition-all placeholder:text-[#8eccaf]/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-white/70 uppercase">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={exp.duration}
                      onChange={(e) => handleChange(exp.id, e)}
                      placeholder="2021 - Present"
                      className="w-full bg-[#1a2e25]/50 border border-[#31684e] rounded-xl px-4 py-2.5 text-white focus:border-[#0df287] outline-none transition-all placeholder:text-[#8eccaf]/30"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-white/70 uppercase">Description</label>
                  <textarea
                    name="description"
                    value={exp.description}
                    onChange={(e) => handleChange(exp.id, e)}
                    rows="3"
                    className="w-full bg-[#1a2e25]/50 border border-[#31684e] rounded-xl px-4 py-2.5 text-white focus:border-[#0df287] outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            ))}

            {/* Add Experience Button */}
            <button
              onClick={addExperience}
              className="w-full py-4 border-2 border-dashed border-[#31684e] rounded-2xl text-[#8eccaf] hover:text-[#0df287] hover:border-[#0df287] hover:bg-[#0df287]/5 transition-all flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Add Another Experience
            </button>
          </div>

          {/* Navigation Buttons (Updated to match Step 3) */}
          <div className="flex items-center justify-between gap-3 p-4 mt-8 border-t border-[#214a37]">
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