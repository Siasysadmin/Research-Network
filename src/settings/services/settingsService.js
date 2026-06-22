import API_CONFIG from "../../config/api.config";

/**
 * Centralised data layer for the Settings page.
 *
 * IMPORTANT: every endpoint, HTTP method and payload below is preserved
 * exactly as it existed in the original monolithic settings component so
 * that backend behaviour and authentication are completely unchanged.
 *   - GET    /account/get-blocked-users
 *   - POST   /account/block-unblock-user   { user_id: String }
 *   - POST   /account/change-password      { old_password, new_password, confirm_password }
 *   - POST   /auth/logout
 *   - DELETE /account/delete-account
 */

export const getAuthToken = () => localStorage.getItem("token") || "";

/** Reads the logged-in user object from localStorage (stored as array or object). */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed[0] || {};
    return parsed || {};
  } catch {
    return {};
  }
};

const authHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/** Preserve theme across a full storage wipe, exactly like the original. */
export const clearAuthData = () => {
  try {
    const currentTheme = localStorage.getItem("theme") || "light";
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("theme", currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (currentTheme === "dark") {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  } catch (err) {
    console.error("Error clearing storage:", err);
  }
};

export const fetchBlockedUsers = async () => {
  const res = await fetch(`${API_CONFIG.BASE_URL}/account/get-blocked-users`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
};

export const blockUnblockUser = async (userId) => {
  const res = await fetch(`${API_CONFIG.BASE_URL}/account/block-unblock-user`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_id: String(userId) }),
  });
  return res.json();
};

export const changePassword = async ({
  old_password,
  new_password,
  confirm_password,
}) => {
  const res = await fetch(`${API_CONFIG.BASE_URL}/account/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ old_password, new_password, confirm_password }),
  });
  return res.json();
};

export const logout = async () => {
  const res = await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
};

export const deleteAccount = async () => {
  const res = await fetch(`${API_CONFIG.BASE_URL}/account/delete-account`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};

/** Image + display helpers for blocked users (ported from the original). */
export const getBlockedUserDisplay = (user) => {
  if (user.user_type === "institute") {
    return (
      user.institute_details?.institute_name ||
      user.profile_institute_details?.institute_name ||
      user.name
    );
  }
  return user.name || "User";
};

export const getBlockedUserImage = (user) => {
  if (user.user_type === "institute") {
    if (user.institute_details?.logo_image)
      return `${API_CONFIG.BASE_URL}/${user.institute_details.logo_image}`;
    if (user.profile_institute_details?.profile_image)
      return `${API_CONFIG.BASE_URL}/${user.profile_institute_details.profile_image}`;
    if (user.institute_details?.profile_image)
      return `${API_CONFIG.BASE_URL}/${user.institute_details.profile_image}`;
  }
  if (user.profile_indivisual_details?.profile_image)
    return `${API_CONFIG.BASE_URL}/${user.profile_indivisual_details.profile_image}`;
  if (user.profile_individual_details?.profile_image)
    return `${API_CONFIG.BASE_URL}/${user.profile_individual_details.profile_image}`;
  return null;
};

export const getUserInitials = (user) => {
  const displayName = getBlockedUserDisplay(user);
  if (!displayName) return "?";
  if (user.user_type === "institute") {
    const words = displayName.split(" ").filter((w) => w.length > 0);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return displayName.substring(0, 2).toUpperCase();
  }
  return displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getSecondaryInfo = (user) => {
  const info = [];
  if (user.registration_id) info.push(user.registration_id);
  if (user.user_type === "institute") info.push("Institute");
  else if (user.user_type === "individual") info.push("Individual");
  else if (user.user_type)
    info.push(user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1));
  return info.join(" · ");
};
