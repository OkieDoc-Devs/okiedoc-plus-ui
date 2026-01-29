import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { logoutPatient } from "../services/auth";
import '../css/PatientDashboard.css';
import {
  FaHome,
  FaCalendarAlt,
  FaEnvelope,
  FaFileMedicalAlt,
  FaFlask,
  FaReceipt,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes as FaClose,
  FaHistory
} from 'react-icons/fa';

const PatientLayout = ({ children, pageTitle, pageSubtitle }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutPatient();
      localStorage.removeItem("currentUser");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="patient-dashboard">
      {/* Sidebar */}
      <aside className="patient-sidebar">
        <div className="patient-sidebar-header">
          <div className="patient-logo">
            <img src="/okie-doc-logo.png" alt="OkieDoc+" className="patient-logo-image" />
          </div>
        </div>

        <nav className="patient-nav-menu">
          {[
            { id: 'home', label: 'Home', icon: FaHome, path: '/patient/Dashboard' },
            { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt, path: '/patient/Appointments' },
            { id: 'messages', label: 'Messages', icon: FaEnvelope, path: '/patient/Messages' },
            { id: 'medical-records', label: 'Medical Records', icon: FaFileMedicalAlt, path: '/patient/Medical_Records' },
            { id: 'lab-results', label: 'Lab Results', icon: FaFlask, path: '/patient/Lab_Results' },
            { id: 'billing', label: 'Billing', icon: FaReceipt, path: '/patient/Billing' },
            { id: 'consultation-history', label: 'History', icon: FaHistory, path: '/patient/Consultation_History' }
          ].map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              className="patient-nav-item"
              onClick={() => navigate(path)}
            >
              <Icon className="patient-nav-icon" />
              <span className="patient-nav-text">{label}</span>
            </button>
          ))}
        </nav>

        <div className="patient-sidebar-footer">
          <button className="patient-profile-btn" onClick={() => navigate('/patient/Account')}>
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
            <h1 className="patient-page-title">{pageTitle}</h1>
            {pageSubtitle && <p className="patient-header-subtitle">{pageSubtitle}</p>}
          </div>
          <button className="patient-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <FaBars />
          </button>
        </header>

        <div className="patient-content-wrapper">
          {children}
        </div>
      </main>

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
                { id: 'home', label: 'Home', icon: FaHome, path: '/patient/Dashboard' },
                { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt, path: '/patient/Appointments' },
                { id: 'messages', label: 'Messages', icon: FaEnvelope, path: '/patient/Messages' },
                { id: 'medical-records', label: 'Medical Records', icon: FaFileMedicalAlt, path: '/patient/Medical_Records' },
                { id: 'lab-results', label: 'Lab Results', icon: FaFlask, path: '/patient/Lab_Results' },
                { id: 'billing', label: 'Billing', icon: FaReceipt, path: '/patient/Billing' }
              ].map(({ id, label, icon: Icon, path }) => (
                <button
                  key={id}
                  className="patient-mobile-nav-item"
                  onClick={() => { navigate(path); setIsMobileMenuOpen(false); }}
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
    </div>
  );
};

export default PatientLayout;
