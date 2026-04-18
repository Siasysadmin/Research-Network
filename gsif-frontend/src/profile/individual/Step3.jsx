import React, { useState, useEffect } from 'react';

const Step3 = ({ progress, onNext, onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState('');

  const researchLevels = [
    {
      id: 'undergraduate',
      title: 'Undergraduate',
      description: "Currently pursuing a bachelor's degree in environmental science or related fields"
    },
    {
      id: 'masters',
      title: "Master's Student",
      description: "Enrolled in a master's program focusing on sustainability or policy"
    },
    {
      id: 'phd',
      title: 'PhD Candidate',
      description: 'Conducting doctoral research on climate systems or ecology'
    },
    {
      id: 'postdoc',
      title: 'Postdoctoral Researcher',
      description: 'Completed PhD and engaged in mentored advanced research'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem("step3");
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedLevel(data.research || '');
    }
  }, []);

  const handleNext = () => {
  localStorage.setItem("step3", JSON.stringify({ research: selectedLevel }));
  onNext();
};

  return (
    <div className="min-h-screen bg-[#10221a] font-display flex flex-col">
      <main className="flex-1 flex justify-center py-8 md:py-12 px-4">
        <div className="max-w-[640px] w-full flex flex-col gap-10">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1.5">
              <p className="text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
                Step 3 of 6
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
              className="flex items-center gap-1 px-0 py-0 border-none bg-transparent hover:text-white text-white/60 text-xs font-semibold tracking-wider transition-all">
              Skip 
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-white tracking-tight text-2xl sm:text-3xl md:text-4xl font-bold leading-tight pb-4 px-2">
              What is your current research level?
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto px-4">
              This helps us tailor your network experience and connect you with the right peers in the environment and sustainability sector.
            </p>
          </div>

          {/* Radio Options */}
          <div className="flex flex-col gap-4 px-2">
            {researchLevels.map((level) => {
              const isSelected = selectedLevel === level.title;
              
              return (
                <label 
                  key={level.id}
                  className={`group flex items-center gap-4 rounded-xl border-2 p-4 sm:p-5 cursor-pointer transition-all flex-row-reverse
                    ${isSelected ? 'border-[#0df287] bg-[#1a2e25]' : 'border-[#31684e] bg-[#1a2e25]/50 hover:border-[#0df287]/50'}`}
                >
                  <input 
                    type="radio"
                    name="research-level"
                    checked={isSelected}
                    onChange={() => setSelectedLevel(level.title)}
                    className="h-5 w-5 border-2 border-[#31684e] bg-transparent appearance-none rounded-full cursor-pointer checked:border-[#0df287] focus:outline-none focus:ring-0 relative
                      checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-2 checked:after:h-2 checked:after:rounded-full checked:after:bg-[#0df287]"
                  />
                  <div className="flex grow flex-col">
                    <p className="text-white text-sm sm:text-base font-semibold leading-normal">
                      {level.title}
                    </p>
                    <p className="text-[#90cbaf] text-xs sm:text-sm font-normal leading-normal">
                      {level.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Navigation Buttons */}
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
              disabled={!selectedLevel}
              className="px-8 sm:px-10 py-3 rounded-lg bg-[#06f988] text-[#0f231a] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Step3;