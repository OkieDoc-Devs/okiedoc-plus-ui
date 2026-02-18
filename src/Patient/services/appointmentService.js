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
    // TODO: Implement API call to fetch appointments
    console.log("Fetching appointments from backend...");
    return []; // Return empty array for now
  }

  /**
   * Add a new appointment via the backend.
   * @param {Object} appointmentData - The data for the new appointment.
   * @returns {Promise<Object>} The created appointment data from the server.
   */
  async addAppointment(appointmentData) {
    // TODO: Implement API call to create a new appointment
    console.log("Sending new appointment to backend:", appointmentData);
    try {
      // const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      //   method: 'POST',
      //   headers: this.getHeaders(),
      //   body: JSON.stringify(appointmentData),
      // });
      // if (!response.ok) throw new Error('Failed to create appointment');
      // return await response.json();
      return { ...appointmentData, id: Date.now() }; // Placeholder response
    } catch (error) {
      console.error("Error adding appointment:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;
