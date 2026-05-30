import React, { useState, useEffect, useRef } from "react";
import Layout from "../Admin/Layout/Layout";
import avatar from "../assets/images/avatar.jpg";
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
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
        type === "success"
          ? "bg-green-500 dark:bg-green-600"
          : "bg-red-500 dark:bg-red-600"
      }`}
    >
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

  // Store original IDs for stable keys
  const stableIds = useRef(new Map());

  // Show toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const isAlreadyBoardMember = (regId) => {
    return boardMembers.some((member) => member.registration_id === regId);
  };

  // Helper: BASE_URL ke end se slash hatao
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, "");

  // Helper: profile image URL banana
  const getProfileImageUrl = (member) => {
    const profileImage =
      member.user_type === "individual"
        ? member.individual_details?.profile_image
        : member.institute_details?.profile_image;

    if (!profileImage || profileImage.trim() === "") return null;
    return `${baseUrl}/${profileImage}`;
  };

  // =========================
  // FETCH BOARD MEMBERS
  // =========================
  useEffect(() => {
    const fetchBoardMembers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${baseUrl}/research/get-board-member`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.status) {
          result.data.forEach((member) => {
            if (!stableIds.current.has(member.registration_id)) {
              stableIds.current.set(
                member.registration_id,
                `stable-${member.registration_id}-${Date.now()}-${Math.random()}`,
              );
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
        `${baseUrl}/user/get-user-registration/${registrationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();
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
    return (name || "").toLowerCase().includes(search.toLowerCase());
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

    if (isAlreadyBoardMember(registrationId)) {
      showToast("This user is already a board member!", "error");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/research/board-member-update`, {
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
      });
      const result = await response.json();

      if (result.status) {
        showToast("Board member replaced successfully!");

        setBoardMembers((prevMembers) => {
          return prevMembers.map((member) => {
            if (member.registration_id === replaceMemberId) {
              const updatedMember = {
                ...member,
                email: searchedUser.email,
                user_type: searchedUser.user_type,
                registration_id: member.registration_id,
              };

              if (searchedUser.user_type === "individual") {
                updatedMember.name = searchedUser.name;
                updatedMember.individual_details =
                  searchedUser.individual_details || null;
                updatedMember.institute_details = null;
                delete updatedMember.institute_name;
              } else {
                updatedMember.name = searchedUser.name;
                updatedMember.institute_details =
                  searchedUser.institute_details || {
                    institute_name:
                      searchedUser.institute_name || searchedUser.name,
                    profile_image:
                      searchedUser.institute_details?.profile_image || "",
                  };
                updatedMember.institute_name =
                  searchedUser.institute_name || searchedUser.name;
                updatedMember.individual_details = null;
              }
              return updatedMember;
            }
            return member;
          });
        });

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

  // =========================
  // AVATAR COMPONENT
  // =========================
  const MemberAvatar = ({ member, displayName }) => {
    const [imgSrc, setImgSrc] = useState(getProfileImageUrl(member) || avatar);

    return (
      <img
        src={imgSrc}
        alt={displayName}
        className="w-full h-full object-cover rounded-full"
        onError={() => setImgSrc(avatar)}
      />
    );

    return (
      <MaterialIcon
        name="account_circle"
        className="text-5xl text-gray-500 dark:text-slate-400"
      />
    );
  };

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
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
            <h2 className="text-2xl font-bold tracking-tight mt-4 text-gray-900 dark:text-white">
              Board Members Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Overview and management of the current institutional advisory
              board.
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading board members...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {filteredMembers.map((member) => {
              let displayName = "";
              if (member.user_type === "individual") {
                displayName = member.name;
              } else {
                displayName =
                  member.institute_details?.institute_name ||
                  member.institute_name ||
                  member.name;
              }

              return (
                <div
                  key={
                    stableIds.current.get(member.registration_id) ||
                    member.registration_id
                  }
                  className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-lg p-4 flex flex-col items-center text-center shadow-md dark:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  {/* AVATAR */}
                  <div className="size-16 rounded-full bg-gray-100 dark:bg-[#0a120e] border-2 border-gray-200 dark:border-[#1e3a2c] flex items-center justify-center mb-3 overflow-hidden">
                    <MemberAvatar member={member} displayName={displayName} />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {displayName}
                  </h3>
                  <p className="text-xs text-[#00aa66] dark:text-[#00ff88] font-semibold mb-1">
                    {member.registration_id}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-4 break-all whitespace-normal text-center w-full">
                    {member.email}
                  </p>
                  <button
                    onClick={() => {
                      setReplaceMemberId(member.registration_id);
                      setShowReplacePopup(true);
                      setRegistrationId("");
                      setSearchedUser(null);
                    }}
                    className="
w-full py-2 px-2
bg-[#00ff88]/10
hover:bg-[#00ff88]

text-[#00aa66]
dark:text-[#00ff88]

hover:text-[#0a120e]

text-xs font-bold rounded-lg
border border-[#00ff88]/20

dark:hover:bg-[#00ff88]
dark:hover:text-[#08110d]
dark:hover:border-[#00ff88]
dark:hover:shadow-[0_0_18px_rgba(0,255,136,0.35)]

transition-all duration-200
flex items-center justify-center gap-2
"
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#13231a] border border-gray-200 dark:border-[#1e3a2c] rounded-lg w-[420px] p-6 min-h-[320px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Replace Board Member
              </h3>
              <button
                onClick={() => setShowReplacePopup(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter Registration ID (Example: SRN9814)"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              className="w-full mb-4 px-3 py-2 bg-white dark:bg-[#0a120e] border border-gray-300 dark:border-[#1e3a2c] rounded-md text-gray-900 dark:text-white text-sm outline-none focus:border-[#00ff88] focus:ring-0"
            />

            {searchLoading && (
              <p className="text-center text-gray-600 dark:text-gray-400">
                Searching user...
              </p>
            )}

            {registrationId && !searchLoading && !searchedUser && (
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                No user found
              </p>
            )}

            {searchedUser && (
              <div className="bg-gray-100 dark:bg-[#0a120e] p-3 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {searchedUser.user_type === "individual"
                      ? searchedUser.name
                      : searchedUser.institute_name || searchedUser.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Type: {searchedUser.user_type}
                  </p>
                  {searchedUser.user_type === "institute" && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Institute:{" "}
                      {searchedUser.institute_name || searchedUser.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Email: {searchedUser.email}
                  </p>
                </div>
                <button
                  className="bg-[#00ff88] hover:bg-[#00dd77] text-black px-3 py-1 rounded text-sm font-semibold transition-all"
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
