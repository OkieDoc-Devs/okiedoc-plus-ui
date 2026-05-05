import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiGrid, FiUsers, FiCalendar, FiDollarSign, FiFileText, FiSettings, FiSearch, FiEye, FiCheck, FiX } from 'react-icons/fi';
import AdminLayout from './Components/AdminLayout';

const SpecialistManagement = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('specialists');
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { sessionStorage.clear(); localStorage.clear(); navigate('/login'); }
  };

  const applicants = [
    { id: 1, name: 'Mia Fernandez', specialty: 'Pediatrics', license: 'MD-50003', email: 'dr.mfernandez@okiedoc.com' },
    { id: 2, name: 'Bea Alonzo', specialty: 'Neurology', license: 'MD-50005', email: 'dr.alonzo@okiedoc.com' }
  ];

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
          table tbody td button:last-child {
            margin-right: 0 !important;
          }
          table tbody td button svg {
            margin: 0 !important;
            display: block !important;
            position: static !important;
          }

          .view-btn { background-color: #f1f5f9 !important; color: #475569 !important; border: 1px solid #cbd5e1 !important; }
          .approve-btn { background-color: #10b981 !important; color: #ffffff !important; }
          .deny-btn { background-color: #ef4444 !important; color: #ffffff !important; }

          .admin-tabs { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px; gap: 16px; }
          .admin-tab { padding: 10px 4px; cursor: pointer; font-weight: 600; color: #64748b; border-bottom: 2px solid transparent; transition: all 0.2s ease; }
          .admin-tab.active { color: #0aadef; border-bottom: 2px solid #0aadef; }
        `}
      </style>
      
      <AdminLayout
        title="Pending"
        subtitle="Overview of system activities and user management"
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
              Pending Applications
            </div>
            <div className={`admin-tab ${activeSubTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveSubTab('approved')}>
              Approved Specialist
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
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>APPLICANT NAME</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>SPECIALTY</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>LICENSE NUMBER</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>EMAIL</th>
                  <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontWeight: '500', color: '#1e293b' }}>{app.name}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{app.specialty}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{app.license}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{app.email}</td>
                    <td style={{ padding: '16px' }}>
                      <button className="view-btn"><FiEye size={16} /> View</button>
                      <button className="approve-btn"><FiCheck size={16} /> Approve</button>
                      <button className="deny-btn"><FiX size={16} /> Deny</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default SpecialistManagement;