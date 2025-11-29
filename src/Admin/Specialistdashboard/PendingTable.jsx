import React, { useState } from 'react';
import { sanitizeInput } from '../../Specialists/utils/validationUtils';
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

const PendingTable = ({ applications = [] }) => {
  const [viewModalApp, setViewModalApp] = useState(null);
  const [denyModalApp, setDenyModalApp] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [imageViewUrl, setImageViewUrl] = useState(null);

  const handleAccept = (appId) => {
    alert(`Application ${appId} accepted! (Simulated)`);
    setViewModalApp(null);
  };

  const handleSubmitDenial = () => {
    if (denyReason && denyModalApp) {
      alert(`Application ${denyModalApp.id} denied. Reason: ${denyReason}. (Simulated)`);
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
          <div id="modal-body">
            {viewModalApp.details?.profilePicture && (
                <img
                    src={viewModalApp.details.profilePicture}
                    alt={`${viewModalApp.name}'s profile`}
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 15px' }}
                />
            )}
            <p><strong>Name:</strong> {viewModalApp.name || 'N/A'}</p>
            <p><strong>Email:</strong> {viewModalApp.email || 'N/A'}</p>
            <p><strong>Specializations:</strong> {viewModalApp.details?.specializations?.join(', ') || 'N/A'}</p>
            <p><strong>Subspecializations:</strong> {viewModalApp.details?.subspecializations?.join(', ') || 'N/A'}</p>

            <p><strong>PRC ID No.:</strong> {viewModalApp.details?.prcId?.number || 'N/A'}
              {viewModalApp.details?.prcId?.imageUrl && (
                 <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.prcId.imageUrl)}>View</button>
              )}
            </p>
            <p><strong>S2 License No.:</strong> {viewModalApp.details?.s2?.number || 'N/A'}
             {viewModalApp.details?.s2?.imageUrl && (
               <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.s2.imageUrl)}>View</button>
             )}
            </p>
            <p><strong>PTR No.:</strong> {viewModalApp.details?.ptr?.number || 'N/A'}
              {viewModalApp.details?.ptr?.imageUrl && (
                 <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.ptr.imageUrl)}>View</button>
              )}
            </p>

            {viewModalApp.details?.eSig && (
            <>
                <p><strong>E-Signature:</strong></p>
                <img
                src={viewModalApp.details.eSig}
                alt="E-Signature"
                style={{ maxWidth: '200px', border: '1px solid #ddd', padding: '5px', marginTop: '5px', display: 'block' }}
                />
            </>
            )}
          </div>
          {/* Modal Actions: Buttons for Deny and Accept */}
          <div className="modal-actions">
            <button className="action-btn btn-danger" onClick={() => { setViewModalApp(null); setDenyModalApp(viewModalApp); }}>
              Deny
            </button>
            <button className="action-btn btn-success" onClick={() => handleAccept(viewModalApp.id)}>
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