import React, { useState, useEffect } from "react";
import { fetchPatientMedicalHistory } from "../services/apiService";
import {
  FaEye,
  FaDownload,
  FaShare,
  FaCheckCircle,
  FaTimesCircle,
  FaFilePdf,
  FaUserMd,
  FaUserNurse,
  FaStethoscope,
  FaPills,
  FaFlask,
  FaClipboardList,
  FaBell,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const ConsultationHistory = () => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchPatientMedicalHistory();
        if (data && data.history) {
          // Map backend history schema to local component state expectations
          const mappedHistory = data.history.map(t => ({
            id: t.ticketNumber,
            ticketNumber: t.ticketNumber,
            date: t.preferredDate
              ? new Date(t.preferredDate).toLocaleDateString()
              : t.visitDate
                ? new Date(t.visitDate).toLocaleDateString()
                : 'Unknown Date',
            time: t.preferredTime || (t.visitDate ? new Date(t.visitDate).toLocaleTimeString() : ''),
            specialist: t.specialistName,
            nurse: 'Assigned Nurse', // Can be enriched from backend later
            status: t.status === 'completed' ? 'Completed' : 'Incomplete',
            chiefComplaint: t.chiefComplaint,
            duration: 'Consultation ended',
            rating: null,
            rawRecord: t
          }));
          setConsultations(mappedHistory);
        } else {
          setConsultations([]);
        }
      } catch (err) {
        console.error("Failed to load medical history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Sample EMR data for consultation summary
  const getConsultationSummary = () => {
    return {
      medicalTeam: {
        assignedNurse: "Nurse Emily Davis",
        assignedSpecialist: "Dr. Sarah Johnson",
        specialistSpecialty: "Cardiology",
      },
      chiefComplaint: "Chest pain and shortness of breath",
      status: "Completed",
      medicalRecords: [
        "Previous ECG from 2023-12-20",
        "Blood pressure readings (last 3 months)",
        "Family history of heart disease",
      ],
      ros: {
        subjective:
          "Patient reports sharp chest pain lasting 2 hours, worsens with deep breathing",
        objective: "BP: 140/90, HR: 95 bpm, O2 Sat: 98%, No visible distress",
        assessment: "Possible angina, rule out myocardial infarction",
        plan: "ECG, cardiac enzymes, chest X-ray, cardiology follow-up",
      },
      medications: [
        { name: "Aspirin 81mg", dosage: "Once daily", duration: "30 days" },
        { name: "Metoprolol 25mg", dosage: "Twice daily", duration: "14 days" },
      ],
      laboratory: [
        { test: "Complete Blood Count", status: "Completed", result: "Normal" },
        {
          test: "Cardiac Enzymes",
          status: "Pending",
          result: "Awaiting results",
        },
        { test: "ECG", status: "Completed", result: "Normal sinus rhythm" },
      ],
      treatmentPlan: [
        "Continue current medications as prescribed",
        "Follow up in 2 weeks",
        "Lifestyle modifications: low-sodium diet, regular exercise",
        "Return if symptoms worsen",
      ],
    };
  };

  // Sample medical documents
  const getMedicalDocuments = () => {
    return {
      provided: [
        {
          name: "Prescription - Aspirin",
          type: "prescription",
          size: "245 KB",
        },
        {
          name: "Laboratory Request - CBC",
          type: "lab_request",
          size: "180 KB",
        },
        {
          name: "Treatment Plan - Cardiology",
          type: "treatment_plan",
          size: "320 KB",
        },
      ],
      requested: [
        {
          name: "Medical Certificate",
          type: "medical_certificate",
          price: "$25.00",
          status: "available",
        },
        {
          name: "Medical Clearance",
          type: "medical_clearance",
          price: "$35.00",
          status: "available",
        },
      ],
    };
  };

  const handleViewSummary = (consultation) => {
    setSelectedConsultation(consultation);
    setShowSummaryModal(true);
  };

  const handleDownloadDocument = (document) => {
    // Simulate document download
    // console.log(`Downloading ${document.name}`);
    alert(`Downloading ${document.name}...`);
  };

  const handleRequestDocument = (document) => {
    // Simulate document request with payment
    // console.log(`Requesting ${document.name} for ${document.price}`);
    alert(`Redirecting to payment for ${document.name} - ${document.price}`);
  };

  const handleShareRecords = (consultation) => {
    setSelectedConsultation(consultation);
    setShowShareModal(true);
  };

  const handleApproveSharing = (approvalId) => {
    setPendingApprovals((prev) =>
      prev.filter((approval) => approval.id !== approvalId)
    );
    alert("Medical records sharing approved!");
  };

  const handleRejectSharing = (approvalId) => {
    setPendingApprovals((prev) =>
      prev.filter((approval) => approval.id !== approvalId)
    );
    alert("Medical records sharing rejected.");
  };

  const getStatusIcon = (status) => {
    return status === "Completed" ? (
      <FaCheckCircle className="patient-status-icon patient-status-completed" />
    ) : (
      <FaTimesCircle className="patient-status-icon patient-status-incomplete" />
    );
  };

  const getStatusClass = (status) => {
    return status === "Completed"
      ? "patient-status-completed"
      : "patient-status-incomplete";
  };

  return (
    <div className="patient-page-content">
      <div className="patient-page-header">
        <h2 className="patient-page-title">Consultation History</h2>
        <p className="patient-page-subtitle">
          View your past consultations and medical records
        </p>
      </div>

      {/* Pending Approvals Notification */}
      {pendingApprovals.length > 0 && (
        <div className="patient-pending-approvals">
          <div className="patient-approval-header">
            <FaBell className="patient-notification-icon" />
            <h3>Pending Medical Records Sharing Approvals</h3>
          </div>
          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="patient-approval-item">
              <div className="patient-approval-details">
                <p>
                  <strong>Doctor:</strong> {approval.doctorName}
                </p>
                <p>
                  <strong>Specialty:</strong> {approval.specialty}
                </p>
                <p>
                  <strong>Request Date:</strong> {approval.requestDate}
                </p>
              </div>
              <div className="patient-approval-actions">
                <button
                  className="patient-approve-btn"
                  onClick={() => handleApproveSharing(approval.id)}
                >
                  <FaCheck className="patient-btn-icon" />
                  Approve
                </button>
                <button
                  className="patient-reject-btn"
                  onClick={() => handleRejectSharing(approval.id)}
                >
                  <FaTimes className="patient-btn-icon" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultations List */}
      <div className="patient-consultations-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading history...</div>
        ) : consultations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>No consultation history found.</div>
        ) : (
          consultations.map((consultation) => (
            <div key={consultation.id} className="patient-consultation-card">

              <div className="patient-consultation-header">
                <div className="patient-consultation-info">
                  <h3 className="patient-consultation-ticket">
                    {consultation.ticketNumber}
                  </h3>
                  <div className="patient-consultation-datetime">
                    <span className="patient-consultation-date">
                      {consultation.date}
                    </span>
                    <span className="patient-consultation-time">
                      {consultation.time}
                    </span>
                  </div>
                </div>
                <div className="patient-consultation-status">
                  {getStatusIcon(consultation.status)}
                  <span
                    className={`patient-status-text ${getStatusClass(
                      consultation.status
                    )}`}
                  >
                    {consultation.status}
                  </span>
                </div>
              </div>

              <div className="patient-consultation-details">
                <div className="patient-consultation-team">
                  <div className="patient-team-member">
                    <FaUserMd className="patient-team-icon" />
                    <span className="patient-team-label">Specialist:</span>
                    <span className="patient-team-name">
                      {consultation.specialist}
                    </span>
                  </div>
                  <div className="patient-team-member">
                    <FaUserNurse className="patient-team-icon" />
                    <span className="patient-team-label">Nurse:</span>
                    <span className="patient-team-name">
                      {consultation.nurse}
                    </span>
                  </div>
                </div>

                <div className="patient-consultation-complaint">
                  <strong>Chief Complaint:</strong> {consultation.chiefComplaint}
                </div>

                <div className="patient-consultation-meta">
                  <span className="patient-duration">
                    Duration: {consultation.duration}
                  </span>
                  {consultation.rating && (
                    <span className="patient-rating">
                      Rating: {consultation.rating}/5
                    </span>
                  )}
                </div>
              </div>

              <div className="patient-consultation-actions">
                <button
                  className="patient-view-btn"
                  onClick={() => handleViewSummary(consultation)}
                >
                  <FaEye className="patient-btn-icon" />
                  View Summary
                </button>
                <button
                  className="patient-share-btn"
                  onClick={() => handleShareRecords(consultation)}
                >
                  <FaShare className="patient-btn-icon" />
                  Share Records
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Consultation Summary Modal */}
      {showSummaryModal && selectedConsultation && (
        <div className="patient-modal-overlay" onClick={() => setShowSummaryModal(false)}>
          <div className="patient-modal-content patient-summary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patient-modal-header">
              <h3>
                Consultation Summary - {selectedConsultation.ticketNumber}
              </h3>
              <button
                className="patient-close-btn"
                onClick={() => setShowSummaryModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="patient-modal-body">
              {(() => {
                const summary = getConsultationSummary();
                return (
                  <>
                    {/* Medical Team */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">
                        <FaStethoscope className="patient-section-icon" />
                        Medical Team
                      </h4>
                      <div className="patient-team-details">
                        <div className="patient-team-member-detail">
                          <FaUserNurse className="patient-detail-icon" />
                          <div>
                            <strong>Assigned Nurse:</strong>{" "}
                            {summary.medicalTeam.assignedNurse}
                          </div>
                        </div>
                        <div className="patient-team-member-detail">
                          <FaUserMd className="patient-detail-icon" />
                          <div>
                            <strong>Assigned Specialist:</strong>{" "}
                            {summary.medicalTeam.assignedSpecialist}
                            <br />
                            <small>
                              Specialty:{" "}
                              {summary.medicalTeam.specialistSpecialty}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chief Complaint */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">Chief Complaint</h4>
                      <p className="patient-complaint-text">
                        {summary.chiefComplaint}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">
                        Consultation Status
                      </h4>
                      <span
                        className={`patient-status-badge ${getStatusClass(
                          summary.status
                        )}`}
                      >
                        {summary.status}
                      </span>
                    </div>

                    {/* Medical Records */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">Medical Records</h4>
                      <ul className="patient-records-list">
                        {summary.medicalRecords.map((record, index) => (
                          <li key={index} className="patient-record-item">
                            {record}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ROS */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">
                        Review of Systems (ROS)
                      </h4>
                      <div className="patient-ros-details">
                        <div className="patient-ros-item">
                          <strong>Subjective:</strong> {summary.ros.subjective}
                        </div>
                        <div className="patient-ros-item">
                          <strong>Objective:</strong> {summary.ros.objective}
                        </div>
                        <div className="patient-ros-item">
                          <strong>Assessment:</strong> {summary.ros.assessment}
                        </div>
                        <div className="patient-ros-item">
                          <strong>Plan:</strong> {summary.ros.plan}
                        </div>
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">
                        <FaPills className="patient-section-icon" />
                        Medications
                      </h4>
                      <div className="patient-medications-list">
                        {summary.medications.map((med, index) => (
                          <div key={index} className="patient-medication-item">
                            <div className="patient-medication-name">
                              {med.name}
                            </div>
                            <div className="patient-medication-details">
                              <span>Dosage: {med.dosage}</span>
                              <span>Duration: {med.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Laboratory */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">
                        <FaFlask className="patient-section-icon" />
                        Laboratory
                      </h4>
                      <div className="patient-lab-list">
                        {summary.laboratory.map((test, index) => (
                          <div key={index} className="patient-lab-item">
                            <div className="patient-lab-test">{test.test}</div>
                            <div className="patient-lab-status">
                              <span
                                className={`patient-lab-status-badge ${test.status.toLowerCase()}`}
                              >
                                {test.status}
                              </span>
                              {test.result && (
                                <span className="patient-lab-result">
                                  {test.result}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Treatment Plan */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">
                        <FaClipboardList className="patient-section-icon" />
                        Treatment Plan
                      </h4>
                      <ul className="patient-treatment-list">
                        {summary.treatmentPlan.map((item, index) => (
                          <li key={index} className="patient-treatment-item">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Medical Documents */}
                    <div className="patient-summary-section">
                      <h4 className="patient-section-title">
                        Medical Documents
                      </h4>
                      <div className="patient-documents-section">
                        <h5>Provided Documents</h5>
                        <div className="patient-documents-list">
                          {getMedicalDocuments().provided.map((doc, index) => (
                            <div key={index} className="patient-document-item">
                              <FaFilePdf className="patient-document-icon" />
                              <div className="patient-document-info">
                                <div className="patient-document-name">
                                  {doc.name}
                                </div>
                                <div className="patient-document-size">
                                  {doc.size}
                                </div>
                              </div>
                              <button
                                className="patient-download-btn"
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                <FaDownload className="patient-btn-icon" />
                                Download
                              </button>
                            </div>
                          ))}
                        </div>

                        <h5>Requested Documents</h5>
                        <div className="patient-documents-list">
                          {getMedicalDocuments().requested.map((doc, index) => (
                            <div
                              key={index}
                              className="patient-document-item patient-requested-document"
                            >
                              <FaFilePdf className="patient-document-icon" />
                              <div className="patient-document-info">
                                <div className="patient-document-name">
                                  {doc.name}
                                </div>
                                <div className="patient-document-price">
                                  {doc.price}
                                </div>
                              </div>
                              <button
                                className="patient-request-btn"
                                onClick={() => handleRequestDocument(doc)}
                              >
                                Request & Pay
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Add close button at the bottom */}
            <div className="patient-modal-footer">
            </div>
          </div>
        </div>
      )}

      {/* Share Records Modal */}
      {showShareModal && selectedConsultation && (
        <div className="patient-modal-overlay">
          <div className="patient-modal-content patient-share-modal">
            <div className="patient-modal-header">
              <h3>
                Share Medical Records - {selectedConsultation.ticketNumber}
              </h3>
              <button
                className="patient-close-btn"
                onClick={() => setShowShareModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="patient-modal-body">
              <div className="patient-share-info">
                <p>
                  Share your medical records with healthcare providers on the
                  platform.
                </p>
                <p>
                  <strong>Note:</strong> Only specialists who are on-board the
                  platform can view your records.
                </p>
              </div>

              <div className="patient-share-form">
                <div className="patient-form-group">
                  <label>Select Specialist to Share With:</label>
                  <select className="patient-form-select">
                    <option value="">Choose a specialist...</option>
                    <option value="dr-smith">
                      Dr. John Smith - Cardiology
                    </option>
                    <option value="dr-jones">Dr. Mary Jones - Neurology</option>
                    <option value="dr-brown">
                      Dr. David Brown - Internal Medicine
                    </option>
                  </select>
                </div>

                <div className="patient-form-group">
                  <label>Share Duration:</label>
                  <select className="patient-form-select">
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="permanent">Permanent (until revoked)</option>
                  </select>
                </div>

                <div className="patient-form-group">
                  <label>
                    <input type="checkbox" className="patient-checkbox" />
                    Include sensitive information (Doctor's remarks,
                    subjective/objective notes)
                  </label>
                </div>
              </div>

              <div className="patient-share-actions">
                <button
                  className="patient-cancel-btn"
                  onClick={() => setShowShareModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="patient-share-confirm-btn"
                  onClick={() => {
                    alert(
                      "Medical records sharing request sent! The specialist will be notified."
                    );
                    setShowShareModal(false);
                  }}
                >
                  <FaShare className="patient-btn-icon" />
                  Share Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationHistory;
