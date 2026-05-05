/**
 * Specialist API Service Module
 * Handles all API communication for the Specialist module
 */

import { apiRequest, API_BASE_URL } from "../../api/apiClient";

// ==========================================
// Authentication
// ==========================================

export async function loginSpecialist(email, password) {
  return apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutSpecialist() {
  return apiRequest("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  return apiRequest("/api/v1/auth/me");
}

// ==========================================
// Dashboard
// ==========================================

export async function fetchDashboard() {
  return apiRequest("/api/v1/specialist/dashboard");
}

// ==========================================
// Profile
// ==========================================

export async function fetchProfile() {
  const data = await apiRequest("/api/v1/specialist/profile");
  return data.specialist;
}

export async function updateProfile(profileData) {
  const data = await apiRequest("/api/v1/specialist/update-profile", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
  return data.specialist || data.data;
}

export async function updateFees(feesData) {
  return apiRequest("/api/v1/specialist/fees", {
    method: "PATCH",
    body: JSON.stringify(feesData),
  });
}

export async function uploadProfilePicture(formData) {
  return apiRequest("/api/v1/user/upload-profile-picture", {
    method: "POST",
    body: formData,
  });
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiRequest("/api/v1/specialist/avatar", {
    method: "POST",
    body: formData,
  });
}

export async function deleteAvatar() {
  return apiRequest("/api/v1/specialist/avatar", {
    method: "DELETE",
  });
}

export async function changePassword(currentPassword, newPassword) {
  return apiRequest("/api/v1/specialist/change-password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getMedicalHistoryData(patientId) {
  return apiRequest(`/api/v1/patients/view-medical-history?patientId=${patientId}`);
}

export async function getPatientProfile(patientId) {
  const data = await apiRequest(`/api/v1/specialist/patient-profile/${patientId}`);
  return data.data || data;
}

export async function requestMedicalHistory(ticketId) {
  return apiRequest('/api/v1/specialist/request-medical-history', {
    method: 'POST',
    body: JSON.stringify({ ticketId }),
  });
}

// ==========================================
// Tickets
// ==========================================

export async function fetchTickets(options = {}) {
  const params = new URLSearchParams();
  if (options.status) params.append("status", options.status);
  if (options.limit) params.append("limit", options.limit);
  if (options.skip) params.append("skip", options.skip);

  const queryString = params.toString();
  const endpoint = `/api/v1/specialist/tickets${queryString ? `?${queryString}` : ""}`;
  return apiRequest(endpoint);
}

export async function fetchMyActiveTickets() {
  return apiRequest("/api/v1/specialist/my-active-tickets");
}

export async function fetchCompletedConsultations() {
  return apiRequest("/api/v1/specialist/completed-consultations");
}

export async function fetchAvailableTickets() {
  return apiRequest("/api/v1/specialist/view-available");
}

export async function claimTicket(ticketId) {
  return apiRequest("/api/v1/specialist/claim-ticket", {
    method: "PATCH",
    body: JSON.stringify({ ticketId: parseInt(ticketId, 10) }),
  });
}

export async function updateEMR(emrData) {
  return apiRequest("/api/v1/tickets/update-emr", {
    method: "PATCH",
    body: JSON.stringify(emrData),
  });
}

export async function generateInvoice(invoiceData) {
  return apiRequest("/api/v1/tickets/generate-invoice", {
    method: "POST",
    body: JSON.stringify(invoiceData),
  });
}

export async function fetchTicket(ticketId) {
  const data = await apiRequest(`/api/v1/specialist/tickets/${ticketId}`);
  return data.ticket;
}

export async function updateTicket(ticketId, updateData) {
  const data = await apiRequest(`/api/v1/specialist/tickets/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
  return data.ticket;
}

export async function updateTicketConsultation(ticketId, consultationData) {
  const data = await apiRequest(`/api/v1/specialist/tickets/${ticketId}/consultation`, {
    method: "PUT",
    body: JSON.stringify(consultationData),
  });
  return data.ticket;
}

export async function passTicketBackToNurse(ticketId, notes = "") {
  const data = await apiRequest(`/api/v1/specialist/tickets/${ticketId}/pass-back`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
  return data.ticket;
}

export async function startConsultation(ticketId) {
  return apiRequest("/api/v1/specialist/start-consultation", {
    method: "PATCH",
    body: JSON.stringify({ ticketId }),
  });
}

export async function completeConsultation(completionData) {
  return apiRequest("/api/v1/specialist/complete-consultation", {
    method: "PATCH",
    body: JSON.stringify(completionData),
  });
}

// ==========================================
// Schedule
// ==========================================

export async function fetchSchedule(month, year) {
  const params = new URLSearchParams();
  if (month !== undefined) params.append("month", month);
  if (year !== undefined) params.append("year", year);

  const queryString = params.toString();
  const endpoint = `/api/v1/specialist/schedule${queryString ? `?${queryString}` : ""}`;
  const data = await apiRequest(endpoint);
  return data.schedules;
}

export async function updateSchedule(scheduleData) {
  const data = await apiRequest("/api/v1/specialist/schedule", {
    method: "POST",
    body: JSON.stringify(scheduleData),
  });
  return data.schedule;
}

export async function deleteSchedule(scheduleId) {
  return apiRequest(`/api/v1/specialist/schedule/${scheduleId}`, {
    method: "DELETE",
  });
}

// ==========================================
// Notifications
// ==========================================

export async function fetchNotifications() {
  const data = await apiRequest("/api/v1/specialist/notifications");
  return data.notifications;
}

export async function markNotificationRead(notificationId) {
  return apiRequest(`/api/v1/specialist/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

// ==========================================
// Services & Fees
// ==========================================

export async function fetchServices() {
  const data = await apiRequest("/api/v1/specialist/services");
  return data.services;
}

export async function updateService(serviceName, fee) {
  const data = await apiRequest("/api/v1/specialist/services", {
    method: "PUT",
    body: JSON.stringify({ serviceName, fee }),
  });
  return data.service;
}

// ==========================================
// Transactions
// ==========================================

export async function fetchTransactions(options = {}) {
  const params = new URLSearchParams();
  if (options.startDate) params.append("startDate", options.startDate);
  if (options.endDate) params.append("endDate", options.endDate);
  if (options.status) params.append("status", options.status);

  const queryString = params.toString();
  const endpoint = `/api/v1/specialist/transactions${queryString ? `?${queryString}` : ""}`;
  return apiRequest(endpoint);
}

// ==========================================
// Payment Account
// ==========================================

export async function updatePaymentAccount(accountData) {
  return apiRequest("/api/v1/specialist/payment-account", {
    method: "PUT",
    body: JSON.stringify(accountData),
  });
}

// ==========================================
// Test endpoint
// ==========================================

export async function testConnection() {
  return apiRequest("/api/v1/specialist/test");
}

export { API_BASE_URL };
