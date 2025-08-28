import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PendingTable from './PendingTable';
import SpecialistTable from './SpecialistTable';
import './SpecialistDashboard.css';

// Header component defined locally
const Header = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    navigate('/login');
  };
  return (
    <header>
      <h1>Okie-Doc+ Management</h1>
      <button id="logout-button" onClick={handleLogout}>Logout</button>
    </header>
  );
};

const SpecialistDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingApplications, setPendingApplications] = useState([
    { id: 'APP001', name: 'Dr. Evelyn Reed', email: 'evelyn.reed@clinic.com', date: '2025-08-20', details: { specialization: 'Cardiology', license: 'L-12345' } },
    { id: 'APP002', name: 'Dr. Samuel Chen', email: 'sam.chen@med.com', date: '2025-08-18', details: { specialization: 'Dermatology', license: 'L-67890' } },
  ]);
  

  const [specialists, setSpecialists] = useState([
    { id: 'SPEC001', firstName: 'John', lastName: 'Doe', email: 'john.doe@okiedoc.com', specialization: 'Pediatrics', license: 'L-54321', status: 'Active' },
    { id: 'SPEC002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@okiedoc.com', specialization: 'Cardiology', license: 'L-98765', status: 'Active' },
  ]);

  const handleAddSpecialist = (newSpecialist) => {
    const newId = `SPEC${String(specialists.length + 1).padStart(3, '0')}`;
    setSpecialists(prev => [...prev, { ...newSpecialist, id: newId, status: 'Active' }]);
  };

  return (
    <>
      <Header />
      <main className="dashboard-container">

        <div className="tabs">
          <button
            className={`tab-link ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Applications
            {pendingApplications.length > 0 && (
              <span className="badge">{pendingApplications.length}</span>
            )}
          </button>
          <button
            className={`tab-link ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Okie-Doc+ Specialists
          </button>
        </div>

        {/* This logic ensures the active tab highlight is retained */}
        {activeTab === 'pending' && (
          <PendingTable applications={pendingApplications} />
        )}

        {activeTab === 'list' && (
          <SpecialistTable specialists={specialists} onAddSpecialist={handleAddSpecialist} />
        )}
      </main>
    </>
  );
};

export default SpecialistDashboard;