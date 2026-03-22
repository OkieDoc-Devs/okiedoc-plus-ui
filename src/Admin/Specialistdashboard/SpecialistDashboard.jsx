import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import PendingTable from './PendingTable';
import SpecialistTable from './SpecialistTable';
import ConsultationHistory from '../ConsultationHistory/ConsultationHistory';
import UserTable from '../UserManagement/UserTable.jsx';
import '../UserManagement/UserTable.css';

import ChatOversight from '../ChatOversight/ChatOversight.jsx';
import { handleExport } from '../utils/exportUtils';
import './SpecialistDashboard.css';
import '../ConsultationHistory/ConsultationHistory.css';
import '../ChatOversight/ChatOversight.css';

import {
  getSpecialists,
  getPendingApplications,
  getTransactions,
  getConsultations,
  getPatientAndNurseUsers,
  logoutAdmin,
} from '../../api/Admin/api.js';

import FemaleAvatar from '../../assets/Female_Avatar.png';
import MaleAvatar from '../../assets/Male_Avatar.png';
import S2 from '../../assets/S2.png';
import PRC from '../../assets/PRC_Sample.jpg';
import PTR from '../../assets/PTR.png';
import esig from '../../assets/esig.png';
import OkieDocLogo from '../../assets/okie-doc-logo.png';

const SpecialistDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [sortConfigTx, setSortConfigTx] = useState({ key: 'date', direction: 'desc' });

  const [transactions, setTransactions] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);

  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  const [systemFees, setSystemFees] = useState({
    doctorsFee: { isActive: true, name: "Doctor's Fee" },
    processingFee: { isActive: true, name: 'Processing Fee' },
    convenienceFee: { isActive: true, name: 'Convenience Fee' },
  });
  const [discount, setDiscount] = useState({
    name: 'Discount',
    type: 'percentage',
    value: 0,
    isActive: false,
  });
  const [notes, setNotes] = useState({ checkout: '', isActive: true });

  useEffect(() => {
    setSearchTerm('');
    setFilterSpecialization('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSelectedRegion('');
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedBarangay('');
  }, [activeTab]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const [
          specialistsData,
          pendingData,
          transactionsData,
          consultationsData,
          usersData,
        ] = await Promise.all([
          getSpecialists(),
          getPendingApplications(),
          getTransactions(),
          getConsultations(),
          getPatientAndNurseUsers(),
        ]);

        const specialistsArray = Array.isArray(specialistsData) ? specialistsData : specialistsData?.specialists || specialistsData?.data || [];
        const pendingArray = Array.isArray(pendingData) ? pendingData : pendingData?.applications || pendingData?.data || [];
        const transactionsArray = Array.isArray(transactionsData) ? transactionsData : transactionsData?.transactions || transactionsData?.data || [];
        const consultationsArray = Array.isArray(consultationsData) ? consultationsData : consultationsData?.consultations || consultationsData?.data || [];
        const usersArray = Array.isArray(usersData) ? usersData : usersData?.users || usersData?.data || [];

        const processedSpecialists = (specialistsArray || []).map((spec, index) => {
          let signature = spec.eSignatureUrl || esig;
          if (signature && signature.includes('/assets/esig.png')) signature = esig;
          return {
            ...spec,
            name: `${spec.firstName || ''} ${spec.lastName || ''}`.trim(),
            details: {
              s2: { number: spec.s2Number || 'S2-FETCHED', imageUrl: S2 },
              ptr: { number: spec.ptrNumber || 'PTR-FETCHED', imageUrl: PTR },
              prcId: { number: spec.prcLicenseNumber || 'PRC-FETCHED', imageUrl: PRC },
              eSig: signature,
              profilePicture: index % 2 === 0 ? MaleAvatar : FemaleAvatar,
              specializations: spec.specialization ? [spec.specialization] : ['Unknown'],
              subspecializations: ['Sub-specialty Placeholder'],
            },
          };
        });

        const processedPending = (pendingArray || []).map((app, index) => {
          let signature = app.details?.eSig || esig;
          if (signature && signature.includes('/assets/esig.png')) signature = esig;
          return {
            ...app,
            details: {
              ...(app.details || {}),
              s2: { ...(app.details?.s2 || {}), imageUrl: app.details?.s2?.imageUrl || S2 },
              ptr: { ...(app.details?.ptr || {}), imageUrl: app.details?.ptr?.imageUrl || PTR },
              prcId: { ...(app.details?.prcId || {}), imageUrl: app.details?.prcId?.imageUrl || PRC },
              eSig: signature,
              profilePicture: app.details?.profilePicture || (index % 2 === 0 ? FemaleAvatar : MaleAvatar),
            },
          };
        });

        setSpecialists(processedSpecialists);
        setPendingApplications(processedPending);
        setTransactions(transactionsArray || []);
        setConsultations(consultationsArray || []);
        setUsers(usersArray || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data from backend:', error);
      }
    };
    fetchAndProcessData();
  }, []);

  const handleFeeToggle = (feeName) => setSystemFees((prev) => ({ ...prev, [feeName]: { ...prev[feeName], isActive: !prev[feeName].isActive } }));
  const handleDiscountToggle = () => setDiscount((prev) => ({ ...prev, isActive: !prev.isActive }));
  const handleNotesToggle = () => setNotes((prev) => ({ ...prev, isActive: !prev.isActive }));

  const extractLocation = (item) => {
    const locSource = item.details || item;
    return {
      region: locSource.region || '',
      province: locSource.province || '',
      city: locSource.city || '',
      barangay: locSource.barangay || '',
    };
  };

  let currentTabData = [];
  switch (activeTab) {
    case 'pending': currentTabData = pendingApplications; break;
    case 'list': currentTabData = specialists; break;
    case 'users': currentTabData = users; break;
    case 'transactions': currentTabData = transactions; break;
    case 'consultations': currentTabData = consultations; break;
    default: currentTabData = [];
  }

  const availableLocations = currentTabData.map(extractLocation);
  
  const uniqueRegions = [...new Set(availableLocations.map(l => l.region).filter(Boolean))].sort();
  const uniqueProvinces = [...new Set(availableLocations.filter(l => !selectedRegion || l.region === selectedRegion).map(l => l.province).filter(Boolean))].sort();
  const uniqueCities = [...new Set(availableLocations.filter(l => (!selectedRegion || l.region === selectedRegion) && (!selectedProvince || l.province === selectedProvince)).map(l => l.city).filter(Boolean))].sort();
  const uniqueBarangays = [...new Set(availableLocations.filter(l => (!selectedRegion || l.region === selectedRegion) && (!selectedProvince || l.province === selectedProvince) && (!selectedCity || l.city === selectedCity)).map(l => l.barangay).filter(Boolean))].sort();

  const isLocationMatch = (item) => {
    const loc = extractLocation(item);
    const matchReg = !selectedRegion || loc.region === selectedRegion;
    const matchProv = !selectedProvince || loc.province === selectedProvince;
    const matchCity = !selectedCity || loc.city === selectedCity;
    const matchBrgy = !selectedBarangay || loc.barangay === selectedBarangay;
    return matchReg && matchProv && matchCity && matchBrgy;
  };

  const dynamicSpecializations = useMemo(() => {
    let currentSpecializations = [];
    if (activeTab === 'pending') {
      currentSpecializations = pendingApplications.flatMap(app => app.details?.specializations || []);
    } else if (activeTab === 'list') {
      currentSpecializations = specialists.flatMap(spec => spec.details?.specializations || []);
    } else if (activeTab === 'transactions') {
      currentSpecializations = transactions.map(t => t.specialty);
    }
    return [...new Set(currentSpecializations.filter(Boolean))].sort();
  }, [activeTab, pendingApplications, specialists, transactions]);

  const safeString = (val) => String(val || '').toLowerCase();

  const filteredPending = (pendingApplications || []).filter((app) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      safeString(app.name).includes(searchString) || 
      safeString(app.email).includes(searchString) ||
      safeString(app.id).includes(searchString); 
    
    const matchesFilter = !filterSpecialization || (app.details?.specializations || []).includes(filterSpecialization);
    return matchesSearch && matchesFilter && isLocationMatch(app);
  });

  const filteredSpecialists = (specialists || []).filter((spec) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      safeString(spec.firstName + ' ' + spec.lastName).includes(searchString) || 
      safeString(spec.email).includes(searchString) ||
      safeString(spec.id).includes(searchString); 
      
    const matchesFilter = !filterSpecialization || (spec.details?.specializations || []).includes(filterSpecialization);
    return matchesSearch && matchesFilter && isLocationMatch(spec);
  });

  const filteredUsers = (users || []).filter((user) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      safeString(user.firstName + ' ' + user.lastName).includes(searchString) || 
      safeString(user.email).includes(searchString) || 
      safeString(user.mobileNumber).includes(searchString) ||
      safeString(user.id).includes(searchString); 
      
    return matchesSearch && isLocationMatch(user);
  });

  const filteredTransactions = (transactions || []).filter((t) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      safeString(t.patientName).includes(searchString) || 
      safeString(t.specialistName).includes(searchString) || 
      safeString(t.status).includes(searchString) ||
      safeString(t.channel).includes(searchString) ||
      safeString(t.ticketNumber).includes(searchString) || 
      safeString(t.id).includes(searchString); 

    const matchesSpecialty = !filterSpecialization || t.specialty === filterSpecialization;
    const matchesStatus = !filterStatus || safeString(t.status) === filterStatus.toLowerCase();
    
    const transactionDate = t.date ? new Date(t.date) : null;
    const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
    const toDate = filterDateTo ? new Date(filterDateTo) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);
    const matchesDate = (!fromDate && !toDate) || (transactionDate && (!fromDate || transactionDate >= fromDate) && (!toDate || transactionDate <= toDate));

    return matchesSearch && matchesSpecialty && matchesStatus && matchesDate && isLocationMatch(t);
  });

  const sortedTransactions = useMemo(() => {
    let sortable = [...filteredTransactions];
    if (sortConfigTx.key !== null) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfigTx.key] || '';
        let bVal = b[sortConfigTx.key] || '';
        if (sortConfigTx.key === 'date') {
          aVal = new Date(aVal).getTime() || 0;
          bVal = new Date(bVal).getTime() || 0;
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = String(bVal).toLowerCase();
        }
        if (aVal < bVal) return sortConfigTx.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfigTx.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredTransactions, sortConfigTx]);

  const requestSortTx = (key) => {
    let direction = 'asc';
    if (sortConfigTx.key === key && sortConfigTx.direction === 'asc') direction = 'desc';
    setSortConfigTx({ key, direction });
  };
  const getSortIndicatorTx = (key) => {
    if (sortConfigTx.key !== key) return null;
    return sortConfigTx.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const filteredConsultations = (consultations || []).filter((c) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      safeString(c.patientName).includes(searchString) || 
      safeString(c.specialistName).includes(searchString) || 
      safeString(c.status).includes(searchString) ||
      safeString(c.ticket).includes(searchString) || 
      safeString(c.id).includes(searchString);
      
    const consultationDate = c.date ? new Date(c.date) : null;
    const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
    const toDate = filterDateTo ? new Date(filterDateTo) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);
    const matchesDate = (!fromDate && !toDate) || (consultationDate && (!fromDate || consultationDate >= fromDate) && (!toDate || consultationDate <= toDate));

    return matchesSearch && matchesDate && isLocationMatch(c);
  });

  const handleCreateStaff = async (staffData) => {
    try {
      const { createStaff } = await import('../../api/Admin/api.js');
      await createStaff(staffData);
      alert(`${staffData.role} account created successfully!`);
      const usersData = await import('../../api/Admin/api.js').then((m) => m.getPatientAndNurseUsers());
      setUsers(Array.isArray(usersData) ? usersData : usersData?.users || usersData?.data || []);
    } catch (error) {
      alert(error.message || `Failed to create ${staffData.role}.`);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      setUsers((prevUsers) => prevUsers.map((user) => user.id === updatedUser.id ? updatedUser : user));
      alert('User updated successfully!');
    } catch { alert('Failed to update user.'); }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deletingUser.id));
      alert('User deleted successfully!');
      setDeletingUser(null);
    } catch { alert('Failed to delete user.'); }
  };

  const handleApproveSpecialist = async (specialistId) => {
    try {
      await import('../../api/Admin/api.js').then((module) => module.approveSpecialist({ specialistId, action: 'approve' }));
      alert(`Specialist approved!`);
      window.location.reload(); 
    } catch (error) { alert('Failed to approve specialist.'); }
  };

  const handleDenySpecialist = async (specialistId, reason) => {
    try {
      await import('../../api/Admin/api.js').then((module) => module.approveSpecialist({ specialistId, action: 'deny', reason }));
      alert(`Specialist denied!`);
      window.location.reload(); 
    } catch (error) { alert('Failed to deny specialist.'); }
  };

  const handleUpdateSpecialistStatus = async (specialistId, newStatus) => {
    try {
      const { updateSpecialistStatus } = await import('../../api/Admin/api.js');
      await updateSpecialistStatus({ specialistId, status: newStatus });
      alert(`Specialist status successfully updated!`);
      setSpecialists(prev => prev.map(s => s.id === specialistId ? { ...s, status: newStatus } : s));
    } catch (error) {
      alert('Failed to update specialist status.');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try { await logoutAdmin(); } catch (error) { console.error(error); } 
    finally { sessionStorage.removeItem('isAdminLoggedIn'); localStorage.removeItem('admin_token'); navigate('/login'); }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'pending': return 'Search by applicant name, email, or UID...';
      case 'list': return 'Search by specialist name, email, or UID...';
      case 'users': return 'Search by name, email, mobile, or UID...';
      case 'transactions': return 'Search by name, status, ticket ID, or channel...';
      case 'consultations': return 'Search by name, status, or ticket ID...';
      default: return 'Search...';
    }
  };

  const filterFieldStyle = {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '5px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontSize: '0.9rem',
    outline: 'none'
  };

  const renderToolbar = () => {
    if (!['pending', 'list', 'users', 'transactions', 'consultations'].includes(activeTab)) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <input
            type='text'
            placeholder={getSearchPlaceholder()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...filterFieldStyle, width: '380px', flexShrink: 0 }}
          />
          {uniqueRegions.length > 0 && (
            <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedProvince(''); setSelectedCity(''); setSelectedBarangay(''); }} style={filterFieldStyle}>
              <option value="">All Regions</option>
              {uniqueRegions.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
          )}
          {uniqueProvinces.length > 0 && (
            <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity(''); setSelectedBarangay(''); }} style={filterFieldStyle}>
              <option value="">All Provinces</option>
              {uniqueProvinces.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          )}
          {uniqueCities.length > 0 && (
            <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedBarangay(''); }} style={filterFieldStyle}>
              <option value="">All Cities</option>
              {uniqueCities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          )}
          {uniqueBarangays.length > 0 && (
            <select value={selectedBarangay} onChange={(e) => setSelectedBarangay(e.target.value)} style={filterFieldStyle}>
              <option value="">All Barangays</option>
              {uniqueBarangays.map((b) => (<option key={b} value={b}>{b}</option>))}
            </select>
          )}
          {(activeTab === 'pending' || activeTab === 'list' || activeTab === 'transactions') && (
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              disabled={dynamicSpecializations.length === 0}
              style={filterFieldStyle}
            >
              <option value=''>All Specializations</option>
              {dynamicSpecializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          )}
          {activeTab === 'transactions' && (
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={filterFieldStyle}>
              <option value=''>All Statuses</option>
              <option value='Pending'>Pending</option>
              <option value='Processing'>Processing</option>
              <option value='For Payment'>For Payment</option>
              <option value='Active'>Active</option>
              <option value='Completed'>Completed</option>
              <option value='Cancelled'>Cancelled</option>
            </select>
          )}

          {activeTab === 'users' && (
            <button
              style={{ backgroundColor: '#0B5388', color: '#fff', padding: '8px 20px', border: 'none', borderRadius: '5px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', marginLeft: 'auto' }}
              onClick={() => handleExport(filteredUsers, 'User_Management_Report.csv')}
              disabled={filteredUsers.length === 0}
              onMouseOver={(e) => e.target.style.backgroundColor = '#08406b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0B5388'}
            >
              Export CSV
            </button>
          )}
        </div>

        {(activeTab === 'transactions' || activeTab === 'consultations') && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 15px', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor='dateFrom' style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>From Date:</label>
                <input id='dateFrom' type='date' value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} style={{...filterFieldStyle, padding: '6px 10px'}} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor='dateTo' style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>To Date:</label>
                <input id='dateTo' type='date' value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} style={{...filterFieldStyle, padding: '6px 10px'}} />
              </div>
            </div>
            
            <button
              style={{ backgroundColor: '#0B5388', color: '#fff', padding: '8px 20px', border: 'none', borderRadius: '5px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => {
                const targetData = activeTab === 'transactions' ? sortedTransactions : filteredConsultations;
                const targetFilename = activeTab === 'transactions' ? 'Transaction_History_Report.csv' : 'Consultation_History_Report.csv';
                handleExport(targetData, targetFilename);
              }}
              disabled={(activeTab === 'transactions' ? sortedTransactions.length : filteredConsultations.length) === 0}
              onMouseOver={(e) => e.target.style.backgroundColor = '#08406b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0B5388'}
            >
              Export CSV
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='dashboard admin-dashboard'>
      <div className='dashboard-header'>
        <div className='header-center'>
          <img src={OkieDocLogo} alt='Okie-Doc+' className='logo-image' />
        </div>
        <h3 className='dashboard-title'>Admin Dashboard</h3>
        <div className='user-account'>
          <img src='/account.svg' alt='Account' className='account-icon' />
          <span className='account-name'>Admin</span>
          <div className='account-dropdown'>
            <button className='dropdown-item logout-item' onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className='dashboard-nav'>
          <button className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            Pending Applications
            {filteredPending.length > 0 && <span className='badge'>{filteredPending.length}</span>}
          </button>
          <button className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
            OkieDoc+ Specialists
          </button>
          <button className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            User Management
          </button>
          <button className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            Transaction History
          </button>
          <button className={`nav-tab ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>
            Chat Consultations
          </button>
          <button className={`nav-tab ${activeTab === 'consultations' ? 'active' : ''}`} onClick={() => setActiveTab('consultations')}>
            Consultation History
          </button>
          <button className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            System Fee Settings
          </button>
        </div>
      </div>

      <main className='dashboard-container'>
        {activeTab === 'pending' && (
          <PendingTable applications={filteredPending} onApprove={handleApproveSpecialist} onDeny={handleDenySpecialist} toolbar={renderToolbar()} />
        )}
        {activeTab === 'list' && (
          <SpecialistTable specialists={filteredSpecialists} onStatusChange={handleUpdateSpecialistStatus} toolbar={renderToolbar()} />
        )}
        {activeTab === 'users' && (
          <UserTable users={filteredUsers} onView={setViewingUser} onUpdate={handleUpdateUser} onDelete={setDeletingUser} onCreateStaff={handleCreateStaff} toolbar={renderToolbar()} />
        )}

        {activeTab === 'transactions' && (
          <div id='transactions' className='tab-content active'>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
               <h2 style={{ margin: 0, padding: 0, border: 'none' }}>Transaction History & Management</h2>
            </div>
            {renderToolbar()}
            <div className='table-wrapper'>
              <table className='dashboard-table'>
                <thead>
                  <tr>
                    <th onClick={() => requestSortTx('ticketNumber')} style={{ cursor: 'pointer', userSelect: 'none' }}>Ticket ID{getSortIndicatorTx('ticketNumber')}</th>
                    <th onClick={() => requestSortTx('patientName')} style={{ cursor: 'pointer', userSelect: 'none' }}>Patient Name{getSortIndicatorTx('patientName')}</th>
                    <th onClick={() => requestSortTx('chiefComplaint')} style={{ cursor: 'pointer', userSelect: 'none' }}>Chief Complaint{getSortIndicatorTx('chiefComplaint')}</th>
                    <th onClick={() => requestSortTx('specialistName')} style={{ cursor: 'pointer', userSelect: 'none' }}>Specialist{getSortIndicatorTx('specialistName')}</th>
                    <th onClick={() => requestSortTx('specialty')} style={{ cursor: 'pointer', userSelect: 'none' }}>Specialty{getSortIndicatorTx('specialty')}</th>
                    <th onClick={() => requestSortTx('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>Date{getSortIndicatorTx('date')}</th>
                    <th onClick={() => requestSortTx('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>Status{getSortIndicatorTx('status')}</th>
                    <th onClick={() => requestSortTx('channel')} style={{ cursor: 'pointer', userSelect: 'none' }}>Channel{getSortIndicatorTx('channel')}</th>
                    <th onClick={() => requestSortTx('barangay')} style={{ cursor: 'pointer', userSelect: 'none' }}>Location (Brgy, City){getSortIndicatorTx('barangay')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.length > 0 ? (
                    sortedTransactions.map((t) => (
                      <tr key={t.id}>
                        <td>{t.ticketNumber || t.id}</td>
                        <td>{t.patientName}</td>
                        <td>{t.chiefComplaint}</td>
                        <td>{t.specialistName}</td>
                        <td>{t.specialty}</td>
                        <td>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                        <td>{t.status}</td>
                        <td>{t.channel}</td>
                        <td>{t.barangay ? `${t.barangay}, ${t.city || ''}` : 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan='9' style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No transactions found matching your criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className='tab-content active' id='chat-consultations-wrapper'>
            <ChatOversight />
          </div>
        )}

        {activeTab === 'consultations' && (
          <ConsultationHistory consultations={filteredConsultations} toolbar={renderToolbar()} />
        )}

        {activeTab === 'settings' && (
          <div id='settings' className='tab-content active settings-tab-content'>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
               <h2 style={{ margin: 0, padding: 0, border: 'none' }}>System Fee & Discount Settings</h2>
            </div>
            <div className='settings-grid'>
              <div className='settings-card'>
                <h3>System Fees</h3>
                {Object.entries(systemFees).map(([key, fee]) => (
                  <div className='settings-item' key={key}>
                    <span>{fee.name}</span>
                    <label className='switch'>
                      <input type='checkbox' checked={fee.isActive} onChange={() => handleFeeToggle(key)} />
                      <span className='slider round'></span>
                    </label>
                  </div>
                ))}
              </div>
              <div className='settings-card'>
                <h3>Discount</h3>
                <div className='settings-item'>
                  <span>Activate Discount</span>
                  <label className='switch'>
                    <input type='checkbox' checked={discount.isActive} onChange={handleDiscountToggle} />
                    <span className='slider round'></span>
                  </label>
                </div>
                {discount.isActive && (
                  <>
                    <div className='settings-item'>
                      <label>Discount Type:</label>
                      <select value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value })}>
                        <option value='percentage'>Percentage (%)</option>
                        <option value='peso'>Peso (₱)</option>
                      </select>
                    </div>
                    <div className='settings-item'>
                      <label>Discount Value:</label>
                      <input type='number' value={discount.value} onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </>
                )}
              </div>
              <div className='settings-card notes-card'>
                <h3>Checkout Notes</h3>
                <div className='settings-item'>
                  <span>Display Notes on Checkout</span>
                  <label className='switch'>
                    <input type='checkbox' checked={notes.isActive} onChange={handleNotesToggle} />
                    <span className='slider round'></span>
                  </label>
                </div>
                {notes.isActive && (
                  <div className='settings-item-full'>
                    <label htmlFor='checkout-notes-textarea'>Notes to Display:</label>
                    <textarea id='checkout-notes-textarea' value={notes.checkout} onChange={(e) => setNotes({ ...notes, checkout: e.target.value })} rows='4' placeholder='Enter notes to show...'></textarea>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {viewingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setViewingUser(null)}>
          <div style={{ maxWidth: '750px', width: '95%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '8px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0B5388' }}>User Details</h2>
              <button onClick={() => setViewingUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', backgroundColor: '#f9fbfd', padding: '20px', borderRadius: '8px', border: '1px solid #e1e8ed' }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <img
                  src={viewingUser.profileUrl || (viewingUser.gender === 'Male' ? MaleAvatar : FemaleAvatar)}
                  alt={`${viewingUser.firstName}'s profile`}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '600' }}>{`${viewingUser.firstName} ${viewingUser.lastName}`}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{viewingUser.email || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile Number</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{viewingUser.mobileNumber || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Type</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500', textTransform: 'capitalize' }}>{viewingUser.userType || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subscription</span>
                <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{viewingUser.subscription || 'Free'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span>
                <span style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {[viewingUser.addressLine1, viewingUser.addressLine2, viewingUser.barangay, viewingUser.city, viewingUser.province, viewingUser.region, viewingUser.zipCode].filter(Boolean).join(', ') || 'N/A'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className='action-btn btn-primary' onClick={() => setViewingUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setDeletingUser(null)}>
          <div style={{ maxWidth: '500px', width: '95%', backgroundColor: '#fff', borderRadius: '8px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0B5388' }}>Confirm Deletion</h2>
              <button onClick={() => setDeletingUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}>✕</button>
            </div>
            <div>
              <p>Are you sure you want to delete this user?</p>
              <p><strong>{deletingUser.firstName} {deletingUser.lastName} ({deletingUser.email})</strong></p>
              <p>This action cannot be undone.</p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className='action-btn btn-primary' onClick={() => setDeletingUser(null)}>Cancel</button>
              <button className='action-btn btn-danger' onClick={handleDeleteUser}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistDashboard;