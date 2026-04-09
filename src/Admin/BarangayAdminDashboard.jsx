import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './Components/AdminLayout';
import MetricCard from './Components/MetricCard';

const BarangayAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { sessionStorage.removeItem('isAdminLoggedIn'); localStorage.removeItem('admin_token'); navigate('/login'); }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' }
  ];

  return (
    <AdminLayout
      title="Barangay Admin Dashboard"
      subtitle="Local government unit healthcare tracking"
      navLinks={navLinks}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      adminName="LGU Official"
      adminRole="Barangay Admin"
      onLogout={handleLogout}
    >
      <div className="metrics-grid">
        <MetricCard title="Total Residents" value="0" trendText="Registered" trendType="neutral" />
        <MetricCard title="Active Cases" value="0" trendText="Monitoring" trendType="neutral" />
        <MetricCard title="Community Events" value="0" trendText="Upcoming" trendType="neutral" />
      </div>
      <div className="admin-empty-state">
        <h3>Reports & Statistics</h3>
        <p>This module is temporarily empty per ODP-445 testing requirements.</p>
      </div>
    </AdminLayout>
  );
};

export default BarangayAdminDashboard;