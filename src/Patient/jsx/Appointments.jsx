import React, { useState, useEffect } from 'react';
import { FaUserMd, FaCalendarPlus, FaClock, FaCheckCircle, FaCreditCard, FaUserCheck, FaPlay, FaComments, FaPaperclip, FaUpload, FaFileAlt, FaTimes, FaPhone, FaVideo, FaDesktop, FaFilePdf, FaImage, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import '../css/AppointmentBooking.css';
import '../css/PatientDashboard.css';
import HotlineBooking from './HotlineBooking';
import appointmentService from '../services/appointmentService';
import apiService from '../services/apiService';

const Appointments = ({ onAppointmentAdded }) => {
  const navigate = useNavigate();
  const [activeTicket, setActiveTicket] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Always true - login check disabled
  const [appointmentForm, setAppointmentForm] = useState({
    chiefComplaint: '',
    symptoms: '',
    otherSymptoms: '',
    preferredDate: '',
    preferredTime: '',
    specialization: '',
    preferredSpecialist: '',
    consultationChannel: 'Platform Chat',
    hmoCompany: '',
    hmoMemberId: '',
    hmoExpirationDate: '',
    loaCode: '',
    eLOAFiles: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Authentication check disabled - users can book without login
  useEffect(() => {
    // Login check disabled - always allow booking
    setIsLoggedIn(true);
  }, []);

  // Available specialists
  const specialists = [
    { id: 2, name: "Dr. John Smith", specialty: "Hematology" },
    { id: 3, name: "Dr. Lisa Garcia", specialty: "Radiology" },
    { id: 4, name: "Dr. Michael Brown", specialty: "Cardiology" },
    { id: 6, name: "Dr. David Lee", specialty: "Dermatology" },
    { id: 7, name: "Dr. Jennifer Martinez", specialty: "Pediatrics" },
    { id: 8, name: "Dr. Robert Johnson", specialty: "Orthopedics" }
  ];

  // Get unique specializations for dropdown
  const specializations = [...new Set(specialists.map(specialist => specialist.specialty))].sort();

  // Filter specialists based on selected specialization
  const availableSpecialists = appointmentForm.specialization 
    ? specialists.filter(specialist => specialist.specialty === appointmentForm.specialization)
    : [];

  // Consultation channels
  const consultationChannels = [
    { value: "Platform Chat", label: "Platform Chat", icon: <FaComments /> },
    { value: "Mobile Call", label: "Mobile Call", icon: <FaPhone /> },
    { value: "Viber Audio", label: "Viber (Audio Call)", icon: <FaPhone /> },
    { value: "Viber Video", label: "Viber (Video Call)", icon: <FaVideo /> },
    { value: "Platform Video", label: "Platform Video Call (via Lgorithm)", icon: <FaDesktop /> }
  ];


  // State for appointments
  const [appointments, setAppointments] = useState([]);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  // Load appointments from API on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      console.log('Loading appointments from API...');
      // Get patient ID from localStorage
      const patientId = localStorage.getItem('patientId');
      console.log('Loading appointments for patient:', patientId);
      
      const apiData = await apiService.getPatientData(patientId);
      const apiAppointments = apiData.appointments || [];
      console.log('API Appointments loaded:', apiAppointments);
      setAppointments(apiAppointments);
    } catch (error) {
      console.error('Failed to load appointments from API:', error);
      // Fallback to empty array instead of localStorage
      console.log('Using empty appointments array as fallback');
      setAppointments([]);
    }
  };

  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const closeAppointmentDetails = () => {
    setShowAppointmentDetails(false);
    setSelectedAppointment(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaClock className="patient-status-icon patient-pending" />;
      case 'Processing':
        return <FaUserCheck className="patient-status-icon patient-processing" />;
      case 'For Payment':
        return <FaCreditCard className="patient-status-icon patient-payment" />;
      case 'Confirmed':
        return <FaCheckCircle className="patient-status-icon patient-confirmed" />;
      case 'Active':
        return <FaPlay className="patient-status-icon patient-active" />;
      default:
        return <FaClock className="patient-status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'patient-status-pending';
      case 'Processing':
        return 'patient-status-processing';
      case 'For Payment':
        return 'patient-status-payment';
      case 'Confirmed':
        return 'patient-status-confirmed';
      case 'Active':
        return 'patient-status-active';
      default:
        return 'patient-status-default';
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        text: chatMessage,
        sender: 'patient',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const openChat = async (appointment) => {
    setActiveTicket(appointment);
    // Load chat messages from backend
    try {
      const patientId = localStorage.getItem('patientId');
      const response = await apiService.fetchData(`/appointment-messages?patient_id=${patientId}&appointment_id=${appointment.id}`);
      setChatMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load appointment chat messages:', error);
      setChatMessages([]);
    }
  };

  const closeChat = () => {
    setActiveTicket(null);
    setChatMessages([]);
    setChatMessage('');
  };

  // Handle booking modal
  const handleBookAppointment = () => {
    // Login check disabled - users can book without login
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setAppointmentForm({
      chiefComplaint: '',
      symptoms: '',
      otherSymptoms: '',
      preferredDate: '',
      preferredTime: '',
      specialization: '',
      preferredSpecialist: '',
      consultationChannel: 'Platform Chat',
      hmoCompany: '',
      hmoMemberId: '',
      hmoExpirationDate: '',
      loaCode: '',
      eLOAFiles: []
    });
    setFormErrors({});
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // If specialization changes, clear the selected specialist
    if (name === 'specialization') {
      setAppointmentForm(prev => ({
        ...prev,
        [name]: value,
        preferredSpecialist: '' // Clear specialist when specialization changes
      }));
    } else {
      setAppointmentForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file upload for eLOA
  const handleELOAUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a valid file type. Please upload PDF, JPG, or JPEG files only.`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Please upload files smaller than 10MB.`);
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setAppointmentForm(prev => ({
      ...prev,
      eLOAFiles: [...prev.eLOAFiles, ...newFiles]
    }));
  };

  // Remove eLOA file
  const removeELOAFile = (fileId) => {
    setAppointmentForm(prev => ({
      ...prev,
      eLOAFiles: prev.eLOAFiles.filter(file => file.id !== fileId)
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!appointmentForm.chiefComplaint.trim()) {
      errors.chiefComplaint = 'Chief complaint is required';
    }
    if (!appointmentForm.symptoms.trim()) {
      errors.symptoms = 'Symptoms are required';
    }
    if (!appointmentForm.preferredDate) {
      errors.preferredDate = 'Preferred date is required';
    }
    if (!appointmentForm.preferredTime) {
      errors.preferredTime = 'Preferred time is required';
    }
    if (!appointmentForm.specialization) {
      errors.specialization = 'Please select a specialization';
    }
    if (!appointmentForm.preferredSpecialist) {
      errors.preferredSpecialist = 'Please select a specialist';
    }

    // Validate date is not in the past
    const selectedDate = new Date(appointmentForm.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.preferredDate = 'Please select a future date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', appointmentForm);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, creating appointment...');
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new appointment ticket with all form details
      const newAppointment = {
        title: `Consultation - ${appointmentForm.preferredSpecialist}`,
        status: "Pending",
        specialist: appointmentForm.preferredSpecialist,
        date: appointmentForm.preferredDate,
        time: appointmentForm.preferredTime,
        specialty: specialists.find(s => s.name === appointmentForm.preferredSpecialist)?.specialty || '',
        description: appointmentForm.chiefComplaint,
        consultationChannel: appointmentForm.consultationChannel,
        consultationType: 'Teleconsultation',
        medicalDetails: {
          chiefComplaint: appointmentForm.chiefComplaint,
          symptoms: appointmentForm.symptoms,
          otherSymptoms: appointmentForm.otherSymptoms
        },
        hmoDetails: {
          company: appointmentForm.hmoCompany,
          memberId: appointmentForm.hmoMemberId,
          expirationDate: appointmentForm.hmoExpirationDate,
          loaCode: appointmentForm.loaCode,
          eLOAFiles: appointmentForm.eLOAFiles
        },
        bookingMethod: 'Online',
        createdAt: new Date().toISOString()
      };

      // In a real app, you would POST this to your API
      // For now, we'll just refresh the appointments from API
      console.log('New appointment would be sent to API:', newAppointment);
      
      // Refresh appointments from API to get latest data
      loadAppointments();
      
      // Notify parent component to refresh appointments
      if (onAppointmentAdded) {
        console.log('Calling onAppointmentAdded callback');
        onAppointmentAdded();
      }
      
      // Show success message
      alert('Your appointment is being processed. The Date & Time selected are subject for approval based on the Specialist\'s availability.');
      
      // Close modal and reset form
      closeBookingModal();
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('There was an error creating your appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment
  const handlePayment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedAppointment(null);
    setPaymentMethod('');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success/failure
      const paymentSuccess = Math.random() > 0.2; // 80% success rate for demo
      
      if (paymentSuccess) {
        alert('Payment successful! You will receive a Payment Acknowledgement Receipt via email.');
        // Update appointment status to confirmed
        console.log('Payment successful for appointment:', selectedAppointment.id);
      } else {
        alert('Payment failed. Please try again or contact support.');
      }
      
      closePaymentModal();
    } catch (error) {
      console.error('Payment error:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="patient-page-content">
      <div className="patient-appointments-header">
        <div>
          <h2 className="patient-page-title">My Appointments</h2>
          <p className="patient-page-subtitle">Track your consultation requests and appointments</p>
        </div>
        <div className="patient-book-appointment">
          <HotlineBooking onAppointmentAdded={loadAppointments} />
          <button className="patient-book-btn" onClick={handleBookAppointment}>
            <FaCalendarPlus className="patient-book-icon" />
            Book New Appointment
          </button>
        </div>
      </div>
      
      <div className="patient-appointments-section">
        {appointments.length === 0 ? (
          <div className="patient-empty-state">
            <FaCalendarAlt className="patient-empty-icon" />
            <h3 className="patient-empty-title">No Appointments Yet</h3>
            <p className="patient-empty-message">
              You haven't booked any appointments yet. Use the buttons above to book your first consultation.
            </p>
          </div>
        ) : (
          appointments.map(appointment => (
            <div key={appointment.id} className={`patient-appointment-card ${getStatusColor(appointment.status)}`}>
              <div className="patient-appointment-left">
                <h3 className="patient-appointment-title">{appointment.title}</h3>
              </div>

              <div className="patient-appointment-middle">
                <div className="patient-appointment-details">
                  <span className="patient-appointment-doctor">{appointment.specialist}</span>
                  <span className="patient-appointment-specialty">{appointment.specialty}</span>
                  <span className="patient-appointment-date">{appointment.date} at {appointment.time}</span>
                  <p className="patient-appointment-description">{appointment.description}</p>
                </div>
              </div>

              <div className="patient-appointment-right">
                <div className="patient-appointment-status">
                  {getStatusIcon(appointment.status)}
                  <span className="patient-status-text">{appointment.status}</span>
                </div>
                <div className="patient-appointment-actions">
                  {appointment.status === 'Active' && (
                    <button 
                      className="patient-chat-btn"
                      onClick={() => openChat(appointment)}
                    >
                      <FaComments className="patient-action-icon" />
                      Chat
                    </button>
                  )}
                  {appointment.status === 'For Payment' && (
                    <button 
                      className="patient-payment-btn"
                      onClick={() => handlePayment(appointment)}
                    >
                      <FaCreditCard className="patient-action-icon" />
                      Pay
                    </button>
                  )}
                  <button 
                    className="patient-view-details-btn"
                    onClick={() => handleViewAppointmentDetails(appointment)}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Modal for Active Appointments */}
      {activeTicket && (
        <div className="patient-chat-modal-overlay" onClick={closeChat}>
          <div className="patient-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patient-chat-header">
              <div className="patient-chat-ticket-info">
                <h3 className="patient-chat-ticket-title">{activeTicket.title}</h3>
                <p className="patient-chat-ticket-specialist">{activeTicket.specialist}</p>
              </div>
              <button className="patient-chat-close-btn" onClick={closeChat}>
                <FaTimes />
              </button>
            </div>

            <div className="patient-chat-messages">
              {chatMessages.map(message => (
                <div key={message.id} className={`patient-message ${message.sender === 'patient' ? 'patient-message-patient' : 'patient-message-nurse'}`}>
                  <div className="patient-message-content">
                    <p className="patient-message-text">{message.text}</p>
                    <span className="patient-message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="patient-document-upload">
              <div className="patient-upload-header">
                <h4 className="patient-upload-title">Upload Documents</h4>
                <p className="patient-upload-subtitle">Share files with your specialist</p>
              </div>
              
              <div className="patient-file-upload-area">
                <input
                  type="file"
                  id="patient-file-upload"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="patient-file-upload" className="patient-file-label">
                  <FaUpload className="patient-upload-icon" />
                  <span className="patient-upload-text">Choose files to upload</span>
                  <span className="patient-upload-hint">PDF, DOC, JPG, PNG up to 10MB</span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="patient-uploaded-files">
                  <h5 className="patient-files-title">Uploaded Files:</h5>
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="patient-file-item">
                      <FaFileAlt className="patient-file-icon" />
                      <div className="patient-file-info">
                        <span className="patient-file-name">{file.name}</span>
                        <span className="patient-file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button 
                        className="patient-file-remove"
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form className="patient-chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <div className="patient-chat-input-container">
                <input
                  type="text"
                  className="patient-chat-input"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" className="patient-chat-send-btn">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {showBookingModal && (
        <div className="patient-booking-modal-overlay" onClick={closeBookingModal}>
          <div className="patient-booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patient-booking-header">
              <h2 className="patient-booking-title">Book New Appointment</h2>
              <button className="patient-booking-close" onClick={closeBookingModal}>
                <FaTimes />
              </button>
            </div>

            <form className="patient-booking-form" onSubmit={handleFormSubmit}>
              <div className="patient-booking-content">
                {/* Consultation Type */}
                <div className="patient-form-section">
                  <h3 className="patient-section-title">Type of Consultation</h3>
                  <div className="patient-consultation-type">
                    <span className="patient-consultation-label">Teleconsultation</span>
                    <span className="patient-consultation-note">(Default Service)</span>
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="patient-form-group">
                  <label className="patient-form-label" htmlFor="chiefComplaint">
                    Chief Complaint *
                  </label>
                  <textarea
                    id="chiefComplaint"
                    name="chiefComplaint"
                    className={`patient-form-textarea ${formErrors.chiefComplaint ? 'patient-form-error' : ''}`}
                    value={appointmentForm.chiefComplaint}
                    onChange={handleFormChange}
                    placeholder="Describe your main concern or reason for consultation"
                    rows="3"
                    required
                  />
                  {formErrors.chiefComplaint && (
                    <span className="patient-error-message">{formErrors.chiefComplaint}</span>
                  )}
                </div>

                {/* Symptoms */}
                <div className="patient-form-group">
                  <label className="patient-form-label" htmlFor="symptoms">
                    Symptoms *
                  </label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    className={`patient-form-textarea ${formErrors.symptoms ? 'patient-form-error' : ''}`}
                    value={appointmentForm.symptoms}
                    onChange={handleFormChange}
                    placeholder="Describe your symptoms in detail"
                    rows="3"
                    required
                  />
                  {formErrors.symptoms && (
                    <span className="patient-error-message">{formErrors.symptoms}</span>
                  )}
                </div>

                {/* Other Symptoms */}
                <div className="patient-form-group">
                  <label className="patient-form-label" htmlFor="otherSymptoms">
                    Other Symptoms
                  </label>
                  <textarea
                    id="otherSymptoms"
                    name="otherSymptoms"
                    className="patient-form-textarea"
                    value={appointmentForm.otherSymptoms}
                    onChange={handleFormChange}
                    placeholder="Any additional symptoms or concerns"
                    rows="2"
                  />
                </div>

                {/* Date and Time */}
                <div className="patient-form-row">
                  <div className="patient-form-group patient-form-half">
                    <label className="patient-form-label" htmlFor="preferredDate">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      className={`patient-form-input ${formErrors.preferredDate ? 'patient-form-error' : ''}`}
                      value={appointmentForm.preferredDate}
                      onChange={handleFormChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {formErrors.preferredDate && (
                      <span className="patient-error-message">{formErrors.preferredDate}</span>
                    )}
                  </div>

                  <div className="patient-form-group patient-form-half">
                    <label className="patient-form-label" htmlFor="preferredTime">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      id="preferredTime"
                      name="preferredTime"
                      className={`patient-form-input ${formErrors.preferredTime ? 'patient-form-error' : ''}`}
                      value={appointmentForm.preferredTime}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.preferredTime && (
                      <span className="patient-error-message">{formErrors.preferredTime}</span>
                    )}
                  </div>
                </div>

                {/* Specialization Selection */}
                <div className="patient-form-group">
                  <label className="patient-form-label" htmlFor="specialization">
                    Medical Specialization *
                  </label>
                  <select
                    id="specialization"
                    name="specialization"
                    className={`patient-form-select ${formErrors.specialization ? 'patient-form-error' : ''}`}
                    value={appointmentForm.specialization}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select a specialization</option>
                    {specializations.map(specialization => (
                      <option key={specialization} value={specialization}>
                        {specialization}
                      </option>
                    ))}
                  </select>
                  {formErrors.specialization && (
                    <span className="patient-error-message">{formErrors.specialization}</span>
                  )}
                </div>

                {/* Preferred Specialist */}
                <div className="patient-form-group">
                  <label className="patient-form-label" htmlFor="preferredSpecialist">
                    Preferred Specialist *
                  </label>
                  <select
                    id="preferredSpecialist"
                    name="preferredSpecialist"
                    className={`patient-form-select ${formErrors.preferredSpecialist ? 'patient-form-error' : ''}`}
                    value={appointmentForm.preferredSpecialist}
                    onChange={handleFormChange}
                    disabled={!appointmentForm.specialization}
                    required
                  >
                    <option value="">
                      {appointmentForm.specialization ? 'Select a specialist' : 'Please select a specialization first'}
                    </option>
                    {availableSpecialists.map(specialist => (
                      <option key={specialist.id} value={specialist.name}>
                        {specialist.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.preferredSpecialist && (
                    <span className="patient-error-message">{formErrors.preferredSpecialist}</span>
                  )}
                </div>

                {/* Consultation Channel */}
                <div className="patient-form-group">
                  <label className="patient-form-label">Consultation Channel *</label>
                  <div className="patient-consultation-channels">
                    {consultationChannels.map(channel => (
                      <label key={channel.value} className="patient-channel-option">
                        <input
                          type="radio"
                          name="consultationChannel"
                          value={channel.value}
                          checked={appointmentForm.consultationChannel === channel.value}
                          onChange={handleFormChange}
                          className="patient-channel-radio"
                        />
                        <span className="patient-channel-icon">{channel.icon}</span>
                        <span className="patient-channel-label">{channel.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* HMO Section */}
                <div className="patient-form-section">
                  <h3 className="patient-section-title">HMO Information (Optional)</h3>
                  
                  <div className="patient-form-row">
                    <div className="patient-form-group patient-form-half">
                      <label className="patient-form-label" htmlFor="hmoCompany">
                        HMO Company
                      </label>
                      <input
                        type="text"
                        id="hmoCompany"
                        name="hmoCompany"
                        className="patient-form-input"
                        value={appointmentForm.hmoCompany}
                        onChange={handleFormChange}
                        placeholder="Enter HMO company name"
                      />
                    </div>

                    <div className="patient-form-group patient-form-half">
                      <label className="patient-form-label" htmlFor="hmoMemberId">
                        HMO Member ID
                      </label>
                      <input
                        type="text"
                        id="hmoMemberId"
                        name="hmoMemberId"
                        className="patient-form-input"
                        value={appointmentForm.hmoMemberId}
                        onChange={handleFormChange}
                        placeholder="Enter member ID"
                      />
                    </div>
                  </div>

                  <div className="patient-form-row">
                    <div className="patient-form-group patient-form-half">
                      <label className="patient-form-label" htmlFor="hmoExpirationDate">
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        id="hmoExpirationDate"
                        name="hmoExpirationDate"
                        className="patient-form-input"
                        value={appointmentForm.hmoExpirationDate}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="patient-form-group patient-form-half">
                      <label className="patient-form-label" htmlFor="loaCode">
                        LOA Code
                      </label>
                      <input
                        type="text"
                        id="loaCode"
                        name="loaCode"
                        className="patient-form-input"
                        value={appointmentForm.loaCode}
                        onChange={handleFormChange}
                        placeholder="Enter LOA code"
                      />
                    </div>
                  </div>

                  {/* eLOA File Upload */}
                  <div className="patient-form-group">
                    <label className="patient-form-label">eLOA File Upload</label>
                    <div className="patient-file-upload-area">
                      <input
                        type="file"
                        id="patient-eloaupload"
                        multiple
                        accept=".pdf,.jpg,.jpeg"
                        onChange={handleELOAUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="patient-eloaupload" className="patient-file-upload-label">
                        <FaUpload className="patient-upload-icon" />
                        <span className="patient-upload-text">Choose eLOA files</span>
                        <span className="patient-upload-hint">PDF, JPG, JPEG up to 10MB each</span>
                      </label>
                    </div>

                    {appointmentForm.eLOAFiles.length > 0 && (
                      <div className="patient-uploaded-files">
                        {appointmentForm.eLOAFiles.map(file => (
                          <div key={file.id} className="patient-file-item">
                            {file.type === 'application/pdf' ? (
                              <FaFilePdf className="patient-file-icon patient-file-pdf" />
                            ) : (
                              <FaImage className="patient-file-icon patient-file-image" />
                            )}
                            <div className="patient-file-info">
                              <span className="patient-file-name">{file.name}</span>
                              <span className="patient-file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                              type="button"
                              className="patient-file-remove"
                              onClick={() => removeELOAFile(file.id)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="patient-booking-actions">
                <button
                  type="button"
                  className="patient-booking-cancel"
                  onClick={closeBookingModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="patient-booking-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedAppointment && (
        <div className="patient-booking-modal-overlay" onClick={closePaymentModal}>
          <div className="patient-booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patient-booking-header">
              <h2 className="patient-booking-title">Payment</h2>
              <button className="patient-booking-close" onClick={closePaymentModal}>
                <FaTimes />
              </button>
            </div>

            <form className="patient-booking-form" onSubmit={handlePaymentSubmit}>
              <div className="patient-booking-content">
                <div className="patient-payment-info">
                  <h3 className="patient-section-title">Appointment Details</h3>
                  <div className="patient-payment-details">
                    <p><strong>Specialist:</strong> {selectedAppointment.specialist}</p>
                    <p><strong>Date:</strong> {selectedAppointment.date}</p>
                    <p><strong>Time:</strong> {selectedAppointment.time}</p>
                    <p><strong>Consultation Fee:</strong> ₱500.00</p>
                  </div>
                </div>

                <div className="patient-form-group">
                  <label className="patient-form-label">Select Payment Method *</label>
                  <div className="patient-payment-methods">
                    {paymentMethods.map(method => (
                      <label key={method.value} className="patient-payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="patient-payment-radio"
                        />
                        <span className="patient-payment-icon">{method.icon}</span>
                        <span className="patient-payment-label">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="patient-payment-note">
                  <FaExclamationTriangle className="patient-warning-icon" />
                  <p>You will be redirected to the selected payment gateway to complete your transaction securely.</p>
                </div>
              </div>

              <div className="patient-booking-actions">
                <button
                  type="button"
                  className="patient-booking-cancel"
                  onClick={closePaymentModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="patient-booking-submit"
                  disabled={isSubmitting || !paymentMethod}
                >
                  {isSubmitting ? (
                    <>
                      <FaClock className="patient-spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="patient-appointment-details-overlay">
          <div className="patient-appointment-details-modal">
            <div className="patient-appointment-details-header">
              <h2>Appointment Details</h2>
              <button 
                className="patient-appointment-details-close"
                onClick={closeAppointmentDetails}
              >
                <FaTimes />
              </button>
            </div>
            <div className="patient-appointment-details-content">
              <div className="patient-appointment-details-section">
                <h3 className="patient-appointment-details-title">Appointment Information</h3>
                <div className="patient-appointment-details-grid">
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Title:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.title}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Status:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.status}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Specialist:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.specialist}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Specialty:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.specialty}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Date:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.date}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Time:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.time}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Consultation Type:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.consultationType}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Consultation Channel:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.consultationChannel}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">Booking Method:</span>
                    <span className="patient-appointment-details-value">{selectedAppointment.bookingMethod}</span>
                  </div>
                </div>
              </div>

              {selectedAppointment.medicalDetails && (
                <div className="patient-appointment-details-section">
                  <h3 className="patient-appointment-details-title">Medical Information</h3>
                  <div className="patient-appointment-details-grid">
                    <div className="patient-appointment-details-item">
                      <span className="patient-appointment-details-label">Chief Complaint:</span>
                      <span className="patient-appointment-details-value">{selectedAppointment.medicalDetails.chiefComplaint || 'General Consultation'}</span>
                    </div>
                    <div className="patient-appointment-details-item">
                      <span className="patient-appointment-details-label">Symptoms:</span>
                      <span className="patient-appointment-details-value">{selectedAppointment.medicalDetails.symptoms || 'Not specified'}</span>
                    </div>
                    <div className="patient-appointment-details-item">
                      <span className="patient-appointment-details-label">Other Symptoms:</span>
                      <span className="patient-appointment-details-value">{selectedAppointment.medicalDetails.otherSymptoms || 'None'}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedAppointment.hmoDetails && (
                <div className="patient-appointment-details-section">
                  <h3 className="patient-appointment-details-title">HMO Information</h3>
                  <div className="patient-appointment-details-grid">
                    <div className="patient-appointment-details-item">
                      <span className="patient-appointment-details-label">HMO Company:</span>
                      <span className="patient-appointment-details-value">{selectedAppointment.hmoDetails.company || 'Not specified'}</span>
                    </div>
                    <div className="patient-appointment-details-item">
                      <span className="patient-appointment-details-label">Member ID:</span>
                      <span className="patient-appointment-details-value">{selectedAppointment.hmoDetails.memberId || 'Not specified'}</span>
                    </div>
                    <div className="patient-appointment-details-item">
                      <span className="patient-appointment-details-label">Expiration Date:</span>
                      <span className="patient-appointment-details-value">{selectedAppointment.hmoDetails.expirationDate || 'Not specified'}</span>
                    </div>
                    <div className="patient-appointment-details-item">
                      <span className="patient-appointment-details-label">LOA Code:</span>
                      <span className="patient-appointment-details-value">{selectedAppointment.hmoDetails.loaCode || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;