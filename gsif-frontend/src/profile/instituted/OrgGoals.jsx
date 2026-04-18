import React, { useState, useEffect } from "react";

const OrgGoals = ({ progress, onNext, onBack }) => {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [otherText, setOtherText] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customGoals, setCustomGoals] = useState([]);

  const initialGoals = [
    { id: "share_publish",    title: "Share & publish research work",          desc: "Showcase your latest findings to the global sustainability community." },
    { id: "visibility",       title: "Increase visibility of our research",    desc: "Expand the reach of your institutional or individual research impact." },
    { id: "connect",          title: "Connect with researchers or institutions", desc: "Build meaningful professional relationships within your field." },
    { id: "collaborators",    title: "Find collaborators",                     desc: "Discovery partners for upcoming interdisciplinary research projects." },
    { id: "host_initiatives", title: "Host sustainability initiatives",        desc: "Organize and manage environmental projects or campaigns." },
  ];

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("orgStep4");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.platform && parsedData.platform.length > 0) {
          // Find which goals are selected based on titles
          const selectedIds = [];
          
          parsedData.platform.forEach(title => {
            // Check in initial goals
            const initialGoal = initialGoals.find(g => g.title === title);
            if (initialGoal) {
              selectedIds.push(initialGoal.id);
            } else {
              // It's a custom goal - create it
              const customId = `custom-${Date.now()}-${Math.random()}`;
              setCustomGoals(prev => [...prev, {
                id: customId,
                title: title,
                desc: "Custom objective added by you."
              }]);
              selectedIds.push(customId);
            }
          });
          
          setSelectedGoals(selectedIds);
        }
      } catch (error) {
        console.error("Error parsing saved goals data:", error);
      }
    }
  }, []);

  const toggleGoal = (id) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addCustomGoal = () => {
    if (otherText.trim()) {
      const newGoal = { id: `custom-${Date.now()}`, title: otherText, desc: "Custom objective added by you." };
      setCustomGoals([...customGoals, newGoal]);
      setSelectedGoals([...selectedGoals, newGoal.id]);
      setOtherText("");
      setShowOtherInput(false);
    }
  };

  const removeCustomGoal = (e, id) => {
    e.stopPropagation();
    setCustomGoals(customGoals.filter((g) => g.id !== id));
    setSelectedGoals(selectedGoals.filter((item) => item !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save selected goal titles
    const allGoals = [...initialGoals, ...customGoals];
    const selectedTitles = selectedGoals.map((id) => {
      const found = allGoals.find((g) => g.id === id);
      return found ? found.title : id;
    });
    localStorage.setItem("orgStep4", JSON.stringify({ platform: selectedTitles }));
    if (onNext) onNext();
  };

  const handleSkip = () => {
    localStorage.setItem("orgStep4", JSON.stringify({ platform: [] }));
    if (onNext) onNext();
  };

  return (
    <main className="min-h-screen bg-[#10221a] text-white flex flex-col items-center py-12 md:py-16 px-4 md:px-0 font-sans">
      <div className="w-full max-w-[700px] flex flex-col gap-12">
        {/* Progress Header */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <p className="text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
                Step 4 of 5
              </p>
              <div className="w-28 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <button onClick={handleSkip} className="text-white/60 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
              Skip <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl md:text-[40px] font-bold mb-4 tracking-tight leading-tight">
            What would you like to achieve on this platform?
          </h1>
          <p className="text-white/40 text-lg">
            This helps us personalize your dashboard and surface relevant opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[...initialGoals, ...customGoals].map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const isCustom = goal.id.toString().startsWith("custom");

            return (
              <label key={goal.id} className="cursor-pointer group relative">
                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleGoal(goal.id)} />
                <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${
                    isSelected ? "border-[#00ff88] bg-[#1a2e25]" : "border-[#31684e] bg-[#1a2e25]/50 hover:border-[#00ff88]/40"
                  }`}>
                  <div className={`mt-1 flex-shrink-0 size-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSelected ? "bg-[#00ff88] border-[#00ff88]" : "border-[#31684e]"
                    }`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px] text-[#0b1410] font-bold">check</span>}
                  </div>
                  <div className="flex-grow pr-8">
                    <p className="font-bold text-white text-[17px]">{goal.title}</p>
                    <p className="text-sm text-[#90cbaf] mt-0.5">{goal.desc}</p>
                  </div>
                  {isCustom && (
                    <button
                      onClick={(e) => removeCustomGoal(e, goal.id)}
                      className="absolute right-4 top-5 text-white/20 hover:text-red-400 transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>
              </label>
            );
          })}

          {/* Other Option Trigger */}
          <div className="flex flex-col gap-3">
            {!showOtherInput ? (
              <button
                type="button"
                onClick={() => setShowOtherInput(true)}
                className="flex items-center justify-center gap-2 py-5 border-2 border-dashed border-[#31684e] rounded-xl bg-[#1a2e25]/30 hover:border-[#00ff88] hover:bg-[#1a2e25] transition-all group"
              >
                <span className="material-symbols-outlined text-[#00ff88]">add_circle</span>
                <span className="font-bold text-[#90cbaf] group-hover:text-[#00ff88]">Add something else</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  className="flex-grow bg-[#1a2e25] border-2 border-[#00ff88] rounded-xl py-3.5 px-4 text-white"
                  placeholder="Describe your goal..."
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomGoal())}
                />
                <button
                  type="button"
                  onClick={addCustomGoal}
                  className="bg-[#00ff88] text-[#0b1410] font-bold px-6 rounded-xl hover:brightness-110"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#214a37]">
            <button type="button" onClick={onBack} className="px-8 py-3 rounded-lg border-2 border-[#00ff88]/30 text-[#00ff88] font-bold hover:bg-[#00ff88]/5 flex items-center gap-2 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">arrow_back</span> Back
            </button>
            <button type="submit" className="px-10 py-3 rounded-lg bg-[#00ff88] text-[#0b1410] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center gap-2 active:scale-95">
              Next <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>

      {/* Strong CSS to remove all default focus outlines */}
      <style>{`
        /* Remove default focus outlines from all elements */
        button,
        input,
        textarea,
        select,
        a,
        [tabindex]:not([tabindex="-1"]) {
          outline: 0 !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Remove any browser default focus rings */
        *:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        
        /* Specific for Chrome/Safari/Edge */
        button:focus,
        input:focus,
        .btn:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        
        /* For Firefox */
        button::-moz-focus-inner,
        input::-moz-focus-inner {
          border: 0 !important;
          outline: none !important;
        }
      `}</style>
    </main>
  );
};

export default OrgGoals;