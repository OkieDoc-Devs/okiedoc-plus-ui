import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiGrid, FiUserCheck, FiUsers, FiCalendar, FiCreditCard, 
  FiPieChart, FiFileText, FiSettings, FiSearch, FiDownload, FiEye 
} from 'react-icons/fi';

import AdminLayout from './Components/AdminLayout';
import MetricCard from './Components/MetricCard';
import Modal from './Components/Modal';

import PendingTable from './Specialistdashboard/PendingTable';
import SpecialistTable from './Specialistdashboard/SpecialistTable';
import UserTable from './UserManagement/UserTable.jsx';
import { handleExport } from './utils/exportUtils';

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

  const [searchTerm, setSearchTerm] = useState(''); // This state is now shared globally!
  const [viewingTicket, setViewingTicket] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);

  const [systemFees, setSystemFees] = useState({
    doctorsFee: { isActive: true, name: "Doctor's Fee" },
    processingFee: { isActive: true, name: 'Processing Fee' },
    convenienceFee: { isActive: true, name: 'Convenience Fee' },
  });

  useEffect(() => {
    setSearchTerm(''); 
  }, [activeTab]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const [
          specialistsData, pendingData, transactionsData, usersData, adminProfileData 
        ] = await Promise.all([
          getSpecialists(), getPendingApplications(), getTransactions(),
          getPatientAndNurseUsers(), getAdminProfile().catch(() => null) 
        ]);

        if (adminProfileData?.profileUrl && !adminProfileData.profileUrl.includes('admin_avatar.png')) {
          setAdminAvatar(adminProfileData.profileUrl);
        }

        const processSpec = (arr) => (Array.isArray(arr) ? arr : arr?.data || []).map((spec) => ({
          ...spec,
          name: `${spec.firstName || ''} ${spec.lastName || ''}`.trim(),
        }));

        setSpecialists(processSpec(specialistsData));
        setPendingApplications((Array.isArray(pendingData) ? pendingData : pendingData?.data || []));
        setTransactions(Array.isArray(transactionsData) ? transactionsData : transactionsData?.data || []);
        setUsers(Array.isArray(usersData) ? usersData : usersData?.data || []);
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

  const handleUpdateSpecialistStatus = async (id, status) => {
    try { await updateSpecialistStatus({ specialistId: id, status }); setSpecialists(prev => prev.map(s => s.id === id ? { ...s, status } : s)); } 
    catch (e) { alert('Update failed'); }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await uploadAdminAvatar(file);
      setAdminAvatar(result.profileUrl); 
    } catch (error) { alert('Failed to upload avatar: ' + error.message); }
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
    const role = (u.role || '').toLowerCase();
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
          <MetricCard title="Total Patients" value={users.filter(u=>u.role==='patient').length || "0"} trendText="Active" trendType="neutral" />
          <MetricCard title="Active Specialists" value={specialists.length || "0"} trendText="Verified" trendType="up" />
          <MetricCard title="Pending Applications" value={pendingApplications.length} trendText="Requires Review" trendType="warning" />
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
            {activeTab === 'specialists' && <SpecialistTable specialists={filteredSpecialists} onStatusChange={handleUpdateSpecialistStatus} searchBar={renderSearchBar()} />}
            {activeTab === 'pending' && <PendingTable applications={filteredPending} onApprove={() => {}} onDeny={() => {}} searchBar={renderSearchBar()} />}
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
                  const statusLabel = t.status.toLowerCase();
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
                        <button className="view-btn" onClick={() => setViewingTicket(t)}><FiEye style={{marginBottom: '-2px'}}/> View</button>
                      </td>
                    </tr>
                  )
                }) : <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No records found in this category.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {isSettingsTab && (
          <div className="admin-page-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">System Settings</h2>
              <div className="admin-tabs">
                <button className={`admin-tab ${activeTab === 'fee_config' ? 'active' : ''}`} onClick={() => setActiveTab('fee_config')}>Fee Configuration</button>
                <button className={`admin-tab ${activeTab === 'role_permissions' ? 'active' : ''}`} onClick={() => setActiveTab('role_permissions')}>Role Permissions</button>
              </div>
            </div>
            
            {activeTab === 'fee_config' ? (
              <div>
                {Object.entries(systemFees).map(([key, fee]) => (
                  <div key={key} className="settings-row">
                    <div className="settings-info">
                      <span className="settings-name">{fee.name}</span>
                      <span className="settings-desc">Toggle to enable or disable this fee platform-wide.</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={fee.isActive} onChange={() => setSystemFees(prev => ({...prev, [key]: {...prev[key], isActive: !prev[key].isActive}}))} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty-state" style={{border: 'none', height: '300px'}}>
                <FiUsers style={{fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px'}}/>
                <h3 style={{margin: 0}}>Role Permissions</h3>
                <p style={{marginTop: '8px'}}>This module is currently under development.</p>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'reports' || activeTab === 'audit_logs') && (
           <div className="admin-page-card" style={{minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
             <div className="admin-empty-state" style={{border: 'none'}}>
               {activeTab === 'reports' ? <FiPieChart style={{fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px'}}/> : <FiFileText style={{fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px'}}/>}
               <h3 style={{margin: 0}}>{activeTab === 'reports' ? 'Reports & Exports' : 'System Audit Logs'}</h3>
               <p style={{marginTop: '8px'}}>This module is temporarily unavailable per system requirements.</p>
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
    </AdminLayout>
  );
};

export default SuperAdminDashboard;