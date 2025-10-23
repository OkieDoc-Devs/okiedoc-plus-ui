import React, { useState } from 'react';
import Modal from '../Components/Modal';

const SpecialistTable = ({ specialists = [] }) => {
  const [viewModalSpec, setViewModalSpec] = useState(null);
  const [denyModalSpec, setDenyModalSpec] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [imageViewUrl, setImageViewUrl] = useState(null);

  const handleAccept = (specId) => {
    alert(`Specialist ${specId} status confirmed/activated. (Simulated)`);
     setViewModalSpec(null);
  };

  const handleSubmitDenial = () => {
    if (denyReason && denyModalSpec) {
      alert(`Specialist ${denyModalSpec.id} has been denied/deactivated. Reason: ${denyReason}. (Simulated)`);
      setDenyModalSpec(null);
      setDenyReason('');
    } else {
      alert("A reason is required for denying/deactivating the specialist.");
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
              {specialists.length > 0 ? (
                specialists.map(spec => (
                  <tr key={spec.id}>
                    <td>{spec.id || 'N/A'}</td>
                    <td>{spec.firstName || 'N/A'}</td>
                    <td>{spec.lastName || 'N/A'}</td>
                    <td>{spec.email || 'N/A'}</td>
                    <td>
                      <button className="action-btn btn-primary" onClick={() => setViewModalSpec(spec)}>
                        View
                      </button>
                      <button className="action-btn btn-success" onClick={() => handleAccept(spec.id)}>
                        Confirm 
                      </button>
                      <button className="action-btn btn-danger" onClick={() => setDenyModalSpec(spec)}>
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No specialists found or matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {viewModalSpec && (
        <Modal title="Specialist Information" onClose={() => setViewModalSpec(null)}>
          <div id="modal-body">
            {viewModalSpec.details?.profilePicture && (
                <img
                    src={viewModalSpec.details.profilePicture}
                    alt={`${viewModalSpec.firstName}'s profile`}
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 15px' }}
                />
            )}
            <p><strong>UID:</strong> {viewModalSpec.id || 'N/A'}</p>
            <p><strong>Name:</strong> {`${viewModalSpec.firstName || ''} ${viewModalSpec.lastName || ''}`.trim() || 'N/A'}</p>
            <p><strong>Email:</strong> {viewModalSpec.email || 'N/A'}</p>
            <p><strong>Status:</strong> {viewModalSpec.status || 'Active'}</p>
            <p><strong>Specializations:</strong> {viewModalSpec.details?.specializations?.join(', ') || 'N/A'}</p>
            <p><strong>Subspecializations:</strong> {viewModalSpec.details?.subspecializations?.join(', ') || 'N/A'}</p>

            <p><strong>PRC ID No.:</strong> {viewModalSpec.details?.prcId?.number || 'N/A'}
              {viewModalSpec.details?.prcId?.imageUrl && (
                 <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.prcId.imageUrl)}>View</button>
              )}
            </p>
            <p><strong>S2 License No.:</strong> {viewModalSpec.details?.s2?.number || 'N/A'}
             {viewModalSpec.details?.s2?.imageUrl && (
               <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.s2.imageUrl)}>View</button>
             )}
            </p>
            <p><strong>PTR No.:</strong> {viewModalSpec.details?.ptr?.number || 'N/A'}
              {viewModalSpec.details?.ptr?.imageUrl && (
                 <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.ptr.imageUrl)}>View</button>
              )}
            </p>

            {viewModalSpec.details?.eSig && (
            <>
                <p><strong>E-Signature:</strong></p>
                <img
                  src={viewModalSpec.details.eSig}
                  alt="E-Signature"
                  style={{ maxWidth: '200px', border: '1px solid #ddd', padding: '5px', marginTop: '5px', display: 'block' }}
                />
            </>
            )}
          </div>
           <div className="modal-actions">
             <button className="action-btn btn-primary" onClick={() => setViewModalSpec(null)}>Close</button>
           </div>
        </Modal>
      )}

      {denyModalSpec && (
        <Modal title={`Reason for Deactivating ${denyModalSpec.firstName}`} onClose={() => setDenyModalSpec(null)}>
          <textarea
            id="deny-reason-textarea"
            placeholder="Provide a reason for deactivating this specialist..."
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
          <div className="modal-actions">
            <button className="action-btn btn-danger" onClick={handleSubmitDenial}>
              Submit Deactivation
            </button>
          </div>
        </Modal>
      )}

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

export default SpecialistTable;