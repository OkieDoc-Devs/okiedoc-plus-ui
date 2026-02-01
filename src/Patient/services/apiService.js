/**
 * API Service Module
 * Handles API communication for the Patient module
 */

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://your-production-url.com"
    : "http://localhost:1337";

/**
 * Fetch patient profile from API
 * @returns {Promise<Object>} Patient profile data
 * @throws {Error} If API request fails
 */
export async function fetchPatientProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/patient/profile`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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

    if (data?.success) {
      return payload || {};
    }

    return payload || {};
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    throw error;
  }
}
