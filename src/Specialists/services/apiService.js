/**
 * Specialist API Service Module
 * Handles all API communication for the Specialist module
 * Integrated with okiedoc-plus-api-new-backend (API v1)
 */

const API_BASE_URL =
  import.meta.env.VITE_SPECIALIST_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://your-production-url.com"
    : "http://localhost:1337");

const API_PREFIX = "/api/v1";

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint (e.g. /api/v1/auth/login)
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, {
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
      errorData.error || errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

// ==========================================
// Authentication (new API v1)
// ==========================================

/**
 * Login specialist
 * @param {string} email - Specialist email
 * @param {string} password - Specialist password
 * @returns {Promise<object>} Login response with user data
 */
export async function loginSpecialist(email, password) {
  return apiRequest(`${API_PREFIX}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Logout specialist
 * @returns {Promise<object>} Logout response
 */
export async function logoutSpecialist() {
  return apiRequest(`${API_PREFIX}/auth/logout`, {
    method: "POST",
  });
}

/**
 * Get current authenticated user
 * @returns {Promise<object>} Current user data { user }
 */
export async function getCurrentUser() {
  return apiRequest(`${API_PREFIX}/auth/me`);
}

/**
 * Register specialist (new API: POST /api/v1/specialist/register)
 * @param {object} data - fullName, email, mobileNumber, password, licenseNumber, primarySpecialty, subSpecialties?, prcExpiryDate?
 * @returns {Promise<object>} { message } or throws
 */
export async function registerSpecialist(data) {
  return apiRequest(`${API_PREFIX}/specialist/register`, {
    method: "POST",
    body: JSON.stringify({
      fullName: [data.firstName, data.lastName].filter(Boolean).join(" ") || data.fullName,
      email: data.email,
      mobileNumber: data.phone || data.mobileNumber || "0000000000",
      password: data.password,
      licenseNumber: data.licenseNumber,
      primarySpecialty: data.primarySpecialty || data.specialty,
      subSpecialties: data.subSpecialties || "",
      prcExpiryDate: data.prcExpiryDate || undefined,
    }),
  });
}

// ==========================================
// Dashboard (composed from new API)
// ==========================================

/**
 * Fetch dashboard data (auth/me + my-active-tickets)
 * @returns {Promise<object>} Dashboard data with specialist and tickets
 */
export async function fetchDashboard() {
  const [meRes, ticketsRes] = await Promise.all([
    apiRequest(`${API_PREFIX}/auth/me`),
    apiRequest(`${API_PREFIX}/specialist/my-active-tickets`),
  ]);
  const user = meRes.user || {};
  const tickets = ticketsRes.tickets || [];
  return {
    specialist: {
      id: user.id,
      fullName: user.fullName,
      firstName: user.fullName?.split(" ")[0] || "",
      lastName: user.fullName?.split(" ").slice(1).join(" ") || "",
      email: user.email,
      fName: user.fullName?.split(" ")[0],
      lName: user.fullName?.split(" ").slice(1).join(" "),
      role: user.role,
      userType: user.role,
      birthday: user.birthday,
      gender: user.gender,
      bloodType: user.bloodType,
    },
    tickets,
  };
}

// ==========================================
// Profile (new API v1)
// ==========================================

/**
 * Fetch specialist profile (from auth/me; specialist-specific fields from update response or defaults)
 * @returns {Promise<object>} Profile data
 */
export async function fetchProfile() {
  const data = await apiRequest(`${API_PREFIX}/auth/me`);
  const user = data.user || {};
  const parts = (user.fullName || "").split(" ");
  return {
    ...user,
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    fName: parts[0],
    lName: parts.slice(1).join(" "),
    email: user.email,
    specialization: user.primarySpecialty,
    subSpecialization: user.subSpecialties,
    userType: user.role,
  };
}

/**
 * Update specialist profile
 * New API: PATCH /api/v1/specialist/update-profile { bio, primarySpecialty, subSpecialties, s2Number, ptrNumber, birthday }
 * @param {object} profileData - Profile data to update
 * @returns {Promise<object>} Updated profile
 */
export async function updateProfile(profileData) {
  const body = {
    bio: profileData.bio,
    primarySpecialty: profileData.specialization || profileData.primarySpecialty,
    subSpecialties: profileData.subSpecialization ?? profileData.subSpecialties ?? "",
    s2Number: profileData.s2Number,
    ptrNumber: profileData.ptrNumber,
    birthday: profileData.birthday,
  };
  const data = await apiRequest(`${API_PREFIX}/specialist/update-profile`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return { ...profileData, ...(data.data || {}) };
}

/**
 * Upload avatar image (not in new API - no-op)
 */
export async function uploadAvatar(file) {
  console.warn("Avatar upload not implemented in new API");
  return { url: null };
}

/**
 * Delete avatar image (not in new API - no-op)
 */
export async function deleteAvatar() {
  console.warn("Avatar delete not implemented in new API");
  return {};
}

/**
 * Change password (not in new API - no-op)
 */
export async function changePassword(currentPassword, newPassword) {
  console.warn("Change password not implemented in new API");
  throw new Error("Change password is not available in the current API.");
}

// ==========================================
// Tickets (new API v1)
// ==========================================

/**
 * Fetch all tickets assigned to specialist
 * GET /api/v1/specialist/my-active-tickets
 * @param {object} options - Query options (ignored by new API; filter client-side if needed)
 * @returns {Promise<object>} { tickets }
 */
export async function fetchTickets(options = {}) {
  const data = await apiRequest(`${API_PREFIX}/specialist/my-active-tickets`);
  let tickets = data.tickets || [];
  if (options.status) {
    tickets = tickets.filter((t) => t.status === options.status);
  }
  return { tickets, count: tickets.length };
}

/**
 * Fetch tickets available to claim (new API)
 * GET /api/v1/specialist/view-available
 */
export async function fetchAvailableTickets() {
  const data = await apiRequest(`${API_PREFIX}/specialist/view-available`);
  return { tickets: data.data || [], count: data.count || 0 };
}

/**
 * Claim a ticket
 * PATCH /api/v1/specialist/claim-ticket { ticketId }
 */
export async function claimTicket(ticketId) {
  return apiRequest(`${API_PREFIX}/specialist/claim-ticket`, {
    method: "PATCH",
    body: JSON.stringify({ ticketId: Number(ticketId) }),
  });
}

/**
 * Fetch single ticket (from my-active-tickets list)
 * @param {string|number} ticketId - Ticket ID
 * @returns {Promise<object>} Ticket data
 */
export async function fetchTicket(ticketId) {
  const data = await apiRequest(`${API_PREFIX}/specialist/my-active-tickets`);
  const tickets = data.tickets || [];
  const ticket = tickets.find((t) => String(t.id) === String(ticketId));
  if (!ticket) {
    throw new Error("Ticket not found or not assigned to you.");
  }
  return ticket;
}

/**
 * Update ticket (EMR fields via PATCH /api/v1/tickets/update-emr; status-only updates are no-op)
 * @param {string|number} ticketId - Ticket ID
 * @param {object} updateData - Data to update (subjective, objective, assessment, plan, icd10Code, or status)
 * @returns {Promise<object>} Updated ticket
 */
export async function updateTicket(ticketId, updateData) {
  const emrFields = ["subjective", "objective", "assessment", "plan", "icd10Code"];
  const hasEmr = emrFields.some((f) => updateData[f] !== undefined && updateData[f] !== null);
  if (!hasEmr && "status" in updateData) {
    // New API has no generic status update; keep local state only
    return fetchTicket(ticketId);
  }
  if (!hasEmr) return fetchTicket(ticketId);

  const body = {
    ticketId: Number(ticketId),
    subjective: updateData.subjective,
    objective: updateData.objective,
    assessment: updateData.assessment,
    plan: updateData.plan,
    icd10Code: updateData.icd10Code,
  };
  await apiRequest(`${API_PREFIX}/tickets/update-emr`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return fetchTicket(ticketId);
}

/**
 * Update ticket consultation (maps to update-emr: assessment, prescription -> plan, laboratoryRequest -> plan)
 * @param {string|number} ticketId - Ticket ID
 * @param {object} consultationData - assessment, prescription, laboratoryRequest (and optional subjective, objective, plan, icd10Code)
 * @returns {Promise<object>} Updated ticket
 */
export async function updateTicketConsultation(ticketId, consultationData) {
  const parts = [];
  if (consultationData.prescription) parts.push(consultationData.prescription);
  if (consultationData.laboratoryRequest) parts.push(consultationData.laboratoryRequest);
  const plan = parts.length ? parts.join("\n\n") : consultationData.plan;
  const body = {
    ticketId: Number(ticketId),
    subjective: consultationData.subjective,
    objective: consultationData.objective,
    assessment: consultationData.assessment,
    plan: plan ?? consultationData.plan,
    icd10Code: consultationData.icd10Code,
  };
  await apiRequest(`${API_PREFIX}/tickets/update-emr`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return fetchTicket(ticketId);
}

/**
 * Pass ticket back to nurse (not in new API - no-op)
 */
export async function passTicketBackToNurse(ticketId, notes = "") {
  console.warn("Pass back to nurse not implemented in new API");
  return fetchTicket(ticketId);
}

/**
 * Complete consultation (not in new API - no-op)
 */
export async function completeConsultation(ticketId, completionData) {
  console.warn("Complete consultation not implemented in new API");
  return fetchTicket(ticketId);
}

// ==========================================
// Schedule (not in new API - stubs)
// ==========================================

export async function fetchSchedule(month, year) {
  return [];
}

export async function updateSchedule(scheduleData) {
  console.warn("Schedule update not implemented in new API");
  return scheduleData;
}

export async function deleteSchedule(scheduleId) {
  console.warn("Schedule delete not implemented in new API");
  return {};
}

// ==========================================
// Notifications (not in new API - stubs)
// ==========================================

export async function fetchNotifications() {
  return [];
}

export async function markNotificationRead(notificationId) {
  return {};
}

// ==========================================
// Services & Fees (new API: PATCH /api/v1/specialist/fees)
// ==========================================

export async function fetchServices() {
  return [];
}

/**
 * Update fees - new API expects all four fee fields
 * PATCH /api/v1/specialist/fees { feeInitialWithoutCert, feeInitialWithCert, feeFollowUpWithoutCert, feeFollowUpWithCert }
 */
export async function updateService(serviceName, fee) {
  const num = Number(fee);
  await apiRequest(`${API_PREFIX}/specialist/fees`, {
    method: "PATCH",
    body: JSON.stringify({
      feeInitialWithoutCert: num,
      feeInitialWithCert: num,
      feeFollowUpWithoutCert: num,
      feeFollowUpWithCert: num,
    }),
  });
  return { serviceName, fee: num };
}

// ==========================================
// Transactions (not in new API - stub)
// ==========================================

export async function fetchTransactions(options = {}) {
  return { transactions: [], total: 0 };
}

// ==========================================
// Payment Account (not in new API - stub)
// ==========================================

export async function updatePaymentAccount(accountData) {
  console.warn("Payment account update not implemented in new API");
  return accountData;
}

// ==========================================
// Test endpoint
// ==========================================

export async function testConnection() {
  return apiRequest(`${API_PREFIX}/auth/me`).then(() => ({ ok: true }));
}

export { API_BASE_URL };
