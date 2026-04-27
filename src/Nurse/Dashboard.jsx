import '../App.css';
import '../index.css';
import './NurseStyles.css';
import './CallbackStyles.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  getNurseFirstName,
  getNurseProfileImage,
  saveNurseProfileImage,
} from "./services/storageService.js";
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
import CallbackQueueCard from '../components/CallbackQueueCard';
import PatientMedicalRecordsModal from '../components/MedicalRecords';
import { disconnectSocket } from '../utils/socketClient';
import { useChat } from './services/useChat.js';
import { fetchCallbacks, updateCallbackStatus } from '../api/apiClient';
import referredPainChart from '../assets/1506_Referred_Pain_Chart.jpg';
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
  Heart,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  SendHorizontal,
  Pencil,
  Pill,
  Users,
  UserRound,
  Video,
} from "lucide-react";

const DEFAULT_TEXT = "N/A";
const DASHBOARD_REFRESH_MS = 30000;
const QUICK_MESSAGE_LIMIT = 60;
const TRIAGE_STATUS_OPTIONS = [
  "Waiting",
  "In Triage",
  "Ready for Doctor",
  "Urgent",
  "Completed",
];
const SYMPTOM_PILL_OPTIONS = [
  "Fever",
  "Headache",
  "Cough",
  "Body Pain",
  "Dizziness",
  "Chest Pain",
  "Sore Throat",
  "Nausea",
  "Fatigue",
  "Shortness of Breath",
  "Stomach Pain",
  "Loss of Appetite",
];
const ACTIVE_DISEASE_OPTIONS = [
  'Hypertension',
  'Diabetes',
  'Asthma',
  'Heart Disease',
  'Kidney Disease',
  'Thyroid Disorder',
  'Cancer',
  'Arthritis',
];
const ROS_GROUPS = [
  {
    title: "General",
    items: ["Fever", "Fatigue", "Weight Loss"],
  },
  {
    title: "Respiratory",
    items: ["Cough", "Shortness of Breath", "Wheezing"],
  },
  {
    title: "Cardiovascular",
    items: ["Chest Pain", "Palpitations"],
  },
  {
    title: "Gastrointestinal",
    items: ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Abdominal Pain"],
  },
  {
    title: "Neurological",
    items: ["Dizziness", "Headache", "Numbness", "Weakness"],
  },
];
const URGENCY_LEVEL_OPTIONS = ["Low", "Normal", "Urgent", "Critical"];
const PAIN_MAP_VIEWS = ["front", "back"];
const PAIN_MAP_AREAS = {
  front: [
    { key: "head", label: "Head", className: "part-head" },
    { key: "neck", label: "Neck", className: "part-neck" },
    { key: "chest", label: "Chest", className: "part-chest" },
    { key: "abdomen", label: "Abdomen", className: "part-abdomen" },
    { key: "left-arm", label: "Left Arm", className: "part-left-arm" },
    { key: "right-arm", label: "Right Arm", className: "part-right-arm" },
    { key: "left-leg", label: "Left Leg", className: "part-left-leg" },
    { key: "right-leg", label: "Right Leg", className: "part-right-leg" },
  ],
  back: [
    { key: "head", label: "Head", className: "part-head" },
    { key: "neck", label: "Neck", className: "part-neck" },
    { key: "upper-back", label: "Upper Back", className: "part-chest" },
    { key: "lower-back", label: "Lower Back", className: "part-abdomen" },
    { key: "left-arm", label: "Left Arm", className: "part-left-arm" },
    { key: "right-arm", label: "Right Arm", className: "part-right-arm" },
    { key: "left-leg", label: "Left Leg", className: "part-left-leg" },
    { key: "right-leg", label: "Right Leg", className: "part-right-leg" },
  ],
};
const TRIAGE_DRAFTS_STORAGE_KEY = "nurse.triageDraftsByTicket";
const FALLBACK_DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Internal Medicine",
  "Surgery",
];

const readValue = (source, keys, fallback = DEFAULT_TEXT) => {
  for (const key of keys) {
    if (
      Object.prototype.hasOwnProperty.call(source || {}, key) &&
      source[key] !== null &&
      source[key] !== undefined &&
      String(source[key]).trim() !== ""
    ) {
      return source[key];
    }
  }
  return fallback;
};

const toList = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => String(entry || "").trim())
          .filter(Boolean);
      }
    } catch {}

    return trimmed
      .split(/\n|,|;/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const parseJsonValue = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getIntakeValue = (ticket, keys, fallback = '') => {
  const intakeDetails = parseJsonValue(ticket?.intakeDetails, ticket?.intakeDetails);
  const intakeEntries = Array.isArray(intakeDetails)
    ? intakeDetails
    : intakeDetails && typeof intakeDetails === 'object'
      ? [intakeDetails]
      : [];

  for (const key of keys) {
    const directValue = readValue(ticket, [key], null);
    if (directValue !== null && directValue !== undefined && directValue !== '') {
      return directValue;
    }

    for (const entry of intakeEntries) {
      const nestedValue = readValue(entry, [key], null);
      if (
        nestedValue !== null &&
        nestedValue !== undefined &&
        nestedValue !== ''
      ) {
        return nestedValue;
      }
    }
  }

  return fallback;
};

const normalizePainAreas = (value) => {
  const parsed = parseJsonValue(value, value);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((entry) => {
      if (entry && typeof entry === 'object') {
        const view = PAIN_MAP_VIEWS.includes(entry.view) ? entry.view : 'front';
        const key = entry.key || String(entry.id || '').split(':').pop();
        const label = entry.label || key;

        if (!key || !label) {
          return null;
        }

        return {
          id: entry.id || `${view}:${key}`,
          view,
          key,
          label,
        };
      }

      const raw = String(entry || '').trim();
      if (!raw) {
        return null;
      }

      const [maybeView, maybeKey] = raw.includes(':')
        ? raw.split(':')
        : ['front', raw];
      const view = PAIN_MAP_VIEWS.includes(maybeView) ? maybeView : 'front';
      const key = maybeKey || raw;
      return {
        id: `${view}:${key}`,
        view,
        key,
        label: key
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
      };
    })
    .filter(Boolean);
};

const formatDate = (dateString) => {
  if (!dateString) return DEFAULT_TEXT;

  try {
    let date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);

    if (
      typeof dateString === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateString.split("T")[0])
    ) {
      date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(dateString);
  }
};

const formatTime = (dateString) => {
  if (!dateString) return "--:--";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTicketTime = (ticket) => {
  const preferredTime = String(ticket?.preferredTime || '').trim();
  if (/^\d{2}:\d{2}/.test(preferredTime)) {
    const [hours, minutes] = preferredTime.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return formatTime(readValue(ticket, ['createdAt', 'preferredDate'], null));
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
    return "active";
  }

  const status = String(ticket.status || "").toLowerCase();

  if (status === "urgent" || status.includes("urgent")) {
    return "urgent";
  }

  return "pending";
};

const getStatusLabel = (status) => {
  if (!status) return "pending";
  if (status === "active") return "active";
  if (status === "urgent") return "Urgent";
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
      ["patientId", "Patient_ID", "patientUserId", "User_ID", "userId"],
      null,
    );

  if (id === null || id === undefined || id === "") {
    return null;
  }

  const parsed = Number(id);
  return Number.isNaN(parsed) ? null : parsed;
};

const mapTicketStatusToTriageStatus = (statusValue) => {
  const value = String(statusValue || '')
    .trim()
    .toLowerCase();
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
  const value = String(triageStatus || '')
    .trim()
    .toLowerCase();
  if (value === 'waiting') return 'pending';
  if (value === 'in triage') return 'processing';
  if (value === 'ready for doctor') return 'confirmed';
  if (value === 'completed') return 'completed';
  if (value === 'urgent') return 'urgent';
  return 'pending';
};

