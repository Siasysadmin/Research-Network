import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../../config/api.config";

const OrgProfileLinks = ({ progress, onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [links, setLinks] = useState({
    linkedin: "",
    researchGate: "",
    orcid: "",
    website: "",
  });

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("orgStep5");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Agar savedData mein links hain to set karo
        if (parsedData.links) {
          setLinks(parsedData.links);
        }
      } catch (error) {
        console.error("Error parsing saved links data:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const updatedLinks = { ...links, [e.target.name]: e.target.value };
    setLinks(updatedLinks);

    // Save to localStorage as user types
    localStorage.setItem(
      "orgStep5",
      JSON.stringify({
        submitted: false,
        links: updatedLinks,
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      const userDataString = localStorage.getItem("user");
      const user = userDataString ? JSON.parse(userDataString) : {};
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      // Get all steps data
      const step1 = JSON.parse(localStorage.getItem("orgStep1") || "{}");
      const step2 = JSON.parse(localStorage.getItem("orgStep2") || "{}");
      const step3 = JSON.parse(localStorage.getItem("orgStep3") || "{}");
      const step4 = JSON.parse(localStorage.getItem("orgStep4") || "{}");

      const finalData = {
        organization_name: step1.organization_name || "",
        organization_type: step1.organization_type || "",

        email: user.email || "",
        contact_no: user.contact || "",
        address: user.address || "",

        name: user.name || "",
        professional_role: user.role || "",

        country: step2.country || "",
        state: step2.state || "",
        city: step2.city || "",

        research_focus: step3.research_focus || [],

        platform: step4.platform || [],

        linkedin: links.linkedin,
        research_gate: links.researchGate,
        orc_id: links.orcid,
        personal_website: links.website,
      };

      const apiUrl = `${API_CONFIG.BASE_URL}/profile/profile-institute`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      });

      // Get response text first
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response:", responseText);
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(
          responseData.message || `Server error: ${response.status}`,
        );
      }

      // Success - mark step as completed
      localStorage.setItem(
        "orgStep5",
        JSON.stringify({
          submitted: true,
          links: links,
        }),
      );

      // Navigate to profile page
      navigate("/profileorg");
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(
      "orgStep5",
      JSON.stringify({
        submitted: false,
        links: links,
      }),
    );
    navigate("/profileorg");
  };

  return (
    <div className="min-h-screen bg-[#10221a] text-white flex flex-col items-center font-sans">
      {/* Header with Step Indicator */}
      <header className="w-full max-w-[640px] px-6 pt-16 pb-12 flex justify-between items-center">
        <div className="flex flex-col gap-2.5 w-[100px]">
          <p className="text-white text-[13px] uppercase tracking-[0.1em] font-semibold">
            Step 5 of 5
          </p>
          <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.5)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="text-[15px] font-medium text-white/60 hover:text-white transition-colors flex items-center gap-1"
        >
          Skip{" "}
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[640px] px-6 flex flex-col gap-10">
        <div className="text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-[40px] font-bold tracking-tight mb-4 text-white">
            Link your professional profiles
          </h1>
          <p className="text-white/40 text-lg">
            Help other sustainability researchers find your work. Linking these
            accounts helps verify your network credentials.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 max-w-[500px] mx-auto w-full"
        >
          {/* LinkedIn Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/80 ml-1">
              LinkedIn
            </label>
            <input
              name="linkedin"
              value={links.linkedin}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-[#31684e] bg-[#1a2e25] py-3.5 px-4 text-[15px] text-white placeholder:text-white/20 focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20 outline-none transition-all"
              placeholder="linkedin.com/in/username"
              type="url"
            />
          </div>

          {/* ResearchGate Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/80 ml-1">
              ResearchGate
            </label>
            <input
              name="researchGate"
              value={links.researchGate}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-[#31684e] bg-[#1a2e25] py-3.5 px-4 text-[15px] text-white placeholder:text-white/20 focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20 outline-none transition-all"
              placeholder="researchgate.net/profile/name"
              type="url"
            />
          </div>

          {/* ORCID Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/80 ml-1">
              ORCID
            </label>
            <input
              name="orcid"
              value={links.orcid}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-[#31684e] bg-[#1a2e25] py-3.5 px-4 text-[15px] text-white placeholder:text-white/20 focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20 outline-none transition-all"
              placeholder="0000-0000-0000-0000"
              type="text"
            />
          </div>

          {/* Website Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/80 ml-1">
              Personal Website
            </label>
            <input
              name="website"
              value={links.website}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-[#31684e] bg-[#1a2e25] py-3.5 px-4 text-[15px] text-white placeholder:text-white/20 focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20 outline-none transition-all"
              placeholder="https://yourwebsite.com"
              type="url"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Action Buttons Section */}
<div className="flex flex-row items-center justify-between gap-3 mt-10 pt-8 border-t border-[#214a37] w-full">
  
  {/* Back Button */}
  <button
    type="button"
    onClick={onBack}
    className="flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-lg border-2 border-[#00ff88]/30 text-[#00ff88] font-bold hover:bg-[#00ff88]/5 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm sm:text-base"
  >
    <span className="material-symbols-outlined text-lg">
      arrow_back
    </span>
    <span className="hidden xs:inline">Back</span>
    <span className="xs:hidden">Back</span>
  </button>

  {/* Finish Button */}
  <button
    type="submit"
    disabled={loading}
    className="flex-[2] sm:flex-none px-4 sm:px-10 py-3 rounded-lg bg-[#00ff88] text-[#0b1410] font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
  >
    {loading ? (
      <>
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#0b1410] border-t-transparent"></span>
        <span>Saving...</span>
      </>
    ) : (
      <>
        <span className="truncate">Finish Setup</span>
        <span className="material-symbols-outlined text-xl">
          arrow_forward
        </span>
      </>
    )}
  </button>
</div>
        </form>
      </main>

      {/* CSS to remove default focus outlines */}
      <style>{`
        input:focus {
          outline: none !important;
        }
        button:focus {
          outline: none !important;
        }
      `}</style>
    </div>
  );
};

export default OrgProfileLinks;
