import React, { useState, useEffect } from "react";

const Step2 = ({ progress, onNext, onBack }) => {
  const [selectedSDGs, setSelectedSDGs] = useState([]);

  const sdgs = [
    { id: 1, icon: "payments", title: "No Poverty" },
    { id: 2, icon: "nutrition", title: "Zero Hunger" },
    { id: 3, icon: "health_and_safety", title: "Good Health and Well-being" },
    { id: 4, icon: "school", title: "Quality Education" },
    { id: 5, icon: "wc", title: "Gender Equality" },
    { id: 6, icon: "water_drop", title: "Clean Water and Sanitation" },
    { id: 7, icon: "bolt", title: "Affordable and Clean Energy" },
    { id: 8, icon: "trending_up", title: "Decent Work and Economic Growth" },
    { id: 9, icon: "precision_manufacturing", title: "Industry, Innovation and Infrastructure" },
    { id: 10, icon: "equal", title: "Reduced Inequalities" },
    { id: 11, icon: "apartment", title: "Sustainable Cities and Communities" },
    { id: 12, icon: "recycling", title: "Responsible Consumption and Production" },
    { id: 13, icon: "thermostat", title: "Climate Action" },
    { id: 14, icon: "waves", title: "Life Below Water" },
    { id: 15, icon: "forest", title: "Life on Land" },
    { id: 16, icon: "gavel", title: "Peace, Justice and Strong Institutions" },
    { id: 17, icon: "handshake", title: "Partnerships for the Goals" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("step2");
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedSDGs(data.selectedGoals || []);
    }
  }, []);

  const toggleSDG = (title) => {
    setSelectedSDGs((prev) =>
      prev.includes(title) ? prev.filter((sdg) => sdg !== title) : [...prev, title]
    );
  };

  const handleSelectAll = () => {
    if (selectedSDGs.length === sdgs.length) {
      setSelectedSDGs([]);
    } else {
      setSelectedSDGs(sdgs.map((sdg) => sdg.title));
    }
  };

  const handleNext = () => {
    localStorage.setItem("step2", JSON.stringify({ selectedGoals: selectedSDGs }));
    onNext();
  };

  const allSelected = selectedSDGs.length === sdgs.length;

  return (
    <div className="min-h-screen bg-[#10221a] flex flex-col font-display overflow-x-hidden">
      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-6">
        <div className="w-full max-w-6xl flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
                Step 2 of 6
              </p>
              <div className="rounded-full bg-white/10 h-1 overflow-hidden w-28">
                <div
                  className="h-full rounded-full bg-[#0df287] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-0 py-0 border-none bg-transparent hover:text-white text-white/60 text-xs font-semibold tracking-wider transition-all"
            >
              Skip <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* Title Section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-white tracking-tight text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                Which Sustainable Development Goals (SDGs) do you work on?
              </h1>
              <p className="text-gray-300 text-sm sm:text-base max-w-2xl">
                Select all that apply. This helps us customize your research network experience.
              </p>
            </div>

            {/* Select All Button - Optimized for Laptop alignment */}
            <button
              onClick={handleSelectAll}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap h-fit 
              mt-2 sm:mt-4 lg:mt-12 lg:-ml-28 xl:-ml-32
              ${allSelected
                ? "bg-[#0df287] border-[#0df287] text-[#10221a] hover:bg-[#0df287]/90"
                : "border-[#31684e] text-[#0df287] hover:bg-[#0df287]/10 hover:border-[#0df287]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {allSelected ? "check_box" : "check_box_outline_blank"}
              </span>
              <span className="font-semibold text-sm">
                {allSelected ? "Deselect All" : "Select All"}
              </span>
              <span className="text-xs opacity-70 ml-1">
                ({selectedSDGs.length}/{sdgs.length})
              </span>
            </button>
          </div>

          {/* SDG Cards - Flex Layout (Justify Center keeps last boxes in center) */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {sdgs.map((sdg) => {
              const selected = selectedSDGs.includes(sdg.title);
              return (
                <label 
                  key={sdg.id} 
                  className="group relative cursor-pointer w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)] max-w-[280px]"
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    onChange={() => toggleSDG(sdg.title)}
                  />
                  <div
                    className={`flex flex-col gap-2 p-4 rounded-xl border-2 transition-all duration-300 h-full
                      ${selected
                        ? "bg-[#1a2e25] border-[#0df287] shadow-[0_0_20px_rgba(13,242,135,0.15)]"
                        : "bg-[#1a2e25]/50 border-[#31684e] hover:border-[#0df287]/50"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110
                        ${selected ? "bg-[#0df287] text-[#10221a]" : "bg-[#1a3328] text-[#8eccaf]"}`}
                      >
                        <span className="material-symbols-outlined text-lg !leading-none">{sdg.icon}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                        ${selected ? "bg-[#0df287] border-[#0df287]" : "border-[#31684e]"}`}
                      >
                        <span className={`material-symbols-outlined text-xs transition-opacity ${selected ? "opacity-100 text-[#10221a]" : "opacity-0"}`}>
                          check
                        </span>
                      </div>
                    </div>
                    <h3 className="text-white text-xs md:text-sm font-bold leading-tight">
                      {sdg.title}
                    </h3>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 p-4 mt-8 border-t border-[#214a37]">
            <button
              onClick={onBack}
              className="px-6 sm:px-10 py-3 rounded-[10px] border-2 border-[#06f988]/30 text-[#06f988] font-bold hover:bg-[#06f988]/5 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm sm:text-base"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={selectedSDGs.length === 0}
              className="px-6 sm:px-10 py-3 rounded-lg bg-[#06f988] text-[#0f231a] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Next
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Step2;