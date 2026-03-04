import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { fetchBillingTickets, payBillingTicket } from '../services/billingService';
import { FaCreditCard, FaFileInvoiceDollar, FaDownload, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { FaPesoSign } from 'react-icons/fa6';
import '../css/Billing.css';

const Billing = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paidTicket, setPaidTicket] = useState(null);
  const location = useLocation();
  const highlightedAppointmentId = location.state?.appointmentId;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const userId = currentUser?.id;
        if (userId) {
          const data = await fetchBillingTickets(userId);
          setTickets(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch billing info:", err);
        setError("Failed to load billing information.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePay = async (ticketId) => {
    try {
      await payBillingTicket(ticketId);
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: 'Completed' } : ticket
        )
      );
      const ticket = tickets.find((t) => t.id === ticketId);
      setPaidTicket(ticket);
      setShowModal(true);
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment processing failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="patient-loading-state">
        <div className="patient-loading-spinner"></div>
        <h3 className="patient-loading-title">Loading Billing Information...</h3>
      </div>
    );
  }

  if (error) return <div className="error-state"><p>{error}</p></div>;

  return (
    <div className="patient-page-content">
      <h2>Post Consultation Billing</h2>

      <div className="patient-billing-section">
        {/* Balance Overview */}
        <div className="patient-billing-card">
          <h3>Current Balance</h3>
          <div className="patient-balance-amount">
            <FaPesoSign className="patient-balance-icon" />
            {tickets
              .filter((t) => t.status === 'For Payment')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </div>
        </div>

        {/* Post Consultation Requests */}
        <div className="patient-billing-card">
          <h3>Additional Requests</h3>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`patient-bill-item ${ticket.appointmentId === highlightedAppointmentId ? 'highlighted' : ''}`}
                id={`bill-${ticket.id}`}
              >
                <FaFileInvoiceDollar className="patient-bill-icon" />
                <div className="patient-bill-info">
                  <span className="patient-bill-description">{ticket.service}</span>
                  <span className="patient-bill-date">Requested Today</span>
                </div>
                <span className="patient-bill-amount">P{ticket.amount}</span>
                <span className={`patient-bill-status ${ticket.status 
                      === 'Completed'
                      ? 'patient-paid'
                      : 'patient-pending'
                  }`}
                >
                  {ticket.status}
                </span>
                {ticket.status === 'For Payment' ? (
                  <button className="patient-pay-now-btn" onClick={() => handlePay(ticket.id)}>
                    <FaCreditCard className="patient-pay-icon" /> Pay Now </button>
                ) : (
                  <button className="patient-download-btn">
                    <FaDownload /> Download </button>
                )}
              </div>
            ))
          ) : (<p>No additional requests found.</p>)}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && paidTicket && (
        <div className="patient-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="patient-modal-content patient-confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <FaCheckCircle className="patient-confirm-icon" />
            <h3>Payment Confirmed!</h3>
            <p>Please check your email to find your{' '}
              <strong>“{paidTicket.service} receipt”</strong>.
            </p>

            {/* Open Gmail button */}
            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="patient-open-gmail-btn">
              <FaEnvelope className="patient-btn-icon" /> Open Mail </a>

            <button className="patient-close-modal-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;