import React, { useState } from 'react';
import Modal from '../Components/Modal';
import { FiEye, FiSlash } from 'react-icons/fi';

import PRC_Sample from '../../assets/PRC_Sample.jpg';
import S2_Sample from '../../assets/S2.png';
import PTR_Sample from '../../assets/PTR.png';

const SpecialistTable = ({ specialists = [], onSuspend, searchBar }) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewingDocTitle, setViewingDocTitle] = useState('');
  const safeSpecs = Array.isArray(specialists) ? specialists : [];

  const renderDocuments = (app) => {
    const docs = [];
    if ((app.licenseNumber && app.licenseNumber !== 'N/A') || (app.details?.prcId?.number && app.details.prcId.number !== 'N/A')) docs.push('PRC ID');
    if ((app.s2Number && app.s2Number !== 'N/A') || (app.details?.s2?.number && app.details.s2.number !== 'N/A')) docs.push('S2 License');
    if ((app.ptrNumber && app.ptrNumber !== 'N/A') || (app.details?.ptr?.number && app.details.ptr.number !== 'N/A')) docs.push('PTR');

    if (docs.length === 0) return <span style={{ color: '#94a3b8', fontSize: '13px' }}>No Documents</span>;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {docs.map((doc, idx) => (
          <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 100 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
            {doc}
          </span>
        ))}
      </div>
    );
  };

  const renderDocRow = (label, docNumber, docUrl, docTitle) => {
    const displayNum = !docNumber || docNumber === 'N/A' ? 'N/A' : docNumber;
    const hasDoc = displayNum !== 'N/A'; 
    
    return (
      <div className="ticket-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="ticket-label" style={{ margin: 0, lineHeight: 1 }}>{label}</span>
          {hasDoc && (
            <button 
              onClick={(e) => { e.preventDefault(); setViewingDoc(docUrl); setViewingDocTitle(docTitle); }}
              style={{ 
                fontSize: '0.7rem', color: '#0284c7', backgroundColor: 'transparent', border: '1px solid #bae6fd', 
                padding: '2px 8px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', 
                display: 'inline-flex', alignItems: 'center', gap: '4px', height: 'fit-content',
                transition: 'all 0.2s ease', lineHeight: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FiEye size={10} /> View
            </button>
          )}
        </div>
        <span className="ticket-value" style={{ color: !hasDoc ? '#94a3b8' : '#0ea5e9', margin: 0, lineHeight: 1.4 }}>{displayNum}</span>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .ticket-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .ticket-section h3 { font-size: 1.1rem; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
          .ticket-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
          .ticket-label { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; line-height: 1; }
          .ticket-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.4; margin-top: 4px; }
        `}
      </style>
      
      <div className="admin-toolbar">
        {searchBar}
      </div>
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>Specialist Name</th>
            <th>Specialty</th>
            <th>Email</th>
            <th>License Number</th>
            <th>Documents</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeSpecs.length > 0 ? (
            safeSpecs.map((spec) => (
              <tr key={spec.id || Math.random()}>
                <td style={{fontWeight: 500}}>Dr. {spec.name || `${spec.firstName || ''} ${spec.lastName || ''}`.trim() || 'Unknown'}</td>
                <td>{spec.primarySpecialty || spec.details?.specializations?.[0] || 'N/A'}</td>
                <td>{spec.email || 'N/A'}</td>
                <td>{spec.licenseNumber || spec.details?.prcId?.number || 'N/A'}</td>
                <td>{renderDocuments(spec)}</td>
                <td>
                  <span className={`status-badge ${spec.status?.toLowerCase() === 'approved' ? 'status-active' : 'status-pending'}`}>
                    {spec.status || 'Active'}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => setSelectedSpecialist(spec)}><FiEye style={{marginBottom:'-2px'}}/> View</button>
                  <button className="deny-btn" onClick={() => onSuspend(spec.userId || spec.id)}><FiSlash style={{marginBottom:'-2px'}}/> Suspend</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                No active specialists found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedSpecialist && (
        <Modal title="Specialist Profile" onClose={() => setSelectedSpecialist(null)} contentStyle={{ maxWidth: '900px', width: '90%', padding: '24px' }}>
          <div className="ticket-modal-grid">
            <div className="ticket-section">
              <h3>Personal Information</h3>
              <div className="ticket-row"><span className="ticket-label">Full Name</span><span className="ticket-value">Dr. {selectedSpecialist.name || `${selectedSpecialist.firstName || ''} ${selectedSpecialist.lastName || ''}`.trim()}</span></div>
              <div className="ticket-row"><span className="ticket-label">Email Address</span><span className="ticket-value">{selectedSpecialist.email}</span></div>
              <div className="ticket-row"><span className="ticket-label">Mobile Number</span><span className="ticket-value">{selectedSpecialist.mobileNumber || 'N/A'}</span></div>
            </div>
            
            <div className="ticket-section">
              <h3>Professional Credentials</h3>
              <div className="ticket-row" style={{ marginBottom: '20px' }}>
                <span className="ticket-label">Primary Specialty</span>
                <span className="ticket-value">{selectedSpecialist.primarySpecialty || 'N/A'}</span>
              </div>
              
              {renderDocRow('PRC License', selectedSpecialist.licenseNumber || selectedSpecialist.details?.prcId?.number, selectedSpecialist.prcIdUrl || selectedSpecialist.details?.prcId?.imageUrl || PRC_Sample, 'PRC License')}
              {renderDocRow('S2 License', selectedSpecialist.s2Number || selectedSpecialist.details?.s2?.number, selectedSpecialist.s2LicenseUrl || selectedSpecialist.details?.s2?.imageUrl || S2_Sample, 'S2 License')}
              {renderDocRow('PTR Number', selectedSpecialist.ptrNumber || selectedSpecialist.details?.ptr?.number, selectedSpecialist.ptrUrl || selectedSpecialist.details?.ptr?.imageUrl || PTR_Sample, 'PTR Number')}
            </div>
          </div>
          
          <button 
            onClick={() => { onSuspend(selectedSpecialist.userId || selectedSpecialist.id); setSelectedSpecialist(null); }} 
            style={{ width: '100%', padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s', marginTop: '24px' }}
          >
            Suspend Specialist Account
          </button>
        </Modal>
      )}

      {viewingDoc && (
        <Modal title={viewingDocTitle} onClose={() => setViewingDoc(null)} contentStyle={{ maxWidth: '1000px', width: '95%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', padding: '12px' }}>
            {viewingDoc.toLowerCase().endsWith('.pdf') ? (
              <iframe src={viewingDoc} style={{ width: '100%', height: '600px', border: 'none' }} title={viewingDocTitle} />
            ) : (
              <img src={viewingDoc} alt={viewingDocTitle} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '4px' }} />
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              onClick={() => setViewingDoc(null)}
              style={{ padding: '10px 24px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Close Viewer
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SpecialistTable;