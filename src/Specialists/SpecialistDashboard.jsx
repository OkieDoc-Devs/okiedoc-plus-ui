import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaUpload,
  FaTimes,
  FaRegComment,
  FaPaperPlane,
  FaPrescriptionBottleAlt,
  FaFlask,
  FaFileMedical,
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import './SpecialistDashboard.css';
import authService from './authService';
import * as specialistApi from './services/apiService';
import { API_BASE_URL } from '../api/apiClient';
import { getConversations as fetchChatConversations } from '../Nurse/services/chatService.js';
import SpecialistCall from './SpecialistCall';
import Messages from './Messages';
import ImageCropperModal from '../components/ImageCropperModal';
import PainMapSection from '../components/PainMap/PainMap.jsx';
import { PAIN_MAP_VIEWS } from '../components/PainMap/painMapConstants.js';
import ICDCodeSelector from './components/ICDCodeSelector';
import Avatar from '../components/Avatar';
import { usePSGC } from '../hooks/usePSGC';
import {
  formatDateLabel,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  formatDateKey,
  parseTicketDate,
  isToday,
  isPastDate,
  loadTickets,
  saveTickets,
  loadProfileData,
  saveProfileData,
  loadServicesData,
  saveServicesData,
  loadAccountData,
  saveAccountData,
  loadScheduleData,
  saveScheduleData,
  loadEncounterData,
  saveEncounterData,
  loadMedicalHistoryData,
  saveMedicalHistoryData,
  getCurrentUserEmail,
  getStatusBadgeClass,
  filterTicketsByStatus,
  filterBySearchTerm,
  filterBySpecialization,
  filterTransactions,
  getAllSpecializations,
  formatFileSize,
  generateUserInitials,
  validateFormData,
  SUB_SPECIALIZATIONS,
  createDefaultEncounter,
  createDefaultMedicineForm,
  createDefaultLabForm,
  validateMedicine,
  validateLabRequest,
  addMedicineToEncounter,
  removeMedicineFromEncounter,
  addLabRequestToEncounter,
  removeLabRequestFromEncounter,
  createMedicalHistoryRequest,
  updateMedicalHistoryStatus,
  formatMedicineDisplay,
  formatLabRequestDisplay,
  getSubSpecializations,
  isValidSpecialization,
  isValidSubSpecialization,
  exportTransactionsToCSV,
  generateMedicalHistoryHTML,
  openPrintWindow,
  generateEncounterSummaryHTML,
  downloadEncounterSummaryPDF,
  exportToJSON,
  validateEmail,
  validatePassword,
  validatePhone,
  validatePRCLicense,
  validateSpecialistProfile,
  validatePasswordChange,
  validateServiceFee,
  validateAccountDetails,
  validateScheduleData,
  validateMedicalHistoryRequest,
  ICD11_CHAPTERS,
  parseICDCode,
} from './utils';

const TICKET_REFRESH_INTERVAL_MS = 15000;

const normalizePainMapAreas = (ticket) => {
  const rawAreas = Array.isArray(ticket?.selectedPainAreas)
    ? ticket.selectedPainAreas
    : Array.isArray(ticket?.painMap)
      ? ticket.painMap
      : [];

  return rawAreas
    .map((area, index) => {
      if (typeof area === 'string') {
        const stringMatch = area.match(/^(front|back):(.+)$/i);
        if (stringMatch) {
          const view = stringMatch[1].toLowerCase();
          const key = stringMatch[2];
          return {
            id: `${view}:${key}`,
            view,
            key,
            label: key,
          };
        }

        return {
          id: `front:${area}:${index}`,
          view: 'front',
          key: area,
          label: area,
        };
      }

      const idMatch =
        typeof area?.id === 'string' ? area.id.match(/^(front|back):(.+)$/i) : null;
      const parsedView = idMatch ? idMatch[1].toLowerCase() : null;
      const parsedKey = idMatch ? idMatch[2] : null;
      const view = PAIN_MAP_VIEWS.includes(area?.view)
        ? area.view
        : PAIN_MAP_VIEWS.includes(parsedView)
          ? parsedView
          : 'front';
      const key = area?.key || parsedKey || area?.id || `area-${index}`;
      const label = area?.label || area?.name || area?.bodyPart || area?.value || 'Pain area';

      return {
        id: area?.id || `${view}:${key}`,
        view,
        key,
        label,
      };
    })
    .filter((area) => area.id && area.key && area.label);
};

const getPainMapView = (ticket, areas) => {
  const savedView = ticket?.painMapView;
  if (PAIN_MAP_VIEWS.includes(savedView)) {
    return savedView;
  }

  if (!areas.length) {
    return 'front';
  }

  const frontCount = areas.filter((area) => area.view === 'front').length;
  const backCount = areas.filter((area) => area.view === 'back').length;

  if (backCount > frontCount) {
    return 'back';
  }

  if (frontCount > 0) {
    return 'front';
  }

  return areas[0]?.view || 'front';
};

const toStringList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildTriageNotes = (ticket) => String(ticket?.additionalRemarks || '').trim();

