import React, { useState, useEffect } from 'react';

const OrganizationOnboarding = ({onNext, progress}) => {
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');

  // Auto-fill institute name and type from registration
  useEffect(() => {
    // Load saved organization data from step 1
    const savedOrgData = localStorage.getItem("orgStep1");
    if (savedOrgData) {
      try {
        const parsedData = JSON.parse(savedOrgData);
        if (parsedData.organization_name) {
          setOrgName(parsedData.organization_name);
        }
        if (parsedData.organization_type) {
          setOrgType(parsedData.organization_type);
        }
      } catch (error) {
        console.error("Error parsing saved organization data:", error);
      }
    }
    
    // Also check for institute name from registration (fallback)
    const savedInstituteName = localStorage.getItem("instituteName");
    if (savedInstituteName && !orgName) {
      setOrgName(savedInstituteName);
    }
  }, []); // Empty dependency array means this runs once on mount

  const orgOptions = [
    { id: 'university',         label: 'University' },
    { id: 'research-institute', label: 'Research Institute' },
    { id: 'ngo',                label: 'NGO' },
    { id: 'company',            label: 'Company' },
    { id: 'government',         label: 'Government' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("orgStep1", JSON.stringify({
      organization_name: orgName,
      organization_type: orgType
    }));
    onNext();
  };

  const handleSkip = () => {
    localStorage.setItem("orgStep1", JSON.stringify({
      organization_name: "",
      organization_type: ""
    }));
    onNext();
  };

  return (
    <main className="min-h-screen bg-[#10221a] text-white flex flex-col items-center py-16 px-4 md:px-0 font-sans">
      <div className="w-full max-w-[640px] flex flex-col gap-12">
        
        {/* Header / Progress Section */}
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-3">
              <p className="text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
                Step 1 of 5
              </p>
              <div className="h-1 w-28 bg-white/10 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-[#00ff88] rounded-full absolute left-0 top-0 transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={handleSkip}
              className="text-white/60 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 mt-0.5"
              type="button"
            >
              Skip <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <h1 className="text-3xl md:text-[40px] font-bold tracking-tight leading-tight">
            Tell us about your institutions
          </h1>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-10">
            
            {/* Input Field */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">
                Legal Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                readOnly
                className="w-full bg-slate-800/50 border border-white/15 hover:border-white/25 rounded-lg py-4 px-4 outline-none focus:border-[#00ff88]/70 focus:ring-1 focus:ring-[#00ff88]/25 transition-colors duration-200 text-white placeholder:text-slate-500 text-base"
                placeholder="e.g. Global Research Institute"
              />
            </div>

            {/* Radio Selection Group */}
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">
                Institute Type
              </label>
              <div className="grid grid-cols-1 gap-4">
                {orgOptions.map((option) => (
                  <label 
                    key={option.id}
                    className={`flex items-center gap-5 p-5 rounded-xl border-2 transition-all cursor-pointer ${
                      orgType === option.id 
                        ? 'border-[#00ff88] bg-[#1a2e25]' 
                        : 'border-[#31684e] bg-[#1a2e25] hover:border-[#00ff88]/50'
                    }`}
                  >
                    {/* Custom Radio Button */}
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="org-type"
                        value={option.id}
                        checked={orgType === option.id}
                        onChange={(e) => setOrgType(e.target.value)}
                        className="absolute opacity-0 w-6 h-6 cursor-pointer"
                      />
                      {/* Outer circle */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        orgType === option.id 
                          ? 'border-[#00ff88]' 
                          : 'border-[#31684e] group-hover:border-[#00ff88]/50'
                      }`}>
                        {/* Inner circle - shows when checked */}
                        {orgType === option.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]"></div>
                        )}
                      </div>
                    </div>
                    
                    <span className={`text-lg font-medium transition-colors ${
                      orgType === option.id ? 'text-[#00ff88]' : 'text-white'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#214a37]">
            <button 
              type="button"
              className="px-8 py-3 rounded-lg border border-[#00ff88]/30 text-[#00ff88] font-bold hover:bg-[#00ff88]/5 flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Exit
            </button>
            <button 
              type="submit"
              className="px-10 py-3 rounded-lg bg-[#00ff88] text-[#0b1410] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center gap-2 active:scale-95"
            >
              Next
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>

      {/* CSS for better spacing */}
      <style>{`
        /* Hide default radio button but keep it accessible */
        input[type="radio"] {
          opacity: 0;
          position: absolute;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        
        /* Ensure labels stay white */
        label {
          color: white !important;
        }
        
        /* Remove default focus styles */
        input:focus, 
        button:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </main>
  );
};

export default OrganizationOnboarding;