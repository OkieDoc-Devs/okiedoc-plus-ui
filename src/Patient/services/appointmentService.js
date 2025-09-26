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

  // Initialize with dummy tickets for demonstration
  initializeDummyTickets() {
    console.log('Initializing dummy tickets...');
    const existingAppointments = this.getAllAppointments();
    console.log('Existing appointments:', existingAppointments);
    
    // Only initialize if no appointments exist
    if (existingAppointments.length > 0) {
      console.log('Appointments already exist, returning existing data');
      return existingAppointments;
    }
    
    console.log('No existing appointments, initializing dummy tickets');
    const dummyTickets = [
      {
        id: 'dummy-1',
        title: 'Cardiology Consultation - Dr. Maria Santos',
        status: 'Pending',
        specialist: 'Dr. Maria Santos',
        date: '2024-01-15',
        time: '10:00',
        specialty: 'Cardiology',
        description: 'Routine heart checkup and consultation',
        consultationChannel: 'Video Call',
        consultationType: 'Teleconsultation',
        medicalDetails: {
          chiefComplaint: 'Chest pain and shortness of breath',
          symptoms: 'Mild chest discomfort, occasional shortness of breath during exercise',
          otherSymptoms: ''
        },
        patientInfo: {
          name: 'John Smith',
          phone: '+63 912 345 6789',
          email: 'john.smith@email.com',
          isRegistered: true
        },
        bookingMethod: 'Online',
        userType: 'Registered',
        processingNote: 'Patient scheduled for routine cardiology consultation',
        createdAt: '2024-01-10T08:30:00.000Z',
        updatedAt: '2024-01-10T08:30:00.000Z'
      },
      {
        id: 'dummy-2',
        title: 'Dermatology Consultation - Dr. Lisa Garcia',
        status: 'Processing',
        specialist: 'Dr. Lisa Garcia',
        date: '2024-01-12',
        time: '14:30',
        specialty: 'Dermatology',
        description: 'Skin condition evaluation and treatment',
        consultationChannel: 'Mobile Call',
        consultationType: 'Teleconsultation',
        medicalDetails: {
          chiefComplaint: 'Persistent skin rash on arms and legs',
          symptoms: 'Red, itchy rash that has been present for 2 weeks',
          otherSymptoms: 'Mild swelling in affected areas'
        },
        patientInfo: {
          name: 'Sarah Johnson',
          phone: '+63 917 123 4567',
          email: 'sarah.johnson@email.com',
          isRegistered: true
        },
        bookingMethod: 'Hotline',
        userType: 'Registered',
        processingNote: 'Nurse is reviewing case details and confirming specialist availability',
        createdAt: '2024-01-08T14:20:00.000Z',
        updatedAt: '2024-01-11T09:15:00.000Z'
      },
      {
        id: 'dummy-3',
        title: 'Pediatrics Consultation - Dr. Michael Brown',
        status: 'Confirmed',
        specialist: 'Dr. Michael Brown',
        date: '2024-01-18',
        time: '09:00',
        specialty: 'Pediatrics',
        description: 'Child health checkup and vaccination',
        consultationChannel: 'Video Call',
        consultationType: 'Teleconsultation',
        medicalDetails: {
          chiefComplaint: 'Annual checkup for 5-year-old child',
          symptoms: 'No current symptoms, routine checkup',
          otherSymptoms: ''
        },
        patientInfo: {
          name: 'Maria Rodriguez',
          phone: '+63 918 987 6543',
          email: 'maria.rodriguez@email.com',
          isRegistered: true
        },
        bookingMethod: 'Online',
        userType: 'Registered',
        processingNote: 'Appointment confirmed by specialist, patient notified',
        createdAt: '2024-01-05T11:45:00.000Z',
        updatedAt: '2024-01-12T16:30:00.000Z'
      },
      {
        id: 'dummy-5',
        title: 'Neurology Consultation - Dr. Jennifer Martinez',
        status: 'For Payment',
        specialist: 'Dr. Jennifer Martinez',
        date: '2024-01-20',
        time: '11:30',
        specialty: 'Neurology',
        description: 'Headache evaluation and neurological assessment',
        consultationChannel: 'Video Call',
        consultationType: 'Teleconsultation',
        medicalDetails: {
          chiefComplaint: 'Frequent headaches and dizziness',
          symptoms: 'Headaches 3-4 times per week, occasional dizziness',
          otherSymptoms: 'Mild nausea during severe headaches'
        },
        patientInfo: {
          name: 'Emily Davis',
          phone: '+63 920 111 2222',
          email: 'emily.davis@email.com',
          isRegistered: true
        },
        bookingMethod: 'Online',
        userType: 'Registered',
        processingNote: 'Appointment confirmed, payment required before consultation',
        createdAt: '2024-01-03T13:20:00.000Z',
        updatedAt: '2024-01-19T08:30:00.000Z'
      },
      {
        id: 'dummy-6',
        title: 'General Medicine Consultation - Dr. Robert Johnson',
        status: 'Active',
        specialist: 'Dr. Robert Johnson',
        date: '2024-01-22',
        time: '16:00',
        specialty: 'General Medicine',
        description: 'Ongoing consultation and treatment monitoring',
        consultationChannel: 'Video Call',
        consultationType: 'Teleconsultation',
        medicalDetails: {
          chiefComplaint: 'Follow-up consultation for diabetes management',
          symptoms: 'Blood sugar monitoring and medication adjustment',
          otherSymptoms: 'Regular checkup and lifestyle counseling'
        },
        patientInfo: {
          name: 'Michael Thompson',
          phone: '+63 921 333 4444',
          email: 'michael.thompson@email.com',
          isRegistered: true
        },
        bookingMethod: 'Online',
        userType: 'Registered',
        processingNote: 'Active consultation - patient can chat with nurse and upload documents',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-22T14:00:00.000Z'
      }
    ];

    // Always add dummy tickets
    this.saveAppointments(dummyTickets);
    console.log('Dummy tickets initialized:', dummyTickets);
    return dummyTickets;
  }

  // Force initialize dummy tickets (for testing)
  forceInitializeDummyTickets() {
    this.clearAllAppointments();
    return this.initializeDummyTickets();
  }

  // Reset to fresh dummy data (for debugging)
  resetToDummyData() {
    console.log('Resetting to fresh dummy data...');
    this.clearAllAppointments();
    return this.initializeDummyTickets();
  }
}

// Create and export a singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;
