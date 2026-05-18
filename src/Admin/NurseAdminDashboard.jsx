import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiGrid, FiCalendar, FiUsers, FiFileText, FiPieChart, FiSearch, FiEye, FiUserPlus } from 'react-icons/fi';

import AdminLayout from './Components/AdminLayout';
import MetricCard from './Components/MetricCard';
import Modal from './Components/Modal';
import UserTable from './UserManagement/UserTable.jsx';

import {
  getTransactions,
  getPatientAndNurseUsers,
  getAdminProfile,
} from '../api/Admin/api.js';

const NurseAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminAvatar, setAdminAvatar] = useState('/account.svg');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const safeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.transactions)) return data.transactions;
    return [];
  };

  useEffect(() => { setSearchTerm(''); }, [activeTab]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const [transactionsData, usersData, adminProfileData] = await Promise.all([
          getTransactions().catch(() => []),
          getPatientAndNurseUsers().catch(() => []), 
          getAdminProfile().catch(() => null) 
        ]);

        const profileData = adminProfileData?.data || adminProfileData;
        if (profileData?.profileUrl && !profileData.profileUrl.includes('admin_avatar.png')) {
          setAdminAvatar(profileData.profileUrl);
        }

        setTransactions(safeArray(transactionsData));
        setUsers(safeArray(usersData));
      } catch (error) { console.error('Failed to fetch data:', error); }
    };
    fetchAndProcessData();
  }, []);

  const safeString = (val) => String(val || '').toLowerCase();
  
  const filteredUsers = users.filter(user => (!searchTerm || safeString(user.firstName).includes(searchTerm.toLowerCase())));

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      return !searchTerm || safeString(t.ticketNumber).includes(searchTerm.toLowerCase()) || safeString(t.patientName).includes(searchTerm.toLowerCase());
    });
  }, [transactions, searchTerm]);

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { sessionStorage.removeItem('isAdminLoggedIn'); localStorage.removeItem('admin_token'); navigate('/login'); }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <FiGrid /> },
    { id: 'consultations', label: 'Consultation Management', icon: <FiCalendar /> },
    { id: 'patients', label: 'Patients', icon: <FiUsers /> },
    { id: 'logs', label: 'Nurse Activity logs', icon: <FiFileText /> },
    { id: 'reports', label: 'Reports', icon: <FiPieChart /> }
  ];

  const renderSearchBar = () => (
    <div className="admin-search-wrapper" style={{ marginBottom: '2px', padding: '0 0px' }}>
      <FiSearch className="admin-search-icon" style={{ left: '0px' }} />
      <input type='text' placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="admin-search-input" />
    </div>
  );

  return (
    <>
      <style>
        {`
          .admin-table-container table tbody td button,
          .admin-table-container table tbody td a,
          .admin-table-container .view-btn {
            display: inline-flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            padding: 6px 16px !important;
            margin: 0 !important;
            height: auto !important;
            white-space: nowrap !important;
            line-height: 1 !important;
          }

          /* Strips hidden margins/transforms from the eye icon */
          .admin-table-container table tbody td button svg,
          .admin-table-container table tbody td a svg,
          .admin-table-container .view-btn svg {
            position: static !important;
            margin: 0 !important;
            display: block !important;
            transform: none !important;
          }
        `}
      </style>

      <AdminLayout
        title="Nurse Admin Dashboard"
        subtitle="Triage, assignments, and consultation oversight"
        navLinks={navLinks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminName="Head Nurse"
        adminRole="Nurse Admin"
        adminAvatar={adminAvatar}
        onLogout={handleLogout}
        headerSearch={searchTerm}
        setHeaderSearch={setSearchTerm}
      >
        {activeTab === 'dashboard' && (
          <div className="metrics-grid">
            <MetricCard title="Active Consultations" value={transactions.filter(t => t.status === 'active').length || "0"} trendText="Live Now" trendType="neutral" />
            <MetricCard title="Pending Triages" value={transactions.filter(t => t.status === 'pending' || t.status === 'processing').length || "0"} trendText="Requires Attention" trendType="warning" />
            <MetricCard title="Total Patients" value={users.filter(u=>(u.role || u.userType)==='patient').length || "0"} trendText="Registered" trendType="neutral" />
          </div>
        )}

        {activeTab === 'consultations' && (
           <div className="admin-page-card admin-table-container" style={{ padding: 0 }}>
             
           {/* REFACTORED HEADER: Added explicit padding to pull it away from the card edges */}
           <div style={{ 
             display: 'flex', 
             flexDirection: 'row',
             alignItems: 'center', 
             justifyContent: 'space-between',
             padding: '24px 32px 16px 32px',
             borderBottom: '1px solid #e2e8f0', 
             marginBottom: '0px',
             width: '100%',
             boxSizing: 'border-box'
           }}>
             <h2 style={{ 
               margin: 0, 
               padding: 0, 
               fontSize: '1.25rem', 
               color: '#0f172a', 
               fontWeight: '700', 
               lineHeight: '1' 
             }}>
               Consultation Management
             </h2>
           </div>

           <div className="admin-toolbar">{renderSearchBar()}</div>
           <div style={{ padding: '0 0px 32px 0' }}>
             <table className="admin-table" style={{ width: '100%' }}>
               <thead>
                 <tr>
                   <th>Ticket ID</th>
                   <th>Patient Name</th>
                   <th>Provider</th>
                   <th>Complaint</th>
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
                   return (
                     <tr key={t.id}>
                       <td style={{fontWeight: 500}}>{t.ticketNumber || t.id}</td>
                       <td>{t.patientName || 'Unknown'}</td>
                       <td>{t.specialistName || 'Unassigned'}</td>
                       <td>{t.chiefComplaint || 'Consultation'}</td>
                       <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                       <td><span className={`status-pill ${pillClass}`}>{t.status}</span></td>
                       <td>
                         <button className="view-btn" onClick={() => setViewingTicket(t)}>
                           <FiEye size={16} /> View
                         </button>
                       </td>
                     </tr>
                   )
                 }) : <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No records found.</td></tr>}
               </tbody>
             </table>
           </div>
         </div>
        )}

        {activeTab === 'patients' && (
          <div className="admin-page-card admin-table-container" style={{ padding: 0 }}>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '24px 32px 16px 32px',
              borderBottom: '1px solid #e2e8f0', 
              marginBottom: '0px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h2 style={{ 
                margin: 0, 
                padding: 0,
                fontSize: '1.25rem', 
                color: '#0f172a', 
                fontWeight: '700',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center'
              }}>
                Patient Directory
              </h2>
              
              <button 
                onClick={() => navigate('/admin/create-patient')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px', 
                  backgroundColor: '#0aadef', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  fontSize: '0.95rem',
                  lineHeight: '1',
                  margin: 0,
                  boxShadow: '0 2px 4px rgba(10, 173, 239, 0.2)'
                }}
              >
                <FiUserPlus size={18} />
                Create Patient
              </button>
            </div>
            
            <div style={{ padding: '0 0px 32px 0' }}>
              <UserTable users={filteredUsers.filter(u => (u.role || u.userType) === 'patient' || (u.role || u.userType) === 'Patient')} onView={setViewingUser} searchBar={renderSearchBar()} />
            </div>
          </div>
        )}

        {(activeTab === 'logs' || activeTab === 'reports') && (
           <div className="admin-page-card" style={{minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
             <div className="admin-empty-state" style={{border: 'none'}}>
               {activeTab === 'logs' ? <FiFileText style={{fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px'}}/> : <FiPieChart style={{fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px'}}/>}
               <h3 style={{margin: 0}}>{activeTab === 'logs' ? 'Nurse Activity Logs' : 'Reports & Analytics'}</h3>
               <p style={{marginTop: '8px'}}>This module is temporarily unavailable pending database integration.</p>
             </div>
           </div>
        )}

        {viewingTicket && (
          <Modal title={`Ticket Details: ${viewingTicket.ticketNumber || viewingTicket.id}`} onClose={() => setViewingTicket(null)}>
             <div className="ticket-modal-grid">
              <div className="ticket-section">
                <h3>Consultation Details</h3>
                <div className="ticket-row"><span className="ticket-label">Patient Name</span><span className="ticket-value">{viewingTicket.patientName || 'Unknown'}</span></div>
                <div className="ticket-row"><span className="ticket-label">Complaint</span><span className="ticket-value">{viewingTicket.chiefComplaint || 'General'}</span></div>
                <div className="ticket-row"><span className="ticket-label">Date</span><span className="ticket-value">{viewingTicket.createdAt ? new Date(viewingTicket.createdAt).toLocaleString() : 'N/A'}</span></div>
              </div>
            </div>
            <button className="admin-modal-close-btn" onClick={() => setViewingTicket(null)}>Close</button>
          </Modal>
        )}

        {viewingUser && (
          <Modal title="User Profile" onClose={() => setViewingUser(null)}>
            <div style={{ marginBottom: '16px' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full Name</span><p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{viewingUser.firstName} {viewingUser.lastName}</p></div>
            <div style={{ marginBottom: '16px' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Email Address</span><p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{viewingUser.email}</p></div>
            <button className="admin-modal-close-btn" onClick={() => setViewingUser(null)}>Close</button>
          </Modal>
        )}
      </AdminLayout>
    </>
  );
};

export default NurseAdminDashboard;