import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../Components/EmptyState";
import {
  downloadTreatmentPlanPDF,
  downloadPrescriptionPDF,
  downloadLabRequestPDF,
  downloadMedicalCertificatePDF,
  sendToEmail,
} from "./pdfHelpers";
import "./ConsultationHistory.css";

const ITEMS_PER_PAGE = 10;

const ConsultationHistory = ({ consultations = [] }) => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  const normalizedConsultations = useMemo(() => {
    return consultations.map(c => ({
      ...c,
      status: c.status || "Completed"
    }));
  }, [consultations]);

  // Helper to determine status badge class
  const getStatusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "confirmed":
      case "completed":
      case "done":
        return "ch-status-completed";
      case "pending":
        return "ch-status-pending";
      case "processing":
        return "ch-status-processing";
      case "cancelled":
        return "ch-status-cancelled";
      default:
        return "ch-status-default";
    }
  };

  const filteredConsultations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return normalizedConsultations.filter(
      (c) =>
        (c.patientName?.toLowerCase().includes(q) || false) ||
        (c.ticket?.toLowerCase().includes(q) || false) ||
        (c.specialistName?.toLowerCase().includes(q) || false) ||
        (c.status?.toLowerCase().includes(q) || false)
    );
  }, [normalizedConsultations, searchQuery]);

  const sortedConsultations = useMemo(() => {
    const sorted = [...filteredConsultations];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredConsultations, sortConfig]);

  const totalPages = Math.ceil(sortedConsultations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentConsultations = sortedConsultations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="tab-content active">
      <div className="consultation-history-container">
        <h1>Historical Ticket Table</h1>

        <div className="ch-toolbar">
          <input
            type="text"
            placeholder="Search by patient, ticket, specialist, or status..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="ch-search-input"
          />
        </div>

        <div className="ch-table-wrapper">
          <table className="ch-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("date")}>Date{getSortIndicator("date")}</th>
                <th onClick={() => requestSort("ticket")}>Ticket ID{getSortIndicator("ticket")}</th>
                <th onClick={() => requestSort("patientName")}>Patient Name{getSortIndicator("patientName")}</th>
                <th>Chief Complaint</th>
                <th onClick={() => requestSort("specialistName")}>Specialist{getSortIndicator("specialistName")}</th>
                <th onClick={() => requestSort("status")}>Status{getSortIndicator("status")}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentConsultations.length > 0 ? (
                currentConsultations.map((c, idx) => (
                  <tr key={c.id || idx}>
                    <td>{c.date || "—"}</td>
                    
                    {/* TICKET ID HYPERLINK */}
                    <td className="ch-ticket-id">
                      <Link 
                        to={`/admin/ticket/${c.ticket || c.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ticket-link"
                        style={{ color: '#0B5388', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        {c.ticket || c.id || "—"}
                      </Link>
                    </td>

                    <td>{c.patientName || "—"}</td>
                    <td>{c.chiefComplaint || "—"}</td>
                    <td>{c.specialistName || "Unassigned"}</td>
                    <td>
                      <span className={`ch-status-badge ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="ch-table-actions">
                        <button className="ch-action-btn view" onClick={() => setSelectedConsultation(c)}>View</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                    <EmptyState 
                      type="search" 
                      message="No Tickets Found" 
                      subMessage={searchQuery ? `No results found for "${searchQuery}"` : "There are no historical tickets available to display."}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="ch-pagination">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1}>{"<<"}</button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>{">"}</button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>{">>"}</button>
          </div>
        )}

        {selectedConsultation && (
          <div className="ch-modal-overlay" onClick={() => setSelectedConsultation(null)}>
            <div className="ch-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="ch-modal-header">
                <h2>Ticket Details</h2>
                <button onClick={() => setSelectedConsultation(null)} className="ch-modal-close-btn">✕</button>
              </div>
              <div className="ch-modal-body">
                <div className="ch-modal-section">
                  <h3>Patient & Ticket Info</h3>
                  <div className="ch-info-grid">
                    <p><strong>Ticket ID:</strong> {selectedConsultation.ticket || selectedConsultation.id}</p>
                    <p><strong>Status:</strong> <span className={`ch-status-badge ${getStatusBadgeClass(selectedConsultation.status)}`}>{selectedConsultation.status}</span></p>
                    <p><strong>Patient:</strong> {selectedConsultation.patientName}</p>
                    <p><strong>Date:</strong> {selectedConsultation.date}</p>
                    <p><strong>Assigned Specialist:</strong> {selectedConsultation.specialistName || "Unassigned"}</p>
                  </div>
                </div>

                <div className="ch-modal-section">
                  <h3>Medical Information</h3>
                  <p><strong>Chief Complaint:</strong> {selectedConsultation.chiefComplaint || "N/A"}</p>
                  <p><strong>Symptoms:</strong> {selectedConsultation.symptoms || "N/A"}</p>
                </div>

                <div className="ch-modal-section">
                  <h3>SOAP Notes</h3>
                  <ul className="ch-soap-list">
                    <li><strong>Subjective:</strong> {selectedConsultation.soap?.subjective || "N/A"}</li>
                    <li><strong>Objective:</strong> {selectedConsultation.soap?.objective || "N/A"}</li>
                    <li><strong>Assessment:</strong> {selectedConsultation.soap?.assessment || "N/A"}</li>
                    <li><strong>Plan:</strong> {selectedConsultation.soap?.plan || "N/A"}</li>
                  </ul>
                </div>

                <div className="ch-modal-section">
                  <h3>Actions</h3>
                  <div className="ch-modal-actions">
                    <button className="ch-modal-action-btn treatment" onClick={() => downloadTreatmentPlanPDF(selectedConsultation)}>Download Treatment Plan</button>
                    <button className="ch-modal-action-btn prescription" onClick={() => downloadPrescriptionPDF(selectedConsultation)}>Download Prescription</button>
                    <button className="ch-modal-action-btn lab" onClick={() => downloadLabRequestPDF(selectedConsultation)}>Download Lab Request</button>
                    <button className="ch-modal-action-btn certificate" onClick={() => downloadMedicalCertificatePDF(selectedConsultation)}>Download Medical Certificate</button>
                    <button className="ch-modal-action-btn email" onClick={() => sendToEmail(selectedConsultation)}>Send to Email</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationHistory;