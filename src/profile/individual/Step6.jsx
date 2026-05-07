import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../../config/api.config";

const Step6 = ({ progress, onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize state directly from localStorage
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("step6");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        return {
          linkedin: data.linkedin || "",
          research_gate: data.research_gate || "",
          orc_id: data.orc_id || "",
          personal_website: data.personal_website || "",
        };
      } catch (e) {
        console.error("Error parsing step6 data:", e);
      }
    }
    return {
      linkedin: "",
      research_gate: "",
      orc_id: "",
      personal_website: "",
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Immediately save to localStorage when user types
      localStorage.setItem("step6", JSON.stringify(newData));
      return newData;
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    localStorage.setItem("step6", JSON.stringify(formData));

    try {
      // Step data fetch karein
      const step1 = JSON.parse(localStorage.getItem("step1") || "{}");
      const step2 = JSON.parse(localStorage.getItem("step2") || "{}");
      const step3 = JSON.parse(localStorage.getItem("step3") || "{}");
      const step4Array = JSON.parse(localStorage.getItem("step4") || "[]"); // Yeh ab array hai
      const step5 = JSON.parse(localStorage.getItem("step5") || "{}");
 
      const registeredUser = JSON.parse(localStorage.getItem("user") || "{}");

      // Step 4 ke array data ko separate arrays mein convert karein
      const jobRoles = step4Array.map(exp => exp.jobRole || "");
      const companies = step4Array.map(exp => exp.companyName || "");
      const durations = step4Array.map(exp => exp.duration || "");
      const descriptions = step4Array.map(exp => exp.description || "");

      // Final Data mapping
      const finalData = {

        name: registeredUser.name || "", 
        email: registeredUser.email,
     country: registeredUser.country,
  state: registeredUser.state,
  city: registeredUser.city,
  pincode: registeredUser.pincode,

        describes: step1.describes || "",
        developement_goals: step2.selectedGoals || [],
        current_research: step3.research || "",
        
        // Step 4 updated fields (mapping to your required format)
        job_role: jobRoles,
        company: companies,
        duration: durations,
        description: descriptions,
        
      
        interest: step5.selectedGoals || [],
        custom_interests: step5.customGoals?.map((g) => g.title) || [],
        linkedin: formData.linkedin || "",
        research_gate: formData.research_gate || "",
        orc_id: formData.orc_id || "",
        personal_website: formData.personal_website || "",

        
       
      };

      let response = await fetch(
        `${API_CONFIG.BASE_URL}/profile/profile-individual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(finalData),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `Error: ${response.status}`);
      }

      localStorage.setItem("profileCompleted", "true");
      localStorage.setItem("showCompletion", "true");
      navigate("/complet", { replace: true });

    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSkipAndContinue = () => {
    // Save current data
    localStorage.setItem("step6", JSON.stringify(formData));
    
    // Set flags
    localStorage.setItem("profileCompleted", "true");
    localStorage.setItem("showCompletion", "true");
    
    // ✅ FIXED: Navigate WITHOUT clearing data
    navigate("/complet", { replace: true });
  };

  // Rest of your JSX remains exactly the same...
  return (
<div className="
min-h-screen font-display flex flex-col items-center justify-center transition-colors duration-300

bg-white text-slate-900
dark:bg-[#0f231a] dark:text-white
">      <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col justify-center items-center py-12 md:py-25">
          <main className="flex w-full justify-center px-5">
            <div className="layout-content-container flex flex-col max-w-[640px] flex-1">
              {/* Step Progress */}
              <div className="flex flex-col gap-2 p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <p className="text-slate-700 dark:text-white text-[13px] uppercase tracking-[0.2em] font-semibold">
                      STEP 6 OF 6
                    </p>
                    <div className="rounded-full bg-white/10 h-1 overflow-hidden w-28">
                      <div
                        className="h-full rounded-full bg-[#0df287] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={handleSkipAndContinue}
                    className="
flex items-center gap-1 text-xs font-semibold tracking-wider transition-all

text-gray-500 hover:text-black
dark:text-white/60 dark:hover:text-white
"
                  >
                    Skip
                    <span className="material-symbols-outlined text-sm">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-10">
<h1 className="
text-3xl md:text-4xl font-bold leading-tight

text-slate-900
dark:text-white
">                  Link your professional profiles
                </h1>
<p className="
text-gray-500
dark:text-gray-400
">                  Help other sustainability researchers find your work across
                  the web. These are optional but recommended.
                </p>
              </div>

              <div className="flex flex-col gap-5 px-4">
                {/* LinkedIn */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/80 ml-1">
              LinkedIn 
            </label>
                  <div className="flex w-full items-stretch rounded-lg group">
                    <input
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
className="
flex w-full h-14 px-4 text-base rounded-lg outline-none transition-all

bg-gray-50 border border-gray-300 text-slate-900
placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#183527] dark:border-[#2f6a4e] dark:text-white
dark:placeholder:text-[#8eccaf]/50
"                     placeholder="linkedin.com/in/username"
                    />
                  </div>
                </div>

                {/* ResearchGate */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/80 ml-1">
              ResearchGate 
            </label>
                  <div className="flex w-full items-stretch rounded-lg group">
                    <input
                      name="research_gate"
                      value={formData.research_gate}
                      onChange={handleChange}
className="
flex w-full h-14 px-4 text-base rounded-lg outline-none transition-all

bg-gray-50 border border-gray-300 text-slate-900
placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#183527] dark:border-[#2f6a4e] dark:text-white
dark:placeholder:text-[#8eccaf]/50
"                      placeholder="researchgate.net/profile/name"
                    />
                  </div>
                </div>

                {/* ORCID */}
                <div className="flex flex-col gap-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/80 ml-1">
              ORCID 
            </label>
                  <div className="flex w-full items-stretch rounded-lg group">
                    <input
                      name="orc_id"
                      value={formData.orc_id}
                      onChange={handleChange}
className="
flex w-full h-14 px-4 text-base rounded-lg outline-none transition-all

bg-gray-50 border border-gray-300 text-slate-900
placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#183527] dark:border-[#2f6a4e] dark:text-white
dark:placeholder:text-[#8eccaf]/50
"                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                </div>

                {/* Personal Website */}
                <div className="flex flex-col gap-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-white/80 ml-1">
              Personal Website 
            </label>
                  <div className="flex w-full items-stretch rounded-lg group">
                    <input
                      name="personal_website"
                      value={formData.personal_website}
                      onChange={handleChange}
className="
flex w-full h-14 px-4 text-base rounded-lg outline-none transition-all

bg-gray-50 border border-gray-300 text-slate-900
placeholder:text-gray-400
focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20

dark:bg-[#183527] dark:border-[#2f6a4e] dark:text-white
dark:placeholder:text-[#8eccaf]/50
"                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex items-center justify-between gap-3 p-4 mt-8 border-t border-gray-200
dark:border-[#214a37]">
                  <button
                    onClick={onBack}
                    disabled={loading}
                    className="px-10 py-3 rounded-[10px] border-2 border-[#06f988]/30 text-[#06f988] font-bold hover:bg-[#06f988]/5 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-xl">
                      arrow_back
                    </span>
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-10 py-3 rounded-lg bg-[#06f988] text-[#0f231a] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined text-xl animate-spin">
                          progress_activity
                        </span>
                        Saving...
                      </>
                    ) : (
                      <>
                  Finish Setup
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-2">
                    <p className="text-red-500 text-center text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Step6;