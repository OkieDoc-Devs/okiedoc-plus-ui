import React, { useState, useMemo } from "react";
import esigPlaceholder from '../../assets/esig.png';

const SpecialistTable = ({ specialists = [], onStatusChange, toolbar }) => {
  const [viewModalSpec, setViewModalSpec] = useState(null);
  const [imageViewUrl, setImageViewUrl] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });

  const fallbackSignature = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='80'%3E%3Crect width='250' height='80' fill='%23ffffff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2364748b'%3ESignature Stored in Database%3C/text%3E%3C/svg%3E";

  const sortedSpecialists = useMemo(() => {
    let sortable = [...specialists];
    if (sortConfig.key !== null) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'specialization') {
          aVal = a.specialization || a.details?.specializations?.join(', ') || '';
          bVal = b.specialization || b.details?.specializations?.join(', ') || '';
        }

        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [specialists, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const viewButtonStyle = {
    marginLeft: "10px",
    padding: "2px 8px",
    fontSize: "12px",
    cursor: "pointer",
    backgroundColor: "#e3f2fd",
    border: "1px solid #4aa7ed",
    color: "#0b5388",
    borderRadius: "4px",
  };

  return (
    <>
      <div id="list" className="tab-content active">
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
           <h2 style={{ margin: 0, padding: 0, border: 'none' }}>OkieDoc+ Specialists</h2>
        </div>
        
        {toolbar}

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  UID{getSortIndicator('id')}
                </th>
                <th onClick={() => requestSort('firstName')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  First Name{getSortIndicator('firstName')}
                </th>
                <th onClick={() => requestSort('lastName')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Last Name{getSortIndicator('lastName')}
                </th>
                <th onClick={() => requestSort('email')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Email{getSortIndicator('email')}
                </th>
                <th onClick={() => requestSort('specialization')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Specialization{getSortIndicator('specialization')}
                </th>
                <th onClick={() => requestSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Status{getSortIndicator('status')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSpecialists.length > 0 ? (
                sortedSpecialists.map((spec) => (
                  <tr key={spec.id}>
                    <td>{spec.id || "N/A"}</td>
                    <td>{spec.firstName || "N/A"}</td>
                    <td>{spec.lastName || "N/A"}</td>
                    <td>{spec.email || "N/A"}</td>
                    <td>{spec.specialization || spec.details?.specializations?.join(", ") || "N/A"}</td>

                    <td>
                      <span style={{ 
                        display: 'block', fontWeight: '600', textTransform: 'capitalize', 
                        color: spec.status === 'suspended' ? '#e74c3c' : spec.status === 'inactive' ? '#95a5a6' : '#2ecc71' 
                      }}>
                        {spec.status === 'approved' ? 'Active' : spec.status}
                      </span>
                    </td>

                    <td>
                      <button className="action-btn btn-primary" onClick={() => setViewModalSpec(spec)}>View</button>
                      
                      <select
                        onChange={(e) => {
                          if (e.target.value && onStatusChange) {
                            onStatusChange(spec.id, e.target.value);
                            e.target.value = ""; 
                          }
                        }}
                        defaultValue=""
                        style={{ marginLeft: '10px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#f8fafc', color: '#1e293b', fontWeight: '500' }}
                      >
                        <option value="" disabled>Change Status</option>
                        <option value="approved">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: '30px', color: '#64748b' }}>
                    No specialists found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalSpec && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setViewModalSpec(null)}>
          <div style={{ maxWidth: '750px', width: '95%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '8px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0B5388' }}>Specialist Information</h2>
              <button onClick={() => setViewModalSpec(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', backgroundColor: '#f9fbfd', padding: '20px', borderRadius: '8px', border: '1px solid #e1e8ed' }}>
              {viewModalSpec.details?.profilePicture && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <img src={viewModalSpec.details.profilePicture} alt={`${viewModalSpec.firstName}'s profile`} style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{`${viewModalSpec.firstName || ""} ${viewModalSpec.lastName || ""}`.trim() || "N/A"}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{viewModalSpec.email || "N/A"}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Core Specialization</span>
                <span style={{ fontSize: '16px', color: '#2c3e50' }}>{viewModalSpec.specialization || viewModalSpec.details?.specializations?.join(", ") || "N/A"}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subspecializations</span>
                <span style={{ fontSize: '16px', color: '#2c3e50' }}>{viewModalSpec.details?.subspecializations?.join(", ") || "N/A"}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRC License No.</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{viewModalSpec.details?.prcId?.number || "N/A"}</span>
                  {viewModalSpec.details?.prcId?.imageUrl && (
                    <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.prcId.imageUrl)}>View ID</button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S2 License No.</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{viewModalSpec.details?.s2?.number || "N/A"}</span>
                  {viewModalSpec.details?.s2?.imageUrl && (
                    <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.s2.imageUrl)}>View S2</button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PTR No.</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{viewModalSpec.details?.ptr?.number || "N/A"}</span>
                  {viewModalSpec.details?.ptr?.imageUrl && (
                    <button style={viewButtonStyle} onClick={() => setImageViewUrl(viewModalSpec.details.ptr.imageUrl)}>View PTR</button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600', textTransform: 'capitalize' }}>{viewModalSpec.status === 'approved' ? 'Active' : viewModalSpec.status || "Active"}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span>
                <span style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {[viewModalSpec.addressLine1, viewModalSpec.addressLine2, viewModalSpec.barangay, viewModalSpec.city, viewModalSpec.province, viewModalSpec.region, viewModalSpec.zipCode].filter(Boolean).join(", ") || "N/A"}
                </span>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #e1e8ed' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>E-Signature Verification</span>
                <img
                  src={viewModalSpec.details?.eSig || esigPlaceholder}
                  onError={(e) => { e.target.onerror = null; e.target.src = esigPlaceholder; }}
                  alt="E-Signature"
                  style={{ maxWidth: "250px", maxHeight: '100px', objectFit: 'contain', border: "1px dashed #bdc3c7", padding: "10px", backgroundColor: '#fff', borderRadius: '4px' }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="action-btn btn-primary" onClick={() => setViewModalSpec(null)}>Close</button>
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
              <img src={imageViewUrl} alt="Document" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="action-btn btn-primary" onClick={() => setImageViewUrl(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SpecialistTable;