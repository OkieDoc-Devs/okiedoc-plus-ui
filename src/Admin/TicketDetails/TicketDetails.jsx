import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaUser, FaClock, FaFileMedical, FaComments, FaPrint, FaDownload, FaArrowLeft } from 'react-icons/fa';
import './TicketDetails.css';

// Mock data generator
const getMockTicketData = (id) => ({
  id: id,
  status: 'Completed',
  date: '2025-10-24',
  time: '14:30',
  specialist: 'Dr. Sarah Johnson',
  specialization: 'Cardiology',
  patient: {
    name: 'John Doe',
    age: 34,
    gender: 'Male',
    email: 'john.doe@example.com',
    phone: '+63 917 123 4567',
    avatar: null // Use default if null
  },
  assessment: {
    chiefComplaint: 'Persistent chest pain and shortness of breath.',
    subjective: 'Patient reports sharp pain in the center of chest lasting for 2 days. Worsens with physical activity.',
    objective: 'BP: 140/90, HR: 88, Temp: 37.2°C. No visible signs of trauma.',
    assessment: 'Suspected Angina Pectoris / Hypertension.',
    plan: '1. Prescribed Nitroglycerin.\n2. Scheduled ECG and Stress Test.\n3. Follow up in 3 days.',
    prescriptions: [
        { drug: 'Nitroglycerin', dosage: '0.4mg', frequency: 'As needed for pain' },
        { drug: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }
    ]
  },
  chatHistory: [
    { sender: 'patient', text: 'Hi doctor, I am feeling a sharp pain in my chest.', time: '14:30' },
    { sender: 'specialist', text: 'Hello John. How long have you been feeling this?', time: '14:31' },
    { sender: 'patient', text: 'About 2 days now. It gets worse when I walk up stairs.', time: '14:32' },
    { sender: 'specialist', text: 'I see. I will need to check your vitals and run some tests.', time: '14:33' },
    { sender: 'system', text: 'Prescription generated.', time: '14:45' }
  ]
});

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    // In a real app, fetch data from API using `id`
    // const data = await api.getTicket(id);
    const data = getMockTicketData(id || 'TKT-000');
    setTicket(data);
  }, [id]);

  if (!ticket) return <div className="loading-screen">Loading Ticket Details...</div>;

  return (
    <div className="ticket-details-page">
      {/* Header Bar */}
      <header className="td-header">
        <div className="td-header-left">
            <h1 className="td-title">Ticket #{ticket.id}</h1>
            <span className={`td-status-badge ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
        </div>
        <div className="td-header-right">
            <button className="td-btn-secondary" onClick={() => window.print()}><FaPrint /> Print</button>
            <button className="td-btn-primary"><FaDownload /> Export</button>
        </div>
      </header>

      <div className="td-grid-layout">
        {/* LEFT COLUMN: Patient & Info */}
        <aside className="td-sidebar">
            <div className="td-card patient-card">
                <div className="td-avatar-large">
                    <FaUser />
                </div>
                <h3>{ticket.patient.name}</h3>
                <p className="td-subtext">{ticket.patient.age} yrs • {ticket.patient.gender}</p>
                
                <div className="td-divider"></div>
                
                <div className="td-info-row">
                    <label>Email</label>
                    <span>{ticket.patient.email}</span>
                </div>
                <div className="td-info-row">
                    <label>Phone</label>
                    <span>{ticket.patient.phone}</span>
                </div>
            </div>

            <div className="td-card info-card">
                <h4><FaClock /> Consultation Info</h4>
                <div className="td-info-row">
                    <label>Date</label>
                    <span>{ticket.date}</span>
                </div>
                <div className="td-info-row">
                    <label>Specialist</label>
                    <span>{ticket.specialist}</span>
                </div>
                <div className="td-info-row">
                    <label>Department</label>
                    <span>{ticket.specialization}</span>
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
                    <p className="soap-content highlight">{ticket.assessment.chiefComplaint}</p>
                </div>

                <div className="soap-grid">
                    <div className="soap-box">
                        <span className="soap-tag">Subjective</span>
                        <p>{ticket.assessment.subjective}</p>
                    </div>
                    <div className="soap-box">
                        <span className="soap-tag">Objective</span>
                        <p>{ticket.assessment.objective}</p>
                    </div>
                    <div className="soap-box">
                        <span className="soap-tag">Assessment</span>
                        <p>{ticket.assessment.assessment}</p>
                    </div>
                    <div className="soap-box">
                        <span className="soap-tag">Plan</span>
                        <p style={{whiteSpace: 'pre-line'}}>{ticket.assessment.plan}</p>
                    </div>
                </div>

                {ticket.assessment.prescriptions.length > 0 && (
                    <div className="prescription-section">
                        <h5>Prescriptions</h5>
                        <table className="td-table">
                            <thead>
                                <tr>
                                    <th>Drug</th>
                                    <th>Dosage</th>
                                    <th>Frequency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticket.assessment.prescriptions.map((rx, idx) => (
                                    <tr key={idx}>
                                        <td>{rx.drug}</td>
                                        <td>{rx.dosage}</td>
                                        <td>{rx.frequency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>

        {/* RIGHT COLUMN: Chat History */}
        <aside className="td-chat-panel">
            <div className="td-card chat-card">
                <div className="card-header">
                    <h4><FaComments /> Consultation Chat</h4>
                </div>
                <div className="chat-feed">
                    {ticket.chatHistory.map((msg, index) => (
                        <div key={index} className={`chat-bubble-container ${msg.sender}`}>
                            <div className="chat-bubble">
                                {msg.text}
                            </div>
                            <span className="chat-time">{msg.time}</span>
                        </div>
                    ))}
                </div>
                <div className="chat-footer-readonly">
                    <span>Read Only View</span>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default TicketDetails;