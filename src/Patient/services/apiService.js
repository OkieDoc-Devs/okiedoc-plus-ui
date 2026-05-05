/**
 * API Service Module
 * Handles API communication for the Patient module
 */

import { apiRequest } from "../../api/apiClient";

/**
 * Fetch patient profile from API
 * @returns {Promise<Object>} Patient profile data
 */
export async function fetchPatientProfile() {
  try {
    const data = await apiRequest("/api/v1/patients/profile");
    let payload = data?.data ?? data;

    if (Array.isArray(payload)) {
      payload = payload[0] || {};
    }
    if (payload?.patient) {
      payload = payload.patient;
    }
    if (payload?.profile) {
      payload = payload.profile;
    }

    return payload || {};
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    throw error;
  }
}

/**
 * Update patient clinical profile
 */
export async function updatePatientProfile(profileData) {
  try {
    return await apiRequest("/api/v1/patients/update-profile", {
      method: "PATCH",
      body: JSON.stringify(profileData),
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    throw error;
  }
}

/**
 * Fetch patient active tickets
 */
export async function fetchPatientActiveTickets() {
  try {
    return await apiRequest("/api/v1/patients/active-tickets", {
      cache: "no-store", // Prevent browser from caching old ticket statuses
    });
  } catch (error) {
    console.error("Error fetching patient active tickets:", error);
    throw error;
  }
}

/**
 * Fetch patient medical history
 */
export async function fetchPatientMedicalHistory() {
  try {
    return await apiRequest("/api/v1/patients/medical-history");
  } catch (error) {
    console.error("Error fetching patient medical history:", error);
    throw error;
  }
}

/**
 * Create a new consultation ticket
 */
export async function createTicket(ticketData) {
  try {
    return await apiRequest("/api/v1/tickets/create", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
}

/**
 * Upload payment proof for a ticket
 */
export async function uploadPaymentProof(ticketId, file) {
  try {
    const formData = new FormData();
    formData.append("ticketId", ticketId);
    formData.append("proof", file);

    return await apiRequest("/api/v1/tickets/upload-payment-proof", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    throw error;
  }
}

/**
 * Upload LOA (Letter of Authorization) for a ticket
 */
export async function uploadLOA(ticketId, file) {
  try {
    const formData = new FormData();
    formData.append("ticketId", ticketId);
    formData.append("loa", file);

    return await apiRequest("/api/v1/tickets/upload-loa", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("Error uploading LOA:", error);
    throw error;
  }
}

/**
 * Submit Consultation Intake Form
 */
export async function submitConsultationIntake(intakeData) {
  try {
    return await apiRequest("/api/v1/consultations/intake", {
      method: "POST",
      body: JSON.stringify(intakeData),
    });
  } catch (error) {
    console.error("Error submitting intake form:", error);
    throw error;
  }
}

/**
 * Cancel a pending ticket
 */
export async function cancelTicket(ticketId) {
  try {
    return await apiRequest("/api/v1/tickets/cancel", {
      method: "POST",
      body: JSON.stringify({ ticketId }),
    });
  } catch (error) {
    console.error("Error canceling ticket:", error);
    throw error;
  }
}

/**
 * Upload profile picture
 * @param {FormData} formData - FormData containing the 'photo' file
 */
export async function uploadProfilePicture(formData) {
  try {
    return await apiRequest("/api/v1/user/upload-profile-picture", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

/**
 * Generate Xendit payment checkout link for a ticket
 * @param {number|string} ticketId - ID of the ticket to pay
 */
export async function payTicket(ticketId) {
  try {
    return await apiRequest("/api/v1/tickets/pay", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: JSON.stringify({ ticketId }),
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    throw error;
  }
}

/**
 * Verify Xendit payment status
 * @param {number|string} ticketId - ID of the ticket to verify
 */
export async function verifyTicketPayment(ticketId) {
  try {
    return await apiRequest("/api/v1/tickets/verify-payment", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: JSON.stringify({ ticketId }),
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
}

export const shareMedicalRecords = async (payload) => {
  try {
    const response = await apiRequest("/api/sharedrecordaccess", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response?.data || response;
  } catch (error) {
    console.error("Failed to share records:", error);
    throw new Error("Failed to share records");
  }
};

export const revokeMedicalRecords = async (accessId) => {
  try {
    const response = await apiRequest(`/api/sharedrecordaccess/${accessId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "revoked" }),
    });
    return response?.data || response;
  } catch (error) {
    console.error("Failed to revoke records:", error);
    throw new Error("Failed to revoke records");
  }
};

export const fetchPatientMedicalRecords = async () => {
  try {
    const response = await apiRequest("/api/patient/medical-records");
    return response?.data || response || {};
  } catch (error) {
    console.error("Failed to fetch medical records:", error);
    throw new Error("Failed to fetch medical records");
  }
};

/**
 * Logout Patient
 */
export const logoutPatient = async () => {
  try {
    await apiRequest("/api/v1/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("okiedoc_user_type");
  }
};