const normalizeUrgencyLevel = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
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
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const getTriageStatusKey = (statusValue) =>
  String(statusValue || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const renderTriageStatusIcon = (statusValue) => {
  const statusKey = getTriageStatusKey(statusValue);

  if (statusKey === 'waiting') {
    return (
      <Clock3 size={16} strokeWidth={2.2} className='triage-status-icon' />
    );
  }

  if (statusKey === 'in-triage') {
    return (
      <Activity size={16} strokeWidth={2.2} className='triage-status-icon' />
    );
  }

  if (statusKey === 'ready-for-doctor') {
    return (
      <CheckCircle2
        size={16}
        strokeWidth={2.2}
        className='triage-status-icon'
      />
    );
  }

  if (statusKey === 'urgent') {
    return (
      <AlertCircle size={16} strokeWidth={2.2} className='triage-status-icon' />
    );
  }

  if (statusKey === "completed") {
    return <span className="triage-status-icon triage-status-icon-x">x</span>;
  }

  return <Clock3 size={16} strokeWidth={2.2} className="triage-status-icon" />;
};

const getChannelLabel = (ticket) => {
  const channel = String(
    readValue(ticket, ["consultationChannel", "channel"], "chat"),
  ).toLowerCase();
  if (channel.includes("video")) return "Video";
  if (channel.includes("voice") || channel.includes("call")) return "Voice";
  return "Chat";
};

const getCallbackChannelLabel = (callback) => {
  const channel = String(
    callback?.callType || callback?.contactMethod || callback?.channel || '',
  )
    .trim()
    .toLowerCase();

  if (channel.includes('video')) return 'Video';
  if (
    channel.includes('voice') ||
    channel.includes('audio') ||
    channel.includes('call') ||
    channel.includes('phone')
  ) {
    return 'Voice';
  }

  return 'Chat';
};

const mapCallbackStatusToTicketStatus = (statusValue) => {
  const value = String(statusValue || '')
    .trim()
    .toLowerCase();

  if (value === 'in_progress' || value === 'inquiry' || value === 'escalated') {
    return 'processing';
  }
  if (value === 'expired' || value === 'closed') return 'completed';
  return 'pending';
};

const getCallbackStatusLabel = (statusValue) => {
  const value = String(statusValue || '')
    .trim()
    .toLowerCase();

  if (value === 'new') return 'Waiting';
  if (value === 'in_progress') return 'In Progress';
  if (value === 'inquiry') return 'Inquiry';
  if (value === 'escalated') return 'Escalated';
  if (value === 'closed' || value === 'expired') return 'Closed';
  return value || 'Waiting';
};

const buildTicketFromCallback = (callback) => {
  const callbackId = Number(callback?.id);
  const callbackTicketId = Number.isFinite(callbackId)
    ? -Math.abs(callbackId)
    : null;
  const activeDiseases = toList(callback?.activeDiseases);

  return {
    id: callbackTicketId,
    callbackId: Number.isFinite(callbackId) ? callbackId : null,
    isCallback: true,
    ticketNumber: callback?.callbackNumber || null,
    callbackNumber: callback?.callbackNumber || null,
    patientId: callback?.patientId || null,
    patientName: callback?.fullName || 'Callback Request',
    fullName: callback?.fullName || 'Callback Request',
    patientBirthdate: callback?.patientBirthdate || null,
    gender: callback?.gender || DEFAULT_TEXT,
    mobile: callback?.contactNumber || DEFAULT_TEXT,
    phone: callback?.contactNumber || DEFAULT_TEXT,
    email: callback?.email || DEFAULT_TEXT,
    bloodType: callback?.bloodType || DEFAULT_TEXT,
    allergies: toList(callback?.allergies),
    medicalHistory: activeDiseases,
    activeDiseases,
    chiefComplaint: callback?.message || 'Callback request',
    symptoms: callback?.message || '',
    consultationChannel: getCallbackChannelLabel(callback),
    status: mapCallbackStatusToTicketStatus(callback?.status),
    preferredDate: callback?.createdAt || null,
    createdAt: callback?.createdAt || null,
    linkedTicketId: callback?.linkedTicketId || null,
  };
};

const getUrgencyLevelFromTicket = (ticket) => {
  const fromFields = normalizeUrgencyLevel(
    readValue(ticket, ["urgencyLevel", "urgency", "priority"], ""),
  );

  return fromFields;
};

const getTicketDraftFingerprint = (ticket) =>
  String(readValue(ticket, ["createdAt", "updatedAt"], "") || "").trim();

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [nurseName, setNurseName] = useState(getNurseFirstName());
  const [nurseProfileImage, setNurseProfileImage] = useState(
    getNurseProfileImage(),
  );
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [hasManualDeselection, setHasManualDeselection] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [quickMessageError, setQuickMessageError] = useState("");
  const [isSendingQuickMessage, setIsSendingQuickMessage] = useState(false);
  const [triageStatus, setTriageStatus] = useState("Waiting");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [markInquiry, setMarkInquiry] = useState(false);
  const [markIncomplete, setMarkIncomplete] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [patientSubmittedConcern, setPatientSubmittedConcern] = useState('');
  const [chiefComplaintDraft, setChiefComplaintDraft] = useState('');
  const [associatedSymptomsDraft, setAssociatedSymptomsDraft] = useState('');
  const [additionalRemarksDraft, setAdditionalRemarksDraft] = useState('');
  const [selectedUrgencyLevel, setSelectedUrgencyLevel] = useState('');
  const [urgencyOverridesByTicketId, setUrgencyOverridesByTicketId] = useState(
    {},
  );
  const [selectedSymptomPills, setSelectedSymptomPills] = useState([]);
  const [selectedRosItems, setSelectedRosItems] = useState([]);
  const [painMapView, setPainMapView] = useState("front");
  const [selectedPainAreas, setSelectedPainAreas] = useState([]);
  const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [activeDiseasesDraft, setActiveDiseasesDraft] = useState([]);
  const [customActiveDiseaseDraft, setCustomActiveDiseaseDraft] = useState('');
  const [pastDiseasesDraft, setPastDiseasesDraft] = useState('');
  const [familyHistoryDraft, setFamilyHistoryDraft] = useState('');
  const [smokingDraft, setSmokingDraft] = useState('');
  const [drinkingDraft, setDrinkingDraft] = useState('');
  const [lifestyleNotesDraft, setLifestyleNotesDraft] = useState('');
  const [surgeriesDraft, setSurgeriesDraft] = useState('');
  const [currentMedicationsDraft, setCurrentMedicationsDraft] = useState([]);
  const [newMedication, setNewMedication] = useState('');
  const [triageDraftsByTicketId, setTriageDraftsByTicketId] = useState(() => {
    try {
      const raw = localStorage.getItem(TRIAGE_DRAFTS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });
  const [vitalsDraft, setVitalsDraft] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState("doctor");
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableDepartments, setAvailableDepartments] =
    useState(FALLBACK_DEPARTMENTS);
  const [availableNurses, setAvailableNurses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedNurseId, setSelectedNurseId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [isTransferSubmitting, setIsTransferSubmitting] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
  const [isNurseMenuOpen, setIsNurseMenuOpen] = useState(false);
  const [callbacks, setCallbacks] = useState([]);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [activeCallback, setActiveCallback] = useState(null);
  const [callbackNurseRemarks, setCallbackNurseRemarks] = useState('');
  const [callbackInternalNotes, setCallbackInternalNotes] = useState('');
  const [callbackActionLoadingStatus, setCallbackActionLoadingStatus] =
    useState('');
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [optimisticQuickMessagesByTicketId, setOptimisticQuickMessagesByTicketId] =
    useState({});
  const [queueFilter, setQueueFilter] = useState('All');
  const [dashboardTab, setDashboardTab] = useState('Patient Queue');

  const selectedPatientId = useMemo(
    () => (selectedTicket ? getPatientIdFromTicket(selectedTicket) : null),
    [selectedTicket],
  );
  const isSelectedCallbackTicket = Boolean(selectedTicket?.isCallback);

  const creatingConversationFor = useRef(null);
  const quickChatListRef = useRef(null);

  const {
    conversations,
    activeConversation,
    messages,
    loadConversations,
    openConversation,
    closeConversation,
    startConversation,
    sendMessage: sendChatMessage,
  } = useChat({ currentUserId: user?.id || null, currentUserType: "n" });

  const handleLogout = async () => {
    try {
      localStorage.removeItem('nurse.dashboardTicketsCache');
      disconnectSocket();
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/");
  };

  const handleAddAllergy = async (incomingValue) => {
    if (!newAllergy.trim() || !selectedTicket) {
      if (!String(incomingValue || '').trim() || !selectedTicket) {
        return false;
      }
    }

    const incomingAllergy = String(
      incomingValue !== undefined ? incomingValue : newAllergy,
    ).trim();

    const currentAllergies = selectedPatient?.allergies || [];

    const isDuplicate = currentAllergies.some(
      (a) => a.toLowerCase() === incomingAllergy.toLowerCase(),
    );

    if (!isDuplicate) {
      const updatedAllergies = [...currentAllergies, incomingAllergy];
      const allergiesString = updatedAllergies.join(", ");

      await applyTicketPatch(selectedTicket.id, {
        allergies: allergiesString,
      });
    }

    if (incomingValue === undefined) {
      setNewAllergy("");
    }
    return !isDuplicate;
  };

  const handleRemoveAllergy = async (allergyToRemove) => {
    if (!selectedTicket) return;

    const currentAllergies = selectedPatient?.allergies || [];

    const updatedAllergies = currentAllergies.filter(
      (a) => a.toLowerCase() !== allergyToRemove.toLowerCase(),
    );

    const allergiesString = updatedAllergies.join(", ");

    await applyTicketPatch(selectedTicket.id, {
      allergies: allergiesString,
    });
  };

  const handleActiveDiseaseToggle = async (disease) => {
    if (!selectedTicket) return;

    const next = activeDiseasesDraft.includes(disease)
      ? activeDiseasesDraft.filter((entry) => entry !== disease)
      : [...activeDiseasesDraft, disease];
    setActiveDiseasesDraft(next);
    persistTriageDraft(selectedTicket.id, { activeDiseasesDraft: next });
    await applyTicketPatch(selectedTicket.id, {
      activeDiseases: next,
    });
  };

  const handleAddActiveDisease = async (incomingValue) => {
    if (!selectedTicket) return;
    const incoming = String(
      incomingValue !== undefined ? incomingValue : customActiveDiseaseDraft,
    ).trim();
    if (!incoming) return;

    const isDuplicate = activeDiseasesDraft.some(
      (entry) => entry.toLowerCase() === incoming.toLowerCase(),
    );
    if (isDuplicate) {
      if (incomingValue === undefined) {
        setCustomActiveDiseaseDraft('');
      }
      return;
    }

    const next = [...activeDiseasesDraft, incoming];
    setActiveDiseasesDraft(next);
    if (incomingValue === undefined) {
      setCustomActiveDiseaseDraft('');
    }
    persistTriageDraft(selectedTicket.id, { activeDiseasesDraft: next });
    await applyTicketPatch(selectedTicket.id, {
      activeDiseases: next,
    });
  };

  const handleRemoveActiveDisease = async (diseaseToRemove) => {
    if (!selectedTicket) return;

    const next = activeDiseasesDraft.filter(
      (entry) => entry.toLowerCase() !== diseaseToRemove.toLowerCase(),
    );
    setActiveDiseasesDraft(next);
    persistTriageDraft(selectedTicket.id, { activeDiseasesDraft: next });
    await applyTicketPatch(selectedTicket.id, {
      activeDiseases: next,
    });
  };

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setIsDepartmentMenuOpen(false);
    setIsDoctorMenuOpen(false);
    setIsNurseMenuOpen(false);
    setTransferReason("");
  };

  const closeTransferMenus = () => {
    setIsDepartmentMenuOpen(false);
    setIsDoctorMenuOpen(false);
    setIsNurseMenuOpen(false);
  };

  const closeCallbackModal = () => {
    setShowCallbackModal(false);
    setActiveCallback(null);
    setCallbackNurseRemarks('');
    setCallbackInternalNotes('');
    setCallbackActionLoadingStatus('');
  };

  const applyCallbackStatusChange = async (callbackId, nextStatus) => {
    const normalizedCallbackId = Number(callbackId);
    if (!Number.isFinite(normalizedCallbackId) || !nextStatus) {
      return null;
    }

    const response = await updateCallbackStatus(normalizedCallbackId, nextStatus);
    const updatedCallback = response?.callback || {};

    setCallbacks((previous) =>
      previous.map((entry) =>
        Number(entry.id) === normalizedCallbackId
          ? {
              ...entry,
              ...updatedCallback,
              status: updatedCallback.status || nextStatus,
            }
          : entry,
      ),
    );

    setActiveCallback((previous) => {
      if (!previous || Number(previous.id) !== normalizedCallbackId) {
        return previous;
      }
      return {
        ...previous,
        ...updatedCallback,
        status: updatedCallback.status || nextStatus,
      };
    });

    return updatedCallback;
  };

  const openCallbackModal = async (callback) => {
    if (!callback) {
      return;
    }

    setActiveCallback(callback);
    setCallbackNurseRemarks(callback?.nurseRemarks || '');
    setCallbackInternalNotes(callback?.callbackNotes || '');
    setShowCallbackModal(true);

    if (String(callback.status || '').toLowerCase() !== 'new') {
      return;
    }

    try {
      await applyCallbackStatusChange(callback.id, 'in_progress');
    } catch (error) {
      console.error('Failed to move callback to in-progress:', error);
    }
  };

  const handleCallbackModalStatusAction = async (nextStatus) => {
    if (!activeCallback || !nextStatus) {
      return;
    }

    setCallbackActionLoadingStatus(nextStatus);
    try {
      await applyCallbackStatusChange(activeCallback.id, nextStatus);
      if (nextStatus === 'closed') {
        closeCallbackModal();
      }
    } catch (error) {
      console.error(`Failed to update callback to ${nextStatus}:`, error);
    } finally {
      setCallbackActionLoadingStatus('');
    }
  };

  const openTransferModal = () => {
    setShowTransferModal(true);
    setTransferTarget("doctor");
    setSelectedDepartment("");
    setSelectedDoctorId("");
    setSelectedNurseId("");
    setTransferReason("");
    setIsDepartmentMenuOpen(false);
    setIsDoctorMenuOpen(false);
    setIsNurseMenuOpen(false);
  };

  const persistTriageDraft = (ticketId, patch) => {
    const normalizedTicketId = Number(ticketId);
    if (!Number.isFinite(normalizedTicketId)) {
      return;
    }

    const ticketForDraft = (tickets || []).find(
      (entry) => Number(entry?.id) === normalizedTicketId,
    );
    const ticketFingerprint = getTicketDraftFingerprint(ticketForDraft);

    setTriageDraftsByTicketId((previous) => {
      const next = {
        ...previous,
        [normalizedTicketId]: {
          ...(previous[normalizedTicketId] || {}),
          __ticketFingerprint: ticketFingerprint,
          ...patch,
        },
      };

      try {
        localStorage.setItem(TRIAGE_DRAFTS_STORAGE_KEY, JSON.stringify(next));
      } catch {}

      return next;
    });
  };

  useEffect(() => {
    setTriageDraftsByTicketId((previous) => {
      const validTicketIds = new Set(
        (tickets || [])
          .map((ticket) => Number(ticket?.id))
          .filter((ticketId) => Number.isFinite(ticketId)),
      );

      let changed = false;
      const next = {};

      for (const [ticketId, draft] of Object.entries(previous || {})) {
        const normalizedTicketId = Number(ticketId);
        if (!validTicketIds.has(normalizedTicketId)) {
          changed = true;
          continue;
        }

        next[normalizedTicketId] = draft;
      }

      if (changed) {
        try {
          localStorage.setItem(TRIAGE_DRAFTS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }

      return changed ? next : previous;
    });
  }, [tickets]);

  useEffect(() => {
    localStorage.removeItem('nurse.dashboardTicketsCache');

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
          localStorage.setItem("nurse.firstName", profileData.firstName);
        }

        if (profileData.profileImage) {
          saveNurseProfileImage(profileData.profileImage);
          setNurseProfileImage(getNurseProfileImage());
        } else {
          localStorage.removeItem("nurse.profileImage");
          setNurseProfileImage("/account.svg");
        }
      } catch (profileError) {
        console.error("Could not fetch nurse profile:", profileError.message);
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
      } catch {}

      try {
        const apiTickets = await fetchTicketsFromAPI();
        if (isMounted) {
          setTickets(Array.isArray(apiTickets) ? apiTickets : []);
        }
      } catch (ticketError) {
        console.error("Tickets API error:", ticketError.message);
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
    let isMounted = true;

    const loadCallbacks = async () => {
      try {
        const response = await fetchCallbacks();
        if (
          isMounted &&
          response?.callbacks &&
          Array.isArray(response.callbacks)
        ) {
          setCallbacks(response.callbacks);
        }
      } catch (error) {
        console.error('Error loading callbacks:', error);
        if (isMounted) {
          setCallbacks([]);
        }
      }
    };

    loadCallbacks();
    const interval = setInterval(loadCallbacks, DASHBOARD_REFRESH_MS);

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
                    readValue(
                      doctor,
                      ['specialization', 'department', 'specialty'],
                      '',
                    ),
                  ).trim(),
                )
                .filter(Boolean),
            ),
          );
          if (departments.length > 0) {
            setAvailableDepartments(departments);
          }
        }
      } catch {}

      try {
        const nurses = await fetchNursesFromAPI();
        if (isMounted) {
          setAvailableNurses(
            (nurses || [])
              .filter((entry) => Number(entry?.id) !== Number(user?.id))
              .map((entry) => ({
                id: Number(entry?.id),
                name: String(entry?.name || "").trim() || "Unknown Nurse",
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
    if (!selectedTicket || selectedTicket.isCallback) {
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
          console.error("Failed to open quick conversation:", error);
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
      name: readValue(
        selectedTicket,
        ['patientName', 'fullName', 'name'],
        'Patient',
      ),
      type: 'direct',
      participants: [
        {
          id: selectedPatientId,
          name: readValue(
            selectedTicket,
            ['patientName', 'fullName', 'name'],
            'Patient',
          ),
          type: 'p',
        },
      ],
      lastMessage: "No messages yet",
      unreadCount: 0,
      otherUserType: "p",
    };

    openConversation(fallbackConversation)
      .catch(async (error) => {
        console.error("Failed to open quick conversation by ticket id:", error);
        if (!selectedPatientId) {
          return;
        }
        try {
          await startConversation("direct", selectedPatientId);
        } catch (createError) {
          console.error("Failed to create quick conversation:", createError);
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
      setTriageStatus("Waiting");
      setMarkInquiry(false);
      setMarkIncomplete(false);
      setChiefComplaintDraft("");
      setAssociatedSymptomsDraft("");
      setAdditionalRemarksDraft("");
      setSelectedUrgencyLevel("");
      setSelectedSymptomPills([]);
      setSelectedRosItems([]);
      setPainMapView("front");
      setSelectedPainAreas([]);
      setIsAdditionalDetailsOpen(false);
      setActiveDiseasesDraft([]);
      setCustomActiveDiseaseDraft('');
      setPastDiseasesDraft('');
      setFamilyHistoryDraft('');
      setSmokingDraft('');
      setDrinkingDraft('');
      setLifestyleNotesDraft('');
      setSurgeriesDraft('');
      setCurrentMedicationsDraft([]);
      setNewMedication('');
      setVitalsDraft({
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
      });
      return;
    }

    const rawLocalDraft =
      triageDraftsByTicketId[Number(selectedTicket.id)] || {};
    const selectedTicketFingerprint = getTicketDraftFingerprint(selectedTicket);
    const shouldUseLocalDraft =
      !selectedTicketFingerprint ||
      rawLocalDraft.__ticketFingerprint === selectedTicketFingerprint;
    const localDraft = shouldUseLocalDraft ? rawLocalDraft : {};

    const hydratedStatus =
      localDraft.status || localDraft.triageStatus || selectedTicket.status;
    setTriageStatus(mapTicketStatusToTriageStatus(hydratedStatus));
    const inquiryFlag = toBooleanFlag(
      readValue(selectedTicket, ["isInquiry", "is_inquiry", "inquiry"], false),
    );
    const incompleteFlag = toBooleanFlag(
      readValue(
        selectedTicket,
        ['isIncomplete', 'is_incomplete', 'incomplete'],
        false,
      ),
    );

    setMarkInquiry(inquiryFlag);
    setMarkIncomplete(!inquiryFlag && incompleteFlag);
    setIsAdditionalDetailsOpen(false);

    const toDraftTextValue = (value) => {
      if (value === DEFAULT_TEXT || value === null || value === undefined) {
        return "";
      }

      if (Array.isArray(value)) {
        return value
          .map((entry) => String(entry || "").trim())
          .filter(Boolean)
          .join(", ");
      }

      return String(value);
    };

    setPatientSubmittedConcern(
      toDraftTextValue(
        readValue(
          selectedTicket,
          [
            'patientSubmittedConcern',
            'submittedConcern',
            'patientConcern',
            'chiefComplaint',
            'mainConcern',
          ],
          getIntakeValue(selectedTicket, ['mainConcern'], ''),
        ),
      ),
    );
    setChiefComplaintDraft(
      localDraft.chiefComplaintDraft ??
        toDraftTextValue(
          readValue(
            selectedTicket,
            [
              'clinicalChiefComplaint',
              'nurseChiefComplaint',
              'professionalChiefComplaint',
            ],
            '',
          ),
        ),
    );
    setAssociatedSymptomsDraft(
      localDraft.associatedSymptomsDraft ??
        toDraftTextValue(
          readValue(
            selectedTicket,
            [
              'otherSymptoms',
              'associatedSymptoms',
              'additionalSymptoms',
            ],
            getIntakeValue(
              selectedTicket,
              ['otherSymptoms', 'associatedSymptoms', 'additionalSymptoms'],
              '',
            ),
          ),
        ),
    );
    setAdditionalRemarksDraft(
      localDraft.additionalRemarksDraft ??
        toDraftTextValue(
          readValue(
            selectedTicket,
            ["additionalRemarks", "nurseRemarks", "remarks", "notes"],
            "",
          ),
        ),
    );
    setPastDiseasesDraft(
      localDraft.pastDiseasesDraft ??
        toDraftTextValue(
          readValue(selectedTicket, ['pastDiseases', 'pastMedicalHistory'], ''),
        ),
    );
    setActiveDiseasesDraft(
      Array.isArray(localDraft.activeDiseasesDraft)
        ? localDraft.activeDiseasesDraft
        : toList(
            readValue(
              selectedTicket,
              ['activeDiseases', 'activeDisease', 'active_conditions'],
              '',
            ),
          ),
    );
    setCustomActiveDiseaseDraft('');
    setFamilyHistoryDraft(
      localDraft.familyHistoryDraft ??
        toDraftTextValue(readValue(selectedTicket, ['familyHistory'], '')),
    );
    setSmokingDraft(
      localDraft.smokingDraft ??
        toDraftTextValue(readValue(selectedTicket, ['smoking'], '')),
    );
    setDrinkingDraft(
      localDraft.drinkingDraft ??
        toDraftTextValue(readValue(selectedTicket, ['drinking'], '')),
    );
    setLifestyleNotesDraft(
      localDraft.lifestyleNotesDraft ??
        toDraftTextValue(readValue(selectedTicket, ['lifestyleNotes'], '')),
    );
    setSurgeriesDraft(
      localDraft.surgeriesDraft ??
        toDraftTextValue(readValue(selectedTicket, ['surgeries'], '')),
    );
    setCurrentMedicationsDraft(
      Array.isArray(localDraft.currentMedicationsDraft)
        ? localDraft.currentMedicationsDraft
        : toList(
            readValue(
              selectedTicket,
              ['currentMedications', 'medications', 'currentMedication'],
              '',
            ),
          ),
    );
    setNewMedication('');
    setSelectedUrgencyLevel(
      localDraft.selectedUrgencyLevel ||
        urgencyOverridesByTicketId[Number(selectedTicket.id)] ||
        normalizeUrgencyLevel(
          readValue(
            selectedTicket,
            ['urgencyLevel', 'urgency', 'priority'],
            '',
          ),
        ),
    );
    setSelectedSymptomPills(
      Array.isArray(localDraft.selectedSymptomPills)
        ? localDraft.selectedSymptomPills
        : toList(
            getIntakeValue(
              selectedTicket,
              [
                'symptoms',
                'symptomTags',
                'symptomPills',
              ],
              '',
            ),
          )
            .map((entry) =>
              String(entry || '')
                .trim()
                .toLowerCase(),
            )
            .map((normalizedEntry) => {
              if (normalizedEntry === 'body pain') return 'Body pain';
              if (normalizedEntry === 'chest pain') return 'Chest pain';
              if (normalizedEntry === 'sore throat') return 'Sore throat';
              if (normalizedEntry === 'shortness of breath')
                return 'Shortness of breath';
              if (normalizedEntry === 'stomach pain') return 'Stomach pain';
              if (normalizedEntry === 'loss of appetite')
                return 'Loss of appetite';
              return SYMPTOM_PILL_OPTIONS.find(
                (option) => option.toLowerCase() === normalizedEntry,
              );
            })
            .filter(Boolean),
    );
    setSelectedPainAreas(
      Array.isArray(localDraft.selectedPainAreas)
        ? localDraft.selectedPainAreas
        : normalizePainAreas(
            getIntakeValue(
              selectedTicket,
              ['selectedPainAreas', 'painAreas', 'painMap'],
              [],
            ),
          ),
    );

    const toEditableValue = (value) =>
      value === DEFAULT_TEXT || value === null || value === undefined
        ? ''
        : String(value);

    setVitalsDraft({
      bloodPressure:
        localDraft.vitalsDraft?.bloodPressure ??
        toEditableValue(
          readValue(
            selectedTicket,
            ['bloodPressure', 'bp', 'vitalBloodPressure'],
            '',
          ),
        ),
      heartRate:
        localDraft.vitalsDraft?.heartRate ??
        toEditableValue(
          readValue(selectedTicket, ['heartRate', 'bpm', 'vitalHeartRate'], ''),
        ),
      temperature:
        localDraft.vitalsDraft?.temperature ??
        toEditableValue(
          readValue(
            selectedTicket,
            ['temperature', 'temp', 'vitalTemperature'],
            '',
          ),
        ),
      oxygenSaturation:
        localDraft.vitalsDraft?.oxygenSaturation ??
        toEditableValue(
          readValue(
            selectedTicket,
            ['oxygenSaturation', 'spo2', 'vitalOxygenSaturation'],
            '',
          ),
        ),
    });
  }, [selectedTicket, triageDraftsByTicketId, urgencyOverridesByTicketId]);

  const selectedPatient = useMemo(() => {
    if (!selectedTicket) {
      return null;
    }

    const bloodType = readValue(selectedTicket, ["bloodType", "Blood_Type"]);
    const allergies = toList(
      readValue(
        selectedTicket,
        ['allergies', 'Allergies', 'patientAllergies'],
        '',
      ),
    );
    const medicalHistory = toList(
      readValue(
        selectedTicket,
        ['medicalHistory', 'Medical_History', 'history'],
        '',
      ),
    );
    const addressLine = readValue(
      selectedTicket,
      ["address", "patientAddress", "fullAddress", "streetAddress"],
      "",
    );
    const city = readValue(selectedTicket, ["city", "patientCity"], "");
    const province = readValue(
      selectedTicket,
      ["province", "state", "patientProvince"],
      "",
    );
    const country = readValue(
      selectedTicket,
      ["country", "patientCountry"],
      "",
    );
    const composedAddress = [addressLine, city, province, country]
      .map((part) => String(part || "").trim())
      .filter((part, index, array) => part && array.indexOf(part) === index)
      .join(", ");

    return {
      fullName: readValue(selectedTicket, ["patientName", "fullName", "name"]),
      age:
        readValue(selectedTicket, ['age'], null) ||
        calculateAge(
          readValue(
            selectedTicket,
            ['patientBirthdate', 'birthdate', 'dob'],
            null,
          ),
        ),
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
          ["lastVisit", "lastVisitDate", "lastConsultationDate", "updatedAt"],
          null,
        ),
      ),
      temperature: readValue(selectedTicket, [
        'temperature',
        'temp',
        'vitalTemperature',
      ]),
      bloodPressure: readValue(selectedTicket, [
        'bloodPressure',
        'bp',
        'vitalBloodPressure',
      ]),
      heartRate: readValue(selectedTicket, [
        'heartRate',
        'bpm',
        'vitalHeartRate',
      ]),
      additionalDetails: readValue(
        selectedTicket,
        ['additionalDetails', 'intakeDetails', '0', 'additionalDetails'],
        '',
      ),
    };
  }, [selectedTicket]);

  const painMapReadOnlyMeta = useMemo(() => {
    if (!selectedTicket) {
      return {
        painScore: "",
        durationValue: "",
        durationUnit: "",
      };
    }

    const normalizeDisplayValue = (value) =>
      value === DEFAULT_TEXT || value === null || value === undefined
        ? ''
        : String(value);

    return {
      painScore: normalizeDisplayValue(
        getIntakeValue(
          selectedTicket,
          ['severity', 'painScore', 'painSeverity'],
          '',
        ),
      ),
      durationValue: normalizeDisplayValue(
        getIntakeValue(
          selectedTicket,
          ['durationValue', 'painDurationValue', 'duration'],
          '',
        ),
      ),
      durationUnit: normalizeDisplayValue(
        getIntakeValue(
          selectedTicket,
          ['durationUnit', 'painDurationUnit', 'durationType'],
          '',
        ),
      ),
    };
  }, [selectedTicket]);

  const quickMessages = useMemo(() => {
    const selectedTicketId = Number(selectedTicket?.id);
    const activeConversationId = Number(activeConversation?.id);
    const selectedTicketCreatedAt = selectedTicket?.createdAt
      ? new Date(selectedTicket.createdAt).getTime()
      : null;
    const activeTicketMessages =
      Number.isFinite(selectedTicketId) &&
      Number.isFinite(activeConversationId) &&
      selectedTicketId === activeConversationId
        ? messages.filter((message) => {
            if (!selectedTicketCreatedAt || !message?.rawTimestamp) {
              return true;
            }
            const messageTime = new Date(message.rawTimestamp).getTime();
            return (
              Number.isNaN(messageTime) ||
              messageTime >= selectedTicketCreatedAt
            );
          })
        : [];
    const optimisticMessages =
      optimisticQuickMessagesByTicketId[selectedTicketId] || [];

    return [...activeTicketMessages, ...optimisticMessages].slice(
      -QUICK_MESSAGE_LIMIT,
    );
  }, [
    activeConversation?.id,
    messages,
    optimisticQuickMessagesByTicketId,
    selectedTicket?.id,
  ]);

  const chatEntries = useMemo(() => {
    const patientName = String(selectedPatient?.fullName || "").trim();
    if (!patientName || !selectedTicket?.id) {
      return quickMessages;
    }

    const starterText = `Started consultation with ${patientName}`;
    const normalizedStarter = starterText.toLowerCase();
    const hasStarterMessage = quickMessages.some(
      (message) =>
        String(message?.text || "")
          .trim()
          .toLowerCase() === normalizedStarter,
    );

    if (hasStarterMessage) {
      return quickMessages;
    }

    const starterTimestamp = formatTime(
      readValue(
        selectedTicket,
        ['createdAt', 'preferredDate', 'updatedAt'],
        null,
      ),
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

  useEffect(() => {
    const chatList = quickChatListRef.current;
    if (!chatList) {
      return undefined;
    }

    const scrollFrame = window.requestAnimationFrame(() => {
      chatList.scrollTop = chatList.scrollHeight;
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [chatEntries, selectedTicket?.id]);

  const queueCards = useMemo(() => {
    const ticketCards = (tickets || []).map((ticket) => {
      const queueStatus = normalizeStatus(
        ticket,
        Number(ticket?.id) === Number(selectedTicket?.id),
      );
      const statusLabel = getStatusLabel(queueStatus);
      const channelLabel = getChannelLabel(ticket);
      const persistedUrgencyLevel =
        triageDraftsByTicketId[Number(ticket?.id)]?.selectedUrgencyLevel || "";
      const urgencyLevel =
        persistedUrgencyLevel ||
        urgencyOverridesByTicketId[Number(ticket?.id)] ||
        getUrgencyLevelFromTicket(ticket);
      return {
        type: 'ticket',
        ticket,
        queueStatus,
        statusLabel,
        channelLabel,
        urgencyLevel,
      };
    });

    const callbackCards = (callbacks || []).map((callback) => ({
      type: 'callback',
      callback,
      callbackTicket: buildTicketFromCallback(callback),
    }));

    const combined = [...callbackCards, ...ticketCards].sort((a, b) => {
      const dateA = new Date(
        a.type === 'callback'
          ? a.callback.createdAt
          : a.ticket.createdAt || a.ticket.preferredDate,
      ).getTime();
      const dateB = new Date(
        b.type === 'callback'
          ? b.callback.createdAt
          : b.ticket.createdAt || b.ticket.preferredDate,
      ).getTime();
      return dateB - dateA;
    });

    // Apply filtering
    if (queueFilter === 'Consults') {
      return combined.filter((card) => card.type === 'ticket');
    }
    if (queueFilter === 'Callbacks') {
      return combined.filter((card) => card.type === 'callback');
    }

    return combined;
  }, [
    callbacks,
    selectedTicket?.id,
    tickets,
    triageDraftsByTicketId,
    urgencyOverridesByTicketId,
    queueFilter,
  ]);

  const shouldEnableCloseTicket = markInquiry || markIncomplete;
  const closeReasonLabel = markInquiry
    ? 'Inquiry'
    : markIncomplete
      ? 'Incomplete'
      : '';

  const applyTicketPatch = async (ticketId, patch) => {
    const normalizedTicketId = Number(ticketId);
    const isCallbackOnlyPatch =
      selectedTicket?.isCallback ||
      !Number.isFinite(normalizedTicketId) ||
      normalizedTicketId <= 0;

    if (!isCallbackOnlyPatch) {
      try {
        await updateTicket(ticketId, patch);
      } catch (error) {
        console.error("Failed to update ticket:", error);
      }
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

  const handleCallbackPatch = async (callbackId, patch = {}) => {
    const normalizedCallbackId = Number(callbackId);
    if (!Number.isFinite(normalizedCallbackId)) {
      throw new Error('Invalid callback id.');
    }

    const payload = {};

    if (typeof patch.status === 'string') {
      payload.status = patch.status;
    }

    if (typeof patch.notes === 'string') {
      payload.notes = patch.notes;
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    try {
      const response = await updateCallbackStatus(
        normalizedCallbackId,
        payload,
      );
      const existingCallback =
        callbacks.find((entry) => Number(entry?.id) === normalizedCallbackId) ||
        {};
      const updatedCallback = {
        ...existingCallback,
        ...payload,
        ...(response?.callback || {}),
      };

      setCallbacks((previous) =>
        previous.map((entry) =>
          Number(entry?.id) === normalizedCallbackId ? updatedCallback : entry,
        ),
      );

      setSelectedTicket((previous) => {
        if (
          !previous?.isCallback ||
          Number(previous?.callbackId) !== normalizedCallbackId
        ) {
          return previous;
        }

        return buildTicketFromCallback(updatedCallback);
      });
    } catch (error) {
      console.error('Failed to update callback:', error);
      throw error;
    }
  };

  const handleStatusChange = async (nextStatus) => {
    if (!selectedTicket || isSelectedCallbackTicket) {
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
      status: "completed",
      isInquiry: markInquiry,
      isIncomplete: markIncomplete,
    });
  };

  const selectedNurse = useMemo(
    () =>
      availableNurses.find(
        (nurse) => Number(nurse.id) === Number(selectedNurseId),
      ) || null,
    [availableNurses, selectedNurseId],
  );

  const filteredDoctorsByDepartment = useMemo(() => {
    if (!selectedDepartment) {
      return [];
    }

    return (availableDoctors || []).filter(
      (doctor) =>
        String(readValue(doctor, ["specialization", "department"], ""))
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

  const buildTransferTriagePayload = () => {
    const clinicalConcern = String(chiefComplaintDraft || '').trim();
    const patientConcern = String(patientSubmittedConcern || '').trim();
    const remarks = String(additionalRemarksDraft || '').trim();

    return {
      chiefComplaint: clinicalConcern || selectedTicket?.chiefComplaint || '',
      clinicalChiefComplaint: clinicalConcern || null,
      patientSubmittedConcern: patientConcern || null,
      submittedConcern: patientConcern || null,
      additionalRemarks: remarks || null,
      bloodPressure: String(vitalsDraft.bloodPressure || '').trim() || null,
      heartRate: String(vitalsDraft.heartRate || '').trim() || null,
      temperature: String(vitalsDraft.temperature || '').trim() || null,
      oxygenSaturation:
        String(vitalsDraft.oxygenSaturation || '').trim() || null,
      selectedPainAreas,
      painAreas: selectedPainAreas,
      painMapView,
      durationValue:
        Number(painMapReadOnlyMeta.durationValue) ||
        Number(selectedTicket?.durationValue) ||
        null,
      durationUnit: painMapReadOnlyMeta.durationUnit || null,
      severity:
        Number(painMapReadOnlyMeta.painScore) ||
        Number(selectedTicket?.severity) ||
        null,
      selectedSymptomPills,
      selectedRosItems,
      activeDiseases: activeDiseasesDraft,
      pastDiseases: String(pastDiseasesDraft || '').trim() || null,
      familyHistory: String(familyHistoryDraft || '').trim() || null,
      smoking: String(smokingDraft || '').trim() || null,
      drinking: String(drinkingDraft || '').trim() || null,
      lifestyleNotes: String(lifestyleNotesDraft || '').trim() || null,
      surgeries: String(surgeriesDraft || '').trim() || null,
      currentMedications: currentMedicationsDraft,
      urgencyLevel: selectedUrgencyLevel || null,
      transferReason: transferReason.trim() || null,
    };
  };

  const handleTransferSubmit = async () => {
    if (!selectedTicket || isTransferSubmitting) {
      return;
    }

    if (
      transferTarget === 'doctor' &&
      (!selectedDepartment || !selectedDoctorId)
    ) {
      return;
    }

    if (transferTarget === "nurse" && !selectedNurseId) {
      return;
    }

    setIsTransferSubmitting(true);

      try {
        const transferredTicketId = Number(selectedTicket.id);

        if (transferTarget === "doctor") {
          const triagePayload = buildTransferTriagePayload();

          await triageTicket({
            ticketId: Number(selectedTicket.id),
            targetSpecialty: selectedDepartment,
            specialistId: Number(selectedDoctorId),
            urgency: "medium",
            ...triagePayload,
          });

          await applyTicketPatch(selectedTicket.id, {
            ...triagePayload,
          });
        } else {
        await applyTicketPatch(selectedTicket.id, {
          nurse: Number(selectedNurseId),
          assignedNurse: selectedNurse?.name || null,
          transferReason: transferReason.trim() || null,
          status: "processing",
        });
      }

      setTickets((previous) =>
        previous.filter((ticket) => Number(ticket.id) !== transferredTicketId),
      );
      setSelectedTicket((previous) =>
        Number(previous?.id) === transferredTicketId ? null : previous,
      );
      if (Number(activeConversation?.id) === transferredTicketId) {
        closeConversation();
      }
      loadConversations();
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

    const nextInquiry =
      reason === 'inquiry' ? checked : checked ? false : markInquiry;
    const nextIncomplete =
      reason === 'incomplete' ? checked : checked ? false : markIncomplete;

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
    String(value || "")
      .replace(/\D/g, "")
      .slice(0, maxDigits);

  const sanitizeTemperatureVital = (value, maxDigits = 3, maxDecimals = 1) => {
    const cleaned = String(value || "").replace(/[^\d.]/g, "");
    const firstDotIndex = cleaned.indexOf(".");

    if (firstDotIndex === -1) {
      return cleaned.slice(0, maxDigits);
    }

    const integerPart = cleaned
      .slice(0, firstDotIndex)
      .replace(/\./g, '')
      .slice(0, maxDigits);
    const decimalPart = cleaned
      .slice(firstDotIndex + 1)
      .replace(/\./g, "")
      .slice(0, maxDecimals);

    return `${integerPart}.${decimalPart}`;
  };

  const sanitizeBloodPressureVital = (value, maxDigitsPerSide = 3) => {
    const cleaned = String(value || "").replace(/[^\d/]/g, "");
    const [rawSystolic = "", ...rest] = cleaned.split("/");
    const rawDiastolic = rest.join("");

    const systolic = rawSystolic.replace(/\//g, '').slice(0, maxDigitsPerSide);
    const diastolic = rawDiastolic
      .replace(/\//g, '')
      .slice(0, maxDigitsPerSide);

    if (cleaned.includes("/")) {
      return `${systolic}/${diastolic}`;
    }

    return systolic;
  };

  const handleVitalBlur = async (field) => {
    if (!selectedTicket) {
      return;
    }

    const value = String(vitalsDraft[field] || "").trim();
    const patch = {
      [field]: value || null,
    };

    await applyTicketPatch(selectedTicket.id, patch);
  };


  const handleChiefComplaintChange = (value) => {
    setChiefComplaintDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { chiefComplaintDraft: value });
    }
  };

  const handleChiefComplaintBlur = async () => {
    if (!selectedTicket) {
      return;
    }

    const clinicalConcern = String(chiefComplaintDraft || '').trim();
    const patientConcern = String(patientSubmittedConcern || '').trim();

    await applyTicketPatch(selectedTicket.id, {
      chiefComplaint: clinicalConcern || null,
      clinicalChiefComplaint: clinicalConcern || null,
      patientSubmittedConcern: patientConcern || null,
      submittedConcern: patientConcern || null,
    });
  };

  const handleAssociatedSymptomsChange = (value) => {
    setAssociatedSymptomsDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { associatedSymptomsDraft: value });
    }
  };

  const handleAssociatedSymptomsBlur = async () => {
    if (!selectedTicket) {
      return;
    }

    const value = String(associatedSymptomsDraft || '').trim();
    await applyTicketPatch(selectedTicket.id, {
      otherSymptoms: value || null,
      associatedSymptoms: value || null,
    });
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

    const value = String(additionalRemarksDraft || "").trim();
    await applyTicketPatch(selectedTicket.id, {
      additionalRemarks: value || null,
      nurseRemarks: value || null,
    });
  };

  const handlePastDiseasesChange = (value) => {
    setPastDiseasesDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { pastDiseasesDraft: value });
    }
  };

  const handleFamilyHistoryChange = (value) => {
    setFamilyHistoryDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { familyHistoryDraft: value });
    }
  };

  const handleSmokingChange = (value) => {
    setSmokingDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { smokingDraft: value });
    }
  };

  const handleDrinkingChange = (value) => {
    setDrinkingDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { drinkingDraft: value });
    }
  };

  const handleLifestyleNotesChange = (value) => {
    setLifestyleNotesDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { lifestyleNotesDraft: value });
    }
  };

  const handleSurgeriesChange = (value) => {
    setSurgeriesDraft(value);
    if (selectedTicket?.id) {
      persistTriageDraft(selectedTicket.id, { surgeriesDraft: value });
    }
  };

  const handleMedicalHistorySectionBlur = async (fieldName, value) => {
    if (!selectedTicket) {
      return;
    }

    const trimmed = String(value || '').trim();
    await applyTicketPatch(selectedTicket.id, {
      [fieldName]: trimmed || null,
    });
  };

  const handleMedicationAdd = async (incomingValue) => {
    if (!selectedTicket) {
      return;
    }

    const incoming = String(
      incomingValue !== undefined ? incomingValue : newMedication,
    ).trim();
    if (!incoming) {
      return;
    }

    const isDuplicate = currentMedicationsDraft.some(
      (entry) => entry.toLowerCase() === incoming.toLowerCase(),
    );
    if (isDuplicate) {
      if (incomingValue === undefined) {
        setNewMedication('');
      }
      return;
    }

    const next = [...currentMedicationsDraft, incoming];
    setCurrentMedicationsDraft(next);
    if (incomingValue === undefined) {
      setNewMedication('');
    }
    persistTriageDraft(selectedTicket.id, { currentMedicationsDraft: next });
    await applyTicketPatch(selectedTicket.id, {
      currentMedications: next,
    });
  };

  const handleMedicationRemove = async (medicationToRemove) => {
    if (!selectedTicket) {
      return;
    }

    const next = currentMedicationsDraft.filter(
      (entry) => entry.toLowerCase() !== medicationToRemove.toLowerCase(),
    );
    setCurrentMedicationsDraft(next);
    persistTriageDraft(selectedTicket.id, { currentMedicationsDraft: next });
    await applyTicketPatch(selectedTicket.id, {
      currentMedications: next,
    });
  };

  const handleSaveMedicalHistory = async () => {
    if (!selectedTicket) {
      return;
    }

    await applyTicketPatch(selectedTicket.id, {
      activeDiseases: activeDiseasesDraft,
      allergies: (selectedPatient?.allergies || []).join(', ') || null,
      pastDiseases: String(pastDiseasesDraft || '').trim() || null,
      familyHistory: String(familyHistoryDraft || '').trim() || null,
      smoking: String(smokingDraft || '').trim() || null,
      drinking: String(drinkingDraft || '').trim() || null,
      lifestyleNotes: String(lifestyleNotesDraft || '').trim() || null,
      surgeries: String(surgeriesDraft || '').trim() || null,
      currentMedications: currentMedicationsDraft,
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
        : [
            ...previous,
            { id: areaId, view: painMapView, key: area.key, label: area.label },
          ];

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

    if (isSelectedCallbackTicket) {
      setQuickMessageError('Chat is not available for callback requests.');
      return;
    }

    setIsSendingQuickMessage(true);
    setQuickMessageError("");

    const selectedTicketId = Number(selectedTicket?.id);
    const optimisticMessage = {
      id: `optimistic-${selectedTicketId}-${Date.now()}`,
      text: trimmedMessage,
      timestamp: formatTime(new Date()),
      isSent: true,
      sender: 'nurse',
      pending: true,
    };

    if (Number.isFinite(selectedTicketId)) {
      setOptimisticQuickMessagesByTicketId((previous) => ({
        ...previous,
        [selectedTicketId]: [
          ...(previous[selectedTicketId] || []),
          optimisticMessage,
        ].slice(-QUICK_MESSAGE_LIMIT),
      }));
    }

    try {
      if (
        activeConversation?.id &&
        Number(activeConversation.id) === Number(selectedTicket?.id)
      ) {
        await sendChatMessage(trimmedMessage);
      } else if (selectedTicket?.id) {
        await sendMessageToTicket(Number(selectedTicket.id), trimmedMessage);
        await openConversation({
          id: Number(selectedTicket.id),
          name: readValue(
            selectedTicket,
            ['patientName', 'fullName', 'name'],
            'Patient',
          ),
          type: 'direct',
          participants: [
            {
              id: selectedPatientId,
              name: readValue(
                selectedTicket,
                ['patientName', 'fullName', 'name'],
                'Patient',
              ),
              type: 'p',
            },
          ],
          lastMessage: trimmedMessage,
          unreadCount: 0,
          otherUserType: "p",
        });
      } else {
        setQuickMessageError("Select a patient ticket to send a message.");
        return;
      }
      setQuickMessage("");
      setOptimisticQuickMessagesByTicketId((previous) => {
        const currentMessages = previous[selectedTicketId] || [];
        const nextMessages = currentMessages.filter(
          (message) => message.id !== optimisticMessage.id,
        );

        if (nextMessages.length === currentMessages.length) {
          return previous;
        }

        return {
          ...previous,
          [selectedTicketId]: nextMessages,
        };
      });
    } catch (error) {
      console.error("Failed to send quick message:", error);
      setQuickMessageError("Unable to send your message right now.");
      setOptimisticQuickMessagesByTicketId((previous) => {
        const currentMessages = previous[selectedTicketId] || [];
        return {
          ...previous,
          [selectedTicketId]: currentMessages.filter(
            (message) => message.id !== optimisticMessage.id,
          ),
        };
      });
    } finally {
      setIsSendingQuickMessage(false);
    }
  };

  return (
    <div className='dashboard triage-dashboard'>
      <div className='dashboard-header'>
        <div className='header-center'>
          <img
            src='/okie-doc-logo.png'
            alt='Okie-Doc+'
            className='logo-image'
          />
        </div>
        <h3 className="dashboard-title">Nurse Dashboard</h3>

        <div className="nurse-header-actions">
          <NotificationBell />
          <div className="user-account">
            <Avatar
              profileImageUrl={
                nurseProfileImage !== '/account.svg' ? nurseProfileImage : null
              }
              firstName={nurseName}
              lastName={localStorage.getItem("nurse.lastName") || ""}
              userType="nurse"
              size={40}
              alt="Account"
              className="account-icon"
            />
            <span className="account-name">{nurseName}</span>
            <div className="account-dropdown">
              <button
                className="dropdown-item"
                onClick={() => navigate("/nurse-myaccount")}
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
            className='nav-tab active'
            onClick={() => navigate('/nurse-dashboard')}
          >
            Dashboard
          </button>
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-manage-appointments")}
          >
            Manage Appointments
          </button>
          <button
            className='nav-tab'
            onClick={() => navigate('/nurse-messages')}
          >
            Messages
          </button>
        </div>
      </div>

      <div className='nurse-dashboard-main-tabs'>
        <button
          className={`nurse-main-tab ${dashboardTab === 'Patient Queue' ? 'active' : ''}`}
          onClick={() => setDashboardTab('Patient Queue')}
        >
          Patient Queue
        </button>
        <button
          className={`nurse-main-tab ${dashboardTab === 'Callback Requests' ? 'active' : ''}`}
          onClick={() => setDashboardTab('Callback Requests')}
        >
          Callback Requests
        </button>
      </div>

      {dashboardTab === 'Patient Queue' ? (
        <div className='triage-shell'>
          <div className='triage-grid'>
            <section className='triage-queue-col'>
            <div className='triage-col-header'>
              <Users size={16} strokeWidth={2.2} />
              <h3>Patient Queue</h3>
            </div>

            <div className='nurse-queue-filter-container'>
              <div className='nurse-queue-filter-pills'>
                <button
                  className={`nurse-filter-pill ${queueFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setQueueFilter('All')}
                >
                  <span className='pill-label'>All</span>
                  <span className='pill-count'>
                    {[...tickets, ...callbacks].length}
                  </span>
                </button>
                <button
                  className={`nurse-filter-pill ${queueFilter === 'Consults' ? 'active' : ''}`}
                  onClick={() => setQueueFilter('Consults')}
                >
                  <span className='pill-label'>Consults</span>
                  <span className='pill-count'>{tickets.length}</span>
                </button>
                <button
                  className={`nurse-filter-pill ${queueFilter === 'Callbacks' ? 'active' : ''}`}
                  onClick={() => setQueueFilter('Callbacks')}
                >
                  <span className='pill-label'>Callbacks</span>
                  <span className='pill-count highlighted'>
                    {callbacks.length}
                  </span>
                </button>
              </div>
            </div>

            <div className='triage-queue-list'>
              {queueCards.length > 0 ? (
                queueCards.map((item) => {
                  if (item.type === 'callback') {
                    const callback = item.callback;
                    const callbackTicket = item.callbackTicket;
                    const isSelectedCallback =
                      Boolean(selectedTicket?.isCallback) &&
                      Number(selectedTicket?.callbackId) ===
                        Number(callback?.id);

                    return (
                      <CallbackQueueCard
                        key={`callback-${callback.id}`}
                        callback={callback}
                        isSelected={isSelectedCallback}
                        onSave={handleCallbackPatch}
                        onSelect={() => {
                          const linkedTicket = (tickets || []).find(
                            (ticket) =>
                              Number(ticket.id) ===
                              Number(callback?.linkedTicketId),
                          );

                          if (linkedTicket) {
                            setSelectedTicket(linkedTicket);
                            setHasManualDeselection(false);
                            return;
                          }

                          if (isSelectedCallback) {
                            setSelectedTicket(null);
                            setHasManualDeselection(true);
                          } else {
                            setSelectedTicket(callbackTicket);
                            setHasManualDeselection(false);
                          }
                        }}
                        onStatusChange={updateCallbackStatus}
                      />
                    );
                  }

                  const {
                    ticket,
                    queueStatus,
                    statusLabel,
                    channelLabel,
                    urgencyLevel,
                  } = item;
                  const isSelected =
                    Number(selectedTicket?.id) === Number(ticket.id);
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
                              {readValue(ticket, [
                                'patientName',
                                'fullName',
                                'name',
                              ])}
                            </div>
                          </div>
                          <span
                            className={`triage-status-badge ${queueStatus}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
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
                          <span>{formatTicketTime(ticket)}</span>
                        </div>

                        {urgencyLevel ? (
                          <span
                            className={`triage-urgency-badge ${urgencyKey}`}
                          >
                            {urgencyLevel}
                          </span>
                        ) : (
                          <span
                            className='triage-urgency-badge triage-urgency-badge-placeholder'
                            aria-hidden='true'
                          >
                            Placeholder
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className='triage-empty-note'>
                  No patients or callbacks in queue.
                </div>
              )}
            </div>
          </section>

          <section className="triage-snapshot-col">
            <div className="triage-col-header">
              <Info size={16} strokeWidth={2.2} />
              <h3>Patient Snapshot</h3>
            </div>
            <div className="triage-snapshot-scroll">
              {!selectedPatient ? (
                <div className='triage-empty-note'>
                  Select a patient from queue.
                </div>
              ) : (
                <>
                  <article className="triage-profile-card">
                    <div className="triage-profile-top">
                      <div className="triage-avatar">
                        {(selectedPatient.fullName || "?")
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part.charAt(0).toUpperCase())
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h4>{selectedPatient.fullName}</h4>
                        <p>
                          {selectedPatient.age} years {'\u2022'}{' '}
                          {selectedPatient.gender}
                        </p>
                      </div>
                    </div>

                    <div className="triage-profile-grid">
                      <div>
                        <label>Phone</label>
                        <p className="triage-value-line">
                          <Phone size={13} strokeWidth={2.2} />
                          <span>{selectedPatient.phone}</span>
                        </p>
                      </div>
                      <div>
                        <label>Blood Type</label>
                        <p className="triage-value-line triage-blood">
                          <Droplet size={13} strokeWidth={2.2} />
                          <span>{selectedPatient.bloodType}</span>
                        </p>
                      </div>
                      <div className="full">
                        <label>Email</label>
                        <p className="triage-value-line">
                          <Mail size={13} strokeWidth={2.2} />
                          <span>{selectedPatient.email}</span>
                        </p>
                      </div>
                    </div>

                    {selectedPatient.allergies.length > 0 && (
                      <>
                        <div className="triage-divider" />

                        <div className="triage-allergy-block">
                          <h5>
                            <AlertCircle size={14} strokeWidth={2.2} />
                            <span>Allergies</span>
                          </h5>
                          <div className="triage-tag-list">
                            {selectedPatient.allergies.map((allergy) => (
                              <span key={allergy}>{allergy}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="triage-divider" />

                    <div className="triage-history-block">
                      <h5 className="triage-history-title">Medical History</h5>
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

                    <div className="triage-divider" />

                    <div className="triage-last-visit">
                      <Clock3 size={14} strokeWidth={2.2} />
                      <span>Last visit:</span>
                      <strong>{selectedPatient.lastVisit}</strong>
                    </div>

                    <div className='triage-divider' />

                    <button
                      onClick={() => setShowMedicalRecords(true)}
                      disabled={isSelectedCallbackTicket || !selectedPatientId}
                      className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                        isSelectedCallbackTicket || !selectedPatientId
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      <FileText size={14} strokeWidth={2} />
                      View Medical Records
                    </button>

                    {isSelectedCallbackTicket && (
                      <p className='text-[11px] text-gray-500 mt-2'>
                        Callback-only entries do not have direct medical record
                        editing context.
                      </p>
                    )}
                  </article>

                  <article className="triage-details-panel">
                    <button
                      type='button'
                      className='triage-details-toggle'
                      onClick={() =>
                        setIsAdditionalDetailsOpen((prev) => !prev)
                      }
                    >
                      <span className="triage-details-title">
                        <MapPin size={14} strokeWidth={2.2} />
                        <span>Additional Details</span>
                      </span>
                      <ChevronDown
                        size={16}
                        strokeWidth={2.3}
                        className={isAdditionalDetailsOpen ? "open" : ""}
                      />
                    </button>

                    {isAdditionalDetailsOpen && (
                      <div className="triage-details-content">
                        <div className="triage-detail-row">
                          <label>Address</label>
                          <p>{selectedPatient.address}</p>
                        </div>
                      </div>
                    )}
                  </article>
                </>
              )}
            </div>

            <div className="triage-snapshot-chat-dock">
              <article className="triage-chat-panel">
                <header>
                  <h4>Chat Consultation</h4>
                  <p>Context for triage assessment</p>
                </header>

                  <div className="triage-chat-list" ref={quickChatListRef}>
                    {!selectedPatient ? (
                      <div className='triage-empty-note'>
                        Select a patient to open chat.
                      </div>
                    ) : isSelectedCallbackTicket ? (
                      <div className='triage-empty-note'>
                        Chat is not available for callback-only requests.
                      </div>
                    ) : chatEntries.length > 0 ? (
                    chatEntries.map((message) =>
                      message.isSystem ? (
                        <div
                          key={message.id}
                          className='triage-chat-system-row'
                        >
                          <span className='triage-chat-system-avatar'>
                            <UserRound size={14} strokeWidth={2.2} />
                          </span>
                          <div className="triage-chat-bubble system">
                            <p>{message.text}</p>
                            <span>{message.timestamp}</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={message.id}
                          className={`triage-chat-bubble ${message.isSent ? "sent" : "received"}`}
                        >
                          <p>{message.text}</p>
                          <span>{message.timestamp}</span>
                        </div>
                      ),
                    )
                  ) : (
                    <div className='triage-empty-note'>
                      No messages yet for this patient.
                    </div>
                  )}
                </div>

                <form
                  className='triage-chat-input-row'
                  onSubmit={handleQuickSendMessage}
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={quickMessage}
                    onChange={(event) => setQuickMessage(event.target.value)}
                    disabled={
                      !selectedPatient ||
                      isSendingQuickMessage ||
                      isSelectedCallbackTicket
                    }
                  />
                  <button
                    className='triage-chat-send-btn'
                    type='submit'
                    disabled={
                      !selectedPatient ||
                      isSelectedCallbackTicket ||
                      !quickMessage.trim() ||
                      isSendingQuickMessage
                    }
                  >
                    <SendHorizontal size={14} strokeWidth={2.3} />
                  </button>
                </form>

                {quickMessageError && (
                  <p className='nurse-quick-error'>{quickMessageError}</p>
                )}
              </article>
            </div>
          </section>

          <section className="triage-workspace-col">
            <div className="triage-col-header">
              <ClipboardList size={16} strokeWidth={2.2} />
              <h3>Triage Workspace</h3>
            </div>

            {selectedPatient && (
              <div className="triage-workspace-head">
                <div className="triage-workspace-head-main">
                  <div className="triage-name-badge-row">
                    <h2>{selectedPatient.fullName}</h2>
                    <span className="triage-chat-badge">
                      {getChannelLabel(selectedTicket)}
                    </span>
                  </div>

                  <div className="triage-status-select-wrap">
                    <button
                      type="button"
                      className={`triage-status-select ${triageStatus
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      onClick={() => setShowStatusMenu((prev) => !prev)}
                      disabled={isUpdatingStatus || isSelectedCallbackTicket}
                    >
                      <span className="triage-status-current">
                        {renderTriageStatusIcon(triageStatus)}
                        <span>{triageStatus}</span>
                      </span>
                      <ChevronDown size={16} strokeWidth={2.2} />
                    </button>

                    {showStatusMenu && (
                      <div className="triage-status-menu">
                        {TRIAGE_STATUS_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className="triage-status-option"
                            onClick={() => handleStatusChange(option)}
                          >
                            <span className='triage-status-option-main'>
                              <span
                                className={`dot ${option.toLowerCase().replace(/\s+/g, '-')}`}
                              />
                              {renderTriageStatusIcon(option)}
                              <span>{option}</span>
                            </span>
                            {triageStatus === option ? (
                              <Check
                                size={16}
                                strokeWidth={2.4}
                                className='triage-status-selected-check'
                              />
                            ) : (
                              <span />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="triage-mark-actions">
                  <label>
                    <input
                      type="checkbox"
                      checked={markInquiry}
                      disabled={isSelectedCallbackTicket}
                      onChange={(event) =>
                        handleCloseReasonToggle("inquiry", event.target.checked)
                      }
                    />
                    <span>Mark as Inquiry</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={markIncomplete}
                      disabled={isSelectedCallbackTicket}
                      onChange={(event) =>
                        handleCloseReasonToggle(
                          'incomplete',
                          event.target.checked,
                        )
                      }
                    />
                    <span>Mark as Incomplete</span>
                  </label>
                </div>
              </div>
            )}

            <div className="triage-workspace-scroll">
              {selectedPatient ? (
                <>
                  <article className="triage-vitals-card">
                    <h4>
                      <Activity size={16} strokeWidth={2.2} />
                      <span>Vital Signs</span>
                    </h4>
                    <div className="triage-vitals-grid">
                      <div>
                        <label>Blood Pressure</label>
                        <input
                          type="text"
                          className="triage-vital-input"
                          placeholder="120/80"
                          maxLength={7}
                          value={vitalsDraft.bloodPressure}
                          onChange={(event) =>
                            handleVitalChange(
                              "bloodPressure",
                              sanitizeBloodPressureVital(event.target.value),
                            )
                          }
                          onBlur={() => handleVitalBlur("bloodPressure")}
                        />
                      </div>
                      <div>
                        <label>Heart Rate</label>
                        <div className="triage-vital-input-wrap">
                          <input
                            type="text"
                            className="triage-vital-input with-unit"
                            placeholder="72"
                            inputMode="numeric"
                            maxLength={3}
                            value={vitalsDraft.heartRate}
                            onChange={(event) =>
                              handleVitalChange(
                                "heartRate",
                                sanitizeNumericVital(event.target.value),
                              )
                            }
                            onBlur={() => handleVitalBlur("heartRate")}
                          />
                          <span className="triage-vital-unit">bpm</span>
                        </div>
                      </div>
                      <div>
                        <label>Temperature</label>
                        <div className="triage-vital-input-wrap">
                          <input
                            type="text"
                            className="triage-vital-input with-unit"
                            placeholder="36.8"
                            inputMode="decimal"
                            maxLength={5}
                            value={vitalsDraft.temperature}
                            onChange={(event) =>
                              handleVitalChange(
                                "temperature",
                                sanitizeTemperatureVital(event.target.value),
                              )
                            }
                            onBlur={() => handleVitalBlur("temperature")}
                          />
                          <span className="triage-vital-unit">°C</span>
                        </div>
                      </div>
                      <div>
                        <label>Oxygen Saturation</label>
                        <div className="triage-vital-input-wrap">
                          <input
                            type="text"
                            className="triage-vital-input with-unit"
                            placeholder="98"
                            inputMode="numeric"
                            maxLength={3}
                            value={vitalsDraft.oxygenSaturation}
                            onChange={(event) =>
                              handleVitalChange(
                                "oxygenSaturation",
                                sanitizeNumericVital(event.target.value),
                              )
                            }
                            onBlur={() => handleVitalBlur("oxygenSaturation")}
                          />
                          <span className="triage-vital-unit">%</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="triage-submitted-concern-card">
                      <h4>Patient Submitted Concern</h4>
                      <div
                        className={`triage-submitted-concern-quote ${patientSubmittedConcern ? 'filled' : 'empty'}`}
                      >
                        {patientSubmittedConcern
                          ? `"${patientSubmittedConcern}"`
                          : '"No patient concern submitted"'}
                      </div>
                      <p className="triage-complaint-help">
                        This is the patient's original submitted concern.
                        Review and create professional chief complaint below.
                      </p>
                  </article>

                  <article className="triage-clinical-complaint-card">
                      <h4>Chief Complaint (Clinical)</h4>
                      <textarea
                        value={chiefComplaintDraft}
                        onChange={(event) =>
                          handleChiefComplaintChange(event.target.value)
                        }
                        onBlur={handleChiefComplaintBlur}
                        placeholder="Enter professional clinical chief complaint based on triage assessment..."
                      />
                      <p className="triage-complaint-help">
                        This is the professional triage chief complaint that
                        will be sent to the doctor.
                      </p>
                  </article>

                  <article className="triage-complaint-symptoms">
                      <h4>Associated Symptoms</h4>
                      <textarea
                        value={associatedSymptomsDraft}
                        onChange={(event) =>
                          handleAssociatedSymptomsChange(event.target.value)
                        }
                        onBlur={handleAssociatedSymptomsBlur}
                        placeholder="Additional symptoms and clinical observations..."
                      />
                      <div className="triage-symptom-pills">
                      {SYMPTOM_PILL_OPTIONS.map((pill) => {
                        const isSelected = selectedSymptomPills.includes(pill);
                        return (
                          <button
                            key={pill}
                            type="button"
                            className={`triage-symptom-pill ${isSelected ? "selected" : ""}`}
                            onClick={() => handleSymptomPillToggle(pill)}
                          >
                            {pill}
                          </button>
                          );
                        })}
                      </div>
                  </article>

                  <article className="triage-pain-map-card">
                    <h4>Pain Map</h4>
                    <div className='triage-pain-map-controls-row'>
                      <div
                        className='triage-pain-map-view-toggle'
                        role='tablist'
                        aria-label='Pain map view'
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={painMapView === "front"}
                          className={`triage-pain-map-view-btn ${painMapView === "front" ? "active" : ""}`}
                          onClick={() => handlePainMapViewChange("front")}
                        >
                          Front
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={painMapView === "back"}
                          className={`triage-pain-map-view-btn ${painMapView === "back" ? "active" : ""}`}
                          onClick={() => handlePainMapViewChange("back")}
                        >
                          Back
                        </button>
                      </div>
                      <div className="triage-pain-readonly-meta inline">
                        <div className="triage-vitals-grid triage-vitals-grid-readonly inline">
                          <div className="triage-pain-meta-item">
                            <label>Pain Score</label>
                            <div className='triage-vital-input-wrap triage-vital-input-wrap-readonly triage-vital-input-wrap-meta'>
                              <span className='triage-pain-meta-value'>
                                {painMapReadOnlyMeta.painScore || 'N/A'}
                              </span>
                              <span className='triage-vital-unit'>/10</span>
                            </div>
                          </div>
                          <div className="triage-pain-meta-item triage-pain-meta-item-duration">
                            <label>Pain Duration</label>
                            <div className="triage-vital-input-wrap triage-vital-input-wrap-readonly triage-vital-input-wrap-duration triage-vital-input-wrap-meta">
                              <span className="triage-pain-meta-value">
                                {painMapReadOnlyMeta.durationValue || "N/A"}
                              </span>
                              <span className="triage-vital-unit">
                                {painMapReadOnlyMeta.durationUnit || "--"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='triage-pain-map-content'>
                      <div className='triage-pain-map-picker'>
                        <div
                          className={`triage-pain-map-figure ${painMapView === 'back' ? 'back' : 'front'}`}
                        >
                          {PAIN_MAP_AREAS[painMapView].map((area) => {
                            const areaId = `${painMapView}:${area.key}`;
                            const isSelected = selectedPainAreas.some(
                              (entry) => entry.id === areaId,
                            );

                            return (
                              <button
                                key={areaId}
                                type="button"
                                className={`triage-body-part ${area.className} ${isSelected ? "selected" : ""}`}
                                onClick={() => handlePainAreaToggle(area)}
                                aria-pressed={isSelected}
                                aria-label={`${area.label} (${painMapView})`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <figure className="triage-pain-reference-card">
                        <img src={referredPainChart} alt="Referred pain reference chart" />
                      </figure>

                      <div className='triage-pain-map-selection'>
                        <div className='triage-pain-map-selection-title'>
                          Selected pain areas:
                        </div>
                        {selectedPainAreas.length === 0 ? (
                          <div className='triage-pain-map-empty'>
                            No areas selected
                          </div>
                        ) : (
                          <div className="triage-pain-map-chips">
                            {selectedPainAreas.map((area) => (
                              <div
                                key={area.id}
                                className='triage-pain-map-chip'
                              >
                                <span>
                                  {area.label}
                                  {` (${area.view === "back" ? "Back" : "Front"})`}
                                </span>
                                <button
                                  type="button"
                                  className="triage-pain-map-chip-remove"
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

                    <div className="triage-pain-map-instruction">
                      Click on body parts to mark pain locations
                    </div>
                  </article>

                  <article className="triage-ros-card">
                    <h4>Review of Systems (ROS)</h4>
                    <div className="triage-ros-grid">
                      {ROS_GROUPS.map((group) => (
                        <section key={group.title} className='triage-ros-group'>
                          <div className='triage-ros-group-title'>
                            {group.title}
                          </div>
                          <div className='triage-ros-items'>
                            {group.items.map((item) => {
                              const isChecked = selectedRosItems.includes(item);
                              return (
                                <label key={item} className="triage-ros-item">
                                  <input
                                    type="checkbox"
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

                  <article className="triage-medical-history-card">
                    <header className="triage-medical-history-title">
                      <Heart size={16} strokeWidth={2.2} />
                      <span>Medical History</span>
                    </header>

                    <section className="triage-medical-history-section">
                      <h5>
                        <Activity
                          size={14}
                          strokeWidth={2.2}
                          className="triage-active-diseases-icon"
                        />
                        <span>Active Diseases</span>
                      </h5>
                      <div className="triage-medical-pill-row">
                        {ACTIVE_DISEASE_OPTIONS.map((disease) => {
                          const isSelected = activeDiseasesDraft.some(
                            (entry) =>
                              entry.toLowerCase() === disease.toLowerCase(),
                          );
                          return (
                            <button
                              key={disease}
                              type="button"
                              className={`triage-medical-choice-pill ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleActiveDiseaseToggle(disease)}
                            >
                              {disease}
                            </button>
                          );
                        })}
                      </div>
                      <div className="triage-inline-add-row">
                        <input
                          type="text"
                          className="triage-vital-input"
                          value={customActiveDiseaseDraft}
                          onChange={(event) =>
                            setCustomActiveDiseaseDraft(event.target.value)
                          }
                          onKeyDown={(event) =>
                            event.key === 'Enter' && handleAddActiveDisease()
                          }
                          placeholder="Add custom disease..."
                        />
                        <button
                          type="button"
                          className="triage-inline-add-btn"
                          onClick={handleAddActiveDisease}
                          disabled={!customActiveDiseaseDraft.trim()}
                        >
                          +
                        </button>
                      </div>
                      {activeDiseasesDraft.length === 0 && (
                        <p className="triage-empty-medical-history">
                          No active diseases recorded
                        </p>
                      )}
                      {activeDiseasesDraft.length > 0 && (
                        <div className="triage-tag-list triage-tag-list-medications">
                          {activeDiseasesDraft.map((disease) => (
                            <span key={disease}>
                              {disease}
                              <button
                                type="button"
                                className="triage-medication-remove-btn"
                                onClick={() => handleRemoveActiveDisease(disease)}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="triage-medical-history-section triage-medical-history-alert">
                      <h5>
                        <AlertCircle size={14} strokeWidth={2.2} />
                        <span>Allergies (Auto-saves to Patient Profile)</span>
                      </h5>
                      <div className="triage-inline-add-row">
                        <input
                          type="text"
                          className="triage-vital-input"
                          value={newAllergy}
                          onChange={(event) => setNewAllergy(event.target.value)}
                          onKeyDown={(event) =>
                            event.key === 'Enter' && handleAddAllergy()
                          }
                          placeholder="Add allergy..."
                        />
                        <button
                          type="button"
                          className="triage-inline-add-btn triage-inline-add-btn-alert"
                          onClick={handleAddAllergy}
                          disabled={!newAllergy.trim()}
                        >
                          +
                        </button>
                      </div>
                      {selectedPatient?.allergies?.length > 0 && (
                        <div className="triage-tag-list triage-medical-allergy-list">
                          {selectedPatient.allergies.map((allergy) => (
                            <span key={allergy}>
                              {allergy}
                              <button
                                type="button"
                                className="triage-medication-remove-btn"
                                onClick={() => handleRemoveAllergy(allergy)}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="triage-medical-history-section triage-medical-history-section--compact">
                      <h5>Past Diseases</h5>
                      <textarea
                        className="triage-note-textarea triage-note-textarea-compact"
                        value={pastDiseasesDraft}
                        onChange={(event) =>
                          handlePastDiseasesChange(event.target.value)
                        }
                        onBlur={() =>
                          handleMedicalHistorySectionBlur(
                            'pastDiseases',
                            pastDiseasesDraft,
                          )
                        }
                        placeholder="List past diseases, conditions, or illnesses..."
                      />
                    </section>

                    <section className="triage-medical-history-section triage-medical-history-section--compact">
                      <h5 className="triage-family-history-title">Family History</h5>
                      <textarea
                        className="triage-note-textarea triage-note-textarea-compact"
                        value={familyHistoryDraft}
                        onChange={(event) =>
                          handleFamilyHistoryChange(event.target.value)
                        }
                        onBlur={() =>
                          handleMedicalHistorySectionBlur(
                            'familyHistory',
                            familyHistoryDraft,
                          )
                        }
                        placeholder="Family medical history (parents, siblings, etc.)..."
                      />
                    </section>

                    <section className="triage-medical-history-section triage-social-history-box">
                      <h5>Social History</h5>
                      <div className="triage-social-history-grid">
                        <div>
                          <label>Smoking</label>
                          <input
                            className="triage-vital-input"
                            type="text"
                            value={smokingDraft}
                            onChange={(event) =>
                              handleSmokingChange(event.target.value)
                            }
                            onBlur={() =>
                              handleMedicalHistorySectionBlur('smoking', smokingDraft)
                            }
                            placeholder="e.g., Non-smoker, 10/day"
                          />
                        </div>
                        <div>
                          <label>Drinking</label>
                          <input
                            className="triage-vital-input"
                            type="text"
                            value={drinkingDraft}
                            onChange={(event) =>
                              handleDrinkingChange(event.target.value)
                            }
                            onBlur={() =>
                              handleMedicalHistorySectionBlur('drinking', drinkingDraft)
                            }
                            placeholder="e.g., Occasional, Daily"
                          />
                        </div>
                      </div>
                      <label className="triage-lifestyle-label">Lifestyle Notes</label>
                      <textarea
                        className="triage-note-textarea triage-note-textarea-compact"
                        value={lifestyleNotesDraft}
                        onChange={(event) =>
                          handleLifestyleNotesChange(event.target.value)
                        }
                        onBlur={() =>
                          handleMedicalHistorySectionBlur(
                            'lifestyleNotes',
                            lifestyleNotesDraft,
                          )
                        }
                        placeholder="Diet, exercise, occupation, stress factors..."
                      />
                    </section>

                    <section className="triage-medical-history-section triage-medical-history-section--compact">
                      <h5>Surgeries</h5>
                      <textarea
                        className="triage-note-textarea triage-note-textarea-compact"
                        value={surgeriesDraft}
                        onChange={(event) =>
                          handleSurgeriesChange(event.target.value)
                        }
                        onBlur={() =>
                          handleMedicalHistorySectionBlur('surgeries', surgeriesDraft)
                        }
                        placeholder="List previous surgeries with dates if available..."
                      />
                    </section>

                    <section className="triage-medical-history-section triage-medical-history-section--compact">
                      <h5 className="triage-medications-title">
                        <Pill size={14} strokeWidth={2.2} className="triage-medications-icon" />
                        <span>Current Medications</span>
                      </h5>
                      <div className="triage-inline-add-row">
                        <input
                          type="text"
                          className="triage-vital-input"
                          value={newMedication}
                          onChange={(event) => setNewMedication(event.target.value)}
                          onKeyDown={(event) =>
                            event.key === 'Enter' && handleMedicationAdd()
                          }
                          placeholder="Add medication..."
                        />
                        <button
                          type="button"
                          className="triage-inline-add-btn"
                          onClick={handleMedicationAdd}
                          disabled={!newMedication.trim()}
                        >
                          +
                        </button>
                      </div>
                      {currentMedicationsDraft.length > 0 && (
                        <div className="triage-tag-list triage-tag-list-medications">
                          {currentMedicationsDraft.map((medication) => (
                            <span key={medication}>
                              {medication}
                              <button
                                type="button"
                                className="triage-medication-remove-btn"
                                onClick={() => handleMedicationRemove(medication)}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </section>
                  </article>

                  <article className="triage-note-card">
                    <h4>
                      <FileText size={16} strokeWidth={2.2} />
                      <span>Additional Remarks</span>
                    </h4>
                    <textarea
                      className="triage-note-textarea"
                      value={additionalRemarksDraft}
                      onChange={(event) =>
                        handleAdditionalRemarksChange(event.target.value)
                      }
                      onBlur={handleAdditionalRemarksBlur}
                      placeholder="Add remarks or important notes..."
                    />
                  </article>

                  <article className="triage-urgency-card">
                    <h4>
                      <AlertCircle size={16} strokeWidth={2.2} />
                      <span>Urgency Level</span>
                    </h4>
                    <div className="triage-urgency-grid">
                      {URGENCY_LEVEL_OPTIONS.map((level) => {
                        const isSelected = selectedUrgencyLevel === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            className={`triage-urgency-option level-${level.toLowerCase()} ${isSelected ? "selected" : ""}`}
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
                <div className='triage-empty-note'>
                  Select a patient from queue.
                </div>
              )}
            </div>

            {selectedPatient && !isSelectedCallbackTicket && (
              <div
                className={`triage-workspace-footer ${shouldEnableCloseTicket ? 'active' : 'inactive'}`}
              >
                <div className='triage-bottom-actions'>
                  <button
                    type="button"
                    className="triage-transfer-btn"
                    onClick={openTransferModal}
                  >
                    <UserRound size={16} strokeWidth={2.2} />
                    Transfer Patient
                  </button>
                  <button
                    type="button"
                    className={`triage-close-btn ${shouldEnableCloseTicket ? "active" : "inactive"}`}
                    disabled={!shouldEnableCloseTicket}
                    onClick={handleCloseTicket}
                  >
                    <span className="triage-close-x">&times;</span>
                    <span>Close Ticket</span>
                    {closeReasonLabel && (
                      <span className='triage-close-tag'>
                        {closeReasonLabel}
                      </span>
                    )}
                  </button>
                </div>

                {!shouldEnableCloseTicket && (
                  <p className="triage-close-help">
                    Mark ticket as "Inquiry" or "Incomplete" to enable closing
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
      ) : (
        <div className='nurse-callback-requests-container'>
          <div className='nurse-callback-header'>
            <div className='nurse-callback-header-left'>
              <div className='nurse-callback-title-row'>
                <Phone className='nurse-callback-title-icon' />
                <h2>Callback Requests</h2>
              </div>
              <p>Free inquiry and triage assessment</p>
            </div>
            <div className='nurse-callback-header-right'>
              <div className='nurse-callback-status-pill'>
                {callbacks.filter((c) => c.status === 'new').length} Waiting
              </div>
              <div className='nurse-callback-status-pill in-progress'>
                {
                  callbacks.filter((c) =>
                    ['in_progress', 'inquiry', 'escalated'].includes(
                      String(c.status || '').toLowerCase(),
                    ),
                  ).length
                }{' '}
                Active
              </div>
            </div>
          </div>

          <div className='nurse-callback-table-container'>
            <table className='nurse-callback-table'>
              <thead>
                <tr>
                  <th>TICKET ID</th>
                  <th>PATIENT NAME</th>
                  <th>CONTACT NUMBER</th>
                  <th>CONTACT METHOD</th>
                  <th>REQUEST TIME</th>
                  <th>CHIEF COMPLAINT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {callbacks.length > 0 ? (
                  callbacks.map((callback) => (
                    <tr key={callback.id}>
                      <td className='text-xs font-medium text-gray-500'>
                        {callback.callbackNumber ||
                          `CB-${String(callback.id).padStart(3, '0')}`}
                      </td>
                      <td className='font-bold'>{callback.fullName}</td>
                      <td>{callback.contactNumber}</td>
                      <td>
                        <div className='flex items-center gap-2'>
                          {getCallbackChannelLabel(callback) === 'Video' ? (
                            <Video size={16} className='text-blue-500' />
                          ) : (
                            <Phone size={16} className='text-blue-500' />
                          )}
                          <span>{getCallbackChannelLabel(callback)}</span>
                        </div>
                      </td>
                      <td>
                        {formatDate(callback.createdAt)}{' '}
                        {formatTime(callback.createdAt)}
                      </td>
                      <td className='nurse-table-complaint'>
                        {callback.message || 'Callback request'}
                      </td>
                      <td>
                        <span
                          className={`nurse-status-badge ${callback.status}`}
                        >
                          {getCallbackStatusLabel(callback.status)}
                        </span>
                      </td>
                      <td>
                        <div className='nurse-table-actions text-nowrap'>
                          <button
                            className={`nurse-action-btn ${callback.status === 'new' ? 'start' : 'view'}`}
                            onClick={() => openCallbackModal(callback)}
                          >
                            {callback.status === 'new' ? (
                              <>
                                <div className='play-icon' />
                                Start
                              </>
                            ) : (
                              <>
                                <Info size={16} />
                                View
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='8' className='nurse-table-empty'>
                      No callback requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showTransferModal && selectedPatient && (
        <div
          className="triage-transfer-modal-overlay"
          onClick={closeTransferModal}
          role="presentation"
        >
          <div
            className="triage-transfer-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Transfer patient"
          >
            <button
              type="button"
              className="triage-transfer-modal-close"
              onClick={closeTransferModal}
              aria-label="Close transfer modal"
            >
              &times;
            </button>

            <h3 className='triage-transfer-title'>Transfer Patient</h3>
            <p className='triage-transfer-subtitle'>
              Transfer {selectedPatient.fullName} to another healthcare
              provider.
            </p>

            <div className="triage-transfer-targets">
              <button
                type="button"
                className={`triage-transfer-target ${transferTarget === "doctor" ? "active" : ""}`}
                onClick={() => {
                  setTransferTarget("doctor");
                  setIsDepartmentMenuOpen(false);
                  setIsDoctorMenuOpen(false);
                  setIsNurseMenuOpen(false);
                }}
              >
                To Doctor
              </button>
              <button
                type="button"
                className={`triage-transfer-target ${transferTarget === "nurse" ? "active" : ""}`}
                onClick={() => {
                  setTransferTarget("nurse");
                  setIsDepartmentMenuOpen(false);
                  setIsDoctorMenuOpen(false);
                  setIsNurseMenuOpen(false);
                }}
              >
                To Nurse
              </button>
            </div>

            {transferTarget === "doctor" ? (
              <div className="triage-transfer-field">
                <label>Select Specialist Department</label>
                <div className="triage-transfer-select-wrap">
                  <button
                    type='button'
                    className={`triage-transfer-select ${selectedDepartment ? '' : 'placeholder'}`}
                    onClick={() =>
                      setIsDepartmentMenuOpen((previous) => !previous)
                    }
                  >
                    <span>{selectedDepartment || "Choose a department"}</span>
                    <ChevronDown size={17} strokeWidth={2.1} />
                  </button>
                  {isDepartmentMenuOpen && (
                    <div className="triage-transfer-menu">
                      {availableDepartments.map((department) => (
                        <button
                          key={department}
                          type="button"
                          className={`triage-transfer-option ${selectedDepartment === department ? "active" : ""}`}
                          onClick={() => {
                            setSelectedDepartment(department);
                            setSelectedDoctorId("");
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
                <div className="triage-transfer-select-wrap">
                  <button
                    type="button"
                    className={`triage-transfer-select ${selectedDepartment ? "" : "disabled"} ${selectedDoctor ? "" : "placeholder"}`}
                    onClick={() => {
                      if (!selectedDepartment) {
                        return;
                      }
                      setIsDoctorMenuOpen((previous) => !previous);
                    }}
                  >
                    <span>{selectedDoctor?.name || "Choose a doctor"}</span>
                    <ChevronDown size={17} strokeWidth={2.1} />
                  </button>
                  {isDoctorMenuOpen && selectedDepartment && (
                    <div className="triage-transfer-menu">
                      {filteredDoctorsByDepartment.length > 0 ? (
                        filteredDoctorsByDepartment.map((doctor) => (
                          <button
                            key={doctor.id}
                            type="button"
                            className={`triage-transfer-option ${Number(selectedDoctorId) === Number(doctor.id) ? "active" : ""}`}
                            onClick={() => {
                              setSelectedDoctorId(String(doctor.id));
                              setIsDoctorMenuOpen(false);
                            }}
                          >
                            {doctor.name}
                          </button>
                        ))
                      ) : (
                        <div className='triage-transfer-empty'>
                          No doctors found for this department
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="triage-transfer-field">
                  <label>Select Nurse</label>
                  <div className="triage-transfer-select-wrap">
                    <button
                      type='button'
                      className={`triage-transfer-select ${selectedNurse ? '' : 'placeholder'}`}
                      onClick={() =>
                        setIsNurseMenuOpen((previous) => !previous)
                      }
                    >
                      <span>{selectedNurse?.name || "Choose a nurse"}</span>
                      <ChevronDown size={17} strokeWidth={2.1} />
                    </button>
                    {isNurseMenuOpen && (
                      <div className="triage-transfer-menu">
                        {availableNurses.length > 0 ? (
                          availableNurses.map((nurse) => (
                            <button
                              key={nurse.id}
                              type="button"
                              className={`triage-transfer-option ${Number(selectedNurseId) === Number(nurse.id) ? "active" : ""}`}
                              onClick={() => {
                                setSelectedNurseId(String(nurse.id));
                                setIsNurseMenuOpen(false);
                              }}
                            >
                              {nurse.name}
                            </button>
                          ))
                        ) : (
                          <div className='triage-transfer-empty'>
                            No nurses available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="triage-transfer-field">
                  <label>Reason for Transfer (Optional)</label>
                  <textarea
                    className="triage-transfer-reason"
                    placeholder="Enter reason or notes for the transfer..."
                    value={transferReason}
                    onFocus={closeTransferMenus}
                    onClick={closeTransferMenus}
                    onChange={(event) => setTransferReason(event.target.value)}
                  />
                </div>
              </>
            )}

            <div className="triage-transfer-actions">
              <button
                type="button"
                className="triage-transfer-cancel"
                onClick={closeTransferModal}
                disabled={isTransferSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="triage-transfer-submit"
                disabled={
                  transferTarget === 'doctor'
                    ? !canTransferToDoctor
                    : !canTransferToNurse
                }
                onClick={handleTransferSubmit}
              >
                {transferTarget === 'doctor'
                  ? 'Transfer to Doctor'
                  : 'Transfer to Nurse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCallbackModal && activeCallback && (
        <div
          className='callback-form-modal-overlay'
          onClick={closeCallbackModal}
          role='presentation'
        >
          <div
            className='callback-form-modal'
            onClick={(event) => event.stopPropagation()}
            role='dialog'
            aria-modal='true'
            aria-label='Callback details'
          >
            <button
              type='button'
              className='callback-form-close'
              onClick={closeCallbackModal}
              aria-label='Close callback form'
            >
              &times;
            </button>

            <h3 className='callback-form-title'>
              Callback Details -{' '}
              {activeCallback.callbackNumber ||
                `CB-${String(activeCallback.id).padStart(3, '0')}`}
            </h3>
            <p className='callback-form-subtitle'>
              Patient inquiry and triage assessment
            </p>

            <div className='callback-form-card'>
              <div>
                <label>Patient Name</label>
                <p>{activeCallback.fullName || DEFAULT_TEXT}</p>
              </div>
              <div>
                <label>Contact Number</label>
                <p>{activeCallback.contactNumber || DEFAULT_TEXT}</p>
              </div>
              <div>
                <label>Preferred Method</label>
                <p>{activeCallback.contactMethod || DEFAULT_TEXT}</p>
              </div>
              <div>
                <label>Request Time</label>
                <p>
                  {formatDate(activeCallback.createdAt)}{' '}
                  {formatTime(activeCallback.createdAt)}
                </p>
              </div>
            </div>

            <div className='callback-form-field'>
              <label>Chief Complaint</label>
              <div className='callback-form-static-input'>
                {activeCallback.message || 'No chief complaint provided'}
              </div>
            </div>

            <div className='callback-form-field'>
              <label>Symptoms</label>
              <div className='callback-form-static-input'>
                {activeCallback.message || 'No symptoms provided'}
              </div>
            </div>

            <div className='callback-form-field'>
              <label>Nurse Remarks</label>
              <textarea
                value={callbackNurseRemarks}
                onChange={(event) => setCallbackNurseRemarks(event.target.value)}
                placeholder='Add your assessment and recommendations...'
              />
            </div>

            <div className='callback-form-field'>
              <label>Callback Notes</label>
              <textarea
                value={callbackInternalNotes}
                onChange={(event) => setCallbackInternalNotes(event.target.value)}
                placeholder='Internal notes about the callback...'
              />
            </div>

            <div className='callback-form-actions'>
              <button
                type='button'
                className='callback-form-btn close'
                onClick={closeCallbackModal}
                disabled={Boolean(callbackActionLoadingStatus)}
              >
                Close
              </button>
              <button
                type='button'
                className='callback-form-btn inquiry'
                onClick={() => handleCallbackModalStatusAction('inquiry')}
                disabled={Boolean(callbackActionLoadingStatus)}
              >
                Mark as Inquiry
              </button>
              <button
                type='button'
                className='callback-form-btn convert'
                disabled={Boolean(callbackActionLoadingStatus)}
              >
                Convert to Ticket
              </button>
              <button
                type='button'
                className='callback-form-btn escalate'
                onClick={() => handleCallbackModalStatusAction('escalated')}
                disabled={Boolean(callbackActionLoadingStatus)}
              >
                Escalate to Doctor
              </button>
              <button
                type='button'
                className='callback-form-btn completed'
                onClick={() => handleCallbackModalStatusAction('closed')}
                disabled={Boolean(callbackActionLoadingStatus)}
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {showMedicalRecords && selectedPatient && selectedTicket && !isSelectedCallbackTicket && (
        <PatientMedicalRecordsModal
          onClose={() => setShowMedicalRecords(false)}
          patient={selectedPatient}
          patientId={selectedPatientId}
          ticketId={`T-${String(selectedTicket.id).padStart(3, '0')}`}
          consultationType={getChannelLabel(selectedTicket)}
          medicalHistoryBindings={{
            activeDiseases: activeDiseasesDraft,
            allergies: selectedPatient.allergies,
            pastDiseases: pastDiseasesDraft,
            familyHistory: familyHistoryDraft,
            smoking: smokingDraft,
            drinking: drinkingDraft,
            lifestyleNotes: lifestyleNotesDraft,
            surgeries: surgeriesDraft,
            currentMedications: currentMedicationsDraft,
            onActiveDiseasesAdd: handleAddActiveDisease,
            onActiveDiseasesRemove: handleRemoveActiveDisease,
            onAllergyAdd: handleAddAllergy,
            onAllergyRemove: handleRemoveAllergy,
            onPastDiseasesChange: handlePastDiseasesChange,
            onPastDiseasesBlur: () =>
              handleMedicalHistorySectionBlur(
                'pastDiseases',
                pastDiseasesDraft,
              ),
            onFamilyHistoryChange: handleFamilyHistoryChange,
            onFamilyHistoryBlur: () =>
              handleMedicalHistorySectionBlur(
                'familyHistory',
                familyHistoryDraft,
              ),
            onSmokingChange: handleSmokingChange,
            onSmokingBlur: () =>
              handleMedicalHistorySectionBlur('smoking', smokingDraft),
            onDrinkingChange: handleDrinkingChange,
            onDrinkingBlur: () =>
              handleMedicalHistorySectionBlur('drinking', drinkingDraft),
            onLifestyleNotesChange: handleLifestyleNotesChange,
            onLifestyleNotesBlur: () =>
              handleMedicalHistorySectionBlur(
                'lifestyleNotes',
                lifestyleNotesDraft,
              ),
            onSurgeriesChange: handleSurgeriesChange,
            onSurgeriesBlur: () =>
              handleMedicalHistorySectionBlur('surgeries', surgeriesDraft),
            onMedicationAdd: handleMedicationAdd,
            onMedicationRemove: handleMedicationRemove,
            onSave: handleSaveMedicalHistory,
          }}
        />
      )}
    </div>
  );
}
