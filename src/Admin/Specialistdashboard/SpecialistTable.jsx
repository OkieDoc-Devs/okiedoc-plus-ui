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
  const [imageViewUrl, setImageViewUrl] = useState(null);

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

  const viewButtonStyle = {
    marginLeft: '10px',
    padding: '2px 8px',
    fontSize: '12px',
    cursor: 'pointer'
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
                <th>Name</th>
                <th>Specialization</th> 
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialists.length > 0 ? specialists.map(spec => (
                <tr key={spec.id}>
                  <td>{spec.id}</td>
                  <td>{spec.name}</td>
                  <td>{spec.specialization}</td>
                  <td>
                    <button className="action-btn btn-primary" onClick={() => alert('View details functionality to be added.')}>View</button>
                    <button className="action-btn btn-success" onClick={() => handleAccept(spec.id)}>Accept</button>
                    <button className="action-btn btn-danger" onClick={() => setDenyModalSpec(spec)}>Deny</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No specialists found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
};

export default SpecialistTable;
