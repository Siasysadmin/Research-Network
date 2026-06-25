import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calculateIndividualProfileCompletion } from "../../utils/profileCompletion";
import API_CONFIG from "../../config/api.config";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [completion, setCompletion] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const pushHistory = () => {
      window.history.pushState(null, "", window.location.href);
    };

    for (let i = 0; i < 100; i++) {
      pushHistory();
    }

    const blockBack = () => {
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
    let timer = null;

    const calculateFinalPercent = async () => {
      let apiProfile = {};

      try {
        const token =
          localStorage.getItem("auth_token") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("auth_token");

        if (token) {
          const response = await fetch(
            `${API_CONFIG.BASE_URL}/profile/get-profile-individual`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          const result = await response.json();

          if (result.status && result.data) {
            apiProfile = result.data;
          }
        }
      } catch (error) {
        console.log("Individual profile API error:", error);
      }

      const profile = {
        name: apiProfile.name || "",
        email: apiProfile.email || "",
        country: apiProfile.country || "",
        state: apiProfile.state || "",
        city: apiProfile.city || "",
        pincode: apiProfile.pincode || "",

        describes: apiProfile.describes || "",
        developement_goals: apiProfile.developement_goals || [],
        current_research: apiProfile.current_research || "",

        job_role: apiProfile.job_role || [],
        company: apiProfile.company || [],
        duration: apiProfile.duration || [],
        description: apiProfile.description || [],

        interest: apiProfile.interest || [],

        linkedin: apiProfile.linkedin || "",
        research_gate: apiProfile.research_gate || "",
        orc_id: apiProfile.orc_id || "",
        personal_website: apiProfile.personal_website || apiProfile.website || "",

        date_of_birth: apiProfile.date_of_birth || "",
        short_bio: apiProfile.short_bio || "",
        language: apiProfile.language || "",
        location: apiProfile.location || "",
        profile_image: apiProfile.profile_image || "",
      };

      const totalPercentage = calculateIndividualProfileCompletion(profile);

      setCompletion(totalPercentage);

      let current = 0;
      const increment = totalPercentage / 60;

      timer = setInterval(() => {
        current += increment;

        if (current >= totalPercentage) {
          setAnimatedValue(totalPercentage);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, 16);
    };

    calculateFinalPercent();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const handleClose = () => {
    localStorage.removeItem("step1");
    localStorage.removeItem("step2");
    localStorage.removeItem("step3");
    localStorage.removeItem("step4");
    localStorage.removeItem("step5");
    localStorage.removeItem("step6");

    setIsVisible(false);
    navigate("/welcome");
  };

  if (!isVisible) return null;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * completion) / 100;

  const getStatusText = () => {
    if (completion === 100) return "Profile Fully Complete 🎉";
    if (completion >= 83) return "Almost There!";
    if (completion >= 66) return "Great Progress!";
    if (completion >= 50) return "Halfway There!";
    if (completion >= 33) return "Good Start!";
    return "Profile Incomplete";
  };

  const getSubText = () => {
    if (completion === 100) {
      return "You're all set to start collaborating on global sustainability projects.";
    }

    return "Complete your profile to start collaborating on global sustainability projects.";
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans
        bg-slate-50 text-slate-800
        dark:bg-[#020604] dark:text-white
      "
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(6, 249, 136, 0.12) 0%, transparent 60%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background:
            "radial-gradient(circle, transparent 0%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      <div
        className="
          relative w-full max-w-[380px] pt-16 px-10 pb-12 rounded-[3rem] text-center overflow-hidden
          bg-white border border-gray-200 shadow-xl
          dark:border-[#06f988]/15 dark:bg-[#08120d]/95 dark:backdrop-blur-[40px]
          dark:shadow-[0_0_120px_rgba(0,0,0,0.8),0_0_60px_rgba(6,249,136,0.03)]
        "
      >
        <button
          onClick={handleClose}
          className="
            absolute top-8 right-8 transition-opacity
            text-slate-500 hover:text-slate-800
            dark:text-[#06f988] dark:hover:opacity-80
          "
          style={{
            filter: "drop-shadow(0 0 12px rgba(6, 249, 136, 0.5))",
          }}
        >
          <span className="material-symbols-outlined text-2xl font-bold">
            close
          </span>
        </button>

        <div className="relative flex flex-col items-center justify-center mb-14">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-gray-200 dark:text-white/5"
                cx="50"
                cy="50"
                fill="transparent"
                r="45"
                stroke="currentColor"
                strokeWidth="5"
              />

              <circle
                className="text-[#06f988]"
                cx="50"
                cy="50"
                fill="transparent"
                r="45"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                  transition: "stroke-dashoffset 1s ease",
                  filter: "drop-shadow(0 0 12px rgba(6, 249, 136, 0.5))",
                }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white">
                {Math.round(animatedValue)}%
              </span>

              <span className="text-[#06f988] text-[8px] font-bold tracking-[0.3em] uppercase">
                Complete
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <h1 className="tracking-tight text-2xl font-black leading-tight text-slate-800 dark:text-white">
            {getStatusText()}
          </h1>

          <p className="text-[13px] leading-relaxed px-4 text-slate-500 dark:text-white/50">
            {getSubText()}
          </p>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-white/5 w-full text-left">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#06f988]/10 p-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[#06f988] text-sm flex">
                    verified_user
                  </span>
                </div>

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-white/40">
                  Network Access
                </p>
              </div>

              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#06f988] rounded-full shadow-[0_0_10px_#06f988]" />

                <p className="text-[#06f988] text-[10px] font-black uppercase tracking-widest">
                  Active
                </p>
              </span>
            </div>

            <div className="rounded-full bg-gray-200 dark:bg-white/5 h-2 w-full overflow-hidden">
              <div
                className="h-full bg-[#06f988] shadow-[0_0_15px_#06f988] transition-all duration-1000"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
