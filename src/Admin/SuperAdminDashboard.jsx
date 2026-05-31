import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiGrid, FiUserCheck, FiUsers, FiCalendar, FiCreditCard, 
  FiPieChart, FiFileText, FiSettings, FiSearch, FiDownload, FiEye, FiSave
} from 'react-icons/fi';

import AdminLayout from './Components/AdminLayout';
import MetricCard from './Components/MetricCard';
import Modal from './Components/Modal';

import PendingTable from './Specialistdashboard/PendingTable';
import SpecialistTable from './Specialistdashboard/SpecialistTable';
import UserTable from './UserManagement/UserTable.jsx';
import { handleExport } from './utils/exportUtils';
import { apiRequest } from '../api/apiClient';

import {
  getSpecialists, getPendingApplications, getTransactions,
  getPatientAndNurseUsers, getAdminProfile,
  updateSpecialistStatus, uploadAdminAvatar
} from '../api/Admin/api.js';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminAvatar, setAdminAvatar] = useState('/account.svg');

  const [searchTerm, setSearchTerm] = useState(''); 
  const [viewingTicket, setViewingTicket] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [denyingSpecialistId, setDenyingSpecialistId] = useState(null);
  const [denyReason, setDenyReason] = useState('');

  // DYNAMIC BASE FEES
  const [baseInputs, setBaseInputs] = useState({
    gpFee: 500, specialistFee: 800, processingFee: 50, convenienceFee: 25,
    medCertFee: 150, labRequestFee: 100, prescriptionFee: 100, treatmentPlanFee: 200,
    checkoutNotes: 'Please settle your payment to confirm your consultation.'
  });
  const [isSavingFees, setIsSavingFees] = useState(false);

  const safeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.transactions)) return data.transactions;
    if (Array.isArray(data.specialists)) return data.specialists;
    if (Array.isArray(data.pendingApplications)) return data.pendingApplications;
    return [];
  };

  useEffect(() => {
    setSearchTerm(''); 
  }, [activeTab]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const [
          specialistsData, pendingData, transactionsData, usersData, adminProfileData, baseFeeData
        ] = await Promise.all([
          getSpecialists().catch(() => []), 
          getPendingApplications().catch(() => []), 
          getTransactions().catch(() => []),
          getPatientAndNurseUsers().catch(() => []), 
          getAdminProfile().catch(() => null),
          apiRequest('/api/v1/admin/base-inputs').catch(() => null) 
        ]);

        const profile = adminProfileData?.data || adminProfileData;
        if (profile?.profileUrl && !profile.profileUrl.includes('admin_avatar.png')) {
          setAdminAvatar(profile.profileUrl);
        }

        if (baseFeeData?.data) {
          setBaseInputs(baseFeeData.data);
        }

        const rawSpecs = safeArray(specialistsData);
        setSpecialists(rawSpecs.map(spec => ({
          ...spec,
          name: `${spec.firstName || ''} ${spec.lastName || ''}`.trim() || 'Unknown',
        })));
        
        setPendingApplications(safeArray(pendingData));
        setTransactions(safeArray(transactionsData));
        setUsers(safeArray(usersData));
      } catch (error) { console.error('Failed to fetch data:', error); }
    };
    fetchAndProcessData();
  }, []);

  const safeString = (val) => String(val || '').toLowerCase();
  
  const filteredPending = pendingApplications.filter(app => (!searchTerm || safeString(app.name).includes(searchTerm.toLowerCase())));
  const filteredSpecialists = specialists.filter(spec => (!searchTerm || safeString(spec.name).includes(searchTerm.toLowerCase())));
  const filteredUsers = users.filter(user => (!searchTerm || safeString(user.firstName).includes(searchTerm.toLowerCase())));

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = !searchTerm || safeString(t.ticketNumber).includes(searchTerm.toLowerCase()) || safeString(t.patientName).includes(searchTerm.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === 'active_tickets') matchesTab = !safeString(t.status).includes('completed') && !safeString(t.status).includes('cancel');
      if (activeTab === 'payments') matchesTab = true; 
      if (activeTab === 'hmo') matchesTab = t.isUsingHmo === true;
      
      return matchesSearch && matchesTab;
    });
  }, [transactions, searchTerm, activeTab]);

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { sessionStorage.removeItem('isAdminLoggedIn'); localStorage.removeItem('admin_token'); navigate('/login'); }
  };

  const handleApproveSpecialist = async (id) => {
    if (!window.confirm("Are you sure you want to approve this specialist?")) return;
    try { 
      await updateSpecialistStatus({ specialistId: String(id), status: 'approved' }); 
      alert('Specialist successfully approved!');
      window.location.reload(); 
    } catch (e) { 
      console.error(e);
      alert('Failed to approve specialist. Check console.'); 
    }
  };

  const triggerDenySpecialist = (id) => {
    setDenyReason('');
    setDenyingSpecialistId(id);
  };

  const submitDenySpecialist = async () => {
    if (!denyReason.trim()) {
      alert("Please provide a reason for denial.");
      return;
    }
    try { 
      await updateSpecialistStatus({ specialistId: String(denyingSpecialistId), status: 'denied', denialReason: denyReason }); 
      alert('Specialist application denied.');
      setDenyingSpecialistId(null);
      window.location.reload(); 
    } catch (e) { 
      console.error(e);
      alert('Failed to deny specialist. Check console.'); 
    }
  };

  const handleSuspendSpecialist = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this active specialist?")) return;
    try { 
      await updateSpecialistStatus({ specialistId: String(id), status: 'suspended' }); 
      alert('Specialist account suspended.');
      window.location.reload(); 
    } catch (e) { 
      console.error(e);
      alert('Failed to suspend specialist. Check console.'); 
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await uploadAdminAvatar(file);
      setAdminAvatar(result.profileUrl); 
    } catch (error) { alert('Failed to upload avatar: ' + error.message); }
  };

  const handleSaveFees = async () => {
    setIsSavingFees(true);
    try {
      await apiRequest('/api/v1/admin/base-inputs', {
        method: 'PUT',
        body: JSON.stringify(baseInputs)
      });
      alert('Global System Fees have been updated successfully.');
    } catch (err) {
      alert('Failed to save fees: ' + err.message);
    } finally {
      setIsSavingFees(false);
    }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <FiGrid /> },
    { 
      id: 'specialists-group', label: 'Specialist management', icon: <FiUserCheck />,
      subLinks: [
        { id: 'pending', label: 'Pending Applications' },
        { id: 'specialists', label: 'Approved specialist' }
      ]
    },
    { 
      id: 'users-group', label: 'User Management', icon: <FiUsers />,
      subLinks: [
        { id: 'patients', label: 'Patients' },
        { id: 'nurses', label: 'Nurses' },
        { id: 'physicians', label: 'General Physician' }
      ]
    },
    { 
      id: 'consultation-group', label: 'Consultation Management', icon: <FiCalendar />,
      subLinks: [
        { id: 'active_tickets', label: 'Active tickets' },
        { id: 'all_consultations', label: 'All Consultation' }
      ]
    },
    { 
      id: 'billing-group', label: 'Billing & Transactions', icon: <FiCreditCard />,
      subLinks: [
        { id: 'payments', label: 'Payments' },
        { id: 'hmo', label: 'HMO / Insurance' }
      ]
    },
    { id: 'reports', label: 'Reports & Exports', icon: <FiPieChart /> },
    { id: 'audit_logs', label: 'Audit Logs', icon: <FiFileText /> },
    { 
      id: 'settings-group', label: 'System Settings', icon: <FiSettings />,
      subLinks: [
        { id: 'fee_config', label: 'Fee configuration' },
        { id: 'role_permissions', label: 'Role Permissions' }
      ]
    }
  ];

  const isSpecialistTab = activeTab === 'specialists' || activeTab === 'pending';
  const isUserTab = activeTab === 'patients' || activeTab === 'physicians' || activeTab === 'nurses';
  const isConsultationTab = activeTab === 'active_tickets' || activeTab === 'all_consultations';
  const isBillingTab = activeTab === 'payments' || activeTab === 'hmo';
  const isSettingsTab = activeTab === 'fee_config' || activeTab === 'role_permissions';

  const displayedUsers = filteredUsers.filter(u => {
    const role = String(u.role || u.userType || '').toLowerCase();
    if (activeTab === 'patients') return role === 'patient';
    if (activeTab === 'physicians') return role === 'physician' || role === 'general_physician' || role === 'specialist';
    if (activeTab === 'nurses') return role === 'nurse';
    return true;
  });

  const renderSearchBar = () => (
    <div className="admin-search-wrapper">
      <FiSearch className="admin-search-icon" />
      <input type='text' placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="admin-search-input" />
    </div>
  );

  return (
    <>
      <style>
        {`
          table tbody td button,
          .admin-table tbody td button,
          .view-btn, .approve-btn, .deny-btn {
            display: inline-flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            white-space: nowrap !important;
            padding: 8px 16px !important;
            height: auto !important;
            margin-right: 8px !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            border-radius: 6px !important;
            font-weight: 600 !important;
            border: none !important;
            cursor: pointer !important;
            font-size: 0.9rem !important;
            line-height: 1 !important;
          }
          table tbody td button:last-child,
          .admin-table tbody td button:last-child {
            margin-right: 0 !important;
          }
          table tbody td button svg,
          .admin-table tbody td button svg,
          .view-btn svg, .approve-btn svg, .deny-btn svg {
            margin: 0 !important;
            display: block !important;
            position: static !important;
            transform: none !important;
          }
        `}
      </style>

      <AdminLayout
        title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}
        subtitle="Overview of system activities and user management"
        navLinks={navLinks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminName="System Admin"
        adminRole="Super Admin"
        adminAvatar={adminAvatar}
        onLogout={handleLogout}
        onAvatarUpload={handleAvatarChange}
        headerSearch={searchTerm}
        setHeaderSearch={setSearchTerm}
      >
        {activeTab === 'dashboard' && (
          <div className="metrics-grid">
            <MetricCard title="Total Patients" value={users.filter(u=>String(u.role || u.userType).toLowerCase() === 'patient').length || "0"} trendText="Active" trendType="neutral" />
            <MetricCard title="Active Specialists" value={specialists.length || "0"} trendText="Verified" trendType="up" />
            <MetricCard title="Pending Applications" value={pendingApplications.length || "0"} trendText="Requires Review" trendType="warning" />
            <MetricCard title="Total Transactions" value={transactions.length || "0"} trendText="Lifetime" trendType="neutral" />
          </div>
        )}

        <div style={{ display: activeTab !== 'dashboard' ? 'block' : 'none' }}>
          
          {isSpecialistTab && (
            <div className="admin-page-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Specialist Management</h2>
                <div className="admin-tabs">
                  <button className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending Applications</button>
                  <button className={`admin-tab ${activeTab === 'specialists' ? 'active' : ''}`} onClick={() => setActiveTab('specialists')}>Approved Specialist</button>
                </div>
              </div>
              
              {activeTab === 'specialists' && <SpecialistTable specialists={filteredSpecialists} onSuspend={handleSuspendSpecialist} searchBar={renderSearchBar()} />}
              {activeTab === 'pending' && <PendingTable applications={filteredPending} onApprove={handleApproveSpecialist} onDeny={triggerDenySpecialist} searchBar={renderSearchBar()} />}
            </div>
          )}

          {isUserTab && (
            <div className="admin-page-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">User Management</h2>
                <div className="admin-tabs">
                  <button className={`admin-tab ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>Patients</button>
                  <button className={`admin-tab ${activeTab === 'nurses' ? 'active' : ''}`} onClick={() => setActiveTab('nurses')}>Nurses</button>
                  <button className={`admin-tab ${activeTab === 'physicians' ? 'active' : ''}`} onClick={() => setActiveTab('physicians')}>General Physician</button>
                </div>
              </div>
              <UserTable users={displayedUsers} onView={setViewingUser} searchBar={renderSearchBar()} />
            </div>
          )}

          {(isConsultationTab || isBillingTab) && (
            <div className="admin-page-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">{isConsultationTab ? 'Consultation Management' : 'Billing & Transactions'}</h2>
                <div className="admin-tabs">
                  {isConsultationTab ? (
                    <>
                      <button className={`admin-tab ${activeTab === 'active_tickets' ? 'active' : ''}`} onClick={() => setActiveTab('active_tickets')}>Active Tickets</button>
                      <button className={`admin-tab ${activeTab === 'all_consultations' ? 'active' : ''}`} onClick={() => setActiveTab('all_consultations')}>All Consultation</button>
                    </>
                  ) : (
                    <>
                      <button className={`admin-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>Payments</button>
                      <button className={`admin-tab ${activeTab === 'hmo' ? 'active' : ''}`} onClick={() => setActiveTab('hmo')}>HMO / Insurance</button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="admin-toolbar">
                {renderSearchBar()}
                <button className="admin-export-btn" onClick={() => handleExport(filteredTransactions, 'records.csv')}><FiDownload /> Export Logs</button>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Patient Name</th>
                    <th>Provider</th>
                    <th>Service Type</th>
                    <th>Date Created</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? filteredTransactions.map(t => {
                    const statusLabel = String(t.status).toLowerCase();
                    let pillClass = 'status-pending';
                    if (statusLabel.includes('completed')) pillClass = 'status-completed';
                    if (statusLabel.includes('cancel')) pillClass = 'status-cancelled';
                    if (statusLabel.includes('processing')) pillClass = 'status-processing';
                    if (t.isUsingHmo) pillClass = 'status-hmo';

                    return (
                      <tr key={t.id}>
                        <td style={{fontWeight: 500}}>{t.ticketNumber || t.id}</td>
                        <td>{t.patientName || 'Unknown'}</td>
                        <td>{t.specialistName || 'Unassigned'}</td>
                        <td>{t.chiefComplaint || 'Consultation'}</td>
                        <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td><span className={`status-pill ${pillClass}`}>{t.isUsingHmo ? 'HMO Claim' : t.status}</span></td>
                        <td>
                          <button className="view-btn" onClick={() => setViewingTicket(t)}><FiEye size={16}/> View</button>
                        </td>
                      </tr>
                    )
                  }) : <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No records found in this category.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {isSettingsTab && (
            <div className="admin-page-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="admin-card-header" style={{ padding: '24px 30px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 className="admin-card-title">System Settings</h2>
                <div className="admin-tabs" style={{ marginBottom: 0 }}>
                  <button className={`admin-tab ${activeTab === 'fee_config' ? 'active' : ''}`} onClick={() => setActiveTab('fee_config')}>Fee Configuration</button>
                  <button className={`admin-tab ${activeTab === 'role_permissions' ? 'active' : ''}`} onClick={() => setActiveTab('role_permissions')}>Role Permissions</button>
                </div>
              </div>
              
              {activeTab === 'fee_config' ? (
                <div style={{ padding: '30px', backgroundColor: '#f8fafc' }}>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    padding: '30px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCreditCard style={{ color: '#0ea5e9' }} /> 
                        Global Fee Variables
                      </h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                        Set the base parameters for unassigned tickets and standard processing fees across the system.
                      </p>
                    </div>
                    
                    {/* FIXED GRID LAYOUT: Strict 3-column layout that avoids overlapping */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                      
                      <div style={{ width: '100%' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>GP Base Fee (₱)</label>
                        <div style={{position: 'relative', width: '100%'}}>
                          <span style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold'}}>₱</span>
                          <input type="number" value={baseInputs.gpFee} onChange={e => setBaseInputs({...baseInputs, gpFee: Number(e.target.value)})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', paddingLeft: '28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>
                      
                      <div style={{ width: '100%' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>Specialist Base Fee (₱)</label>
                        <div style={{position: 'relative', width: '100%'}}>
                          <span style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold'}}>₱</span>
                          <input type="number" value={baseInputs.specialistFee} onChange={e => setBaseInputs({...baseInputs, specialistFee: Number(e.target.value)})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', paddingLeft: '28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>System Processing Fee (₱)</label>
                        <div style={{position: 'relative', width: '100%'}}>
                          <span style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold'}}>₱</span>
                          <input type="number" value={baseInputs.processingFee} onChange={e => setBaseInputs({...baseInputs, processingFee: Number(e.target.value)})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', paddingLeft: '28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>Gateway Convenience Fee (₱)</label>
                        <div style={{position: 'relative', width: '100%'}}>
                          <span style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold'}}>₱</span>
                          <input type="number" value={baseInputs.convenienceFee} onChange={e => setBaseInputs({...baseInputs, convenienceFee: Number(e.target.value)})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', paddingLeft: '28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>Med Cert Base Fee (₱)</label>
                        <div style={{position: 'relative', width: '100%'}}>
                          <span style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold'}}>₱</span>
                          <input type="number" value={baseInputs.medCertFee} onChange={e => setBaseInputs({...baseInputs, medCertFee: Number(e.target.value)})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', paddingLeft: '28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>Lab Request Base Fee (₱)</label>
                        <div style={{position: 'relative', width: '100%'}}>
                          <span style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold'}}>₱</span>
                          <input type="number" value={baseInputs.labRequestFee} onChange={e => setBaseInputs({...baseInputs, labRequestFee: Number(e.target.value)})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', paddingLeft: '28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>Prescription Base Fee (₱)</label>
                        <div style={{position: 'relative', width: '100%'}}>
                          <span style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold'}}>₱</span>
                          <input type="number" value={baseInputs.prescriptionFee} onChange={e => setBaseInputs({...baseInputs, prescriptionFee: Number(e.target.value)})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', paddingLeft: '28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>Treatment Plan Base Fee (₱)</label>
                        <div style={{position: 'relative', width: '100%'}}>
                          <span style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold'}}>₱</span>
                          <input type="number" value={baseInputs.treatmentPlanFee} onChange={e => setBaseInputs({...baseInputs, treatmentPlanFee: Number(e.target.value)})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', paddingLeft: '28px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>

                      <div style={{ gridColumn: '1 / -1', width: '100%', marginTop: '8px' }}>
                        <label style={{display:'block', marginBottom:'8px', fontSize: '0.85rem', fontWeight:600, color: '#475569'}}>Global Checkout Notes</label>
                        <textarea value={baseInputs.checkoutNotes} onChange={e => setBaseInputs({...baseInputs, checkoutNotes: e.target.value})} className="admin-search-input" style={{width:'100%', boxSizing: 'border-box', minHeight: '80px', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', resize: 'vertical', lineHeight: '1.5'}}/>
                        <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px'}}>This text will dynamically appear on all patient checkout invoices.</p>
                      </div>
                    </div>

                    <div style={{marginTop: '30px', textAlign: 'right', borderTop: '1px solid #f1f5f9', paddingTop: '20px'}}>
                      <button 
                        onClick={handleSaveFees} 
                        disabled={isSavingFees}
                        style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#0ea5e9', 
                          color: 'white', 
                          padding: '10px 24px', 
                          borderRadius: '8px', 
                          fontWeight: 600, 
                          border: 'none', 
                          cursor: isSavingFees ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => { if(!isSavingFees) e.currentTarget.style.background = '#0284c7'; }}
                        onMouseOut={(e) => { if(!isSavingFees) e.currentTarget.style.background = '#0ea5e9'; }}
                      >
                        <FiSave size={18} />
                        {isSavingFees ? 'Saving Configuration...' : 'Save Global Fees'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="admin-empty-state" style={{border: 'none', height: '300px', backgroundColor: '#f8fafc'}}>
                  <FiUsers style={{fontSize: '3rem', color: '#cbd5e1', margin: '0 auto 16px auto'}}/>
                  <h3 style={{margin: 0, textAlign: 'center'}}>Role Permissions</h3>
                  <p style={{marginTop: '8px', textAlign: 'center'}}>This module is currently under development.</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'reports' || activeTab === 'audit_logs') && (
             <div className="admin-page-card" style={{minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
               <div className="admin-empty-state" style={{border: 'none'}}>
                 {activeTab === 'reports' ? <FiPieChart style={{fontSize: '3rem', color: '#cbd5e1', margin: '0 auto 16px auto'}}/> : <FiFileText style={{fontSize: '3rem', color: '#cbd5e1', margin: '0 auto 16px auto'}}/>}
                 <h3 style={{margin: 0, textAlign: 'center'}}>{activeTab === 'reports' ? 'Reports & Exports' : 'System Audit Logs'}</h3>
                 <p style={{marginTop: '8px', textAlign: 'center'}}>This module is temporarily unavailable per system requirements.</p>
               </div>
             </div>
          )}
        </div>

        {viewingTicket && (
          <Modal title={`Ticket Details: ${viewingTicket.ticketNumber || viewingTicket.id}`} onClose={() => setViewingTicket(null)}>
            <div className="ticket-modal-grid">
              <div className="ticket-section">
                <h3>Consultation Details</h3>
                <div className="ticket-row"><span className="ticket-label">Patient Name</span><span className="ticket-value">{viewingTicket.patientName || 'Unknown'}</span></div>
                <div className="ticket-row"><span className="ticket-label">Complaint</span><span className="ticket-value">{viewingTicket.chiefComplaint || 'General'}</span></div>
                <div className="ticket-row"><span className="ticket-label">Symptoms</span><span className="ticket-value">{viewingTicket.symptoms || 'None'}</span></div>
                <div className="ticket-row"><span className="ticket-label">Channel</span><span className="ticket-value" style={{textTransform:'capitalize'}}>{(viewingTicket.consultationChannel || 'standard').replace('_', ' ')}</span></div>
                <div className="ticket-row"><span className="ticket-label">Date</span><span className="ticket-value">{viewingTicket.createdAt ? new Date(viewingTicket.createdAt).toLocaleString() : 'N/A'}</span></div>
              </div>
              <div className="ticket-section">
                <h3>Billing & Provider</h3>
                <div className="ticket-row"><span className="ticket-label">Provider</span><span className="ticket-value">{viewingTicket.specialistName || 'Awaiting Assignment'}</span></div>
                <div className="ticket-row"><span className="ticket-label">Specialty</span><span className="ticket-value">{viewingTicket.targetSpecialty || 'General Practice'}</span></div>
                <div className="ticket-row"><span className="ticket-label">Payment Method</span><span className="ticket-value">{viewingTicket.isUsingHmo ? 'HMO Coverage' : 'Direct Pay'}</span></div>
                {viewingTicket.isUsingHmo && <div className="ticket-row"><span className="ticket-label">HMO Provider</span><span className="ticket-value" style={{color: '#0ea5e9'}}>{viewingTicket.hmoProvider}</span></div>}
                <div className="ticket-row"><span className="ticket-label">Total Amount</span><span className="ticket-value">₱{Number(viewingTicket.totalAmount || 0).toFixed(2)}</span></div>
              </div>
            </div>
            <button className="admin-modal-close-btn" onClick={() => setViewingTicket(null)}>Close Ticket</button>
          </Modal>
        )}

        {viewingUser && (
          <Modal title="User Profile" onClose={() => setViewingUser(null)}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full Name</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingUser.firstName} {viewingUser.lastName}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Email Address</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingUser.email}</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Phone Number</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#0f172a' }}>{viewingUser.mobileNumber || 'Not provided'}</p>
            </div>
            <button className="admin-modal-close-btn" onClick={() => setViewingUser(null)}>Close</button>
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
              onClick={submitDenySpecialist}
              style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Confirm Denial
            </button>
          </div>
        </Modal>
      )}
      </AdminLayout>
    </>
  );
};

export default SuperAdminDashboard;