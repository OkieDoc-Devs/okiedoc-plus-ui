import React, { useState } from 'react';
import Modal from '../Components/Modal';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';

const PendingTable = ({ applications = [], onApprove, onDeny, searchBar }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  const safeApps = Array.isArray(applications) ? applications : [];

  return (
    <>
      <div className="admin-toolbar">
        {searchBar}
      </div>
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>Applicant Name</th>
            <th>Specialty</th>
            <th>License Number</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeApps.length > 0 ? (
            safeApps.map((app) => (
              <tr key={app.id || Math.random()}>
                <td style={{fontWeight: 500}}>{app.name || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Unknown'}</td>
                <td>{app.primarySpecialty || app.details?.specializations?.[0] || 'N/A'}</td>
                <td>{app.licenseNumber || app.details?.prcId?.number || 'N/A'}</td>
                <td>{app.email || 'N/A'}</td>
                <td>
                  <button className="view-btn" onClick={() => setSelectedApp(app)}><FiEye style={{marginBottom:'-2px'}}/> View</button>
                  <button className="approve-btn" onClick={() => onApprove(app.id)}><FiCheck style={{marginBottom:'-2px'}}/> Approve</button>
                  <button className="deny-btn" onClick={() => onDeny(app.id)}><FiX style={{marginBottom:'-2px'}}/> Deny</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                No pending applications at this time.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedApp && (
        <Modal title="Applicant Review" onClose={() => setSelectedApp(null)}>
          <div className="ticket-modal-grid">
            <div className="ticket-section">
              <h3>Applicant Information</h3>
              <div className="ticket-row"><span className="ticket-label">Full Name</span><span className="ticket-value">{selectedApp.name || `${selectedApp.firstName || ''} ${selectedApp.lastName || ''}`.trim()}</span></div>
              <div className="ticket-row"><span className="ticket-label">Email</span><span className="ticket-value">{selectedApp.email}</span></div>
              <div className="ticket-row"><span className="ticket-label">Phone</span><span className="ticket-value">{selectedApp.mobileNumber || 'N/A'}</span></div>
            </div>
            <div className="ticket-section">
              <h3>Credentials</h3>
              <div className="ticket-row"><span className="ticket-label">Primary Specialty</span><span className="ticket-value">{selectedApp.primarySpecialty || 'N/A'}</span></div>
              <div className="ticket-row"><span className="ticket-label">Sub-Specialty</span><span className="ticket-value">{selectedApp.subSpecialties || 'None'}</span></div>
              <div className="ticket-row"><span className="ticket-label">PRC License</span><span className="ticket-value" style={{color: '#0ea5e9'}}>{selectedApp.licenseNumber || selectedApp.details?.prcId?.number || 'N/A'}</span></div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => { onApprove(selectedApp.id); setSelectedApp(null); }} 
              style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
            >
              Approve Applicant
            </button>
            <button 
              onClick={() => { onDeny(selectedApp.id); setSelectedApp(null); }} 
              style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
            >
              Deny Applicant
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PendingTable;