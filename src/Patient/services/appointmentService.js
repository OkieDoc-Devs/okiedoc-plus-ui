import { patientDummyData, dummySpecialists } from "../../api/Patient/test.js";

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
    console.log("Fetching appointments from backend (simulated)...");
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return patientDummyData.appointments;
  }

  /**
   * Add a new appointment via the backend.
   * @param {Object} appointmentData - The data for the new appointment.
   * @returns {Promise<Object>} The created appointment data from the server.
   */
  async addAppointment(appointmentData) {
    console.log("Sending new appointment to backend (simulated):", appointmentData);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newAppointment = {
      ...appointmentData,
      id: `appt-${Date.now()}`,
      status: "Pending",
    };

    patientDummyData.appointments.push(newAppointment);
    return newAppointment;
  }

  /**
   * Fetch all specialists from the backend.
   * @returns {Promise<Array>} A list of specialists.
   */
  async getSpecialists() {
    console.log("Fetching specialists from backend (simulated)...");
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return dummySpecialists;
  }
}

// Create and export a singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;
