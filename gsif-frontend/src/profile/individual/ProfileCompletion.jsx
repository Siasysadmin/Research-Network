import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [completion, setCompletion] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [completedStepsCount, setCompletedStepsCount] = useState(0);

// ✅ BLOCK BROWSER BACK BUTTON
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
    // Add Material Icons font if not present
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
      const link = document.createElement('link');
      document.head.appendChild(link);
    }

    // Read all step data from localStorage
    const step1Raw = localStorage.getItem("step1");
    const step2Raw = localStorage.getItem("step2");
    const step3Raw = localStorage.getItem("step3");
    const step4Raw = localStorage.getItem("step4");
    const step5Raw = localStorage.getItem("step5");
    const step6Raw = localStorage.getItem("step6");

    // Parse data
    let step1 = {}, step2 = {}, step3 = {}, step4 = {}, step5 = {}, step6 = {};
    
    try {
      step1 = step1Raw ? JSON.parse(step1Raw) : {};
      step2 = step2Raw ? JSON.parse(step2Raw) : {};
      step3 = step3Raw ? JSON.parse(step3Raw) : {};
      step4 = step4Raw ? JSON.parse(step4Raw) : {};
      step5 = step5Raw ? JSON.parse(step5Raw) : {};
      step6 = step6Raw ? JSON.parse(step6Raw) : {};
    } catch (e) {
      console.error("Error parsing data:", e);
    }

    // Each step contributes 16.67% to total (100/6)
   // Steps 1-5: har ek = 100/6 = 16.666...%
// Step 6: 16.666.../4 = 4.1666...% per link (sirf last step ka subdivision)
const stepPercentage = 100 / 6;
const step6LinkPercentage = stepPercentage / 4;

let totalPercentage = 0;
let completedSteps = 0;

// STEP 1
if (step1.describes && step1.describes.trim() !== "") {
  totalPercentage += stepPercentage;
  completedSteps++;
}

// STEP 2
if (step2.selectedGoals && Array.isArray(step2.selectedGoals) && step2.selectedGoals.length > 0) {
  totalPercentage += stepPercentage;
  completedSteps++;
}

// STEP 3
if (step3.research && step3.research.trim() !== "") {
  totalPercentage += stepPercentage;
  completedSteps++;
}

// STEP 4 — ek bhi field filled ho to poora 16.67% milega
let step4Count = 0;
if (step4.yearsExperience && step4.yearsExperience.trim() !== "") step4Count++;
if (step4.skills && step4.skills.trim() !== "") step4Count++;
if (step4.publications && step4.publications.trim() !== "") step4Count++;

if (step4Count > 0) {
  totalPercentage += stepPercentage; // poora 16.67%, subdivision nahi
  completedSteps++;
}

// STEP 5
if (step5.selectedGoals && Array.isArray(step5.selectedGoals) && step5.selectedGoals.length > 0) {
  totalPercentage += stepPercentage;
  completedSteps++;
}

// STEP 6 — sirf yahan subdivision: har link = 4.1666...%
let step6Count = 0;
if (step6.linkedin && step6.linkedin.trim() !== "") step6Count++;
if (step6.research_gate && step6.research_gate.trim() !== "") step6Count++;
if (step6.orc_id && step6.orc_id.trim() !== "") step6Count++;
if (step6.personal_website && step6.personal_website.trim() !== "") step6Count++;

totalPercentage += step6LinkPercentage * step6Count;

const totalStepsCompleted = completedSteps + step6Count / 4;

