import React, { useState, useMemo } from "react";
import {
  downloadTreatmentPlanPDF,
  downloadPrescriptionPDF,
  downloadLabRequestPDF,
  downloadMedicalCertificatePDF,
  sendToEmail,
} from "./pdfHelpers";
import "./ConsultationHistory.css"; // Import the new CSS file

const ITEMS_PER_PAGE = 10;

const ConsultationHistory = ({ consultations = [] }) => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  const filteredConsultations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return consultations.filter(
      (c) =>
        (c.patientName?.toLowerCase().includes(q) || false) ||
        (c.date?.toLowerCase().includes(q) || false) ||
        (c.chiefComplaint?.toLowerCase().includes(q) || false)
    );
  }, [consultations, searchQuery]);

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
        <h1>Consultation History</h1>

        <div className="ch-toolbar">
          <input
            type="text"
            placeholder="Search by patient, complaint, or date..."
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
                <th onClick={() => requestSort("ticket")}>Ticket #{getSortIndicator("ticket")}</th>
                <th onClick={() => requestSort("patientName")}>Patient Name{getSortIndicator("patientName")}</th>
                <th>Chief Complaint</th>
                <th onClick={() => requestSort("specialistName")}>Specialist Name{getSortIndicator("specialistName")}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentConsultations.length > 0 ? (
                currentConsultations.map((c, idx) => (
                  <tr key={c.id || idx}>
                    <td>{c.date || "—"}</td>
                    <td>{c.ticket || "—"}</td>
                    <td>{c.patientName || "—"}</td>
                    <td>{c.chiefComplaint || "—"}</td>
                    <td>{c.specialistName || "—"}</td>
                    <td>
                      <div className="ch-table-actions">
                        <button className="ch-action-btn view" onClick={() => setSelectedConsultation(c)}>View</button>
                        <button className="ch-action-btn edit" disabled>Edit</button>
                        <button className="ch-action-btn delete" disabled>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                    No consultations found.
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
                <h2>Consultation Details</h2>
                <button onClick={() => setSelectedConsultation(null)} className="ch-modal-close-btn">✕</button>
              </div>
              <div className="ch-modal-body">
                <div className="ch-modal-section">
                  <h3>Patient & Consultation Info</h3>
                  <div className="ch-info-grid">
                    <p><strong>Patient:</strong> {selectedConsultation.patientName}</p>
                    <p><strong>Date:</strong> {selectedConsultation.date}</p>
                    <p><strong>Ticket #:</strong> {selectedConsultation.ticket}</p>
                    <p><strong>Assigned Specialist:</strong> {selectedConsultation.assignedSpecialist}</p>
                    <p><strong>Assigned Nurse:</strong> {selectedConsultation.assignedNurse}</p>
                    <p><strong>Follow-up Date:</strong> {selectedConsultation.followUp}</p>
                    <p><strong>Referrals:</strong> {selectedConsultation.referrals}</p>
                  </div>
                </div>

                <div className="ch-modal-section">
                  <h3>Chief Complaint</h3>
                  <p>{selectedConsultation.chiefComplaint || "N/A"}</p>
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

                {selectedConsultation.medicinePrescription?.length > 0 && (
                  <div className="ch-modal-section">
                    <h3>Medicine Prescription</h3>
                    <table className="ch-detail-table">
                      <thead>
                        <tr><th>Brand</th><th>Generic</th><th>Dosage</th><th>Form</th><th>Qty</th><th>Instructions</th></tr>
                      </thead>
                      <tbody>
                        {selectedConsultation.medicinePrescription.map((med, idx) => (
                          <tr key={med.id || idx}>
                            <td>{med.brand}</td><td>{med.generic}</td><td>{med.dosage}</td><td>{med.form}</td><td>{med.quantity}</td><td>{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedConsultation.labRequests?.length > 0 && (
                  <div className="ch-modal-section">
                    <h3>Lab Requests</h3>
                    <table className="ch-detail-table">
                      <thead>
                        <tr><th>Lab Test</th><th>Remarks</th></tr>
                      </thead>
                      <tbody>
                        {selectedConsultation.labRequests.map((lab, idx) => (
                          <tr key={lab.id || idx}><td>{lab.test}</td><td>{lab.remarks}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="ch-modal-section">
                    <h3>Doctor's Note</h3>
                    <p>{selectedConsultation.doctorsNote?.remarks || "N/A"}</p>
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