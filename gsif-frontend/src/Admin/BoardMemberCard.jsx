import React, { useState, useEffect, useRef } from "react";
import Layout from "../Admin/Layout/Layout";
import API_CONFIG from "../config/api.config";

const MaterialIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`}>
      {message}
    </div>
  );
};
const BoardMembers = () => {
  const [activeNav, setActiveNav] = useState("board");
  const [search, setSearch] = useState("");
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // popup states
  const [showReplacePopup, setShowReplacePopup] = useState(false);
  const [replaceMemberId, setReplaceMemberId] = useState("");

  // search states
  const [registrationId, setRegistrationId] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // ✅ Store original IDs for stable keys
  const stableIds = useRef(new Map());

  // Show toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };
  // ✅ CORRECT PLACE - boardMembers state yahan accessible hai
const isAlreadyBoardMember = (regId) => {
  return boardMembers.some(
    (member) => member.registration_id === regId
  );
};

  // =========================
  // FETCH BOARD MEMBERS
  // =========================
  useEffect(() => {
    const fetchBoardMembers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/research/get-board-member`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const result = await response.json();
        if (result.status) {
          // ✅ Store stable IDs for each member
          result.data.forEach((member) => {
            if (!stableIds.current.has(member.registration_id)) {
              stableIds.current.set(member.registration_id, `stable-${member.registration_id}-${Date.now()}-${Math.random()}`);
            }
          });
          setBoardMembers(result.data);
        }
      } catch (error) {
        console.error("Error fetching board members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoardMembers();
  }, []);

  // =========================
  // SEARCH USER BY REGISTRATION
  // =========================
  const searchUserByRegistration = async () => {
    if (!registrationId) {
      setSearchedUser(null);
      return;
    }
    try {
      setSearchLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/get-user-registration/${registrationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();
      console.log("API SE AYA DATA:", result); // ← BAS YE ADD KAR
if (result.status) {
  setSearchedUser(result.data);
}
      if (result.status) {
        setSearchedUser(result.data);
      } else {
        setSearchedUser(null);
      }
    } catch (error) {
      console.error("Error searching user:", error);
      setSearchedUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // =========================
  // AUTO SEARCH WHEN ID TYPE
  // =========================
  useEffect(() => {
    if (!registrationId) {
      setSearchedUser(null);
      return;
    }
    const delay = setTimeout(() => {
      searchUserByRegistration();
    }, 400);
    return () => clearTimeout(delay);
  }, [registrationId]);

  // =========================
  // MAIN SEARCH FILTER
  // =========================
 const filteredMembers = boardMembers.filter((member) => {
  const name =
    member.user_type === "individual"
      ? member.name
      : member.institute_details?.institute_name ||
        member.institute_name ||
        member.name;

  return (name || "")
    .toLowerCase()
    .includes(search.toLowerCase());
});

  // =========================
  // REPLACE BOARD MEMBER API
  // =========================
  const replaceBoardMember = async () => {
    if (!searchedUser || !replaceMemberId) return;

      if (registrationId === replaceMemberId) {
    showToast("You are selecting the same member!", "error");
    return;
  }

  // ❌ ALREADY BOARD MEMBER CHECK ✅ Ab ye sahi kaam karega
  if (isAlreadyBoardMember(registrationId)) {
    showToast("This user is already a board member!", "error");
    return;
  }
  
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/research/board-member-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            board_member_id: replaceMemberId,
            new_board_member_id: registrationId,
            new_member_email: searchedUser?.email || searchedUser?.email_id || "",
          }),
        },
      );
     const result = await response.json();

      if (result.status) {
        showToast("Board member replaced successfully!");

        // ✅ CRITICAL FIX: Properly update member data
        setBoardMembers((prevMembers) => {
          return prevMembers.map((member) => {
            if (member.registration_id === replaceMemberId) {
              // Create updated member with ALL fields properly set
              const updatedMember = {
                // First, keep ALL original fields
                ...member,
                // Then update with new data
                email: searchedUser.email,
                user_type: searchedUser.user_type,
                //  IMPORTANT: registration_id ko SAME rakhna hai for key stability
                registration_id: member.registration_id, // Ye line CRITICAL hai
              };

              // Handle based on user type
              if (searchedUser.user_type === "individual") {
                // For individual users
                updatedMember.name = searchedUser.name;
                updatedMember.institute_details = null;
                // Remove institute-specific fields
                delete updatedMember.institute_name;
              } else {
                // For institute users
                updatedMember.name = searchedUser.name; // Keep for fallback
                updatedMember.institute_details = {
                  institute_name: searchedUser.institute_name || searchedUser.name
                };
                // Also set institute_name directly for easier access
                updatedMember.institute_name = searchedUser.institute_name || searchedUser.name;
              }
              return updatedMember;
            }
            return member;
          });
        });

        // Reset popup
        setShowReplacePopup(false);
        setReplaceMemberId("");
        setSearchedUser(null);
        setRegistrationId("");
      } else {
        showToast(result.message || "Failed to replace member", "error");
      }
    } catch (error) {
      console.error("Error replacing board member:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav} >
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mt-4">
              Board Members Management
            </h2>
            <p className="text-sm text-slate-400">
              Overview and management of the current institutional advisory
              board.
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-center text-gray-400">Loading board members...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {filteredMembers.map((member) => {
              // Display name based on user type
              let displayName = "";
              if (member.user_type === "individual") {
                displayName = member.name;
              } else {
                displayName = member.institute_details?.institute_name || member.institute_name || member.name;
              }

              return (
                <div
                  // ✅ Use stable ID from ref, not registration_id
                  key={stableIds.current.get(member.registration_id) || member.registration_id}
                  className="bg-[#13231a] border border-[#1e3a2c] rounded-lg p-4 flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="size-16 rounded-full bg-[#0a120e] border-2 border-[#1e3a2c] flex items-center justify-center mb-3">
                    <MaterialIcon
                      name="account_circle"
                      className="text-5xl text-slate-400"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {displayName}
                  </h3>
                  <p className="text-xs text-[#00ff88] font-semibold mb-1">
                    {member.registration_id}
                  </p>
                  <p className="text-xs text-slate-400 mb-4 break-all whitespace-normal text-center w-full">
                    {member.email}
                  </p>
                  <button
                    onClick={() => {
                      setReplaceMemberId(member.registration_id);
                      setShowReplacePopup(true);
                      setRegistrationId("");
                      setSearchedUser(null);
                    }}
                    className="w-full py-2 px-2 bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-[#0a120e] text-xs font-bold rounded-lg border border-[#00ff88]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="cached" className="text-sm" />
                    REPLACE MEMBER
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP */}
      {showReplacePopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#13231a] border border-[#1e3a2c] rounded-lg w-[420px] p-6 min-h-[320px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                Replace Board Member
              </h3>
              <button
                onClick={() => setShowReplacePopup(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter Registration ID (Example: SRN9814)"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              className="w-full mb-4 px-3 py-2 bg-[#0a120e] border border-[#1e3a2c] rounded-md text-white text-sm outline-none"
            />

            {searchLoading && (
              <p className="text-center text-gray-400">Searching user...</p>
            )}

            {registrationId && !searchLoading && !searchedUser && (
              <p className="text-center text-gray-400 text-sm">No user found</p>
            )}

            {searchedUser && (
              <div className="bg-[#0a120e] p-3 rounded flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">
                    {searchedUser.user_type === "individual"
                      ? searchedUser.name
                      : searchedUser.institute_name || searchedUser.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Type: {searchedUser.user_type}
                  </p>
                  {searchedUser.user_type === "institute" && (
                    <p className="text-xs text-gray-400">
                      Institute:{" "}
                      {searchedUser.institute_name || searchedUser.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Email: {searchedUser.email}
                  </p>
                </div>
                <button
                  className="bg-[#00ff88] text-black px-3 py-1 rounded text-sm font-semibold"
                  onClick={() => replaceBoardMember()}
                >
                  UPDATE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BoardMembers;