setCompletedStepsCount(totalStepsCompleted);
setCompletion(totalPercentage);

    // Animate counter
    let current = 0;
    const increment = totalPercentage / 60; // 60 frames for animation
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalPercentage) {
        setAnimatedValue(totalPercentage);
        clearInterval(timer);
      } else {
        setAnimatedValue(current);
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    localStorage.removeItem("step1");
    localStorage.removeItem("step2");
    localStorage.removeItem("step3");
    localStorage.removeItem("step4");
    localStorage.removeItem("step5");
    localStorage.removeItem("step6");
    setIsVisible(false);
    navigate('/welcome');
  };

  if (!isVisible) return null;

  // Circle calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * completion) / 100;

  const getStatusText = () => {
    if (completion === 100) return "Profile Fully Complete 🎉";
    if (completion >= 83) return "Almost There!";
    if (completion >= 66) return "Great Progress!";
    if (completion >= 50) return "Halfway There!";
    if (completion >= 33) return "Good Start!";
    if (completion >= 16) return "Profile Incomplete"; 
    return "Profile Incomplete"; 
  };

  const getSubText = () => {
    // Calculate remaining percentage
    const remainingPercent = 100 - completion;
    
    if (completion === 100) return "You're all set to start collaborating on global sustainability projects.";
    if (completion >= 83) return `Complete the last few details to unlock your full collaboration potential.`;
    if (completion >= 66) return `remaining to complete your profile. Keep going!`;
    if (completion >= 50) return `You're halfway there!  remaining.`;
    if (completion >= 33) return `Good start! Complete  more to boost your visibility.`;
    if (completion >= 16) return `Complete your profile to start collaborating on global sustainability projects.`; 
    return "Complete your profile to start collaborating on global sustainability projects."; 
  };

  return (
    <div className="dark min-h-screen bg-[#020604] flex items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      
      {/* Central Glow Effect */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle at center, rgba(6, 249, 136, 0.12) 0%, transparent 60%)' }}
      ></div>

      {/* Vignette Effect */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.9) 100%)' }}
      ></div>

      {/* Main Glass Box */}
      <div className="relative w-full max-w-[380px] pt-16 px-10 pb-12 rounded-[3rem] text-center shadow-[0_0_120px_rgba(0,0,0,0.8),0_0_60px_rgba(6,249,136,0.03)] overflow-hidden border border-[#06f988]/15 bg-[#08120d]/95 backdrop-blur-[40px]">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-8 right-8 text-[#06f988] hover:opacity-80 transition-opacity cursor-pointer" 
          style={{ filter: 'drop-shadow(0 0 12px rgba(6, 249, 136, 0.5))' }}
        >
          <span className="material-symbols-outlined text-2xl font-bold">close</span>
        </button>

        {/* Circular Progress Section */}
        <div className="relative flex flex-col items-center justify-center mb-14">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle 
                className="text-white/5" 
                cx="50" cy="50" fill="transparent" r="45"
                stroke="currentColor" strokeWidth="5"
              ></circle>
              <circle 
                className="text-[#06f988]" 
                cx="50" cy="50" fill="transparent" r="45"
                stroke="currentColor" strokeWidth="5"
                strokeLinecap="round"
                style={{ 
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                  transition: 'stroke-dashoffset 1s ease',
                  filter: 'drop-shadow(0 0 12px rgba(6, 249, 136, 0.5))' 
                }}
              ></circle>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white tracking-tighter">{Math.round(animatedValue)}%</span>
              <span className="text-[#06f988] text-[8px] font-bold tracking-[0.3em] uppercase">Complete</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <h1 className="text-white tracking-tight text-2xl font-black leading-tight">
            {getStatusText()}
          </h1>
          <p className="text-white/50 text-[13px] font-normal leading-relaxed px-4">
            {getSubText()}
          </p>
        </div>

        <div className="pt-8 border-t border-white/5 w-full text-left">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#06f988]/10 p-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[#06f988] text-sm flex">verified_user</span>
                </div>
                <p className="text-white/40 text-[9px] font-bold leading-none uppercase tracking-[0.25em]">Network Access</p>
              </div>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#06f988] rounded-full shadow-[0_0_10px_#06f988]"></span>
                <p className="text-[#06f988] text-[10px] font-black leading-none uppercase tracking-widest">Active</p>
              </span>
            </div>
            <div className="rounded-full bg-white/5 h-2 w-full overflow-hidden">
              <div
                className="h-full bg-[#06f988] shadow-[0_0_15px_#06f988] transition-all duration-1000"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileCompletion;