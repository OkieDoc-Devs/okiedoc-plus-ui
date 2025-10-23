/**
 * API Service Module
 * Handles all API communication for the Nurse module
 */

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

    if (data.success) {
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
