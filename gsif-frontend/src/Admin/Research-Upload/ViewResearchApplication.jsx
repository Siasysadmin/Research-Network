import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../Layout/Layout";
import API_CONFIG from "../../config/api.config";

// Material Icon Component
const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Research Application Details Component
const ResearchApplicationDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [activeNav, setActiveNav] = useState("research-applications");
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardMembers, setBoardMembers] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  // Get the research ID from navigation state
  const researchId = location.state?.id;
  
  // User object
  const user = {
    name: "Vansh Jain",
    role: "Super Admin",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf7JwUiWz356JA-gFPnQTqEINhjvPJlbat1E1kZDW_fE_fcrgZngWngd_e7DoJ3h9q-M449WVP7y4yTvpFrGBNekRqj1yCiPHPpOIYnxk0gIQ5_sO3tFTDsnd3OhWwKNJnI_SSBc00wLB-gU347GUeX7ILKrljQYpBe-1JKkqbzN8BBuKY6zCWULxirg2_1kikZ9Y3O0TrKl2UZ8R7aynHXI4PgvlX5xqXcmzFvFRTLMeESxtRsolTgOrxvS6WRLF3XBFc-W4LgzR4'",
  };

  useEffect(() => {
    const fetchResearchDetails = async () => {
      if (!researchId) {
        setError("No research ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");

        if (!token) {
          navigate("/login");
          return;
        }

        const apiUrl = `${API_CONFIG.BASE_URL}/admin/view-research-admin/${researchId}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === true) {
          setResearchData(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch research details");
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchDetails();
    fetchBoardMembers();
  }, [researchId, navigate]);

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/approve-research-admin/${researchId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: researchData?.user_id,
            email: researchData?.user_id,
          }),
        },
      );

      const data = await response.json();

      if (data.status) {
        alert("Research Approved Successfully ✅");
        
        // ✅ FIX: Save "2" for Approved to match Backend Standards
        localStorage.setItem(`admin_action_${researchId}`, "2");
        setResearchData((prev) => ({ ...prev, status: "2" }));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Approve Error:", error);
    }
  };

 const handleReject = async () => {
  if (!rejectReason.trim()) {
    alert("Please provide a reason for rejection.");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/admin/rejected-research-admin/${researchId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: researchData.user_id,
          email: researchData.email,
          reason: rejectReason,        
        }),
      },
    );

    const data = await response.json();

    if (data.status) {
      alert("Research Rejected ❌");
      localStorage.setItem(`admin_action_${researchId}`, "3");
      setResearchData((prev) => ({ ...prev, status: "3" }));
      setShowRejectModal(false);
      setRejectReason("");
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Reject Error:", error);
  }
};

  const fetchBoardMembers = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/board-member-response-admin/${researchId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      console.log("Board Members:", data);

      if (data.status) {
        setBoardMembers(data.data);
      }
    } catch (error) {
      console.error("Board API Error:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout activeNav={activeNav} setActiveNav={setActiveNav} user={user}>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center p-8 bg-[#13231a] border border-[#1e3a2c] rounded-xl">
            <div className="flex justify-center items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ff88]"></div>
              <p className="text-gray-400">Loading research details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !researchData) {
    return (
      <Layout activeNav={activeNav} setActiveNav={setActiveNav} >
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center p-8 bg-[#13231a] border border-red-900/30 rounded-xl">
            <p className="text-red-400">{error || "Research not found"}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-[#1e3a2c] text-white rounded-lg hover:bg-[#2a4a38] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const abstractText = researchData.abstract || "";
  const truncatedAbstract =
    abstractText.length > 300
      ? abstractText.slice(0, 300) + "..."
      : abstractText;

  // ✅ 100% BUG-FREE STATUS CALCULATION
  const statusStr = String(researchData.status);
  const localAdminAction = localStorage.getItem(`admin_action_${researchId}`);
  
  // Priority: Local Action > Backend Data
  const finalDisplayStatus = localAdminAction || statusStr;

  // Real definitions based on your DB
  const isApproved = finalDisplayStatus === "2";
  const isRejected = finalDisplayStatus === "3" || finalDisplayStatus === "4" || finalDisplayStatus === "0";
  const isPending = !isApproved && !isRejected;

  // ✅ CHECK IF RESEARCH IS ALREADY PUBLISHED BY USER
  const isPublished = researchData.is_published === 1 || 
                      researchData.is_published === "1" || 
                      researchData.publication_status === "published" ||
                      researchData.is_public === 1;
  
  // If published, show as approved (no action needed)
  const canTakeAction = isPending && !isPublished;

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav} user={user}>
      <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
        {/* Back Button */}
        <div className="flex items-center pb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-[#00ff88] transition-all py-2 px-4 bg-[#13231a] border border-[#1e3a2c] rounded-lg group shadow-sm"
          >
            <MaterialIcon name="arrow_back" className="text-lg" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Back to List
            </span>
          </button>
        </div>
        
        {/* Research Identity Section */}
        <section className="bg-[#13231a] border border-[#1e3a2c] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#1e3a2c] bg-[#0a120e]/30 flex items-center gap-2">
            <MaterialIcon
              name="description"
              className="text-[#00ff88] text-xl"
            />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Research Identity
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Research Title
              </p>
              <p className="text-2xl font-semibold text-white leading-relaxed">
                {researchData.research_title}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Type of Research
              </p>
              <p className="text-sm text-slate-200">
                {researchData.research_type}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Language
              </p>
              <p className="text-sm text-slate-200">
                {researchData.research_language}
              </p>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Abstract
              </p>
              <div className="relative">
                <p className="text-sm text-slate-400 leading-relaxed text-justify">
                  {showFullAbstract ? abstractText : truncatedAbstract}
                </p>
                {abstractText.length > 300 && (
                  <button
                    onClick={() => setShowFullAbstract(!showFullAbstract)}
                    className="mt-2 text-[#00ff88] text-xs font-bold hover:underline"
                  >
                    Read {showFullAbstract ? "less" : "more"}
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(researchData.keywords) &&
                  researchData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-[#1e3a2c]/50 text-slate-300 text-xs rounded-full border border-[#1e3a2c]"
                    >
                      {keyword}
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Year of Research
              </p>
              <p className="text-sm text-slate-200">
                {researchData.research_year}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Research Status
              </p>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                {researchData.research_status || "Peer Reviewed"}
              </span>
            </div>

            <div className="hidden lg:block"></div>

            {/* GEOGRAPHICAL RELEVANCE SECTION */}
            <div className="md:col-span-2 lg:col-span-3 mt-4 bg-[#0a120e]/40 border border-[#1e3a2c] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e3a2c]">
                <MaterialIcon name="public" className="text-[#00ff88] text-lg" />
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">
                  Geographical Relevance
                </h4>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                    Level
                  </p>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#1e3a2c] text-slate-300 border border-[#2a4a38] capitalize">
                    {researchData.level || "N/A"}
                  </span>
                </div>

                {researchData.district && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                      District
                    </p>
                    <p className="text-sm text-slate-200 capitalize font-medium">{researchData.district}</p>
                  </div>
                )}

                {researchData.state && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                      State
                    </p>
                    <p className="text-sm text-slate-200 capitalize font-medium">{researchData.state}</p>
                  </div>
                )}

                {researchData.country && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                      Country
                    </p>
                    <p className="text-sm text-slate-200 capitalize font-medium">{researchData.country}</p>
                  </div>
                )}

                {(!researchData.district && !researchData.state && !researchData.country) && researchData.place && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                      Location Details
                    </p>
                    <p className="text-sm text-slate-200 capitalize font-medium">{researchData.place}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Author Details Section */}
        <section className="bg-[#13231a] border border-[#1e3a2c] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#1e3a2c] bg-[#0a120e]/30 flex items-center gap-2">
            <MaterialIcon name="groups" className="text-[#00ff88] text-xl" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Author Details
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Primary Author ID
              </p>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded bg-slate-800 flex items-center justify-center text-[10px] text-[#00ff88]">
                  ID
                </div>
                <p className="text-sm font-mono text-slate-200">
                  {researchData.primary_author_id}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                Co-Author IDs
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(researchData.co_author_id) &&
                  researchData.co_author_id.map((author, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[#0a120e] text-slate-400 text-xs font-mono rounded border border-[#1e3a2c]"
                    >
                      {author}
                    </span>
                  ))}
              </div>
            </div>
            {Array.isArray(researchData.co_author_name) &&
              researchData.co_author_name.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                    Co-Author Names
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {researchData.co_author_name.map((name, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#0a120e] text-slate-400 text-xs rounded border border-[#1e3a2c]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* Sustainability Theme Section */}
        <section className="bg-[#13231a] border border-[#1e3a2c] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#1e3a2c] bg-[#0a120e]/30 flex items-center gap-2">
            <MaterialIcon name="eco" className="text-[#00ff88] text-xl" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Sustainability Theme
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">
                Sustainable Development Goals (SDGs)
              </p>
              <div className="flex flex-wrap gap-2.5">
                {Array.isArray(researchData.sdg_goals) && researchData.sdg_goals.length > 0 ? (
                  researchData.sdg_goals.map((goalName, index) => (
                    <div key={index} className="group relative">
                      <div className="px-3 py-2 bg-[#4c9f38] rounded-md flex items-center justify-center text-white font-semibold text-xs shadow-lg border border-white/10 hover:bg-[#5ab346] transition-colors line-clamp-2 max-w-[140px] text-center">
                        {goalName}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No SDGs selected</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">
                Impact Type
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(researchData.type_of_impact) &&
                  researchData.type_of_impact.map((impact, index) => {
                    let colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                    if (impact.toLowerCase().includes("social")) {
                      colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                    } else if (impact.toLowerCase().includes("environment")) {
                      colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                    } else if (impact.toLowerCase().includes("economic")) {
                      colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                    }

                    return (
                      <span
                        key={index}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg border ${colorClass}`}
                      >
                        {impact}
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        </section>

        {/* Research Methodology Section */}
        <section className="bg-[#13231a] border border-[#1e3a2c] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#1e3a2c] bg-[#0a120e]/30 flex items-center gap-2">
            <MaterialIcon name="biotech" className="text-[#00ff88] text-xl" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Research Methodology
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Method Type
              </p>
              <p className="text-sm text-slate-200">
                {Array.isArray(researchData.method_type)
                  ? researchData.method_type.join(", ")
                  : researchData.method_type}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Sample Size / Data Scale
              </p>
              <p className="text-sm text-slate-200">
                {researchData.simple_size}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Data Type
              </p>
              <p className="text-sm text-slate-200">{researchData.data_type}</p>
            </div>
            
            <div className="lg:col-span-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                Declaration of Study
              </p>
              <p className="text-xs text-slate-400 italic">
                "{researchData.declaration_of_study}"
              </p>
            </div>
          </div>
        </section>

        {/* Uploaded Files Section */}
        {researchData.research_file && (
          <section className="bg-[#13231a] border border-[#1e3a2c] rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#1e3a2c] bg-[#0a120e]/30 flex items-center gap-2">
              <MaterialIcon
                name="folder_zip"
                className="text-[#00ff88] text-xl"
              />
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
                Uploaded Files & Declaration
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a120e]/50 border border-[#1e3a2c] p-5 rounded-lg flex items-center justify-between group hover:border-[#00ff88]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-red-500/20 text-red-400 flex items-center justify-center rounded">
                      <MaterialIcon
                        name="picture_as_pdf"
                        className="text-3xl"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {researchData.research_file.split("/").pop()}
                      </p>
                      <p className="text-[10px] text-slate-500">PDF Document</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${API_CONFIG.BASE_URL}/${researchData.research_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-[#00ff88] transition-colors"
                      title="View PDF"
                    >
                      <MaterialIcon name="visibility" />
                    </a>
                    <a
                      href={`${API_CONFIG.BASE_URL}/${researchData.research_file}`}
                      download
                      className="p-2 text-slate-400 hover:text-[#00ff88] transition-colors"
                      title="Download"
                    >
                      <MaterialIcon name="download" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- Board Member Review Status Section --- */}
        <section className="bg-[#13231a] border border-[#1e3a2c] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#1e3a2c] bg-[#0a120e]/30 flex items-center gap-2">
            <MaterialIcon
              name="fact_check"
              className="text-[#00ff88] text-xl"
            />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Board Member Review Status
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {boardMembers.map((member) => {
              let statusText = "Pending";
              let statusClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

              if (member.status == 2) {
                statusText = "Approved";
                statusClass = "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20";
              } else if (member.status == 3 || member.status == 4) {
                statusText = "Rejected";
                statusClass = "bg-red-500/10 text-red-500 border-red-500/20";
              } else if (member.status == 1) {
                statusText = "Pending";
                statusClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
              }

              return (
                <div
                  key={member.id}
                  className="bg-[#0a120e]/40 border border-[#1e3a2c] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {member.institute_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        ID : {member.board_member_registration_id}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded border ${statusClass}`}
                    >
                      {statusText}
                    </span>
                  </div>

                  {member.remark && (
                    <p className="mt-2 text-xs text-slate-400">
                    Reason:  {member.remark}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="mt-10 pt-8 border-t border-[#1e3a2c] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-2">
                  Final Action Section for Admin
                </h4>
              </div>
              <div className="flex items-center gap-3">
                {/* ✅ SHOW BUTTONS ONLY IF PENDING & NOT PUBLISHED */}
             {canTakeAction && (
  <>
    <button
      onClick={() => setShowRejectModal(true)}   // ← sirf modal open karo
      className="px-6 py-2.5 rounded-lg border border-red-500/40 text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
    >
      Reject
    </button>
    <button
      onClick={handleApprove}
      className="px-6 py-2.5 rounded-lg bg-[#00ff88] text-[#0a120e] text-sm font-bold hover:brightness-110 shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all"
    >
      Approve
    </button>
  </>
)}

{/* ✅ Reject Reason Modal */}
{showRejectModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-[#13231a] border border-[#1e3a2c] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        
        <div>
          <h3 className="text-sm font-bold text-white">Reject Research?</h3>
          <p className="text-xs text-slate-500">Please provide a reason for rejection</p>
        </div>
      </div>

      <div className="border-t border-[#1e3a2c] pt-4">
        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">
          Rejection Reason
        </label>
        <textarea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Insufficient methodology, missing references..."
          className="w-full bg-[#0a120e] border border-[#1e3a2c] rounded-lg text-slate-300 text-sm p-3 resize-none focus:outline-none focus:border-red-500/50 transition-colors"
        />
      </div>

      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
          className="px-5 py-2 rounded-lg border border-[#1e3a2c] text-slate-400 text-sm font-bold hover:bg-[#1e3a2c] transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleReject}
          className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
        >
          Confirm Reject
        </button>
      </div>
    </div>
  </div>
)}
                
                {/* SHOW STATUS IF ALREADY DECIDED */}
                {isApproved && (
                  <span className="px-6 py-2.5 rounded-lg bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 text-sm font-bold">
                    ✅ Approved
                  </span>
                )}
                
                {isRejected && (
                  <span className="px-6 py-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold">
                    ❌ Rejected
                  </span>
                )}

                {/* ✅ NEW: SHOW MESSAGE IF PUBLISHED */}
                {isPublished && !isApproved && !isRejected && (
                  <span className="px-6 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-bold">
                    📤 Published (No Action Required)
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
        
        <div className="h-10"></div> 
      </div>
    </Layout>
  );
};

export default ResearchApplicationDetails;