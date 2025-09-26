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
          <table className="dashboard-table">
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
              {specialists.length > 0 ? specialists.map(spec => (
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
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No matching specialists found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalSpec && (
        <Modal title="Specialist Information" onClose={() => setViewModalSpec(null)}>
          <div id="modal-body">
            {viewModalSpec.details.profilePicture && (
                <img 
                    src={viewModalSpec.details.profilePicture} 
                    alt={`${viewModalSpec.firstName}'s profile`} 
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 15px' }} 
                />
            )}
            <p><strong>UID:</strong> {viewModalSpec.id}</p>
            <p><strong>Name:</strong> {`${viewModalSpec.firstName} ${viewModalSpec.lastName}`}</p>
            <p><strong>Email:</strong> {viewModalSpec.email}</p>
            <p><strong>Status:</strong> {viewModalSpec.status}</p>
            <p><strong>Specializations:</strong> {viewModalSpec.details.specializations.join(', ')}</p>
            <p><strong>Subspecializations:</strong> {viewModalSpec.details.subspecializations.join(', ')}</p>
            <p><strong>PRC ID No.:</strong> {viewModalSpec.details.prcId.number}
              <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.prcId.imageUrl)}>View</button>
            </p>
            <p><strong>S2 License No.:</strong> {viewModalSpec.details.s2.number}
              <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.s2.imageUrl)}>View</button>
            </p>
            <p><strong>PTR No.:</strong> {viewModalSpec.details.ptr.number}
              <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.ptr.imageUrl)}>View</button>
            </p>
            {viewModalSpec.details.eSig && (
            <>
                <p><strong>E-Signature:</strong></p>
                <img 
                src={viewModalSpec.details.eSig} 
                alt="E-Signature" 
                style={{ maxWidth: '200px', border: '1px solid #ddd', padding: '5px', marginTop: '5px' }} 
                />
            </>
            )}
          </div>
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

      {imageViewUrl && (
        <Modal title="View Document" onClose={() => setImageViewUrl(null)}>
          <img src={imageViewUrl} alt="Document" style={{ width: '100%', height: 'auto' }} />
        </Modal>
      )}      
    </>
  );
};

export default SpecialistTable;