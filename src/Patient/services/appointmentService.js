// Appointment Service for managing appointments across components
class AppointmentService {
  constructor() {
    this.storageKey = 'okiedoc_appointments';
  }

  // Get all appointments from localStorage
  getAllAppointments() {
    try {
      const appointments = localStorage.getItem(this.storageKey);
      const parsedAppointments = appointments ? JSON.parse(appointments) : [];
      
      // Sort appointments by creation date (most recent first)
      return parsedAppointments.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateB - dateA; // Most recent first
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
      return [];
    }
  }

  // Save appointments to localStorage
  saveAppointments(appointments) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(appointments));
      return true;
    } catch (error) {
      console.error('Error saving appointments:', error);
      return false;
    }
  }

  // Add a new appointment
  addAppointment(appointment) {
    const appointments = this.getAllAppointments();
    const newAppointment = {
      ...appointment,
      id: Date.now() + Math.random(), // Ensure unique ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add new appointment at the beginning of the array (most recent first)
    appointments.unshift(newAppointment);
    this.saveAppointments(appointments);
    return newAppointment;
  }

  // Update an appointment
  updateAppointment(id, updates) {
    const appointments = this.getAllAppointments();
    const index = appointments.findIndex(apt => apt.id === id);
    
    if (index !== -1) {
      appointments[index] = {
        ...appointments[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveAppointments(appointments);
      return appointments[index];
    }
    
    return null;
  }

  // Delete an appointment
  deleteAppointment(id) {
    const appointments = this.getAllAppointments();
    const filteredAppointments = appointments.filter(apt => apt.id !== id);
    this.saveAppointments(filteredAppointments);
    return true;
  }

  // Get appointments by status
  getAppointmentsByStatus(status) {
    const appointments = this.getAllAppointments();
    return appointments.filter(apt => apt.status === status);
  }

  // Get appointments for a specific user (if needed for multi-user support)
  getAppointmentsForUser(userId) {
    const appointments = this.getAllAppointments();
    return appointments.filter(apt => apt.userId === userId);
  }

  // Clear all appointments (for testing purposes)
  clearAllAppointments() {
    localStorage.removeItem(this.storageKey);
  }

  // Initialize with empty state (remove any existing data)
  initializeEmpty() {
    this.clearAllAppointments();
  }

  // Removed dummy data initialization - all data now comes from backend API
  // This service now only manages localStorage for fallback purposes
}

// Create and export a singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;
