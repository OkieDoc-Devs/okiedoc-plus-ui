import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaUser, FaClock, FaFileMedical, FaComments, FaPrint, FaDownload, FaVideo, FaUserNurse, FaStethoscope, FaArrowRight, FaHeartbeat } from 'react-icons/fa';
import { getTicketById } from '../../api/Admin/api';
import './TicketDetails.css';

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTicketById(id);
        setTicket(data.data || data); 
      } catch (err) {
        setError("Failed to load ticket details. The ticket may not exist or the API is unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <div className="loading-screen" style={{ padding: '50px', textAlign: 'center', fontSize: '1.2rem' }}>Loading Ticket Details...</div>;
  if (error) return <div className="error-screen" style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!ticket) return null;

  const patientName = ticket.patient ? `${ticket.patient.firstName || ''} ${ticket.patient.lastName || ''}`.trim() : 'Unknown Patient';
  const specialistName = ticket.specialist ? `${ticket.specialist.firstName || ''} ${ticket.specialist.lastName || ''}`.trim() : 'Unassigned';
  const nurseName = ticket.nurse ? `${ticket.nurse.firstName || ''} ${ticket.nurse.lastName || ''}`.trim() : 'Unassigned';

  const ticketDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A';
  const ticketTime = ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString() : 'N/A';

  return (
    <div className="ticket-details-page">
      <header className="td-header">
        <div className="td-header-left">
            <h1 className="td-title">Ticket #{ticket.ticketNumber || ticket.id}</h1>
            <span className={`td-status-badge ${ticket.status?.toLowerCase() || 'pending'}`}>{ticket.status || 'Pending'}</span>
        </div>
        <div className="td-header-right">
            <button className="td-btn-secondary" onClick={() => window.print()}><FaPrint /> Print</button>
            <button className="td-btn-primary"><FaDownload /> Export</button>
        </div>
      </header>

      <div className="td-grid-layout">
        {/* LEFT COLUMN: Patient, Info & Staff History */}
        <aside className="td-sidebar">
            <div className="td-card patient-card">
                <div className="td-avatar-large">
                    <FaUser />
                </div>
                <h3>{patientName}</h3>
                <div className="td-divider"></div>
                <div className="td-info-row">
                    <label>Email</label>
                    <span>{ticket.patient?.email || 'N/A'}</span>
                </div>
                <div className="td-info-row">
                    <label>Phone</label>
                    <span>{ticket.patient?.mobileNumber || 'N/A'}</span>
                </div>
                <div className="td-info-row">
                    <label>Location</label>
                    <span>{ticket.barangay ? `${ticket.barangay}, ${ticket.city || ''}` : 'N/A'}</span>
                </div>
            </div>

            {/* Healthcare / HMO Section */}
            <div className="td-card info-card" style={{ borderLeft: '4px solid #27ae60' }}>
                <h4><FaHeartbeat /> Healthcare & HMO</h4>
                <div className="td-info-row">
                    <label>Using HMO</label>
                    <span style={{ fontWeight: 'bold', color: ticket.isUsingHmo ? '#27ae60' : '#7f8c8d' }}>
                      {ticket.isUsingHmo ? 'Yes' : 'No (Cash / Direct)'}
                    </span>
                </div>
                {ticket.isUsingHmo && (
                  <>
                    <div className="td-info-row">
                        <label>Provider</label>
                        <span>{ticket.hmoProvider || 'N/A'}</span>
                    </div>
                    <div className="td-info-row">
                        <label>Member ID</label>
                        <span>{ticket.hmoMemberId || 'N/A'}</span>
                    </div>
                    <div className="td-info-row">
                        <label>LOA Code</label>
                        <span>{ticket.loaCode || 'N/A'}</span>
                    </div>
                  </>
                )}
            </div>

            <div className="td-card info-card">
                <h4><FaUserNurse /> Staff Handling</h4>
                <div className="staff-chain">
                    <div className="staff-node">
                        <div className="staff-icon"><FaUserNurse /></div>
                        <div className="staff-details">
                            <span className="staff-role">Nurse</span>
                            <span className="staff-name">{nurseName}</span>
                        </div>
                        <div className="staff-arrow"><FaArrowRight /></div>
                    </div>
                    <div className="staff-node">
                        <div className="staff-icon"><FaStethoscope /></div>
                        <div className="staff-details">
                            <span className="staff-role">Specialist</span>
                            <span className="staff-name">{specialistName}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="td-card info-card">
                <h4><FaClock /> Consultation Info</h4>
                <div className="td-info-row">
                    <label>Date</label>
                    <span>{ticketDate}</span>
                </div>
                <div className="td-info-row">
                    <label>Time</label>
                    <span>{ticketTime}</span>
                </div>
                <div className="td-info-row">
                    <label>Department</label>
                    <span>{ticket.targetSpecialty || 'General'}</span>
                </div>
            </div>
        </aside>

        {/* MIDDLE COLUMN: Assessment (SOAP) */}
        <main className="td-main-content">
            <div className="td-card assessment-card">
                <div className="card-header">
                    <h4><FaFileMedical /> Clinical Assessment</h4>
                </div>
                
                <div className="soap-section">
                    <span className="soap-label">Chief Complaint</span>
                    <p className="soap-content highlight">{ticket.chiefComplaint || 'No chief complaint provided.'}</p>
                </div>

                <div className="soap-grid">
                    <div className="soap-box">
                        <span className="soap-tag">Subjective</span>
                        <p>{ticket.subjective || 'No subjective notes recorded.'}</p>
                    </div>
                    <div className="soap-box">
                        <span className="soap-tag">Objective</span>
                        <p>{ticket.objective || 'No objective notes recorded.'}</p>
                    </div>
                    <div className="soap-box">
                        <span className="soap-tag">Assessment</span>
                        <p>{ticket.assessment || 'No assessment recorded.'}</p>
                    </div>
                    <div className="soap-box">
                        <span className="soap-tag">Plan</span>
                        <p style={{whiteSpace: 'pre-line'}}>{ticket.plan || 'No treatment plan recorded.'}</p>
                    </div>
                </div>

                {ticket.icd10Code && (
                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <strong>ICD-10 Code: </strong> {ticket.icd10Code}
                  </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default TicketDetails;