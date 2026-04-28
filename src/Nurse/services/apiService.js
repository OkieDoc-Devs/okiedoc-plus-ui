import { resetSocketAuth } from "./chatService.js";
import { apiRequest } from "../../api/apiClient";

/**
 * Fetch tickets from API
 * @returns {Promise<Array>} Array of tickets
 * @throws {Error} If API request fails
 */
export async function fetchTicketsFromAPI() {
  try {
    const data = await apiRequest("/api/v1/nurse/tickets");

    if (data.success) {
      return data.data || [];
    } else {
      throw new Error(data.message || "Failed to load tickets");
    }
  } catch (error) {
    console.error("Error fetching tickets from API:", error);
    throw error;
  }
}

/**
 * Fetch notifications from API
 * @returns {Promise<Array>} Array of notifications
 * @throws {Error} If API request fails
 */
export async function fetchNotificationsFromAPI() {
  try {
    const data = await apiRequest('/api/v1/notifications');
    const notifications = (data.notifications || []).map(n => ({
      ...n,
      unread: !n.isRead, // Map backend isRead to frontend-expected unread state
    }));

    if (data.notifications !== undefined) {
      return notifications;
    } else if (data.success) {
      return data.data || [];
    } else {
      throw new Error(data.message || 'Failed to load notifications');
    }
  } catch (error) {
    console.error('Error fetching notifications from API:', error);
    throw error;
  }
}

/**
 * Fetch dashboard data from API (includes tickets, notifications, and stats)
 * @returns {Promise<Object>} Dashboard data object
 * @throws {Error} If API request fails
 */
export async function fetchDashboardFromAPI() {
  try {
    const data = await apiRequest("/api/v1/nurse/dashboard");

    if (data.success) {
      return data.data || {};
    } else {
      throw new Error(data.message || "Failed to load dashboard data");
    }
  } catch (error) {
    console.error("Error fetching dashboard from API:", error);
    throw error;
  }
}

/**
 * Mark notification as read in API
 * @param {string|number} notificationId - Notification ID
 * @returns {Promise<boolean>} Success status
 */
