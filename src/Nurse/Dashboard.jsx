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
  fetchNursesFromAPI,
  fetchNurseProfile,
  fetchTicketsFromAPI,
  triageTicket,
  updateTicket,
} from './services/apiService.js';
import { useAuth } from '../contexts/AuthContext';
import { transformProfileFromAPI } from './services/profileService.js';
import { sendMessage as sendMessageToTicket } from './services/chatService.js';
import NotificationBell from '../components/Notifications/NotificationBell';
import Avatar from '../components/Avatar';
import { disconnectSocket } from '../utils/socketClient';
import { useChat } from './services/useChat.js';
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Droplet,
  FileText,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  SendHorizontal,
  Users,
  UserRound,
  Video,
} from 'lucide-react';

const DEFAULT_TEXT = 'N/A';
const DASHBOARD_REFRESH_MS = 30000;
const QUICK_MESSAGE_LIMIT = 60;
const TRIAGE_STATUS_OPTIONS = [
  'Waiting',
  'In Triage',
  'Ready for Doctor',
  'Urgent',
  'Completed',
];
const SYMPTOM_PILL_OPTIONS = [
  'Fever',
  'Cough',
  'Headache',
  'Sore throat',
  'Body pain',
  'Nausea',
  'Dizziness',
  'Chest pain',
  'Fatigue',
  'Shortness of breath',
  'Stomach pain',
  'Loss of appetite',
];
const ROS_GROUPS = [
  {
    title: 'General',
    items: ['Fever', 'Fatigue', 'Weight Loss'],
  },
  {
    title: 'Respiratory',
    items: ['Cough', 'Shortness of Breath', 'Wheezing'],
  },
  {
    title: 'Cardiovascular',
    items: ['Chest Pain', 'Palpitations'],
  },
  {
    title: 'Gastrointestinal',
    items: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal Pain'],
  },
  {
    title: 'Neurological',
    items: ['Dizziness', 'Headache', 'Numbness', 'Weakness'],
  },
];
const URGENCY_LEVEL_OPTIONS = ['Low', 'Normal', 'Urgent', 'Critical'];
const PAIN_MAP_VIEWS = ['front', 'back'];
const PAIN_MAP_AREAS = {
  front: [
    { key: 'head', label: 'Head', className: 'part-head' },
    { key: 'neck', label: 'Neck', className: 'part-neck' },
    { key: 'chest', label: 'Chest', className: 'part-chest' },
    { key: 'abdomen', label: 'Abdomen', className: 'part-abdomen' },
    { key: 'left-arm', label: 'Left Arm', className: 'part-left-arm' },
    { key: 'right-arm', label: 'Right Arm', className: 'part-right-arm' },
    { key: 'left-leg', label: 'Left Leg', className: 'part-left-leg' },
    { key: 'right-leg', label: 'Right Leg', className: 'part-right-leg' },
  ],
  back: [
    { key: 'head', label: 'Head', className: 'part-head' },
    { key: 'neck', label: 'Neck', className: 'part-neck' },
    { key: 'upper-back', label: 'Upper Back', className: 'part-chest' },
    { key: 'lower-back', label: 'Lower Back', className: 'part-abdomen' },
    { key: 'left-arm', label: 'Left Arm', className: 'part-left-arm' },
    { key: 'right-arm', label: 'Right Arm', className: 'part-right-arm' },
    { key: 'left-leg', label: 'Left Leg', className: 'part-left-leg' },
    { key: 'right-leg', label: 'Right Leg', className: 'part-right-leg' },
  ],
};
const TRIAGE_DRAFTS_STORAGE_KEY = 'nurse.triageDraftsByTicket';
const FALLBACK_DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Internal Medicine',
  'Surgery',
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

  const status = String(ticket.status || '').toLowerCase();

  if (status === 'urgent' || status.includes('urgent')) {
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
  const nestedPatientId =
    ticket?.patient?.id ??
    ticket?.patient?.User_ID ??
    ticket?.patient?.User_Id ??
    ticket?.patient?.userId ??
    null;
  const id =
    nestedPatientId ??
    readValue(
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

const mapTicketStatusToTriageStatus = (statusValue) => {
  const value = String(statusValue || '').trim().toLowerCase();
  if (!value) return 'Waiting';
  if (value === 'pending') return 'Waiting';
  if (value === 'processing') return 'In Triage';
  if (value === 'confirmed') return 'Ready for Doctor';
  if (value === 'completed') return 'Completed';
  if (value.includes('urgent')) return 'Urgent';
  if (value === 'in triage') return 'In Triage';
  if (value === 'ready for doctor') return 'Ready for Doctor';
  return 'Waiting';
};

const mapTriageStatusToTicketStatus = (triageStatus) => {
  const value = String(triageStatus || '').trim().toLowerCase();
  if (value === 'waiting') return 'pending';
  if (value === 'in triage') return 'processing';
  if (value === 'ready for doctor') return 'confirmed';
  if (value === 'completed') return 'completed';
  if (value === 'urgent') return 'urgent';
  return 'pending';
};

const normalizeUrgencyLevel = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized === 'high') return 'Urgent';
  if (normalized === 'low') return 'Low';
  if (normalized === 'normal') return 'Normal';
  if (normalized === 'urgent') return 'Urgent';
  if (normalized === 'critical') return 'Critical';
  return '';
};

const toBooleanFlag = (value) => {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return false;
};

