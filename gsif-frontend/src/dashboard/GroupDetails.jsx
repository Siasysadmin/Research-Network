import React, { useState, useEffect } from "react";
import API_CONFIG from "../config/api.config";
import { toast } from "react-toastify";
import defaultAvatar from "../assets/images/avatar.jpg";

const MaterialIcon = ({ name, className = "", style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
);

const GroupDetails = ({ group, onClose }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState(group?.name || "");
  const [groupImage, setGroupImage] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(group?.avatars?.[0] || null);
  const [saving, setSaving] = useState(false);

  // Add Member modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [addSearch, setAddSearch] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

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

  const getCurrentUserName = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.name || "You";
      }
      return "You";
    } catch (e) {
      return "You";
    }
  };

  const currentUserId = getCurrentUserId();
  const currentUserName = getCurrentUserName();

  // ✅ Fetch group members — GET /group/get-group-members/:groupId
  useEffect(() => {
    if (!group?.groupId) return;
    fetchMembers();
  }, [group?.groupId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/get-group-members/${group.groupId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (result.status && result.members) {
        const formatted = result.members
          .filter((m) => String(m.id) !== String(currentUserId))
          .map((m) => ({
            id: String(m.id),
            name: m.name || "Unknown",
            role: m.user_type === "institute" ? "Institute" : "Individual",
            registerId: m.registration_id || "",
            isAdmin: m.is_admin === 1,
          avatar: m.profile_image
  ? `${API_CONFIG.BASE_URL}/${m.profile_image}`
  : defaultAvatar,  
  }));
        setMembers(formatted);
      }
    } catch (error) {
      toast.error("Could not load members");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Make Admin — POST /make-admin-group/:groupId  body: user_ids[]
  const makeAdmin = async (memberId) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("user_ids[]", memberId);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/make-admin-group/${group.groupId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
      );
      const result = await response.json();
      if (result.status) {
        setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, isAdmin: true } : m));
        toast.success("Admin privileges granted");
      } else {
        toast.error(result.message || "Failed to make admin");
      }
    } catch {
      toast.error("An error occurred");
    }
    setActiveMenu(null);
  };

  // ✅ Remove Admin — POST /remove-group-admin/:groupId  body: user_ids
  const removeAdmin = async (memberId) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("user_ids", memberId);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/remove-group-admin/${group.groupId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
      );
      const result = await response.json();
      if (result.status) {
        setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, isAdmin: false } : m));
        toast.success("Admin removed");
      } else {
        toast.error(result.message || "Failed to remove admin");
      }
    } catch {
      toast.error("An error occurred");
    }
    setActiveMenu(null);
  };

  // ✅ Remove Member — POST /remove-group-members/:groupId  body: user_ids[]
  const removeMember = async (memberId) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("user_ids[]", memberId);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/remove-group-members/${group.groupId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
      );
      const result = await response.json();
      if (result.status) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        toast.success("Member removed");
      } else {
        toast.error(result.message || "Failed to remove member");
      }
    } catch {
      toast.error("An error occurred");
    }
    setActiveMenu(null);
  };

  // ✅ Update Group — POST /update-group-name-profile/:groupId  body: group_name, group_image
  const handleSave = async () => {
    if (!groupName.trim()) { toast.error("Group name cannot be empty"); return; }
    setSaving(true);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("group_name", groupName);
      if (groupImage) formData.append("group_image", groupImage);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/update-group-name-profile/${group.groupId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
      );
      const result = await response.json();
      if (result.status) {
        toast.success("Group updated successfully");
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setGroupImage(file); setGroupImagePreview(URL.createObjectURL(file)); }
  };

  // ✅ Open Add Modal — fetch users not already in group
  const openAddModal = async () => {
    setShowAddModal(true);
    setSelectedToAdd([]);
    setAddSearch("");
    if (allUsers.length > 0) return;
    setUsersLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/get-all-users`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const userList = data.data || data.users || (Array.isArray(data) ? data : []);
      const existingIds = new Set([String(currentUserId), ...members.map((m) => m.id)]);
      const formatted = userList
        .filter((u) => !existingIds.has(String(u.id || u.user_id)))
        .map((u) => {
          const name = u.user_type === "institute"
            ? u.institute_details?.institute_name || u.name || "Unknown"
            : u.name || "Unknown";

             const profileImage = u.user_type === "institute"
      ? u.profile_institute_details?.profile_image
      : u.profile_individual_details?.profile_image;


          return {
            id: String(u.id || u.user_id),
            name,
            role: u.user_type === "institute" ? "Institute" : "Individual",
            registerId: u.registration_id || "",
          avatar: profileImage
    ? `${API_CONFIG.BASE_URL}/${profileImage}`
    : defaultAvatar,  // ✅ defaultAvatar use karo ui-avatars ki jagah
};
        });
      setAllUsers(formatted);
    } catch {
      toast.error("Could not load users");
    } finally {
      setUsersLoading(false);
    }
  };


  const getCurrentUserAvatar = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const img = user.profile_image || user.profile_individual_details?.profile_image || user.profile_institute_details?.profile_image;
      return img ? `${API_CONFIG.BASE_URL}/${img}` : null;
    }
    return null;
  } catch (e) { return null; }
};

const currentUserAvatar = getCurrentUserAvatar();

  // ✅ Add Members — POST /add-group-members/:groupId  body: user_ids[]
  const handleAddMembers = async () => {
    if (selectedToAdd.length === 0) { toast.error("Select at least one member"); return; }
    setAddingMembers(true);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      selectedToAdd.forEach((id) => formData.append("user_ids[]", id));
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/group/add-group-members/${group.groupId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
      );
      const result = await response.json();
      if (result.status) {
        toast.success("Members added successfully");
        setShowAddModal(false);
        setAllUsers([]);
        fetchMembers();
      } else {
        toast.error(result.message || "Failed to add members");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setAddingMembers(false);
    }
  };

  const toggleMenu = (id) => setActiveMenu(activeMenu === id ? null : id);

  useEffect(() => {
    const handler = () => setActiveMenu(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredAddUsers = addSearch.trim()
    ? allUsers.filter((u) => u.name.toLowerCase().includes(addSearch.toLowerCase()))
    : allUsers;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden font-inter relative">

      {/* ── Header ── */}
      <div className="h-14 lg:h-16 border-b border-[#3b4b3d]/30 px-4 lg:px-6 flex items-center justify-between shrink-0 bg-[#0d0f0e]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-[#e2e3e0] transition-all">
            <MaterialIcon name="arrow_back" className="text-[22px]" />
          </button>
          <div>
            <h3 className="text-base lg:text-lg font-extrabold text-white leading-none">
              Group Details
             
            </h3>
            
          </div>
        </div>

        {group?.isAdmin && (
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#00FF85] text-[#003919] rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-60">
            {saving
              ? <div className="w-4 h-4 border-2 border-[#003919] border-t-transparent rounded-full animate-spin" />
              : <MaterialIcon name="save" className="text-[16px]" />}
            Save
          </button>
        )}
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#121413]/30 p-5 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Group Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover border-4 border-[#1a1c1b] shadow-[0_0_30px_rgba(0,255,133,0.2)]"
                src={groupImagePreview || defaultAvatar}
                alt={group?.name}
                onError={(e) => { e.target.src = defaultAvatar; }}
              />
              {/* Only admin can change photo */}
              {group?.isAdmin && (
                <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#00FF85] text-[#003919] rounded-full flex items-center justify-center border-4 border-[#121413] cursor-pointer hover:brightness-110 transition-all">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <MaterialIcon name="photo_camera" className="text-[16px]" />
                </label>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase mt-3 tracking-widest">Group Profile</p>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-[9px] lg:text-[10px] font-mono text-[#00FF85] uppercase tracking-widest pl-1">Group Name</label>
            {group?.isAdmin ? (
              <div className="relative">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-[#121413]/80 border border-[#3b4b3d]/50 rounded-xl px-4 py-3 text-base font-bold text-white focus:outline-none focus:border-[#00FF85]/50 transition-all"
                  style={{ boxShadow: "none" }}
                />
                <MaterialIcon name="edit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]" />
              </div>
            ) : (
              <div className="bg-[#121413]/80 border border-[#3b4b3d]/30 rounded-xl px-4 py-3 text-base font-bold text-white">
                {groupName}
              </div>
            )}
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00FF85] rounded-full"></span>
                Members ({members.length + 1})
              </h4>
              {group?.isAdmin && (
                <button onClick={openAddModal} className="flex items-center gap-1.5 text-[#00FF85] hover:text-white transition-colors">
                  <MaterialIcon name="person_add" className="text-[16px]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Add Member</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {/* YOU card */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#00FF85]/20 bg-[#00FF85]/5">
                <div className="flex items-center gap-3">
                  <img
                    className="w-10 h-10 rounded-full object-cover border border-[#00FF85]/50"
src={currentUserAvatar || defaultAvatar}
onError={(e) => { e.target.src = defaultAvatar; }}                    alt="You"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#00FF85]">{currentUserName} (YOU)</p>
                      <span className="text-[9px] bg-[#00FF85] text-[#003919] px-1.5 py-0.5 rounded font-black uppercase">
                        {group?.isAdmin ? "ADMIN" : "MEMBER"}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#00FF85]/50 mt-0.5">
                      {group?.isAdmin ? "Group Owner" : "Member"}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00FF85]"></div>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-xs uppercase opacity-50">No other members</div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#3b4b3d]/20 bg-[#121413]/40 group hover:border-[#3b4b3d]/40 transition-all relative">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover border border-[#3b4b3d]/40 group-hover:border-[#00FF85]/40 transition-colors"
                        src={member.avatar}
                        alt={member.name}
                        onError={(e) => { e.target.src = defaultAvatar; }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{member.name}</p>
                          {member.isAdmin && (
                            <span className="text-[9px] bg-[#00FF85] text-[#003919] px-1.5 py-0.5 rounded font-black uppercase">ADMIN</span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {member.role} · {member.registerId}
                        </p>
                      </div>
                    </div>

                    {group?.isAdmin && (
                      <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleMenu(member.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                          <MaterialIcon name="more_vert" className="text-[18px]" />
                        </button>

                        {activeMenu === member.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1c1b] border border-[#3b4b3d]/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                            {member.isAdmin ? (
                              <button onClick={() => removeAdmin(member.id)}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-400/10 flex items-center gap-2 border-b border-[#3b4b3d]/20">
                                <MaterialIcon name="shield_person" className="text-[15px]" /> REMOVE ADMIN
                              </button>
                            ) : (
                              <button onClick={() => makeAdmin(member.id)}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#00FF85] hover:bg-[#00FF85]/10 flex items-center gap-2 border-b border-[#3b4b3d]/20">
                                <MaterialIcon name="shield_person" className="text-[15px]" /> MAKE ADMIN
                              </button>
                            )}
                            <button onClick={() => removeMember(member.id)}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#ffb4ab] hover:bg-[#93000a]/20 flex items-center gap-2">
                              <MaterialIcon name="person_remove" className="text-[15px]" /> REMOVE
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Member Modal ── */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md mx-4 bg-[#1a1c1b] border border-[#3b4b3d]/50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#3b4b3d]/30">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Add Members</h4>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400">
                <MaterialIcon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center bg-[#121413] border border-[#3b4b3d]/40 rounded-full px-4 py-2 gap-2">
                <MaterialIcon name="search" className="text-slate-500 text-[18px] shrink-0" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  style={{ border: "none", boxShadow: "none" }}
                />
              </div>
            </div>

            {/* User List */}
            <div className="max-h-64 overflow-y-auto hide-scrollbar px-3 pb-2">
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00FF85]"></div>
                </div>
              ) : filteredAddUsers.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-xs uppercase">No users found</div>
              ) : (
                filteredAddUsers.map((user) => {
                  const isSelected = selectedToAdd.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedToAdd((prev) =>
                        isSelected ? prev.filter((id) => id !== user.id) : [...prev, user.id]
                      )}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1 ${
                        isSelected ? "bg-[#00FF85]/10 border border-[#00FF85]/30" : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <img className="w-9 h-9 rounded-full object-cover" src={user.avatar} alt={user.name}
                        onError={(e) => { e.target.src = defaultAvatar; }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isSelected ? "text-[#00FF85]" : "text-white"}`}>{user.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">{user.role} . {user.registerId}</p>
                      </div>
                      {isSelected && <MaterialIcon name="check_circle" className="text-[#00FF85] text-[20px] shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#3b4b3d]/30 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">{selectedToAdd.length} selected</span>
              <button onClick={handleAddMembers} disabled={addingMembers || selectedToAdd.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-[#00FF85] text-[#003919] rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                {addingMembers
                  ? <div className="w-4 h-4 border-2 border-[#003919] border-t-transparent rounded-full animate-spin" />
                  : <MaterialIcon name="person_add" className="text-[15px]" />}
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default GroupDetails;