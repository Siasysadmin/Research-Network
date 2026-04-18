import React, { useState, useEffect } from "react";

const Step5 = ({ progress, onBack, onNext }) => {
  // Initialize state directly from localStorage
  const [selectedGoals, setSelectedGoals] = useState(() => {
    const savedData = localStorage.getItem("step5");
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.selectedGoals || [];
    }
    return [];
  });
  
  const [customInput, setCustomInput] = useState("");
  
  const [customGoals, setCustomGoals] = useState(() => {
    const savedData = localStorage.getItem("step5");
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.customGoals || [];
    }
    return [];
  });

  const predefinedGoals = [
    { id: "research", icon: "science", title: "Joint Research" },
    { id: "publications", icon: "menu_book", title: "Publications" },
    { id: "workshops", icon: "groups", title: "Workshops & Seminars" },
    { id: "mentorship", icon: "school", title: "Mentorship" },
    { id: "grants", icon: "payments", title: "Grant Applications" },
    { id: "visibility", icon: "visibility", title: "Gain Visibility" },
  ];

  // Save to localStorage whenever state changes
  useEffect(() => {
    console.log("Saving to localStorage:", { selectedGoals, customGoals });
    localStorage.setItem("step5", JSON.stringify({ 
      selectedGoals, 
      customGoals 
    }));
  }, [selectedGoals, customGoals]);

  const toggleGoal = (title) => {
    setSelectedGoals((prev) => {
      const newState = prev.includes(title) 
        ? prev.filter((goal) => goal !== title) 
        : [...prev, title];
      console.log("Toggle goal:", title, "New state:", newState);
      return newState;
    });
  };

  const handleAddCustomGoal = () => {
    if (customInput.trim() === "") return;

    const newGoal = {
      id: `custom-${Date.now()}`,
      title: customInput.trim(),
      isCustom: true,
    };

    setCustomGoals((prev) => {
      const newState = [...prev, newGoal];
      console.log("Adding custom goal:", newGoal, "New state:", newState);
      return newState;
    });
    
    setSelectedGoals((prev) => {
      const newState = [...prev, customInput.trim()];
      console.log("Adding to selected:", customInput.trim(), "New state:", newState);
      return newState;
    });
    
    setCustomInput("");
  };

  const removeCustomGoal = (goalId, title) => {
    setCustomGoals((prev) => {
      const newState = prev.filter((goal) => goal.id !== goalId);
      console.log("Removing custom goal:", goalId, "New state:", newState);
      return newState;
    });
    
    setSelectedGoals((prev) => {
      const newState = prev.filter((goal) => goal !== title);
      console.log("Removing from selected:", title, "New state:", newState);
      return newState;
    });
  };

  const handleNext = () => {
    if (onNext) onNext();
  };

  const isSelected = (title) => selectedGoals.includes(title);

  return (
    <div className="min-h-screen bg-[#0f231a] font-display transition-colors duration-300">
      <div className="relative flex min-h-screen w-full flex-col">
        <div className="flex h-full grow flex-col">
          <main className="flex flex-1 items-center justify-center py-10">
            <div className="flex flex-col max-w-[960px] flex-1">
              {/* Header */}
              <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
                    Step 5 of 6
                  </p>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-0 py-0 border-none bg-transparent hover:text-white text-white/60 text-xs font-semibold tracking-wider transition-all"
                  >
                    Skip
                    <span className="material-symbols-outlined text-sm">
                      chevron_right
                    </span>
                  </button>
                </div>
                <div className="rounded-full bg-white/10 h-1 overflow-hidden w-28">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center px-4">
                <h1 className="text-white tracking-light text-[32px] font-bold leading-tight pb-2 pt-6">
                  Which type of collaborations interest you?
                </h1>
                <p className="text-gray-400 text-base font-normal leading-normal pb-6">
                  Select all that apply to help us match you with the right
                  sustainability researchers.
                </p>
              </div>

              {/* Goals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {predefinedGoals.map((goal) => {
                  const selected = isSelected(goal.title);

                  return (
                    <div
                      key={goal.id}
                      onClick={() => toggleGoal(goal.title)}
                      className={`bg-[#1a3328] flex flex-col gap-4 rounded-xl p-6 cursor-pointer transition-all duration-200 overflow-hidden
                        ${
                          selected
                            ? "border-2 border-[#06f988] shadow-[0_0_15px_rgba(6,249,136,0.4)]"
                            : "border-2 border-[#214a37] hover:border-[#06f988]/50"
                        }`}
                    >
                      <div className="flex justify-between items-start flex-shrink-0">
                        <span
                          className={`material-symbols-outlined text-4xl flex-shrink-0
                            ${selected ? "text-[#06f988]" : "text-[#2f6a4e]"}`}
                        >
                          {goal.icon}
                        </span>
                        
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                          ${
                            selected
                              ? "bg-[#06f988] border-[#06f988]"
                              : "border-[#2f6a4e]"
                          }`}
                        >
                          {selected && (
                            <span className="material-symbols-outlined text-xs font-bold text-[#0f231a]">
                              check
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-white text-lg font-bold leading-tight break-words">
                          {goal.title}
                        </h3>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Goals */}
                {customGoals.map((goal) => {
                  const selected = isSelected(goal.title);

                  return (
                    <div
                      key={goal.id}
                      onClick={() => toggleGoal(goal.title)}
                      className={`bg-[#1a3328] flex flex-col gap-4 rounded-xl p-6 cursor-pointer transition-all duration-200 relative group/card overflow-hidden
                        ${
                          selected
                            ? "border-2 border-[#06f988] shadow-[0_0_15px_rgba(6,249,136,0.4)]"
                            : "border-2 border-[#214a37] hover:border-[#06f988]/50"
                        }`}
                    >
                      <div className="flex justify-between items-start flex-shrink-0">
                        <div
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all
                          ${
                            selected
                              ? "bg-[#06f988] border-[#06f988] text-[#0f231a]"
                              : "border-[#2f6a4e] text-transparent"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl font-bold">
                            check
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomGoal(goal.id, goal.title);
                          }}
                          className="text-[#2f6a4e] hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-xl">
                            close
                          </span>
                        </button>
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-white text-lg font-bold leading-tight break-words overflow-wrap-anywhere">
                          {goal.title}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Goal */}
              <div className="px-4 mt-2">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddCustomGoal()
                    }
                    placeholder="Add custom interest..."
                    className="flex-1 bg-[#1a3328] border-2 border-[#2f6a4e] rounded-xl px-4 py-4 text-white focus:border-[#06f988] focus:ring-0 transition-all outline-none"
                  />
                  <button
                    onClick={handleAddCustomGoal}
                    className="bg-[#06f988] text-[#0f231a] font-bold px-8 py-4 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined font-bold">
                      add
                    </span>
                    Add
                  </button>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-3 p-4 mt-8 border-t border-[#214a37]">
                <button
                  onClick={onBack}
                  className="px-10 py-3 rounded-[10px] border-2 border-[#06f988]/30 text-[#06f988] font-bold hover:bg-[#06f988]/5 flex items-center justify-center gap-2 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-xl">
                    arrow_back
                  </span>
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedGoals.length === 0}
                  className="px-10 py-3 rounded-lg bg-[#06f988] text-[#0f231a] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">  
                  Next
                  <span className="material-symbols-outlined text-xl">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>  
    </div>
  );
};

export default Step5;