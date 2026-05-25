import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import { useNavigate, useParams } from "react-router-dom";
import API_CONFIG from "../../config/api.config";
import { toast } from "react-toastify";
import defaultAvatar from "../../assets/images/avatar.jpg";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

const CreateGroup = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [activeNav, setActiveNav] = useState("chats");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [groupImage, setGroupImage] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const getAuthToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return String(user.id || user.user_id || user.userId || "");
      }
      return "";
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const currentUserId = getCurrentUserId();
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/user/get-all-users`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        const userList =
          data.data || data.users || (Array.isArray(data) ? data : []);

        if (response.ok && userList) {
          const formatted = userList
            .map((user) => {
              const name =
                user.user_type === "institute"
                  ? user.institute_details?.institute_name ||
                    user.name ||
                    "Unknown Institute"
                  : user.name || "Unknown Individual";
              return {
                id: String(user.id || user.user_id || Math.random()),
                name,
                registerId: user.registration_id || user.id || "N/A",
                avatar: (() => {
                  const profileImg =
                    user.user_type === "institute"
                      ? user.profile_institute_details?.profile_image
                      : user.profile_individual_details?.profile_image;
                  return profileImg
                    ? `${API_CONFIG.BASE_URL}/${profileImg}`
                    : defaultAvatar;
                })(),
              };
            })
            .filter((u) => u.id !== currentUserId);

          setAllUsers(formatted);
          setFilteredUsers(formatted);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (groupId) {
      setIsEditMode(true);
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/get-group-details/${groupId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.status) {
        setGroupName(result.data.group_name || "");
        if (result.data.profile) {
          setGroupImagePreview(result.data.profile);
        }
        if (result.data.members) {
          setMembers(result.data.members);
        }
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(
        allUsers.filter((u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [searchQuery, allUsers]);

  const toggleMember = (user) => {
    const isAlreadyAdded = members.find((m) => m.id === user.id);
    if (isAlreadyAdded) {
      setMembers((prev) => prev.filter((m) => m.id !== user.id));
    } else {
      setMembers((prev) => [...prev, user]);
    }
  };

  const removeMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
      setGroupImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (members.length < 1) {
      toast.error("Add at least one member");
      return;
    }

    setCreating(true);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("group_name", groupName);
      formData.append("description", groupDescription);
      members.forEach((m) => formData.append("members[]", m.id));
      if (groupImage) formData.append("group_image", groupImage);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/create-group`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (result.status === true) {
        toast.success(result.message || "Group created successfully!");

        // ✅ SIRF YAHAN CHANGE HAI — naya group data pass karo
        navigate("/admin/chat", {
          state: {
            newGroup: {
              id: `group_${result.group_id || result.data?.group_id || Date.now()}`,
              groupId: String(result.group_id || result.data?.group_id || ""),
              name: groupName,
              isYou: false,
              type: `Group · ${members.length + 1} member${members.length + 1 !== 1 ? "s" : ""}`,
              lastMsg: "Group created",
              isActive: false,
              isGroup: true,
              isAdmin: true,
              timestamp: Date.now(),
              unreadCount: 0,
              avatars: [groupImagePreview || defaultAvatar],
              messages: [],
              messagesLoaded: false,
            },
          },
        });
      } else {
        toast.error(result.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("An error occurred while creating the group");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    setCreating(true);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("group_name", groupName);
      if (groupImage) {
        formData.append("group_image", groupImage);
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/update-group-name-profile/${groupId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const result = await response.json();
      if (result.status) {
        toast.success("Group updated successfully!");
        navigate("/admin/chat");
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/chat");
  };

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
      <style>{`
        .cyber-glow { box-shadow: 0 0 20px rgba(0, 255, 133, 0.15); }
        .cyber-glow-strong { box-shadow: 0 0 30px rgba(0, 255, 133, 0.4); }
        .glass-panel {
          background: linear-gradient(145deg, rgba(13, 15, 14, 0.9) 0%, rgba(18, 20, 19, 0.95) 100%);
          backdrop-filter: blur(12px);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b4b3d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00FF85; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #3b4b3d transparent; }
        .no-ring input, .no-ring textarea, .cg-input {
          outline: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
        }
        .cg-input:focus { outline: none !important; box-shadow: none !important; }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.15s ease-out; }
      `}</style>

      <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden w-full font-inter bg-[#0d0f0e] p-4 lg:p-6 box-border">
        {/* Header */}
        <div className="mb-3 glass-panel rounded-2xl h-14 lg:h-16 px-4 lg:px-8 flex items-center border border-[#3b4b3d]/30 shrink-0 max-w-[1200px] mx-auto w-full">
          <button
            onClick={handleBack}
            className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-[#e2e3e0] transition-all mr-4 lg:mr-6"
          >
            <MaterialIcon name="arrow_back" className="text-[24px] lg:text-[28px]" />
          </button>
          <div className="flex flex-col">
            <h3 className="text-lg lg:text-xl font-extrabold text-white leading-none tracking-tight">
              {isEditMode ? "Edit Group" : "Create New Group"}
            </h3>
            <p className="text-[9px] lg:text-[10px] font-mono text-[#94a3b8] uppercase tracking-widest mt-1.5">
              {isEditMode
                ? "Update group information"
                : "Initiate encrypted communication hub"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col border border-[#3b4b3d]/30 bg-[#0d0f0e]/50 max-w-[1200px] mx-auto w-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <div className="max-w-2xl mx-auto space-y-8 lg:space-y-10">
              {/* Image Upload */}
              <div className="flex flex-col items-center">
                <label className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full border-2 border-dashed border-[#00FF85]/30 bg-[#121413]/40 flex flex-col items-center justify-center transition-all group-hover:border-[#00FF85] group-hover:bg-[#00FF85]/5 overflow-hidden">
                    {groupImagePreview ? (
                      <img
                        src={groupImagePreview}
                        alt="Group"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <>
                        <MaterialIcon
                          name="upload_file"
                          className="text-[32px] lg:text-[40px] text-[#00FF85]/40 group-hover:text-[#00FF85] mb-1"
                        />
                        <span className="text-[9px] lg:text-[10px] font-bold text-[#00FF85]/60 uppercase tracking-tighter">
                          Upload
                        </span>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-8 h-8 lg:w-9 lg:h-9 bg-[#00FF85] text-[#0d0f0e] rounded-full flex items-center justify-center border-4 border-[#0d0f0e] cyber-glow">
                    <MaterialIcon
                      name={isEditMode ? "edit" : "add_a_photo"}
                      className="text-xs lg:text-sm font-bold"
                    />
                  </div>
                </label>
                <p className="text-[9px] lg:text-[10px] font-mono text-[#94a3b8] uppercase mt-4">
                  Group Identification Image
                </p>
              </div>

              {/* Inputs */}
              <div className="space-y-5 lg:space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] lg:text-[10px] font-mono text-[#00FF85] uppercase tracking-widest pl-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="cg-input w-full bg-[#121413]/80 border border-[#3b4b3d]/50 rounded-xl px-4 py-3 lg:px-5 lg:py-3.5 text-sm text-white transition-all placeholder:text-[#94a3b8]/30 font-inter"
                    placeholder="e.g. Research_Division_X"
                  />
                </div>
              </div>

              {/* Member Selection - Only in create mode */}
              {!isEditMode && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] lg:text-[10px] font-mono text-[#00FF85] uppercase tracking-widest pl-1">
                      Add Members
                    </label>
                    <span className="text-[9px] lg:text-[10px] font-mono text-[#94a3b8]/60 uppercase">
                      {members.length} selected
                    </span>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-3 p-2 bg-[#121413]/50 border border-[#3b4b3d]/30 rounded-xl min-h-[44px]">
                      <div className="flex flex-wrap gap-2 flex-1">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-[#00FF85]/10 border border-[#00FF85]/30 rounded-full pl-1.5 pr-1.5 py-1 transition-all hover:border-[#00FF85]"
                          >
                            <img
                              className="w-5 h-5 rounded-full object-cover"
                              src={member.avatar}
                              alt={member.name}
                              onError={(e) => {
                                e.target.src = defaultAvatar;
                              }}
                            />
                            <span className="text-xs font-bold text-[#00FF85]">
                              {member.name}
                            </span>
                            <button
                              onClick={() => removeMember(member.id)}
                              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[#00FF85]/20 text-[#00FF85]"
                            >
                              <MaterialIcon name="close" className="text-[14px]" />
                            </button>
                          </div>
                        ))}

                        {members.length === 0 && (
                          <div className="text-xs text-slate-500 py-1 px-2 italic font-mono">
                            No members selected
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#00FF85]/10 border border-[#00FF85]/30 text-[#00FF85] hover:bg-[#00FF85] hover:text-[#0d0f0e] transition-all"
                        onClick={() =>
                          setSearchQuery(searchQuery === "" ? " " : "")
                        }
                      >
                        <MaterialIcon name="add" className="text-[20px] font-bold" />
                      </button>
                    </div>

                    {searchQuery !== "" && filteredUsers.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-[#121413] border border-[#3b4b3d]/50 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-fadeInDown">
                        {filteredUsers.map((user) => {
                          const isSelected = members.find((m) => m.id === user.id);
                          return (
                            <div
                              key={user.id}
                              onClick={() => toggleMember(user)}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#3b4b3d]/10 last:border-0 transition-all ${
                                isSelected ? "bg-[#00FF85]/15" : "hover:bg-[#00FF85]/10"
                              }`}
                            >
                              <img
                                src={user.avatar}
                                className={`w-10 h-10 rounded-full object-cover border ${
                                  isSelected ? "border-[#00FF85]" : "border-[#00FF85]/20"
                                }`}
                                  alt={user.name}
                                onError={(e) => { e.target.src = defaultAvatar; }}
                              />
                              <div className="flex flex-col flex-1">
                                <span className={`text-sm font-bold ${isSelected ? "text-[#00FF85]" : "text-white"}`}>
                                  {user.name}
                                </span>
                                <span className="text-[10px] font-mono text-[#94a3b8] mt-0.5">
                                  REG_ID: {user.registerId || user.id}
                                </span>
                              </div>
                              <div className="ml-auto">
                                {isSelected ? (
                                  <MaterialIcon name="check_circle" className="text-[#00FF85]" />
                                ) : (
                                  <MaterialIcon name="add_circle" className="text-[#00FF85]/30" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Button */}
          <div className="p-4 lg:p-6 border-t border-[#3b4b3d]/30 bg-[#0d0f0e] backdrop-blur-md flex justify-center shrink-0">
            <button
              onClick={isEditMode ? handleUpdateGroup : handleCreateGroup}
              disabled={creating}
              className="w-full max-w-sm h-12 lg:h-14 bg-[#00FF85] text-[#0d0f0e] rounded-xl font-black text-xs lg:text-sm uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all cyber-glow-strong flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0d0f0e]" />
              ) : (
                <>
                  <MaterialIcon
                    name={isEditMode ? "save" : "hub"}
                    className="text-[18px] lg:text-[20px]"
                  />
                  {isEditMode ? "Update Group" : "Establish Group"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        html, body { overflow: hidden; height: 100%; margin: 0; }
        .flex-1 { min-height: 0; }
      `}</style>
    </Layout>
  );
};

export default CreateGroup;