const getTriageStatusKey = (statusValue) =>
  String(statusValue || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

const renderTriageStatusIcon = (statusValue) => {
  const statusKey = getTriageStatusKey(statusValue);

  if (statusKey === 'waiting') {
    return <Clock3 size={16} strokeWidth={2.2} className='triage-status-icon' />;
  }

  if (statusKey === 'in-triage') {
    return <Activity size={16} strokeWidth={2.2} className='triage-status-icon' />;
  }

  if (statusKey === 'ready-for-doctor') {
    return <CheckCircle2 size={16} strokeWidth={2.2} className='triage-status-icon' />;
  }

  if (statusKey === 'urgent') {
    return <AlertCircle size={16} strokeWidth={2.2} className='triage-status-icon' />;
  }

  if (statusKey === 'completed') {
    return <span className='triage-status-icon triage-status-icon-x'>x</span>;
  }

  return <Clock3 size={16} strokeWidth={2.2} className='triage-status-icon' />;
};

const getChannelLabel = (ticket) => {
  const channel = String(
    readValue(ticket, ['consultationChannel', 'channel'], 'chat'),
  ).toLowerCase();
  if (channel.includes('video')) return 'Video';
  if (channel.includes('voice') || channel.includes('call')) return 'Voice';
  return 'Chat';
};

const getUrgencyLevelFromTicket = (ticket) => {
  const fromFields = normalizeUrgencyLevel(
    readValue(ticket, ['urgencyLevel', 'urgency', 'priority'], ''),
  );

  return fromFields;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [nurseName, setNurseName] = useState(getNurseFirstName());
  const [nurseProfileImage, setNurseProfileImage] = useState(getNurseProfileImage());
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [hasManualDeselection, setHasManualDeselection] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [quickMessageError, setQuickMessageError] = useState('');
  const [isSendingQuickMessage, setIsSendingQuickMessage] = useState(false);
  const [triageStatus, setTriageStatus] = useState('Waiting');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [markInquiry, setMarkInquiry] = useState(false);
  const [markIncomplete, setMarkIncomplete] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [chiefComplaintDraft, setChiefComplaintDraft] = useState('');
  const [medicalHistoryDraft, setMedicalHistoryDraft] = useState('');
  const [additionalRemarksDraft, setAdditionalRemarksDraft] = useState('');
  const [selectedUrgencyLevel, setSelectedUrgencyLevel] = useState('');
  const [urgencyOverridesByTicketId, setUrgencyOverridesByTicketId] = useState({});
  const [selectedSymptomPills, setSelectedSymptomPills] = useState([]);
  const [selectedRosItems, setSelectedRosItems] = useState([]);
  const [painMapView, setPainMapView] = useState('front');
  const [selectedPainAreas, setSelectedPainAreas] = useState([]);
  const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] = useState(false);
  const [triageDraftsByTicketId, setTriageDraftsByTicketId] = useState(() => {
    try {
      const raw = localStorage.getItem(TRIAGE_DRAFTS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });
  const [vitalsDraft, setVitalsDraft] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('doctor');
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [availableNurses, setAvailableNurses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedNurseId, setSelectedNurseId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [isTransferSubmitting, setIsTransferSubmitting] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
  const [isNurseMenuOpen, setIsNurseMenuOpen] = useState(false);

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

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setIsDepartmentMenuOpen(false);
    setIsDoctorMenuOpen(false);
    setIsNurseMenuOpen(false);
    setTransferReason('');
  };

  const closeTransferMenus = () => {
    setIsDepartmentMenuOpen(false);
    setIsDoctorMenuOpen(false);
    setIsNurseMenuOpen(false);
  };

  const openTransferModal = () => {
    setShowTransferModal(true);
    setTransferTarget('doctor');
    setSelectedDepartment('');
    setSelectedDoctorId('');
    setSelectedNurseId('');
    setTransferReason('');
    setIsDepartmentMenuOpen(false);
    setIsDoctorMenuOpen(false);
    setIsNurseMenuOpen(false);
  };

  const persistTriageDraft = (ticketId, patch) => {
    const normalizedTicketId = Number(ticketId);
    if (!Number.isFinite(normalizedTicketId)) {
      return;
    }

    setTriageDraftsByTicketId((previous) => {
      const next = {
        ...previous,
        [normalizedTicketId]: {
          ...(previous[normalizedTicketId] || {}),
          ...patch,
        },
      };

      try {
        localStorage.setItem(TRIAGE_DRAFTS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore localStorage write failures and keep in-memory draft.
      }

      return next;
    });
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
    if (!showTransferModal) {
      return;
    }

    let isMounted = true;

    const loadTransferOptions = async () => {
      try {
        const doctors = await fetchDoctorsFromAPI();
        if (isMounted) {
          setAvailableDoctors(Array.isArray(doctors) ? doctors : []);
          const departments = Array.from(
            new Set(
              (doctors || [])
                .map((doctor) =>
                  String(
                    readValue(doctor, ['specialization', 'department', 'specialty'], ''),
                  ).trim(),
                )
                .filter(Boolean),
            ),
          );
          if (departments.length > 0) {
            setAvailableDepartments(departments);
          }
        }
      } catch {
        // Keep fallback departments.
      }

      try {
        const nurses = await fetchNursesFromAPI();
        if (isMounted) {
          setAvailableNurses(
            (nurses || [])
              .filter((entry) => Number(entry?.id) !== Number(user?.id))
              .map((entry) => ({
                id: Number(entry?.id),
                name: String(entry?.name || '').trim() || 'Unknown Nurse',
              })),
          );
        }
      } catch {
        if (isMounted) {
          setAvailableNurses([]);
        }
      }
    };

    loadTransferOptions();

    return () => {
      isMounted = false;
    };
  }, [showTransferModal, user?.id]);

  useEffect(() => {
    if (!selectedTicket || !selectedPatientId) {
      return;
    }

    const selectedTicketId = Number(selectedTicket.id);
    if (!Number.isFinite(selectedTicketId)) {
      return;
    }

    const existingConversation = conversations.find(
      (conversation) => Number(conversation.id) === selectedTicketId,
    );

    if (existingConversation) {
      if (Number(activeConversation?.id) !== Number(existingConversation.id)) {
        openConversation(existingConversation).catch((error) => {
          console.error('Failed to open quick conversation:', error);
        });
      }
      return;
    }

    if (creatingConversationFor.current === selectedTicketId) {
      return;
    }

    creatingConversationFor.current = selectedTicketId;

    const fallbackConversation = {
      id: selectedTicketId,
      name: readValue(selectedTicket, ['patientName', 'fullName', 'name'], 'Patient'),
      type: 'direct',
      participants: [
        {
          id: selectedPatientId,
          name: readValue(selectedTicket, ['patientName', 'fullName', 'name'], 'Patient'),
          type: 'p',
        },
      ],
      lastMessage: 'No messages yet',
      unreadCount: 0,
      otherUserType: 'p',
    };

    openConversation(fallbackConversation)
      .catch(async (error) => {
        console.error('Failed to open quick conversation by ticket id:', error);
        try {
          await startConversation('direct', selectedPatientId);
        } catch (createError) {
          console.error('Failed to create quick conversation:', createError);
        }
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

  useEffect(() => {
    if (!selectedTicket && tickets.length > 0 && !hasManualDeselection) {
      setSelectedTicket(tickets[0]);
    }
  }, [hasManualDeselection, selectedTicket, tickets]);

  useEffect(() => {
    if (!selectedTicket) {
      setTriageStatus('Waiting');
      setMarkInquiry(false);
      setMarkIncomplete(false);
      setChiefComplaintDraft('');
      setMedicalHistoryDraft('');
      setAdditionalRemarksDraft('');
      setSelectedUrgencyLevel('');
      setSelectedSymptomPills([]);
      setSelectedRosItems([]);
      setPainMapView('front');
      setSelectedPainAreas([]);
      setIsAdditionalDetailsOpen(false);
      setVitalsDraft({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
      });
      return;
    }

    const localDraft = triageDraftsByTicketId[Number(selectedTicket.id)] || {};

    const hydratedStatus =
      localDraft.status || localDraft.triageStatus || selectedTicket.status;
    setTriageStatus(mapTicketStatusToTriageStatus(hydratedStatus));
    const inquiryFlag = toBooleanFlag(
      readValue(selectedTicket, ['isInquiry', 'is_inquiry', 'inquiry'], false),
    );
    const incompleteFlag = toBooleanFlag(
      readValue(selectedTicket, ['isIncomplete', 'is_incomplete', 'incomplete'], false),
    );

    // Only allow one close reason at a time. If both are true from API, prefer Inquiry.
    setMarkInquiry(inquiryFlag);
    setMarkIncomplete(!inquiryFlag && incompleteFlag);
    setIsAdditionalDetailsOpen(false);

    const toDraftTextValue = (value) => {
      if (value === DEFAULT_TEXT || value === null || value === undefined) {
        return '';
      }

      if (Array.isArray(value)) {
        return value
          .map((entry) => String(entry || '').trim())
          .filter(Boolean)
          .join(', ');
      }

      return String(value);
    };

    setChiefComplaintDraft(
      localDraft.chiefComplaintDraft ??
        readValue(
          selectedTicket,
          ['chiefComplaint', 'consultationType', 'intakeDetails', '0', 'mainConcern', 'symptoms'],
          '',
        ),
    );
    setMedicalHistoryDraft(
      localDraft.medicalHistoryDraft ??
        toDraftTextValue(
          readValue(
            selectedTicket,
            ['triageMedicalHistory', 'medicalHistory', 'Medical_History', 'history'],
            '',
          ),
        ),
    );
    setAdditionalRemarksDraft(
      localDraft.additionalRemarksDraft ??
        toDraftTextValue(
          readValue(
            selectedTicket,
            ['additionalRemarks', 'nurseRemarks', 'remarks', 'notes'],
            '',
          ),
        ),
    );
    setSelectedUrgencyLevel(
      localDraft.selectedUrgencyLevel ||
        urgencyOverridesByTicketId[Number(selectedTicket.id)] ||
        normalizeUrgencyLevel(
          readValue(selectedTicket, ['urgencyLevel', 'urgency', 'priority'], ''),
        ),
    );
    setSelectedSymptomPills(
      Array.isArray(localDraft.selectedSymptomPills)
        ? localDraft.selectedSymptomPills
        : toList(
            readValue(
              selectedTicket,
              ['symptoms', 'symptomTags', 'symptomPills', 'intakeDetails', '0', 'symptoms'],
              '',
            ),
          )
            .map((entry) => String(entry || '').trim().toLowerCase())
            .map((normalizedEntry) => {
              if (normalizedEntry === 'body pain') return 'Body pain';
              if (normalizedEntry === 'chest pain') return 'Chest pain';
              if (normalizedEntry === 'sore throat') return 'Sore throat';
              if (normalizedEntry === 'shortness of breath') return 'Shortness of breath';
              if (normalizedEntry === 'stomach pain') return 'Stomach pain';
              if (normalizedEntry === 'loss of appetite') return 'Loss of appetite';
              return SYMPTOM_PILL_OPTIONS.find(
                (option) => option.toLowerCase() === normalizedEntry,
              );
            })
            .filter(Boolean),
    );
    setSelectedPainAreas(
      Array.isArray(localDraft.selectedPainAreas)
        ? localDraft.selectedPainAreas
        : readValue(selectedTicket, ['intakeDetails', '0', 'painAreas'], []),
    );

    const toEditableValue = (value) =>
      value === DEFAULT_TEXT || value === null || value === undefined ? '' : String(value);

    setVitalsDraft({
      bloodPressure:
        localDraft.vitalsDraft?.bloodPressure ??
        toEditableValue(readValue(selectedTicket, ['bloodPressure', 'bp', 'vitalBloodPressure'], '')),
      heartRate:
        localDraft.vitalsDraft?.heartRate ??
        toEditableValue(readValue(selectedTicket, ['heartRate', 'bpm', 'vitalHeartRate'], '')),
      temperature:
        localDraft.vitalsDraft?.temperature ??
        toEditableValue(readValue(selectedTicket, ['temperature', 'temp', 'vitalTemperature'], '')),
      oxygenSaturation:
        localDraft.vitalsDraft?.oxygenSaturation ??
        toEditableValue(
          readValue(selectedTicket, ['oxygenSaturation', 'spo2', 'vitalOxygenSaturation'], ''),
        ),
    });
  }, [selectedTicket, triageDraftsByTicketId, urgencyOverridesByTicketId]);

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
    const addressLine = readValue(
      selectedTicket,
      ['address', 'patientAddress', 'fullAddress', 'streetAddress'],
      '',
    );
    const city = readValue(selectedTicket, ['city', 'patientCity'], '');
    const province = readValue(selectedTicket, ['province', 'state', 'patientProvince'], '');
    const country = readValue(selectedTicket, ['country', 'patientCountry'], '');
    const composedAddress = [addressLine, city, province, country]
      .map((part) => String(part || '').trim())
      .filter((part, index, array) => part && array.indexOf(part) === index)
      .join(', ');

    return {
      fullName: readValue(selectedTicket, ['patientName', 'fullName', 'name']),
      age:
        readValue(selectedTicket, ['age'], null) ||
        calculateAge(readValue(selectedTicket, ['patientBirthdate', 'birthdate', 'dob'], null)),
      gender: readValue(selectedTicket, ['gender', 'sex']),
      phone: readValue(selectedTicket, ['mobile', 'phone', 'contactNumber']),
      email: readValue(selectedTicket, ['email', 'patientEmail']),
      bloodType,
      allergies,
      medicalHistory,
      address: composedAddress || DEFAULT_TEXT,
      lastVisit: formatDate(
        readValue(
          selectedTicket,
          ['lastVisit', 'lastVisitDate', 'lastConsultationDate', 'updatedAt'],
          null,
        ),
      ),
      temperature: readValue(selectedTicket, ['temperature', 'temp', 'vitalTemperature']),
      bloodPressure: readValue(selectedTicket, ['bloodPressure', 'bp', 'vitalBloodPressure']),
      heartRate: readValue(selectedTicket, ['heartRate', 'bpm', 'vitalHeartRate']),
      additionalDetails: readValue(selectedTicket, ['additionalDetails', 'intakeDetails', '0', 'additionalDetails'], ''),
    };
  }, [selectedTicket]);

  const painMapReadOnlyMeta = useMemo(() => {
    if (!selectedTicket) {
      return {
        painScore: '',
        durationValue: '',
        durationUnit: '',
      };
    }

    const normalizeDisplayValue = (value) =>
      value === DEFAULT_TEXT || value === null || value === undefined ? '' : String(value);

    return {
      painScore: normalizeDisplayValue(
        readValue(selectedTicket, ['severity', 'painScore', 'painSeverity'], ''),
      ),
      durationValue: normalizeDisplayValue(
        readValue(selectedTicket, ['durationValue', 'painDurationValue'], ''),
      ),
      durationUnit: normalizeDisplayValue(
        readValue(selectedTicket, ['durationUnit', 'painDurationUnit'], ''),
      ),
    };
  }, [selectedTicket]);

  const quickMessages = useMemo(
    () => messages.slice(-QUICK_MESSAGE_LIMIT),
    [messages],
  );

  const chatEntries = useMemo(() => {
    const patientName = String(selectedPatient?.fullName || '').trim();
    if (!patientName || !selectedTicket?.id) {
      return quickMessages;
    }

    const starterText = `Started consultation with ${patientName}`;
    const normalizedStarter = starterText.toLowerCase();
    const hasStarterMessage = quickMessages.some(
      (message) =>
        String(message?.text || '')
          .trim()
          .toLowerCase() === normalizedStarter,
    );

    if (hasStarterMessage) {
      return quickMessages;
    }

    const starterTimestamp = formatTime(
      readValue(selectedTicket, ['createdAt', 'preferredDate', 'updatedAt'], null),
    );

    return [
      {
        id: `starter-${selectedTicket.id}`,
        text: starterText,
        timestamp: starterTimestamp,
        isSystem: true,
      },
      ...quickMessages,
    ];
  }, [quickMessages, selectedPatient?.fullName, selectedTicket]);

  const queueCards = useMemo(() => {
    return (tickets || []).map((ticket) => {
      const queueStatus = normalizeStatus(
        ticket,
        Number(ticket?.id) === Number(selectedTicket?.id),
      );
      const statusLabel = getStatusLabel(queueStatus);
      const channelLabel = getChannelLabel(ticket);
      const persistedUrgencyLevel =
        triageDraftsByTicketId[Number(ticket?.id)]?.selectedUrgencyLevel || '';
      const urgencyLevel =
        persistedUrgencyLevel ||
        urgencyOverridesByTicketId[Number(ticket?.id)] ||
        getUrgencyLevelFromTicket(ticket);
      return {
        ticket,
        queueStatus,
        statusLabel,
        channelLabel,
        urgencyLevel,
      };
    });
  }, [selectedTicket?.id, tickets, triageDraftsByTicketId, urgencyOverridesByTicketId]);

  const shouldEnableCloseTicket = markInquiry || markIncomplete;
  const closeReasonLabel = markInquiry ? 'Inquiry' : markIncomplete ? 'Incomplete' : '';

  const applyTicketPatch = async (ticketId, patch) => {
    try {
      await updateTicket(ticketId, patch);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }

    setTickets((previous) =>
      previous.map((ticket) =>
        Number(ticket.id) === Number(ticketId)
          ? {
              ...ticket,
              ...patch,
            }
          : ticket,
      ),
    );

    setSelectedTicket((previous) => {
      if (!previous || Number(previous.id) !== Number(ticketId)) {
        return previous;
      }
      return {
        ...previous,
        ...patch,
      };
    });

    persistTriageDraft(ticketId, patch);
  };

  const handleStatusChange = async (nextStatus) => {
    if (!selectedTicket) {
      return;
    }

    setTriageStatus(nextStatus);
    setShowStatusMenu(false);
    setIsUpdatingStatus(true);

    await applyTicketPatch(selectedTicket.id, {
      status: mapTriageStatusToTicketStatus(nextStatus),
    });

    setIsUpdatingStatus(false);
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket || !shouldEnableCloseTicket) {
      return;
    }

    await applyTicketPatch(selectedTicket.id, {
      status: 'completed',
      isInquiry: markInquiry,
      isIncomplete: markIncomplete,
    });
  };

  const selectedNurse = useMemo(
    () =>
      availableNurses.find((nurse) => Number(nurse.id) === Number(selectedNurseId)) || null,
    [availableNurses, selectedNurseId],
  );

  const filteredDoctorsByDepartment = useMemo(() => {
    if (!selectedDepartment) {
      return [];
    }

    return (availableDoctors || []).filter(
      (doctor) =>
        String(readValue(doctor, ['specialization', 'department'], ''))
          .trim()
          .toLowerCase() === selectedDepartment.toLowerCase(),
    );
  }, [availableDoctors, selectedDepartment]);

  const selectedDoctor = useMemo(
    () =>
      filteredDoctorsByDepartment.find(
        (doctor) => Number(doctor.id) === Number(selectedDoctorId),
      ) || null,
    [filteredDoctorsByDepartment, selectedDoctorId],
  );

  const canTransferToDoctor = Boolean(
    selectedDepartment && selectedDoctorId && !isTransferSubmitting,
  );
  const canTransferToNurse = Boolean(selectedNurseId && !isTransferSubmitting);

  const handleTransferSubmit = async () => {
    if (!selectedTicket || isTransferSubmitting) {
      return;
    }

    if (transferTarget === 'doctor' && (!selectedDepartment || !selectedDoctorId)) {
      return;
    }

    if (transferTarget === 'nurse' && !selectedNurseId) {
      return;
    }

    setIsTransferSubmitting(true);

    try {
      const transferredTicketId = Number(selectedTicket.id);

      if (transferTarget === 'doctor') {
        await triageTicket({
          ticketId: Number(selectedTicket.id),
          targetSpecialty: selectedDepartment,
          specialistId: Number(selectedDoctorId),
          urgency: 'medium',
        });

        if (transferReason.trim()) {
          await applyTicketPatch(selectedTicket.id, {
            transferReason: transferReason.trim(),
          });
        }
      } else {
        await applyTicketPatch(selectedTicket.id, {
          nurse: Number(selectedNurseId),
          assignedNurse: selectedNurse?.name || null,
          transferReason: transferReason.trim() || null,
          status: 'processing',
        });
      }

      setTickets((previous) =>
        previous.filter((ticket) => Number(ticket.id) !== transferredTicketId),
      );
      setSelectedTicket((previous) =>
        Number(previous?.id) === transferredTicketId ? null : previous,
      );
      setHasManualDeselection(false);

      closeTransferModal();
    } finally {
      setIsTransferSubmitting(false);
    }
  };

  const handleCloseReasonToggle = async (reason, checked) => {
    if (!selectedTicket) {
      return;
    }

    const nextInquiry = reason === 'inquiry' ? checked : checked ? false : markInquiry;
    const nextIncomplete = reason === 'incomplete' ? checked : checked ? false : markIncomplete;

    setMarkInquiry(nextInquiry);
    setMarkIncomplete(nextIncomplete);

    await applyTicketPatch(selectedTicket.id, {
      isInquiry: nextInquiry,
      isIncomplete: nextIncomplete,
    });
  };

  const handleVitalChange = (field, value) => {
    setVitalsDraft((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };

      if (selectedTicket?.id) {
        persistTriageDraft(selectedTicket.id, { vitalsDraft: next });
      }

      return next;
    });
  };

  const sanitizeNumericVital = (value, maxDigits = 3) =>
    String(value || '')
      .replace(/\D/g, '')
      .slice(0, maxDigits);

  const sanitizeTemperatureVital = (value, maxDigits = 3, maxDecimals = 1) => {
    const cleaned = String(value || '').replace(/[^\d.]/g, '');
    const firstDotIndex = cleaned.indexOf('.');

    if (firstDotIndex === -1) {
      return cleaned.slice(0, maxDigits);
    }

    const integerPart = cleaned.slice(0, firstDotIndex).replace(/\./g, '').slice(0, maxDigits);
    const decimalPart = cleaned
      .slice(firstDotIndex + 1)
      .replace(/\./g, '')
      .slice(0, maxDecimals);

    return `${integerPart}.${decimalPart}`;
  };

  const sanitizeBloodPressureVital = (value, maxDigitsPerSide = 3) => {
    const cleaned = String(value || '').replace(/[^\d/]/g, '');
    const [rawSystolic = '', ...rest] = cleaned.split('/');
    const rawDiastolic = rest.join('');

    const systolic = rawSystolic.replace(/\//g, '').slice(0, maxDigitsPerSide);
    const diastolic = rawDiastolic.replace(/\//g, '').slice(0, maxDigitsPerSide);

    if (cleaned.includes('/')) {
      return `${systolic}/${diastolic}`;
    }

    return systolic;
  };

  const handleVitalBlur = async (field) => {
    if (!selectedTicket) {
      return;
    }

    const value = String(vitalsDraft[field] || '').trim();
    const patch = {
      [field]: value || null,
    };

    await applyTicketPatch(selectedTicket.id, patch);
  };

  const handleMedicalHistoryBlur = async () => {
    if (!selectedTicket) {
      return;
    }

    const value = String(medicalHistoryDraft || '').trim();

    await applyTicketPatch(selectedTicket.id, {
      triageMedicalHistory: value || null,
    });
  };

  const handleChiefComplaintChange = (value) => {
    setChiefComplaintDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { chiefComplaintDraft: value });
    }
  };

  const handleMedicalHistoryChange = (value) => {
    setMedicalHistoryDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { medicalHistoryDraft: value });
    }
  };

  const handleAdditionalRemarksChange = (value) => {
    setAdditionalRemarksDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { additionalRemarksDraft: value });
    }
  };

  const handleAdditionalRemarksBlur = async () => {
    if (!selectedTicket) {
      return;
    }

    const value = String(additionalRemarksDraft || '').trim();
    await applyTicketPatch(selectedTicket.id, {
      additionalRemarks: value || null,
      nurseRemarks: value || null,
    });
  };

  const handleUrgencyLevelSelect = async (level) => {
    if (!selectedTicket) {
      return;
    }

    setSelectedUrgencyLevel(level);
    setUrgencyOverridesByTicketId((previous) => ({
      ...previous,
      [Number(selectedTicket.id)]: level,
    }));
    persistTriageDraft(selectedTicket.id, { selectedUrgencyLevel: level });
    await applyTicketPatch(selectedTicket.id, {
      urgencyLevel: level,
      urgency: level,
      priority: level,
    });
  };

  const handleSymptomPillToggle = (pill) => {
    setSelectedSymptomPills((previous) => {
      const next = previous.includes(pill)
        ? previous.filter((entry) => entry !== pill)
        : [...previous, pill];

      if (selectedTicket?.id) {
        persistTriageDraft(selectedTicket.id, { selectedSymptomPills: next });
      }

      return next;
    });
  };

  const handleRosItemToggle = (item) => {
    setSelectedRosItems((previous) => {
      const next = previous.includes(item)
        ? previous.filter((entry) => entry !== item)
        : [...previous, item];

      if (selectedTicket?.id) {
        persistTriageDraft(selectedTicket.id, { selectedRosItems: next });
      }

      return next;
    });
  };

  const handlePainMapViewChange = (view) => {
    if (!PAIN_MAP_VIEWS.includes(view)) {
      return;
    }

    setPainMapView(view);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { painMapView: view });
      applyTicketPatch(selectedTicket.id, {
        painMapView: view,
      });
    }
  };

  const handlePainAreaToggle = (area) => {
    if (!area?.key || !area?.label || !PAIN_MAP_VIEWS.includes(painMapView)) {
      return;
    }

    const areaId = `${painMapView}:${area.key}`;

    setSelectedPainAreas((previous) => {
      const exists = previous.some((entry) => entry.id === areaId);
      const next = exists
        ? previous.filter((entry) => entry.id !== areaId)
        : [...previous, { id: areaId, view: painMapView, key: area.key, label: area.label }];

      if (selectedTicket?.id) {
        persistTriageDraft(selectedTicket.id, { selectedPainAreas: next });
        applyTicketPatch(selectedTicket.id, {
          selectedPainAreas: next,
          painAreas: next,
          painMapView,
        });
      }

      return next;
    });
  };

  const handlePainAreaRemove = (areaId) => {
    setSelectedPainAreas((previous) => {
      const next = previous.filter((entry) => entry.id !== areaId);

      if (selectedTicket?.id) {
        persistTriageDraft(selectedTicket.id, { selectedPainAreas: next });
        applyTicketPatch(selectedTicket.id, {
          selectedPainAreas: next,
          painAreas: next,
          painMapView,
        });
      }

      return next;
    });
  };

  const handleQuickSendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = quickMessage.trim();
    if (!trimmedMessage) {
      return;
    }

    setIsSendingQuickMessage(true);
    setQuickMessageError('');

    try {
      if (activeConversation?.id) {
        await sendChatMessage(trimmedMessage);
      } else if (selectedTicket?.id) {
        await sendMessageToTicket(Number(selectedTicket.id), trimmedMessage);
        await openConversation({
          id: Number(selectedTicket.id),
          name: readValue(selectedTicket, ['patientName', 'fullName', 'name'], 'Patient'),
          type: 'direct',
          participants: [
            {
              id: selectedPatientId,
              name: readValue(selectedTicket, ['patientName', 'fullName', 'name'], 'Patient'),
              type: 'p',
            },
          ],
          lastMessage: trimmedMessage,
          unreadCount: 0,
          otherUserType: 'p',
        });
      } else {
        setQuickMessageError('Select a patient ticket to send a message.');
        return;
      }
      setQuickMessage('');
    } catch (error) {
      console.error('Failed to send quick message:', error);
      setQuickMessageError('Unable to send your message right now.');
    } finally {
      setIsSendingQuickMessage(false);
    }
  };

  return (
    <div className='dashboard triage-dashboard'>
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
          <button className='nav-tab active' onClick={() => navigate('/nurse-dashboard')}>
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

      <div className='triage-shell'>
        <div className='triage-grid'>
          <section className='triage-queue-col'>
            <div className='triage-col-header'>
              <Users size={16} strokeWidth={2.2} />
              <h3>Patient Queue</h3>
            </div>
            <div className='triage-queue-list'>
              {queueCards.length > 0 ? (
                queueCards.map(({ ticket, queueStatus, statusLabel, channelLabel, urgencyLevel }) => {
                  const isSelected = Number(selectedTicket?.id) === Number(ticket.id);
                  const urgencyKey = urgencyLevel.toLowerCase();
                  return (
                    <button
                      key={ticket.id}
                      type='button'
                      className={`triage-queue-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTicket(null);
                          setHasManualDeselection(true);
                        } else {
                          setSelectedTicket(ticket);
                          setHasManualDeselection(false);
                        }
                        setQuickMessageError('');
                      }}
                    >
                      <div className='triage-queue-card-top'>
                        <div className='triage-queue-main'>
                          <div className='triage-queue-avatar'>
                            <UserRound size={15} strokeWidth={2.2} />
                          </div>

                          <div>
                            <div className='triage-ticket-code'>
                              T-{String(ticket.id).padStart(3, '0')}
                            </div>
                            <div className='triage-ticket-name'>
                              {readValue(ticket, ['patientName', 'fullName', 'name'])}
                            </div>
                          </div>
                        </div>
                        <span className={`triage-status-badge ${queueStatus}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className='triage-channel-chip'>
                        {channelLabel === 'Video' ? (
                          <Video size={14} strokeWidth={2.2} />
                        ) : channelLabel === 'Voice' ? (
                          <Phone size={14} strokeWidth={2.2} />
                        ) : (
                          <MessageSquare size={14} strokeWidth={2.2} />
                        )}
                        <span>{channelLabel}</span>
                      </div>

                      <div className='triage-queue-footer'>
                        <div className='triage-ticket-time'>
                          <Clock3 size={14} strokeWidth={2.2} />
                          <span>{formatTime(readValue(ticket, ['preferredDate', 'createdAt'], null))}</span>
                        </div>

                        {urgencyLevel ? (
                          <span className={`triage-urgency-badge ${urgencyKey}`}>{urgencyLevel}</span>
                        ) : (
                          <span className='triage-urgency-badge triage-urgency-badge-placeholder' aria-hidden='true'>
                            Placeholder
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className='triage-empty-note'>No tickets available.</div>
              )}
            </div>
          </section>

          <section className='triage-snapshot-col'>
            <div className='triage-col-header'>
              <Info size={16} strokeWidth={2.2} />
              <h3>Patient Snapshot</h3>
            </div>
            <div className='triage-snapshot-scroll'>
              {!selectedPatient ? (
                <div className='triage-empty-note'>Select a patient from queue.</div>
              ) : (
                <>
                  <article className='triage-profile-card'>
                    <div className='triage-profile-top'>
                      <div className='triage-avatar'>
                        {(selectedPatient.fullName || '?')
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part.charAt(0).toUpperCase())
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h4>{selectedPatient.fullName}</h4>
                        <p>
                          {selectedPatient.age} years {'\u2022'} {selectedPatient.gender}
                        </p>
                      </div>
                    </div>

                    <div className='triage-profile-grid'>
                      <div>
                        <label>Phone</label>
                        <p className='triage-value-line'>
                          <Phone size={13} strokeWidth={2.2} />
                          <span>{selectedPatient.phone}</span>
                        </p>
                      </div>
                      <div>
                        <label>Blood Type</label>
                        <p className='triage-value-line triage-blood'>
                          <Droplet size={13} strokeWidth={2.2} />
                          <span>{selectedPatient.bloodType}</span>
                        </p>
                      </div>
                      <div className='full'>
                        <label>Email</label>
                        <p className='triage-value-line'>
                          <Mail size={13} strokeWidth={2.2} />
                          <span>{selectedPatient.email}</span>
                        </p>
                      </div>
                    </div>

                    {selectedPatient.allergies.length > 0 && (
                      <>
                        <div className='triage-divider' />

                        <div className='triage-allergy-block'>
                          <h5>
                            <AlertCircle size={14} strokeWidth={2.2} />
                            <span>Allergies</span>
                          </h5>
                          <div className='triage-tag-list'>
                            {selectedPatient.allergies.map((allergy) => (
                              <span key={allergy}>{allergy}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className='triage-divider' />

                    <div className='triage-history-block'>
                      <h5 className='triage-history-title'>Medical History</h5>
                      {selectedPatient.medicalHistory.length > 0 ? (
                        <ul>
                          {selectedPatient.medicalHistory.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{DEFAULT_TEXT}</p>
                      )}
                    </div>

                    <div className='triage-divider' />

                    <div className='triage-last-visit'>
                      <Clock3 size={14} strokeWidth={2.2} />
                      <span>Last visit:</span>
                      <strong>{selectedPatient.lastVisit}</strong>
                    </div>
                  </article>

                  <article className='triage-details-panel'>
                    <button
                      type='button'
                      className='triage-details-toggle'
                      onClick={() => setIsAdditionalDetailsOpen((prev) => !prev)}
                    >
                      <span className='triage-details-title'>
                        <MapPin size={14} strokeWidth={2.2} />
                        <span>Additional Details</span>
                      </span>
                      <ChevronDown
                        size={16}
                        strokeWidth={2.3}
                        className={isAdditionalDetailsOpen ? 'open' : ''}
                      />
                    </button>

                    {isAdditionalDetailsOpen && (
                      <div className='triage-details-content'>
                        <div className='triage-detail-row'>
                          <label>Address</label>
                          <p>{selectedPatient.address}</p>
                        </div>
                      </div>
                    )}
                  </article>

                </>
              )}
            </div>

            <div className='triage-snapshot-chat-dock'>
              <article className='triage-chat-panel'>
                <header>
                  <h4>Chat Consultation</h4>
                  <p>Context for triage assessment</p>
                </header>

                <div className='triage-chat-list'>
                  {!selectedPatient ? (
                    <div className='triage-empty-note'>Select a patient to open chat.</div>
                  ) : chatEntries.length > 0 ? (
                    chatEntries.map((message) =>
                      message.isSystem ? (
                        <div key={message.id} className='triage-chat-system-row'>
                          <span className='triage-chat-system-avatar'>
                            <UserRound size={14} strokeWidth={2.2} />
                          </span>
                          <div className='triage-chat-bubble system'>
                            <p>{message.text}</p>
                            <span>{message.timestamp}</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={message.id}
                          className={`triage-chat-bubble ${message.isSent ? 'sent' : 'received'}`}
                        >
                          <p>{message.text}</p>
                          <span>{message.timestamp}</span>
                        </div>
                      ),
                    )
                  ) : (
                    <div className='triage-empty-note'>No messages yet for this patient.</div>
                  )}
                </div>

                <form className='triage-chat-input-row' onSubmit={handleQuickSendMessage}>
                  <input
                    type='text'
                    placeholder='Type a message...'
                    value={quickMessage}
                    onChange={(event) => setQuickMessage(event.target.value)}
                    disabled={!selectedPatient || isSendingQuickMessage}
                  />
                  <button
                    className='triage-chat-send-btn'
                    type='submit'
                    disabled={!selectedPatient || !quickMessage.trim() || isSendingQuickMessage}
                  >
                    <SendHorizontal size={14} strokeWidth={2.3} />
                  </button>
                </form>

                {quickMessageError && <p className='nurse-quick-error'>{quickMessageError}</p>}
              </article>
            </div>
          </section>

          <section className='triage-workspace-col'>
            <div className='triage-col-header'>
              <ClipboardList size={16} strokeWidth={2.2} />
              <h3>Triage Workspace</h3>
            </div>

            {selectedPatient && (
              <div className='triage-workspace-head'>
                <div className='triage-workspace-head-main'>
                  <div className='triage-name-badge-row'>
                    <h2>{selectedPatient.fullName}</h2>
                    <span className='triage-chat-badge'>Chat</span>
                  </div>

                  <div className='triage-status-select-wrap'>
                    <button
                      type='button'
                      className={`triage-status-select ${triageStatus
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                      onClick={() => setShowStatusMenu((prev) => !prev)}
                      disabled={isUpdatingStatus}
                    >
                      <span className='triage-status-current'>
                        {renderTriageStatusIcon(triageStatus)}
                        <span>{triageStatus}</span>
                      </span>
                      <ChevronDown size={16} strokeWidth={2.2} />
                    </button>

                    {showStatusMenu && (
                      <div className='triage-status-menu'>
                        {TRIAGE_STATUS_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type='button'
                            className='triage-status-option'
                            onClick={() => handleStatusChange(option)}
                          >
                            <span className='triage-status-option-main'>
                              <span className={`dot ${option.toLowerCase().replace(/\s+/g, '-')}`} />
                              {renderTriageStatusIcon(option)}
                              <span>{option}</span>
                            </span>
                            {triageStatus === option ? (
                              <Check size={16} strokeWidth={2.4} className='triage-status-selected-check' />
                            ) : (
                              <span />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className='triage-mark-actions'>
                  <label>
                    <input
                      type='checkbox'
                      checked={markInquiry}
                      onChange={(event) =>
                        handleCloseReasonToggle('inquiry', event.target.checked)
                      }
                    />
                    <span>Mark as Inquiry</span>
                  </label>
                  <label>
                    <input
                      type='checkbox'
                      checked={markIncomplete}
                      onChange={(event) =>
                        handleCloseReasonToggle('incomplete', event.target.checked)
                      }
                    />
                    <span>Mark as Incomplete</span>
                  </label>
                </div>
              </div>
            )}

            <div className='triage-workspace-scroll'>
              {selectedPatient ? (
                <>
                  <article className='triage-vitals-card'>
                    <h4>
                      <Activity size={16} strokeWidth={2.2} />
                      <span>Vital Signs</span>
                    </h4>
                    <div className='triage-vitals-grid'>
                      <div>
                        <label>Blood Pressure</label>
                        <input
                          type='text'
                          className='triage-vital-input'
                          placeholder='120/80'
                          maxLength={7}
                          value={vitalsDraft.bloodPressure}
                          onChange={(event) =>
                            handleVitalChange(
                              'bloodPressure',
                              sanitizeBloodPressureVital(event.target.value),
                            )
                          }
                          onBlur={() => handleVitalBlur('bloodPressure')}
                        />
                      </div>
                      <div>
                        <label>Heart Rate</label>
                        <div className='triage-vital-input-wrap'>
                          <input
                            type='text'
                            className='triage-vital-input with-unit'
                            placeholder='72'
                            inputMode='numeric'
                            maxLength={3}
                            value={vitalsDraft.heartRate}
                            onChange={(event) =>
                              handleVitalChange(
                                'heartRate',
                                sanitizeNumericVital(event.target.value),
                              )
                            }
                            onBlur={() => handleVitalBlur('heartRate')}
                          />
                          <span className='triage-vital-unit'>bpm</span>
                        </div>
                      </div>
                      <div>
                        <label>Temperature</label>
                        <div className='triage-vital-input-wrap'>
                          <input
                            type='text'
                            className='triage-vital-input with-unit'
                            placeholder='36.8'
                            inputMode='decimal'
                            maxLength={5}
                            value={vitalsDraft.temperature}
                            onChange={(event) =>
                              handleVitalChange(
                                'temperature',
                                sanitizeTemperatureVital(event.target.value),
                              )
                            }
                            onBlur={() => handleVitalBlur('temperature')}
                          />
                          <span className='triage-vital-unit'>°C</span>
                        </div>
                      </div>
                      <div>
                        <label>Oxygen Saturation</label>
                        <div className='triage-vital-input-wrap'>
                          <input
                            type='text'
                            className='triage-vital-input with-unit'
                            placeholder='98'
                            inputMode='numeric'
                            maxLength={3}
                            value={vitalsDraft.oxygenSaturation}
                            onChange={(event) =>
                              handleVitalChange(
                                'oxygenSaturation',
                                sanitizeNumericVital(event.target.value),
                              )
                            }
                            onBlur={() => handleVitalBlur('oxygenSaturation')}
                          />
                          <span className='triage-vital-unit'>%</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className='triage-complaint-card'>
                    <h4>Chief Complaint & Symptoms</h4>
                    <textarea
                      value={chiefComplaintDraft}
                      onChange={(event) => handleChiefComplaintChange(event.target.value)}
                      placeholder="Describe the patient's main complaint..."
                    />
                    <div className='triage-symptom-pills'>
                      {SYMPTOM_PILL_OPTIONS.map((pill) => {
                        const isSelected = selectedSymptomPills.includes(pill);
                        return (
                          <button
                            key={pill}
                            type='button'
                            className={`triage-symptom-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSymptomPillToggle(pill)}
                          >
                            {pill}
                          </button>
                        );
                      })}
                    </div>
                  </article>

                  <article className='triage-pain-map-card'>
                    <h4>Pain Map</h4>
                    <div className='triage-pain-map-controls-row'>
                      <div className='triage-pain-map-view-toggle' role='tablist' aria-label='Pain map view'>
                        <button
                          type='button'
                          role='tab'
                          aria-selected={painMapView === 'front'}
                          className={`triage-pain-map-view-btn ${painMapView === 'front' ? 'active' : ''}`}
                          onClick={() => handlePainMapViewChange('front')}
                        >
                          Front
                        </button>
                        <button
                          type='button'
                          role='tab'
                          aria-selected={painMapView === 'back'}
                          className={`triage-pain-map-view-btn ${painMapView === 'back' ? 'active' : ''}`}
                          onClick={() => handlePainMapViewChange('back')}
                        >
                          Back
                        </button>
                      </div>
                      <div className='triage-pain-readonly-meta inline'>
                        <div className='triage-vitals-grid triage-vitals-grid-readonly inline'>
                          <div className='triage-pain-meta-item'>
                            <label>Pain Score</label>
                            <div className='triage-vital-input-wrap triage-vital-input-wrap-readonly triage-vital-input-wrap-meta'>
                              <span className='triage-pain-meta-value'>{painMapReadOnlyMeta.painScore || 'N/A'}</span>
                              <span className='triage-vital-unit'>/10</span>
                            </div>
                          </div>
                          <div className='triage-pain-meta-item triage-pain-meta-item-duration'>
                            <label>Pain Duration</label>
                            <div className='triage-vital-input-wrap triage-vital-input-wrap-readonly triage-vital-input-wrap-duration triage-vital-input-wrap-meta'>
                              <span className='triage-pain-meta-value'>
                                {painMapReadOnlyMeta.durationValue || 'N/A'}
                              </span>
                              <span className='triage-vital-unit'>
                                {painMapReadOnlyMeta.durationUnit || '--'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='triage-pain-map-content'>
                      <div className={`triage-pain-map-figure ${painMapView === 'back' ? 'back' : 'front'}`}>
                        {PAIN_MAP_AREAS[painMapView].map((area) => {
                          const areaId = `${painMapView}:${area.key}`;
                          const isSelected = selectedPainAreas.some((entry) => entry.id === areaId);

                          return (
                            <button
                              key={areaId}
                              type='button'
                              className={`triage-body-part ${area.className} ${isSelected ? 'selected' : ''}`}
                              onClick={() => handlePainAreaToggle(area)}
                              aria-pressed={isSelected}
                              aria-label={`${area.label} (${painMapView})`}
                            />
                          );
                        })}
                      </div>

                      <div className='triage-pain-map-selection'>
                        <div className='triage-pain-map-selection-title'>Selected pain areas:</div>
                        {selectedPainAreas.length === 0 ? (
                          <div className='triage-pain-map-empty'>No areas selected</div>
                        ) : (
                          <div className='triage-pain-map-chips'>
                            {selectedPainAreas.map((area) => (
                              <div key={area.id} className='triage-pain-map-chip'>
                                <span>
                                  {area.label}
                                  {` (${area.view === 'back' ? 'Back' : 'Front'})`}
                                </span>
                                <button
                                  type='button'
                                  className='triage-pain-map-chip-remove'
                                  onClick={() => handlePainAreaRemove(area.id)}
                                  aria-label={`Remove ${area.label}`}
                                >
                                  x
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='triage-pain-map-instruction'>
                      Click on body parts to mark pain locations
                    </div>
                  </article>

                  <article className='triage-ros-card'>
                    <h4>Review of Systems (ROS)</h4>
                    <div className='triage-ros-grid'>
                      {ROS_GROUPS.map((group) => (
                        <section key={group.title} className='triage-ros-group'>
                          <div className='triage-ros-group-title'>{group.title}</div>
                          <div className='triage-ros-items'>
                            {group.items.map((item) => {
                              const isChecked = selectedRosItems.includes(item);
                              return (
                                <label key={item} className='triage-ros-item'>
                                  <input
                                    type='checkbox'
                                    checked={isChecked}
                                    onChange={() => handleRosItemToggle(item)}
                                  />
                                  <span>{item}</span>
                                </label>
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                  </article>

                  <article className='triage-note-card'>
                    <h4>
                      <ClipboardList size={16} strokeWidth={2.2} />
                      <span>Medical History</span>
                    </h4>
                    <textarea
                      className='triage-note-textarea'
                      value={medicalHistoryDraft}
                      onChange={(event) => handleMedicalHistoryChange(event.target.value)}
                      onBlur={handleMedicalHistoryBlur}
                      placeholder='Relevant medical history, medications, allergies...'
                    />
                  </article>

                  <article className='triage-note-card'>
                    <h4>
                      <FileText size={16} strokeWidth={2.2} />
                      <span>Additional Remarks</span>
                    </h4>
                    <textarea
                      className='triage-note-textarea'
                      value={additionalRemarksDraft}
                      onChange={(event) => handleAdditionalRemarksChange(event.target.value)}
                      onBlur={handleAdditionalRemarksBlur}
                      placeholder='Add remarks or important notes...'
                    />
                  </article>

                  <article className='triage-urgency-card'>
                    <h4>
                      <AlertCircle size={16} strokeWidth={2.2} />
                      <span>Urgency Level</span>
                    </h4>
                    <div className='triage-urgency-grid'>
                      {URGENCY_LEVEL_OPTIONS.map((level) => {
                        const isSelected = selectedUrgencyLevel === level;
                        return (
                          <button
                            key={level}
                            type='button'
                            className={`triage-urgency-option level-${level.toLowerCase()} ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleUrgencyLevelSelect(level)}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                </>
              ) : (
                <div className='triage-empty-note'>Select a patient from queue.</div>
              )}
            </div>

            {selectedPatient && (
              <div className={`triage-workspace-footer ${shouldEnableCloseTicket ? 'active' : 'inactive'}`}>
                <div className='triage-bottom-actions'>
                  <button
                    type='button'
                    className='triage-transfer-btn'
                    onClick={openTransferModal}
                  >
                    <UserRound size={16} strokeWidth={2.2} />
                    Transfer Patient
                  </button>
                  <button
                    type='button'
                    className={`triage-close-btn ${shouldEnableCloseTicket ? 'active' : 'inactive'}`}
                    disabled={!shouldEnableCloseTicket}
                    onClick={handleCloseTicket}
                  >
                    <span className='triage-close-x'>&times;</span>
                    <span>Close Ticket</span>
                    {closeReasonLabel && <span className='triage-close-tag'>{closeReasonLabel}</span>}
                  </button>
                </div>

                {!shouldEnableCloseTicket && (
                  <p className='triage-close-help'>
                    Mark ticket as "Inquiry" or "Incomplete" to enable closing
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {showTransferModal && selectedPatient && (
        <div
          className='triage-transfer-modal-overlay'
          onClick={closeTransferModal}
          role='presentation'
        >
          <div
            className='triage-transfer-modal'
            onClick={(event) => event.stopPropagation()}
            role='dialog'
            aria-modal='true'
            aria-label='Transfer patient'
          >
            <button
              type='button'
              className='triage-transfer-modal-close'
              onClick={closeTransferModal}
              aria-label='Close transfer modal'
            >
              &times;
            </button>

            <h3 className='triage-transfer-title'>Transfer Patient</h3>
            <p className='triage-transfer-subtitle'>
              Transfer {selectedPatient.fullName} to another healthcare provider.
            </p>

            <div className='triage-transfer-targets'>
              <button
                type='button'
                className={`triage-transfer-target ${transferTarget === 'doctor' ? 'active' : ''}`}
                onClick={() => {
                  setTransferTarget('doctor');
                  setIsDepartmentMenuOpen(false);
                  setIsDoctorMenuOpen(false);
                  setIsNurseMenuOpen(false);
                }}
              >
                To Doctor
              </button>
              <button
                type='button'
                className={`triage-transfer-target ${transferTarget === 'nurse' ? 'active' : ''}`}
                onClick={() => {
                  setTransferTarget('nurse');
                  setIsDepartmentMenuOpen(false);
                  setIsDoctorMenuOpen(false);
                  setIsNurseMenuOpen(false);
                }}
              >
                To Nurse
              </button>
            </div>

            {transferTarget === 'doctor' ? (
              <div className='triage-transfer-field'>
                <label>Select Specialist Department</label>
                <div className='triage-transfer-select-wrap'>
                  <button
                    type='button'
                    className={`triage-transfer-select ${selectedDepartment ? '' : 'placeholder'}`}
                    onClick={() => setIsDepartmentMenuOpen((previous) => !previous)}
                  >
                    <span>{selectedDepartment || 'Choose a department'}</span>
                    <ChevronDown size={17} strokeWidth={2.1} />
                  </button>
                  {isDepartmentMenuOpen && (
                    <div className='triage-transfer-menu'>
                      {availableDepartments.map((department) => (
                        <button
                          key={department}
                          type='button'
                          className={`triage-transfer-option ${selectedDepartment === department ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedDepartment(department);
                            setSelectedDoctorId('');
                            setIsDepartmentMenuOpen(false);
                            setIsDoctorMenuOpen(false);
                          }}
                        >
                          {department}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <label style={{ marginTop: 14 }}>Select Doctor</label>
                <div className='triage-transfer-select-wrap'>
                  <button
                    type='button'
                    className={`triage-transfer-select ${selectedDepartment ? '' : 'disabled'} ${selectedDoctor ? '' : 'placeholder'}`}
                    onClick={() => {
                      if (!selectedDepartment) {
                        return;
                      }
                      setIsDoctorMenuOpen((previous) => !previous);
                    }}
                  >
                    <span>{selectedDoctor?.name || 'Choose a doctor'}</span>
                    <ChevronDown size={17} strokeWidth={2.1} />
                  </button>
                  {isDoctorMenuOpen && selectedDepartment && (
                    <div className='triage-transfer-menu'>
                      {filteredDoctorsByDepartment.length > 0 ? (
                        filteredDoctorsByDepartment.map((doctor) => (
                          <button
                            key={doctor.id}
                            type='button'
                            className={`triage-transfer-option ${Number(selectedDoctorId) === Number(doctor.id) ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedDoctorId(String(doctor.id));
                              setIsDoctorMenuOpen(false);
                            }}
                          >
                            {doctor.name}
                          </button>
                        ))
                      ) : (
                        <div className='triage-transfer-empty'>No doctors found for this department</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className='triage-transfer-field'>
                  <label>Select Nurse</label>
                  <div className='triage-transfer-select-wrap'>
                    <button
                      type='button'
                      className={`triage-transfer-select ${selectedNurse ? '' : 'placeholder'}`}
                      onClick={() => setIsNurseMenuOpen((previous) => !previous)}
                    >
                      <span>{selectedNurse?.name || 'Choose a nurse'}</span>
                      <ChevronDown size={17} strokeWidth={2.1} />
                    </button>
                    {isNurseMenuOpen && (
                      <div className='triage-transfer-menu'>
                        {availableNurses.length > 0 ? (
                          availableNurses.map((nurse) => (
                            <button
                              key={nurse.id}
                              type='button'
                              className={`triage-transfer-option ${Number(selectedNurseId) === Number(nurse.id) ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedNurseId(String(nurse.id));
                                setIsNurseMenuOpen(false);
                              }}
                            >
                              {nurse.name}
                            </button>
                          ))
                        ) : (
                          <div className='triage-transfer-empty'>No nurses available</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className='triage-transfer-field'>
                  <label>Reason for Transfer (Optional)</label>
                  <textarea
                    className='triage-transfer-reason'
                    placeholder='Enter reason or notes for the transfer...'
                    value={transferReason}
                    onFocus={closeTransferMenus}
                    onClick={closeTransferMenus}
                    onChange={(event) => setTransferReason(event.target.value)}
                  />
                </div>
              </>
            )}

            <div className='triage-transfer-actions'>
              <button
                type='button'
                className='triage-transfer-cancel'
                onClick={closeTransferModal}
                disabled={isTransferSubmitting}
              >
                Cancel
              </button>
              <button
                type='button'
                className='triage-transfer-submit'
                disabled={
                  transferTarget === 'doctor' ? !canTransferToDoctor : !canTransferToNurse
                }
                onClick={handleTransferSubmit}
              >
                {transferTarget === 'doctor' ? 'Transfer to Doctor' : 'Transfer to Nurse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
