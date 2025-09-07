import React, { useState } from 'react';
import { FaCreditCard, FaFileInvoiceDollar, FaDownload } from 'react-icons/fa';
import { FaPesoSign } from 'react-icons/fa6'

const Billing = () => {
  const [tickets, setTickets] = useState([
    { id: 1, service: 'Medical Certificate', amount: 300, status: 'For Payment' },
    { id: 2, service: 'Medical Clearance', amount: 1000, status: 'For Payment' },
  ]);

  const handlePay = (id) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status: 'Completed' } : ticket
      )
    );
    alert('Invoice email sent. Document download is now available.');
  };

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
          {tickets.some((t) => t.status === 'For Payment')}
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
              <span className="patient-bill-amount">₱{ticket.amount}</span>
              <span
                className={`patient-bill-status ${
                  ticket.status === 'Completed'
                    ? 'patient-paid'
                    : 'patient-pending'
                }`}
              >
                {ticket.status}
              </span>
              {ticket.status === 'For Payment' ? (
                <button
                  className="patient-pay-now-btn"
                  onClick={() => handlePay(ticket.id)}
                >
                  <FaCreditCard className="patient-pay-icon" />
                  Pay Now
                </button>
              ) : (
                <button className="patient-download-btn">
                  <FaDownload />
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Billing;
