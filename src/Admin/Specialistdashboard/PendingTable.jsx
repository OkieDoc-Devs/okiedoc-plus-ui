import React, { useState } from 'react';
import EmptyState from '../Components/EmptyState';

// --- Modal component is now defined directly in this file ---
const Modal = ({ children, title, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

const PendingTable = ({ applications = [], onApprove, onDeny }) => {
  const [viewModalApp, setViewModalApp] = useState(null);
  const [denyModalApp, setDenyModalApp] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [imageViewUrl, setImageViewUrl] = useState(null);

  const handleAccept = async (appId) => {
    if (onApprove) {
      await onApprove(appId);
    }
    setViewModalApp(null);
  };

  const handleSubmitDenial = async () => {
    if (denyReason && denyModalApp) {
      if (onDeny) {
        await onDeny(denyModalApp.userId || denyModalApp.id, denyReason);
      }
      setDenyModalApp(null);
      setDenyReason('');
    } else {
      alert('Please provide a reason for denial.');
    }
  };

  const viewButtonStyle = {
    marginLeft: '10px',
    padding: '2px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: '#e3f2fd',
    border: '1px solid #4aa7ed',
    color: '#0b5388',
    borderRadius: '4px'
  };

  return (
    <>
      <div id="pending" className="tab-content active">
        <h2>Pending Specialist Applications</h2>
        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Application Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.name || 'N/A'}</td>
                    <td>{app.email || 'N/A'}</td>
                    <td>{app.date || 'N/A'}</td>
                    <td>
                      <button className="action-btn btn-primary" onClick={() => setViewModalApp(app)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      type="specialists"
                      message="No Pending Applications"
                      subMessage="Great job! There are no specialist applications waiting for review at this time."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Application Details Modal */}
      {viewModalApp && (
        <Modal title="Application Details" onClose={() => setViewModalApp(null)}>
          <div id="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', backgroundColor: '#f9fbfd', padding: '20px', borderRadius: '8px', border: '1px solid #e1e8ed' }}>
            {viewModalApp.details?.profilePicture && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <img
                  src={viewModalApp.details.profilePicture}
                  alt={`${viewModalApp.name}'s profile`}
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</span>
              <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{viewModalApp.name || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</span>
              <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{viewModalApp.email || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Core Specialization</span>
              <span style={{ fontSize: '16px', color: '#2c3e50' }}>{viewModalApp.details?.specializations?.join(', ') || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subspecializations</span>
              <span style={{ fontSize: '16px', color: '#2c3e50' }}>{viewModalApp.details?.subspecializations?.join(', ') || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRC License No.</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{viewModalApp.details?.prcId?.number || 'N/A'}</span>
                {viewModalApp.details?.prcId?.imageUrl && (
                  <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.prcId.imageUrl)}>View ID</button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S2 License No.</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{viewModalApp.details?.s2?.number || 'N/A'}</span>
                {viewModalApp.details?.s2?.imageUrl && (
                  <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.s2.imageUrl)}>View S2</button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PTR No.</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{viewModalApp.details?.ptr?.number || 'N/A'}</span>
                {viewModalApp.details?.ptr?.imageUrl && (
                  <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.ptr.imageUrl)}>View PTR</button>
                )}
              </div>
            </div>

            {viewModalApp.details?.eSig && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #e1e8ed' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>E-Signature Verification</span>
                <img
                  src={viewModalApp.details.eSig}
                  alt="E-Signature"
                  style={{ maxWidth: '250px', maxHeight: '100px', objectFit: 'contain', border: '1px dashed #bdc3c7', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>
          {/* Modal Actions: Buttons for Deny and Accept */}
          <div className="modal-actions">
            <button className="action-btn btn-danger" onClick={() => { setViewModalApp(null); setDenyModalApp(viewModalApp); }}>
              Deny
            </button>
            <button className="action-btn btn-success" onClick={() => handleAccept(viewModalApp.userId || viewModalApp.id)}>
              Accept
            </button>
          </div>
        </Modal>
      )}

      {/* Deny Reason Modal */}
      {denyModalApp && (
        <Modal title="Reason for Denial" onClose={() => setDenyModalApp(null)}>
          <textarea
            id="deny-reason-textarea"
            placeholder="Provide a reason..."
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          ></textarea>
          <div className="modal-actions">
            <button className="action-btn btn-danger" onClick={handleSubmitDenial}>
              Submit Denial
            </button>
          </div>
        </Modal>
      )}

      {/* Image View Modal */}
      {imageViewUrl && (
        <Modal title="View Document" onClose={() => setImageViewUrl(null)}>
          <img src={imageViewUrl} alt="Document" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <div className="modal-actions">
            <button className="action-btn btn-primary" onClick={() => setImageViewUrl(null)}>Close</button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PendingTable;