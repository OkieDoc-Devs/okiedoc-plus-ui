import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiPieChart, FiCreditCard, FiUserCheck, FiUsers, FiSettings, FiSearch, FiDownload } from 'react-icons/fi';

import AdminLayout from './Components/AdminLayout';
import MetricCard from './Components/MetricCard';
import Modal from './Components/Modal';

import PendingTable from './Specialistdashboard/PendingTable';
import SpecialistTable from './Specialistdashboard/SpecialistTable';
import ConsultationHistory from './ConsultationHistory/ConsultationHistory';
import UserTable from './UserManagement/UserTable.jsx';
import ChatOversight from './ChatOversight/ChatOversight.jsx';
import { handleExport } from './utils/exportUtils';

import {
  getSpecialists, getPendingApplications, getTransactions,
  getConsultations, getPatientAndNurseUsers, getAdminProfile,
  updateSpecialistStatus, uploadAdminAvatar
} from '../api/Admin/api.js';

import FemaleAvatar from '../assets/Female_Avatar.png';
import MaleAvatar from '../assets/Male_Avatar.png';
import S2 from '../assets/S2.png';
import PRC from '../assets/PRC_Sample.jpg';
import PTR from '../assets/PTR.png';
import esig from '../assets/esig.png';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminAvatar, setAdminAvatar] = useState('/account.svg');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfigTx, setSortConfigTx] = useState({ key: 'date', direction: 'desc' });

  const [transactions, setTransactions] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);

  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [systemFees, setSystemFees] = useState({
    doctorsFee: { isActive: true, name: "Doctor's Fee" },
    processingFee: { isActive: true, name: 'Processing Fee' },
    convenienceFee: { isActive: true, name: 'Convenience Fee' },
  });

  useEffect(() => {
    setSearchTerm(''); setFilterSpecialization(''); setFilterStatus('');
  }, [activeTab]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const [
          specialistsData, pendingData, transactionsData, consultationsData, usersData, adminProfileData 
        ] = await Promise.all([
          getSpecialists(), getPendingApplications(), getTransactions(),
          getConsultations(), getPatientAndNurseUsers(), getAdminProfile().catch(() => null) 
        ]);

        if (adminProfileData?.profileUrl && !adminProfileData.profileUrl.includes('admin_avatar.png')) {
          setAdminAvatar(adminProfileData.profileUrl);
        }

        const processSpec = (arr) => (Array.isArray(arr) ? arr : arr?.data || []).map((spec, i) => ({
          ...spec,
          name: `${spec.firstName || ''} ${spec.lastName || ''}`.trim(),
          details: {
            s2: { number: spec.s2Number || 'S2-FETCHED', imageUrl: S2 },
            ptr: { number: spec.ptrNumber || 'PTR-FETCHED', imageUrl: PTR },
            prcId: { number: spec.prcLicenseNumber || 'PRC-FETCHED', imageUrl: PRC },
            eSig: spec.eSignatureUrl || esig,
            profilePicture: i % 2 === 0 ? MaleAvatar : FemaleAvatar,
            specializations: spec.specialization ? [spec.specialization] : ['Unknown'],
          },
        }));

        setSpecialists(processSpec(specialistsData));
        setPendingApplications((Array.isArray(pendingData) ? pendingData : pendingData?.data || []).map((app, i) => ({
          ...app, details: { ...(app.details || {}), eSig: app.details?.eSig || esig, profilePicture: app.details?.profilePicture || (i % 2 === 0 ? FemaleAvatar : MaleAvatar) }
        })));
        setTransactions(Array.isArray(transactionsData) ? transactionsData : transactionsData?.data || []);
        setConsultations(Array.isArray(consultationsData) ? consultationsData : consultationsData?.data || []);
        setUsers(Array.isArray(usersData) ? usersData : usersData?.data || []);
      } catch (error) { console.error('Failed to fetch data:', error); }
    };
    fetchAndProcessData();
  }, []);

  const safeString = (val) => String(val || '').toLowerCase();
  
  const filteredPending = pendingApplications.filter(app => (!searchTerm || safeString(app.name).includes(searchTerm.toLowerCase())));
  const filteredSpecialists = specialists.filter(spec => (!searchTerm || safeString(spec.name).includes(searchTerm.toLowerCase())));
  const filteredUsers = users.filter(user => (!searchTerm || safeString(user.firstName).includes(searchTerm.toLowerCase())));
  const filteredConsultations = consultations.filter(c => (!searchTerm || safeString(c.ticket).includes(searchTerm.toLowerCase())));

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = !searchTerm || safeString(t.ticketNumber).includes(searchTerm.toLowerCase()) || safeString(t.patientName).includes(searchTerm.toLowerCase());
    const matchesSpecialty = !filterSpecialization || t.specialty === filterSpecialization;
    const matchesStatus = !filterStatus || safeString(t.status) === filterStatus.toLowerCase();
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const sortedTransactions = useMemo(() => {
    let sortable = [...filteredTransactions];
    if (sortConfigTx.key !== null) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfigTx.key] || ''; let bVal = b[sortConfigTx.key] || '';
        if (sortConfigTx.key === 'date') { aVal = new Date(aVal).getTime() || 0; bVal = new Date(bVal).getTime() || 0; }
        if (aVal < bVal) return sortConfigTx.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfigTx.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredTransactions, sortConfigTx]);

  const requestSortTx = (key) => setSortConfigTx({ key, direction: sortConfigTx.key === key && sortConfigTx.direction === 'asc' ? 'desc' : 'asc' });

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { sessionStorage.removeItem('isAdminLoggedIn'); localStorage.removeItem('admin_token'); navigate('/login'); }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await uploadAdminAvatar(file);
      setAdminAvatar(result.profileUrl); 
    } catch (error) { alert('Failed to upload avatar: ' + error.message); }
  };

  const handleUpdateSpecialistStatus = async (id, status) => {
    try { await updateSpecialistStatus({ specialistId: id, status }); setSpecialists(prev => prev.map(s => s.id === id ? { ...s, status } : s)); } 
    catch (e) { alert('Update failed'); }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiPieChart /> },
    { 
      id: 'transactions-group', 
      label: 'Transactions', 
      icon: <FiCreditCard />,
      subLinks: [
        { id: 'transactions', label: 'All Transactions' },
        { id: 'consultations', label: 'Consultation History' }
      ]
    },
    { 
      id: 'specialists-group', 
      label: 'Specialists', 
      icon: <FiUserCheck />,
      subLinks: [
        { id: 'pending', label: 'Registration Requests' },
        { id: 'specialists', label: 'Approved Specialists' }
      ]
    },
    { 
      id: 'users-group', 
      label: 'User Management', 
      icon: <FiUsers />,
      subLinks: [
        { id: 'users', label: 'All Users' },
        { id: 'chats', label: 'Chat Oversight' }
      ]
    },
    { 
      id: 'settings-group', 
      label: 'System Settings', 
      icon: <FiSettings />,
      subLinks: [
        { id: 'settings', label: 'Platform Fees' }
      ]
    }
  ];

  const renderToolbar = () => (
    <div className="admin-toolbar">
      <div className="admin-toolbar-left">
        <div style={{ position: 'relative' }}>
          <input 
            type='text' 
            placeholder="Search records..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="admin-search-input" 
          />
          <FiSearch style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }} />
        </div>
      </div>
      {activeTab === 'users' && (
        <button onClick={() => handleExport(filteredUsers, 'users.csv')} className="admin-export-btn">
          <FiDownload /> Export CSV
        </button>
      )}
    </div>
  );

  return (
    <AdminLayout
      title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
      subtitle="Overview of system activities and user management"
      navLinks={navLinks}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      adminName="System Admin"
      adminRole="Super Admin"
      adminAvatar={adminAvatar}
      onLogout={handleLogout}
      onAvatarUpload={handleAvatarChange}
    >
      {activeTab === 'dashboard' && (
        <>
          <div className="metrics-grid">
            <MetricCard title="Total Patients" value={users.filter(u=>u.role==='patient').length || "1,245"} trendText="↑ +12%" trendType="up" />
            <MetricCard title="Active Specialists" value={specialists.length || "84"} trendText="↑ +5%" trendType="up" />
            <MetricCard title="Pending Applications" value={pendingApplications.length} trendText="⚠ Review needed" trendType="warning" />
            <MetricCard title="Today's Transactions" value={transactions.length || "156"} trendText="↑ +24%" trendType="up" />
          </div>
          <div className="admin-empty-state">
            <h3>Reports & Statistics</h3>
            <p>This module is temporarily empty per testing requirements.</p>
          </div>
        </>
      )}

      <div style={{ display: activeTab !== 'dashboard' ? 'block' : 'none' }}>
        {activeTab === 'pending' && <PendingTable applications={filteredPending} onApprove={() => {}} onDeny={() => {}} toolbar={renderToolbar()} />}
        {activeTab === 'specialists' && <SpecialistTable specialists={filteredSpecialists} onStatusChange={handleUpdateSpecialistStatus} toolbar={renderToolbar()} />}
        {activeTab === 'users' && <UserTable users={filteredUsers} onView={setViewingUser} onUpdate={() => {}} onDelete={setDeletingUser} onCreateStaff={() => {}} toolbar={renderToolbar()} />}
        {activeTab === 'chats' && <ChatOversight />}
        {activeTab === 'consultations' && <ConsultationHistory consultations={filteredConsultations} toolbar={renderToolbar()} />}
        
        {activeTab === 'transactions' && (
          <div className="table-section">
            <div className="table-header-row"><h2>Transaction History & Management</h2></div>
            {renderToolbar()}
            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => requestSortTx('ticketNumber')} style={{cursor:'pointer'}}>Ticket ID</th>
                  <th onClick={() => requestSortTx('patientName')} style={{cursor:'pointer'}}>Patient Name</th>
                  <th onClick={() => requestSortTx('specialistName')} style={{cursor:'pointer'}}>Specialist</th>
                  <th onClick={() => requestSortTx('date')} style={{cursor:'pointer'}}>Date</th>
                  <th onClick={() => requestSortTx('status')} style={{cursor:'pointer'}}>Status</th>
                  <th onClick={() => requestSortTx('channel')} style={{cursor:'pointer'}}>Channel</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.length > 0 ? sortedTransactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.ticketNumber || t.id}</td><td>{t.patientName}</td><td>{t.specialistName}</td>
                    <td>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                    <td><span className={`status-pill ${t.status.toLowerCase().includes('completed') ? 'status-completed' : t.status.toLowerCase().includes('cancelled') ? 'status-cancelled' : 'status-pending'}`}>{t.status}</span></td>
                    <td>{t.channel}</td>
                  </tr>
                )) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '30px'}}>No transactions found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="admin-settings-card">
            <div className="table-header-row">
              <h2>Platform Fees Configuration</h2>
            </div>
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
          </div>
        )}
      </div>

      {viewingUser && (
        <Modal title="User Details" onClose={() => setViewingUser(null)}>
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