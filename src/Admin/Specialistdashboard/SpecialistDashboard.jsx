import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import PendingTable from './PendingTable';
import SpecialistTable from './SpecialistTable';
import ConsultationHistory from '../ConsultationHistory/ConsultationHistory';
import Modal from '../Components/Modal';
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
import NotificationBell from '../../components/Notifications/NotificationBell';

const SpecialistDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

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
  const [discount, setDiscount] = useState({
    name: 'Discount',
    type: 'percentage',
    value: 0,
    isActive: false,
  });
  const [notes, setNotes] = useState({ checkout: '', isActive: true });

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

        const specialistsArray = Array.isArray(specialistsData)
          ? specialistsData
          : specialistsData?.specialists || specialistsData?.data || [];
        const pendingArray = Array.isArray(pendingData)
          ? pendingData
          : pendingData?.applications || pendingData?.data || [];
        const transactionsArray = Array.isArray(transactionsData)
          ? transactionsData
          : transactionsData?.transactions || transactionsData?.data || [];
        const consultationsArray = Array.isArray(consultationsData)
          ? consultationsData
          : consultationsData?.consultations || consultationsData?.data || [];
        const usersArray = Array.isArray(usersData)
          ? usersData
          : usersData?.users || usersData?.data || [];

        const processedSpecialists = (specialistsArray || []).map(
          (spec, index) => {
            return {
              ...spec,
              name: `${spec.firstName || ''} ${spec.lastName || ''}`.trim(),
              details: {
                s2: { number: spec.s2Number || 'S2-FETCHED', imageUrl: S2 },
                ptr: { number: spec.ptrNumber || 'PTR-FETCHED', imageUrl: PTR },
                prcId: {
                  number: spec.prcLicenseNumber || 'PRC-FETCHED',
                  imageUrl: PRC,
                },
                eSig: esig,
                profilePicture: index % 2 === 0 ? MaleAvatar : FemaleAvatar,
                specializations: spec.specialization
                  ? [spec.specialization]
                  : ['Unknown'],
                subspecializations: ['Sub-specialty Placeholder'],
              },
            };
          },
        );

        const processedPending = (pendingArray || []).map((app, index) => {
          return {
            ...app,
            details: {
              ...(app.details || {}),
              s2: {
                ...(app.details?.s2 || {}),
                imageUrl: app.details?.s2?.imageUrl || S2,
              },
              ptr: {
                ...(app.details?.ptr || {}),
                imageUrl: app.details?.ptr?.imageUrl || PTR,
              },
              prcId: {
                ...(app.details?.prcId || {}),
                imageUrl: app.details?.prcId?.imageUrl || PRC,
              },
              eSig: app.details?.eSig || esig,
              profilePicture:
                app.details?.profilePicture ||
                (index % 2 === 0 ? FemaleAvatar : MaleAvatar),
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
        if (!users || users.length === 0) {
          setUsers([
            {
              id: 'p1',
              userType: 'Patient',
              firstName: 'John',
              lastName: 'Doe',
              email: 'patient@gmail.com',
              mobileNumber: '98765485',
              subscription: 'Paid',
            },
            {
              id: 'n1',
              userType: 'Nurse',
              firstName: 'Leslie',
              lastName: 'Rowland',
              email: 'les@row@gmail.com',
              mobileNumber: '97685334',
              subscription: 'Free',
            },
          ]);
        }
      }
    };

    fetchAndProcessData();
  }, [users]);

  const handleFeeToggle = (feeName) =>
    setSystemFees((prev) => ({
      ...prev,
      [feeName]: { ...prev[feeName], isActive: !prev[feeName].isActive },
    }));
  const handleDiscountToggle = () =>
    setDiscount((prev) => ({ ...prev, isActive: !prev.isActive }));
  const handleNotesToggle = () =>
    setNotes((prev) => ({ ...prev, isActive: !prev.isActive }));

  const allSpecializations = [
    ...new Set(
      [
        ...(pendingApplications || []).flatMap(
          (app) => app.details?.specializations || [],
        ),
        ...(specialists || []).flatMap(
          (spec) => spec.details?.specializations || [],
        ),
        ...(transactions || []).map((t) => t.specialty),
      ].filter(Boolean),
    ),
  ].sort();

  const filteredPending = (pendingApplications || []).filter((app) => {
    const searchString = `${app.name || ''} ${app.email || ''}`.toLowerCase();
    const matchesSearch =
      !searchTerm || searchString.includes(searchTerm.toLowerCase());
    const matchesFilter =
      !filterSpecialization ||
      (app.details?.specializations || []).includes(filterSpecialization);
    return matchesSearch && matchesFilter;
  });

  const filteredSpecialists = (specialists || []).filter((spec) => {
    const searchString =
      `${spec.firstName || ''} ${spec.lastName || ''} ${spec.email || ''}`.toLowerCase();
    const matchesSearch =
      !searchTerm || searchString.includes(searchTerm.toLowerCase());
    const matchesFilter =
      !filterSpecialization ||
      (spec.details?.specializations || []).includes(filterSpecialization);
    return matchesSearch && matchesFilter;
  });

  const filteredTransactions = (transactions || []).filter((t) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (t.patientName || '').toLowerCase().includes(lowerSearchTerm) ||
      (t.specialistName || '').toLowerCase().includes(lowerSearchTerm) ||
      (t.status || '').toLowerCase().includes(lowerSearchTerm);

    const matchesSpecialty =
      !filterSpecialization || t.specialty === filterSpecialization;
    const matchesStatus = !filterStatus || t.status === filterStatus;
    const transactionDate = t.date ? new Date(t.date) : null;
    const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
    const toDate = filterDateTo ? new Date(filterDateTo) : null;

    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    const matchesDate =
      (!fromDate && !toDate) ||
      (transactionDate &&
        (!fromDate || transactionDate >= fromDate) &&
        (!toDate || transactionDate <= toDate));

    return matchesSearch && matchesSpecialty && matchesStatus && matchesDate;
  });

  const filteredUsers = (users || []).filter((user) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const searchString =
      `${user.firstName || ''} ${user.lastName || ''} ${user.email || ''} ${user.mobileNumber || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || searchString.includes(lowerSearchTerm);
    return matchesSearch;
  });

  const filteredConsultations = consultations || [];

  const handleCreateStaff = async (staffData) => {
    try {
      const { createStaff } = await import('../../api/Admin/api.js');
      await createStaff(staffData);
      alert(`${staffData.role} account created successfully!`);
      const usersData = await import('../../api/Admin/api.js').then((m) =>
        m.getPatientAndNurseUsers(),
      );
      const usersArray = Array.isArray(usersData)
        ? usersData
        : usersData?.users || usersData?.data || [];
      setUsers(usersArray);
    } catch (error) {
      console.error(error);
      alert(error.message || `Failed to create ${staffData.role}.`);
      throw error;
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      console.log('Simulating update for user:', updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      );
      alert('User updated successfully! (Simulated)');
    } catch {
      alert('Failed to update user. (Simulated)');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      console.log('Simulating delete for user:', deletingUser);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deletingUser.id),
      );
      alert('User deleted successfully! (Simulated)');
      setDeletingUser(null);
    } catch {
      alert('Failed to delete user. (Simulated)');
    }
  };

  const handleApproveSpecialist = async (specialistId) => {
    try {
      await import('../../api/Admin/api.js').then((module) =>
        module.approveSpecialist({
          specialistId,
          action: 'approve',
        }),
      );
      alert(`Specialist approved!`);
      const pendingData = await getPendingApplications();
      const pendingArray = Array.isArray(pendingData)
        ? pendingData
        : pendingData?.applications || pendingData?.data || [];
      const processedPending = pendingArray.map((app, index) => {
        return {
          ...app,
          details: {
            ...(app.details || {}),
            s2: {
              ...(app.details?.s2 || {}),
              imageUrl: app.details?.s2?.imageUrl || S2,
            },
            ptr: {
              ...(app.details?.ptr || {}),
              imageUrl: app.details?.ptr?.imageUrl || PTR,
            },
            prcId: {
              ...(app.details?.prcId || {}),
              imageUrl: app.details?.prcId?.imageUrl || PRC,
            },
            eSig: app.details?.eSig || esig,
            profilePicture:
              app.details?.profilePicture ||
              (index % 2 === 0 ? FemaleAvatar : MaleAvatar),
          },
        };
      });
      setPendingApplications(processedPending);

      const specialistsData = await import('../../api/Admin/api.js').then((m) =>
        m.getSpecialists(),
      );
      const specialistsArray = Array.isArray(specialistsData)
        ? specialistsData
        : specialistsData?.specialists || specialistsData?.data || [];
      const processedSpecialists = specialistsArray.map((spec, index) => {
        return {
          ...spec,
          name: `${spec.firstName || ''} ${spec.lastName || ''}`.trim(),
          details: {
            s2: { number: spec.s2Number || 'S2-FETCHED', imageUrl: S2 },
            ptr: { number: spec.ptrNumber || 'PTR-FETCHED', imageUrl: PTR },
            prcId: {
              number: spec.prcLicenseNumber || 'PRC-FETCHED',
              imageUrl: PRC,
            },
            eSig: esig,
            profilePicture: index % 2 === 0 ? MaleAvatar : FemaleAvatar,
            specializations: spec.specialization
              ? [spec.specialization]
              : ['Unknown'],
            subspecializations: ['Sub-specialty Placeholder'],
          },
        };
      });
      setSpecialists(processedSpecialists);
    } catch (error) {
      console.error(error);
      alert('Failed to approve specialist.');
    }
  };

  const handleDenySpecialist = async (specialistId, reason) => {
    try {
      await import('../../api/Admin/api.js').then((module) =>
        module.approveSpecialist({
          specialistId,
          action: 'deny',
          reason,
        }),
      );
      alert(`Specialist denied!`);
      const pendingData = await getPendingApplications();
      const pendingArray = Array.isArray(pendingData)
        ? pendingData
        : pendingData?.applications || pendingData?.data || [];
      const processedPending = pendingArray.map((app, index) => {
        return {
          ...app,
          details: {
            ...(app.details || {}),
            s2: {
              ...(app.details?.s2 || {}),
              imageUrl: app.details?.s2?.imageUrl || S2,
            },
            ptr: {
              ...(app.details?.ptr || {}),
              imageUrl: app.details?.ptr?.imageUrl || PTR,
            },
            prcId: {
              ...(app.details?.prcId || {}),
              imageUrl: app.details?.prcId?.imageUrl || PRC,
            },
            eSig: app.details?.eSig || esig,
            profilePicture:
              app.details?.profilePicture ||
              (index % 2 === 0 ? FemaleAvatar : MaleAvatar),
          },
        };
      });
      setPendingApplications(processedPending);

      const specialistsData = await import('../../api/Admin/api.js').then((m) =>
        m.getSpecialists(),
      );
      const specialistsArray = Array.isArray(specialistsData)
        ? specialistsData
        : specialistsData?.specialists || specialistsData?.data || [];
      const processedSpecialists = specialistsArray.map((spec, index) => {
        return {
          ...spec,
          name: `${spec.firstName || ''} ${spec.lastName || ''}`.trim(),
          details: {
            s2: { number: spec.s2Number || 'S2-FETCHED', imageUrl: S2 },
            ptr: { number: spec.ptrNumber || 'PTR-FETCHED', imageUrl: PTR },
            prcId: {
              number: spec.prcLicenseNumber || 'PRC-FETCHED',
              imageUrl: PRC,
            },
            eSig: esig,
            profilePicture: index % 2 === 0 ? MaleAvatar : FemaleAvatar,
            specializations: spec.specialization
              ? [spec.specialization]
              : ['Unknown'],
            subspecializations: ['Sub-specialty Placeholder'],
          },
        };
      });
      setSpecialists(processedSpecialists);
    } catch (error) {
      console.error(error);
      alert('Failed to deny specialist.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Admin logout API call failed:', error);
    } finally {
      sessionStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('admin_token');
      navigate('/login');
    }
  };

  return (
    <div className='dashboard admin-dashboard'>
      <div className='dashboard-header'>
        <div className='header-center'>
          <img src={OkieDocLogo} alt='Okie-Doc+' className='logo-image' />
        </div>
        <h3 className='dashboard-title'>Admin Dashboard</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <NotificationBell />
          <div className='user-account'>
            <img src='/account.svg' alt='Account' className='account-icon' />
            <span className='account-name'>Admin</span>
            <div className='account-dropdown'>
            <button
              className='dropdown-item logout-item'
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        </div>
        <div className='dashboard-nav'>
          <button
            className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Applications
            {filteredPending.length > 0 && (
              <span className='badge'>{filteredPending.length}</span>
            )}
          </button>
          <button
            className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            OkieDoc+ Specialists
          </button>
          <button
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transaction History
          </button>
          <button
            className={`nav-tab ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            Chat Consultations
          </button>
          <button
            className={`nav-tab ${activeTab === 'consultations' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultations')}
          >
            Consultation History
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            System Fee Settings
          </button>
        </div>
      </div>

      <main className='dashboard-container'>
        {activeTab !== 'settings' &&
          activeTab !== 'chats' &&
          activeTab !== 'consultations' && (
            <div className='toolbar'>
              <div className='filters'>
                <input
                  type='text'
                  placeholder='Search...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {(activeTab === 'pending' ||
                  activeTab === 'list' ||
                  activeTab === 'transactions') && (
                  <select
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                    disabled={allSpecializations.length === 0}
                  >
                    <option value=''>Filter by Specialization</option>
                    {allSpecializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                )}

                {activeTab === 'transactions' && (
                  <>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value=''>Filter by Status</option>
                      <option value='Pending'>Pending</option>
                      <option value='Processing'>Processing</option>
                      <option value='For Payment'>For Payment</option>
                      <option value='Confirmed'>Confirmed</option>
                      <option value='Incomplete'>Incomplete</option>
                      <option value='Completed'>Completed</option>
                    </select>
                    <label
                      htmlFor='dateFrom'
                      style={{ marginLeft: '10px', fontSize: '0.9rem' }}
                    >
                      From:
                    </label>
                    <input
                      id='dateFrom'
                      type='date'
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                    />
                    <label
                      htmlFor='dateTo'
                      style={{ marginLeft: '10px', fontSize: '0.9rem' }}
                    >
                      To:
                    </label>
                    <input
                      id='dateTo'
                      type='date'
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                    />
                    <button
                      className='action-btn btn-primary'
                      style={{ backgroundColor: '#0B5388', marginLeft: 'auto' }}
                      onClick={() => handleExport(filteredTransactions)}
                      disabled={filteredTransactions.length === 0}
                    >
                      Export CSV
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        {activeTab === 'pending' && (
          <PendingTable
            applications={filteredPending}
            onApprove={handleApproveSpecialist}
            onDeny={handleDenySpecialist}
          />
        )}
        {activeTab === 'list' && (
          <SpecialistTable specialists={filteredSpecialists} />
        )}

        {activeTab === 'users' && (
          <UserTable
            users={filteredUsers}
            onView={setViewingUser}
            onUpdate={handleUpdateUser}
            onDelete={setDeletingUser}
            onCreateStaff={handleCreateStaff}
          />
        )}

        {activeTab === 'transactions' && (
          <div id='transactions' className='tab-content active'>
            <h2>Transaction History & Management</h2>
            <div className='table-wrapper'>
              <table className='dashboard-table'>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Specialist</th>
                    <th>Specialty</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => (
                      <tr key={t.id}>
                        <td>{t.patientName}</td>
                        <td>{t.specialistName}</td>
                        <td>{t.specialty}</td>
                        <td>{new Date(t.date).toLocaleDateString()}</td>
                        <td>{t.status}</td>
                        <td>{t.channel}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='6' style={{ textAlign: 'center' }}>
                        No transactions found.
                      </td>
                    </tr>
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
          <ConsultationHistory consultations={filteredConsultations} />
        )}

        {activeTab === 'settings' && (
          <div
            id='settings'
            className='tab-content active settings-tab-content'
          >
            <h2>System Fee & Discount Settings</h2>
            <div className='settings-grid'>
              <div className='settings-card'>
                <h3>System Fees</h3>
                {Object.entries(systemFees).map(([key, fee]) => (
                  <div className='settings-item' key={key}>
                    <span>{fee.name}</span>
                    <label className='switch'>
                      <input
                        type='checkbox'
                        checked={fee.isActive}
                        onChange={() => handleFeeToggle(key)}
                      />
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
                    <input
                      type='checkbox'
                      checked={discount.isActive}
                      onChange={handleDiscountToggle}
                    />
                    <span className='slider round'></span>
                  </label>
                </div>
                {discount.isActive && (
                  <>
                    <div className='settings-item'>
                      <label>Discount Type:</label>
                      <select
                        value={discount.type}
                        onChange={(e) =>
                          setDiscount({ ...discount, type: e.target.value })
                        }
                      >
                        <option value='percentage'>Percentage (%)</option>
                        <option value='peso'>Peso (₱)</option>
                      </select>
                    </div>
                    <div className='settings-item'>
                      <label>Discount Value:</label>
                      <input
                        type='number'
                        value={discount.value}
                        onChange={(e) =>
                          setDiscount({
                            ...discount,
                            value: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
              <div className='settings-card notes-card'>
                <h3>Checkout Notes</h3>
                <div className='settings-item'>
                  <span>Display Notes on Checkout</span>
                  <label className='switch'>
                    <input
                      type='checkbox'
                      checked={notes.isActive}
                      onChange={handleNotesToggle}
                    />
                    <span className='slider round'></span>
                  </label>
                </div>
                {notes.isActive && (
                  <div className='settings-item-full'>
                    <label htmlFor='checkout-notes-textarea'>
                      Notes to Display:
                    </label>
                    <textarea
                      id='checkout-notes-textarea'
                      value={notes.checkout}
                      onChange={(e) =>
                        setNotes({ ...notes, checkout: e.target.value })
                      }
                      rows='4'
                      placeholder='Enter notes to show...'
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {viewingUser && (
        <Modal title='User Details' onClose={() => setViewingUser(null)}>
          <div id='modal-body'>
            <p>
              <strong>User Type:</strong> {viewingUser.userType}
            </p>
            <p>
              <strong>First Name:</strong> {viewingUser.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {viewingUser.lastName}
            </p>
            <p>
              <strong>Email:</strong> {viewingUser.email}
            </p>
            <p>
              <strong>Mobile:</strong> {viewingUser.mobileNumber}
            </p>
            <p>
              <strong>Address:</strong>{' '}
              {[
                viewingUser.addressLine1,
                viewingUser.addressLine2,
                viewingUser.barangay,
                viewingUser.city,
                viewingUser.province,
                viewingUser.region,
                viewingUser.zipCode,
              ]
                .filter(Boolean)
                .join(', ') || 'N/A'}
            </p>
            <p>
              <strong>Subscription:</strong> {viewingUser.subscription}
            </p>
          </div>
          <div className='modal-actions'>
            <button
              className='action-btn btn-primary'
              onClick={() => setViewingUser(null)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {deletingUser && (
        <Modal title='Confirm Deletion' onClose={() => setDeletingUser(null)}>
          <div id='modal-body'>
            <p>Are you sure you want to delete this user?</p>
            <p>
              <strong>
                {deletingUser.firstName} {deletingUser.lastName} (
                {deletingUser.email})
              </strong>
            </p>
            <p>This action cannot be undone.</p>
          </div>
          <div className='modal-actions'>
            <button
              className='action-btn btn-primary'
              onClick={() => setDeletingUser(null)}
            >
              Cancel
            </button>
            <button
              className='action-btn btn-danger'
              onClick={handleDeleteUser}
            >
              Delete User
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SpecialistDashboard;
