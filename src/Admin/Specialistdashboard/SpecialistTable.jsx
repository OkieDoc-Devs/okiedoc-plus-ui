import React, { useState } from 'react';
import Modal from '../Components/Modal';
import { FiEye, FiPower } from 'react-icons/fi';

const SpecialistTable = ({ specialists = [], onStatusChange, searchBar }) => {
  const [viewingSpecialist, setViewingSpecialist] = useState(null);
  const safeSpecs = Array.isArray(specialists) ? specialists : [];

  return (
    <>
      <div className="admin-toolbar">
        {searchBar}
      </div>
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>Specialist Name</th>
            <th>Specialty</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeSpecs.length > 0 ? (
            safeSpecs.map((spec) => {
              const specStatus = String(spec.status || spec.applicationStatus || 'active').toLowerCase();
              let pillClass = 'status-active';
              if (specStatus === 'suspended') pillClass = 'status-cancelled';
              if (specStatus === 'approved' || specStatus === 'active') pillClass = 'status-completed';

              return (
                <tr key={spec.id || Math.random()}>
                  <td style={{fontWeight: 500}}>{spec.name || `${spec.firstName || ''} ${spec.lastName || ''}`.trim() || 'Unknown'}</td>
                  <td>{spec.primarySpecialty || spec.details?.specializations?.[0] || 'N/A'}</td>
                  <td>{spec.email || 'N/A'}</td>
                  <td>
                    <span className={`status-pill ${pillClass}`} style={{textTransform: 'capitalize'}}>
                      {specStatus}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => setViewingSpecialist(spec)}><FiEye style={{marginBottom:'-2px'}}/> View</button>
                    <button className="action-btn" style={{backgroundColor: specStatus === 'active' || specStatus === 'approved' ? '#ef4444' : '#10b981'}} onClick={() => onStatusChange(spec.id, specStatus === 'active' || specStatus === 'approved' ? 'suspended' : 'active')}>
                      <FiPower style={{marginBottom:'-2px'}}/> {specStatus === 'active' || specStatus === 'approved' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                No approved specialists found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {viewingSpecialist && (
        <Modal title="Specialist Profile" onClose={() => setViewingSpecialist(null)}>
          <div className="ticket-modal-grid">
            <div className="ticket-section">
              <h3>Personal Information</h3>
              <div className="ticket-row"><span className="ticket-label">Full Name</span><span className="ticket-value">{viewingSpecialist.name || `${viewingSpecialist.firstName || ''} ${viewingSpecialist.lastName || ''}`.trim()}</span></div>
              <div className="ticket-row"><span className="ticket-label">Email</span><span className="ticket-value">{viewingSpecialist.email}</span></div>
              <div className="ticket-row"><span className="ticket-label">Phone</span><span className="ticket-value">{viewingSpecialist.mobileNumber || 'N/A'}</span></div>
            </div>
            <div className="ticket-section">
              <h3>Professional Details</h3>
              <div className="ticket-row"><span className="ticket-label">Primary Specialty</span><span className="ticket-value">{viewingSpecialist.primarySpecialty || 'N/A'}</span></div>
              <div className="ticket-row"><span className="ticket-label">Sub-Specialty</span><span className="ticket-value">{viewingSpecialist.subSpecialties || 'None'}</span></div>
              <div className="ticket-row"><span className="ticket-label">PRC License</span><span className="ticket-value" style={{color: '#0ea5e9'}}>{viewingSpecialist.licenseNumber || viewingSpecialist.details?.prcId?.number || 'N/A'}</span></div>
            </div>
          </div>
          <button className="admin-modal-close-btn" onClick={() => setViewingSpecialist(null)}>Close Profile</button>
        </Modal>
      )}
    </>
  );
};

export default SpecialistTable;