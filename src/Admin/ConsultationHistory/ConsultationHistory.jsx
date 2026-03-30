import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../Components/EmptyState";
import { getTicketById } from "../../api/Admin/api";
import {
  downloadTreatmentPlanPDF,
  downloadPrescriptionPDF,
  downloadLabRequestPDF,
  downloadMedicalCertificatePDF,
  sendToEmail,
} from "./pdfHelpers";
import "./ConsultationHistory.css"; 

const ConsultationHistory = ({ consultations = [], toolbar }) => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  const sortedConsultations = useMemo(() => {
    let sortable = [...consultations];
    if (sortConfig.key !== null) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        
        if (sortConfig.key === 'date') {
          aVal = new Date(aVal).getTime() || 0;
          bVal = new Date(bVal).getTime() || 0;
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [consultations, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  const handleViewConsultation = async (consultation) => {
    setIsLoadingDetails(true);
    try {
      const fullTicketResponse = await getTicketById(consultation.ticket || consultation.id);
      setSelectedConsultation(fullTicketResponse.data || fullTicketResponse);
    } catch (error) {
      console.error("Failed to load full ticket details, falling back to basic data:", error);
      setSelectedConsultation(consultation);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div id="consultations" className="tab-content active">
      <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
         <h2 style={{ margin: 0, padding: 0, border: 'none' }}>Consultation History</h2>
      </div>
      
      {toolbar}

      <div className="table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th onClick={() => requestSort("date")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Date{getSortIndicator("date")}
              </th>
              <th onClick={() => requestSort("ticket")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Ticket ID{getSortIndicator("ticket")}
              </th>
              <th onClick={() => requestSort("patientName")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Patient Name{getSortIndicator("patientName")}
              </th>
              <th onClick={() => requestSort("chiefComplaint")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Chief Complaint{getSortIndicator("chiefComplaint")}
              </th>
              <th onClick={() => requestSort("specialistName")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Specialist{getSortIndicator("specialistName")}
              </th>
              <th onClick={() => requestSort("status")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Status{getSortIndicator("status")}
              </th>
              <th onClick={() => requestSort("barangay")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Location (Brgy, City){getSortIndicator("barangay")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedConsultations.length > 0 ? (
              sortedConsultations.map((c, idx) => (
                <tr key={c.id || idx}>
                  <td>{c.date ? new Date(c.date).toLocaleDateString() : "—"}</td>
                  <td>
                    <Link 
                      to={`/admin/ticket/${c.ticket || c.id}`} 
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: '#0B5388', textDecoration: 'underline', cursor: 'pointer', fontWeight: '500' }}
                    >
                      {c.ticket || c.id || "—"}
                    </Link>
                  </td>
                  <td>{c.patientName || "—"}</td>
                  <td>{c.chiefComplaint || "—"}</td>
                  <td>{c.specialistName || "Unassigned"}</td>
                  <td>{c.status || "Completed"}</td>
                  <td>{c.barangay ? `${c.barangay}, ${c.city || ''}` : "—"}</td>
                  <td>
                    <button 
                      className="action-btn btn-primary" 
                      onClick={() => handleViewConsultation(c)}
                      disabled={isLoadingDetails}
                    >
                      {isLoadingDetails ? '...' : 'View'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: '30px', border: 'none', textAlign: 'center', color: '#64748b' }}>
                  No tickets found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedConsultation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setSelectedConsultation(null)}>
          <div style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '8px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0B5388' }}>Ticket Details</h2>
              <button onClick={() => setSelectedConsultation(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', backgroundColor: '#f9fbfd', padding: '20px', borderRadius: '8px', border: '1px solid #e1e8ed' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ticket ID</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{selectedConsultation.ticketNumber || selectedConsultation.ticket || selectedConsultation.id}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600', textTransform: 'uppercase' }}>{selectedConsultation.status}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Name</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>
                  {selectedConsultation.patient?.firstName ? `${selectedConsultation.patient.firstName} ${selectedConsultation.patient.lastName}` : selectedConsultation.patientName}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Specialist</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>
                  {selectedConsultation.specialist?.firstName ? `${selectedConsultation.specialist.firstName} ${selectedConsultation.specialist.lastName}` : selectedConsultation.specialistName || "Unassigned"}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>
                  {selectedConsultation.createdAt ? new Date(selectedConsultation.createdAt).toLocaleDateString() : (selectedConsultation.date ? new Date(selectedConsultation.date).toLocaleDateString() : "N/A")}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{selectedConsultation.barangay ? `${selectedConsultation.barangay}, ${selectedConsultation.city || ''}` : "N/A"}</span>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', padding: '12px', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#27ae60', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Healthcare / HMO</span>
                  <span style={{ fontSize: '15px', color: '#2c3e50' }}>{selectedConsultation.isUsingHmo ? selectedConsultation.hmoProvider : 'Cash / Direct Payment'}</span>
                </div>
                {selectedConsultation.isUsingHmo && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '12px', color: '#27ae60', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Member ID / LOA</span>
                    <span style={{ fontSize: '15px', color: '#2c3e50' }}>ID: {selectedConsultation.hmoMemberId || 'N/A'} <br/> LOA: {selectedConsultation.loaCode || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e1e8ed', paddingTop: '15px', marginTop: '5px' }}>
                <h3 style={{ fontSize: '14px', color: '#0B5388', textTransform: 'uppercase', margin: '0 0 15px 0' }}>Medical Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chief Complaint</span>
                  <span style={{ fontSize: '16px', color: '#2c3e50' }}>{selectedConsultation.chiefComplaint || "N/A"}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Symptoms</span>
                  <span style={{ fontSize: '16px', color: '#2c3e50' }}>{selectedConsultation.symptoms || "N/A"}</span>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e1e8ed', paddingTop: '15px', marginTop: '5px' }}>
                <h3 style={{ fontSize: '14px', color: '#0B5388', textTransform: 'uppercase', margin: '0 0 15px 0' }}>SOAP Notes</h3>
                <ul className="ch-soap-list" style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: '10px' }}>
                  <li style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subjective</span>
                    <span style={{ fontSize: '15px', color: '#2c3e50' }}>{selectedConsultation.subjective || "N/A"}</span>
                  </li>
                  <li style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Objective</span>
                    <span style={{ fontSize: '15px', color: '#2c3e50' }}>{selectedConsultation.objective || "N/A"}</span>
                  </li>
                  <li style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assessment</span>
                    <span style={{ fontSize: '15px', color: '#2c3e50' }}>{selectedConsultation.assessment || "N/A"}</span>
                  </li>
                  <li style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan</span>
                    <span style={{ fontSize: '15px', color: '#2c3e50' }}>{selectedConsultation.plan || "N/A"}</span>
                  </li>
                </ul>
              </div>

              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e1e8ed', paddingTop: '15px', marginTop: '5px' }}>
                 <h3 style={{ fontSize: '14px', color: '#0B5388', textTransform: 'uppercase', margin: '0 0 15px 0' }}>Actions</h3>
                 <div className="ch-modal-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                   <button className="action-btn btn-primary" onClick={() => downloadTreatmentPlanPDF(selectedConsultation)}>Download Treatment Plan</button>
                   <button className="action-btn btn-success" onClick={() => downloadPrescriptionPDF(selectedConsultation)}>Download Prescription</button>
                   <button className="action-btn" style={{ backgroundColor: '#f1c40f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadLabRequestPDF(selectedConsultation)}>Download Lab Request</button>
                   <button className="action-btn" style={{ backgroundColor: '#9b59b6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadMedicalCertificatePDF(selectedConsultation)}>Download Medical Cert</button>
                   <button className="action-btn btn-danger" onClick={() => sendToEmail(selectedConsultation)}>Send to Email</button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationHistory;