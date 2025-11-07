import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaFileInvoiceDollar, FaDownload, FaCheckCircle, FaEnvelope, FaInbox } from 'react-icons/fa';
import { FaPesoSign } from 'react-icons/fa6'
import apiService from '../services/apiService';

const Billing = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const patientId = localStorage.getItem('patientId');
      const patientData = await apiService.getPatientData(patientId);
      setTickets(patientData.billings || []);
    } catch (error) {
      console.error('Failed to load billing data:', error);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [paidTicket, setPaidTicket] = useState(null);

  const handlePay = (id) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status: 'Completed' } : ticket
      )
    );
    const ticket = tickets.find((t) => t.id === id);
    setPaidTicket(ticket);
    setShowModal(true);
  };

  // Empty state component
  const EmptyState = () => (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1rem',
      color: '#666',
      gridColumn: '1 / -1'
    }}>
      <FaInbox style={{ fontSize: '4rem', color: '#ddd', marginBottom: '1rem' }} />
      <h3 style={{ color: '#999', marginBottom: '0.5rem' }}>No Billing Records</h3>
      <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
        Your billing information will appear here after consultations
      </p>
    </div>
  );

  return (
    <div className="patient-page-content">
      <h2>Post Consultation Billing</h2>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          Loading billing information...
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState />
      ) : (
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
            {tickets.map((ticket) => (
            <div key={ticket.id} className="patient-bill-item">
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
            ))}
          </div>
        </div>
      )}

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