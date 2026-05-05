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
  IconX,
} from "@tabler/icons-react";
import "../css/Patient_Dashboard.css";
import { useModal } from "../contexts/Modals";
import {
  RedirectModal,
  InvoiceView,
  PaymentSuccess,
  PaymentFailure,
} from "../components/PaymentComponents";
import * as apiService from "../services/apiService";
import usePaymentFlow from "../hooks/usePaymentFlow";

export default function Dashboard_Patient({ setActive }) {
  const payment = usePaymentFlow();
  const { openDiyModal } = useModal();

  const [unpaidTickets, setUnpaidTickets] = useState([]);

  const loadTickets = async () => {
    try {
      const response = await apiService.fetchPatientActiveTickets();
      const tickets = Array.isArray(response)
        ? response
        : response?.data || response?.activeTickets || response?.tickets || [];

      const pendingPayment = tickets.filter((t) => t.status === "for_payment");
      setUnpaidTickets(pendingPayment);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
                    {ticket.totalAmount > 0 ? ticket.totalAmount : 850}
                  </span>
                </div>
              </div>

              <div className="pd-warning-actions">
                <div className="pd-warning-actions-top">
                  <span className="pd-badge pd-badge-warning">Pending</span>
                  <button
                    className="pd-btn pd-btn-warning"
                    onClick={() => payment.openPayment(ticket)}
                  >
                    <IconCreditCard size={16} /> Pay Now
                  </button>
                </div>
                <button
                  className="pd-btn pd-btn-outline pd-w-full pd-mt-8"
                  onClick={() => payment.openPayment(ticket)}
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

      {/* Payment Orchestrator Overlay */}
      {payment.ticket && (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-100 to-sky-50 flex items-start justify-center py-10 px-4 overflow-y-auto">
          <div className="relative w-full max-w-md">
            <button
              className="absolute -top-10 right-0 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              onClick={() => {
                payment.closePayment();
                loadTickets();
              }}
            >
              <IconX size={24} />
            </button>

            <div className="mt-2">
              {payment.isVerifying && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                  <p className="text-lg font-medium">Verifying payment...</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Checking your transaction status with the payment gateway.
                  </p>
                </div>
              )}
              {!payment.isVerifying && payment.view === "invoice" && (
                <InvoiceView
                  invoice={payment.invoiceData}
                  onPay={payment.initiatePayment}
                />
              )}
              {!payment.isVerifying && payment.view === "success" && (
                <PaymentSuccess
                  amount={payment.ticket.totalAmount}
                  invoice={`INV-${payment.ticket.ticketNumber}`}
                  paymentDate={new Date().toLocaleString()}
                  documents={[]}
                  onViewInvoice={() => payment.openPayment(payment.ticket)}
                  onBackToHistory={() => {
                    payment.closePayment();
                    loadTickets();
                  }}
                />
              )}
              {!payment.isVerifying && payment.view === "failure" && (
                <PaymentFailure
                  amount={payment.ticket.totalAmount}
                  invoice={`INV-${payment.ticket.ticketNumber}`}
                  onRetry={payment.initiatePayment}
                  onCancel={() => payment.openPayment(payment.ticket)}
                />
              )}
            </div>

            {!payment.isVerifying && payment.showModal && (
              <RedirectModal
                amount={`₱${payment.ticket.totalAmount}`}
                invoice={`INV-${payment.ticket.ticketNumber}`}
                onCancel={payment.cancelRedirect}
                onComplete={payment.completeRedirect}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
