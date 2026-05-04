import React, { useState, useEffect } from "react";
import {
  IconFileInvoice,
  IconCheck,
  IconDownload,
  IconLock,
  IconCalendarEvent,
  IconShieldCheck,
  IconCreditCard,
  IconUser,
} from "@tabler/icons-react";
import { payTicket } from "../services/apiService";
import { generatePostConsultationBillingPDF } from "../../Nurse/services/invoiceService"; // I'm borrowing this for now @Muji
import "../css/Patient_InvoiceModal.css";

export default function Patient_InvoiceModal({ isOpen, onClose, ticketData }) {
  const [viewState, setViewState] = useState("invoice");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (
        ticketData?.paymentStatus === "paid" ||
        ticketData?.paymentStatus === "HMO Verified"
      ) {
        setViewState("success");
      } else {
        setViewState("invoice");
      }
      setIsProcessing(false);
    }
  }, [isOpen, ticketData]);

  const handlePayNow = () => {
    setViewState("redirecting");
    setIsProcessing(true);

    setTimeout(() => {
      const targetTicketId = ticketData?.id;

      payTicket(targetTicketId)
        .then(() => {
          setViewState("success");
        })
        .catch((err) => {
          console.error("Payment failed to register in DB:", err);
          alert("Payment failed to process. Please try again.");
          setViewState("invoice");
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }, 2000);
  };

  const handleDownloadInvoice = async () => {
    try {
      const billingPayload = {
        patientName: "",
        ticketId: data.invoiceNumber,
        consultationType: data.specialty,
        assignedDoctor: data.doctorName,
        paymentType: "Online Gateway",
        paymentStatus: ticketData?.paymentStatus || "unpaid",

        baseConsultationFee: data.doctorFee,

        customServices: [
          ...(data.processingFee > 0
            ? [{ label: "Processing Fee", amount: data.processingFee }]
            : []),
          ...(data.convenienceFee > 0
            ? [{ label: "Convenience Fee", amount: data.convenienceFee }]
            : []),
          ...(data.discountAmount > 0
            ? [{ label: "Discount", amount: -data.discountAmount }]
            : []), // Note the negative sign
        ],

        // Subtotal and Final Total
        subtotal: data.doctorFee + data.processingFee + data.convenienceFee,
        finalTotal: data.amountDue,
      };

      await generatePostConsultationBillingPDF(billingPayload);
    } catch (error) {
      console.error("Failed to generate invoice PDF:", error);
      alert("Failed to download the PDF. Please try again.");
    }
  };

  if (!isOpen) return null;

  const data = {
    doctorName: ticketData?.specialistName || "Unassigned Provider",
    specialty: ticketData?.targetSpecialty || "General Medicine",
    consultationDate: ticketData?.preferredDate
      ? new Date(ticketData.preferredDate).toLocaleDateString()
      : new Date().toLocaleDateString(),
    invoiceNumber:
      ticketData?.xenditInvoiceId ||
      (ticketData?.ticketNumber
        ? `INV-${ticketData.ticketNumber}`
        : "INV-PENDING"),

    doctorFee: ticketData?.doctorFee || 0,
    processingFee: ticketData?.processingFee || 0,
    convenienceFee: ticketData?.convenienceFee || 0,
    discountAmount: ticketData?.discountAmount || 0,
    amountDue: ticketData?.totalAmount || 0,
  };

  return (
    <div className="patient-invoice-modal-overlay">
      <div className={`patient-invoice-modal-content ${viewState}`}>
        {viewState !== "redirecting" && (
          <button className="invoice-close-btn" onClick={onClose}>
            ×
          </button>
        )}

        {/* --- VIEW 1: INVOICE --- */}
        {viewState === "invoice" && (
          <>
            <div className="invoice-header-banner">
              <div className="invoice-header-left">
                <div className="invoice-icon-wrap">
                  <IconFileInvoice size={24} color="#0d9488" />
                </div>
                <div>
                  <div className="invoice-title-group">
                    <h2 className="invoice-title-text">Invoice</h2>
                    {ticketData?.paymentStatus === "unpaid" && (
                      <span className="invoice-badge-unpaid">Unpaid</span>
                    )}
                  </div>
                  <p className="invoice-ref-text">{data.invoiceNumber}</p>
                </div>
              </div>
              <div className="invoice-header-right">
                <p className="invoice-total-label">Total Amount Due</p>
                <h3 className="invoice-total-value">₱{data.amountDue}</h3>
              </div>
            </div>

            <div className="invoice-meta-info">
              <div className="invoice-meta-row">
                <IconUser size={16} />
                <span>
                  {data.doctorName} - {data.specialty}
                </span>
              </div>
              <div className="invoice-meta-row">
                <IconCalendarEvent size={16} />
                <span>Consultation Date: {data.consultationDate}</span>
              </div>
            </div>

            {/* DYNAMIC BILLING BREAKDOWN */}
            <div className="invoice-body">
              <h4 className="invoice-breakdown-header">
                <IconCreditCard size={18} /> Billing Breakdown
              </h4>

              <div className="invoice-fee-container">
                {/* Doctor Fee */}
                <div className="invoice-fee-row">
                  <div>
                    <p className="invoice-fee-label">Consultation Fee</p>
                    <p className="invoice-fee-sublabel">{data.specialty}</p>
                  </div>
                  <div className="invoice-fee-value">₱{data.doctorFee}</div>
                </div>

                {/* Processing Fee */}
                {data.processingFee > 0 && (
                  <div className="invoice-fee-row">
                    <div>
                      <p className="invoice-fee-label">Processing Fee</p>
                    </div>
                    <div className="invoice-fee-value">
                      ₱{data.processingFee}
                    </div>
                  </div>
                )}

                {/* Convenience Fee */}
                {data.convenienceFee > 0 && (
                  <div className="invoice-fee-row">
                    <div>
                      <p className="invoice-fee-label">Convenience Fee</p>
                    </div>
                    <div className="invoice-fee-value">
                      ₱{data.convenienceFee}
                    </div>
                  </div>
                )}

                {/* Discount */}
                {data.discountAmount > 0 && (
                  <div className="invoice-fee-row">
                    <div>
                      <p className="invoice-discount-label">Discount</p>
                    </div>
                    <div className="invoice-discount-value">
                      -₱{data.discountAmount}
                    </div>
                  </div>
                )}
              </div>

              <div className="invoice-total-container">
                <div className="invoice-grand-total-row">
                  <span>Amount Due</span>
                  <span>₱{data.amountDue}</span>
                </div>
              </div>
            </div>

            <div className="invoice-button-group">
              <button className="invoice-btn-primary" onClick={handlePayNow}>
                <IconCreditCard size={18} /> Pay Now - ₱{data.amountDue}
              </button>
              <button
                className="invoice-btn-outline"
                onClick={handleDownloadInvoice}
              >
                <IconDownload size={18} /> Download Invoice PDF
              </button>
            </div>
          </>
        )}

        {/* --- VIEW 2: REDIRECTING (LOADING LINE) --- */}
        {viewState === "redirecting" && (
          <div className="redirect-container">
            <h2 className="redirect-title">Redirecting to Payment Gateway</h2>
            <p className="redirect-desc">
              Please wait while we securely redirect you to our payment
              partner...
            </p>

            <div className="redirect-loader-bg">
              <div className="redirect-loader-bar" />
            </div>

            <div className="redirect-summary-box">
              <p className="redirect-summary-label">Amount to Pay</p>
              <h3 className="redirect-summary-value">₱{data.amountDue}</h3>
              <p className="redirect-summary-ref">
                Invoice: {data.invoiceNumber}
              </p>
            </div>

            <div className="redirect-secure-info">
              <span className="redirect-secure-item">
                <IconShieldCheck size={16} /> Secure Payment Gateway
              </span>
              <span className="redirect-secure-item">
                <IconLock size={16} /> 256-bit SSL Encryption
              </span>
            </div>

            <p className="redirect-warning">
              You will be redirected to a secure payment page. Do not close this
              window.
            </p>
          </div>
        )}

        {/* --- VIEW 3: SUCCESS (RECEIPT) --- */}
        {viewState === "success" && (
          <div className="success-container">
            <div className="success-header">
              <div className="success-icon-box">
                <IconCheck size={32} />
              </div>
              <h2 className="success-title">Payment Successful!</h2>
              <p className="success-desc">
                Your payment has been processed successfully
              </p>
            </div>

            <div className="success-receipt-box">
              <div className="success-receipt-row-total">
                <span className="success-receipt-label">Amount Paid</span>
                <strong className="success-receipt-value">
                  ₱{data.amountDue}
                </strong>
              </div>
              <div className="success-receipt-row">
                <span className="success-receipt-label">Invoice Number</span>
                <strong className="success-receipt-value">
                  {data.invoiceNumber}
                </strong>
              </div>
              <div className="success-receipt-row">
                <span className="success-receipt-label">Payment Date</span>
                <strong className="success-receipt-value">
                  {new Date().toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div className="success-docs-section">
              <h4 className="success-docs-title">Your Documents Are Ready</h4>
              <div className="success-docs-list">
                <div className="success-doc-card">
                  <div className="success-doc-info">
                    <IconFileInvoice color="#0ea5e9" size={24} />
                    <div>
                      <p className="success-doc-name">Medical Certificate</p>
                      <p className="success-doc-type">Sick leave</p>
                    </div>
                  </div>
                  <button
                    className="success-btn-download"
                    onClick={() =>
                      handleDownloadDocument("Medical Certificate")
                    }
                  >
                    Download
                  </button>
                </div>

                <div className="success-doc-card">
                  <div className="success-doc-info">
                    <IconFileInvoice color="#0ea5e9" size={24} />
                    <div>
                      <p className="success-doc-name">Medical Clearance</p>
                      <p className="success-doc-type">Fitness to work</p>
                    </div>
                  </div>
                  <button
                    className="success-btn-download"
                    onClick={() => handleDownloadDocument("Medical Clearance")}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>

            <div className="success-footer">
              <button className="success-btn-return" onClick={onClose}>
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
