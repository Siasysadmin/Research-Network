import React, { useState, useEffect } from "react";

const OrgFocusAreas = ({ progress, onNext, onBack }) => {
  const [areas, setAreas] = useState([
    "Climate Change",
    "Renewable Energy",
    "Water & Waste",
    "Biodiversity",
    "Sustainable Ag",
    "Environmental Policy",
    "Urban Planning",
    "Oceanography",
    "Carbon Capture",
  ]);

  const [selectedAreas, setSelectedAreas] = useState([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const defaultAreas = [
    "Climate Change",
    "Renewable Energy",
    "Water & Waste",
    "Biodiversity",
    "Sustainable Ag",
    "Environmental Policy",
    "Urban Planning",
    "Oceanography",
    "Carbon Capture",
  ];

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("orgStep3");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.research_focus && parsed.research_focus.length > 0) {
          setSelectedAreas(parsed.research_focus);

          // Also add any custom areas that might not be in the areas list
          const customAreas = parsed.research_focus.filter(
            (area) => !defaultAreas.includes(area) && !areas.includes(area),
          );

          if (customAreas.length > 0) {
            setAreas((prev) => [...prev, ...customAreas]);
          }
        }
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  const toggleArea = (area) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const addCustomArea = (e) => {
    e.preventDefault();
    if (customInput.trim() && !areas.includes(customInput)) {
      const newArea = customInput.trim();
      setAreas([...areas, newArea]);
      setSelectedAreas([...selectedAreas, newArea]);
      setCustomInput("");
      setIsAddingCustom(false);
    }
  };

  const removeArea = (e, areaToRemove) => {
    e.stopPropagation();
    setAreas(areas.filter((a) => a !== areaToRemove));
    setSelectedAreas(selectedAreas.filter((a) => a !== areaToRemove));
  };

  const handleNext = () => {
    // Save karo aur next step pe jao
    localStorage.setItem(
      "orgStep3",
      JSON.stringify({ research_focus: selectedAreas }),
    );
    onNext();
  };

  const handleSkip = () => {
    localStorage.setItem("orgStep3", JSON.stringify({ research_focus: [] }));
    onNext();
  };

  return (
    <main
      className="
min-h-screen flex flex-col items-center py-12 px-4 md:px-0 font-sans

bg-white text-slate-900
dark:bg-[#10221a] dark:text-white
"
    >
      {" "}
      <div className="w-full max-w-[800px] flex flex-col">
        {/* Step Header */}
        <div className="flex flex-col gap-4 mb-16">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 w-32">
              <p className="text-slate-700 dark:text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
                Step 3 of 5
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
        </div>

        <div className="flex flex-col gap-12">
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1
                className="text-4xl md:text-[52px] font-bold tracking-tight leading-[1.1]
text-slate-900 dark:text-white
"
              >
                {" "}
                What are your primary research focus areas?
              </h1>
              <p className="text-lg text-gray-600 dark:text-white/40">
                Select all that apply to your institutions's mission.
              </p>
            </div>

            {/* Tags Container */}
            <div className="flex flex-wrap gap-3">
              {areas.map((area) => {
                const isSelected = selectedAreas.includes(area);
                const isCustom = !defaultAreas.includes(area);

                return (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    type="button"
                    className={`group relative px-7 py-3 rounded-full border-2 transition-all text-[15px] font-bold flex items-center gap-2
${
  isSelected
    ? "border-[#00ff88] bg-[#00ff88] text-black"
    : "border-gray-300 bg-gray-100 text-slate-800 hover:border-[#00ff88]/50 dark:border-[#31684e] dark:bg-[#1a2e25] dark:text-white"
}`}
                  >
                    {area}
                    {isCustom && (
                      <span
                        onClick={(e) => removeArea(e, area)}
                        className="material-symbols-outlined text-[18px] hover:scale-125 transition-transform"
                      >
                        close
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Add Custom Area Input */}
              <div className="inline-flex items-center">
                {!isAddingCustom ? (
                  <button
                    onClick={() => setIsAddingCustom(true)}
                    className="
px-7 py-3 rounded-full border-2 border-dashed text-[15px] font-medium flex items-center gap-2 transition-colors

border-gray-300 text-gray-600 hover:text-black
dark:border-[#31684e] dark:text-[#90cbaf] dark:hover:text-white
"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      add
                    </span>{" "}
                    Add Custom Area
                  </button>
                ) : (
                  <div
                    className="
flex items-center gap-2 px-6 py-3 rounded-full border-2

bg-gray-100 border-gray-300
dark:bg-[#1a2e25] dark:border-[#00ff88]

focus-within:ring-0 focus-within:outline-none
"
                  >
                    <input
                      autoFocus
                      className="
bg-transparent border-none shadow-none

text-[15px] p-0 w-32 md:w-40

text-slate-900 placeholder:text-gray-400
dark:text-white dark:placeholder:text-white/20

outline-none focus:outline-none focus:ring-0 focus:ring-transparent
"
                      placeholder="Type area..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomArea(e)}
                    />
                    <button
                      onClick={addCustomArea}
                      className="text-[#00ff88] hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        check
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#214a37]">
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-lg border-2 border-[#00ff88]/30 text-[#00ff88] font-bold hover:bg-[#00ff88]/5 flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>{" "}
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-10 py-3 rounded-lg bg-[#00ff88] text-[#0b1410] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center gap-2 active:scale-95"
            >
              Next{" "}
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrgFocusAreas;
