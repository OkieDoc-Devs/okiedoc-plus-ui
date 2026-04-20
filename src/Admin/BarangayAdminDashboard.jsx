import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiGrid, FiUsers, FiFileText, FiCalendar, FiPieChart, FiSearch, FiEye } from 'react-icons/fi';

import AdminLayout from './Components/AdminLayout';
import MetricCard from './Components/MetricCard';
import Modal from './Components/Modal';
import UserTable from './UserManagement/UserTable.jsx';

import {
  getPatientAndNurseUsers,
  getTransactions,
  getAdminProfile,
} from '../api/Admin/api.js';

const BarangayAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminAvatar, setAdminAvatar] = useState('/account.svg');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [barangayName, setBarangayName] = useState('Loading...');
  
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
        const [usersData, transactionsData, adminProfileData] = await Promise.all([
          getPatientAndNurseUsers().catch(() => []),
          getTransactions().catch(() => []), 
          getAdminProfile().catch(() => null) 
        ]);

        const profileData = adminProfileData?.data || adminProfileData;
        if (profileData) {
            if (profileData.profileUrl && !profileData.profileUrl.includes('admin_avatar.png')) {
                setAdminAvatar(profileData.profileUrl);
            }
            if (profileData.barangay) {
                setBarangayName(profileData.barangay);
            } else {
                setBarangayName('Unassigned LGU');
            }
        }

        setUsers(safeArray(usersData));
        setTransactions(safeArray(transactionsData));
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

  const activeTickets = filteredTransactions.filter(t => {
    const stat = safeString(t.status);
    return !stat.includes('completed') && !stat.includes('cancel');
  });
  
  const historyTickets = filteredTransactions.filter(t => {
    const stat = safeString(t.status);
    return stat.includes('completed') || stat.includes('cancel');
  });

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { sessionStorage.removeItem('isAdminLoggedIn'); localStorage.removeItem('admin_token'); navigate('/login'); }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <FiGrid /> },
    { id: 'patients', label: 'Patients', icon: <FiUsers /> },
    { id: 'tickets', label: 'Consultation Tickets', icon: <FiFileText /> },
    { id: 'history', label: 'Consultation History', icon: <FiCalendar /> },
    { id: 'reports', label: 'Reports & Exports', icon: <FiPieChart /> }
  ];

  const renderSearchBar = () => (
    <div className="admin-search-wrapper">
      <FiSearch className="admin-search-icon" />
      <input type='text' placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="admin-search-input" />
    </div>
  );

  return (
    <AdminLayout
      title="Barangay Admin Dashboard"
      subtitle={`Assigned Location: ${barangayName}`}
      navLinks={navLinks}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      adminName="LGU Official"
      adminRole="Barangay Admin"
      adminAvatar={adminAvatar}
      onLogout={handleLogout}
      headerSearch={searchTerm}
      setHeaderSearch={setSearchTerm}
    >
      {activeTab === 'dashboard' && (
        <div className="metrics-grid">
          <MetricCard title="Total Residents" value={users.filter(u => (u.role || u.userType) === 'patient' || (u.role || u.userType) === 'Patient').length || "0"} trendText="Registered" trendType="neutral" />
          <MetricCard title="Active Consultations" value={activeTickets.length || "0"} trendText="Currently Ongoing" trendType="neutral" />
          <MetricCard title="Local Nurses" value={users.filter(u => (u.role || u.userType) === 'nurse' || (u.role || u.userType) === 'Nurse').length || "0"} trendText="Active" trendType="neutral" />
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="admin-page-card">
          <div className="admin-card-header"><h2 className="admin-card-title">Registered Residents ({barangayName})</h2></div>
          <UserTable users={filteredUsers.filter(u => (u.role || u.userType) === 'patient' || (u.role || u.userType) === 'Patient')} onView={setViewingUser} searchBar={renderSearchBar()} />
        </div>
      )}

      {(activeTab === 'tickets' || activeTab === 'history') && (
        <div className="admin-page-card">
          <div className="admin-card-header"><h2 className="admin-card-title">{activeTab === 'tickets' ? 'Active Consultation Tickets' : 'Consultation History'}</h2></div>
          <div className="admin-toolbar">{renderSearchBar()}</div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Patient Name</th>
                <th>Service Type</th>
                <th>Date Created</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'tickets' ? activeTickets : historyTickets).length > 0 ? 
                (activeTab === 'tickets' ? activeTickets : historyTickets).map(t => {
                const statusLabel = String(t.status).toLowerCase();
                let pillClass = 'status-pending';
                if (statusLabel.includes('completed')) pillClass = 'status-completed';
                if (statusLabel.includes('cancel')) pillClass = 'status-cancelled';
                if (statusLabel.includes('processing')) pillClass = 'status-processing';
                return (
                  <tr key={t.id}>
                    <td style={{fontWeight: 500}}>{t.ticketNumber || t.id}</td>
                    <td>{t.patientName || 'Unknown'}</td>
                    <td>{t.chiefComplaint || 'Consultation'}</td>
                    <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td><span className={`status-pill ${pillClass}`}>{t.status}</span></td>
                    <td><button className="view-btn" onClick={() => setViewingTicket(t)}><FiEye style={{marginBottom: '-2px'}}/> View</button></td>
                  </tr>
                )
              }) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No records found in this category.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reports' && (
         <div className="admin-page-card" style={{minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
           <div className="admin-empty-state" style={{border: 'none'}}>
             <FiPieChart style={{fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px'}}/>
             <h3 style={{margin: 0}}>Reports & Exports</h3>
             <p style={{marginTop: '8px'}}>This module is temporarily unavailable per system requirements.</p>
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
  );
};

export default BarangayAdminDashboard;