import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

// ✅ CONFIRM MODAL
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div
        className="
    bg-white border border-gray-200 text-slate-800
    dark:bg-[#1a2e1a] dark:border-[#3b4b3d]/50 dark:text-[#e2e3e0]
    rounded-2xl p-6 sm:p-8 w-[90%] max-w-md shadow-2xl
  "
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full 
bg-green-100 text-green-600
dark:bg-[#00ff85]/10 dark:text-[#00ff85]
flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-3xl text-[#00ff85]">
              publish
            </span>
          </div>
        </div>
        {/* Title */}
        <h2
          className="text-center text-lg sm:text-xl font-extrabold 
text-slate-800 dark:text-[#e2e3e0] 
uppercase tracking-wide mb-2"
        >
          {" "}
          {title}
        </h2>
        {/* Message */}
        <p
          className="text-center text-sm 
text-slate-600 dark:text-[#b9cbb9] mb-6"
        >
          {message}
        </p>
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="
    flex-1 py-2.5 rounded-xl border 
    border-gray-300 text-slate-600
    hover:bg-gray-100
    dark:border-[#3b4b3d]/50 dark:text-[#b9cbb9] dark:hover:bg-[#3b4b3d]/30
    text-sm font-bold uppercase tracking-widest transition-all
  "
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="
    flex-1 py-2.5 rounded-xl 
    bg-green-600 text-white hover:bg-green-700
    dark:bg-[#00ff85] dark:text-[#0a1a0a] dark:hover:bg-[#00e676]
    text-sm font-bold uppercase tracking-widest transition-all
  "
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ PUBLICATION CARD
const PublicationCard = ({
  status,
  statusColor,
  statusCode,
  title,
  category,
  abstract,
  pdfPath,
  onPublish,
  onEdit,
  updatedAt,
  updateCount,
}) => {
  const fullPdfUrl = pdfPath ? `${API_CONFIG.BASE_URL}/${pdfPath}` : null;
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  return (
    <div
      className="
group relative flex flex-col sm:flex-row items-start sm:items-center justify-between
p-5 sm:p-8 rounded-xl border transition-all duration-300 gap-5 sm:gap-4

bg-white border-gray-200 text-slate-800
  border-2 hover:border-[#00ff85]

dark:bg-[#1a1c1b] dark:border-[#3b4b3d]/30 dark:text-[#e2e3e0]
dark:hover:bg-[#1e201f] dark:hover:border-[#00ff85]
"
    >
      {/* Left - Info */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full sm:max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            className={`px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase ${statusColor}`}
          >
            {status}
          </span>
          <span
            className="
  px-2 py-0.5 rounded-sm
  bg-slate-100 text-slate-700
  dark:bg-[#333534] dark:text-[#b9cbb9]
  text-[10px] font-bold tracking-widest uppercase
"
          >
            {" "}
            {category || "Uncategorized"}
          </span>
        </div>
        <h2
          className="
text-lg sm:text-2xl font-bold tracking-tight transition-colors

text-slate-800 hover:text-green-600
dark:text-[#e2e3e0] dark:hover:text-[#00ff85]
"
        >
          {" "}
          {title}
        </h2>
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 dark:text-[#b9cbb9] uppercase">
            {" "}
            ABSTRACT
          </span>
          <>
            <p
              className={`
    text-xs sm:text-sm leading-relaxed italic
    text-slate-600 dark:text-[#b9cbb9]/80
    ${showFullAbstract ? "" : "line-clamp-3"}
  `}
            >
              {abstract}
            </p>

            {abstract && (
              <button
                type="button"
                onClick={() => setShowFullAbstract(!showFullAbstract)}
                className="
      mt-1 text-[11px] font-semibold
      text-green-600 hover:text-green-700
      dark:text-[#00ff85] dark:hover:brightness-110
      transition-all
    "
              >
                {showFullAbstract ? "Show Less" : "Read More"}
              </button>
            )}
          </>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-4 w-full sm:min-w-[140px]">
        {fullPdfUrl && (
          <a
            href={fullPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all

bg-gray-100 border border-gray-200 text-slate-700 hover:bg-green-100 hover:text-green-700

dark:bg-[#333534] dark:border-[#3b4b3d]/30 dark:text-[#e2e3e0]
dark:hover:bg-[#00ff85] dark:hover:text-[#003919]
"
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              View PDF
            </span>
            <MaterialIcon name="description" className="text-base sm:text-lg" />
          </a>
        )}

        {statusCode === "2" && (
          <button
            onClick={onPublish}
            className="
flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all

bg-green-600 text-white hover:bg-green-700

dark:bg-[#00ff85] dark:text-[#003919] dark:hover:brightness-110
"
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              Publish
            </span>
            <MaterialIcon name="publish" className="text-base sm:text-lg" />
          </button>
        )}

        {statusCode === "4" && Number(updateCount || 0) < 2 && (
          <button
            onClick={onEdit}
            className="
      flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all
      bg-amber-500 text-white hover:bg-amber-600
      dark:bg-[#333534] dark:border dark:border-[#3b4b3d]/30 dark:text-[#e2e3e0]
      dark:hover:bg-[#00ff85] dark:hover:text-[#003919]
    "
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              Edit
            </span>
            <MaterialIcon name="edit" className="text-base sm:text-lg" />
          </button>
        )}
      </div>
    </div>
  );
};

// ✅ MAIN MyResearch COMPONENT
const MyResearch = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ CONFIRM MODAL STATE
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    researchId: null,
  });

  useEffect(() => {
    fetchPublications();
  }, []);

  // ✅ FETCH PUBLICATIONS - Latest First
  const fetchPublications = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/get-research-users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.status) {
        const data = Array.isArray(result.data) ? result.data : [result.data];
        // ✅ Latest first sort
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          return dateB - dateA;
        });
        setPublications(sorted);
      } else {
        setPublications([]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ OPEN CONFIRM MODAL
  const openPublishConfirm = (id) => {
    setConfirmModal({ isOpen: true, researchId: id });
  };

  // ✅ ACTUAL PUBLISH
  const handlePublish = async () => {
    const id = confirmModal.researchId;
    setConfirmModal({ isOpen: false, researchId: null });
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/research/published-research/${id}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (result.status) {
        toast.success("Successfully Published!");
        fetchPublications();
      } else {
        toast.error(result.message || "Failed to publish");
      }
    } catch (error) {
      toast.error("Error publishing research.");
    }
  };

  const getStatusDetails = (status) => {
    switch (String(status)) {
      case "1":
        return {
          label: "Pending",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
      case "2":
        return {
          label: "Approved",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "3":
        return {
          label: "Published",
          color: "bg-[#00ff85]/10 text-[#00ff85] border-[#00ff85]/20",
        };
      case "4":
        return {
          label: "Rejected",
          color: "bg-red-500/10 text-red-400 border-red-500/20",
        };
      default:
        return {
          label: "Unknown",
          color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        };
    }
  };

  return (
    <>
      {/* ✅ CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, researchId: null })}
        onConfirm={handlePublish}
        title="Publish Research?"
        message="Are you sure? This research will be publicly visible.."
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff85]"></div>
        </div>
      ) : publications.length > 0 ? (
        publications.map((pub) => {
          const updateDate = pub.updated_at
            ? new Date(pub.updated_at).toLocaleDateString()
            : "Just now";
          return (
            <PublicationCard
              key={pub.id || pub.researche_id}
              statusCode={String(pub.status)}
              status={getStatusDetails(pub.status).label}
              statusColor={getStatusDetails(pub.status).color}
              title={pub.research_title}
              category={pub.research_type || "Research"}
              abstract={pub.abstract}
              pdfPath={pub.research_file}
              updateCount={pub.update_count}
              onPublish={() => openPublishConfirm(pub.id)}
              onEdit={() =>
                navigate("/dashboard/research-resubmission", {
                  state: {
                    researchId: pub.researche_id || pub.id,
                  },
                })
              }
            />
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 border-2 border-dashed border-[#3b4b3d]/30 rounded-xl opacity-50">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-[#b9cbb9]/30 mb-4">
            description
          </span>
          <p className="text-[#b9cbb9] font-medium uppercase tracking-widest text-xs">
            No publications yet
          </p>
        </div>
      )}

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default MyResearch;
