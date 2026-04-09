import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './Components/AdminLayout';
import MetricCard from './Components/MetricCard';

const NurseAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { sessionStorage.removeItem('isAdminLoggedIn'); localStorage.removeItem('admin_token'); navigate('/login'); }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'clinics', label: 'Clinics / HCPs', icon: '🏥' },
    { id: 'users', label: 'Users', icon: '👥' }
  ];

  return (
    <AdminLayout
      title="Nurse Admin Dashboard"
      subtitle="Triage, assignments, and consultation oversight"
      navLinks={navLinks}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      adminName="Head Nurse"
      adminRole="Nurse Admin"
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' ? (
        <>
          <div className="metrics-grid">
            <MetricCard title="Active Consultations" value="0" trendText="Live Now" trendType="neutral" />
            <MetricCard title="Pending Triages" value="0" trendText="Requires Attention" trendType="neutral" />
            <MetricCard title="Available Doctors" value="0" trendText="Online" trendType="neutral" />
          </div>
          <div className="admin-empty-state">
            <h3>Reports & Statistics</h3>
            <p>This module is temporarily empty per ODP-440 testing requirements.</p>
          </div>
        </>
      ) : (
        <div className="admin-empty-state">
          <h3>Module Unavailable</h3>
          <p>The {activeTab} view is pending database integration.</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default NurseAdminDashboard;