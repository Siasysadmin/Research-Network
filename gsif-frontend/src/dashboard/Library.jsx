import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const Library = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States for View Details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Fetch All Published Research (List)
  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        const response = await fetch(`${API_CONFIG.BASE_URL}/research/get-published-research-library`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (result.status && result.data) {
          setPublications(result.data);
        }
      } catch (error) {
        console.error("Error fetching library data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, []);

  // 2. Fetch Specific Research Details on Click
  const handleViewDetails = async (researchId) => {
navigate(`/dashboard/library-view-details`, {
  state: { id: researchId }
});
    setIsModalOpen(true);
    setLoadingDetails(true);
    setSelectedDetails(null); // Clear previous data

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const response = await fetch(`${API_CONFIG.BASE_URL}/research/get-published-research-details-library/${researchId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const result = await response.json();

      if (result.status && result.data && result.data.length > 0) {
        setSelectedDetails(result.data[0]); // API returns array with 1 object
      }
    } catch (error) {
      console.error("Error fetching research details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Search Filter
  const filteredPublications = publications.filter((pub) =>
    pub.research_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pub.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full text-slate-100">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">
            Research Library & Discovery
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Explore thousands of publications and studies from our global network.
          </p>
        </div>

        {/* Search Bar Section */}
        <section className="mb-12">
          <div className="relative group max-w-4xl">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10b981] transition-colors text-2xl">
              search
            </span>
            <input
              className="w-full bg-[#181818] border border-white/5 focus:border-[#10b981]/50 focus:ring-4 focus:ring-[#10b981]/10 rounded-2xl pl-14 pr-6 py-4 text-lg transition-all shadow-sm outline-none text-white placeholder-slate-500"
              placeholder="Search by publication title, keywords, or author..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-20 bg-[#181818] rounded-2xl border border-white/5">
            <MaterialIcon name="search_off" className="text-6xl text-slate-600 mb-4 block" />
            <p className="text-slate-400 text-lg">No research publications found.</p>
          </div>
        ) : (
          /* Grid of Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPublications.map((pub) => (
              <div
                key={pub.researche_id}
                className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col h-full group transition-all duration-300 hover:-translate-y-1.5 hover:border-[#10b981]/30 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),0_0_15px_-3px_rgba(16,185,129,0.15)]"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider bg-[#10b981]/10 px-2 py-1 rounded-md">
                    Published
                  </span>
                  <button className="text-slate-500 hover:text-[#10b981] transition-colors">
                   
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-[#10b981] transition-colors line-clamp-2 mb-6 capitalize">
                  {pub.research_title}
                </h3>

                <div className="flex items-center gap-3 mb-8">
                  {/* Dynamic Avatar */}
                  <img 
  src={
    pub.profile_image 
      ? `${API_CONFIG.BASE_URL}/${pub.profile_image}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.name)}&background=1e293b&color=10b981`
  }
  alt={pub.name}
  className="w-10 h-10 rounded-full border border-white/10 shrink-0 object-cover"
  onError={(e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.name)}&background=1e293b&color=10b981`;
  }}
