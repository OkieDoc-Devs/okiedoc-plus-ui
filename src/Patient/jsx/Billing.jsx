import React from 'react';
import { FaDollarSign, FaCreditCard, FaFileInvoiceDollar } from 'react-icons/fa';

const Billing = () => {
  return (
    <div className="patient-page-content">
      <h2>Billing</h2>
      <div className="patient-billing-section">
        <div className="patient-billing-card">
          <h3>Current Balance</h3>
          <div className="patient-balance-amount">
            <FaDollarSign className="patient-balance-icon" />
            $150.00
          </div>
          <button className="patient-pay-now-btn">
            <FaCreditCard className="patient-pay-icon" />
            Pay Now
          </button>
        </div>
        
        <div className="patient-billing-card">
          <h3>Recent Bills</h3>
          <div className="patient-bill-item">
            <FaFileInvoiceDollar className="patient-bill-icon" />
            <div className="patient-bill-info">
              <span className="patient-bill-description">Cardiology Consultation</span>
              <span className="patient-bill-date">April 15, 2024</span>
            </div>
            <span className="patient-bill-amount">$75.00</span>
            <span className="patient-bill-status patient-paid">Paid</span>
          </div>
          <div className="patient-bill-item">
            <FaFileInvoiceDollar className="patient-bill-icon" />
            <div className="patient-bill-info">
              <span className="patient-bill-description">Lab Tests</span>
              <span className="patient-bill-date">April 10, 2024</span>
            </div>
            <span className="patient-bill-amount">$50.00</span>
            <span className="patient-bill-status patient-pending">Pending</span>
          </div>
          <div className="patient-bill-item">
            <FaFileInvoiceDollar className="patient-bill-icon" />
            <div className="patient-bill-info">
              <span className="patient-bill-description">General Medicine Visit</span>
              <span className="patient-bill-date">March 20, 2024</span>
            </div>
            <span className="patient-bill-amount">$25.00</span>
            <span className="patient-bill-status patient-paid">Paid</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
