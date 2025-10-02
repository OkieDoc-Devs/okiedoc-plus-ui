// API Service for connecting React to Sails.js backend
class ApiService {
  constructor() {
    // Base URL for the Sails.js API (adjust port if needed)
    this.baseURL = 'http://localhost:1337';
  }

  // Generic fetch method with error handling
  async fetchData(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`API Response Status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get doctor list from API
  async getDoctorList() {
    return await this.fetchData('/doctorList');
  }

  // Login patient
  async loginPatient(email, password) {
    return await this.fetchData('/patient-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Register patient
  async registerPatient(patientData) {
    return await this.fetchData('/patient-register', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  // Get patient dashboard data from API
  async getPatientData(patientId = null) {
    const endpoint = patientId 
      ? `/patient-dashboard?patient_id=${patientId}` 
      : '/patient-dashboard';
    return await this.fetchData(endpoint);
  }

  // Get patient profile
  async getPatientProfile(patientId = null) {
    const endpoint = patientId 
      ? `/patient-profile?patient_id=${patientId}` 
      : '/patient-profile';
    return await this.fetchData(endpoint);
  }

  // Get appointments specifically
  async getAppointments() {
    const patientData = await this.getPatientData();
    return patientData.appointments || [];
  }

  // Get lab results specifically
  async getLabResults() {
    const patientData = await this.getPatientData();
    return patientData.labResults || [];
  }

  // Get medications specifically
  async getMedications() {
    const patientData = await this.getPatientData();
    return patientData.medications || [];
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await this.fetchData('/isAlive');
      console.log('API Connection Test:', response);
      return true;
    } catch (error) {
      console.error('API Connection Failed:', error);
      return false;
    }
  }

  // Fallback to localStorage data if API fails
  async getAppointmentsWithFallback() {
    try {
      return await this.getAppointments();
    } catch (error) {
      console.warn('API failed, falling back to localStorage');
      // Fallback to existing localStorage service
      const appointmentService = await import('./appointmentService.js');
      return appointmentService.default.getAllAppointments();
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
