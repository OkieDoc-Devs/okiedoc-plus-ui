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
  triageTicket,
} from './services/apiService.js';
import { useAuth } from '../contexts/AuthContext';
import { transformProfileFromAPI } from './services/profileService.js';
import NotificationBell from '../components/Notifications/NotificationBell';
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



export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [nurseName, setNurseName] = useState(getNurseFirstName());
  const [nurseProfileImage, setNurseProfileImage] = useState(getNurseProfileImage());
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quickMessage, setQuickMessage] = useState('');
  const [quickMessageError, setQuickMessageError] = useState('');
  const [isSendingQuickMessage, setIsSendingQuickMessage] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processStep, setProcessStep] = useState(1);
  const [processError, setProcessError] = useState('');
  const [isProcessingTicket, setIsProcessingTicket] = useState(false);
  const [availableSpecialists, setAvailableSpecialists] = useState([]);
  const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(false);
  const [processData, setProcessData] = useState({
    hmoProvider: '',
    hmoNumber: '',
    targetSpecialty: '',
    specialistId: '',
  });

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
        const dashboardData = await fetchDashboardFromAPI();
        const dashboardTickets = Array.isArray(dashboardData?.tickets)
          ? dashboardData.tickets
          : [];

        if (!isMounted) {
          return;
        }

        if (dashboardTickets.length > 0) {
          setTickets(dashboardTickets);
          return;
        }
      } catch {
        // Fallback to tickets endpoint below.
      }

      try {
        const apiTickets = await fetchTicketsFromAPI();
        if (isMounted) {
          setTickets(Array.isArray(apiTickets) ? apiTickets : []);
        }
      } catch (ticketError) {
        console.error('Tickets API error:', ticketError.message);
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

  const queueTickets = useMemo(
    () => tickets.filter((ticket) => isVisibleInNurseQueue(ticket.status)),
    [tickets],
  );

  useEffect(() => {
    if (!selectedTicket) {
      return;
    }

    const isStillVisible = queueTickets.some(
      (ticket) => Number(ticket.id) === Number(selectedTicket.id),
    );

    if (!isStillVisible) {
      setSelectedTicket(null);
      setQuickMessage('');
      setQuickMessageError('');
    }
  }, [queueTickets, selectedTicket]);

  useEffect(() => {
    let isMounted = true;

    const loadSpecialists = async () => {
      if (!showProcessModal || availableSpecialists.length > 0) {
        return;
      }

      setIsLoadingSpecialists(true);
      try {
        const specialists = await fetchDoctorsFromAPI();
        if (isMounted) {
          setAvailableSpecialists(Array.isArray(specialists) ? specialists : []);
        }
      } catch (error) {
        console.error('Failed to load specialists for processing flow:', error);
      } finally {
        if (isMounted) {
          setIsLoadingSpecialists(false);
        }
      }
    };

    loadSpecialists();

    return () => {
      isMounted = false;
    };
  }, [availableSpecialists.length, showProcessModal]);

  const handleOpenProcessModal = () => {
    if (!selectedTicket) {
      return;
    }

    const hmoInfo =
      selectedTicket.hmo && typeof selectedTicket.hmo === 'object'
        ? selectedTicket.hmo
        : {};
    setProcessData({
      hmoProvider:
        readValue(
          selectedTicket,
          ['hmoProvider', 'HMOProvider', 'hmoCompany', 'company'],
          hmoInfo.company || '',
        ) ||
        '',
      hmoNumber:
        readValue(
          selectedTicket,
          [
            'hmoMemberId',
            'hmoNumber',
            'HMONumber',
            'hmoPolicyNo',
            'memberId',
            'loaCode',
          ],
          hmoInfo.memberId || '',
        ) || '',
      targetSpecialty: '',
      specialistId: '',
    });
    setProcessError('');
    setProcessStep(1);
    setShowProcessModal(true);
  };

  const handleAdvanceToReview = () => {
    if (!processData.targetSpecialty.trim()) {
      setProcessError('Please provide a target specialty before continuing.');
      return;
    }

    if (!processData.specialistId) {
      setProcessError('Please select an available specialist before continuing.');
      return;
    }

    setProcessError('');
    setProcessStep(3);
  };

  const effectiveAppointmentDate =
    readValue(selectedTicket, ['preferredDate'], '');
  const effectiveAppointmentTime =
    readValue(selectedTicket, ['preferredTime'], '');
  const effectiveSpecialistName =
    availableSpecialists.find(
      (specialist) => Number(specialist.id) === Number(processData.specialistId),
    )?.name ||
    readValue(selectedTicket, ['assignedSpecialist'], '') ||
    'Specialist Pool';
  const effectiveHmoProvider =
    processData.hmoProvider ||
    readValue(selectedTicket, ['hmoProvider', 'hmoCompany'], '');
  const effectiveHmoNumber =
    processData.hmoNumber ||
    readValue(selectedTicket, ['hmoMemberId', 'hmoNumber', 'loaCode'], '');

  const handleTransferTicket = async () => {
    if (!selectedTicket) {
      return;
    }

    const ticketId = Number(selectedTicket.id);
    if (Number.isNaN(ticketId)) {
      setProcessError('Ticket id is invalid. Please refresh and try again.');
      return;
    }

    setIsProcessingTicket(true);
    setProcessError('');

    try {
      const payload = {
        ticketId,
        targetSpecialty: processData.targetSpecialty.trim(),
        urgency: 'medium',
      };

      if (processData.specialistId) {
        payload.specialistId = Number(processData.specialistId);
      }

      await triageTicket(payload);

      setTickets((prev) =>
        prev.filter((ticket) => Number(ticket.id) !== ticketId),
      );
      setSelectedTicket(null);
      setQuickMessage('');
      setQuickMessageError('');
      setShowProcessModal(false);
      setProcessStep(1);
      alert('Ticket successfully transferred to the specialist dashboard.');
    } catch (error) {
      console.error('Failed to transfer ticket from nurse dashboard:', error);
      setProcessError(error?.message || 'Failed to process ticket. Please try again.');
    } finally {
      setIsProcessingTicket(false);
    }
  };

  const processProgressScale =
    processStep <= 1 ? '0' : processStep === 2 ? '0.5' : '1';

  const quickMessages = useMemo(
    () => messages.slice(-QUICK_MESSAGE_LIMIT),
    [messages],
  );

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
            <img src={nurseProfileImage} alt='Account' className='account-icon' />
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
            {queueTickets.length > 0 ? (
              queueTickets.map((ticket) => {
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
                  onClick={handleOpenProcessModal}
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

      {showProcessModal && selectedTicket && (
        <div className='modal-overlay'>
          <div className='nurse-process-modal'>
            <div className='modal-header'>
              <h2>Process Ticket #{selectedTicket.id}</h2>
              <button
                className='close-btn'
                onClick={() => {
                  if (!isProcessingTicket) {
                    setShowProcessModal(false);
                    setProcessError('');
                    setProcessStep(1);
                  }
                }}
              >
                ×
              </button>
            </div>

            <div
              className='nurse-process-steps'
              style={{ '--process-progress-scale': processProgressScale }}
            >
              {PROCESS_STEP_LABELS.map(
                (label, index) => {
                  const stepNumber = index + 1;
                  const stateClass =
                    stepNumber < processStep
                      ? 'done'
                      : stepNumber === processStep
                        ? 'active'
                        : 'upcoming';

                  return (
                    <div
                      key={label}
                      className={`nurse-process-step-item ${stateClass}`}
                    >
                      <span className='nurse-process-step-dot' />
                      <span>{label}</span>
                    </div>
                  );
                },
              )}
            </div>

            <div className='nurse-process-body'>
              {processStep === 1 && (
                <div className='nurse-process-step-content'>
                  <h3>Step 1: Review HMO Details</h3>
                  <div className='nurse-process-main'>
                    <div className='nurse-process-grid'>
                      <div className='nurse-process-field'>
                        <label>Patient Name</label>
                        <input
                          value={readValue(selectedTicket, ['patientName', 'fullName', 'name'])}
                          disabled
                        />
                      </div>
                      <div className='nurse-process-field'>
                        <label>HMO Provider</label>
                        <input value={processData.hmoProvider || DEFAULT_TEXT} disabled />
                      </div>
                      <div className='nurse-process-field nurse-process-field-wide'>
                        <label>HMO Number/ID</label>
                        <input value={processData.hmoNumber || DEFAULT_TEXT} disabled />
                      </div>
                    </div>
                  </div>
                  <div className='nurse-process-step-footer'>
                    <p className='nurse-process-error'>{processError || '\u00A0'}</p>
                    <div className='modal-actions'>
                      <button
                        className='submit-btn'
                        type='button'
                        onClick={() => {
                          setProcessError('');
                          setProcessStep(2);
                        }}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {processStep === 2 && (
                <div className='nurse-process-step-content'>
                  <h3 className='nurse-step-two-title'>Step 2: Schedule a Specialist</h3>
                  <div className='nurse-process-main'>
                    <div className='nurse-step-two-layout'>
                      <div className='nurse-step-two-left'>
                        <div className='nurse-process-field'>
                          <label>Specialization</label>
                          <input
                            value={processData.targetSpecialty}
                            onChange={(event) =>
                              setProcessData((prev) => ({
                                ...prev,
                                targetSpecialty: event.target.value,
                              }))
                            }
                            placeholder='e.g. Endocrinologist'
                          />
                        </div>
                        <div className='nurse-process-field'>
                          <label>Available Specialist</label>
                          <select
                            value={processData.specialistId}
                            onChange={(event) =>
                              setProcessData((prev) => ({
                                ...prev,
                                specialistId: event.target.value,
                              }))
                            }
                            disabled={isLoadingSpecialists}
                          >
                            <option value='' disabled>
                              Select Specialist
                            </option>
                            {availableSpecialists.map((specialist) => (
                              <option key={specialist.id} value={specialist.id}>
                                {specialist.name} - {specialist.specialization}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className='nurse-calendar-placeholder' aria-hidden='true'>
                        {'<Calendar Placeholder>'}
                      </div>
                    </div>
                  </div>

                  <div className='nurse-process-step-footer'>
                    <p className='nurse-process-error'>{processError || '\u00A0'}</p>
                    <div className='modal-actions'>
                      <button
                        className='cancel-btn'
                        type='button'
                        onClick={() => {
                          setProcessError('');
                          setProcessStep(1);
                        }}
                      >
                        Back
                      </button>
                      <button className='submit-btn' type='button' onClick={handleAdvanceToReview}>
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {processStep === 3 && (
                <div className='nurse-process-step-content'>
                  <h3>Step 3: Review and Transfer</h3>
                  <div className='nurse-process-main'>
                    <div className='nurse-process-grid nurse-process-grid-review'>
                      <div className='nurse-process-field'>
                        <label>Appointment</label>
                        <input
                          value={
                            effectiveAppointmentDate
                              ? formatDate(effectiveAppointmentDate)
                              : DEFAULT_TEXT
                          }
                          disabled
                        />
                      </div>
                      <div className='nurse-process-field'>
                        <label>Time</label>
                        <input
                          value={formatScheduleTime(effectiveAppointmentTime)}
                          disabled
                        />
                      </div>
                      <div className='nurse-process-field'>
                        <label>HMO Provider</label>
                        <input value={effectiveHmoProvider || DEFAULT_TEXT} disabled />
                      </div>
                      <div className='nurse-process-field nurse-review-assigned-specialist'>
                        <label>Assigned Specialist</label>
                        <input value={effectiveSpecialistName || DEFAULT_TEXT} disabled />
                      </div>
                      <div className='nurse-process-field'>
                        <label>HMO Policy No.</label>
                        <input value={effectiveHmoNumber || DEFAULT_TEXT} disabled />
                      </div>
                    </div>
                  </div>

                  <div className='nurse-process-step-footer'>
                    <p className='nurse-process-error'>{processError || '\u00A0'}</p>
                    <div className='modal-actions'>
                      <button
                        className='cancel-btn'
                        type='button'
                        onClick={() => {
                          setProcessError('');
                          setProcessStep(2);
                        }}
                        disabled={isProcessingTicket}
                      >
                        Back
                      </button>
                      <button
                        className='submit-btn'
                        type='button'
                        onClick={handleTransferTicket}
                        disabled={isProcessingTicket}
                      >
                        {isProcessingTicket ? 'Transferring...' : 'Transfer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