const COMMON_LAB_TESTS = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'HbA1c',
  'Kidney Function Test (KFT)',
  'Chest X-Ray',
  'Ultrasound',
  'Hepatitis B Surface Antigen',
  'Pregnancy Test',
  'Urinalysis',
  'Blood Glucose (FBS)',
  'Liver Function Test (LFT)',
  'Thyroid Function Test',
  'ECG (Electrocardiogram)',
  'COVID-19 RT-PCR',
  'Stool Examination',
];

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatShortDisplayDate = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const SpecialistDashboard = () => {
  const buildMedicalHistoryForSpecialist = (ticket) => {
    const triageHistory = toStringList(ticket?.triageMedicalHistory);
    if (triageHistory.length > 0) {
      return triageHistory;
    }
    return toStringList(ticket?.medicalHistory);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = usePSGC();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [userInitials, setUserInitials] = useState('DR');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+63 ',
    prcNumber: '',
    specialization: '',
    subSpecialization: '',
    bio: 'Board-certified specialist with years of experience.',
    prcImage: '',
    profileImage: '',
    addressLine1: '',
    addressLine2: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    zipCode: '',
  });

  const [services, setServices] = useState({
    feeInitialWithoutCert: 0,
    feeInitialWithCert: 0,
    feeFollowUpWithoutCert: 0,
    feeFollowUpWithCert: 0,
  });

  const [accountDetails, setAccountDetails] = useState({
    accountType: 'bank',
    accountName: 'John Doe',
    accountNumber: 'XXXX-XXXX-XXXX-1234',
    gcashNumber: '+63 ',
    gcashQr: '',
  });

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [schedules, setSchedules] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    time: '',
    duration: '30',
    notes: '',
  });

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketFilter, setTicketFilter] = useState('All');
  const [patientChatDraft, setPatientChatDraft] = useState('');
  const [patientChatThreads, setPatientChatThreads] = useState({});

  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingService, setEditingService] = useState({ name: '', fee: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    consultationType: 'initial',
    includesCertificate: false,
    isDiscounted: false,
  });

  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);

  const [callState, setCallState] = useState({
    isOpen: false,
    callType: 'audio',
    patient: null,
  });

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [encounter, setEncounter] = useState(createDefaultEncounter());

  const [medForm, setMedForm] = useState(null);

  const [labForm, setLabForm] = useState(null);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [labCustomTestName, setLabCustomTestName] = useState('');
  const [labInstructions, setLabInstructions] = useState('');
  const [certificateForm, setCertificateForm] = useState({
    diagnosisReason: '',
    dateIssued: new Date().toISOString().slice(0, 10),
    restStartDate: new Date().toISOString().slice(0, 10),
    restEndDate: '',
    additionalRemarks: '',
  });

  const [mhRequests, setMhRequests] = useState([]);
  const [selectedMedicalEntry, setSelectedMedicalEntry] = useState(null);
  const [soapModalType, setSoapModalType] = useState(null);
  const [soapModalValue, setSoapModalValue] = useState('');
  const [soapModalIcdCode, setSoapModalIcdCode] = useState('');

  const [centerTab, setCenterTab] = useState('medicine');

  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    pendingConsultations: 0,
    completedToday: 0,
    upcomingAppointments: 0,
  });
  const patientChatMessagesRef = useRef(null);
  const soapPanelRef = useRef(null);

  const createPatientChatMessages = useCallback((ticket) => {
    const patientName = ticket?.patientFullName || ticket?.patient || 'the patient';
    const startedAt =
      ticket?.consultationStartedAt ||
      ticket?.startedAt ||
      ticket?.createdAt ||
      '';
    const startedTime = startedAt
      ? new Date(startedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '16:50';

    return [
      {
        id: `${ticket?.id || 'ticket'}-system`,
        sender: 'system',
        text: `Started consultation with ${patientName}`,
        subtext: startedTime,
        timestamp: startedTime,
      },
    ];
  }, []);

  const loadTicketsData = useCallback(async () => {
    console.log('[SpecialistDashboard] Loading tickets from API...');
    try {
      const [activeResponse, availableResponse] = await Promise.all([
        specialistApi.fetchMyActiveTickets().catch((e) => {
          console.error('Error fetching active tickets:', e);
          return { success: false, activeTickets: [] };
        }),
        specialistApi.fetchAvailableTickets().catch((e) => {
          console.error('Error fetching available tickets:', e);
          return { success: false, data: [] };
        }),
      ]);

      let allMappedTickets = [];

      const formatPatientName = (p) => {
        if (!p) return 'Unknown';
        const fName = p.firstName || '';
        const lName = p.lastName || '';
        if (!fName && !lName) return p.patientName || 'Unknown';
        const lastInitial = lName ? ` ${lName.charAt(0)}.` : '';
        return `${fName}${lastInitial}`;
      };

      const mapDbTicketToDashboard = (ticket) => ({
        ...ticket,
        id: ticket.id,
        patient: ticket.patientName
          ? ticket.patientName
          : ticket.patient
            ? formatPatientName(ticket.patient)
            : 'Walk-in Patient',
        patientFullName:
          ticket.patientName ||
          (ticket.patient
            ? `${ticket.patient.firstName || ''} ${ticket.patient.lastName || ''}`.trim()
            : '') ||
          'Walk-in Patient',
        service: ticket.clinicalChiefComplaint || ticket.chiefComplaint || 'Consultation',
        chiefComplaint: ticket.chiefComplaint || '',
        clinicalChiefComplaint: ticket.clinicalChiefComplaint || '',
        patientSubmittedConcern: ticket.patientSubmittedConcern || ticket.submittedConcern || '',
        submittedConcern: ticket.submittedConcern || ticket.patientSubmittedConcern || '',
        symptoms: ticket.symptoms || '',
        medicalHistory: buildMedicalHistoryForSpecialist(ticket),
        triageMedicalHistory: ticket.triageMedicalHistory || '',
        additionalRemarks: ticket.additionalRemarks || '',
        triageNotes: buildTriageNotes(ticket) || ticket.nurseRemarks || '',
        bloodPressure: ticket.bloodPressure || '',
        heartRate: ticket.heartRate || '',
        temperature: ticket.temperature || '',
        oxygenSaturation: ticket.oxygenSaturation || '',
        selectedPainAreas: ticket.selectedPainAreas || ticket.painAreas || [],
        painMapView: ticket.painMapView || 'front',
        selectedSymptomPills: ticket.selectedSymptomPills || [],
        selectedRosItems: ticket.selectedRosItems || [],
        durationValue: ticket.durationValue || '',
        durationUnit: ticket.durationUnit || '',
        severity: ticket.severity || '',
        urgencyLevel: ticket.urgencyLevel || ticket.urgency || '',
        transferReason: ticket.transferReason || '',
        preferredDate: ticket.preferredDate,
        preferredTime: ticket.preferredTime,
        consultationChannel: ticket.consultationChannel,
        barangay: ticket.barangay,
        patientBirthdate: ticket.patientBirthdate || '',
        gender: ticket.patientGender || '',
        mobile: ticket.mobile || ticket.patientMobile || '',
        email: ticket.email || ticket.patientEmail || '',
        when:
          ticket.preferredDate && ticket.preferredTime
            ? `${new Date(ticket.preferredDate).toLocaleDateString()} ${ticket.preferredTime}`
            : ticket.createdAt
              ? new Date(ticket.createdAt).toLocaleString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'TBD',
        status:
          ticket.status === 'confirmed'
            ? 'Awaiting'
            : ticket.status === 'active'
              ? 'In Consultation'
              : ticket.status === 'completed'
                ? 'Completed'
                : ticket.status === 'processing'
                  ? 'Triage Complete'
                  : ticket.status || 'Awaiting',
        rawTicket: ticket,
      });

      if (activeResponse.success && activeResponse.activeTickets) {
        console.log(
          `[SpecialistDashboard] Loaded ${activeResponse.activeTickets.length} active tickets from API`,
        );
        const mappedActive = activeResponse.activeTickets.map((t) => ({
          ...t,
          id: t.id,
          patient: formatPatientName(t.rawTicket?.patient || t),
          patientFullName: t.patientName || t.rawTicket?.patientName || 'Walk-in Patient',
          service: t.clinicalChiefComplaint || t.chiefComplaint || 'Consultation',
          chiefComplaint: t.chiefComplaint || '',
          clinicalChiefComplaint: t.clinicalChiefComplaint || '',
          patientSubmittedConcern: t.patientSubmittedConcern || t.submittedConcern || '',
          submittedConcern: t.submittedConcern || t.patientSubmittedConcern || '',
          symptoms: t.symptoms || '',
          medicalHistory: buildMedicalHistoryForSpecialist(t.rawTicket || t),
          triageMedicalHistory: t.triageMedicalHistory || t.rawTicket?.triageMedicalHistory || '',
          additionalRemarks: t.additionalRemarks || t.rawTicket?.additionalRemarks || '',
          triageNotes: buildTriageNotes(t.rawTicket || t) || t.nurseRemarks || '',
          bloodPressure: t.rawTicket?.bloodPressure || '',
          heartRate: t.rawTicket?.heartRate || '',
          temperature: t.rawTicket?.temperature || '',
          oxygenSaturation: t.rawTicket?.oxygenSaturation || '',
          selectedPainAreas: t.rawTicket?.selectedPainAreas || t.rawTicket?.painAreas || [],
          painMapView: t.rawTicket?.painMapView || 'front',
          selectedSymptomPills:
            t.selectedSymptomPills || t.rawTicket?.selectedSymptomPills || [],
          selectedRosItems: t.selectedRosItems || t.rawTicket?.selectedRosItems || [],
          durationValue: t.durationValue || t.rawTicket?.durationValue || '',
          durationUnit: t.durationUnit || t.rawTicket?.durationUnit || '',
          severity: t.severity || t.rawTicket?.severity || '',
          urgencyLevel: t.urgencyLevel || t.rawTicket?.urgencyLevel || t.urgency || '',
          transferReason: t.transferReason || t.rawTicket?.transferReason || '',
          preferredDate: t.preferredDate,
          preferredTime: t.preferredTime,
          consultationChannel: t.consultationChannel,
          barangay: t.barangay,
          patientBirthdate: t.patientBirthdate || t.rawTicket?.patientBirthdate || '',
          gender: t.patientGender || t.rawTicket?.patientGender || '',
          mobile: t.mobile || t.patientMobile || t.rawTicket?.patientMobile || '',
          email: t.email || t.patientEmail || t.rawTicket?.patientEmail || '',
          when:
            t.preferredDate && t.preferredTime
              ? `${new Date(t.preferredDate).toLocaleDateString()} ${t.preferredTime}`
              : t.createdAt
                ? new Date(t.createdAt).toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : 'TBD',
          status:
            t.status === 'confirmed'
              ? 'Awaiting'
              : t.status === 'active'
                ? 'In Consultation'
                : t.status === 'completed'
                  ? 'Completed'
                  : t.status === 'processing'
                    ? 'Triage Complete'
                    : t.status,
          rawTicket: t.rawTicket || t,
        }));
        allMappedTickets = [...allMappedTickets, ...mappedActive];
      }

      if (availableResponse.success && availableResponse.data) {
        console.log(
          `[SpecialistDashboard] Loaded ${availableResponse.data.length} available tickets from API`,
        );
        const mappedAvailable = availableResponse.data.map((t) => ({
          ...t,
          id: t.id,
          patient: t.patientName || formatPatientName(t.patient || t),
          patientFullName:
            t.patientName ||
            (t.patient
              ? `${t.patient.firstName || ''} ${t.patient.lastName || ''}`.trim()
              : '') ||
            'Walk-in Patient',
          service: t.clinicalChiefComplaint || t.chiefComplaint || 'Consultation',
          chiefComplaint: t.chiefComplaint || '',
          clinicalChiefComplaint: t.clinicalChiefComplaint || '',
          patientSubmittedConcern: t.patientSubmittedConcern || t.submittedConcern || '',
          submittedConcern: t.submittedConcern || t.patientSubmittedConcern || '',
          symptoms: t.symptoms || '',
          medicalHistory: buildMedicalHistoryForSpecialist(t),
          triageMedicalHistory: t.triageMedicalHistory || '',
          additionalRemarks: t.additionalRemarks || '',
          triageNotes: buildTriageNotes(t) || t.nurseRemarks || '',
          bloodPressure: t.bloodPressure || '',
          heartRate: t.heartRate || '',
          temperature: t.temperature || '',
          oxygenSaturation: t.oxygenSaturation || '',
          selectedPainAreas: t.selectedPainAreas || t.painAreas || [],
          painMapView: t.painMapView || 'front',
          selectedSymptomPills: t.selectedSymptomPills || [],
          selectedRosItems: t.selectedRosItems || [],
          durationValue: t.durationValue || '',
          durationUnit: t.durationUnit || '',
          severity: t.severity || '',
          urgencyLevel: t.urgencyLevel || t.urgency || '',
          transferReason: t.transferReason || '',
          preferredDate: t.preferredDate,
          preferredTime: t.preferredTime,
          consultationChannel: t.consultationChannel,
          barangay: t.barangay,
          patientBirthdate: t.patientBirthdate || t.rawTicket?.patientBirthdate || '',
          gender: t.patientGender || t.rawTicket?.patientGender || '',
          mobile: t.mobile || t.patientMobile || t.rawTicket?.patientMobile || '',
          email: t.email || t.patientEmail || t.rawTicket?.patientEmail || '',
          when:
            t.preferredDate && t.preferredTime
              ? `${new Date(t.preferredDate).toLocaleDateString()} ${t.preferredTime}`
              : t.createdAt
                ? new Date(t.createdAt).toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : 'TBD',
          status: 'Available',
          rawTicket: t,
        }));
        allMappedTickets = [...allMappedTickets, ...mappedAvailable];
      }

      try {
        const conversations = await fetchChatConversations();
        const conversationTickets = Array.isArray(conversations)
          ? conversations
              .filter((conversation) => conversation?.id)
              .filter(
                (conversation) =>
                  !allMappedTickets.some(
                    (ticket) => String(ticket.id) === String(conversation.id),
                  ),
              )
          : [];

        if (conversationTickets.length > 0) {
          const mappedConversationTickets = await Promise.all(
            conversationTickets.map(async (conversation) => {
              try {
                const fullTicket = await specialistApi.fetchTicket(conversation.id);
                if (fullTicket) {
                  return mapDbTicketToDashboard(fullTicket);
                }
              } catch (error) {
                console.warn(
                  '[SpecialistDashboard] Could not fetch ticket from conversation:',
                  conversation.id,
                  error,
                );
              }

              const fallbackTicket = {
                ...(conversation.ticket || {}),
                id: conversation.id,
                ticketNumber: conversation.ticketNumber,
                patientName:
                  conversation.ticket?.patientName ||
                  (conversation.name || '').split(' - ').slice(1).join(' - ') ||
                  'Walk-in Patient',
                status: conversation.ticket?.status || 'confirmed',
              };
              return mapDbTicketToDashboard(fallbackTicket);
            }),
          );

          allMappedTickets = [
            ...allMappedTickets,
            ...mappedConversationTickets.filter(Boolean),
          ];
        }
      } catch (conversationError) {
        console.warn(
          '[SpecialistDashboard] Failed to load tickets from chat conversations:',
          conversationError,
        );
      }

      if (
        allMappedTickets.length > 0 ||
        activeResponse.success ||
        availableResponse.success
      ) {
        setTickets(allMappedTickets);
        setApiError(null);
        saveTickets(allMappedTickets);
        return;
      } else {
        console.warn(
          '[SpecialistDashboard] API response missing activeTickets array:',
          activeResponse,
        );
      }
    } catch (error) {
      console.error(
        '[SpecialistDashboard] Failed to fetch tickets from API:',
        error,
      );
      setApiError('Could not connect to server. Using offline data.');
    }

    const savedTickets = loadTickets();
    console.log(
      `[SpecialistDashboard] Loaded ${savedTickets.length} tickets from localStorage`,
    );
    if (savedTickets.length === 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const plusDays = (n) =>
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

      const defaultTickets = [
        {
          id: 'TKT-001',
          patient: 'John Doe',
          service: 'Consultation',
          when: formatDateLabel(plusDays(0), '10:30 AM'),
          status: 'Confirmed',
        },
        {
          id: 'TKT-002',
          patient: 'Jane Smith',
          service: 'Medical Certificate',
          when: formatDateLabel(plusDays(1), '2:15 PM'),
          status: 'Pending',
        },
        {
          id: 'TKT-003',
          patient: 'Robert Johnson',
          service: 'Medical Clearance',
          when: formatDateLabel(plusDays(2), '9:00 AM'),
          status: 'Confirmed',
        },
      ];

      setTickets(defaultTickets);
      saveTickets(defaultTickets);
    } else {
      setTickets(savedTickets);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await specialistApi.fetchDashboard();
      console.log('[SpecialistDashboard] Dashboard response:', response);
      if (response.success) {
        setDashboardStats((prev) => response.stats || prev);
        if (response.specialist) {
          setProfileData((prev) => ({
            ...prev,
            firstName: response.specialist.firstName || prev.firstName,
            lastName: response.specialist.lastName || prev.lastName,
            email: response.specialist.email || prev.email,
            specialization:
              response.specialist.specialization || prev.specialization,
            subSpecialization:
              response.specialist.subSpecialization || prev.subSpecialization,
            profileUrl: response.specialist.profileUrl || prev.profileUrl,
            prcNumber: response.specialist.prcNumber || prev.prcNumber,
            addressLine1: response.specialist.addressLine1 || prev.addressLine1,
            addressLine2: response.specialist.addressLine2 || prev.addressLine2,
            barangay: response.specialist.barangay || prev.barangay,
            city: response.specialist.city || prev.city,
            province: response.specialist.province || prev.province,
            region: response.specialist.region || prev.region,
            zipCode: response.specialist.zipCode || prev.zipCode,
          }));

          setCurrentUser((prev) => ({
            ...prev,
            firstName: response.specialist.firstName || prev?.firstName,
            lastName: response.specialist.lastName || prev?.lastName,
            email: response.specialist.email || prev?.email,
            specialization:
              response.specialist.specialization || prev?.specialization,
            profileUrl: response.specialist.profileUrl || prev?.profileUrl,
          }));

          const initials = generateUserInitials(
            response.specialist.firstName,
            response.specialist.lastName,
          );
          setUserInitials(initials);
        }
      }

      try {
        const profileResponse = await specialistApi.fetchProfile();
        console.log(
          '[SpecialistDashboard] Profile fetch success:',
          profileResponse,
        );

        if (profileResponse) {
          setProfileData((prev) => ({
            ...prev,
            firstName: profileResponse.firstName || prev.firstName,
            lastName: profileResponse.lastName || prev.lastName,
            email: profileResponse.email || prev.email,
            phone:
              profileResponse.phone ||
              profileResponse.mobileNumber ||
              prev.phone,
            prcNumber: profileResponse.prcNumber || prev.prcNumber,
            specialization:
              profileResponse.specialization || prev.specialization,
            subSpecialization:
              profileResponse.subSpecialization || prev.subSpecialization,
            bio: profileResponse.bio || prev.bio,
            prcImage: profileResponse.prcImage || prev.prcImage,
            profileUrl: profileResponse.profileUrl || prev.profileUrl,
            addressLine1: profileResponse.addressLine1 || prev.addressLine1,
            addressLine2: profileResponse.addressLine2 || prev.addressLine2,
            barangay: profileResponse.barangay || prev.barangay,
            city: profileResponse.city || prev.city,
            province: profileResponse.province || prev.province,
            region: profileResponse.region || prev.region,
            zipCode: profileResponse.zipCode || prev.zipCode,
          }));

          const fees = {
            feeInitialWithoutCert: profileResponse.feeInitialWithoutCert || 0,
            feeInitialWithCert: profileResponse.feeInitialWithCert || 0,
            feeFollowUpWithoutCert: profileResponse.feeFollowUpWithoutCert || 0,
            feeFollowUpWithCert: profileResponse.feeFollowUpWithCert || 0,
          };
          setServices(fees);
        }
      } catch (profileError) {
        console.warn('Failed to fetch profile from API:', profileError);
      }
    } catch (error) {
      console.warn('Failed to fetch dashboard from API:', error);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add('specialist-dashboard-body');
    const onboardingOverride =
      new URLSearchParams(location.search).get('onboarding') === '1';

    const currentUser = authService.getCurrentUser();

    if (!currentUser || currentUser.userType !== 'specialist') {
      navigate('/specialist-login');
      return;
    }

    if (currentUser.user.applicationStatus === 'pending' && !onboardingOverride) {
      navigate('/specialist-pending');
      return;
    } else if (currentUser.user.applicationStatus === 'denied') {
      navigate('/specialist-denied');
      return;
    }

    setCurrentUser(currentUser.user);
    setIsLoading(false);

    if (onboardingOverride) {
      window.history.replaceState(null, '', '/specialist-dashboard');
    }

    const initials = generateUserInitials(
      currentUser.user.firstName || currentUser.user.fName,
      currentUser.user.lastName || currentUser.user.lName,
    );
    setUserInitials(initials);

    const profile = loadProfileData(currentUser.user.email);
    setProfileData((prev) => ({
      ...prev,
      firstName: currentUser.user.firstName || currentUser.user.fName || '',
      lastName: currentUser.user.lastName || currentUser.user.lName || '',
      email: currentUser.user.email,
      phone: profile.phone || currentUser.user.phone || '+63 ',
      prcNumber: profile.prcNumber || currentUser.user.licenseNumber || '',
      specialization:
        profile.specialization || currentUser.user.specialty || '',
      subSpecialization: profile.subSpecialization || '',
      bio: profile.bio || '',
      prcImage: profile.prcImage || '',
      profileImage: profile.profileImage || '',
      addressLine1: profile.addressLine1 || '',
      addressLine2: profile.addressLine2 || '',
      barangay: profile.barangay || '',
      city: profile.city || '',
      province: profile.province || '',
      region: profile.region || '',
      zipCode: profile.zipCode || '',
    }));

    const savedAccount = loadAccountData(currentUser.user.email);
    setAccountDetails((prev) => ({ ...prev, ...savedAccount }));

    const savedSchedules = loadScheduleData(currentUser.user.email);
    setSchedules(savedSchedules);

    loadTicketsData();
    loadDashboardData();

    return () => {
      document.body.classList.remove('specialist-dashboard-body');
    };
  }, [navigate, loadTicketsData, loadDashboardData, location.search]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      console.log(
        '[SpecialistDashboard] Dashboard tab active, reloading tickets...',
      );
      loadTicketsData();
    }
  }, [activeTab, loadTicketsData]);

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadTicketsData();
    }, TICKET_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeTab, loadTicketsData]);

  useEffect(() => {
    if (selectedTicketId) {
      const data = loadEncounterData(selectedTicketId);
      if (data) {
        setEncounter(data);
      } else {
        setEncounter(createDefaultEncounter());
      }
      setMhRequests([]);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    const savedLabRequests = Array.isArray(encounter?.labRequests) ? encounter.labRequests : [];
    setSelectedLabTests(
      savedLabRequests.map((request, index) => {
        const isCustom = request?.test === 'Custom Test';
        const label = isCustom
          ? (request?.customTestName || '').trim() || 'Custom Test'
          : (request?.test || '').trim();

        return {
          id:
            request?.id ||
            `${isCustom ? 'custom' : 'common'}-${label || 'lab'}-${index}`,
          test: request?.test || '',
          customTestName: request?.customTestName || '',
          remarks: request?.remarks || '',
          label,
          isCustom,
        };
      }),
    );
    setLabInstructions(encounter?.labInstructions || '');
  }, [encounter?.labInstructions, encounter?.labRequests]);

  useEffect(() => {
    if (!selectedTicketId) return;

    const activeTicket = tickets.find((ticket) => String(ticket.id) === String(selectedTicketId));
    const today = new Date().toISOString().slice(0, 10);

    setCertificateForm({
      diagnosisReason: activeTicket?.service || activeTicket?.chiefComplaint || '',
      dateIssued: today,
      restStartDate: today,
      restEndDate: '',
      additionalRemarks: '',
    });
  }, [selectedTicketId, tickets]);

  useEffect(() => {
    if (!selectedTicketId) return;

    const selectedTicketForChat = tickets.find(
      (ticket) => String(ticket.id) === String(selectedTicketId),
    );

    setPatientChatThreads((prev) => {
      if (prev[selectedTicketId]) {
        return prev;
      }

      return {
        ...prev,
        [selectedTicketId]: createPatientChatMessages(selectedTicketForChat),
      };
    });

    setPatientChatDraft('');
  }, [selectedTicketId, tickets, createPatientChatMessages]);

  useEffect(() => {
    if (soapPanelRef.current) {
      soapPanelRef.current.scrollTop = 0;
    }
  }, [centerTab]);

  useEffect(() => {
    const messagePanel = patientChatMessagesRef.current;
    if (!messagePanel) return;
    messagePanel.scrollTop = messagePanel.scrollHeight;
  }, [selectedTicketId, patientChatThreads]);

  const handleNavigation = (target, title) => {
    setActiveTab(target);
    if (target === 'dashboard') {
      loadTicketsData();
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await authService.logout();
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
      }
    }
  };

  const handleCloseCall = () => {
    setCallState({
      isOpen: false,
      callType: 'audio',
      patient: null,
    });
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    console.log('saveProfile triggered. Email check:');
    const email = profileData.email;
    console.log('Current Email:', email);
    if (!email) {
      console.warn('saveProfile aborted: No email found in profileData!');
      setApiError('Session missing. Please refresh the page.');
      return;
    }

    console.log('Running validations on:', profileData);
    const validation = validateSpecialistProfile(profileData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      console.warn('Validation failed:', firstError);
      setApiError(firstError);
      return;
    }

    try {
      const updatedProfile = await specialistApi.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        specialization: profileData.specialization,
        subSpecialization: profileData.subSpecialization,
        bio: profileData.bio,
        addressLine1: profileData.addressLine1,
        addressLine2: profileData.addressLine2,
        region: profileData.region,
        province: profileData.province,
        city: profileData.city,
        barangay: profileData.barangay,
        zipCode: profileData.zipCode,
      });

      authService.updateCurrentUser(updatedProfile);
      setApiError(null);

      const user = JSON.parse(localStorage.getItem(email) || '{}');
      user.fName = profileData.firstName || user.fName;
      user.lName = profileData.lastName || user.lName;
      localStorage.setItem(email, JSON.stringify(user));

      const profile = {
        phone: profileData.phone,
        prcNumber: profileData.prcNumber,
        specialization: profileData.specialization,
        subSpecialization: profileData.subSpecialization,
        bio: profileData.bio,
        prcImage: profileData.prcImage,
        profileImage: profileData.profileImage,
        addressLine1: profileData.addressLine1,
        addressLine2: profileData.addressLine2,
        barangay: profileData.barangay,
        city: profileData.city,
        province: profileData.province,
        region: profileData.region,
        zipCode: profileData.zipCode,
      };
      saveProfileData(email, profile);

      setCurrentUser(user);
      const initials = generateUserInitials(user.fName, user.lName);
      setUserInitials(initials);

      setShowSuccessModal(true);
    } catch (error) {
      console.warn('Failed to save profile to API:', error);
      setApiError(
        error.message || 'Could not save to server. Please try again.',
      );
    }
  };

  const openEditServiceModal = (name, fee) => {
    setEditingService({ name, fee });
    setShowEditServiceModal(true);
  };

  const updateServiceFee = async () => {
    const rawFee = parseFloat(editingService.fee);
    if (isNaN(rawFee) || rawFee < 0) {
      alert('Please enter a valid positive number for the fee.');
      return;
    }

    try {
      const updatedServicesTemp = {
        ...services,
        [editingService.name]: rawFee,
      };

      await specialistApi.updateFees(updatedServicesTemp);

      setServices(updatedServicesTemp);
      setShowEditServiceModal(false);

      setShowSuccessModal(true);
    } catch (error) {
      console.warn('Failed to update service fee via API:', error);
      alert(error.message || 'Failed to save fees. Please try again.');
    }
  };

  const saveAccountDetails = async () => {
    const validation = validateAccountDetails(accountDetails);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    try {
      await specialistApi.updatePaymentAccount(accountDetails);
    } catch (error) {
      console.warn('Failed to update payment account via API:', error);
    }

    const email = getCurrentUserEmail();
    saveAccountData(email, accountDetails);
    alert('Account details saved.');
  };

  const viewTicket = async (ticketId) => {
    try {
      const ticket = await specialistApi.fetchTicket(ticketId);
      if (ticket) {
        const mapped = {
          id: ticket.id,
          patient: ticket.patientName
            ? ticket.patientName
            : ticket.patient
            ? `${ticket.patient.firstName || ''} ${ticket.patient.lastName ? ticket.patient.lastName.charAt(0) + '.' : ''}`
            : 'Walk-in Patient',
          patientFullName: ticket.patientName
            ? ticket.patientName
            : ticket.patient
            ? `${ticket.patient.firstName || ''} ${ticket.patient.lastName || ''}`.trim()
            : 'Walk-in Patient',
          service: ticket.clinicalChiefComplaint || ticket.chiefComplaint || 'Consultation',
          chiefComplaint: ticket.chiefComplaint,
          clinicalChiefComplaint: ticket.clinicalChiefComplaint || '',
          patientSubmittedConcern: ticket.patientSubmittedConcern || ticket.submittedConcern || '',
          submittedConcern: ticket.submittedConcern || ticket.patientSubmittedConcern || '',
          symptoms: ticket.symptoms || '',
          medicalHistory: buildMedicalHistoryForSpecialist(ticket),
          triageMedicalHistory: ticket.triageMedicalHistory || '',
          additionalRemarks: ticket.additionalRemarks || '',
          triageNotes: buildTriageNotes(ticket) || ticket.nurseRemarks || '',
          bloodPressure: ticket.bloodPressure || '',
          heartRate: ticket.heartRate || '',
          temperature: ticket.temperature || '',
          oxygenSaturation: ticket.oxygenSaturation || '',
          selectedPainAreas: ticket.selectedPainAreas || ticket.painAreas || [],
          painMapView: ticket.painMapView || 'front',
          selectedSymptomPills: ticket.selectedSymptomPills || [],
          selectedRosItems: ticket.selectedRosItems || [],
          durationValue: ticket.durationValue || '',
          durationUnit: ticket.durationUnit || '',
          severity: ticket.severity || '',
          urgencyLevel: ticket.urgencyLevel || ticket.urgency || '',
          transferReason: ticket.transferReason || '',
          preferredDate: ticket.preferredDate,
          preferredTime: ticket.preferredTime,
          consultationChannel: ticket.consultationChannel,
          barangay: ticket.barangay,
          patientBirthdate: ticket.patientBirthdate || '',
          gender: ticket.patientGender || '',
          mobile: ticket.mobile || ticket.patientMobile || '',
          email: ticket.email || ticket.patientEmail || '',
          when:
            ticket.preferredDate && ticket.preferredTime
              ? `${new Date(ticket.preferredDate).toLocaleDateString()} ${ticket.preferredTime}`
              : ticket.createdAt
                ? new Date(ticket.createdAt).toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : 'TBD',
          status:
            ticket.status === 'confirmed'
              ? 'Awaiting'
              : ticket.status === 'active'
                ? 'In Progress'
                : ticket.status === 'completed'
                  ? 'Completed'
                  : ticket.status === 'processing'
                    ? 'Triage Complete'
                    : ticket.status,
          rawTicket: ticket,
        };
        setSelectedTicket(mapped);
        setShowTicketModal(true);
        return;
      }
    } catch (error) {
      console.warn('Failed to fetch ticket from API:', error);
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setShowTicketModal(true);
    }
  };

  const updateTicketStatus = async (newStatus) => {
    if (!selectedTicketId) return;

    try {
      await specialistApi.updateTicket(selectedTicketId, {
        status: newStatus,
      });
      await loadTicketsData();
    } catch (error) {
      console.warn('Failed to update ticket via API:', error);
    }
  };

  const handleStartConsultation = async () => {
    if (!selectedTicketId) return;
    try {
      setIsLoading(true);
      await specialistApi.startConsultation(selectedTicketId);
      alert('Consultation started!');
      await loadTicketsData();
    } catch (error) {
      console.error('Failed to start consultation:', error);
      alert(error.message || 'Failed to start consultation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!selectedTicketId) return;
    try {
      setIsLoading(true);
      await specialistApi.completeConsultation({
        ticketId: selectedTicketId,
        subjective: encounter.subjective,
        objective: encounter.objective,
        assessment: encounter.assessment,
        plan: encounter.plan,
        icd10Code: encounter.icd10,
      });
      alert('Consultation completed!');
      setSelectedTicketId(null);
      await loadTicketsData();
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to complete consultation:', error);
      alert(error.message || 'Failed to complete consultation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientChatSend = async (e) => {
    e.preventDefault();

    const trimmedMessage = patientChatDraft.trim();
    if (!trimmedMessage || !selectedTicketId) return;
    const activeTicket = tickets.find(
      (ticket) => String(ticket.id) === String(selectedTicketId),
    );

    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender: 'specialist',
      message: trimmedMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setPatientChatThreads((prev) => ({
      ...prev,
      [selectedTicketId]: [
        ...(prev[selectedTicketId] ||
          createPatientChatMessages(activeTicket)),
        newMessage,
      ],
    }));
    setPatientChatDraft('');

    // TODO: wire up real message sending API call when available.
    // await specialistApi.sendMessageToPatient(selectedTicketId, trimmedMessage);
  };

  const handleCropComplete = async (croppedFile) => {
    setCropperModalOpen(false);
    setSelectedImageSrc(null);
    try {
      const formData = new FormData();
      formData.append('photo', croppedFile);
      const response = await specialistApi.uploadProfilePicture(formData);

      const newUrl = `${response.profileUrl}?t=${new Date().getTime()}`;
      handleProfileChange('profileUrl', newUrl);
      setCurrentUser((prev) => ({ ...prev, profileUrl: newUrl }));
      alert('Profile picture uploaded successfully!');
    } catch (error) {
      alert(error.message || 'Failed to upload profile picture.');
    }
  };

  const handleCropCancel = () => {
    setCropperModalOpen(false);
    setSelectedImageSrc(null);
  };

  React.useEffect(() => {
    if (activeTab === 'profile' && profileData.region && regions.length > 0) {
      const region = regions.find((r) => r.name === profileData.region);
      if (region) fetchProvinces(region.code);
    }
  }, [activeTab, profileData.region, regions, fetchProvinces]);

  React.useEffect(() => {
    if (
      activeTab === 'profile' &&
      profileData.province &&
      provinces.length > 0
    ) {
      const province = provinces.find((p) => p.name === profileData.province);
      if (province) fetchCities(province.code);
    }
  }, [activeTab, profileData.province, provinces, fetchCities]);

  React.useEffect(() => {
    if (activeTab === 'profile' && profileData.city && cities.length > 0) {
      const city = cities.find((c) => c.name === profileData.city);
      if (city) fetchBarangays(city.code);
    }
  }, [activeTab, profileData.city, cities, fetchBarangays]);

  const saveEncounter = async (updated) => {
    const next = { ...encounter, ...(updated || {}) };
    setEncounter(next);
    if (selectedTicketId) {
      saveEncounterData(selectedTicketId, next);

      try {
        await specialistApi.updateEMR({
          ticketId: selectedTicketId,
          subjective: next.subjective || '',
          objective: next.objective || '',
          assessment: next.assessment || '',
          plan: next.plan || '',
          icd10Code: next.icd10 || '',
        });

        const assessment = next.assessment || '';
        const prescription = JSON.stringify(next.medicines || []);
        const laboratoryRequest = JSON.stringify(next.labRequests || []);

        await specialistApi.updateTicketConsultation(selectedTicketId, {
          assessment,
          prescription,
          laboratoryRequest,
        });
      } catch (error) {
        console.warn('Failed to save consultation data to API:', error);
      }
    }
  };

  const syncLabSelections = (nextSelections, nextInstructions = labInstructions) => {
    setSelectedLabTests(nextSelections);
    saveEncounter({
      labRequests: nextSelections.map((item) => ({
        test: item.test,
        customTestName: item.customTestName || '',
        remarks: item.remarks || '',
      })),
      labInstructions: nextInstructions,
    });
  };

  const toggleCommonLabTest = (testName) => {
    const exists = selectedLabTests.some((item) => !item.isCustom && item.test === testName);
    if (exists) {
      syncLabSelections(selectedLabTests.filter((item) => !(item.test === testName && !item.isCustom)));
      return;
    }

    syncLabSelections([
      ...selectedLabTests,
      {
        id: `common-${testName}`,
        test: testName,
        customTestName: '',
        remarks: '',
        label: testName,
        isCustom: false,
      },
    ]);
  };

  const addCustomLabTest = () => {
    const trimmedName = labCustomTestName.trim();
    if (!trimmedName) return;

    syncLabSelections([
      ...selectedLabTests,
      {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        test: 'Custom Test',
        customTestName: trimmedName,
        remarks: '',
        label: trimmedName,
        isCustom: true,
      },
    ]);
    setLabCustomTestName('');
  };

  const removeSelectedLabTest = (itemId) => {
    syncLabSelections(selectedLabTests.filter((item) => item.id !== itemId));
  };

  const handleLabInstructionsChange = (value) => {
    setLabInstructions(value);
    saveEncounter({
      labInstructions: value,
      labRequests: selectedLabTests.map((item) => ({
        test: item.test,
        customTestName: item.customTestName || '',
        remarks: item.remarks || '',
      })),
    });
  };

  const handleCertificateChange = (field, value) => {
    setCertificateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const printCertificate = () => {
    const activeTicket = tickets.find((ticket) => String(ticket.id) === String(selectedTicketId));
    const patientName = activeTicket?.patientFullName || activeTicket?.patient || 'Patient';
    const clinicName = 'Healthcare Clinic';
    const clinicAddress = '123 Medical Center, Manila, Philippines';
    const clinicPhone = 'Tel: +63 2 1234 5678';
    const doctorName =
      [profileData.firstName, profileData.lastName].filter(Boolean).join(' ').trim() ||
      currentUser?.user?.name ||
      'Attending Physician';
    const licenseNumber = profileData.prcNumber || currentUser?.user?.licenseNumber || '';

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const centerX = pageWidth / 2;
    let y = 24;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('MEDICAL CERTIFICATE', centerX, y, { align: 'center' });

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(clinicName, centerX, y, { align: 'center' });
    y += 6;
    doc.text(clinicAddress, centerX, y, { align: 'center' });
    y += 6;
    doc.text(clinicPhone, centerX, y, { align: 'center' });

    y += 14;
    doc.setFontSize(11);
    doc.text(`Date Issued: ${formatShortDisplayDate(certificateForm.dateIssued)}`, margin, y);
    y += 12;
    doc.text('This is to certify that:', margin, y);
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(patientName, centerX, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('was examined and treated at this clinic and is diagnosed with:', margin, y, {
      maxWidth: pageWidth - margin * 2,
    });

    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(certificateForm.diagnosisReason || '________________', centerX, y, {
      align: 'center',
    });

    y += 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(
      `Rest period: ${formatShortDisplayDate(certificateForm.restStartDate) || '____/__/____'} to ${
        formatShortDisplayDate(certificateForm.restEndDate) || '____/__/____'
      }`,
      margin,
      y,
      { maxWidth: pageWidth - margin * 2 },
    );

    y += 12;
    if (certificateForm.additionalRemarks) {
      doc.text(`Remarks: ${certificateForm.additionalRemarks}`, margin, y, {
        maxWidth: pageWidth - margin * 2,
      });
      y += 14;
    }

    y = Math.max(y, 235);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('________________', pageWidth - margin, y, { align: 'right' });
    y += 6;
    doc.text(doctorName || 'Attending Physician', pageWidth - margin, y, { align: 'right' });
    y += 6;
    doc.setFontSize(10);
    doc.text(`License No. ${licenseNumber || '__________'}`, pageWidth - margin, y, {
      align: 'right',
    });

    doc.save(`medical-certificate-${selectedTicketId || 'patient'}.pdf`);
  };

  const openSoapModal = (section) => {
    setSoapModalType(section);
    setSoapModalValue(encounter?.[section] || '');
    setSoapModalIcdCode(encounter?.icd10 || '');
  };

  const closeSoapModal = () => {
    setSoapModalType(null);
    setSoapModalValue('');
    setSoapModalIcdCode('');
  };

  const saveSoapModal = async () => {
    if (!soapModalType) return;

    const payload = { [soapModalType]: soapModalValue };
    if (soapModalType === 'assessment') {
      payload.icd10 = soapModalIcdCode;
    }

    await saveEncounter(payload);
    closeSoapModal();
  };

  const handleGenerateInvoice = async () => {
    if (!selectedTicketId) return;
    try {
      setIsLoading(true);
      await specialistApi.generateInvoice({
        ticketId: selectedTicketId,
        consultationType: invoiceForm.consultationType,
        includesCertificate: invoiceForm.includesCertificate,
        isDiscounted: invoiceForm.isDiscounted,
      });
      alert('Invoice generated and ticket moved to For Payment!');
      setShowInvoiceModal(false);
      setShowTicketModal(false);
      await loadTicketsData();
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert(error.message || 'Failed to generate invoice.');
    } finally {
      setIsLoading(false);
    }
  };

  const addMedicine = () => {
    try {
      const updatedEncounter = addMedicineToEncounter(encounter, medForm);
      setEncounter(updatedEncounter);
      setMedForm(createDefaultMedicineForm());
      saveEncounter({ medicines: updatedEncounter.medicines });
    } catch (error) {
      alert(error.message);
    }
  };

  const removeMedicine = (idx) => {
    const updatedEncounter = removeMedicineFromEncounter(encounter, idx);
    setEncounter(updatedEncounter);
    saveEncounter({ medicines: updatedEncounter.medicines });
  };

  const addLab = () => {
    try {
      const updatedEncounter = addLabRequestToEncounter(encounter, labForm);
      setEncounter(updatedEncounter);
      setLabForm(createDefaultLabForm());
      saveEncounter({ labRequests: updatedEncounter.labRequests });
    } catch (error) {
      alert(error.message);
    }
  };

  const removeLab = (idx) => {
    const updatedEncounter = removeLabRequestFromEncounter(encounter, idx);
    setEncounter(updatedEncounter);
    saveEncounter({ labRequests: updatedEncounter.labRequests });
  };

  const openMedicineDetails = (medicine, index) => {
    setSelectedMedicalEntry({
      type: 'medicine',
      title: 'Prescription',
      data: medicine,
      summary: formatMedicineDisplay(medicine) || 'No summary available',
    });
  };

  const openLabRequestDetails = (labRequest, index) => {
    setSelectedMedicalEntry({
      type: 'lab',
      title: 'Laboratory Request',
      data: labRequest,
      summary: formatLabRequestDisplay(labRequest) || 'No summary available',
    });
  };

  const closeMedicalEntryDetails = () => setSelectedMedicalEntry(null);

  const requestPatientRecords = () => {
    if (!selectedTicketId) {
      alert('Please select a patient ticket first.');
      return;
    }

    try {
      const item = createMedicalHistoryRequest({
        reason: 'Medical records requested by specialist',
        from: '',
        to: '',
        consent: true,
      });
      const list = mhRequests.concat([item]);
      saveMedicalHistoryData(selectedTicketId, list);
      setMhRequests(list);
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredTickets = useMemo(() => {
    return filterTicketsByStatus(tickets, ticketFilter);
  }, [tickets, ticketFilter]);

  const addSchedule = async () => {
    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }

    const validation = validateScheduleData(scheduleData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const email = getCurrentUserEmail();
    const dateKey = formatDateKey(currentYear, currentMonth, selectedDate);
    const newSchedule = {
      time: scheduleData.time,
      duration: parseInt(scheduleData.duration),
      notes: scheduleData.notes || 'Available for consultation',
      id: Date.now(),
    };

    try {
      await specialistApi.updateSchedule({
        date: dateKey,
        time: scheduleData.time,
        duration: parseInt(scheduleData.duration),
        notes: scheduleData.notes || 'Available for consultation',
        isAvailable: true,
      });
    } catch (error) {
      console.warn('Failed to save schedule via API:', error);
    }

    const updatedSchedules = {
      ...schedules,
      [dateKey]: [...(schedules[dateKey] || []), newSchedule],
    };

    setSchedules(updatedSchedules);
    saveScheduleData(email, updatedSchedules);

    setShowScheduleModal(false);
    setSelectedDate(null);
    setScheduleData({ time: '', duration: '30', notes: '' });
  };

  const deleteSchedule = async (dateKey, scheduleId) => {
    try {
      await specialistApi.deleteSchedule(scheduleId);
    } catch (error) {
      console.warn('Failed to delete schedule via API:', error);
    }

    const email = getCurrentUserEmail();
    const updatedSchedules = {
      ...schedules,
      [dateKey]: schedules[dateKey].filter((s) => s.id !== scheduleId),
    };

    if (updatedSchedules[dateKey].length === 0) {
      delete updatedSchedules[dateKey];
    }

    setSchedules(updatedSchedules);
    saveScheduleData(email, updatedSchedules);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className='calendar-day empty'></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentYear, currentMonth, day);
      const hasSchedule = schedules[dateKey] && schedules[dateKey].length > 0;

      const dayTickets = tickets.filter((ticket) => {
        if (ticket.status !== 'Confirmed') return false;

        const parsedDate = parseTicketDate(ticket.when);
        if (!parsedDate) return false;

        return (
          parsedDate.year === currentYear &&
          parsedDate.month === currentMonth &&
          parsedDate.day === day
        );
      });

      const hasTickets = dayTickets.length > 0;
      const totalItems = (schedules[dateKey]?.length || 0) + dayTickets.length;

      const isTodayDate = isToday(currentYear, currentMonth, day);
      const isPast = isPastDate(currentYear, currentMonth, day);

      days.push(
        <div
          key={day}
          className={`calendar-day ${
            hasSchedule || hasTickets ? 'has-schedule' : ''
          } ${isTodayDate ? 'today' : ''} ${isPast ? 'past' : ''} ${
            hasTickets ? 'has-tickets' : ''
          }`}
          onClick={() => !isPast && setSelectedDate(day)}
        >
          <span className='day-number'>{day}</span>
          {totalItems > 0 && (
            <div className='schedule-indicator'>{totalItems}</div>
          )}
          {hasTickets && <div className='ticket-indicator'>T</div>}
        </div>,
      );
    }

    return days;
  };

  const renderSchedules = () => (
    <div className='dashboard-content schedule-page'>
      <div className='schedule-container'>
        <div className='schedule-layout'>
          <div className='calendar-main'>
            <div className='calendar-header'>
              <button
                className='calendar-nav'
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
              >
                ‹
              </button>
              <h2>
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <button
                className='calendar-nav'
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
              >
                ›
              </button>
            </div>

            <div className='calendar-container'>
              <div className='calendar'>
                <div className='calendar-weekdays'>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (day) => (
                      <div key={day} className='weekday'>
                        {day}
                      </div>
                    ),
                  )}
                </div>
                <div className='calendar-days'>{renderCalendar()}</div>
              </div>
            </div>
          </div>

          {selectedDate && (
            <div className='selected-date-panel'>
              <h3>
                {getMonthName(currentMonth)} {selectedDate}, {currentYear}
              </h3>
              <button
                className='btn-primary'
                onClick={() => setShowScheduleModal(true)}
              >
                Add Schedule
              </button>

              <div className='day-schedules'>
                {(() => {
                  const dayTickets = tickets.filter((ticket) => {
                    if (ticket.status !== 'Confirmed') return false;

                    const parsedDate = parseTicketDate(ticket.when);
                    if (!parsedDate) return false;

                    return (
                      parsedDate.year === currentYear &&
                      parsedDate.month === currentMonth &&
                      parsedDate.day === selectedDate
                    );
                  });

                  return dayTickets.map((ticket) => {
                    const timeMatch = ticket.when.match(
                      /(\d{1,2}:\d{2}\s*[AP]M)/i,
                    );
                    const ticketTime = timeMatch ? timeMatch[1] : 'Time TBD';

                    return (
                      <div
                        key={`ticket-${ticket.id}`}
                        className='schedule-item ticket-item'
                      >
                        <div className='schedule-time'>{ticketTime}</div>
                        <div className='schedule-duration'>Consultation</div>
                        <div className='schedule-notes'>
                          <strong>Patient:</strong> {ticket.patient}
                          <br />
                          <strong>Service:</strong> {ticket.service}
                        </div>
                        <div className='ticket-badge'>Ticket</div>
                      </div>
                    );
                  });
                })()}

                {schedules[
                  formatDateKey(currentYear, currentMonth, selectedDate)
                ]?.map((schedule) => (
                  <div key={schedule.id} className='schedule-item'>
                    <div className='schedule-time'>{schedule.time}</div>
                    <div className='schedule-duration'>
                      {schedule.duration} mins
                    </div>
                    <div className='schedule-notes'>{schedule.notes}</div>
                    <button
                      className='delete-btn'
                      onClick={() =>
                        deleteSchedule(
                          formatDateKey(
                            currentYear,
                            currentMonth,
                            selectedDate,
                          ),
                          schedule.id,
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}

                {!schedules[
                  formatDateKey(currentYear, currentMonth, selectedDate)
                ]?.length &&
                  !tickets.some((ticket) => {
                    if (ticket.status !== 'Confirmed') return false;
                    const parsedDate = parseTicketDate(ticket.when);
                    if (!parsedDate) return false;
                    return (
                      parsedDate.year === currentYear &&
                      parsedDate.month === currentMonth &&
                      parsedDate.day === selectedDate
                    );
                  }) && <p>No schedules or appointments for this day</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTickets = () => {
    if (filteredTickets.length === 0) {
      return (
        <div style={{ padding: '1rem', color: '#7A7A7A' }}>
          No tickets found.
        </div>
      );
    }

    return filteredTickets.map((ticket) => (
      <div key={ticket.id} className='ticket-row'>
        <div>{ticket.patient}</div>
        <div>{ticket.service}</div>
        <div>{ticket.when}</div>
        <div>
          <span
            className={`status-badge ${getStatusBadgeClass(ticket.status)}`}
          >
            {ticket.status}
          </span>
        </div>
        <div>
          <button className='action-btn' onClick={() => viewTicket(ticket.id)}>
            View
          </button>
        </div>
      </div>
    ));
  };

  const renderDashboard = () => {
    const selectedTicket = tickets.find((x) => String(x.id) === String(selectedTicketId));
    const parsedIcd = parseICDCode(encounter.icd10);
    const chapterData = parsedIcd.chapter ? ICD11_CHAPTERS[parsedIcd.chapter] : null;
    const blockData = chapterData?.blocks?.[parsedIcd.block] || null;
    const categoryData = blockData?.categories?.[parsedIcd.category] || null;
    const selectedCodeValue =
      parsedIcd.subcategory || parsedIcd.category || parsedIcd.block || parsedIcd.chapter || '';
    const selectedCodeLabel = categoryData
      ? `${categoryData.code} - ${categoryData.label}`
      : 'Not selected';

    const formatBirthday = (dateStr) => {
      if (!dateStr) return 'Not provided';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return dateStr;
      }
    };

    const getAgeText = (t) => {
      if (!t) return '';
      if (t.age) return `${t.age} years old`;
      if (t.patientBirthdate) {
        const birth = new Date(t.patientBirthdate);
        const diff = Date.now() - birth.getTime();
        const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        return `${age} years old`;
      }
      return 'Not provided';
    };

    const selectedPatient = selectedTicket || null;
    const selectedPatientAllergies = toStringList(selectedPatient?.allergies);
    const selectedPatientMedicalHistory = toStringList(
      selectedPatient?.medicalHistory,
    );
    const painMapAreas = normalizePainMapAreas(selectedPatient);
    const painMapView = getPainMapView(selectedPatient, painMapAreas);

    const patientStatus = selectedPatient?.status || 'Unknown';
    const patientChatMessages = selectedPatient
      ? patientChatThreads[selectedTicketId] ||
        createPatientChatMessages(selectedPatient)
      : [];
    const isStarterThread =
      patientChatMessages.length === 1 &&
      patientChatMessages[0]?.sender === 'system';

    if (!selectedPatient) {
      return (
        <div className='dashboard-content dashboard-1to1'>
          <div className='assigned-patients-panel'>
            <div className='panel-header'>
              <h3>Assigned Patients</h3>
            </div>

            <div className='status-filter-container'>
              <select
                value={ticketFilter === 'All' ? 'All Tickets' : ticketFilter}
                onChange={(e) =>
                  setTicketFilter(
                    e.target.value === 'All Tickets' ? 'All' : e.target.value,
                  )
                }
                className='input-sm status-filter-dropdown'
              >
                {[
                  'All Tickets',
                  'Available',
                  'Awaiting',
                  'In Consultation',
                  'Completed',
                ].map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className='patient-list'>
              {filteredTickets.length === 0 ? (
                <div className='no-patient-text'>No patients assigned.</div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className='patient-card'
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    <div className='patient-card-header'>
                      <div className='patient-card-title'>
                        {t.patient || 'Unknown'}
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className='patient-card-subtitle'>
                      {t.id} â€¢ {t.service || 'Consultation'}
                    </div>
                    <div className='patient-card-meta'>{t.when}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className='patient-details-panel'>
            <div className='patient-details-empty-state'>
              <div className='patient-details-empty-state__card'>
                <h2>No selected tickets</h2>
                <p>Select a ticket from the left panel to view the patient details, chat, and SOAP notes.</p>
              </div>
            </div>
          </div>

          <div className='soap-panel'>
            <div className='soap-header'>
              <h3>SOAP Notes</h3>
              <p>Document your clinical findings and treatment plan</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='dashboard-content dashboard-1to1'>
        <div className='assigned-patients-panel'>
          <div className='panel-header'>
            <h3>Assigned Patients</h3>
          </div>

          <div className='status-filter-container'>
            <select
              value={ticketFilter === 'All' ? 'All Tickets' : ticketFilter}
              onChange={(e) =>
                setTicketFilter(
                  e.target.value === 'All Tickets' ? 'All' : e.target.value,
                )
              }
              className='input-sm status-filter-dropdown'
            >
              {[
                'All Tickets',
                'Available',
                'Awaiting',
                'In Consultation',
                'Completed',
              ].map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className='patient-list'>
            {filteredTickets.length === 0 ? (
              <div className='no-patient-text'>No patients assigned.</div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  className={`patient-card ${String(selectedTicketId) === String(t.id) ? 'active' : ''}`}
                  onClick={() => setSelectedTicketId(t.id)}
                >
                  <div className='patient-card-header'>
                    <div className='patient-card-title'>
                      {t.patient || 'Unknown'}
                    </div>
                    <span className={`status-badge ${getStatusBadgeClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className='patient-card-subtitle'>
                    {t.id} • {t.service || 'Consultation'}
                  </div>
                  <div className='patient-card-meta'>{t.when}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='patient-details-panel'>
              <div className='patient-details-header'>
                <div>
                  <h2>{selectedPatient.patientFullName || selectedPatient.patient || 'Patient'}</h2>
                  <p className='patient-specialization'>{selectedPatient.service || 'Consultation'}</p>
                </div>
            <button
              className='btn-primary complete-consultation'
              onClick={handleCompleteConsultation}
              disabled={!selectedPatient || patientStatus === 'Completed'}
            >
              {patientStatus === 'Completed' ? 'Completed' : 'Complete Consultation'}
            </button>
          </div>

          <div className='patient-details-scroll'>
          <div className='patient-info-card'>
            <div className='section-title-small'>Patient Information</div>
            <div className='patient-info-grid'>
              <div className='info-item'>
                <span className='info-label'>Age</span>
                <span className='info-value'>
                  {selectedPatient ? getAgeText(selectedPatient) : 'Unknown'}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Gender</span>
                <span className='info-value'>
                  {selectedPatient?.gender || 'Not provided'}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Blood Type</span>
                <span className='info-value'>
                  {selectedPatient?.bloodType || 'Not provided'}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Contact</span>
                <span className='info-value'>
                  {selectedPatient?.mobile || selectedPatient?.contact || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          <div className='info-card'>
            <div className='info-card-title'>Allergies</div>
            <div className='info-card-body'>
              {selectedPatientAllergies.length > 0 ? (
                selectedPatientAllergies.map((a) => (
                  <span key={a} className='pill'>
                    {a}
                  </span>
                ))
              ) : (
                <span className='info-placeholder'>No known allergies</span>
              )}
            </div>
          </div>

          <div className='info-card'>
            <div className='info-card-title'>Medical History</div>
            <div className='info-card-body'>
              {selectedPatientMedicalHistory.length > 0 ? (
                <ul className='history-list'>
                  {selectedPatientMedicalHistory.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <span className='info-placeholder'>No history available</span>
              )}
            </div>
          </div>

          <div className='info-card'>
            <div className='info-card-title'>Triage Notes (From Nurse)</div>
            <div className='info-card-body'>
              {selectedPatient?.triageNotes || 'Vital signs not yet provided.'}
            </div>
          </div>

          <div className='info-card'>
            <div className='info-card-title'>Vital Signs (From Nurse)</div>
            <div className='patient-info-grid'>
              <div className='info-item'>
                <span className='info-label'>Blood Pressure</span>
                <span className='info-value'>{selectedPatient?.bloodPressure || 'N/A'}</span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Heart Rate</span>
                <span className='info-value'>
                  {selectedPatient?.heartRate ? `${selectedPatient.heartRate} bpm` : 'N/A'}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Temperature</span>
                <span className='info-value'>
                  {selectedPatient?.temperature ? `${selectedPatient.temperature} C` : 'N/A'}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Oxygen Saturation</span>
                <span className='info-value'>
                  {selectedPatient?.oxygenSaturation
                    ? `${selectedPatient.oxygenSaturation}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <PainMapSection
            className='specialist-pain-map-section'
            view={painMapView}
            selectedAreas={painMapAreas}
            readOnly
          />

        <div className='soap-panel'>
          <div className='soap-header'>
            <h3>SOAP Notes</h3>
            <p>Document your clinical findings and treatment plan</p>
          </div>
          <div className='soap-card soap-card--subjective'>
            <div className='soap-card-title'>S - Subjective</div>
            <textarea
              value={encounter.subjective || ''}
              readOnly
              onClick={() => openSoapModal('subjective')}
              placeholder='Patient reports experiencing...'
              className='soap-card-textarea soap-card-textarea--display'
              aria-label='Open subjective SOAP editor'
            />
          </div>
          <div className='soap-card soap-card--objective'>
            <div className='soap-card-title'>O - Objective</div>
            <textarea
              value={encounter.objective || ''}
              readOnly
              onClick={() => openSoapModal('objective')}
              placeholder='Physical examination reveals...'
              className='soap-card-textarea soap-card-textarea--display'
              aria-label='Open objective SOAP editor'
            />
          </div>
          <div className='soap-card soap-card--assessment'>
            <div className='soap-card-title'>A - Assessment</div>
            <textarea
              value={encounter.assessment || ''}
              readOnly
              onClick={() => openSoapModal('assessment')}
              placeholder='Diagnosis: ...'
              className='soap-card-textarea soap-card-textarea--display'
              aria-label='Open assessment SOAP editor'
            />
            <div className='soap-card-icd-summary'>
              {!chapterData ? (
                <div className='soap-card-icd-summary__empty'>
                  ICD Codes
                </div>
              ) : (
                <>
                  <div className='soap-card-icd-summary__field'>
                    <span>CHAPTER</span>
                    <div className='soap-card-icd-summary__value'>
                      {chapterData ? `${chapterData.code} - ${chapterData.label}` : 'Not selected'}
                    </div>
                  </div>
                  <div className='soap-card-icd-summary__field'>
                    <span>BLOCK</span>
                    <div className='soap-card-icd-summary__value'>
                      {blockData ? `${blockData.code} - ${blockData.label}` : 'Not selected'}
                    </div>
                  </div>
                  <div className='soap-card-icd-summary__field'>
                    <span>CATEGORY</span>
                    <div className='soap-card-icd-summary__value'>
                      {categoryData ? `${categoryData.code} - ${categoryData.label}` : 'Not selected'}
                    </div>
                  </div>
                  <div className='soap-card-icd-summary__details'>
                    <div className='soap-card-icd-summary__details-label'>Selected Code:</div>
                    <div className='soap-card-icd-summary__details-value'>
                      {selectedCodeValue || 'Not selected'}
                    </div>
                    <div className='soap-card-icd-summary__details-desc'>
                      <strong>Description:</strong>{' '}
                      {categoryData?.description || 'Not selected'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className='soap-card soap-card--plan'>
            <div className='soap-card-title'>P - Plan</div>
            <textarea
              value={encounter.plan || ''}
              readOnly
              onClick={() => openSoapModal('plan')}
              placeholder='Treatment plan includes...'
              className='soap-card-textarea soap-card-textarea--display'
              aria-label='Open plan SOAP editor'
            />
          </div>
          <div className='soap-card medical-records-access-card'>
            <div className='medical-records-header'>
              <div>
                <div className='soap-card-title'>Medical Records Access</div>
                <p className='medical-records-description'>Patient record permissions and shared details.</p>
              </div>
              {mhRequests.length > 0 && (
                <span className='status-pill status-pill--shared'>Shared</span>
              )}
            </div>
            {mhRequests.length === 0 ? (
              <div className='medical-records-empty'>
                <div className='medical-records-icon'>🔒</div>
                <div className='medical-records-empty-text'>
                  No medical records shared yet
                </div>
                <button 
                  className='request-record-btn' 
                  onClick={requestPatientRecords}
                  disabled={profileData.specialization === 'General Practitioner'}
                  title={profileData.specialization === 'General Practitioner' ? 'General practitioners cannot request medical history' : ''}
                >
                  Request Record from Patient
                </button>
                {profileData.specialization === 'General Practitioner' && (
                  <p style={{ color: '#66788d', fontSize: '0.87rem', margin: '8px 0 0 0', textAlign: 'center' }}>
                    General practitioners cannot request patient medical history
                  </p>
                )}
              </div>
            ) : (
              <div className='medical-records-list'>
                {[
                  { label: 'Previous Consultations', icon: '📄' },
                  { label: 'Prescriptions', icon: '💊' },
                  { label: 'Lab Results', icon: '🧪' },
                  { label: 'Treatment Plans', icon: '🩺' },
                ].map((item) => (
                  <div key={item.label} className='medical-records-item'>
                    <span className='medical-records-item-icon'>{item.icon}</span>
                    <span className='medical-records-item-label'>{item.label}</span>
                    <span className='medical-records-item-arrow'>▸</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

          </div>

          <div className='patient-chat-panel'>
            <div className='patient-chat-header'>
              <div className='patient-chat-title-row'>
                <FaRegComment className='patient-chat-title-icon' />
                <div className='patient-chat-title'>Patient Communication</div>
              </div>
            </div>

            <div
              className={`patient-chat-messages ${
                isStarterThread ? 'patient-chat-messages--centered' : ''
              }`}
              ref={patientChatMessagesRef}
            >
              {patientChatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`patient-chat-message ${
                    message.sender === 'system'
                      ? 'patient-chat-message--system'
                      : message.sender === 'specialist'
                      ? 'patient-chat-message--own'
                      : 'patient-chat-message--patient'
                  }`}
                >
                  <div className='patient-chat-bubble'>
                    {message.sender === 'system' ? (
                      <>
                        <p>{message.text}</p>
                        <span>{message.subtext || message.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <p>{message.message}</p>
                        <span>{message.timestamp}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form className='patient-chat-form' onSubmit={handlePatientChatSend}>
              <input
                type='text'
                value={patientChatDraft}
                onChange={(e) => setPatientChatDraft(e.target.value)}
                placeholder='Type a message...'
                className='patient-chat-input'
              />
              <button type='submit' className='patient-chat-send-btn' aria-label='Send message'>
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>

        <div className='soap-panel' ref={soapPanelRef}>
          <div className='clinical-tabs' role='tablist' aria-label='Clinical tools'>
            <button
              type='button'
              className={`clinical-tab ${centerTab === 'medicine' ? 'active' : ''}`}
              onClick={() => setCenterTab('medicine')}
              role='tab'
              aria-selected={centerTab === 'medicine'}
            >
              <FaPrescriptionBottleAlt />
              <span>Prescription</span>
            </button>
            <button
              type='button'
              className={`clinical-tab ${centerTab === 'lab' ? 'active' : ''}`}
              onClick={() => setCenterTab('lab')}
              role='tab'
              aria-selected={centerTab === 'lab'}
            >
              <FaFlask />
              <span>Lab Requests</span>
            </button>
            <button
              type='button'
              className={`clinical-tab ${centerTab === 'certificate' ? 'active' : ''}`}
              onClick={() => setCenterTab('certificate')}
              role='tab'
              aria-selected={centerTab === 'certificate'}
            >
              <FaFileMedical />
              <span>Med Certificate</span>
            </button>
          </div>

          <div className='clinical-content'>
          <div className='info-card' style={{ display: centerTab === 'medicine' ? 'block' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div className='info-card-title' style={{ marginBottom: '2px' }}>Prescription</div>
                <p style={{ color: '#66788d', fontSize: '0.87rem', margin: 0 }}>Add medications for the patient</p>
              </div>
              <button
                onClick={() => setMedForm(createDefaultMedicineForm())}
                style={{
                  background: '#0d6efd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                + Add Medication
              </button>
            </div>

            {encounter?.medicines && encounter.medicines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {encounter.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    role='button'
                    tabIndex={0}
                    onClick={() => openMedicineDetails(med, idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openMedicineDetails(med, idx);
                      }
                    }}
                    style={{
                      border: '1px solid #e2eaf6',
                      borderRadius: '8px',
                      padding: '12px',
                      backgroundColor: '#fbfdff',
                      position: 'relative',
                      cursor: 'pointer',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#111827', fontWeight: '500', fontSize: '0.92rem', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {med.name || 'N/A'}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '2px' }}>
                          {med.dosage || 'N/A'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMedicine(idx);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d32f2f',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          padding: '0',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!medForm && (!encounter?.medicines || encounter.medicines.length === 0) && (
              <div style={{
                textAlign: 'center',
                padding: '24px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}>
                <p style={{ color: '#d17171', margin: '0 0 6px 0', fontSize: '0.95rem' }}>
                  No medications prescribed yet
                </p>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.85rem' }}>
                  Click "Add Medication" to start
                </p>
              </div>
            )}

            {medForm && (
              <div style={{
                border: '1px solid #e2eaf6',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: '#fbfdff',
                marginTop: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ color: '#0b5388', fontWeight: '600', fontSize: '0.95rem' }}>
                    Medication #{(encounter?.medicines?.length || 0) + 1}
                  </div>
                  <button
                    onClick={() => setMedForm(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d32f2f',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0',
                    }}
                  >
                    🗑️
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                      Medication Name
                    </label>
                    <input
                      type='text'
                      value={medForm.name || ''}
                      onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                      placeholder='e.g., Amoxicillin'
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #c7d9ee',
                        backgroundColor: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                      Dosage
                    </label>
                    <input
                      type='text'
                      value={medForm.dosage || ''}
                      onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                      placeholder='e.g., 500mg'
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #c7d9ee',
                        backgroundColor: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                      Frequency
                    </label>
                    <select
                      value={medForm.frequency || ''}
                      onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #c7d9ee',
                        backgroundColor: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value=''>Select frequency</option>
                      <option value='Once daily'>Once daily</option>
                      <option value='Twice daily'>Twice daily</option>
                      <option value='Three times daily'>Three times daily</option>
                      <option value='Four times daily'>Four times daily</option>
                      <option value='Every 4 hours'>Every 4 hours</option>
                      <option value='Every 6 hours'>Every 6 hours</option>
                      <option value='Every 8 hours'>Every 8 hours</option>
                      <option value='Every 12 hours'>Every 12 hours</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                      Duration
                    </label>
                    <input
                      type='text'
                      value={medForm.duration || ''}
                      onChange={(e) => setMedForm({ ...medForm, duration: e.target.value })}
                      placeholder='e.g., 7 days'
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #c7d9ee',
                        backgroundColor: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                    Special Instructions
                  </label>
                  <input
                    type='text'
                    value={medForm.specialInstructions || ''}
                    onChange={(e) => setMedForm({ ...medForm, specialInstructions: e.target.value })}
                    placeholder='e.g., Take with food'
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #c7d9ee',
                      backgroundColor: '#fff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setMedForm(null)}
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMedicine}
                    style={{
                      background: '#0d6efd',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Add Medication
                  </button>
                </div>
              </div>
            )}
          </div>

          {centerTab === 'lab' && (
            <div className='info-card'>
              <div className='lab-request-page'>
                <div className='lab-request-header'>
                  <div className='info-card-title' style={{ marginBottom: '2px' }}>
                    Laboratory Requests
                  </div>
                  <p className='lab-request-subtitle'>Select tests to be performed</p>
                </div>

                <section className='lab-section-card'>
                  <div className='lab-section-title'>
                    <FaFlask />
                    <span>Common Laboratory Tests</span>
                  </div>
                  <div className='lab-tests-grid'>
                    {COMMON_LAB_TESTS.map((testName) => {
                      const checked = selectedLabTests.some(
                        (item) => !item.isCustom && item.test === testName,
                      );

                      return (
                        <label key={testName} className='lab-test-option'>
                          <input
                            type='checkbox'
                            checked={checked}
                            onChange={() => toggleCommonLabTest(testName)}
                          />
                          <span>{testName}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className='lab-section-card'>
                  <div className='lab-section-title'>Add Custom Test</div>
                  <div className='lab-custom-row'>
                    <input
                      type='text'
                      value={labCustomTestName}
                      onChange={(e) => setLabCustomTestName(e.target.value)}
                      placeholder='Enter custom test name'
                      className='lab-custom-input'
                    />
                    <button type='button' className='lab-add-btn' onClick={addCustomLabTest}>
                      + Add
                    </button>
                  </div>
                </section>

                <section className='lab-section-card'>
                  <div className='lab-section-title'>Selected Tests</div>
                  {selectedLabTests.length > 0 ? (
                    <div className='lab-selected-list'>
                      {selectedLabTests.map((item) => (
                        <div key={item.id} className='lab-selected-item'>
                          <span className='lab-selected-label'>{item.label}</span>
                          <button
                            type='button'
                            className='lab-remove-btn'
                            onClick={() => removeSelectedLabTest(item.id)}
                            aria-label={`Remove ${item.label}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='lab-empty-state'>No selected tests yet</div>
                  )}
                </section>

                <section className='lab-section-card lab-instructions-card'>
                  <div className='lab-section-title'>Additional Instructions</div>
                  <textarea
                    value={labInstructions}
                    onChange={(e) => handleLabInstructionsChange(e.target.value)}
                    placeholder='Add any special instructions for the laboratory...'
                  />
                </section>
              </div>
            </div>
          )}

          <div className='info-card' style={{ display: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div className='info-card-title' style={{ marginBottom: '2px' }}>Laboratory Requests</div>
                <p style={{ color: '#66788d', fontSize: '0.87rem', margin: 0 }}>Select tests to be performed</p>
              </div>
              <button
                onClick={() => setLabForm(createDefaultLabForm())}
                style={{
                  background: '#0d6efd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                + Add Test
              </button>
            </div>

            {encounter?.labRequests && encounter.labRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {encounter.labRequests.map((lab, idx) => (
                  <div
                    key={idx}
                    role='button'
                    tabIndex={0}
                    onClick={() => openLabRequestDetails(lab, idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLabRequestDetails(lab, idx);
                      }
                    }}
                    style={{
                      border: '1px solid #e2eaf6',
                      borderRadius: '8px',
                      padding: '12px',
                      backgroundColor: '#fbfdff',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ color: '#111827', fontWeight: '500', fontSize: '0.92rem', lineHeight: 1.25 }}>
                          {lab.test === 'Custom Test'
                            ? lab.customTestName || 'Custom Test'
                            : lab.test || 'N/A'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLab(idx);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d32f2f',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '0',
                          lineHeight: 1,
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div style={{ display: 'none' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                          Test Name
                        </label>
                        <div style={{ backgroundColor: '#f3f4f6', padding: '8px 10px', borderRadius: '6px', fontSize: '0.9rem', color: '#666' }}>
                          {(lab.test === 'Custom Test' && (lab.customTestName || '').trim()) ? (lab.customTestName || '').trim() : (lab.test || 'N/A')}
                        </div>
                        {lab.test === 'Custom Test' && !(lab.customTestName || '').trim() && (
                          <div style={{ marginTop: '6px', color: '#111827', fontWeight: '600', fontSize: '0.9rem' }}>
                            Enter custom test name
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                          Remarks
                        </label>
                        <div style={{ backgroundColor: '#f3f4f6', padding: '8px 10px', borderRadius: '6px', fontSize: '0.9rem', color: '#666' }}>
                          {lab.remarks || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!labForm && (!encounter?.labRequests || encounter.labRequests.length === 0) && (
              <div style={{
                textAlign: 'center',
                padding: '24px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}>
                <p style={{ color: '#d17171', margin: '0 0 6px 0', fontSize: '0.95rem' }}>
                  No laboratory tests requested yet
                </p>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.85rem' }}>
                  Click "Add Test" to start
                </p>
              </div>
            )}

            {labForm && (
              <div style={{
                border: '1px solid #e2eaf6',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: '#fbfdff',
                marginTop: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ color: '#0b5388', fontWeight: '600', fontSize: '0.95rem' }}>
                    Test #{(encounter?.labRequests?.length || 0) + 1}
                  </div>
                  <button
                    onClick={() => setLabForm(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d32f2f',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0',
                    }}
                  >
                    🗑️
                  </button>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                    Common Laboratory Tests
                  </label>
                  <select
                    value={labForm.test || ''}
                    onChange={(e) =>
                      setLabForm((prev) => ({
                        ...prev,
                        test: e.target.value,
                        customTestName: e.target.value === 'Custom Test' ? prev.customTestName : '',
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #c7d9ee',
                      backgroundColor: '#fff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value=''>Select a test</option>
                    <option value='Complete Blood Count (CBC)'>Complete Blood Count (CBC)</option>
                    <option value='Lipid Profile'>Lipid Profile</option>
                    <option value='HbA1c'>HbA1c</option>
                    <option value='Kidney Function Test (KFT)'>Kidney Function Test (KFT)</option>
                    <option value='Chest X-Ray'>Chest X-Ray</option>
                    <option value='Ultrasound'>Ultrasound</option>
                    <option value='Hepatitis B Surface Antigen'>Hepatitis B Surface Antigen</option>
                    <option value='Pregnancy Test'>Pregnancy Test</option>
                    <option value='Urinalysis'>Urinalysis</option>
                    <option value='Blood Glucose (FBS)'>Blood Glucose (FBS)</option>
                    <option value='Liver Function Test (LFT)'>Liver Function Test (LFT)</option>
                    <option value='Thyroid Function Test'>Thyroid Function Test</option>
                    <option value='ECG (Electrocardiogram)'>ECG (Electrocardiogram)</option>
                    <option value='COVID-19 RT-PCR'>COVID-19 RT-PCR</option>
                    <option value='Stool Examination'>Stool Examination</option>
                    <option value='Custom Test'>Custom Test</option>
                  </select>
                </div>

                {labForm.test === 'Custom Test' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                      Add Custom Test
                    </label>
                    <input
                      type='text'
                      value={labForm.customTestName || ''}
                      onChange={(e) =>
                        setLabForm((prev) => ({ ...prev, customTestName: e.target.value }))
                      }
                      placeholder='Enter custom test name'
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #c7d9ee',
                        backgroundColor: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px', color: '#111827' }}>
                    Remarks
                  </label>
                  <input
                    type='text'
                    value={labForm.remarks || ''}
                    onChange={(e) => setLabForm({ ...labForm, remarks: e.target.value })}
                    placeholder='e.g., Fasting required'
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #c7d9ee',
                      backgroundColor: '#fff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setLabForm(null)}
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addLab}
                    style={{
                      background: '#0d6efd',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Add Test
                  </button>
                </div>
              </div>
            )}
          </div>

          {centerTab === 'certificate' && (
            <div className='certificate-panel'>
              <div className='certificate-header'>
                <div>
                  <div className='info-card-title' style={{ marginBottom: '2px' }}>
                    Medical Certificate
                  </div>
                  <p className='certificate-subtitle'>
                    Issue medical certificate for{' '}
                    {selectedPatient?.patientFullName || selectedPatient?.patient || 'Patient'}
                  </p>
                </div>
                <button
                  type='button'
                  className='certificate-print-btn'
                  onClick={printCertificate}
                >
                  <FaFileMedical />
                  <span>Print Certificate</span>
                </button>
              </div>

              <section className='certificate-form-card'>
                <div className='certificate-field'>
                  <label>Diagnosis / Reason</label>
                  <input
                    type='text'
                    value={certificateForm.diagnosisReason}
                    onChange={(e) => handleCertificateChange('diagnosisReason', e.target.value)}
                    placeholder='e.g., Acute Upper Respiratory Tract Infection'
                  />
                </div>

                <div className='certificate-field'>
                  <label>Date Issued</label>
                  <input
                    type='date'
                    value={certificateForm.dateIssued}
                    onChange={(e) => handleCertificateChange('dateIssued', e.target.value)}
                  />
                </div>

                <div className='certificate-grid'>
                  <div className='certificate-field'>
                    <label>Rest Period Start Date</label>
                    <input
                      type='date'
                      value={certificateForm.restStartDate}
                      onChange={(e) => handleCertificateChange('restStartDate', e.target.value)}
                    />
                  </div>
                  <div className='certificate-field'>
                    <label>Rest Period End Date</label>
                    <input
                      type='date'
                      value={certificateForm.restEndDate}
                      onChange={(e) => handleCertificateChange('restEndDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className='certificate-field'>
                  <label>Additional Remarks</label>
                  <textarea
                    value={certificateForm.additionalRemarks}
                    onChange={(e) => handleCertificateChange('additionalRemarks', e.target.value)}
                    placeholder='Any additional notes or instructions...'
                  />
                </div>
              </section>

              <section className='certificate-preview-card' id='medical-certificate-preview'>
                <div className='certificate-preview-title'>MEDICAL CERTIFICATE</div>
                <div className='certificate-preview-clinic'>Healthcare Clinic</div>
                <div className='certificate-preview-clinic'>123 Medical Center, Manila, Philippines</div>
                <div className='certificate-preview-clinic'>Tel: +63 2 1234 5678</div>

                <div className='certificate-preview-meta'>
                  <FaFileMedical />
                  <span>Date Issued: {formatDisplayDate(certificateForm.dateIssued) || '____________'}</span>
                </div>

                <div className='certificate-preview-body'>
                  <p>This is to certify that:</p>
                  <div className='certificate-preview-patient'>
                    {selectedPatient?.patientFullName || selectedPatient?.patient || 'Patient'}
                  </div>
                  <p className='certificate-preview-text'>
                    was examined and treated at this clinic and is diagnosed with:
                  </p>
                  <div className='certificate-preview-diagnosis'>
                    {certificateForm.diagnosisReason || '________________'}
                  </div>
                  <div className='certificate-preview-rest'>
                    Rest period:{' '}
                    {formatDisplayDate(certificateForm.restStartDate) || '____________'} to{' '}
                    {formatDisplayDate(certificateForm.restEndDate) || '____________'}
                  </div>
                  {certificateForm.additionalRemarks ? (
                    <div className='certificate-preview-remarks'>
                      <span>Additional Remarks:</span>
                      <p>{certificateForm.additionalRemarks}</p>
                    </div>
                  ) : null}
                </div>

                <div className='certificate-signature'>
                  <div className='certificate-signature-line'>________________</div>
                  <div className='certificate-signature-name'>
                    {([profileData.firstName, profileData.lastName].filter(Boolean).join(' ').trim() ||
                      currentUser?.user?.name ||
                      'Attending Physician')}
                  </div>
                  <div className='certificate-signature-license'>
                    License No. {profileData.prcNumber || currentUser?.user?.licenseNumber || '__________'}
                  </div>
                </div>
              </section>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className='dashboard-content'>
      <div className='profile-section'>
        <h2 className='section-title'>Personal Information</h2>
        <div className='profile-image-upload'>
          <Avatar
            profileImageUrl={profileData.profileUrl}
            firstName={profileData.firstName}
            lastName={profileData.lastName}
            userType='specialist'
            size={80}
            alt='Profile'
            className='profile-img'
          />
          <div>
            <label htmlFor='profile-photo-upload' className='upload-btn'>
              <FaUpload /> Upload Photo
            </label>
            <input
              id='profile-photo-upload'
              type='file'
              accept='image/png, image/jpeg'
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    setSelectedImageSrc(evt.target.result);
                    setCropperModalOpen(true);
                  };
                  reader.readAsDataURL(file);
                }
                e.target.value = null;
              }}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className='form-grid'>
          <div className='input-group'>
            <label>First Name</label>
            <input
              type='text'
              value={profileData.firstName}
              onChange={(e) => handleProfileChange('firstName', e.target.value)}
            />
          </div>
          <div className='input-group'>
            <label>Last Name</label>
            <input
              type='text'
              value={profileData.lastName}
              onChange={(e) => handleProfileChange('lastName', e.target.value)}
            />
          </div>
          <div className='input-group'>
            <label>Email</label>
            <input type='email' value={profileData.email} readOnly />
          </div>
          <div className='input-group'>
            <label>Phone Number</label>
            <input
              type='tel'
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
            />
          </div>
          <div className='input-group'>
            <label>PRC License Number</label>
            <input
              type='text'
              value={profileData.prcNumber}
              onChange={(e) => handleProfileChange('prcNumber', e.target.value)}
              placeholder='e.g., 1234567'
            />
          </div>
          <div className='profile-image-upload'>
            <img
              src={profileData.prcImage || '/placeholder-document.png'}
              alt='PRC License'
              className='profile-img'
            />
            <div>
              <label htmlFor='prc-license-upload' className='upload-btn'>
                <FaUpload /> Upload PRC License Photo
              </label>
              <input
                id='prc-license-upload'
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      handleProfileChange('prcImage', e.target.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className='input-group full-width'>
            <label>Specialization</label>
            <select
              value={profileData.specialization}
              onChange={(e) => {
                handleProfileChange('specialization', e.target.value);
                handleProfileChange('subSpecialization', '');
              }}
            >
              <option value=''>Select specialization</option>
              {Object.keys(SUB_SPECIALIZATIONS).map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          <div className='input-group full-width'>
            <label>Sub Specialization</label>
            <select
              value={profileData.subSpecialization}
              onChange={(e) =>
                handleProfileChange('subSpecialization', e.target.value)
              }
            >
              <option value=''>Select sub specialization</option>
              {getSubSpecializations(profileData.specialization).map(
                (subSpec) => (
                  <option key={subSpec} value={subSpec}>
                    {subSpec}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className='input-group'>
            <label>Region</label>
            <select
              value={profileData.region}
              onChange={(e) => {
                const selectedRegion = regions.find(
                  (r) => r.name === e.target.value,
                );
                handleProfileChange('region', e.target.value);
                fetchProvinces(selectedRegion?.code);
                setProfileData((prev) => ({
                  ...prev,
                  province: '',
                  city: '',
                  barangay: '',
                }));
              }}
            >
              <option value=''>Select Region</option>
              {regions.map((r) => (
                <option key={r.code} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className='input-group'>
            <label>Province</label>
            <select
              value={profileData.province}
              onChange={(e) => {
                const selectedProvince = provinces.find(
                  (p) => p.name === e.target.value,
                );
                handleProfileChange('province', e.target.value);
                fetchCities(selectedProvince?.code);
                setProfileData((prev) => ({ ...prev, city: '', barangay: '' }));
              }}
              disabled={!profileData.region}
            >
              <option value=''>Select Province</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className='input-group'>
            <label>City / Municipality</label>
            <select
              value={profileData.city}
              onChange={(e) => {
                const selectedCity = cities.find(
                  (c) => c.name === e.target.value,
                );
                handleProfileChange('city', e.target.value);
                fetchBarangays(selectedCity?.code);
                setProfileData((prev) => ({ ...prev, barangay: '' }));
              }}
              disabled={!profileData.province}
            >
              <option value=''>Select City / Municipality</option>
              {cities.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className='input-group'>
            <label>Barangay</label>
            <select
              value={profileData.barangay}
              onChange={(e) => handleProfileChange('barangay', e.target.value)}
              disabled={!profileData.city}
            >
              <option value=''>Select Barangay</option>
              {barangays.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className='input-group'>
            <label>Address Line 1</label>
            <input
              type='text'
              value={profileData.addressLine1}
              onChange={(e) =>
                handleProfileChange('addressLine1', e.target.value)
              }
            />
          </div>
          <div className='input-group'>
            <label>Address Line 2</label>
            <input
              type='text'
              value={profileData.addressLine2}
              onChange={(e) =>
                handleProfileChange('addressLine2', e.target.value)
              }
            />
          </div>
          <div className='input-group'>
            <label>Zip Code</label>
            <input
              type='text'
              value={profileData.zipCode}
              onChange={(e) => handleProfileChange('zipCode', e.target.value)}
            />
          </div>
          <div className='input-group full-width'>
            <label>Bio</label>
            <textarea
              rows='4'
              value={profileData.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
            />
          </div>
          {apiError && (
            <div
              className='error-message'
              style={{ color: 'red', marginBottom: '10px', width: '100%' }}
            >
              {apiError}
            </div>
          )}
          <div className='full-width'>
            <button type='button' className='btn-primary' onClick={saveProfile}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className='dashboard-content'>
      <div className='services-container'>
        <h2 className='section-title'>Professional Fees</h2>
        <div>
          {Object.entries({
            feeInitialWithoutCert: 'Initial Consultation (No Med Cert)',
            feeInitialWithCert: 'Initial Consultation (With Med Cert)',
            feeFollowUpWithoutCert: 'Follow-up Consultation (No Med Cert)',
            feeFollowUpWithCert: 'Follow-up Consultation (With Med Cert)',
          }).map(([key, label]) => (
            <div key={key} className='service-item'>
              <div className='service-info'>
                <div className='service-name'>{label}</div>
                <div className='service-fee'>
                  ₱{Number(services[key] || 0).toFixed(2)}
                </div>
              </div>
              <button
                className='edit-btn'
                onClick={() => openEditServiceModal(key, services[key] || 0)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className='services-container' style={{ marginTop: '2rem' }}>
        <h2 className='section-title'>Disbursement Account</h2>
        <div className='form-grid'>
          <div className='input-group'>
            <label>Account Type</label>
            <select
              value={accountDetails.accountType}
              onChange={(e) =>
                setAccountDetails((prev) => ({
                  ...prev,
                  accountType: e.target.value,
                }))
              }
            >
              <option value='bank'>Bank Account</option>
              <option value='gcash'>GCash</option>
            </select>
          </div>
          {accountDetails.accountType === 'bank' ? (
            <>
              <div className='input-group'>
                <label>Account Name</label>
                <input
                  type='text'
                  value={accountDetails.accountName}
                  onChange={(e) =>
                    setAccountDetails((prev) => ({
                      ...prev,
                      accountName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='input-group'>
                <label>Account Number</label>
                <input
                  type='text'
                  value={accountDetails.accountNumber}
                  onChange={(e) =>
                    setAccountDetails((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className='input-group'>
                <label>Phone Number</label>
                <input
                  type='tel'
                  value={accountDetails.gcashNumber}
                  onChange={(e) =>
                    setAccountDetails((prev) => ({
                      ...prev,
                      gcashNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='profile-image-upload'>
                <img
                  src={accountDetails.gcashQr || '/placeholder-qr.png'}
                  alt='GCash QR'
                  className='profile-img'
                />
                <div>
                  <label htmlFor='gcash-qr-upload' className='upload-btn'>
                    <FaUpload /> Upload GCash QR
                  </label>
                  <input
                    id='gcash-qr-upload'
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setAccountDetails((prev) => ({
                            ...prev,
                            gcashQr: e.target.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button className='btn-primary' onClick={saveAccountDetails}>
            Save Account Details
          </button>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className='dashboard-content'>
      <div className='services-container'>
        <h2 className='section-title'>Payments to be Disbursed</h2>
        <table className='transactions-table'>
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Patient</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TKT-001</td>
              <td>John Doe</td>
              <td>Consultation</td>
              <td>₱100.00</td>
              <td>
                <span className='status-badge status-pending'>Pending</span>
              </td>
            </tr>
            <tr>
              <td>TKT-003</td>
              <td>Robert Johnson</td>
              <td>Medical Clearance</td>
              <td>₱75.00</td>
              <td>
                <span className='status-badge status-confirmed'>
                  Processing
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className='services-container' style={{ marginTop: '2rem' }}>
        <h2 className='section-title'>HMO Transactions</h2>
        <table className='transactions-table'>
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Patient</th>
              <th>Service</th>
              <th>HMO Provider</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TKT-002</td>
              <td>Jane Smith</td>
              <td>Medical Certificate</td>
              <td>Maxicare</td>
              <td>
                <span className='status-badge status-pending'>
                  Verification
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f0f8ff',
          fontSize: '18px',
          color: '#333',
        }}
      >
        Loading specialist dashboard...
      </div>
    );
  }

  return (
    <div className='specialist-dashboard'>
      <div className='dashboard-header'>
        <div className='header-center'>
          <img
            src='/okie-doc-logo.png'
            alt='Okie-Doc+'
            className='logo-image'
          />
        </div>
        <h3 className='dashboard-title'>Specialist Dashboard</h3>
        <div className='user-account'>
          <Avatar
            profileImageUrl={profileData.profileUrl}
            firstName={profileData.firstName}
            lastName={profileData.lastName}
            userType='specialist'
            size={40}
            alt='Account'
            className='account-icon'
          />
          <span className='account-name'>
            {currentUser?.firstName || currentUser?.fName || 'Specialist'}{' '}
            {currentUser?.lastName || currentUser?.lName || ''}
          </span>
          <div className='account-dropdown'>
            <button
              className='dropdown-item'
              onClick={() => handleNavigation('profile', 'Personal Data')}
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
        <div className='dashboard-nav'>
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('dashboard', 'Dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => handleNavigation('messages', 'Messages')}
          >
            Messages
          </button>
          <button
            className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => handleNavigation('schedule', 'Schedules')}
          >
            Schedules
          </button>
          <button
            className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => handleNavigation('services', 'Services & Fees')}
          >
            Services & Fees
          </button>
          <button
            className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => handleNavigation('transactions', 'Transactions')}
          >
            Transactions
          </button>
        </div>
      </div>

      <div className='main-content'>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'messages' && <Messages currentUser={currentUser} />}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'schedule' && renderSchedules()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'transactions' && renderTransactions()}
      </div>

      {showEditServiceModal && (
        <div
          onClick={() => setShowEditServiceModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '450px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                backgroundColor: '#0ea5e9',
                color: 'white',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'white',
                }}
              >
                Edit Service Fee
              </h2>
              <span
                onClick={() => setShowEditServiceModal(false)}
                style={{ cursor: 'pointer', fontSize: '1.25rem', opacity: 0.8 }}
              >
                <FaTimes />
              </span>
            </div>

            <div style={{ padding: '24px' }}>
              <div className='input-group' style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4b5563',
                    fontWeight: '500',
                  }}
                >
                  Service Type
                </label>
                <input
                  type='text'
                  value={
                    {
                      feeInitialWithoutCert:
                        'Initial Consultation (No Med Cert)',
                      feeInitialWithCert:
                        'Initial Consultation (With Med Cert)',
                      feeFollowUpWithoutCert:
                        'Follow-up Consultation (No Med Cert)',
                      feeFollowUpWithCert:
                        'Follow-up Consultation (With Med Cert)',
                    }[editingService.name] || editingService.name
                  }
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    color: '#6b7280',
                  }}
                />
              </div>

              <div className='input-group' style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4b5563',
                    fontWeight: '500',
                  }}
                >
                  Professional Fee (₱)
                </label>
                <input
                  type='number'
                  value={editingService.fee}
                  onChange={(e) =>
                    setEditingService((prev) => ({
                      ...prev,
                      fee: e.target.value,
                    }))
                  }
                  min='0'
                  step='0.01'
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className='btn-primary'
                  onClick={updateServiceFee}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Update Fee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTicketModal && selectedTicket && (
        <div
          className='modal'
          onClick={(e) =>
            e.target.className === 'modal' && setShowTicketModal(false)
          }
        >
          <div className='modal-content'>
            <div className='modal-header'>
              <h2>Ticket Details</h2>
              <span
                className='close-modal'
                onClick={() => setShowTicketModal(false)}
              >
                <FaTimes />
              </span>
            </div>
            <div className='input-group'>
              <label>Ticket #</label>
              <input value={selectedTicket.id} readOnly />
            </div>
            <div className='input-group'>
              <label>Patient</label>
              <input value={selectedTicket.patientFullName} readOnly />
            </div>
            <div className='input-group'>
              <label>Barangay</label>
              <input
                value={
                  selectedTicket.barangay ||
                  selectedTicket.rawTicket?.barangay ||
                  'Not provided'
                }
                readOnly
              />
            </div>
            <div className='input-group'>
              <label>Chief Complaint</label>
              <input
                value={selectedTicket.service || selectedTicket.chiefComplaint}
                readOnly
              />
            </div>
            <div className='input-group'>
              <label>Symptoms</label>
              <textarea
                value={selectedTicket.symptoms || 'None specified'}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--light-gray)',
                  minHeight: '80px',
                  background: '#f9fafb',
                }}
              />
            </div>
            <div className='input-group'>
              <label>Consultation Channel</label>
              <input
                value={selectedTicket.consultationChannel || 'Not specified'}
                readOnly
              />
            </div>
            <div className='input-group'>
              <label>Date & Time</label>
              <input value={selectedTicket.when} readOnly />
            </div>
            <div className='input-group'>
              <label>Status</label>
              <input value={selectedTicket.status} readOnly />
            </div>
            <div className='modal-actions'>
              {(() => {
                const s = (selectedTicket.status || '').toLowerCase();
                const isTriage = s === 'processing' || s === 'triage complete';
                const isCompleted = s === 'completed';

                return (
                  <>
                    {!isCompleted && !isTriage && (
                      <button
                        className='btn-primary'
                        onClick={() => updateTicketStatus('Confirmed')}
                      >
                        Mark Confirmed
                      </button>
                    )}
                    {!isTriage && !isCompleted && (
                      <button
                        className='edit-btn'
                        onClick={() => updateTicketStatus('Completed')}
                      >
                        Mark Completed
                      </button>
                    )}
                    {isTriage && (
                      <button
                        className='btn-primary'
                        style={{ backgroundColor: '#10b981' }}
                        onClick={() => {
                          setSelectedTicketId(selectedTicket.id);
                          setShowInvoiceModal(true);
                        }}
                      >
                        Generate Invoice
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div
          className='modal'
          onClick={(e) =>
            e.target.className === 'modal' && setShowScheduleModal(false)
          }
        >
          <div className='modal-content'>
            <div className='modal-header'>
              <h2>Add Schedule</h2>
              <span
                className='close-modal'
                onClick={() => setShowScheduleModal(false)}
              >
                <FaTimes />
              </span>
            </div>
            <div className='input-group'>
              <label>Date</label>
              <input
                value={
                  selectedDate
                    ? `${getMonthName(
                        currentMonth,
                      )} ${selectedDate}, ${currentYear}`
                    : ''
                }
                readOnly
              />
            </div>
            <div className='input-group'>
              <label>Time</label>
              <input
                type='time'
                value={scheduleData.time}
                onChange={(e) =>
                  setScheduleData((prev) => ({ ...prev, time: e.target.value }))
                }
              />
            </div>
            <div className='input-group'>
              <label>Duration (minutes)</label>
              <select
                value={scheduleData.duration}
                onChange={(e) =>
                  setScheduleData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
              >
                <option value='15'>15 minutes</option>
                <option value='30'>30 minutes</option>
                <option value='45'>45 minutes</option>
                <option value='60'>1 hour</option>
                <option value='90'>1.5 hours</option>
                <option value='120'>2 hours</option>
              </select>
            </div>
            <div className='input-group'>
              <label>Notes</label>
              <textarea
                rows='3'
                value={scheduleData.notes}
                onChange={(e) =>
                  setScheduleData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder='Available for consultation, Follow-up appointment, etc.'
              />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button className='btn-primary' onClick={addSchedule}>
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showInvoiceModal && (
        <div className='modal' onClick={() => setShowInvoiceModal(false)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Generate Invoice</h3>
              <button
                className='close-modal'
                onClick={() => setShowInvoiceModal(false)}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className='input-group full-width'>
                <label>Consultation Type</label>
                <select
                  value={invoiceForm.consultationType}
                  onChange={(e) =>
                    setInvoiceForm((f) => ({
                      ...f,
                      consultationType: e.target.value,
                    }))
                  }
                >
                  <option value='initial'>Initial</option>
                  <option value='follow-up'>Follow-up</option>
                </select>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '1.5rem',
                }}
              >
                <input
                  type='checkbox'
                  id='invoiceCert'
                  style={{ width: '18px', height: '18px', margin: 0 }}
                  checked={invoiceForm.includesCertificate}
                  onChange={(e) =>
                    setInvoiceForm((f) => ({
                      ...f,
                      includesCertificate: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor='invoiceCert'
                  style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}
                >
                  Includes Medical Certificate
                </label>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '1rem',
                }}
              >
                <input
                  type='checkbox'
                  id='invoiceDiscount'
                  style={{ width: '18px', height: '18px', margin: 0 }}
                  checked={invoiceForm.isDiscounted}
                  onChange={(e) =>
                    setInvoiceForm((f) => ({
                      ...f,
                      isDiscounted: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor='invoiceDiscount'
                  style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}
                >
                  Apply Discount (Senior/PWD)
                </label>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '0 1.5rem 1.5rem',
              }}
            >
              <button
                className='edit-btn'
                onClick={() => setShowInvoiceModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className='btn-primary'
                style={{ marginTop: 0 }}
                onClick={handleGenerateInvoice}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call/Video Call Component */}
      <SpecialistCall
        isOpen={callState.isOpen}
        onClose={handleCloseCall}
        callType={callState.callType}
        patient={callState.patient}
        currentUser={currentUser}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className='modal' onClick={() => setShowSuccessModal(false)}>
          <div
            className='modal-content'
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 30px',
              maxWidth: '450px',
              width: '90%',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                color: '#16a34a',
                fontSize: '4rem',
                lineHeight: '1',
                marginBottom: '20px',
              }}
            >
              ✓
            </div>
            <h3
              style={{
                fontSize: '1.5rem',
                marginBottom: '15px',
                color: '#1f2937',
              }}
            >
              Profile Saved Successfully
            </h3>
            <p
              style={{
                color: '#4b5563',
                marginBottom: '25px',
                fontSize: '1.1rem',
                lineHeight: '1.5',
              }}
            >
              Your specialist profile information has been securely updated in
              the database.
            </p>
            <button
              className='btn-primary'
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1.1rem',
                marginTop: '0',
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {selectedMedicalEntry && (
        <div
          className='modal'
          onClick={(e) => e.target.className === 'modal' && closeMedicalEntryDetails()}
        >
          <div className='modal-content specialist-entry-modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>{selectedMedicalEntry.title}</h3>
              <button className='close-modal' onClick={closeMedicalEntryDetails}>
                <FaTimes />
              </button>
            </div>
            <div className='specialist-entry-modal__body'>
              {selectedMedicalEntry.type === 'medicine' ? (
                <div className='specialist-entry-modal__grid'>
                  <div className='specialist-entry-modal__field'>
                    <span>Medication Name</span>
                    <strong>{selectedMedicalEntry.data?.name || 'N/A'}</strong>
                  </div>
                  <div className='specialist-entry-modal__field'>
                    <span>Dosage</span>
                    <strong>{selectedMedicalEntry.data?.dosage || 'N/A'}</strong>
                  </div>
                  <div className='specialist-entry-modal__field'>
                    <span>Frequency</span>
                    <strong>{selectedMedicalEntry.data?.frequency || 'N/A'}</strong>
                  </div>
                  <div className='specialist-entry-modal__field'>
                    <span>Duration</span>
                    <strong>{selectedMedicalEntry.data?.duration || 'N/A'}</strong>
                  </div>
                  <div className='specialist-entry-modal__field specialist-entry-modal__field--full'>
                    <span>Special Instructions</span>
                    <strong>{selectedMedicalEntry.data?.specialInstructions || 'N/A'}</strong>
                  </div>
                </div>
              ) : (
                <div className='specialist-entry-modal__grid'>
                  <div className='specialist-entry-modal__field'>
                    <span>Test Name</span>
                    <strong>
                      {selectedMedicalEntry.data?.test === 'Custom Test'
                        ? selectedMedicalEntry.data?.customTestName || 'N/A'
                        : selectedMedicalEntry.data?.test || 'N/A'}
                    </strong>
                  </div>
                  <div className='specialist-entry-modal__field'>
                    <span>Test Type</span>
                    <strong>{selectedMedicalEntry.data?.test || 'N/A'}</strong>
                  </div>
                  <div className='specialist-entry-modal__field specialist-entry-modal__field--full'>
                    <span>Remarks</span>
                    <strong>{selectedMedicalEntry.data?.remarks || 'N/A'}</strong>
                  </div>
                  {selectedMedicalEntry.data?.test === 'Custom Test' && (
                    <div className='specialist-entry-modal__field specialist-entry-modal__field--full'>
                      <span>Custom Test Name</span>
                      <strong>{selectedMedicalEntry.data?.customTestName || 'N/A'}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {soapModalType && (
        <div className='modal' onClick={(e) => e.target.className === 'modal' && closeSoapModal()}>
          <div
            className='modal-content soap-editor-modal'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h3>
                {soapModalType === 'subjective'
                  ? 'Edit Subjective'
                  : soapModalType === 'objective'
                  ? 'Edit Objective'
                  : soapModalType === 'assessment'
                  ? 'Edit Assessment'
                  : 'Edit Plan'}
              </h3>
              <button className='close-modal' onClick={closeSoapModal} type='button'>
                <FaTimes />
              </button>
            </div>
            <div className='soap-editor-modal__body'>
              <div className='soap-editor-modal__field'>
                <label>
                  {soapModalType === 'subjective'
                    ? 'Subjective'
                    : soapModalType === 'objective'
                    ? 'Objective'
                    : soapModalType === 'assessment'
                    ? 'Assessment'
                    : 'Plan'}
                </label>
                <textarea
                  value={soapModalValue}
                  onChange={(e) => setSoapModalValue(e.target.value)}
                  placeholder={
                    soapModalType === 'subjective'
                      ? 'Patient reports experiencing...'
                      : soapModalType === 'objective'
                      ? 'Physical examination reveals...'
                      : soapModalType === 'assessment'
                      ? 'Diagnosis: ...'
                      : 'Treatment plan includes...'
                  }
                />
              </div>

              {soapModalType === 'assessment' && (
                <div className='icd-selector-section'>
                  <ICDCodeSelector
                    value={soapModalIcdCode}
                    onChange={setSoapModalIcdCode}
                  />
                </div>
              )}
            </div>
            <div className='soap-editor-modal__actions'>
              <button
                type='button'
                className='btn-primary soap-editor-modal__save-btn'
                onClick={saveSoapModal}
              >
                Save {soapModalType === 'subjective'
                  ? 'Subjective'
                  : soapModalType === 'objective'
                  ? 'Objective'
                  : soapModalType === 'assessment'
                  ? 'Assessment'
                  : 'Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageCropperModal
        isOpen={cropperModalOpen}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </div>
  );
};

export default SpecialistDashboard;
