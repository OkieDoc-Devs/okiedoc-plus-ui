/**
 * Specialist API Service Module
 * Handles all API communication for the Specialist module
 */

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://your-production-url.com"
    : "http://localhost:1337";

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response data
 */
async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

// ==========================================
// Authentication
// ==========================================

/**
 * Login specialist
 * @param {string} email - Specialist email
 * @param {string} password - Specialist password
 * @returns {Promise<object>} Login response with user data
 */
export async function loginSpecialist(email, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Logout specialist
 * @returns {Promise<object>} Logout response
 */
export async function logoutSpecialist() {
  return apiRequest("/api/auth/logout", {
    method: "POST",
  });
}

/**
 * Get current authenticated user
 * @returns {Promise<object>} Current user data
 */
export async function getCurrentUser() {
  return apiRequest("/api/auth/me");
}

// ==========================================
// Dashboard
// ==========================================

/**
 * Fetch dashboard data from API (includes stats, recent tickets, etc.)
 * @returns {Promise<object>} Dashboard data object
 */
export async function fetchDashboard() {
  const data = await apiRequest("/api/specialist/dashboard");
  return data;
}

// ==========================================
// Profile
// ==========================================

/**
 * Fetch specialist profile
 * @returns {Promise<object>} Profile data
 */
export async function fetchProfile() {
  const data = await apiRequest("/api/specialist/profile");
  return data.specialist;
}

/**
 * Update specialist profile
 * @param {object} profileData - Profile data to update
 * @returns {Promise<object>} Updated profile
 */
export async function updateProfile(profileData) {
  const data = await apiRequest("/api/specialist/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
  return data.specialist;
}

/**
 * Upload avatar image
 * @param {File} file - Image file to upload
 * @returns {Promise<object>} Upload response with avatar URL
 */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/api/specialist/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete avatar image
 * @returns {Promise<object>} Delete response
 */
export async function deleteAvatar() {
  return apiRequest("/api/specialist/avatar", {
    method: "DELETE",
  });
}

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Response
 */
export async function changePassword(currentPassword, newPassword) {
  return apiRequest("/api/specialist/change-password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ==========================================
// Tickets
// ==========================================

/**
 * Fetch all tickets assigned to specialist
 * @param {object} options - Query options (status, limit, skip)
 * @returns {Promise<object>} Tickets data with pagination info
 */
export async function fetchTickets(options = {}) {
  const params = new URLSearchParams();
  if (options.status) params.append("status", options.status);
  if (options.limit) params.append("limit", options.limit);
  if (options.skip) params.append("skip", options.skip);

  const queryString = params.toString();
  const endpoint = `/api/specialist/tickets${
    queryString ? `?${queryString}` : ""
  }`;

  return apiRequest(endpoint);
}

/**
 * Fetch single ticket details
 * @param {string|number} ticketId - Ticket ID
 * @returns {Promise<object>} Ticket data
 */
export async function fetchTicket(ticketId) {
  const data = await apiRequest(`/api/specialist/tickets/${ticketId}`);
  return data.ticket;
}

/**
 * Update ticket
 * @param {string|number} ticketId - Ticket ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} Updated ticket
 */
export async function updateTicket(ticketId, updateData) {
  const data = await apiRequest(`/api/specialist/tickets/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
  return data.ticket;
}

/**
 * Update ticket consultation data (Assessment, Prescription, Laboratory Request)
 * @param {string|number} ticketId - Ticket ID
 * @param {object} consultationData - Consultation data (assessment, prescription, laboratoryRequest)
 * @returns {Promise<object>} Updated ticket
 */
export async function updateTicketConsultation(ticketId, consultationData) {
  const data = await apiRequest(
    `/api/specialist/tickets/${ticketId}/consultation`,
    {
      method: "PUT",
      body: JSON.stringify(consultationData),
    }
  );
  return data.ticket;
}

/**
 * Pass ticket back to nurse for processing
 * @param {string|number} ticketId - Ticket ID
 * @param {string} notes - Optional notes when passing back
 * @returns {Promise<object>} Updated ticket
 */
export async function passTicketBackToNurse(ticketId, notes = "") {
  const data = await apiRequest(
    `/api/specialist/tickets/${ticketId}/pass-back`,
    {
      method: "POST",
      body: JSON.stringify({ notes }),
    }
  );
  return data.ticket;
}

/**
 * Complete a consultation
 * @param {string|number} ticketId - Ticket ID
 * @param {object} completionData - Completion data (diagnosis, prescription, notes)
 * @returns {Promise<object>} Completed ticket
 */
export async function completeConsultation(ticketId, completionData) {
  const data = await apiRequest(
    `/api/specialist/tickets/${ticketId}/complete`,
    {
      method: "POST",
      body: JSON.stringify(completionData),
    }
  );
  return data.ticket;
}

// ==========================================
// Schedule
// ==========================================

/**
 * Fetch specialist schedule
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {Promise<Array>} Schedule entries
 */
export async function fetchSchedule(month, year) {
  const params = new URLSearchParams();
  if (month !== undefined) params.append("month", month);
  if (year !== undefined) params.append("year", year);

  const queryString = params.toString();
  const endpoint = `/api/specialist/schedule${
    queryString ? `?${queryString}` : ""
  }`;

  const data = await apiRequest(endpoint);
  return data.schedules;
}

/**
 * Create or update schedule entry
 * @param {object} scheduleData - Schedule data (date, time, duration, notes, isAvailable)
 * @returns {Promise<object>} Schedule entry
 */
export async function updateSchedule(scheduleData) {
  const data = await apiRequest("/api/specialist/schedule", {
    method: "POST",
    body: JSON.stringify(scheduleData),
  });
  return data.schedule;
}

/**
 * Delete schedule entry
 * @param {string|number} scheduleId - Schedule entry ID
 * @returns {Promise<object>} Delete response
 */
export async function deleteSchedule(scheduleId) {
  return apiRequest(`/api/specialist/schedule/${scheduleId}`, {
    method: "DELETE",
  });
}

// ==========================================
// Notifications
// ==========================================

/**
 * Fetch notifications
 * @returns {Promise<Array>} Notifications array
 */
export async function fetchNotifications() {
  const data = await apiRequest("/api/specialist/notifications");
  return data.notifications;
}

/**
 * Mark notification as read
 * @param {string|number} notificationId - Notification ID
 * @returns {Promise<object>} Response
 */
export async function markNotificationRead(notificationId) {
  return apiRequest(`/api/specialist/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

// ==========================================
// Services & Fees
// ==========================================

/**
 * Fetch service fees
 * @returns {Promise<Array>} Services array
 */
export async function fetchServices() {
  const data = await apiRequest("/api/specialist/services");
  return data.services;
}

/**
 * Update service fee
 * @param {string} serviceName - Service name
 * @param {number} fee - Fee amount
 * @returns {Promise<object>} Updated service
 */
export async function updateService(serviceName, fee) {
  const data = await apiRequest("/api/specialist/services", {
    method: "PUT",
    body: JSON.stringify({ serviceName, fee }),
  });
  return data.service;
}

// ==========================================
// Transactions
// ==========================================

/**
 * Fetch transaction history
 * @param {object} options - Query options (startDate, endDate, status)
 * @returns {Promise<object>} Transactions with totals
 */
export async function fetchTransactions(options = {}) {
  const params = new URLSearchParams();
  if (options.startDate) params.append("startDate", options.startDate);
  if (options.endDate) params.append("endDate", options.endDate);
  if (options.status) params.append("status", options.status);

  const queryString = params.toString();
  const endpoint = `/api/specialist/transactions${
    queryString ? `?${queryString}` : ""
  }`;

  return apiRequest(endpoint);
}

// ==========================================
// Payment Account
// ==========================================

/**
 * Update payment account details
 * @param {object} accountData - Account data (accountType, accountName, accountNumber, gcashNumber)
 * @returns {Promise<object>} Updated account details
 */
export async function updatePaymentAccount(accountData) {
  return apiRequest("/api/specialist/payment-account", {
    method: "PUT",
    body: JSON.stringify(accountData),
  });
}

// ==========================================
// Test endpoint
// ==========================================

/**
 * Test API connection
 * @returns {Promise<object>} Test response
 */
export async function testConnection() {
  return apiRequest("/api/specialist/test");
}

// Export API base URL for other uses
export { API_BASE_URL };
