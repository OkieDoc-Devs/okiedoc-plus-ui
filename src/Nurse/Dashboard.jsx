import '../App.css';
import './NurseStyles.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  getNurseFirstName,
  getNurseProfileImage,
  saveNurseProfileImage,
} from './services/storageService.js';
import {
  fetchDashboardFromAPI,
  fetchDoctorsFromAPI,
  fetchNurseProfile,
  fetchTicketsFromAPI,
  logoutFromAPI,
  updateTicket,
  claimTicket,
  triageTicket,
  assignSpecialist,
} from './services/apiService.js';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { transformProfileFromAPI } from './services/profileService.js';
import NotificationBell from '../components/Notifications/NotificationBell';
import Avatar from '../components/Avatar';
import { disconnectSocket } from '../utils/socketClient';
import { useChat } from './services/useChat.js';

const DEFAULT_TEXT = 'N/A';
const DASHBOARD_REFRESH_MS = 30000;
const QUICK_MESSAGE_LIMIT = 8;
const NURSE_QUEUE_VISIBLE_STATUSES = new Set(['', 'pending']);
const PROCESS_STEP_LABELS = [
  'Review HMO Details',
  'Schedule a Specialist',
  'Review and Transfer',
];

const readValue = (source, keys, fallback = DEFAULT_TEXT) => {
  for (const key of keys) {
    if (
      Object.prototype.hasOwnProperty.call(source || {}, key) &&
      source[key] !== null &&
      source[key] !== undefined &&
      String(source[key]).trim() !== ''
    ) {
      return source[key];
    }
  }
  return fallback;
};

