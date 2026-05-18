import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OrgProfile = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const [completion, setCompletion] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);
  
  // State for step data
  const [step1, setStep1] = useState({});
  const [step2, setStep2] = useState({});
  const [step3, setStep3] = useState({});
  const [step4, setStep4] = useState({});
  const [step5, setStep5] = useState({});
  const [links, setLinks] = useState({});


 // ✅ HARD BLOCK BROWSER BACK BUTTON (100% BLOCK)
useEffect(() => {

  const pushHistory = () => {
    window.history.pushState(null, "", window.location.href);
  };

  // First time multiple push
  for (let i = 0; i < 100; i++) {
    pushHistory();
  }

  const blockBack = () => {

    // Again push many states
    for (let i = 0; i < 100; i++) {
      pushHistory();
    }

  };

  window.addEventListener("popstate", blockBack);

  return () => {
    window.removeEventListener("popstate", blockBack);
  };

}, []);

  useEffect(() => {
    // Step 1: Organization Name (20%)
    const step1Data = JSON.parse(localStorage.getItem("orgStep1") || "{}");
    setStep1(step1Data);
    
    // Step 2: Location (20% - all 3 fields required for full 20%)
    const step2Data = JSON.parse(localStorage.getItem("orgStep2") || "{}");
    setStep2(step2Data);
    
    // Step 3: Research Focus (20%)
    const step3Data = JSON.parse(localStorage.getItem("orgStep3") || "{}");
    setStep3(step3Data);
    
    // Step 4: Goals (20%)
    const step4Data = JSON.parse(localStorage.getItem("orgStep4") || "{}");
    setStep4(step4Data);
    
    // Step 5: Profile Links (20% divided into 4 parts - 5% each)
    const step5Data = JSON.parse(localStorage.getItem("orgStep5") || "{}");
    setStep5(step5Data);
    const linksData = step5Data.links || {};
    setLinks(linksData);

    let totalPercentage = 0;

    // STEP 1: 20% (if organization name exists)
    if (step1Data.organization_name?.trim()) {
      totalPercentage += 20;
    }

    // STEP 2: 20% (all three fields required for full 20%)
    const step2Completed = step2Data.country?.trim() && step2Data.state?.trim() && step2Data.city?.trim();
    if (step2Completed) {
      totalPercentage += 20;
    }

    // STEP 3: 20% (if research_focus array has items)
    if (step3Data.research_focus?.length > 0) {
      totalPercentage += 20;
    }

    // STEP 4: 20% (if platform array has items)
    if (step4Data.platform?.length > 0) {
      totalPercentage += 20;
    }

    // STEP 5: 20% divided into 4 parts (5% each)
    if (linksData.linkedin?.trim()) totalPercentage += 5;
    if (linksData.researchGate?.trim()) totalPercentage += 5;
    if (linksData.orcid?.trim()) totalPercentage += 5;
    if (linksData.website?.trim()) totalPercentage += 5;

    setCompletion(totalPercentage);

    // Animate 0 → totalPercentage
    let current = 0;
    const increment = totalPercentage / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalPercentage) {
        setAnimatedValue(totalPercentage);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  const handleCloseAndNavigate = () => {
    // Cleanup after user sees progress
    ["orgStep1", "orgStep2", "orgStep3", "orgStep4", "orgStep5"].forEach(
      (key) => localStorage.removeItem(key),
    );
    if (onClose) onClose();
    navigate("/welcome");
  };

  // SVG circle
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (circumference * completion) / 100;

  if (!isOpen) return null;

  return (
    <div className="bg-[#020604] font-sans text-white min-h-screen flex items-center justify-center p-6 relative overflow-y-auto">
      {/* Background Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(6, 249, 136, 0.1) 0%, transparent 70%)",
        }}
      ></div>

      {/* Main Glass Panel */}
      <div className="relative w-full max-w-[370px] pt-14 px-8 pb-12 rounded-[2.5rem] text-center shadow-[0_0_100px_rgba(0,0,0,0.9)] border border-[#06f988]/15 bg-[rgba(8,18,13,0.98)] backdrop-blur-[40px]">
        {/* Close Button */}
        <button
          onClick={handleCloseAndNavigate}
          className="absolute top-6 right-7 text-[#06f988]/50 hover:text-[#06f988] transition-colors z-20"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Success Circle Section */}
        <div className="relative flex flex-col items-center justify-center mb-10">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-white/5"
                cx="50"
                cy="50"
                fill="transparent"
                r="44"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              {/* Dynamic ring */}
              <circle
                className="text-[#06f988]"
                cx="50"
                cy="50"
                fill="transparent"
                r="44"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: "stroke-dashoffset 1s ease",
                  filter: "drop-shadow(0 0 8px rgba(6, 249, 136, 0.4))",
                }}
              ></circle>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              {/* Dynamic % */}
              <span className="text-3xl font-black text-white tracking-tighter leading-none">
                {animatedValue}%
              </span>
              <span className="text-[#06f988] text-[9px] font-bold tracking-[0.2em] uppercase mt-1">
                complete
              </span>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3 mb-10">
          <h1 className="text-white tracking-tight text-xl font-bold leading-tight px-4">
            Your Institute Profile is Active
          </h1>
          <p className="text-white/50 text-[13px] font-normal leading-relaxed">
            Seamlessly connect with internal teams and access institute-specific
            resources and projects.
          </p>
        </div>

        {/* Network Status Section */}
        <div className="pt-8 border-t border-white/5 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#06f988]/60 text-xs">
                  verified_user
                </span>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">
                  Network Status
                </p>
              </div>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#06f988] rounded-full shadow-[0_0_8px_#06f988]"></span>
                <p className="text-[#06f988] text-[10px] font-black uppercase tracking-wider">
                  {completion > 0 ? "Active" : "Inactive"}
                </p>
              </span>
            </div>

            {/* Dynamic bar */}
            <div className="rounded-full bg-white/5 h-1.5 w-full overflow-hidden">
              <div
                className="h-full bg-[#06f988] shadow-[0_0_10px_#06f988] transition-all duration-1000"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgProfile;