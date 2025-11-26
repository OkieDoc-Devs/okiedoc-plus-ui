/**
 * API Service Module
 * Handles all API communication for the Nurse module
 */

import { resetSocketAuth } from "./chatService.js";

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://your-production-url.com"
    : "http://localhost:1337";

/**
 * Fetch tickets from API
 * @returns {Promise<Array>} Array of tickets
 * @throws {Error} If API request fails
 */
export async function fetchTicketsFromAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nurse/tickets`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

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
    const response = await fetch(`${API_BASE_URL}/api/nurse/notifications`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return data.data || [];
    } else {
      throw new Error(data.message || "Failed to load notifications");
    }
  } catch (error) {
    console.error("Error fetching notifications from API:", error);
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
    const response = await fetch(`${API_BASE_URL}/api/nurse/dashboard`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

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
    const response = await fetch(
      `${API_BASE_URL}/api/nurse/notifications/${notificationId}/read`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
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
    const response = await fetch(`${API_BASE_URL}/api/nurse/profile`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API response for nurse profile:", data);

    if (data.success) {
      console.log("Profile data from API:", data.data);
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
    const response = await fetch(`${API_BASE_URL}/api/nurse/profile`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

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
 * Create a new ticket via API
 * @param {Object} ticketData - Ticket data to create
 * @returns {Promise<Object>} Created ticket data
 * @throws {Error} If API request fails
 */
export async function createTicket(ticketData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nurse/tickets`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

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
 * Update ticket via API
 * @param {string} ticketId - Ticket ID
 * @param {Object} updates - Updates to apply to ticket
 * @returns {Promise<Object>} Updated ticket data
 * @throws {Error} If API request fails
 */
export async function updateTicket(ticketId, updates) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/nurse/tickets/${ticketId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

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
    // Reset socket authentication state
    resetSocketAuth();

    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Clear localStorage
      localStorage.removeItem("currentUser");
      localStorage.removeItem("nurse.id");
      localStorage.removeItem("nurse.email");
      localStorage.removeItem("nurse.firstName");
      localStorage.removeItem("nurse.lastName");

      console.log("Logout successful:", data.message);
      return data;
    } else {
      console.warn("Logout response:", data);
      // Still clear local storage even if API fails
      localStorage.removeItem("currentUser");
      return data;
    }
  } catch (error) {
    console.error("Error during logout:", error);
    // Still clear local storage even if API fails
    localStorage.removeItem("currentUser");
    throw error;
  }
}