const toList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => String(entry || '').trim())
          .filter(Boolean);
      }
    } catch {
      // Keep plain text parsing path below when value is not JSON.
    }

    return trimmed
      .split(/\n|,|;/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const formatDate = (dateString) => {
  if (!dateString) return DEFAULT_TEXT;

  try {
    let date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);

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
    return String(dateString);
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateAge = (birthdate) => {
  if (!birthdate) return DEFAULT_TEXT;
  const today = new Date();
  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return DEFAULT_TEXT;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : DEFAULT_TEXT;
};

const normalizeStatus = (ticket, isSelected) => {
  if (isSelected) {
    return 'active';
  }

  const urgency = String(ticket.urgency || ticket.priority || '').toLowerCase();
  const status = String(ticket.status || '').toLowerCase();

  if (urgency === 'high' || status === 'urgent' || status.includes('urgent')) {
    return 'urgent';
  }

  return 'pending';
};

const getStatusLabel = (status) => {
  if (!status) return 'pending';
  if (status === 'active') return 'active';
  if (status === 'urgent') return 'Urgent';
  return status;
};

const getPatientIdFromTicket = (ticket) => {
  const id = readValue(
    ticket,
    ['patientId', 'Patient_ID', 'patientUserId', 'User_ID', 'userId'],
    null,
  );

  if (id === null || id === undefined || id === '') {
    return null;
  }

  const parsed = Number(id);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeTicketStatus = (status) => String(status || '').trim().toLowerCase();

const isVisibleInNurseQueue = (status) =>
  NURSE_QUEUE_VISIBLE_STATUSES.has(normalizeTicketStatus(status));

const formatScheduleTime = (timeString) => {
  if (!timeString) return DEFAULT_TEXT;

  const parsed = new Date(`1970-01-01T${timeString}`);
  if (Number.isNaN(parsed.getTime())) {
    return timeString;
  }

  return parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};



export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();

  const [nurseName, setNurseName] = useState(getNurseFirstName());
  const [nurseProfileImage, setNurseProfileImage] = useState(getNurseProfileImage());
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quickMessage, setQuickMessage] = useState('');
  const [quickMessageError, setQuickMessageError] = useState('');
  const [isSendingQuickMessage, setIsSendingQuickMessage] = useState(false);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [ticketDetailTab, setTicketDetailTab] = useState('assessment');
  const [doctors, setDoctors] = useState([]);
  const [urgency, setUrgency] = useState('medium');
  const [targetSpecialty, setTargetSpecialty] = useState('');
  const [assignedSpecialist, setAssignedSpecialist] = useState('');
  const [isTriaging, setIsTriaging] = useState(false);

  const selectedPatientId = useMemo(
    () => (selectedTicket ? getPatientIdFromTicket(selectedTicket) : null),
    [selectedTicket],
  );

  const creatingConversationFor = useRef(null);

  const {
    conversations,
    activeConversation,
    messages,
    openConversation,
    startConversation,
    sendMessage: sendChatMessage,
  } = useChat({ currentUserId: user?.id || null, currentUserType: 'n' });

  const handleLogout = async () => {
    try {
      disconnectSocket();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/');
  };

  useEffect(() => {
    let isMounted = true;

    const loadDoctors = async () => {
      try {
        const data = await fetchDoctorsFromAPI();
        if (isMounted) {
          setDoctors(data || []);
        }
      } catch (error) {
        console.error('Dashboard: Error loading doctors:', error);
      }
    };

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const nurse = await fetchNurseProfile();
        const profileData = transformProfileFromAPI(nurse);

        if (!isMounted) {
          return;
        }

        if (profileData.firstName) {
          setNurseName(profileData.firstName);
          localStorage.setItem('nurse.firstName', profileData.firstName);
        }

        if (profileData.profileImage) {
          saveNurseProfileImage(profileData.profileImage);
          setNurseProfileImage(getNurseProfileImage());
        } else {
          localStorage.removeItem('nurse.profileImage');
          setNurseProfileImage('/account.svg');
        }
      } catch (profileError) {
        console.error('Could not fetch nurse profile:', profileError.message);
      }

      try {
        console.log('Dashboard: Fetching from dashboard API...');
        const dashboardData = await fetchDashboardFromAPI();
        console.log('Dashboard: Dashboard API response:', dashboardData);
        const dashboardTickets = Array.isArray(dashboardData?.tickets)
          ? dashboardData.tickets
          : [];
        console.log('Dashboard: Dashboard tickets:', dashboardTickets);

        if (!isMounted) {
          return;
        }

        if (dashboardTickets.length > 0) {
          console.log('Dashboard: Setting tickets from dashboard API:', dashboardTickets.length);
          setTickets(dashboardTickets);
          return;
        }
      } catch (dashboardError) {
        console.log('Dashboard API not available, trying individual endpoints:', dashboardError.message);
      }

      try {
        console.log('Dashboard: Fetching from tickets API...');
        const apiTickets = await fetchTicketsFromAPI();
        console.log('Dashboard: Tickets API response:', apiTickets);
        if (isMounted) {
          const ticketsArray = Array.isArray(apiTickets) ? apiTickets : [];
          console.log('Dashboard: Setting tickets from individual API:', ticketsArray.length);
          setTickets(ticketsArray);
        }
      } catch (ticketError) {
        console.error('Dashboard: Tickets API error:', ticketError.message);
        if (isMounted) {
          setTickets([]);
        }
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, DASHBOARD_REFRESH_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedTicket || !selectedPatientId) {
      return;
    }

    const existingConversation = conversations.find((conversation) =>
      (conversation.participants || []).some(
        (participant) => Number(participant.id) === Number(selectedPatientId),
      ),
    );

    if (existingConversation) {
      if (Number(activeConversation?.id) !== Number(existingConversation.id)) {
        openConversation(existingConversation).catch((error) => {
          console.error('Failed to open quick conversation:', error);
        });
      }
      return;
    }

    if (creatingConversationFor.current === selectedPatientId) {
      return;
    }

    creatingConversationFor.current = selectedPatientId;

    startConversation('direct', selectedPatientId)
      .catch((error) => {
        console.error('Failed to create quick conversation:', error);
      })
      .finally(() => {
        creatingConversationFor.current = null;
      });
  }, [
    activeConversation?.id,
    conversations,
    openConversation,
    selectedPatientId,
    selectedTicket,
    startConversation,
  ]);

  const selectedPatient = useMemo(() => {
    if (!selectedTicket) {
      return null;
    }

    const bloodType = readValue(selectedTicket, ['bloodType', 'Blood_Type']);
    const allergies = toList(
      readValue(selectedTicket, ['allergies', 'Allergies', 'patientAllergies'], ''),
    );
    const medicalHistory = toList(
      readValue(selectedTicket, ['medicalHistory', 'Medical_History', 'history'], ''),
    );

    return {
      fullName: readValue(selectedTicket, ['patientName', 'fullName', 'name']),
      age:
        readValue(selectedTicket, ['age'], null) ||
        calculateAge(readValue(selectedTicket, ['patientBirthdate', 'birthdate', 'dob'], null)),
      gender: readValue(selectedTicket, ['gender', 'sex']),
      phone: readValue(selectedTicket, ['mobile', 'phone', 'contactNumber']),
      email: readValue(selectedTicket, ['email', 'patientEmail']),
      address: readValue(
        selectedTicket,
        [
          'address',
          'fullAddress',
          'patientAddress',
          'addressLine1',
          'streetAddress',
        ],
      ),
      bloodType,
      allergies,
      medicalHistory,
      lastVisit: formatDate(
        readValue(
          selectedTicket,
          ['lastVisit', 'lastVisitDate', 'lastConsultationDate', 'updatedAt'],
          null,
        ),
      ),
      chiefComplaint: readValue(selectedTicket, ['chiefComplaint', 'consultationType']),
      symptoms: readValue(selectedTicket, ['symptoms', 'symptomDescription']),
      temperature: readValue(selectedTicket, ['temperature', 'temp', 'vitalTemperature']),
      bloodPressure: readValue(
        selectedTicket,
        ['bloodPressure', 'bp', 'vitalBloodPressure'],
      ),
      heartRate: readValue(selectedTicket, ['heartRate', 'bpm', 'vitalHeartRate']),
      respiratoryRate: readValue(
        selectedTicket,
        ['respiratoryRate', 'respRate', 'vitalRespiratoryRate'],
      ),
      additionalNotes: readValue(
        selectedTicket,
        ['additionalNotes', 'notes', 'assessment'],
      ),
    };
  }, [selectedTicket]);

  const quickMessages = useMemo(
    () => messages.slice(-QUICK_MESSAGE_LIMIT),
    [messages],
  );

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

  const handleQuickSendMessage = async (event) => {
    event.preventDefault();

    if (!quickMessage.trim()) {
      return;
    }

    if (!activeConversation?.id) {
      setQuickMessageError('No conversation is available for this patient yet.');
      return;
    }

    setIsSendingQuickMessage(true);
    setQuickMessageError('');

    try {
      await sendChatMessage(quickMessage.trim());
      setQuickMessage('');
    } catch (error) {
      console.error('Failed to send quick message:', error);
      setQuickMessageError('Unable to send your message right now.');
    } finally {
      setIsSendingQuickMessage(false);
    }
  };

  return (
    <div className='dashboard'>
      <div className='dashboard-header'>
        <div className='header-center'>
          <img src='/okie-doc-logo.png' alt='Okie-Doc+' className='logo-image' />
        </div>
        <h3 className='dashboard-title'>Nurse Dashboard</h3>

        <div className='nurse-header-actions'>
          <NotificationBell />
          <div className='user-account'>
            <Avatar
              profileImageUrl={nurseProfileImage !== '/account.svg' ? nurseProfileImage : null}
              firstName={nurseName}
              lastName={localStorage.getItem('nurse.lastName') || ''}
              userType='nurse'
              size={40}
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
              <button className='dropdown-item logout-item' onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className='dashboard-nav'>
          <button className='nav-tab active' onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button
            className='nav-tab'
            onClick={() => navigate('/nurse-manage-appointments')}
          >
            Manage Appointments
          </button>
          <button className='nav-tab' onClick={() => navigate('/nurse-messages')}>
            Messages
          </button>
        </div>
      </div>

      <div className='nurse-service-area-banner'>
        <strong>Service Area:</strong> Bicol Region, Camarines Sur, Naga
      </div>

      <div className='nurse-dashboard-3col'>
        <section className='nurse-dashboard-queue'>
          <div className='nurse-panel-title'>Patient Queue</div>
          <div className='nurse-queue-list'>
            {tickets.length > 0 ? (
              tickets.map((ticket) => {
                const isSelected = Number(selectedTicket?.id) === Number(ticket.id);
                const status = normalizeStatus(ticket, isSelected);
                const statusLabel = getStatusLabel(status);

                return (
                  <button
                    key={ticket.id}
                    type='button'
                    className={`nurse-queue-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowTicketDetailModal(true);
                      setTicketDetailTab('assessment');
                      setQuickMessageError('');
                    }}
                  >
                    <div className='nurse-queue-card-top'>
                      <div>
                        <div className='nurse-ticket-code'>
                          T-{String(ticket.id).padStart(3, '0')}
                        </div>
                        <div className='nurse-ticket-name'>
                          {readValue(ticket, ['patientName', 'fullName', 'name'])}
                        </div>
                      </div>
                      <span className={`nurse-status-badge ${status}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className='nurse-ticket-time'>
                      {formatTime(readValue(ticket, ['preferredDate', 'createdAt'], null))}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className='nurse-empty-note'>No tickets available</div>
            )}
          </div>
        </section>

        <section className='nurse-dashboard-patient'>
          <div className='nurse-panel-title'>Patient Information</div>

          {!selectedPatient ? (
            <div className='nurse-patient-placeholder'>patient information</div>
          ) : (
            <>
              <div className='nurse-patient-header'>
                <div className='nurse-patient-avatar'>
                  {(selectedPatient.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{selectedPatient.fullName}</h2>
                  <p>
                    {selectedPatient.age} years old - {selectedPatient.gender}
                  </p>
                </div>
                <button
                  className='nurse-transfer-btn'
                  type='button'
                  onClick={() => navigate('/nurse-manage-appointments')}
                >
                  Process Ticket
                </button>
              </div>

              <div className='nurse-patient-grid'>
                <article className='nurse-patient-card'>
                  <h4>Phone</h4>
                  <p>{selectedPatient.phone}</p>
                </article>
                <article className='nurse-patient-card'>
                  <h4>Email</h4>
                  <p>{selectedPatient.email}</p>
                </article>
                <article className='nurse-patient-card'>
                  <h4>Address</h4>
                  <p>{selectedPatient.address}</p>
                </article>
                <article className='nurse-patient-card'>
                  <h4>Blood Type</h4>
                  <p>{selectedPatient.bloodType}</p>
                </article>
              </div>

              <article className='nurse-patient-wide-card'>
                <h4>Allergies</h4>
                {selectedPatient.allergies.length > 0 ? (
                  <div className='nurse-tag-list'>
                    {selectedPatient.allergies.map((allergy) => (
                      <span key={allergy} className='nurse-danger-tag'>
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>{DEFAULT_TEXT}</p>
                )}
              </article>

              <article className='nurse-patient-wide-card'>
                <h4>Medical History</h4>
                {selectedPatient.medicalHistory.length > 0 ? (
                  <ul>
                    {selectedPatient.medicalHistory.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{DEFAULT_TEXT}</p>
                )}
              </article>

              <article className='nurse-patient-wide-card'>
                <h4>Last Visit</h4>
                <p>{selectedPatient.lastVisit}</p>
              </article>

              <div className='nurse-subsection-title'>Consultation Information</div>
              <div className='nurse-consultation-body'>
                <div className='nurse-consultation-field'>
                  <label>Chief Complaint</label>
                  <p>{selectedPatient.chiefComplaint}</p>
                </div>

                <div className='nurse-consultation-field'>
                  <label>Symptoms</label>
                  <p>{selectedPatient.symptoms}</p>
                </div>

                <div className='nurse-vitals-grid'>
                  <div className='nurse-vital-card'>
                    <label>Temperature (C)</label>
                    <p>{selectedPatient.temperature}</p>
                  </div>
                  <div className='nurse-vital-card'>
                    <label>Blood Pressure</label>
                    <p>{selectedPatient.bloodPressure}</p>
                  </div>
                  <div className='nurse-vital-card'>
                    <label>Heart Rate (bpm)</label>
                    <p>{selectedPatient.heartRate}</p>
                  </div>
                  <div className='nurse-vital-card'>
                    <label>Respiratory Rate</label>
                    <p>{selectedPatient.respiratoryRate}</p>
                  </div>
                </div>

                <div className='nurse-consultation-field'>
                  <label>Additional Notes</label>
                  <p>{selectedPatient.additionalNotes}</p>
                </div>
              </div>
            </>
          )}
        </section>

        <section className='nurse-dashboard-right'>
          <div className='nurse-right-top'>
            <div className='nurse-right-panel-header'>
              <div className='nurse-panel-title'>Consultation</div>
              <button
                type='button'
                className='nurse-messages-arrow-btn'
                onClick={() => navigate('/nurse-messages')}
                title='Go to Messages'
                aria-label='Go to Messages'
              >
                {'→'}
              </button>
            </div>

            {!selectedTicket ? (
              <div className='nurse-empty-note'>Select a ticket to open quick messaging.</div>
            ) : (
              <>
                <div className='nurse-quick-chat-list'>
                  {quickMessages.length > 0 ? (
                    quickMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`nurse-quick-chat-bubble ${message.isSent ? 'sent' : 'received'}`}
                      >
                        <p>{message.text}</p>
                        <span>{message.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <div className='nurse-empty-note'>No messages yet for this patient.</div>
                  )}
                </div>

                <form className='nurse-quick-chat-form' onSubmit={handleQuickSendMessage}>
                  <input
                    type='text'
                    placeholder='Type a message...'
                    value={quickMessage}
                    onChange={(event) => setQuickMessage(event.target.value)}
                    disabled={!activeConversation?.id || isSendingQuickMessage}
                  />
                  <button
                    type='submit'
                    disabled={!quickMessage.trim() || isSendingQuickMessage}
                  >
                    Send
                  </button>
                </form>

                {quickMessageError && (
                  <p className='nurse-quick-error'>{quickMessageError}</p>
                )}
              </>
            )}
          </div>
        </section>
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
                    Triage & specialist assignment
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
