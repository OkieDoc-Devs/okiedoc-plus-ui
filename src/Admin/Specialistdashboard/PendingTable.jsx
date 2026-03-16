import React, { useState, useMemo } from 'react';
import EmptyState from '../Components/EmptyState';
import esigPlaceholder from '../../assets/esig.png';

const PendingTable = ({ applications = [], onApprove, onDeny, toolbar }) => {
  const [viewModalApp, setViewModalApp] = useState(null);
  const [denyModalApp, setDenyModalApp] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [imageViewUrl, setImageViewUrl] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const fallbackSignature = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='80'%3E%3Crect width='250' height='80' fill='%23ffffff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2364748b'%3ESignature Stored in Database%3C/text%3E%3C/svg%3E";

  const sortedApplications = useMemo(() => {
    let sortable = [...applications];
    if (sortConfig.key !== null) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'specialization') {
          aVal = a.details?.specializations?.join(', ') || '';
          bVal = b.details?.specializations?.join(', ') || '';
        }

        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';

        if (sortConfig.key === 'date') {
          aVal = new Date(aVal).getTime() || 0;
          bVal = new Date(bVal).getTime() || 0;
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [applications, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

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
    borderRadius: '4px',
  };

  return (
    <>
      <div id='pending' className='tab-content active'>
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
           <h2 style={{ margin: 0, padding: 0, border: 'none' }}>Pending Specialist Applications</h2>
        </div>
        
        {toolbar}

        <div className='table-wrapper'>
          <table className='dashboard-table'>
            <thead>
              <tr>
                <th onClick={() => requestSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  UID{getSortIndicator('id')}
                </th>
                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Applicant Name{getSortIndicator('name')}
                </th>
                <th onClick={() => requestSort('email')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Email{getSortIndicator('email')}
                </th>
                <th onClick={() => requestSort('specialization')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Specialization{getSortIndicator('specialization')}
                </th>
                <th onClick={() => requestSort('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Application Date{getSortIndicator('date')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplications.length > 0 ? (
                sortedApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.id || 'N/A'}</td>
                    <td>{app.name || 'N/A'}</td>
                    <td>{app.email || 'N/A'}</td>
                    <td>{app.details?.specializations?.join(', ') || 'N/A'}</td>
                    <td>{app.date || 'N/A'}</td>
                    <td>
                      <button
                        className='action-btn btn-primary'
                        onClick={() => setViewModalApp(app)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='6' style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    No applications found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setViewModalApp(null)}>
          <div style={{ maxWidth: '750px', width: '95%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '8px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0B5388' }}>Application Details</h2>
              <button onClick={() => setViewModalApp(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', backgroundColor: '#f9fbfd', padding: '20px', borderRadius: '8px', border: '1px solid #e1e8ed' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span>
                <span style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {[viewModalApp.details?.addressLine1, viewModalApp.details?.addressLine2, viewModalApp.details?.barangay, viewModalApp.details?.city, viewModalApp.details?.province, viewModalApp.details?.region, viewModalApp.details?.zipCode].filter(Boolean).join(', ') || 'N/A'}
                </span>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #e1e8ed' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>E-Signature Verification</span>
                <img 
                  src={viewModalApp.details?.eSig || fallbackSignature} 
                  onError={(e) => { e.target.onerror = null; e.target.src = fallbackSignature; }}
                  alt='E-Signature' 
                  style={{ maxWidth: '250px', maxHeight: '100px', objectFit: 'contain', border: '1px dashed #bdc3c7', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }} 
                />
              </div>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className='action-btn btn-danger' onClick={() => { setViewModalApp(null); setDenyModalApp(viewModalApp); }}>Deny</button>
              <button className='action-btn btn-success' onClick={() => handleAccept(viewModalApp.userId || viewModalApp.id)}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {denyModalApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setDenyModalApp(null)}>
          <div style={{ maxWidth: '500px', width: '95%', backgroundColor: '#fff', borderRadius: '8px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0B5388' }}>Reason for Denial</h2>
              <button onClick={() => setDenyModalApp(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}>✕</button>
            </div>
            <textarea id='deny-reason-textarea' placeholder='Provide a reason...' value={denyReason} onChange={(e) => setDenyReason(e.target.value)} rows={5} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }}></textarea>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className='action-btn btn-danger' onClick={handleSubmitDenial}>Submit Denial</button>
            </div>
          </div>
        </div>
      )}

      {imageViewUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setImageViewUrl(null)}>
          <div style={{ maxWidth: '800px', width: '95%', backgroundColor: '#fff', borderRadius: '8px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0B5388' }}>View Document</h2>
              <button onClick={() => setImageViewUrl(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}>✕</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {/* Max Height forces portrait images to scale down safely */}
              <img src={imageViewUrl} alt='Document' style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className='action-btn btn-primary' onClick={() => setImageViewUrl(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingTable;