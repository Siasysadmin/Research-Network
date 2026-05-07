import React, { useState, useEffect } from "react";
import {useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import API_CONFIG from "../config/api.config"; // Apna sahi path yahan dalein

// Helper for Icons
const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const ResearchPage = () => {
const location = useLocation();
const id = location.state?.id;
  const navigate = useNavigate();

  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const lightGreen = "#32ff99";

  useEffect(() => {
    const fetchResearchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get the token from storage
        const token = localStorage.getItem("token"); // Or wherever you store it

        const response = await fetch(
          `${API_CONFIG.BASE_URL}/research/get-published-research-details-library/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // 2. Add the Authorization header
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (result.status && result.data) {
          const data = Array.isArray(result.data)
            ? result.data[0]
            : result.data;
          setResearchData(data);
        } else {
          // If backend returns 'Token missing', display a specific error
          setError(result.message || "Research details not found.");
        }
      } catch (err) {
        setError("Failed to fetch data. Please check your connection.");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResearchDetails();
  }, [id]);

  // Loading State
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-white">
          <div className="w-12 h-12 border-4 border-[#32ff99] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">
            Loading Research Details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Error State
  if (error || !researchData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-white gap-4">
          <MaterialIcon name="error" className="text-5xl text-red-500" />
          <p className="text-xl font-bold">{error || "Data not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // PDF Path Construction
  const pdfUrl = `https://sasedge.org/research-network/back-end/${researchData.research_file}`;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-0">
        {/* Navigation Back */}
        <div className="mb-10 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium text-sm"
          >
            <MaterialIcon name="arrow_back" className="text-lg" />
            Back to Library
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
          {/* LEFT SIDE: MAIN CONTENT */}
          <div className="lg:col-span-9 flex flex-col gap-10 ">
            <section>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 capitalize">
                {researchData.research_title}
              </h1>

              <div className="flex flex-col gap-8 mb-10">
                <p className="text-lg font-semibold text-slate-200">
                  {new Date(researchData.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Primary Author */}
                 <div className="flex items-center gap-3">
  <img
    src={
      researchData.profile_image
        ? `${API_CONFIG.BASE_URL}/${researchData.profile_image}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(researchData.name)}&background=1e293b&color=32ff99`
    }
    alt={researchData.name}
    className="w-10 h-10 rounded-full object-cover border border-[#32ff99]/30 shrink-0"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(researchData.name)}&background=1e293b&color=32ff99`;
    }}
  />
  <div>
    <p className="text-sm font-bold text-white leading-tight">
      {researchData.name}
    </p>
    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
      ID: {researchData.registration_id}
    </p>
  </div>
</div>

                  {/* Co-Author Logic */}
                  <div>
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                      Co-Author Information
                    </h2>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-white leading-tight">
                        {researchData.co_author_name || "No Co-Author listed"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
                  <div>
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                      Type of Research
                    </h2>
                    <p className="text-sm font-bold text-white leading-tight">
                      {researchData.research_type}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                      Language
                    </h2>
                    <p className="text-sm font-bold text-white leading-tight capitalize">
                      {researchData.research_language}
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                    Keywords
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {researchData.keywords &&
                      researchData.keywords.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Study Overview Grid */}
              <div className="mb-12">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">
                  Study Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {[
                    {
                      label: "Year of Research",
                      val: researchData.research_year,
                    },
                    {
  label: "Location",
  val: (() => {
    const parts = [];
    if (researchData.district) parts.push(researchData.district);
    if (researchData.state) parts.push(researchData.state);
    if (researchData.country) parts.push(researchData.country);
    return parts.length > 0 ? parts.join(", ") : null;
  })(),
},
                    { label: "Level", val: researchData.level },
                    { label: "Data Type", val: researchData.data_type },
                    { label: "Sample Size", val: researchData.simple_size },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-6 rounded-2xl flex flex-col justify-between shadow-lg"
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        {item.label}
                      </span>
                      <span className="text-xl font-bold text-white capitalize">
                        {item.val || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Detailed Parameters */}
            <section className="space-y-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                Detailed Parameters
              </h2>

              {/* SDG Goals */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-8 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">
                  Sustainable Goals (SDG)
                </span>
                <div className="flex flex-wrap gap-2">
                  {researchData.sdg_goals &&
                    researchData.sdg_goals.map((goal) => (
                      <span
                        key={goal}
                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {goal}
                      </span>
                    ))}
                </div>
              </div>

              {/* Method Type */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-8 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">
                  Method Type
                </span>
                <div className="flex flex-wrap gap-2">
                  {researchData.method_type &&
                    researchData.method_type.map((type) => (
                      <span
                        key={type}
                        className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {type}
                      </span>
                    ))}
                </div>
              </div>

              {/* Abstract & Declaration */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-8 rounded-2xl">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">
                    Abstract
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-[15px] mb-6">
                    {researchData.abstract}
                  </p>

                  <h3 className="text-sm font-bold text-slate-300 uppercase mb-2">
                    Declaration of Study
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-[15px]">
                    {researchData.declaration_of_study}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE: PDF PREVIEW STICKY */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group max-w-[280px] mx-auto lg:ml-auto">
                {/* Visual Mockup */}
                <div className="relative bg-[#f8f9fa] aspect-[1/1.2] overflow-hidden p-6 flex flex-col pointer-events-none select-none">
                  <div className="flex justify-between items-start mb-6">
                    <MaterialIcon
                      name="description"
                      className="text-slate-400 text-3xl"
                    />
                    <div className="text-[8px] text-slate-400 text-right font-bold">
                      ID: {researchData.registration_id}
                    </div>
                  </div>
                  <div className="h-[3px] w-10 bg-[#32ff99] mb-6"></div>
                  <h3 className="text-[18px] font-extrabold text-slate-900 leading-tight mb-2 line-clamp-4">
                    {researchData.research_title}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">
                    {researchData.name}
                  </p>

                  <div className="mt-auto space-y-2 opacity-20">
                    <div className="h-1 bg-slate-900 w-full rounded"></div>
                    <div className="h-1 bg-slate-900 w-full rounded"></div>
                    <div className="h-1 bg-slate-900 w-2/3 rounded"></div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="p-6 bg-[#1a1f2e] border-t border-white/5 text-center">
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Format
                    </p>
                    <p className="text-xs text-white font-medium">
                      Research Manuscript (PDF)
                    </p>
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ backgroundColor: lightGreen }}
                    className="w-full text-slate-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:brightness-110 active:scale-95 group"
                  >
                    <MaterialIcon name="download" className="text-2xl" />
                    <span className="text-base">Download PDF</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Isse pure page ka default scrollbar hide ho jayega */}
<style jsx global>{`
  /* Chrome, Safari aur Opera ke liye */
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  /* Firefox ke liye */
  * {
    scrollbar-width: none;
  }

  /* IE aur Edge ke liye */
  * {
    -ms-overflow-style: none;
  }
`}</style>
    </DashboardLayout>
  );
};

export default ResearchPage;
