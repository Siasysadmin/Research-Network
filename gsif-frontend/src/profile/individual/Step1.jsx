import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Step1 = ({ progress, onNext }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const roles = [
    {
      id: "student",
      icon: "school",
      title: "Student",
      description: "Academic foundation and growth.",
    },
    {
      id: "researcher",
      icon: "science",
      title: "Researcher",
      description: "Discovery through data work.",
    },
    {
      id: "educator",
      icon: "co_present",
      title: "Educator",
      description: "Leading academic progress.",
    },
    {
      id: "professional",
      icon: "domain",
      title: "Professional",
      description: "Applying industry standards.",
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("step1");
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedRole(data.describes || null);
    }
  }, []);

  const handleNext = () => {
  localStorage.setItem("step1", JSON.stringify({ describes: selectedRole }));
  onNext();
};

useEffect(() => {
  const handleBack = () => {
    navigate("/application-approved", { replace: true }); // 👈 apna route daal sakte ho
  };

  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", handleBack);

  return () => {
    window.removeEventListener("popstate", handleBack);
  };
}, []);
  return (
    <div className="min-h-screen bg-[#10221a] text-white flex flex-col relative font-display">
      {/* Background blur effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-[#0df287]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0df287]/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 md:py-16 px-4">
        <div className="w-full max-w-[900px] flex flex-col gap-6 md:gap-8">
          {/* Progress Header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-1.5">
              <p className="text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
                Step 1 of 6
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
              Skip
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>

          {/* Title Section */}
          <div className="text-center space-y-2">
            <h1 className="text-white tracking-tight text-3xl sm:text-4xl md:text-5xl font-bold leading-tight px-2">
              Which best describes you?
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto px-4">
              Select your primary role to tailor your research journey.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.title)}
                className={`group cursor-pointer flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-[#1a2e25]/50 border-2 transition-all duration-300 ${
                  selectedRole === role.title 
                    ? "border-[#0df287] bg-[#1a2e25] shadow-[0_0_20px_rgba(6,249,136,0.3)]" 
                    : "border-[#31684e] hover:border-[#0df287]/50"
                }`}
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-2 transition-transform duration-300 group-hover:scale-110 ${
                  selectedRole === role.title
                    ? "border-[#0df287] bg-[#0df287]/10"
                    : "border-[#31684e] bg-[#1a3328]"
                }`}>
                  <span className={`material-symbols-outlined text-3xl sm:text-4xl ${
                    selectedRole === role.title ? "text-[#0df287]" : "text-[#8eccaf]"
                  }`}>
                    {role.icon}
                  </span>
                </div>
                <h3 className="text-white text-base sm:text-lg font-bold mb-2">
                  {role.title}
                </h3>
                <p className="text-[#90cbaf] text-xs leading-relaxed px-2">
                  {role.description}
                </p>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 p-4 mt-8 border-t border-[#214a37]">
            <button 
onClick={() => navigate("/application-approved")}
              className="px-8 sm:px-10 py-3 rounded-[10px] border-2 border-[#06f988]/30 text-[#06f988] font-bold hover:bg-[#06f988]/5 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">
                arrow_back
              </span>
              Exit
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedRole}
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

export default Step1;