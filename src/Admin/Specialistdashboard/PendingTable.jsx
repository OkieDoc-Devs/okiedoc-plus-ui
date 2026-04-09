import React, { useState } from 'react';
import Modal from '../Components/Modal';

const PendingTable = ({ applications, onApprove, onDeny, toolbar }) => {
  const [selectedApp, setSelectedApp] = useState(null);

  return (
    <div className="table-section">
      <div className="table-header-row">
        <h2>Registration Requests</h2>
      </div>

      {toolbar}
      
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
          {applications && applications.length > 0 ? (
            applications.map((app) => (
              <tr key={app.id}>
                <td style={{fontWeight: 500}}>{app.name || `${app.firstName} ${app.lastName}`}</td>
                <td>{app.primarySpecialty || app.details?.specializations?.[0] || 'N/A'}</td>
                <td>{app.licenseNumber || app.details?.prcId?.number || 'N/A'}</td>
                <td>{app.email}</td>
                <td>
                  <button className="view-btn" onClick={() => setSelectedApp(app)}>View</button>
                  <button className="approve-btn" onClick={() => onApprove(app.id)}>Approve</button>
                  <button className="deny-btn" onClick={() => onDeny(app.id)}>Deny</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{textAlign: 'center', padding: '32px', color: '#64748b'}}>
                No pending applications at this time.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedApp && (
        <Modal title="Applicant Details" onClose={() => setSelectedApp(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full Name</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{selectedApp.name || `${selectedApp.firstName} ${selectedApp.lastName}`}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Email Address</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{selectedApp.email}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Mobile Number</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{selectedApp.mobileNumber || 'N/A'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Primary Specialty</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{selectedApp.primarySpecialty || selectedApp.details?.specializations?.[0] || 'N/A'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Sub-Specialty</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{selectedApp.subSpecialties || 'None'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>PRC License Number</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{selectedApp.licenseNumber || selectedApp.details?.prcId?.number || 'N/A'}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => { onApprove(selectedApp.id); setSelectedApp(null); }} 
              style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
            >
              Approve Application
            </button>
            <button 
              onClick={() => { onDeny(selectedApp.id); setSelectedApp(null); }} 
              style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
            >
              Deny Application
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PendingTable;