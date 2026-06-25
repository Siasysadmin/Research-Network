import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import globeImg from "../../assets/images/globe1.png"; // Dark mode globe
import globeLightImg from "../../assets/images/globe.png"; // Light mode globe
import {
  ArrowRight,
  Users,
  BookOpen,
  Leaf,
  LayoutDashboard,
} from "lucide-react";

const ResearcherHero = ({ user_type }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const htmlClass = document.documentElement.classList;
      setIsDark(htmlClass.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

 const userType = user_type || localStorage.getItem("user_type") || "individual";

// Debugging ke liye yahan console lagayein
useEffect(() => {
  console.log("Current User Type Detected:", userType);
}, [userType]);

const handleCompleteProfile = () => {
  // Local storage se "user" object nikal kar check karna
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const actualType = user_type || userData.user_type || "individual";

  if (actualType === "institute") {   
    navigate("/organization-onboarding/1");
  } else {
    navigate("/profile-individual-flow/1");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-x-hidden bg-[#f8faf9] text-slate-900 dark:bg-[#050807] dark:text-white transition-colors duration-500">
      
      <div className="relative w-full max-w-5xl rounded-2xl sm:rounded-3xl md:rounded-[32px] px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-12 lg:py-16 flex flex-col lg:flex-row items-center gap-6 sm:gap-8 md:gap-10 overflow-hidden shadow-2xl bg-white border border-gray-100 dark:bg-[#0a0f0d] dark:border-white/5">
        
        {/* Left Side: Content */}
        <div className="flex-1 z-10 text-left w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <span className="text-[#22c55e] dark:text-[#4ade80] text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase">
              Welcome to GSIF
            </span>
            <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#22c55e] dark:text-[#4ade80]" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 sm:mb-4 text-slate-900 dark:text-white leading-[1.1]">
            Welcome back, <br />
            <span className="text-[#22c55e]">Researcher!</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-sm mb-6 sm:mb-7 md:mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
            Your network access is confirmed. You're now part of a global
            community driving sustainable innovation.
          </p>

          <div className="h-[1px] w-10 sm:w-12 bg-gray-200 dark:bg-[#1a2e1a] mb-6 sm:mb-7 md:mb-8"></div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-9 md:mb-10">
            <Feature icon={<Users />} title="Connect" sub="with experts" />
            <Feature icon={<BookOpen />} title="Discover" sub="latest research" isMiddle />
            <Feature icon={<Leaf />} title="Create" sub="sustainability" isMiddle />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button onClick={handleCompleteProfile} className="bg-[#22c55e] hover:bg-[#1db954] text-black text-xs sm:text-sm font-bold px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95 w-full sm:w-auto">
              Complete Profile <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/dashboard")} className="border border-gray-200 dark:border-white/10 text-slate-600 dark:text-[#22c55e] hover:bg-gray-50 dark:hover:bg-white/5 text-xs sm:text-sm font-semibold px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 w-full sm:w-auto">
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </button>
          </div>
        </div>

        {/* Right Side: Integrated Image Section */}
        <div className="relative flex-1 flex justify-center items-center w-full mt-6 lg:mt-0">
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[680px] aspect-square flex items-center justify-center">
            
            {/* Image with subtle shadow to blend in Light Mode */}
            <img
              src={isDark ? globeImg : globeLightImg}
              alt="globe visual"
              className="w-full h-full object-contain transition-all duration-700 hover:scale-105 z-10"
              style={{
                maskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
                filter: isDark ? 'none' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.03))'
              }}
            />

            {/* Glowing backgrounds - Adjusted for Light Mode */}
            <div className="absolute w-[120%] h-[120%] bg-green-500/[0.03] dark:bg-green-500/[0.06] blur-[60px] md:blur-[110px] rounded-full -z-10 animate-pulse"></div>
            
            {/* Extra subtle shadow base for light mode */}
            {!isDark && (
              <div className="absolute bottom-[10%] w-[60%] h-[10%] bg-black/[0.02] blur-2xl rounded-full -z-10"></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const Feature = ({ icon, title, sub, isMiddle }) => (
  <div className={`flex items-center gap-3 ${isMiddle ? 'sm:pl-4 sm:border-l border-gray-100 dark:border-white/5' : ''}`}>
    <div className="bg-[#f0fdf4] dark:bg-white/5 p-2 rounded-lg text-[#22c55e]">
      {React.cloneElement(icon, { size: 16 })}
    </div>
    <div className="flex flex-col">
      <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">{title}</span>
      <span className="text-gray-500 text-[9px] sm:text-[10px] leading-tight">{sub}</span>
    </div>
  </div>
);

export default ResearcherHero;