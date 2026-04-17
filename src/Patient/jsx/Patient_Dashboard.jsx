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
  IconUser,
  IconUserPlus,
  IconLink,
  IconCreditCard,
} from "@tabler/icons-react";
import "../css/Patient_Dashboard.css";
import { useModal } from "../contexts/Modals";

export default function Dashboard_Patient({ setActive }) {
  const { openDiyModal } = useModal();

  return (
    <div className="pd-container">
      {/* --- HERO SECTION --- */}
      <section className="pd-hero">
        <h2 className="pd-hero-title">Good afternoon, Sarah!</h2>
        <p className="pd-hero-subtitle">How can we help you today?</p>

        <div className="pd-hero-grid">
          <button
            className="pd-hero-card"
            onClick={() => setActive("Services")}
          >
            <div className="pd-hero-icon pd-icon-video">
              <IconVideo size={24} />
            </div>
            <div className="pd-hero-text">
              <h4>Connect a Call</h4>
              <p>Video or Call with a doctor</p>
            </div>
          </button>

          <button
            className="pd-hero-card"
            onClick={() => setActive("MedicalRecords")}
          >
            <div className="pd-hero-icon pd-icon-records">
              <IconFileDescription size={24} />
            </div>
            <div className="pd-hero-text">
              <h4>Medical Records</h4>
              <p>View your health history</p>
            </div>
          </button>

          <button
            className="pd-hero-card"
            onClick={() => setActive("Services")}
          >
            <div className="pd-hero-icon pd-icon-message">
              <IconMessage size={24} />
            </div>
            <div className="pd-hero-text">
              <h4>Message</h4>
              <p>Chat with your care team</p>
            </div>
          </button>
        </div>
      </section>

      {/* --- NEXT APPOINTMENT --- */}
      <div className="pd-card pd-mb-32">
        <div className="pd-appt-header">
          <span className="pd-badge pd-badge-primary">TODAY</span>
          <span className="pd-text-light pd-text-sm">Next Appointment</span>
        </div>

        <div className="pd-appt-body">
          <div>
            <h3 className="pd-appt-doctor">Dr. Sarah Johnson</h3>
            <p className="pd-text-light pd-text-sm pd-mb-12">Family Medicine</p>
            <div className="pd-appt-details">
              <span className="pd-appt-time">
                <IconCalendarEvent size={16} /> 2:30 PM
              </span>
              <span className="pd-appt-type">
                <IconVideo size={16} /> Video Consultation
              </span>
            </div>
          </div>
          <button
            className="pd-btn pd-btn-primary"
            onClick={() => openDiyModal("Join Video Call")}
          >
            Join Video Call
          </button>
        </div>
      </div>

      {/* --- ACTION REQUIRED --- */}
      <div className="pd-section-header">
        <div className="pd-section-title">
          <IconAlertCircle className="pd-text-warning" size={20} />
          <h4>Action Required</h4>
        </div>
        <button
          className="pd-btn-view-all"
          onClick={() => setActive("MedicalRecords")}
        >
          View All <IconArrowRight size={14} />
        </button>
      </div>

      <div className="pd-action-list">
        {/* 1. Specialist Referral Card */}
        <div className="pd-card pd-warning-card">
          <div className="pd-warning-content">
            <div className="pd-warning-info">
              <h5>Specialist Referral - Orthopedic Surgeon</h5>
              <p className="pd-text-light pd-text-sm pd-mb-8">
                Referred by Dr. Sofia Lim (Cardiologist)
              </p>

              <div className="pd-info-row">
                <IconUser size={16} className="pd-text-light" />
                <span className="pd-text-sm">
                  <strong>Reason:</strong> Knee pain after exercise
                </span>
              </div>
              <div className="pd-info-row">
                <IconCalendarEvent size={16} className="pd-text-light" />
                <span className="pd-text-sm">
                  Referral Date: February 10, 2026
                </span>
              </div>
            </div>

            <div className="pd-warning-actions">
              <div className="pd-warning-actions-top">
                <span className="pd-badge pd-badge-warning">Pending</span>
                <button
                  className="pd-btn pd-btn-warning"
                  onClick={() => setActive("Services")}
                >
                  <IconUserPlus size={16} /> Book Appointment
                </button>
              </div>
              <button
                className="pd-btn pd-btn-outline pd-w-full pd-mt-8"
                onClick={() => openDiyModal("View Details")}
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* 2. Pending Payment Card */}
        <div className="pd-card pd-warning-card">
          <div className="pd-warning-content">
            <div className="pd-warning-info">
              <h5>Consultation with Dr. Maria Santos</h5>
              <p className="pd-text-light pd-text-sm pd-mb-8">
                Consultation Date: March 28, 2026
              </p>

              <div className="pd-info-row">
                <IconLink size={16} className="pd-text-light" />
                <span className="pd-text-sm">
                  <strong>Medical Certificate:</strong> $350 (unpaid)
                </span>
              </div>
              <div className="pd-info-row">
                <IconLink size={16} className="pd-text-light" />
                <span className="pd-text-sm">
                  <strong>Medical Clearance:</strong> $450 (unpaid)
                </span>
              </div>
            </div>

            <div className="pd-warning-actions">
              <div className="pd-warning-actions-top">
                <span className="pd-badge pd-badge-warning">Pending</span>
                <button
                  className="pd-btn pd-btn-warning"
                  onClick={() => openDiyModal("Billing")}
                >
                  <IconCreditCard size={16} /> Pay Now
                </button>
              </div>
              <button
                className="pd-btn pd-btn-outline pd-w-full pd-mt-8"
                onClick={() => openDiyModal("View Invoice")}
              >
                View Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- HEALTH OVERVIEW --- */}
      <h4 className="pd-mb-12">Health Overview</h4>
      <div className="pd-overview-grid">
        <div className="pd-card pd-overview-item">
          <div className="pd-overview-icon pd-bg-light-primary pd-text-primary">
            <IconPill size={24} />
          </div>
          <h2>3</h2>
          <p className="pd-text-light pd-text-sm">Active Medications</p>
        </div>

        <div className="pd-card pd-overview-item">
          <div className="pd-overview-icon pd-bg-light-primary pd-text-primary">
            <IconCalendarEvent size={24} />
          </div>
          <h2>2</h2>
          <p className="pd-text-light pd-text-sm">Upcoming Appointments</p>
        </div>

        <div className="pd-card pd-overview-item pd-relative">
          <span className="pd-badge pd-badge-warning pd-badge-new">New</span>
          <div className="pd-overview-icon pd-bg-light-primary pd-text-primary">
            <IconActivity size={24} />
          </div>
          <h2>1 New</h2>
          <p className="pd-text-light pd-text-sm">Lab Results</p>
        </div>
      </div>

      {/* --- BOTTOM GRID --- */}
      <div className="pd-bottom-grid">
        {/* Prescriptions */}
        <div className="pd-column">
          <div className="pd-section-header">
            <h4>Prescriptions</h4>
            <button
              className="pd-btn-view-all"
              onClick={() => openDiyModal("Presciptions")}
            >
              View All <IconArrowRight size={14} />
            </button>
          </div>

          <div className="pd-column-list">
            {/* APPLIED THE WARNING CARD CLASS HERE SO IT GETS THE GRADIENT AND BORDER */}
            <div className="pd-card pd-warning-card pd-rx-card">
              <div className="pd-rx-header">
                <h5>Lisinopril</h5>
                <span className="pd-badge pd-badge-warning">DUE SOON</span>
              </div>
              <p className="pd-text-light pd-text-sm pd-mb-16">10mg</p>
              <div className="pd-rx-footer">
                <p className="pd-text-light pd-text-sm">Refill in 5 days</p>
                <button
                  className="pd-btn pd-btn-warning"
                  onClick={() => openDiyModal("Prescriptions")}
                >
                  Refill Now
                </button>
              </div>
            </div>

            <div className="pd-card pd-rx-card">
              <div className="pd-rx-header">
                <h5>Metformin</h5>
              </div>
              <p className="pd-text-light pd-text-sm pd-mb-16">500mg</p>
              <div className="pd-rx-footer">
                <p className="pd-text-light pd-text-sm">Refill in 30 days</p>
                <button
                  className="pd-btn pd-btn-outline-primary"
                  onClick={() => openDiyModal("Prescriptions")}
                >
                  Refill Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="pd-column">
          <div className="pd-section-header">
            <h4>Quick Access</h4>
          </div>

          <div className="pd-column-list">
            <button
              className="pd-quick-access-btn"
              onClick={() => setActive("MedicalRecords")}
            >
              <div className="pd-qa-icon pd-bg-light-blue pd-text-blue">
                <IconFileDescription size={20} />
              </div>
              <div className="pd-qa-text">
                <strong>Medical Records</strong>
                <p>View your health history</p>
              </div>
              <IconArrowRight size={16} className="pd-text-light" />
            </button>

            <button
              className="pd-quick-access-btn"
              onClick={() => openDiyModal("Physical Therapy")}
            >
              <div className="pd-qa-icon pd-bg-light-teal pd-text-teal">
                <IconActivity size={20} />
              </div>
              <div className="pd-qa-text">
                <strong>Physical Therapy</strong>
                <p>Track your progress</p>
              </div>
              <IconArrowRight size={16} className="pd-text-light" />
            </button>

            <button
              className="pd-quick-access-btn"
              onClick={() => openDiyModal("OkieDoc+ OTC Store")}
            >
              <div className="pd-qa-icon pd-bg-light-warning pd-text-warning">
                <IconPill size={20} />
              </div>
              <div className="pd-qa-text">
                <strong>Pharmacy Orders</strong>
                <p>Manage deliveries</p>
              </div>
              <IconArrowRight size={16} className="pd-text-light" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