export async function markNotificationAsRead(notificationId) {
  try {
    await apiRequest(`/api/v1/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Fetch nurse profile from API
 * @returns {Promise<Object>} Nurse profile data
 * @throws {Error} If API request fails
 */
export async function fetchNurseProfile() {
  try {
    const data = await apiRequest("/api/v1/nurse/profile");
    // console.log("Raw API response for nurse profile:", data);

    if (data.success) {
      // console.log("Profile data from API:", data.data);
      return data.data;
    } else {
      throw new Error(data.message || "Failed to load profile");
    }
  } catch (error) {
    console.error("Error fetching nurse profile:", error);
    throw error;
  }
}

/**
 * Update nurse profile via API
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 * @throws {Error} If API request fails
 */
export async function updateNurseProfile(profileData) {
  try {
    const data = await apiRequest("/api/v1/nurse/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || "Failed to update profile");
    }
  } catch (error) {
    console.error("Error updating nurse profile:", error);
    throw error;
  }
}

/**
 * Upload nurse avatar image via API
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Upload response with avatar URL
 * @throws {Error} If API request fails or file exceeds size limit
 */
export async function uploadNurseAvatar(file) {
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(
      "File size exceeds 2MB limit. Please choose a smaller image."
    );
  }

  try {
    const formData = new FormData();
    formData.append("photo", file);

    const data = await apiRequest("/api/v1/user/upload-profile-picture", {
      method: "POST",
      body: formData,
    });

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || "Failed to upload avatar");
    }
  } catch (error) {
    console.error("Error uploading nurse avatar:", error);
    throw error;
  }
}

/**
 * Delete nurse avatar image via API
 * @returns {Promise<boolean>} Success status
 * @throws {Error} If API request fails
 */
export async function deleteNurseAvatar() {
  try {
    const data = await apiRequest("/api/v1/nurse/avatar", {
      method: "DELETE",
    });

    if (data.success) {
      return true;
    } else {
      throw new Error(data.message || "Failed to delete avatar");
    }
  } catch (error) {
    console.error("Error deleting nurse avatar:", error);
    throw error;
  }
}

/**
 * Fetch doctors/specialists from API
 * @returns {Promise<Array>} Array of doctors
 * @throws {Error} If API request fails
 */
export async function fetchDoctorsFromAPI() {
  try {
    const data = await apiRequest("/api/v1/nurse/doctors");

    if (data.success) {
      return data.data || [];
    } else {
      throw new Error(data.message || "Failed to load doctors");
    }
  } catch (error) {
    console.error("Error fetching doctors from API:", error);
    throw error;
  }
}

/**
 * Fetch nurse users from API
 * @returns {Promise<Array>} Array of nurse users
 * @throws {Error} If API request fails
 */
export async function fetchNursesFromAPI() {
  try {
    const data = await apiRequest('/api/v1/chat/users');
    const users = Array.isArray(data)
      ? data
      : Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
          ? data.data
          : [];

    return users.filter((user) => String(user?.role || '').toLowerCase() === 'nurse');
  } catch (error) {
    console.error('Error fetching nurses from API:', error);
    throw error;
  }
}

export async function searchPatientsFromAPI(search = "") {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const data = await apiRequest(`/api/v1/nurse/patients${query}`);

    if (data.success) {
      return data.data || [];
    }

    throw new Error(data.message || "Failed to search patients");
  } catch (error) {
    console.error("Error searching patients from API:", error);
    throw error;
  }
}

/**
 * Create a new ticket via API
 * @param {Object} ticketData - Ticket data to create
 * @returns {Promise<Object>} Created ticket data
 * @throws {Error} If API request fails
 */
export async function createTicket(ticketData) {
  try {
    const data = await apiRequest("/api/v1/tickets/create", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || "Failed to create ticket");
    }
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
}

/**
 * Claim a ticket via API
 * @param {number|string} ticketId - Ticket ID
 * @returns {Promise<Object>} Claim response
 */
export async function claimTicket(ticketId) {
  try {
    return await apiRequest("/api/v1/tickets/claim", {
      method: "PATCH",
      body: JSON.stringify({ ticketId: parseInt(ticketId, 10) }),
    });
  } catch (error) {
    console.error("Error claiming ticket:", error);
    throw error;
  }
}

/**
 * Triage a ticket via API
 * @param {Object} triageData - Triage data (ticketId, targetSpecialty, specialistId, urgency)
 * @returns {Promise<Object>} Triage response
 */
export async function triageTicket(triageData) {
  try {
    return await apiRequest("/api/v1/nurse/triage-ticket", {
      method: "PATCH",
      body: JSON.stringify(triageData),
    });
  } catch (error) {
    console.error("Error triaging ticket:", error);
    throw error;
  }
}

/**
 * Assign a specialist to a ticket via API
 * @param {number} ticketId - Ticket ID
 * @param {number} specialistId - Specialist user ID
 * @returns {Promise<Object>} Assignment response
 */
export async function assignSpecialist(ticketId, specialistId, details = {}) {
  try {
    return await apiRequest("/api/v1/tickets/assign-specialist", {
      method: "PATCH",
      body: JSON.stringify({
        ticketId: parseInt(ticketId, 10),
        specialistId: parseInt(specialistId, 10),
        ...details,
      }),
    });
  } catch (error) {
    console.error("Error assigning specialist:", error);
    throw error;
  }
}

/**
 * Update ticket via API
 * @param {string} ticketId - Ticket ID
 * @param {Object} updates - Updates to apply to ticket
 * @returns {Promise<Object>} Updated ticket data
 * @throws {Error} If API request fails
 */
export async function updateTicket(ticketId, updates) {
  try {
    const data = await apiRequest(`/api/v1/nurse/tickets/${ticketId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || "Failed to update ticket");
    }
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw error;
  }
}

/**
 * Logout user from API
 * Clears session on backend and resets socket auth
 * @returns {Promise<Object>} Logout response
 */
export async function logoutFromAPI() {
  try {
    resetSocketAuth();

    const data = await apiRequest("/api/v1/auth/logout", {
      method: "POST",
    });

    if (data.success) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("okiedoc_user_type");
      localStorage.removeItem("nurse.id");
      localStorage.removeItem("nurse.email");
      localStorage.removeItem("nurse.firstName");
      localStorage.removeItem("nurse.lastName");

      // console.log("Logout successful:", data.message);
      return data;
    } else {
      console.warn("Logout response:", data);
      localStorage.removeItem("currentUser");
      return data;
    }
  } catch (error) {
    console.error("Error during logout:", error);
    localStorage.removeItem("currentUser");
    throw error;
  }
}

