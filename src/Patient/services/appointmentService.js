const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://your-production-url.com"
    : "http://localhost:1337";

/**
 * Appointment Service for managing appointments via API.
 */
class AppointmentService {
  constructor() {
    // This can be used to configure headers, e.g., for auth tokens
    this.getHeaders = () => ({
      "Content-Type": "application/json",
      // Add authorization headers if needed, e.g.:
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
  }

  /**
   * Fetch all appointments from the backend.
   * @returns {Promise<Array>} A list of appointments.
   */
  async getAllAppointments() {
    console.log("Fetching appointments from backend...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const result = await response.json();
      // NOTE: Depending on your backend (e.g., Strapi), your data might be nested under a `data` key.
      return result.data || result;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  }

  /**
   * Add a new appointment via the backend.
   * @param {Object} appointmentData - The data for the new appointment.
   * @returns {Promise<Object>} The created appointment data from the server.
   */
  async addAppointment(appointmentData) {
    console.log("Sending new appointment to backend:", appointmentData);
    try {
      // NOTE: Some backends (e.g., Strapi v4) expect the payload to be wrapped in a 'data' object.
      // If so, you would use: body: JSON.stringify({ data: appointmentData })
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: "Failed to create appointment" }));
        console.error("API Error:", errorBody);
        throw new Error(errorBody.message || "Failed to create appointment");
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding appointment:", error);
      throw error;
    }
  }

  /**
   * Fetch all specialists from the backend.
   * @returns {Promise<Array>} A list of specialists.
   */
  async getSpecialists() {
    console.log("Fetching specialists from backend...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/specialists`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch specialists");
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error fetching specialists:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;
