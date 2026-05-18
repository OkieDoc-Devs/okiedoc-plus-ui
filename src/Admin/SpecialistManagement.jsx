import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiGrid, FiUsers, FiCalendar, FiDollarSign, FiFileText, FiSettings, FiSearch, FiEye, FiCheck, FiX, FiSlash } from 'react-icons/fi';
import AdminLayout from './Components/AdminLayout';
import Modal from './Components/Modal';
import { getPendingApplications, getSpecialists, updateSpecialistStatus } from '../api/Admin/api';

import PRC_Sample from '../assets/PRC_Sample.jpg';
import S2_Sample from '../assets/S2.png';
import PTR_Sample from '../assets/PTR.png';

const SpecialistManagement = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('specialists');
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [pendingSpecialists, setPendingSpecialists] = useState([]);
  const [approvedSpecialists, setApprovedSpecialists] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denyingSpecialistId, setDenyingSpecialistId] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewingDocTitle, setViewingDocTitle] = useState('');

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <FiGrid /> },
    { id: 'specialists', label: 'Specialist management', icon: <FiUsers /> },
    { id: 'users', label: 'User Management', icon: <FiUsers /> },
    { id: 'consultations', label: 'Consultation Management', icon: <FiCalendar /> },
    { id: 'billing', label: 'Billing & Transactions', icon: <FiDollarSign /> },
    { id: 'reports', label: 'Reports & Exports', icon: <FiFileText /> },
    { id: 'audit', label: 'Audit Logs', icon: <FiFileText /> },
    { id: 'settings', label: 'System Settings', icon: <FiSettings /> }
  ];

  const fetchSpecialists = async () => {
    setLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        getPendingApplications(),
        getSpecialists()
      ]);
      setPendingSpecialists(pending || []);
      setApprovedSpecialists(approved || []);
    } catch (error) {
      console.error("Failed to fetch specialist data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { sessionStorage.clear(); localStorage.clear(); navigate('/login'); }
  };

  const handleApprove = (id) => {
    if (!window.confirm("Are you sure you want to approve this specialist?")) return;
    updateSpecialistStatus({ specialistId: String(id), status: 'approved' })
      .then(() => {
        alert("Specialist approved successfully!");
        setSelectedUser(null);
        fetchSpecialists(); 
      })
      .catch((error) => {
        alert(`Failed to approve specialist. Error: ${error.message || 'Unknown error'}`);
      });
  };

  const triggerDeny = (id) => {
    setSelectedUser(null);
    setDenyReason('');
    setDenyingSpecialistId(id);
  };

  const submitDeny = () => {
    if (!denyReason.trim()) {
      alert("Please provide a reason for denial.");
      return;
    }
    updateSpecialistStatus({ specialistId: String(denyingSpecialistId), status: 'denied', denialReason: denyReason })
      .then(() => {
        alert("Specialist application denied!");
        setDenyingSpecialistId(null);
        fetchSpecialists(); 
      })
      .catch((error) => {
        alert(`Failed to deny specialist. Error: ${error.message || 'Unknown error'}`);
      });
  };

  const handleSuspend = (id) => {
    if (!window.confirm("Are you sure you want to suspend this active specialist?")) return;
    updateSpecialistStatus({ specialistId: String(id), status: 'suspended' })
      .then(() => {
        alert("Specialist account suspended!");
        setSelectedUser(null);
        fetchSpecialists(); 
      })
      .catch((error) => {
        alert(`Failed to suspend specialist. Error: ${error.message || 'Unknown error'}`);
      });
  };

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
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
            {doc}
          </span>
        ))}
      </div>
    );
  };

  // FIXED: Reverted to stacked layout. Label and Button on top, ID Number right below them.
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

  const getFilteredData = (dataArray) => {
    if (!searchTerm) return dataArray;
    return dataArray.filter(app => {
      const searchStr = searchTerm.toLowerCase();
      const name = (app.name || `${app.firstName || ''} ${app.lastName || ''}`).toLowerCase();
      const email = (app.email || '').toLowerCase();
      const spec = (app.primarySpecialty || app.details?.specializations?.[0] || '').toLowerCase();
      return name.includes(searchStr) || email.includes(searchStr) || spec.includes(searchStr);
    });
  };

  const currentData = activeSubTab === 'pending' ? getFilteredData(pendingSpecialists) : getFilteredData(approvedSpecialists);

  return (
    <>
      <style>
        {`
          table tbody td button {
            display: inline-flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            white-space: nowrap !important;
            padding: 8px 16px !important;
            height: auto !important;
            margin-right: 8px !important;
            border-radius: 6px !important;
            font-weight: 600 !important;
            border: none !important;
            cursor: pointer !important;
            font-size: 0.9rem !important;
          }
          table tbody td button:last-child { margin-right: 0 !important; }
          table tbody td button svg { margin: 0 !important; display: block !important; position: static !important; }

          .view-btn { background-color: #f1f5f9 !important; color: #475569 !important; border: 1px solid #cbd5e1 !important; }
          .approve-btn { background-color: #10b981 !important; color: #ffffff !important; }
          .deny-btn { background-color: #ef4444 !important; color: #ffffff !important; }

          .admin-tabs { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px; gap: 16px; }
          .admin-tab { padding: 10px 4px; cursor: pointer; font-weight: 600; color: #64748b; border-bottom: 2px solid transparent; transition: all 0.2s ease; }
          .admin-tab.active { color: #0aadef; border-bottom: 2px solid #0aadef; }
          
          .ticket-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .ticket-section h3 { font-size: 1.1rem; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
          .ticket-row { display: flex; flex-direction: column; margin-bottom: 16px; }
          .ticket-label { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; line-height: 1; }
          .ticket-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.4; margin-top: 4px; }
        `}
      </style>
      
      <AdminLayout
        title="Specialist Directory"
        subtitle="Manage pending applications and active specialists"
        navLinks={navLinks}
        activeTab={activeTab}
        setActiveTab={(tab) => {
           setActiveTab(tab);
           if(tab === 'dashboard') navigate('/admin/specialist-dashboard');
        }}
        adminName="System Admin"
        adminRole="Super Admin"
        adminAvatar="/account.svg"
        onLogout={handleLogout}
        headerSearch={searchTerm}
        setHeaderSearch={setSearchTerm}
      >
        <div className="admin-page-card" style={{ padding: '32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: '#1e293b', fontWeight: '700' }}>
            Specialist Management
          </h2>

          <div className="admin-tabs">
            <div className={`admin-tab ${activeSubTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveSubTab('pending')}>
              Pending Applications {pendingSpecialists.length > 0 && `(${pendingSpecialists.length})`}
            </div>
            <div className={`admin-tab ${activeSubTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveSubTab('approved')}>
              Approved Specialists {approvedSpecialists.length > 0 && `(${approvedSpecialists.length})`}
            </div>
          </div>

          <div className="admin-search-wrapper" style={{ marginBottom: '24px', maxWidth: '350px', position: 'relative' }}>
            <FiSearch className="admin-search-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>NAME</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>SPECIALTY</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>EMAIL</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>LICENSE NUMBER</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>DOCUMENTS</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading data...</td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No specialists found.</td>
                  </tr>
                ) : (
                  currentData.map(app => {
                    const mappedId = app.userId || app.id;
                    const mappedName = app.name || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Unknown';
                    const mappedSpec = app.primarySpecialty || app.details?.specializations?.[0] || 'N/A';
                    const mappedEmail = app.email || 'N/A';
                    const mappedLicense = app.licenseNumber || app.details?.prcId?.number || 'N/A';

                    return (
                      <tr key={mappedId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px', fontWeight: '500', color: '#1e293b' }}>{mappedName}</td>
                        <td style={{ padding: '16px', color: '#475569' }}>{mappedSpec}</td>
                        <td style={{ padding: '16px', color: '#475569' }}>{mappedEmail}</td>
                        <td style={{ padding: '16px', color: '#475569' }}>{mappedLicense}</td>
                        <td style={{ padding: '16px' }}>{renderDocuments(app)}</td>
                        <td style={{ padding: '16px' }}>
                          <button className="view-btn" onClick={() => setSelectedUser(app)}><FiEye size={16} /> View</button>
                          
                          {activeSubTab === 'pending' ? (
                            <>
                              <button className="approve-btn" onClick={() => handleApprove(mappedId)}><FiCheck size={16} /> Approve</button>
                              <button className="deny-btn" onClick={() => triggerDeny(mappedId)}><FiX size={16} /> Deny</button>
                            </>
                          ) : (
                            <button className="deny-btn" style={{ backgroundColor: '#f59e0b' }} onClick={() => handleSuspend(mappedId)}><FiSlash size={16} /> Suspend</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>

      {/* Specialist Details Modal - Fixed layout & width */}
      {selectedUser && (
        <Modal title={activeSubTab === 'pending' ? "Review Application" : "Specialist Profile"} onClose={() => setSelectedUser(null)} contentStyle={{ maxWidth: '900px', width: '90%', padding: '24px' }}>
          <div className="ticket-modal-grid">
            <div className="ticket-section">
              <h3>Personal Information</h3>
              <div className="ticket-row">
                <span className="ticket-label">Full Name</span>
                <span className="ticket-value">{selectedUser.name || `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Email Address</span>
                <span className="ticket-value">{selectedUser.email || 'N/A'}</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">Mobile Number</span>
                <span className="ticket-value">{selectedUser.mobileNumber || 'N/A'}</span>
              </div>
            </div>
            
            <div className="ticket-section">
              <h3>Professional Credentials</h3>
              <div className="ticket-row" style={{ marginBottom: '20px' }}>
                <span className="ticket-label">Primary Specialty</span>
                <span className="ticket-value">{selectedUser.primarySpecialty || selectedUser.details?.specializations?.[0] || 'N/A'}</span>
              </div>
              
              {renderDocRow('PRC License', selectedUser.licenseNumber || selectedUser.details?.prcId?.number, selectedUser.prcIdUrl || selectedUser.details?.prcId?.imageUrl || PRC_Sample, 'PRC License')}
              {renderDocRow('S2 License', selectedUser.s2Number || selectedUser.details?.s2?.number, selectedUser.s2LicenseUrl || selectedUser.details?.s2?.imageUrl || S2_Sample, 'S2 License')}
              {renderDocRow('PTR Number', selectedUser.ptrNumber || selectedUser.details?.ptr?.number, selectedUser.ptrUrl || selectedUser.details?.ptr?.imageUrl || PTR_Sample, 'PTR Number')}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {activeSubTab === 'pending' ? (
              <>
                <button 
                  onClick={() => { handleApprove(selectedUser.userId || selectedUser.id); setSelectedUser(null); }} 
                  style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Approve Specialist
                </button>
                <button 
                  onClick={() => { triggerDeny(selectedUser.userId || selectedUser.id); setSelectedUser(null); }} 
                  style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Deny Application
                </button>
              </>
            ) : (
              <button 
                onClick={() => { handleSuspend(selectedUser.userId || selectedUser.id); setSelectedUser(null); }} 
                style={{ width: '100%', padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Suspend Account
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Deny Reason Modal */}
      {denyingSpecialistId && (
        <Modal title="Deny Specialist Application" onClose={() => setDenyingSpecialistId(null)}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
              Reason for Denial <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="E.g., Incomplete documents, invalid PRC license..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                minHeight: '100px',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setDenyingSpecialistId(null)}
              style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Cancel
            </button>
            <button 
              onClick={submitDeny}
              style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Confirm Denial
            </button>
          </div>
        </Modal>
      )}

      {/* Document Viewer Modal */}
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

export default SpecialistManagement;