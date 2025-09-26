import React, { useState } from 'react';

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
    alert(`Application ${appId} accepted!`);
    setViewModalApp(null);
  };

  const handleSubmitDenial = () => {
    if (denyReason) {
      alert(`Application ${denyModalApp.id} denied. Reason: ${denyReason}.`);
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
    cursor: 'pointer'
  };
  
  return (
    <>
      <div id="pending" className="tab-content active">
        <h2>Pending Specialist Applications</h2>
        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr><th>Applicant Name</th><th>Email</th><th>Application Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {applications.length > 0 ? applications.map(app => (
                <tr key={app.id}>
                  <td>{app.name}</td><td>{app.email}</td><td>{app.date}</td>
                  <td><button className="action-btn btn-primary" onClick={() => setViewModalApp(app)}>View</button></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No matching applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalApp && (
        <Modal title="Application Details" onClose={() => setViewModalApp(null)}>
          <div id="modal-body">
            {viewModalApp.details.profilePicture && (
                <img 
                    src={viewModalApp.details.profilePicture} 
                    alt={`${viewModalApp.name}'s profile`} 
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 15px' }} 
                />
            )}
            <p><strong>Name:</strong> {viewModalApp.name}</p>
            <p><strong>Email:</strong> {viewModalApp.email}</p>
            <p><strong>Specializations:</strong> {viewModalApp.details.specializations.join(', ')}</p>
            <p><strong>Subspecializations:</strong> {viewModalApp.details.subspecializations.join(', ')}</p>
            <p><strong>PRC ID No.:</strong> {viewModalApp.details.prcId.number}
              <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.prcId.imageUrl)}>View</button>
            </p>
            <p><strong>S2 License No.:</strong> {viewModalApp.details.s2.number}
              <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.s2.imageUrl)}>View</button>
            </p>
            <p><strong>PTR No.:</strong> {viewModalApp.details.ptr.number}
              <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalApp.details.ptr.imageUrl)}>View</button>
            </p>
            {viewModalApp.details.eSig && (
            <>
                <p><strong>E-Signature:</strong></p>
                <img 
                src={viewModalApp.details.eSig} 
                alt="E-Signature" 
                style={{ maxWidth: '200px', border: '1px solid #ddd', padding: '5px', marginTop: '5px' }} 
                />
            </>
            )}
          </div>
          <div className="modal-actions">
            <button className="btn-danger" onClick={() => { setViewModalApp(null); setDenyModalApp(viewModalApp); }}>Deny</button>
            <button className="btn-success" onClick={() => handleAccept(viewModalApp.id)}>Accept</button>
          </div>
        </Modal>
      )}

      {denyModalApp && (
        <Modal title="Reason for Denial" onClose={() => setDenyModalApp(null)}>
          <textarea id="deny-reason-textarea" placeholder="Provide a reason..." value={denyReason} onChange={(e) => setDenyReason(e.target.value)}></textarea>
          <div className="modal-actions">
            <button className="btn-danger" onClick={handleSubmitDenial}>Submit Denial</button>
          </div>
        </Modal>
      )}
      {imageViewUrl && (
        <Modal title="View Document" onClose={() => setImageViewUrl(null)}>
          <img src={imageViewUrl} alt="Document" style={{ width: '100%', height: 'auto' }} />
        </Modal>
      )}
    </>
  );
};

export default PendingTable;