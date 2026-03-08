import axios from 'axios';

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://your-production-url.com"
    : "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Add authorization headers if needed, e.g.:
    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});

/**
 * Appointment Service for managing appointments via API.
 */
const appointmentService = {
  async getAllAppointments() {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      throw error;
    }
  },
  async addAppointment(appointmentData) {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error("Failed to add appointment:", error);
      throw error;
    }
  },
  async getSpecialists() {
    try {
      const response = await api.get('/specialists');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch specialists:", error);
      throw error;
    }
  }
};

// Create and export a singleton instance
export default appointmentService;
