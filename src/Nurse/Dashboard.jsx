import '../App.css';
import './NurseStyles.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  getNurseFirstName,
  getNurseProfileImage,
  saveNurseProfileImage,
} from './services/storageService.js';
import {
  fetchNurseProfile,
  logoutFromAPI,
  updateTicket,
  claimTicket,
  triageTicket,
  assignSpecialist,
  fetchDoctorsFromAPI,
  fetchTicketsFromAPI,
} from './services/apiService.js';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { transformProfileFromAPI } from './services/profileService.js';
import NotificationBell from '../components/Notifications/NotificationBell';
import { disconnectSocket } from '../utils/socketClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const { unreadCount } = useNotification();
  const { logout } = useAuth();

  const [nurseName, setNurseName] = useState(getNurseFirstName());
  const [nurseProfileImage, setNurseProfileImage] = useState(
    getNurseProfileImage(),
  );
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [ticketDetailTab, setTicketDetailTab] = useState('assessment');
  const [doctors, setDoctors] = useState([]);
  const [urgency, setUrgency] = useState('medium');
  const [targetSpecialty, setTargetSpecialty] = useState('');
  const [assignedSpecialist, setAssignedSpecialist] = useState('');
  const [isTriaging, setIsTriaging] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      let date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      if (
        typeof dateString === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateString.split('T')[0])
      ) {
        date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleLogout = async () => {
    try {
      disconnectSocket();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/');
  };

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      console.log(
        'Dashboard: Starting to load dashboard data for logged-in nurse...',
      );

      try {
        console.log('Dashboard: Fetching nurse profile...');
        const nurse = await fetchNurseProfile();
        const profileData = transformProfileFromAPI(nurse);

        if (profileData.firstName) {
          setNurseName(profileData.firstName);
          localStorage.setItem('nurse.firstName', profileData.firstName);
          console.log(
            'Dashboard: Updated nurse name to:',
            profileData.firstName,
          );
        }

        if (profileData.profileImage) {
          saveNurseProfileImage(profileData.profileImage);
          setNurseProfileImage(getNurseProfileImage());
          console.log(
            'Dashboard: Updated profile image to:',
            getNurseProfileImage(),
          );
        } else {
          localStorage.removeItem('nurse.profileImage');
          setNurseProfileImage('/account.svg');
          console.log('Dashboard: Cleared nurse avatar (no image from API)');
        }
      } catch (profileError) {
        console.log(
          'Dashboard: Could not fetch nurse profile:',
          profileError.message,
        );
      }

      try {
        console.log('Dashboard: Fetching from dashboard API...');
        const dashboardData = await fetchDashboardFromAPI();
        console.log('Dashboard: Dashboard API response:', dashboardData);
        if (dashboardData) {
          if (dashboardData.nurse) {
            const nurseData = dashboardData.nurse;
            if (nurseData.First_Name) {
              setNurseName(nurseData.First_Name);
              localStorage.setItem('nurse.firstName', nurseData.First_Name);
            }
            if (nurseData.Profile_Image_Data_URL) {
              saveNurseProfileImage(nurseData.Profile_Image_Data_URL);
              setNurseProfileImage(getNurseProfileImage());
              console.log(
                'Dashboard: Updated profile image from dashboard API:',
                getNurseProfileImage(),
              );
            } else {
              localStorage.removeItem('nurse.profileImage');
              setNurseProfileImage('/account.svg');
              console.log(
                'Dashboard: Cleared nurse avatar (no image from dashboard API)',
              );
            }
          }

          if (dashboardData.tickets && Array.isArray(dashboardData.tickets)) {
            console.log(
              'Dashboard: Received tickets from dashboard API:',
              dashboardData.tickets.length,
              'tickets',
            );
            setTickets(dashboardData.tickets);
          } else {
            console.log('Dashboard: No tickets in dashboard response');
            setTickets([]);
          }
          return;
        } else {
          console.log('Dashboard: Empty dashboard response, setting defaults');
          setTickets([]);
          return;
        }
      } catch (error) {
        console.log(
          'Dashboard API not available, trying individual endpoints:',
          error.message,
        );

        try {
          console.log('Dashboard: Fetching tickets from individual API...');
          const apiTickets = await fetchTicketsFromAPI();
          console.log('Dashboard: Tickets API response:', apiTickets);
          if (apiTickets && apiTickets.length > 0) {
            console.log(
              'Dashboard: Received tickets from API:',
              apiTickets.length,
              'tickets',
            );
            setTickets(apiTickets);
          } else {
            console.log('Dashboard: No tickets received from API');
            setTickets([]);
          }
        } catch (ticketError) {
          console.error('Dashboard: Tickets API error:', ticketError.message);
          setTickets([]);
        }
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await fetchDoctorsFromAPI();
        setDoctors(data || []);
      } catch (error) {
        console.error('Dashboard: Error loading doctors:', error);
      }
    };
    loadDoctors();
  }, []);

  const handleCompleteTriage = async (ticketId) => {
    if (!targetSpecialty) {
      alert('Please enter a target specialty.');
      return;
    }

    setIsTriaging(true);
    try {
      const triageData = {
        ticketId: parseInt(ticketId, 10),
        targetSpecialty,
        urgency,
      };

      await triageTicket(triageData);

      if (assignedSpecialist) {
        await assignSpecialist(
          parseInt(ticketId, 10),
          parseInt(assignedSpecialist, 10),
        );
      }

      alert('Ticket triaged successfully!');
      setShowTicketDetailModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error triaging ticket:', error);
      alert('Failed to triage ticket: ' + error.message);
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <div className='dashboard'>
      <div className='dashboard-header'>
        <div className='header-center'>
          <img
            src='/okie-doc-logo.png'
            alt='Okie-Doc+'
            className='logo-image'
          />
        </div>
        <h3 className='dashboard-title'>Nurse Dashboard</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <NotificationBell />
          <div className='user-account'>
            <img
              src={nurseProfileImage}
              alt='Account'
              className='account-icon'
            />
            <span className='account-name'>{nurseName}</span>
            <div className='account-dropdown'>
              <button
                className='dropdown-item'
                onClick={() => navigate('/nurse-myaccount')}
              >
                My Account
              </button>
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
            className={`nav-tab active`}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab`}
            onClick={() => navigate('/nurse-manage-appointments')}
          >
            Manage Appointments
          </button>
          <button
            className={`nav-tab`}
            onClick={() => navigate('/nurse-messages')}
          >
            Messages
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#e3f2fd',
          padding: '12px 20px',
          borderBottom: '1px solid #bbdefb',
          fontSize: '14px',
          fontWeight: '500',
          color: '#1565c0',
        }}
      >
        <strong>Service Area:</strong> Bicol Region, Camarines Sur, Naga
      </div>

      <div className='appointments-section'>
        <div className='processing-tickets'>
          <h2>All Tickets ({tickets.length})</h2>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className='ticket-card-new'
              onClick={() => {
                setSelectedTicket(ticket);
                setShowTicketDetailModal(true);
                setTicketDetailTab('assessment');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className='ticket-card-header'>
                <span className='ticket-number'>TICKET #{ticket.id}</span>
              </div>

              <div className='ticket-card-body'>
                <div className='ticket-left-section'>
                  <div className='ticket-patient-details'>
                    <h4 className='ticket-section-title'>PATIENT DETAILS</h4>
                    <div className='ticket-details-grid'>
                      <div className='ticket-details-col'>
                        <p>
                          <strong>Name:</strong> {ticket.patientName}
                        </p>
                        <p>
                          <strong>Age:</strong>{' '}
                          {ticket.age ||
                            calculateAge(ticket.patientBirthdate) ||
                            'N/A'}
                        </p>
                        <p>
                          <strong>Birthdate:</strong>{' '}
                          {formatDate(ticket.patientBirthdate) ||
                            ticket.birthdate ||
                            'N/A'}
                        </p>
                      </div>
                      <div className='ticket-details-col'>
                        <p>
                          <strong>Email:</strong> {ticket.email}
                        </p>
                        <p>
                          <strong>Mobile:</strong> {ticket.mobile}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='ticket-assignments'>
                    <p>
                      <strong>Assigned Nurse:</strong>{' '}
                      {ticket.assignedNurse || 'Unassigned'}
                    </p>
                    <p>
                      <strong>Assigned Specialist:</strong>{' '}
                      {ticket.assignedSpecialist ||
                        ticket.preferredSpecialist ||
                        'Not specified'}
                    </p>
                    <p>
                      <strong>Consultation Type:</strong>{' '}
                      {ticket.consultationType || ticket.chiefComplaint}
                    </p>
                  </div>
                </div>

                <div className='ticket-right-section'>
                  <div className='ticket-meta'>
                    <p>
                      <strong>Date Created:</strong>{' '}
                      {formatDate(ticket.createdAt) ||
                        ticket.dateCreated ||
                        ticket.preferredDate}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`ticket-status-text ${ticket.status?.toLowerCase()}`}
                      >
                        {ticket.status}
                      </span>
                    </p>
                  </div>

                  {ticket.status === 'pending' && !ticket.assignedNurse && (
                    <button
                      className='ticket-history-btn'
                      style={{ background: '#28a745', color: '#fff' }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          window.confirm('Do you want to claim this ticket?')
                        ) {
                          try {
                            await claimTicket(ticket.id);
                            alert('Ticket claimed successfully!');
                            window.location.reload();
                          } catch (err) {
                            alert('Failed to claim ticket: ' + err.message);
                          }
                        }
                      }}
                    >
                      Claim Ticket
                    </button>
                  )}

                  <button
                    className='ticket-history-btn'
                    style={{ marginTop: '8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Feature in progress');
                    }}
                  >
                    Consultation Histories
                  </button>
                  <button
                    className='ticket-history-btn'
                    style={{
                      marginTop: '8px',
                      background: '#0b5388',
                      color: '#fff',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ticket.patientId) {
                        navigate(`/nurse-messages?userId=${ticket.patientId}`);
                      } else {
                        alert('No patient ID found for this ticket.');
                      }
                    }}
                  >
                    Message Patient
                  </button>
                </div>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className='empty-state'>
              <p>No tickets available</p>
            </div>
          )}
        </div>
      </div>

      {showTicketDetailModal && selectedTicket && (
        <div className='modal-overlay'>
          <div
            className='ticket-detail-modal'
            style={{ maxWidth: 900, width: '90%' }}
          >
            <div
              className='modal-header'
              style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: 16 }}
            >
              <div>
                <h2 style={{ margin: 0, color: '#0b5388' }}>
                  TICKET #{selectedTicket.id}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowTicketDetailModal(false);
                  setSelectedTicket(null);
                }}
                className='close-btn'
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: '16px 24px',
                background: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontSize: 12,
                      color: '#666',
                      textTransform: 'uppercase',
                    }}
                  >
                    Patient Details
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Name:</strong> {selectedTicket.patientName}
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Email:</strong> {selectedTicket.email}
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Age:</strong>{' '}
                    {selectedTicket.age ||
                      calculateAge(selectedTicket.patientBirthdate) ||
                      'N/A'}
                  </p>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>Mobile:</strong> {selectedTicket.mobile}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Birthdate:</strong>{' '}
                    {formatDate(selectedTicket.patientBirthdate) || 'N/A'}
                  </p>
                  <p style={{ margin: '4px 0 0' }}>
                    <strong>Address:</strong>{' '}
                    {[
                      selectedTicket.addressLine1,
                      selectedTicket.addressLine2,
                      selectedTicket.barangay,
                      selectedTicket.city,
                      selectedTicket.province,
                      selectedTicket.region,
                      selectedTicket.zipCode,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'N/A'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px', color: '#0b5388' }}>
                    <strong>Date Created:</strong>{' '}
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong>{' '}
                    <span
                      style={{
                        color:
                          selectedTicket.status === 'Confirmed'
                            ? '#2196f3'
                            : selectedTicket.status === 'Completed'
                              ? '#4caf50'
                              : selectedTicket.status === 'Processing'
                                ? '#2196f3'
                                : '#ff9800',
                      }}
                    >
                      {selectedTicket.status}
                    </span>
                  </p>
                </div>
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid #e0e0e0',
                }}
              >
                <p style={{ margin: '0 0 4px' }}>
                  <strong>Assigned Nurse:</strong>{' '}
                  {selectedTicket.assignedNurse || 'Unassigned'}
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  <strong>Assigned Specialist:</strong>{' '}
                  {selectedTicket.assignedSpecialist ||
                    selectedTicket.preferredSpecialist ||
                    'Not specified'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Consultation Type:</strong>{' '}
                  {selectedTicket.consultationChannel ||
                    selectedTicket.chiefComplaint}
                </p>
              </div>
              <div
                style={{
                  marginTop: 16,
                  textAlign: 'right',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}
              >
                {selectedTicket.status === 'pending' &&
                  !selectedTicket.assignedNurse && (
                    <button
                      className='action-btn'
                      style={{
                        background: '#28a745',
                        color: '#fff',
                        padding: '8px 20px',
                        borderRadius: 20,
                      }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          window.confirm('Do you want to claim this ticket?')
                        ) {
                          try {
                            await claimTicket(selectedTicket.id);
                            alert('Ticket claimed successfully!');
                            setShowTicketDetailModal(false);
                            window.location.reload();
                          } catch (err) {
                            alert('Failed to claim ticket: ' + err.message);
                          }
                        }
                      }}
                    >
                      Claim Ticket
                    </button>
                  )}
                <button
                  className='action-btn'
                  style={{
                    background: '#0b5388',
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: 20,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Feature in progress');
                  }}
                >
                  Consultation Histories
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                borderBottom: '2px solid #e0e0e0',
                background: '#fff',
              }}
            >
              {[
                'assessment',
                'medicalHistory',
                'laboratoryRequest',
                'prescription',
                ...(selectedTicket?.status === 'processing' &&
                selectedTicket?.assignedNurse
                  ? ['triage']
                  : []),
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTicketDetailTab(tab)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: 'none',
                    background:
                      ticketDetailTab === tab ? '#e3f2fd' : 'transparent',
                    color: ticketDetailTab === tab ? '#0b5388' : '#666',
                    fontWeight: ticketDetailTab === tab ? 600 : 400,
                    cursor: 'pointer',
                    borderBottom:
                      ticketDetailTab === tab
                        ? '2px solid #0b5388'
                        : '2px solid transparent',
                    marginBottom: '-2px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab === 'assessment' && 'Assessment'}
                  {tab === 'medicalHistory' && 'Medical History'}
                  {tab === 'laboratoryRequest' && 'Laboratory Request'}
                  {tab === 'prescription' && 'Prescription'}
                  {tab === 'triage' && 'Triage'}
                </button>
              ))}
            </div>

            <div
              className='modal-body'
              style={{
                padding: 24,
                maxHeight: 400,
                overflowY: 'auto',
                background: '#e8f4fc',
              }}
            >
              {ticketDetailTab === 'triage' && (
                <div
                  style={{
                    background: '#fff',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <h3 style={{ marginBottom: 16, color: '#0b5388' }}>
                    Triage & specialist Assignment
                  </h3>

                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 4,
                        fontWeight: 600,
                      }}
                    >
                      Target Specialty:
                    </label>
                    <input
                      type='text'
                      placeholder='e.g. Pediatrics, Cardiology'
                      value={targetSpecialty}
                      onChange={(e) => setTargetSpecialty(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 4,
                        border: '1px solid #ccc',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 4,
                        fontWeight: 600,
                      }}
                    >
                      Urgency:
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 4,
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 4,
                        fontWeight: 600,
                      }}
                    >
                      Assign specialist (Optional):
                    </label>
                    <select
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 4,
                        border: '1px solid #ccc',
                      }}
                      value={assignedSpecialist}
                      onChange={(e) => setAssignedSpecialist(e.target.value)}
                    >
                      <option value=''>Select specialist</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className='action-btn'
                    style={{
                      width: '100%',
                      background: '#28a745',
                      color: '#fff',
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    disabled={isTriaging}
                    onClick={() => handleCompleteTriage(selectedTicket.id)}
                  >
                    {isTriaging ? 'Completing Triage...' : 'Complete Triage'}
                  </button>
                </div>
              )}

              {ticketDetailTab === 'assessment' && (
                <div>
                  {selectedTicket?.assessment ? (
                    <p
                      style={{
                        lineHeight: 1.8,
                        color: '#333',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {selectedTicket.assessment}
                    </p>
                  ) : (
                    <p
                      style={{
                        lineHeight: 1.8,
                        color: '#999',
                        fontStyle: 'italic',
                      }}
                    >
                      No assessment has been added yet. The specialist will add
                      an assessment during the consultation.
                    </p>
                  )}
                </div>
              )}

              {ticketDetailTab === 'medicalHistory' && (
                <div>
                  {selectedTicket?.medicalHistory ? (
                    <p
                      style={{
                        lineHeight: 1.8,
                        color: '#333',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {selectedTicket.medicalHistory}
                    </p>
                  ) : (
                    <p
                      style={{
                        lineHeight: 1.8,
                        color: '#999',
                        fontStyle: 'italic',
                      }}
                    >
                      No medical history has been recorded for this patient.
                    </p>
                  )}
                </div>
              )}

              {ticketDetailTab === 'laboratoryRequest' && (
                <div>
                  {selectedTicket?.laboratoryRequest ? (
                    (() => {
                      try {
                        const labRequests = JSON.parse(
                          selectedTicket.laboratoryRequest,
                        );
                        if (
                          Array.isArray(labRequests) &&
                          labRequests.length > 0
                        ) {
                          return (
                            <ol style={{ paddingLeft: 20 }}>
                              {labRequests.map((lab, idx) => (
                                <li
                                  key={idx}
                                  style={{ marginBottom: 12, lineHeight: 1.6 }}
                                >
                                  <strong>
                                    {lab.testName || lab.test || lab.name}
                                  </strong>
                                  {lab.notes && <span> - {lab.notes}</span>}
                                  {lab.remarks && <span> - {lab.remarks}</span>}
                                </li>
                              ))}
                            </ol>
                          );
                        }
                        return (
                          <p
                            style={{
                              lineHeight: 1.8,
                              color: '#333',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {selectedTicket.laboratoryRequest}
                          </p>
                        );
                      } catch {
                        return (
                          <p
                            style={{
                              lineHeight: 1.8,
                              color: '#333',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {selectedTicket.laboratoryRequest}
                          </p>
                        );
                      }
                    })()
                  ) : (
                    <p
                      style={{
                        lineHeight: 1.8,
                        color: '#999',
                        fontStyle: 'italic',
                      }}
                    >
                      No laboratory requests have been added yet.
                    </p>
                  )}
                </div>
              )}

              {ticketDetailTab === 'prescription' && (
                <div>
                  {selectedTicket?.prescription ? (
                    (() => {
                      try {
                        const medicines = JSON.parse(
                          selectedTicket.prescription,
                        );
                        if (Array.isArray(medicines) && medicines.length > 0) {
                          return (
                            <ol style={{ paddingLeft: 20 }}>
                              {medicines.map((med, idx) => (
                                <li
                                  key={idx}
                                  style={{ marginBottom: 12, lineHeight: 1.6 }}
                                >
                                  <strong>
                                    {med.name ||
                                      med.medicineName ||
                                      med.generic ||
                                      med.brand}
                                  </strong>
                                  {med.dosage && <span> - {med.dosage}</span>}
                                  {med.form && <span> ({med.form})</span>}
                                  {med.frequency && (
                                    <span>, {med.frequency}</span>
                                  )}
                                  {med.duration && (
                                    <span> for {med.duration}</span>
                                  )}
                                  {med.instructions && (
                                    <div
                                      style={{
                                        fontSize: '0.9em',
                                        color: '#666',
                                      }}
                                    >
                                      Instructions: {med.instructions}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ol>
                          );
                        }
                        return (
                          <p
                            style={{
                              lineHeight: 1.8,
                              color: '#333',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {selectedTicket.prescription}
                          </p>
                        );
                      } catch {
                        return (
                          <p
                            style={{
                              lineHeight: 1.8,
                              color: '#333',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {selectedTicket.prescription}
                          </p>
                        );
                      }
                    })()
                  ) : (
                    <p
                      style={{
                        lineHeight: 1.8,
                        color: '#999',
                        fontStyle: 'italic',
                      }}
                    >
                      No prescription has been added yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                background: '#fff',
              }}
            >
              {(selectedTicket.status === 'Confirmed' ||
                selectedTicket.status === 'Processing') && (
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        'Are you sure you want to mark this ticket as completed?',
                      )
                    ) {
                      try {
                        await updateTicket(selectedTicket.id, {
                          status: 'Completed',
                        });
                        alert('Ticket marked as completed!');
                        setShowTicketDetailModal(false);
                        setSelectedTicket(null);
                        const dashboardData = await fetchDashboardFromAPI();
                        if (dashboardData.success) {
                          setNurseName(
                            dashboardData.data?.nurse?.firstName || nurseName,
                          );
                        }
                        const ticketsData = await fetchTicketsFromAPI();
                        if (ticketsData.success) {
                          window.location.reload();
                        }
                      } catch (error) {
                        console.error('Error completing ticket:', error);
                        alert(
                          error.message ||
                            'Failed to complete ticket. Please try again.',
                        );
                      }
                    }
                  }}
                  style={{
                    background: '#4caf50',
                    color: '#fff',
                    padding: '10px 24px',
                    borderRadius: 20,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Mark as Completed
                </button>
              )}
              <button
                onClick={() => {
                  setShowTicketDetailModal(false);
                  setSelectedTicket(null);
                }}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  padding: '10px 24px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
