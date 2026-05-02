import React, { useState, useEffect } from "react";
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
import Patient_InvoiceModal from "../components/Patient_InvoiceModal";
import { fetchPatientActiveTickets } from "../services/apiService";

export default function Dashboard_Patient({ setActive }) {
  const { openDiyModal } = useModal();
  const [invoiceTicket, setInvoiceTicket] = useState(null);

  // State to hold the REAL tickets from your MySQL database
  const [unpaidTickets, setUnpaidTickets] = useState([]);

  const loadTickets = async () => {
    try {
      const response = await fetchPatientActiveTickets();
      const tickets = Array.isArray(response)
        ? response
        : response?.data || response?.activeTickets || response?.tickets || [];

      const pendingPayment = tickets.filter(
        (t) => t.paymentStatus === "unpaid" || t.status === "for_payment",
      );
      setUnpaidTickets(pendingPayment);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="pd-container">
      {/* --- HERO SECTION --- */}
      <section className="pd-hero">
        <h2 className="pd-hero-title">Good evening, Sarah!</h2>
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
        {/* 1. Static Specialist Referral Card */}
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

        {/* --- PAYMENT CARDS --- */}
        {unpaidTickets.map((ticket) => (
          <div className="pd-card pd-warning-card" key={ticket.id}>
            <div className="pd-warning-content">
              <div className="pd-warning-info">
                <h5>
                  Consultation with {ticket.targetSpecialty || "Specialist"}
                </h5>
                <p className="pd-text-light pd-text-sm pd-mb-8">
                  Ticket Reference: {ticket.ticketNumber}
                </p>

                <div className="pd-info-row">
                  <IconLink size={16} className="pd-text-light" />
                  <span className="pd-text-sm">
                    <strong>Payment Required:</strong> ₱
                    {ticket.totalAmount || 850}
                  </span>
                </div>
              </div>

              <div className="pd-warning-actions">
                <div className="pd-warning-actions-top">
                  <span className="pd-badge pd-badge-warning">Pending</span>
                  <button
                    className="pd-btn pd-btn-warning"
                    onClick={() => setInvoiceTicket(ticket)} // Passes the REAL ticket to the modal!
                  >
                    <IconCreditCard size={16} /> Pay Now
                  </button>
                </div>
                <button
                  className="pd-btn pd-btn-outline pd-w-full pd-mt-8"
                  onClick={() => setInvoiceTicket(ticket)}
                >
                  View Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
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

      <Patient_InvoiceModal
        isOpen={!!invoiceTicket}
        ticketData={invoiceTicket}
        onClose={() => {
          setInvoiceTicket(null);
          loadTickets();
        }}
      />
    </div>
  );
}
