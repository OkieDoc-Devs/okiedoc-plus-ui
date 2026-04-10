import {
  IconVideo,
  IconPhone,
  IconFileDescription,
  IconMessage,
  IconCalendarEvent,
  IconAlertCircle,
  IconPill,
  IconActivity,
  IconArrowRight,
} from "@tabler/icons-react";
import "../css/Patient_Dashboard.css";

export default function Dashboard_Patient({ setActive }) {
  const handleDIY = (action) => alert(`DIY Action: ${action}`);

  return (
    <div className="dashboard-container">
      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <h2 className="hero-title">Good afternoon, Sarah 👋</h2>
        <p className="hero-subtitle">How can we help you today?</p>

        <div className="hero-grid">
          <button className="hero-card" onClick={() => setActive("Services")}>
            <div className="hero-icon-box bg-cyan">
              <IconVideo size={24} />
            </div>
            <div className="hero-card-text">
              <h4>Connect a Call</h4>
              <p>Video or Call with a doctor</p>
            </div>
          </button>

          <button
            className="hero-card"
            onClick={() => setActive("Medical Records")}
          >
            <div className="hero-icon-box bg-teal">
              <IconFileDescription size={24} />
            </div>
            <div className="hero-card-text">
              <h4>Medical Records</h4>
              <p>View your health history</p>
            </div>
          </button>

          <button className="hero-card" onClick={() => setActive("Services")}>
            <div className="hero-icon-box bg-blue">
              <IconMessage size={24} />
            </div>
            <div className="hero-card-text">
              <h4>Message</h4>
              <p>Chat with your care team</p>
            </div>
          </button>
        </div>
      </section>

      {/* --- NEXT APPOINTMENT --- */}
      <div className="dash-card appointment-card">
        <div className="appointment-header">
          <div className="badge-group">
            <span className="badge badge-cyan">TODAY</span>
            <span className="text-muted text-sm">Next Appointment</span>
          </div>
        </div>

        <div className="appointment-body">
          <div className="appointment-info">
            <h3>Dr. Sarah Johnson</h3>
            <p className="text-muted text-sm spec-text">Family Medicine</p>
            <div className="appointment-time-details">
              <span className="time-item text-cyan">
                <IconCalendarEvent size={16} /> 2:30 PM
              </span>
              <span className="time-item text-muted">
                <IconVideo size={16} className="text-cyan" /> Video Consultation
              </span>
            </div>
          </div>
          <button
            className="patientdashboard-btn patientdashboard-btn-cyan"
            onClick={() => handleDIY("Join Call")}
          >
            Join Video Call
          </button>
        </div>
      </div>

      {/* --- ACTION REQUIRED --- */}
      <div className="section-header">
        <div className="patientdashboard-section-title">
          <IconAlertCircle color="#e67e22" size={20} />
          <h4>Action Required</h4>
        </div>
        <button className="patientdashboard-btn-link">
          View All <IconArrowRight size={14} />
        </button>
      </div>

      <div className="pending-list">
        <div className="dash-card pending-card">
          <div className="pending-content">
            <div className="pending-details">
              <h5>Specialist Referral - Orthopedic Surgeon</h5>
              <p className="text-muted text-sm referrer-text">
                Referred by Dr. Sofia Lim (Cardiologist)
              </p>
              <p className="text-sm">
                <strong>Reason:</strong> Knee pain after exercise
              </p>
            </div>
            <div className="pending-actions">
              <span className="badge badge-orange">PENDING</span>
              <button
                className="patientdashboard-btn patientdashboard-btn-orange"
                onClick={() => setActive("Services")}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- HEALTH OVERVIEW --- */}
      <h4 className="section-heading">Health Overview</h4>
      <div className="overview-grid">
        <div className="dash-card overview-card">
          <div className="icon-circle bg-light-cyan text-cyan">
            <IconPill size={24} />
          </div>
          <h2>3</h2>
          <p className="text-muted text-sm">Active Medications</p>
        </div>

        <div className="dash-card overview-card">
          <div className="icon-circle bg-light-cyan text-cyan">
            <IconCalendarEvent size={24} />
          </div>
          <h2>2</h2>
          <p className="text-muted text-sm">Upcoming Appointments</p>
        </div>

        <div className="dash-card overview-card relative">
          <span className="badge badge-orange new-badge">New</span>
          <div className="icon-circle bg-light-cyan text-cyan">
            <IconActivity size={24} />
          </div>
          <h2>1 New</h2>
          <p className="text-muted text-sm">Lab Results</p>
        </div>
      </div>

      {/* --- BOTTOM GRID --- */}
      <div className="bottom-grid">
        {/* Left: Prescriptions */}
        <div className="grid-column">
          <div className="section-header">
            <h4>Prescriptions</h4>
            <button
              className="patientdashboard-btn-link"
              onClick={() => setActive("Prescriptions")}
            >
              View All <IconArrowRight size={14} />
            </button>
          </div>

          <div className="patient-prescription-list">
            <div className="dash-card prescription-card">
              <div className="prescription-header">
                <h5>Lisinopril</h5>
                <span className="badge badge-orange">DUE SOON</span>
              </div>
              <p className="text-muted text-sm dose-text">10mg</p>
              <div className="prescription-actions">
                <p className="text-muted text-sm">Refill in 5 days</p>
                <button
                  className="patientdashboard-btn-outline-cyan patientdashboard-btn-sm"
                  onClick={() => handleDIY("Refill")}
                >
                  Refill Now
                </button>
              </div>
            </div>

            <div className="dash-card prescription-card">
              <div className="prescription-header">
                <h5>Metformin</h5>
              </div>
              <p className="text-muted text-sm dose-text">500mg</p>
              <div className="prescription-actions">
                <p className="text-muted text-sm">Refill in 30 days</p>
                <button
                  className="patientdashboard-btn-outline-cyan patientdashboard-btn-sm"
                  onClick={() => handleDIY("Refill")}
                >
                  Refill Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Access */}
        <div className="grid-column">
          <div className="section-header">
            <h4>Quick Access</h4>
          </div>

          <div className="quick-access-list">
            <button
              className="quick-access-patientdashboard-btn"
              onClick={() => setActive("MedicalRecords")}
            >
              <div className="icon-square bg-light-blue text-blue">
                <IconFileDescription size={20} />
              </div>
              <div className="qa-text">
                <strong>Medical Records</strong>
                <p>View your health history</p>
              </div>
              <IconArrowRight size={16} className="text-muted" />
            </button>

            <button
              className="quick-access-patientdashboard-btn"
              onClick={() => handleDIY("PT")}
            >
              <div className="icon-square bg-light-teal text-teal">
                <IconActivity size={20} />
              </div>
              <div className="qa-text">
                <strong>Physical Therapy</strong>
                <p>Track your progress</p>
              </div>
              <IconArrowRight size={16} className="text-muted" />
            </button>

            <button
              className="quick-access-patientdashboard-btn"
              onClick={() => handleDIY("Pharmacy")}
            >
              <div className="icon-square bg-light-orange text-orange">
                <IconPill size={20} />
              </div>
              <div className="qa-text">
                <strong>Pharmacy Orders</strong>
                <p>Manage deliveries</p>
              </div>
              <IconArrowRight size={16} className="text-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
