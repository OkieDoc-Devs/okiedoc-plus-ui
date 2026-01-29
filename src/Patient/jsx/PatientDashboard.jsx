import React, { useState, useEffect } from 'react';
import { logoutPatient } from "../services/auth";
import { useNavigate } from 'react-router';
import MedicalRecords from './MedicalRecords';
import Appointments from './Appointments';
import Messages from './Messages';
import '../css/PatientDashboard.css';
import LabResults from './LabResults';
import Billing from './Billing';
import MyAccount from './MyAccount';
import ConsultationHistory from './ConsultationHistory';
import appointmentService from '../services/appointmentService';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaFileMedicalAlt, 
  FaFlask, 
  FaReceipt, 
  FaSignOutAlt, 
  FaUser, 
  FaPills, 
  FaFileAlt,
  FaHistory,
  FaClock,
  FaCheckCircle,
  FaCreditCard,
  FaUserCheck,
  FaPlay,
  FaComments,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaUpload,
  FaBars,
  FaTimes as FaClose,
  FaBell,
  FaChevronRight,
  FaCalendarPlus,
  FaFileInvoice
} from 'react-icons/fa';

const PatientDashboard = () => {
  // State Management
  const [globalId, setGlobalId] = useState("");
  const [activePage, setActivePage] = useState('home');
  const [profileImage, setProfileImage] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [homeAppointments, setHomeAppointments] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileProfileModal, setShowMobileProfileModal] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'patient@okiedoc.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
    address: '123 Main Street, City, State 12345',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+1 (555) 987-6543'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (currentUser.globalId) setGlobalId(currentUser.globalId);
  }, []);

  useEffect(() => {
    loadHomeAppointments();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.body.classList.add('patient-dashboard-active');
    return () => document.body.classList.remove('patient-dashboard-active');
  }, []);

  // Helper Functions
  const loadHomeAppointments = () => {
    appointmentService.initializeDummyTickets();
    const savedAppointments = appointmentService.getAllAppointments();
    setHomeAppointments(savedAppointments);
  };

  const refreshAppointments = () => {
    loadHomeAppointments();
  };

  const openChat = (appointment) => {
    setActiveTicket(appointment);
    setChatMessages([
      {
        id: 1,
        sender: 'nurse',
        message: `Hello! I'm here to assist you with your ${appointment.title} appointment.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'text'
      }
    ]);
  };

  const closeChat = () => {
    setActiveTicket(null);
    setChatMessages([]);
    setNewMessage('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeTicket) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'patient',
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'text'
      }]);
      setNewMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLogout = async () => {
    try {
      await logoutPatient();
      localStorage.removeItem("currentUser");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const closeAppointmentDetails = () => {
    setShowAppointmentDetails(false);
    setSelectedAppointment(null);
  };

  // Render Methods
  const renderHomePage = () => (
    <div className="patient-home-page">
      {/* Quick Actions */}
      <section className="patient-quick-actions">
        <h2 className="patient-section-title">What would you like to do?</h2>
        <div className="patient-action-cards-grid">
          <button className="patient-action-card" onClick={() => setActivePage('appointments')}>
            <FaCalendarPlus className="patient-action-card-icon" />
            <h3>Book Appointment</h3>
            <p>Schedule with a specialist</p>
          </button>
          <button className="patient-action-card" onClick={() => setActivePage('messages')}>
            <FaComments className="patient-action-card-icon" />
            <h3>Messages</h3>
            <p>Chat with your team</p>
          </button>
          <button className="patient-action-card" onClick={() => setActivePage('medical-records')}>
            <FaFileInvoice className="patient-action-card-icon" />
            <h3>Medical Records</h3>
            <p>View your documents</p>
          </button>
          <button className="patient-action-card" onClick={() => setActivePage('lab-results')}>
            <FaFlask className="patient-action-card-icon" />
            <h3>Lab Results</h3>
            <p>Check your tests</p>
          </button>
        </div>
      </section>

      {/* Upcoming Appointments */}
      <section className="patient-appointments-section">
        <div className="patient-section-header">
          <h2 className="patient-section-title">Upcoming Appointments</h2>
          <button className="patient-view-all-btn" onClick={() => setActivePage('appointments')}>
            View All →
          </button>
        </div>

        <div className="patient-appointments-container">
          {homeAppointments.length === 0 ? (
            <div className="patient-empty-state">
              <FaCalendarAlt className="patient-empty-icon" />
              <h3>No Appointments Scheduled</h3>
              <p>You haven't booked any appointments yet. Schedule one now!</p>
              <button className="patient-empty-cta-btn" onClick={() => setActivePage('appointments')}>
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="patient-appointments-list">
              {homeAppointments.map(appointment => (
                <div key={appointment.id} className={`patient-appointment-card patient-status-${appointment.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="patient-appointment-card-header">
                    <div className="patient-appointment-left">
                      <h3 className="patient-appointment-title">{appointment.title}</h3>
                      <span className={`patient-status-badge patient-status-${appointment.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="patient-appointment-actions">
                      {appointment.status === 'Active' && (
                        <button className="patient-action-btn patient-chat-btn" onClick={() => openChat(appointment)} title="Chat">
                          <FaComments />
                        </button>
                      )}
                      <button className="patient-action-btn patient-details-btn" onClick={() => handleViewAppointmentDetails(appointment)} title="View">
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                  <div className="patient-appointment-card-body">
                    <div className="patient-appointment-detail">
                      <span className="patient-detail-label">Doctor:</span>
                      <span className="patient-detail-value">{appointment.specialist}</span>
                    </div>
                    <div className="patient-appointment-detail">
                      <span className="patient-detail-label">Date & Time:</span>
                      <span className="patient-detail-value">{appointment.date} • {appointment.time || '10:00 AM'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Health Summary */}
      <div className="patient-health-summary-grid">
        <section className="patient-card patient-lab-card">
          <div className="patient-card-header">
            <h2 className="patient-section-title">Recent Lab Results</h2>
            <button className="patient-view-link" onClick={() => setActivePage('lab-results')}>View All</button>
          </div>
          <div className="patient-lab-items">
            {[
              { name: 'Complete Blood Count', date: '04/20/2025', status: 'Pending' },
              { name: 'Chest X-Ray', date: '04/20/2025', status: 'Available' }
            ].map((item, idx) => (
              <div key={idx} className="patient-lab-item">
                <div className="patient-lab-icon"><FaFileAlt /></div>
                <div className="patient-lab-info">
                  <span className="patient-lab-name">{item.name}</span>
                  <span className="patient-lab-date">{item.date}</span>
                </div>
                <span className={`patient-result-badge patient-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="patient-card patient-medications-card">
          <div className="patient-card-header">
            <h2 className="patient-section-title">Current Medications</h2>
            <button className="patient-view-link">View All</button>
          </div>
          <div className="patient-medication-items">
            {[
              { name: 'Metformin', dosage: '500 mg • Twice daily' },
              { name: 'Atorvastatin', dosage: '40 mg • Once daily' }
            ].map((med, idx) => (
              <div key={idx} className="patient-medication-item">
                <div className="patient-med-icon"><FaPills /></div>
                <div className="patient-med-info">
                  <span className="patient-med-name">{med.name}</span>
                  <span className="patient-med-dosage">{med.dosage}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return renderHomePage();
      case 'appointments':
        return <Appointments onAppointmentAdded={refreshAppointments} />;
      case 'messages':
        return <Messages />;
      case 'medical-records':
        return <MedicalRecords />;
      case 'lab-results':
        return <LabResults />;
      case 'billing':
        return <Billing />;
      case 'my-account':
        return (
          <MyAccount 
            profileImage={profileImage} 
            setProfileImage={setProfileImage}
            profileData={profileData}
            setProfileData={setProfileData}
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            isEditing={isEditingProfile}
            setIsEditing={setIsEditingProfile}
            activeTab={activeProfileTab}
            setActiveTab={setActiveProfileTab}
          />
        );
      case 'consultation-history':
        return <ConsultationHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="patient-dashboard">
      {/* Sidebar */}
      <aside className="patient-sidebar">
        <div className="patient-sidebar-header">
          <div className="patient-logo">
            <img src="/okie-doc-logo.png" alt="OkieDoc+" className="patient-logo-image" />
            <span className="patient-logo-text">OkieDoc+</span>
          </div>
        </div>

        <nav className="patient-nav-menu">
          {[
            { id: 'home', label: 'Home', icon: FaHome },
            { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
            { id: 'messages', label: 'Messages', icon: FaEnvelope },
            { id: 'medical-records', label: 'Medical Records', icon: FaFileMedicalAlt },
            { id: 'lab-results', label: 'Lab Results', icon: FaFlask },
            { id: 'billing', label: 'Billing', icon: FaReceipt },
            { id: 'consultation-history', label: 'History', icon: FaHistory }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`patient-nav-item ${activePage === id ? 'patient-active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              <Icon className="patient-nav-icon" />
              <span className="patient-nav-text">{label}</span>
            </button>
          ))}
        </nav>

        <div className="patient-sidebar-footer">
          <button className="patient-profile-btn" onClick={() => setActivePage('my-account')}>
            <div className="patient-profile-avatar-small">
              {profileImage ? <img src={profileImage} alt="Profile" /> : <FaUser />}
            </div>
            <div className="patient-profile-info-small">
              <span className="patient-profile-name-small">{profileData.firstName}</span>
              <span className="patient-profile-email-small">{profileData.email}</span>
            </div>
          </button>
          <button className="patient-logout-btn" onClick={handleLogout} title="Sign Out">
            <FaSignOutAlt />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="patient-main-content">
        <header className="patient-top-header">
          <div className="patient-header-content">
            <h1 className="patient-page-title">Welcome back, {profileData.firstName}!</h1>
            <p className="patient-header-subtitle">Manage your health and appointments</p>
          </div>
          <button className="patient-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <FaBars />
          </button>
        </header>

        <div className="patient-content-wrapper">
          {renderPage()}
        </div>
      </main>

      {/* Chat Modal */}
      {activeTicket && (
        <div className="patient-chat-modal-overlay" onClick={closeChat}>
          <div className="patient-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patient-chat-header">
              <div className="patient-chat-ticket-info">
                <h3>{activeTicket.title}</h3>
                <p>{activeTicket.specialist}</p>
              </div>
              <button className="patient-chat-close-btn" onClick={closeChat}><FaTimes /></button>
            </div>

            <div className="patient-chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`patient-message ${message.sender === 'patient' ? 'patient-message-patient' : 'patient-message-nurse'}`}>
                  <div className="patient-message-content">
                    <p className="patient-message-text">{message.message}</p>
                    <span className="patient-message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <form className="patient-chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="patient-chat-input"
              />
              <button type="submit" className="patient-chat-send-btn">Send</button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="patient-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="patient-mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="patient-mobile-header">
              <img src="/okie-doc-logo.png" alt="OkieDoc+" />
              <button onClick={() => setIsMobileMenuOpen(false)}><FaClose /></button>
            </div>
            <nav className="patient-mobile-nav">
              {[
                { id: 'home', label: 'Home', icon: FaHome },
                { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
                { id: 'messages', label: 'Messages', icon: FaEnvelope },
                { id: 'medical-records', label: 'Medical Records', icon: FaFileMedicalAlt },
                { id: 'lab-results', label: 'Lab Results', icon: FaFlask },
                { id: 'billing', label: 'Billing', icon: FaReceipt }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`patient-mobile-nav-item ${activePage === id ? 'active' : ''}`}
                  onClick={() => { setActivePage(id); setIsMobileMenuOpen(false); }}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
              <button className="patient-mobile-logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="patient-appointment-details-overlay">
          <div className="patient-appointment-details-modal">
            <div className="patient-appointment-details-header">
              <h2>Appointment Details</h2>
              <button onClick={closeAppointmentDetails}><FaTimes /></button>
            </div>
            <div className="patient-appointment-details-content">
              <div className="patient-appointment-details-section">
                <h3>Patient Information</h3>
                <div className="patient-appointment-details-grid">
                  <div><span>Name:</span> <span>{profileData.firstName} {profileData.lastName}</span></div>
                  <div><span>Email:</span> <span>{profileData.email}</span></div>
                  <div><span>Phone:</span> <span>{profileData.phone}</span></div>
                </div>
              </div>
              <div className="patient-appointment-details-section">
                <h3>Appointment Details</h3>
                <div className="patient-appointment-details-grid">
                  <div><span>Date:</span> <span>{selectedAppointment.date}</span></div>
                  <div><span>Time:</span> <span>{selectedAppointment.time}</span></div>
                  <div><span>Doctor:</span> <span>{selectedAppointment.specialist}</span></div>
                  <div><span>Status:</span> <span>{selectedAppointment.status}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
