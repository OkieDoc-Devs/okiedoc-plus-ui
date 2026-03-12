import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaTimes } from 'react-icons/fa';
import './SpecialistDashboard.css';
import authService from './authService';
import * as specialistApi from './services/apiService';
import { API_BASE_URL } from '../api/apiClient';
import SpecialistCall from './SpecialistCall';
import Messages from './Messages';
import ImageCropperModal from '../components/ImageCropperModal';
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
  downloadMedicalHistoryPDF,
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
} from './utils';

const SpecialistDashboard = () => {
  const navigate = useNavigate();
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

  const [medForm, setMedForm] = useState(createDefaultMedicineForm());

  const [labForm, setLabForm] = useState(createDefaultLabForm());

  const [mhRequests, setMhRequests] = useState([]);
  const [mhModal, setMhModal] = useState({
    open: false,
    reason: '',
    from: '',
    to: '',
    consent: false,
  });

  const [centerTab, setCenterTab] = useState('medicine');

  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    pendingConsultations: 0,
    completedToday: 0,
    upcomingAppointments: 0,
  });

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

      if (activeResponse.success && activeResponse.activeTickets) {
        console.log(
          `[SpecialistDashboard] Loaded ${activeResponse.activeTickets.length} active tickets from API`,
        );
        const mappedActive = activeResponse.activeTickets.map((t) => ({
          id: t.id,
          patient: formatPatientName(t.rawTicket?.patient || t),
          patientFullName: t.patientName || 'Unknown',
          service: t.chiefComplaint || 'Consultation',
          symptoms: t.symptoms || '',
          preferredDate: t.preferredDate,
          preferredTime: t.preferredTime,
          consultationChannel: t.consultationChannel,
          barangay: t.barangay,
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
                ? 'In Progress'
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
          id: t.id,
          patient: formatPatientName(t.patient),
          patientFullName: t.patient
            ? `${t.patient.firstName || ''} ${t.patient.lastName || ''}`.trim()
            : 'Unknown',
          service: t.chiefComplaint || 'Consultation',
          symptoms: t.symptoms || '',
          preferredDate: t.preferredDate,
          preferredTime: t.preferredTime,
          consultationChannel: t.consultationChannel,
          barangay: t.barangay,
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

    const currentUser = authService.getCurrentUser();

    if (!currentUser || currentUser.userType !== 'specialist') {
      navigate('/specialist-login');
      return;
    }

    if (currentUser.user.applicationStatus === 'pending') {
      navigate('/specialist-pending');
      return;
    } else if (currentUser.user.applicationStatus === 'denied') {
      navigate('/specialist-denied');
      return;
    }

    setCurrentUser(currentUser.user);
    setIsLoading(false);

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
  }, [navigate, loadTicketsData, loadDashboardData]);

  useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      console.log(
        '[SpecialistDashboard] Dashboard tab active, reloading tickets...',
      );
      loadTicketsData();
    }
  }, [activeTab, loadTicketsData]);

  useEffect(() => {
    if (selectedTicketId) {
      const data = loadEncounterData(selectedTicketId);
      if (data) {
        setEncounter(data);
      } else {
        setEncounter(createDefaultEncounter());
      }
      setMhRequests(loadMedicalHistoryData(selectedTicketId));
    }
  }, [selectedTicketId]);

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
          patient: ticket.patient
            ? `${ticket.patient.firstName || ''} ${ticket.patient.lastName ? ticket.patient.lastName.charAt(0) + '.' : ''}`
            : 'Unknown',
          patientFullName: ticket.patient
            ? `${ticket.patient.firstName || ''} ${ticket.patient.lastName || ''}`.trim()
            : 'Unknown',
          service: ticket.chiefComplaint || 'Consultation',
          chiefComplaint: ticket.chiefComplaint,
          symptoms: ticket.symptoms || '',
          preferredDate: ticket.preferredDate,
          preferredTime: ticket.preferredTime,
          consultationChannel: ticket.consultationChannel,
          barangay: ticket.barangay,
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

  const openMhModal = () => {
    setMhModal({ open: true, reason: '', from: '', to: '', consent: false });
  };

  const submitMh = () => {
    try {
      const item = createMedicalHistoryRequest(mhModal);
      const list = loadMedicalHistoryData(selectedTicketId).concat([item]);
      saveMedicalHistoryData(selectedTicketId, list);
      setMhRequests(list);
      setMhModal({ open: false, reason: '', from: '', to: '', consent: false });
      downloadMhPdf(item);
    } catch (error) {
      alert(error.message);
    }
  };

  const updateMhStatus = (id, status) => {
    const list = loadMedicalHistoryData(selectedTicketId).map((x) =>
      updateMedicalHistoryStatus(x, status),
    );
    saveMedicalHistoryData(selectedTicketId, list);
    setMhRequests(list);
  };

  const downloadMhPdf = (item) => {
    const t = tickets.find((x) => x.id === selectedTicketId) || {};
    downloadMedicalHistoryPDF(item, t);
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

  const renderDashboard = () => (
    <div className='dashboard-content'>
      <div className='chart-layout'>
        <div className='panel'>
          <div className='left-col-header'>
            <h3>Tickets</h3>
          </div>
          <div className='sidebar-content-padding'>
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
                  'In Progress',
                  'Completed',
                ].map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className='sidebar-tickets-list'>
              {filteredTickets.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7A7A7A' }}>
                  No tickets found.
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className={`sidebar-ticket ${selectedTicketId === t.id ? 'active' : ''}`}
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    <span
                      className={`status-badge ${getStatusBadgeClass(t.status)}`}
                    >
                      {t.status}
                    </span>
                    <div className='name'>{t.patient}</div>
                    <div className='meta'>
                      {t.id} • {t.service}
                    </div>
                    <div className='meta'>{t.when}</div>
                    {t.consultationChannel && (
                      <div
                        className='meta'
                        style={{
                          fontSize: '11px',
                          color: '#0b5388',
                          marginTop: '2px',
                        }}
                      >
                        {t.consultationChannel}
                      </div>
                    )}
                    <div className='ticket-card-actions'>
                      {t.status === 'Available' && (
                        <button
                          className='btn-primary small'
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              setIsLoading(true);
                              await specialistApi.claimTicket(t.id);
                              alert('Ticket claimed successfully!');
                              await loadTicketsData();
                            } catch (err) {
                              alert(err.message || 'Failed to claim ticket.');
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          Claim
                        </button>
                      )}
                      <button
                        className='edit-btn small'
                        onClick={(e) => {
                          e.stopPropagation();
                          viewTicket(t.id);
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className='panel'>
          <div className='panel-body'>
            {(() => {
              const t = tickets.find((x) => x.id === selectedTicketId);
              if (!t)
                return (
                  <div style={{ color: '#7A7A7A' }}>
                    Select a ticket to start.
                  </div>
                );

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

              return (
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '18px',
                      marginBottom: '8px',
                    }}
                  >
                    Name: {t.patientFullName || t.patient || 'Unknown'}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    Birthday: {formatBirthday(t.patientBirthdate)}{' '}
                    {t.age ? `(${t.age} years old)` : ''}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    Mobile Number: {t.mobile || 'Not provided'}
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    Email Address: {t.email || 'Not provided'}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: '12px' }}>
                    Chief Complaint: {t.chiefComplaint || 'Not specified'}
                  </div>
                  <div>
                    <div className='tabbar' style={{ marginBottom: '12px' }}>
                      <button
                        className={centerTab === 'medicine' ? 'active' : ''}
                        onClick={() => setCenterTab('medicine')}
                      >
                        Medicine
                      </button>
                      <button
                        className={centerTab === 'lab' ? 'active' : ''}
                        onClick={() => setCenterTab('lab')}
                      >
                        Lab Request
                      </button>
                      <div style={{ marginLeft: 'auto' }}>
                        <button className='request-btn' onClick={openMhModal}>
                          Request Medical History
                        </button>
                      </div>
                    </div>
                    {centerTab === 'medicine' ? (
                      <div>
                        <div className='grid-2'>
                          <div>
                            <div style={{ fontWeight: 600 }}>Brand</div>
                            <input
                              className='input-sm pill'
                              value={medForm.brand}
                              onChange={(e) =>
                                setMedForm((m) => ({
                                  ...m,
                                  brand: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Generic</div>
                            <input
                              className='input-sm pill'
                              value={medForm.generic}
                              onChange={(e) =>
                                setMedForm((m) => ({
                                  ...m,
                                  generic: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Dosage</div>
                            <input
                              className='input-sm pill'
                              value={medForm.dosage}
                              onChange={(e) =>
                                setMedForm((m) => ({
                                  ...m,
                                  dosage: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Form</div>
                            <input
                              className='input-sm pill'
                              value={medForm.form}
                              onChange={(e) =>
                                setMedForm((m) => ({
                                  ...m,
                                  form: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Quantity</div>
                            <input
                              className='input-sm pill'
                              value={medForm.quantity}
                              onChange={(e) =>
                                setMedForm((m) => ({
                                  ...m,
                                  quantity: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Instructions</div>
                            <input
                              className='input-sm pill'
                              value={medForm.instructions}
                              onChange={(e) =>
                                setMedForm((m) => ({
                                  ...m,
                                  instructions: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '10px',
                          }}
                        >
                          <button
                            className='tiny-btn plus-black'
                            title='Add medicine'
                            onClick={addMedicine}
                          >
                            +
                          </button>
                        </div>
                        <div className='prescription-list'>
                          {(encounter.medicines || []).length === 0 ? (
                            <div style={{ color: '#555' }}>
                              No medicines added yet.
                            </div>
                          ) : (
                            <ol className='rx-list'>
                              {(encounter.medicines || []).map((m, idx) => (
                                <li key={idx} className='prescription-item'>
                                  <div className='rx-item-title'>
                                    {formatMedicineDisplay(m)}
                                  </div>
                                  <div className='rx-sig'>
                                    Sig: {m.instructions}
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'flex-end',
                                    }}
                                  >
                                    <button
                                      className='edit-btn'
                                      onClick={() => removeMedicine(idx)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className='grid-2'>
                          <div>
                            <div style={{ fontWeight: 600 }}>Lab Test</div>
                            <input
                              className='input-sm pill'
                              value={labForm.test}
                              onChange={(e) =>
                                setLabForm((f) => ({
                                  ...f,
                                  test: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Remarks</div>
                            <input
                              className='input-sm pill'
                              value={labForm.remarks}
                              onChange={(e) =>
                                setLabForm((f) => ({
                                  ...f,
                                  remarks: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '10px',
                          }}
                        >
                          <button
                            className='tiny-btn plus-black'
                            title='Add lab request'
                            onClick={addLab}
                          >
                            +
                          </button>
                        </div>
                        <div className='prescription-list'>
                          {(encounter.labRequests || []).length === 0 ? (
                            <div style={{ color: '#555' }}>
                              No lab requests added yet.
                            </div>
                          ) : (
                            <ol className='lab-list'>
                              {(encounter.labRequests || []).map((l, idx) => (
                                <li className='prescription-item' key={idx}>
                                  <div className='rx-item-title'>
                                    {formatLabRequestDisplay(l)}
                                  </div>
                                  <div className='rx-sig'>
                                    Remarks: {l.remarks || 'N/A'}
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'flex-end',
                                    }}
                                  >
                                    <button
                                      className='edit-btn'
                                      onClick={() => removeLab(idx)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className='panel'>
          <div className='panel-body soap-section'>
            <div className='soap-header'>
              <div className='soap-title'>SOAP Notes</div>
              <div className='soap-subtitle'>
                Document the encounter summary and next steps
              </div>
            </div>
            <div className='soap-grid'>
              <label className='soap-field'>
                <span className='soap-label'>Subjective</span>
                <textarea
                  className='input-lg soap-textarea'
                  value={encounter.subjective}
                  onChange={(e) =>
                    saveEncounter({ subjective: e.target.value })
                  }
                ></textarea>
              </label>
              <label className='soap-field'>
                <span className='soap-label'>Objective</span>
                <textarea
                  className='input-lg soap-textarea'
                  value={encounter.objective}
                  onChange={(e) => saveEncounter({ objective: e.target.value })}
                ></textarea>
              </label>
              <label className='soap-field'>
                <span className='soap-label'>Assessment</span>
                <textarea
                  className='input-lg soap-textarea'
                  value={encounter.assessment}
                  onChange={(e) =>
                    saveEncounter({ assessment: e.target.value })
                  }
                ></textarea>
              </label>
              <label className='soap-field'>
                <span className='soap-label'>Plan</span>
                <textarea
                  className='input-lg soap-textarea'
                  value={encounter.plan}
                  onChange={(e) => saveEncounter({ plan: e.target.value })}
                ></textarea>
              </label>
              <label className='soap-field soap-field--wide'>
                <span className='soap-label'>Referral</span>
                <textarea
                  className='input-lg soap-textarea'
                  value={encounter.referral}
                  onChange={(e) => saveEncounter({ referral: e.target.value })}
                ></textarea>
              </label>
            </div>
            <div className='soap-actions'>
              <label className='soap-followup'>
                <input
                  type='checkbox'
                  className='soap-followup-checkbox'
                  checked={!!encounter.followUp}
                  onChange={(e) =>
                    saveEncounter({ followUp: e.target.checked })
                  }
                />
                <span>Follow up</span>
              </label>
              <div className='soap-buttons'>
                <button
                  className='btn-primary soap-save'
                  onClick={async () => {
                    await saveEncounter({});
                    alert('Encounter saved.');
                  }}
                >
                  Save Progress
                </button>
                {(() => {
                  const t = tickets.find((x) => x.id === selectedTicketId);
                  const statusRaw = (
                    t?.status ||
                    t?.Status ||
                    ''
                  ).toLowerCase();

                  return (
                    <div
                      className='consultation-controls'
                      style={{
                        display: 'flex',
                        gap: '10px',
                        marginLeft: '10px',
                      }}
                    >
                      {statusRaw === 'awaiting' && (
                        <button
                          className='btn-primary'
                          style={{ backgroundColor: '#0aadef' }}
                          onClick={handleStartConsultation}
                        >
                          Start Consultation
                        </button>
                      )}

                      {statusRaw === 'in progress' && (
                        <>
                          <button
                            className='btn-primary'
                            style={{ backgroundColor: '#10b981' }}
                            onClick={handleCompleteConsultation}
                          >
                            Finish & Complete
                          </button>
                          <button
                            className='btn-secondary'
                            onClick={async () => {
                              const notes = prompt(
                                'Add notes for passing back:',
                              );
                              if (notes === null) return;
                              await specialistApi.passTicketBackToNurse(
                                selectedTicketId,
                                notes,
                              );
                              alert('Passed back to nurse.');
                              await loadTicketsData();
                            }}
                          >
                            Pass Back
                          </button>
                        </>
                      )}

                      {(statusRaw === 'processing' ||
                        statusRaw === 'triage complete') && (
                        <button
                          className='btn-primary'
                          style={{ backgroundColor: '#10b981' }}
                          onClick={() => {
                            setSelectedTicketId(selectedTicketId);
                            setShowInvoiceModal(true);
                          }}
                        >
                          Generate Invoice
                        </button>
                      )}

                      {statusRaw === 'completed' && (
                        <div
                          className='completed-label'
                          style={{
                            color: '#10b981',
                            fontWeight: 700,
                            alignSelf: 'center',
                          }}
                        >
                          ✓ Consultation Completed
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='prescription-list' style={{ marginTop: '16px' }}>
        <h4 style={{ marginBottom: '8px' }}>Medical History Requests</h4>
        {mhRequests.length === 0 ? (
          <div style={{ color: '#555' }}>No requests yet.</div>
        ) : (
          <div className='lab-list'>
            {mhRequests.map((r, index) => (
              <div
                key={r.id}
                className='prescription-item'
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: '#fff',
                }}
              >
                <div className='rx-item-title' style={{ marginBottom: '8px' }}>
                  {index + 1}. {new Date(r.createdAt).toLocaleDateString()} —{' '}
                  {r.status}
                </div>
                {r.reason && (
                  <div className='rx-sig' style={{ marginBottom: '4px' }}>
                    Reason: {r.reason}
                  </div>
                )}
                {(r.from || r.to) && (
                  <div className='rx-sig' style={{ marginBottom: '8px' }}>
                    Range: {r.from || '—'} to {r.to || '—'}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                  }}
                >
                  {r.status !== 'Fulfilled' && r.status !== 'Cancelled' && (
                    <button
                      className='btn-primary'
                      onClick={() => updateMhStatus(r.id, 'Fulfilled')}
                    >
                      Mark Fulfilled
                    </button>
                  )}
                  <button className='edit-btn' onClick={() => downloadMhPdf(r)}>
                    Download PDF
                  </button>
                  {r.status !== 'Cancelled' && (
                    <button
                      className='edit-btn'
                      onClick={() => updateMhStatus(r.id, 'Cancelled')}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className='dashboard-content'>
      <div className='profile-section'>
        <h2 className='section-title'>Personal Information</h2>
        <div className='profile-image-upload'>
          {profileData.profileUrl ? (
            <img
              src={`${API_BASE_URL}${profileData.profileUrl}`}
              alt='Profile'
              className='profile-img'
            />
          ) : (
            <div
              className='profile-img'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#0b5388',
                backgroundColor: '#e0f2fe',
              }}
            >
              {userInitials}
            </div>
          )}
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
          {profileData.profileUrl ? (
            <img
              src={`${API_BASE_URL}${profileData.profileUrl}`}
              alt='Account'
              className='account-icon'
            />
          ) : (
            <div
              className='account-icon'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#0b5388',
              }}
            >
              {userInitials}
            </div>
          )}
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

      {mhModal.open && (
        <div
          className='modal'
          style={{
            display: 'flex',
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target.classList.contains('modal'))
              setMhModal({
                open: false,
                reason: '',
                from: '',
                to: '',
                consent: false,
              });
          }}
        >
          <div
            className='modal-content'
            style={{
              background: '#fff',
              padding: '1.6rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '520px',
            }}
          >
            <h3 style={{ marginBottom: '1rem' }}>Request Medical History</h3>
            <div className='input-group'>
              <label>Reason</label>
              <textarea
                rows='3'
                value={mhModal.reason}
                onChange={(e) =>
                  setMhModal((m) => ({ ...m, reason: e.target.value }))
                }
              ></textarea>
            </div>
            <div className='form-grid'>
              <div className='input-group'>
                <label>From</label>
                <input
                  type='date'
                  value={mhModal.from}
                  onChange={(e) =>
                    setMhModal((m) => ({ ...m, from: e.target.value }))
                  }
                />
              </div>
              <div className='input-group'>
                <label>To</label>
                <input
                  type='date'
                  value={mhModal.to}
                  onChange={(e) =>
                    setMhModal((m) => ({ ...m, to: e.target.value }))
                  }
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '8px 0 16px',
              }}
            >
              <input
                id='mhConsent'
                type='checkbox'
                checked={mhModal.consent}
                onChange={(e) =>
                  setMhModal((m) => ({ ...m, consent: e.target.checked }))
                }
              />
              <label htmlFor='mhConsent'>I have the patient's consent</label>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                className='edit-btn'
                onClick={() =>
                  setMhModal({
                    open: false,
                    reason: '',
                    from: '',
                    to: '',
                    consent: false,
                  })
                }
              >
                Cancel
              </button>
              <button className='btn-primary' onClick={submitMh}>
                Submit Request
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