/>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 capitalize">
                      {pub.name}
                    </p>
                    <p className="text-xs text-[#10b981]/80 font-medium capitalize">
                      {pub.user_type === "institute" ? pub.institute_name || "Institute Researcher" : "Individual Researcher"}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-auto">
                  <button 
                    onClick={() => handleViewDetails(pub.researche_id)}
                    className="w-full bg-white/5 border border-transparent text-slate-300 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:border-[#10b981] hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:bg-[#10b981]/5 hover:text-[#10b981]"
                  >
                    <span className="material-symbols-outlined text-lg">
                      visibility
                    </span>{" "}
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (Optional/Static for now) */}
        {!loading && filteredPublications.length > 0 && (
          <div className="mt-16 flex justify-center">
            <button className="group relative bg-white/5 border border-white/10 hover:border-[#10b981]/50 text-slate-300 px-10 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-3 hover:text-[#10b981]">
              <span className="material-symbols-outlined group-hover:animate-spin">
                sync
              </span>
              Load More Results
            </button>
          </div>
        )}

        {/* ================= MODAL FOR RESEARCH DETAILS ================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl relative my-auto">
              
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-red-500/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
              >
                <MaterialIcon name="close" />
              </button>

              {loadingDetails ? (
                <div className="flex flex-col justify-center items-center py-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mb-4"></div>
                  <p className="text-slate-400">Fetching research details...</p>
                </div>
              ) : selectedDetails ? (
                <div className="p-8 sm:p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
                  
                  {/* Header Info */}
                  <div className="mb-8 border-b border-white/5 pb-8">
                    <div className="flex gap-3 mb-4">
                      <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {selectedDetails.research_type}
                      </span>
                      <span className="bg-white/5 text-slate-300 border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {selectedDetails.research_language}
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight capitalize mb-4">
                      {selectedDetails.research_title}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Published Year: <span className="text-white font-semibold">{selectedDetails.research_year}</span> • ID: {selectedDetails.registration_id}
                    </p>
                  </div>

                  {/* Author Box */}
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 mb-8">
                   <img 
  src={
    selectedDetails.profile_image
      ? `${API_CONFIG.BASE_URL}/${selectedDetails.profile_image}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDetails.name)}&background=10b981&color=000&size=128`
  }
  alt={selectedDetails.name}
  className="w-14 h-14 rounded-full object-cover"
  onError={(e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDetails.name)}&background=10b981&color=000&size=128`;
  }}
/>
                    <div>
                      <h4 className="text-lg font-bold text-white capitalize">{selectedDetails.name}</h4>
                      <p className="text-sm text-[#10b981]">
                        {selectedDetails.user_type === "institute" ? selectedDetails.institute_name || "Institute" : "Individual Researcher"}
                      </p>
                    </div>
                  </div>

                  {/* Abstract */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <MaterialIcon name="article" className="text-[#10b981]" /> Abstract
                    </h3>
                    <p className="text-slate-300 leading-relaxed bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a]">
                      {selectedDetails.abstract}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Method & Data */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Methodology</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDetails.method_type?.map((method, idx) => (
                            <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-200">
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data Profile</h4>
                        <p className="text-sm text-white bg-white/5 p-3 rounded-lg border border-white/5">
                          <span className="text-slate-400">Type:</span> {selectedDetails.data_type} <br/>
                          <span className="text-slate-400 mt-1 block">Sample Size:</span> {selectedDetails.simple_size}
                        </p>
                      </div>
                    </div>

                    {/* Geography & SDGs */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Geographical Relevance</h4>
                        <div className="bg-[#10b981]/5 border border-[#10b981]/20 p-4 rounded-xl">
                          <p className="text-sm text-white capitalize">
                            <span className="font-bold text-[#10b981] uppercase text-xs">{selectedDetails.level}</span>
                            <br/>
                            {[selectedDetails.district, selectedDetails.state, selectedDetails.country].filter(Boolean).join(", ") || selectedDetails.place || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">SDGs Addressed</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDetails.sdg?.map((goal, idx) => (
                            <div key={idx} className="w-10 h-10 bg-[#4c9f38] text-white font-bold flex items-center justify-center rounded-lg shadow-lg">
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDetails.keywords?.map((kw, idx) => (
                        <span key={idx} className="text-xs bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-3 py-1.5 rounded-md">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <p className="text-xs text-slate-500 italic flex-1">
                      Declaration: {selectedDetails.declaration_of_study}
                    </p>
                    {selectedDetails.research_file && (
                      <a 
                        href={`https://sasedge.org/research-network/back-end/${selectedDetails.research_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#10b981] text-black px-8 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 hover:bg-white transition-all flex items-center gap-2 shrink-0"
                      >
                        <MaterialIcon name="picture_as_pdf" />
                        View Full PDF
                      </a>
                    )}
                  </div>

                </div>
              ) : (
                <div className="p-10 text-center text-slate-400">Failed to load research details.</div>
              )}
            </div>
          </div>
        )}

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

export default Library;