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

  return (
    <>
      <div id="pending" className="tab-content active">
        <h2>Pending Specialist Applications</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Applicant Name</th><th>Email</th><th>Application Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>{app.name}</td><td>{app.email}</td><td>{app.date}</td>
                  <td><button className="action-btn btn-primary" onClick={() => setViewModalApp(app)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalApp && (
        <Modal title="Application Details" onClose={() => setViewModalApp(null)}>
          <div id="modal-body">
            <p><strong>Name:</strong> {viewModalApp.name}</p>
            <p><strong>Email:</strong> {viewModalApp.email}</p>
            <p><strong>Specialization:</strong> {viewModalApp.details.specialization}</p>
            <p><strong>License No.:</strong> {viewModalApp.details.license}</p>
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
    </>
  );
};

export default PendingTable;