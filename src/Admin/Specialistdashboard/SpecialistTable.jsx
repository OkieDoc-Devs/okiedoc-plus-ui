import React, { useState } from 'react';
import Modal from '../Components/Modal';

const SpecialistTable = ({ specialists, onStatusChange, toolbar }) => {
  const [viewingSpecialist, setViewingSpecialist] = useState(null);

  return (
    <div className="table-section">
      <div className="table-header-row">
        <h2>Approved Specialists</h2>
      </div>

      {toolbar}
      
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
          {specialists && specialists.length > 0 ? (
            specialists.map((spec) => (
              <tr key={spec.id}>
                <td style={{fontWeight: 500}}>{spec.name || `${spec.firstName} ${spec.lastName}`}</td>
                <td>{spec.primarySpecialty || spec.details?.specializations?.[0] || 'N/A'}</td>
                <td>{spec.email}</td>
                <td>
                  <span className={`status-pill ${spec.status === 'active' ? 'status-completed' : spec.status === 'suspended' ? 'status-cancelled' : 'status-pending'}`}>
                    {spec.status || 'Active'}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => setViewingSpecialist(spec)}>View</button>
                  <button className="action-btn" onClick={() => onStatusChange(spec.id, spec.status === 'active' ? 'suspended' : 'active')}>
                    {spec.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{textAlign: 'center', padding: '32px', color: '#64748b'}}>
                No approved specialists found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {viewingSpecialist && (
        <Modal title="Specialist Details" onClose={() => setViewingSpecialist(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full Name</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingSpecialist.name || `${viewingSpecialist.firstName} ${viewingSpecialist.lastName}`}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Email Address</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingSpecialist.email}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Mobile Number</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingSpecialist.mobileNumber || 'N/A'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Primary Specialty</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingSpecialist.primarySpecialty || viewingSpecialist.details?.specializations?.[0] || 'N/A'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Sub-Specialty</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingSpecialist.subSpecialties || 'None'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>PRC License Number</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingSpecialist.licenseNumber || viewingSpecialist.details?.prcId?.number || 'N/A'}</p>
            </div>
          </div>
          
          <button className="admin-modal-close-btn" onClick={() => setViewingSpecialist(null)}>Close Details</button>
        </Modal>
      )}
    </div>
  );
};

export default SpecialistTable;