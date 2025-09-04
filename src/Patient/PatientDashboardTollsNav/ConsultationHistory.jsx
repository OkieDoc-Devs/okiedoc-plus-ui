import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FileText, Eye, X } from 'lucide-react';
import './ConsultationHistory.css';

export default function ConsultationHistory() {
  const [consultations] = useState([
    {
      id: 1,
      title: "General Health Checkup",
      status: "Completed",
      date: "2024-01-10",
      nurse: "Nurse Sarah",
      specialist: "Dr. Michael Johnson"
    },
    {
      id: 2,
      title: "Dental Cleaning",
      status: "Completed",
      date: "2024-01-08",
      nurse: "Nurse Emily",
      specialist: "Dr. Lisa Chen"
    },
    {
      id: 3,
      title: "Skin Consultation",
      status: "Incomplete",
      date: "2024-01-05",
      nurse: "Nurse David",
      specialist: "Dr. Amanda Wilson"
    },
    {
      id: 4,
      title: "Cardiology Review",
      status: "Completed",
      date: "2024-01-03",
      nurse: "Nurse Maria",
      specialist: "Dr. Robert Wilson"
    },
    {
      id: 5,
      title: "Mental Health Session",
      status: "Incomplete",
      date: "2024-01-01",
      nurse: "Nurse James",
      specialist: "Dr. Lisa Thompson"
    }
  ]);

  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const handleViewDetails = (consultation) => {
    setSelectedConsultation(consultation);
  };

  const handleCloseDetails = () => {
    setSelectedConsultation(null);
  };

  return (
    <Sidebar>
      <div className="consultation-history">
        <h1>Consultation History</h1>
        
        <div className="consultation-list">
          {consultations.map(consultation => (
            <div 
              key={consultation.id}
              className="consultation-item"
              onClick={() => handleViewDetails(consultation)}
            >
              <div className="consultation-header">
                <h3 className="consultation-title">
                  {consultation.title}
                </h3>
                <span 
                  className={`status-badge ${consultation.status === 'Completed' ? 'status-completed' : 'status-incomplete'}`}
                >
                  {consultation.status}
                </span>
              </div>
              
              <div className="consultation-details">
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{consultation.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Nurse:</span>
                  <span className="detail-value">{consultation.nurse}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Specialist:</span>
                  <span className="detail-value">{consultation.specialist}</span>
                </div>
              </div>
              
              <div className="consultation-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(consultation);
                  }}
                  className="action-button"
                >
                  <Eye size={16} />
                  View EMR
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EMR Modal */}
        {selectedConsultation && (
          <div className="emr-modal-overlay" onClick={handleCloseDetails}>
            <div className="emr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="emr-modal-header">
                <h2 className="emr-modal-title">
                  {selectedConsultation.title}
                </h2>
                <button 
                  className="close-button"
                  onClick={handleCloseDetails}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="emr-modal-content">
                <div className="emr-section">
                  <h3 className="emr-section-title">Medical Team</h3>
                  <div className="medical-team">
                    <div className="team-member">
                      <span className="team-member-role">Assigned Nurse:</span>
                      <span className="team-member-name">{selectedConsultation.nurse}</span>
                    </div>
                    <div className="team-member">
                      <span className="team-member-role">Assigned Specialist:</span>
                      <span className="team-member-name">{selectedConsultation.specialist}</span>
                    </div>
                  </div>
                </div>
                
                <div className="emr-section">
                  <h3 className="emr-section-title">Consultation Status</h3>
                  <span 
                    className={`status-badge ${selectedConsultation.status === 'Completed' ? 'status-completed' : 'status-incomplete'}`}
                  >
                    {selectedConsultation.status}
                  </span>
                  <p className="status-description">
                    {selectedConsultation.status === 'Completed' 
                      ? 'Consultation with the Specialist is done'
                      : 'Consultation was not conducted due to several reasons'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
