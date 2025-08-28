import React, { useState } from 'react';

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

const SpecialistTable = ({ specialists = [], onAddSpecialist }) => {
  const [viewModalSpec, setViewModalSpec] = useState(null);
  const [denyModalSpec, setDenyModalSpec] = useState(null);
  const [denyReason, setDenyReason] = useState('');

  const handleAccept = (specId) => {
    alert(`Specialist ${specId} has been accepted and notified via email with their login credentials.`);
  };


  const handleSubmitDenial = () => {
    if (denyReason) {
      alert(`Specialist ${denyModalSpec.id} has been denied. Reason: ${denyReason}. An email notification has been sent.`);
      setDenyModalSpec(null); 
      setDenyReason(''); 
    } else {
      alert("A reason is required for declining the application.");
    }
  };

  return (
    <>
      <div id="list" className="tab-content active">
        <h2>OkieDoc+ Specialists</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>UID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialists.map(spec => (
                <tr key={spec.id}>
                  <td>{spec.id}</td>
                  <td>{spec.firstName}</td>
                  <td>{spec.lastName}</td>
                  <td>{spec.email}</td>
                  <td>
                    <button className="action-btn btn-primary" onClick={() => setViewModalSpec(spec)}>View</button>
                    <button className="action-btn btn-success" onClick={() => handleAccept(spec.id)}>Accept</button>
                    <button className="action-btn btn-danger" onClick={() => setDenyModalSpec(spec)}>Deny</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalSpec && (
        <Modal title="Specialist Information" onClose={() => setViewModalSpec(null)}>
          <p><strong>UID:</strong> {viewModalSpec.id}</p>
          <p><strong>First Name:</strong> {viewModalSpec.firstName}</p>
          <p><strong>Last Name:</strong> {viewModalSpec.lastName}</p>
          <p><strong>Email:</strong> {viewModalSpec.email}</p>
          <p><strong>Specialization:</strong> {viewModalSpec.specialization}</p>
          <p><strong>License No.:</strong> {viewModalSpec.license}</p>
          <p><strong>Status:</strong> {viewModalSpec.status}</p>
        </Modal>
      )}

      {denyModalSpec && (
        <Modal title={`Reason for Denying ${denyModalSpec.firstName}`} onClose={() => setDenyModalSpec(null)}>
          <textarea 
            id="deny-reason-textarea" 
            placeholder="Provide a reason for declining the application..." 
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
          />
          <div className="modal-actions">
            <button className="btn-danger" onClick={handleSubmitDenial}>Submit Denial</button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SpecialistTable;