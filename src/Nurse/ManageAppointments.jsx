import '../App.css';
import './NurseStyles.css';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Avatar from '../components/Avatar';
import PostConsultationBillingModal from '../components/PostConsultationBillingModal';
import {
  getNurseFirstName,
  getNurseProfileImage,
} from './services/storageService.js';
import {
  filterTicketsByStatus,
  updateTicketStatus,
  rescheduleTicket,
} from './services/ticketService.js';
import { addNotification } from './services/notificationService.js';
import {
  generatePostConsultationBillingPDF,
} from './services/invoiceService.js';
import {
  fetchTicketsFromAPI,
  updateTicket,
  triageTicket,
  assignSpecialist,
  fetchDoctorsFromAPI,
  createTicket,
  searchPatientsFromAPI,
} from './services/apiService.js';
import NotificationBell from '../components/Notifications/NotificationBell';
import { useAuth } from '../contexts/AuthContext';
import { PAIN_MAP_AREAS, PAIN_MAP_VIEWS } from '../components/PainMap/painMapConstants.js';
import referredPainChart from '../assets/1506_Referred_Pain_Chart.jpg';
import { usePSGC } from '../hooks/usePSGC.js';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  FileText,
  Search,
  UserPlus,
} from 'lucide-react';

const USE_API = true;
const TRIAGE_DRAFTS_STORAGE_KEY = 'nurse.triageDraftsByTicket';
const CREATE_TICKET_DRAFT_KEY = 'nurse.createTicketDraft';
const COMMON_SYMPTOMS = [
  'Fever',
  'Headache',
  'Cough',
  'Body Pain',
  'Dizziness',
  'Chest Pain',
  'Sore Throat',
  'Nausea',
  'Fatigue',
  'Shortness of Breath',
  'Stomach Pain',
  'Loss of Appetite',
];
const SUBSCRIPTION_TYPES = ['YAKAP', 'Private', 'HMO', 'PhilHealth'];
const CONSULTATION_TYPES = [
  { label: 'Chat Consultation', value: 'chat' },
  { label: 'Mobile Call', value: 'mobile_call' },
  { label: 'Platform Video Call', value: 'platform_call' },
  { label: 'Viber Audio', value: 'viber_audio' },
  { label: 'Viber Video', value: 'viber_video' },
];
const DURATION_UNITS = ['Hours', 'Days', 'Weeks', 'Months', 'Years'];
const getTicketDraftFingerprint = (ticket) =>
  String(ticket?.createdAt || ticket?.updatedAt || '').trim();

const createEmptyTicketForm = () => ({
  patientId: '',
  fullName: '',
  mobileNumber: '',
  email: '',
  birthday: '',
  gender: '',
  addressLine1: '',
  region: 'Bicol Region',
  province: 'Camarines Sur',
  city: 'City of Naga',
  barangay: 'Santa Cruz',
  isUsingHmo: '',
  hmoProvider: '',
  hmoMemberId: '',
  subscriptionType: '',
  consultationChannel: '',
  chiefComplaint: '',
  symptoms: [],
  otherSymptoms: '',
  painAreas: [],
  painMapView: 'front',
  durationValue: '',
  durationUnit: 'Days',
  severity: 5,
});

function CreateTicketSelect({
  value,
  placeholder,
  options = [],
  onChange,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label || value || placeholder;

  return (
    <div
      className={`create-ticket-select-wrap ${className}`.trim()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={`create-ticket-select ${!value ? 'placeholder' : ''}`}
        disabled={disabled}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span>{displayValue}</span>
        <ChevronDown size={18} />
      </button>
      {isOpen && !disabled && (
        <div className="create-ticket-select-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`create-ticket-select-option ${option.value === value ? 'active' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NurseCreateTicketWorkspace({ onBack, onTicketCreated, initialFormData = null }) {
  const {
    regions,
    provinces,
    cities,
    barangays,
    loading: psgcLoading,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = usePSGC();
  const [formData, setFormData] = useState(() => {
    try {
      const savedDraft = localStorage.getItem(CREATE_TICKET_DRAFT_KEY);
      return savedDraft ? { ...createEmptyTicketForm(), ...JSON.parse(savedDraft) } : createEmptyTicketForm();
    } catch {
      return createEmptyTicketForm();
    }
  });
  const [patientResults, setPatientResults] = useState([]);
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [formError, setFormError] = useState('');
  const hasAppliedInitialData = useRef(false);

  useEffect(() => {
    if (!initialFormData || hasAppliedInitialData.current) {
      return;
    }

    hasAppliedInitialData.current = true;
    setFormData((previous) => ({
      ...previous,
      ...initialFormData,
      patientId: '',
    }));
  }, [initialFormData]);

  useEffect(() => {
    const searchTerm = formData.fullName.trim();
    if (!searchTerm || formData.patientId) {
      setPatientResults([]);
      return;
    }

    let isActive = true;
    setIsSearchingPatients(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchPatientsFromAPI(searchTerm);
        if (isActive) {
          setPatientResults(results || []);
          setShowPatientResults(true);
        }
      } catch {
        if (isActive) {
          setPatientResults([]);
        }
      } finally {
        if (isActive) {
          setIsSearchingPatients(false);
        }
      }
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [formData.fullName, formData.patientId]);

  useEffect(() => {
    if (!formData.region || regions.length === 0) return;
    const selectedRegion = regions.find((region) => region.name === formData.region);
    if (selectedRegion) {
      fetchProvinces(selectedRegion.code);
    }
  }, [formData.region, regions, fetchProvinces]);

  useEffect(() => {
    if (!formData.province || provinces.length === 0) return;
    const selectedProvince = provinces.find((province) => province.name === formData.province);
    if (selectedProvince) {
      fetchCities(selectedProvince.code);
    }
  }, [formData.province, provinces, fetchCities]);

  useEffect(() => {
    if (!formData.city || cities.length === 0) return;
    const selectedCity = cities.find((city) => city.name === formData.city);
    if (selectedCity) {
      fetchBarangays(selectedCity.code);
    }
  }, [formData.city, cities, fetchBarangays]);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
      ...(field === 'fullName' ? { patientId: '' } : {}),
    }));
    setFormError('');
  };

  const handlePatientSelect = (patient) => {
    setFormData((previous) => ({
      ...previous,
      patientId: patient.id,
      fullName: patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
      mobileNumber: patient.mobileNumber || '',
      email: patient.email || '',
      birthday: patient.birthday ? String(patient.birthday).slice(0, 10) : '',
      gender: patient.gender || '',
      addressLine1: patient.addressLine1 || '',
      region: patient.region || '',
      province: patient.province || '',
      city: patient.city || '',
      barangay: patient.barangay || '',
      hmoProvider: patient.hmoCompany || previous.hmoProvider,
      hmoMemberId: patient.hmoMemberId || previous.hmoMemberId,
      isUsingHmo: patient.hmoCompany || patient.hmoMemberId ? 'yes' : previous.isUsingHmo,
    }));
    setPatientResults([]);
    setShowPatientResults(false);
    setFormError('');
  };

  const handleRegionChange = (event) => {
    const selectedRegion = regions.find((region) => region.name === event.target.value);
    setFormData((previous) => ({
      ...previous,
      region: event.target.value,
      province: '',
      city: '',
      barangay: '',
    }));
    if (selectedRegion) {
      fetchProvinces(selectedRegion.code);
    }
    setFormError('');
  };

  const handleProvinceChange = (event) => {
    const selectedProvince = provinces.find((province) => province.name === event.target.value);
    setFormData((previous) => ({
      ...previous,
      province: event.target.value,
      city: '',
      barangay: '',
    }));
    if (selectedProvince) {
      fetchCities(selectedProvince.code);
    }
    setFormError('');
  };

  const handleCityChange = (event) => {
    const selectedCity = cities.find((city) => city.name === event.target.value);
    setFormData((previous) => ({
      ...previous,
      city: event.target.value,
      barangay: '',
    }));
    if (selectedCity) {
      fetchBarangays(selectedCity.code);
    }
    setFormError('');
  };

  const toggleSymptom = (symptom) => {
    setFormData((previous) => ({
      ...previous,
      symptoms: previous.symptoms.includes(symptom)
        ? previous.symptoms.filter((entry) => entry !== symptom)
        : [...previous.symptoms, symptom],
    }));
    setFormError('');
  };

  const handlePainMapViewChange = (view) => {
    if (!PAIN_MAP_VIEWS.includes(view)) return;
    updateField('painMapView', view);
  };

  const handlePainAreaToggle = (area) => {
    if (!area?.key || !area?.label) return;
    const areaId = `${formData.painMapView}:${area.key}`;

    setFormData((previous) => {
      const isSelected = previous.painAreas.some((entry) => entry.id === areaId);
      return {
        ...previous,
        painAreas: isSelected
          ? previous.painAreas.filter((entry) => entry.id !== areaId)
          : [
              ...previous.painAreas,
              {
                id: areaId,
                view: previous.painMapView,
                key: area.key,
                label: area.label,
              },
            ],
      };
    });
  };

  const handlePainAreaRemove = (areaId) => {
    setFormData((previous) => ({
      ...previous,
      painAreas: previous.painAreas.filter((entry) => entry.id !== areaId),
    }));
  };

  const adjustNumericField = (field, amount, min = 0, max = null) => {
    setFormData((previous) => {
      const current = Number(previous[field]) || 0;
      let next = current + amount;
      if (next < min) next = min;
      if (max !== null && next > max) next = max;
      return {
        ...previous,
        [field]: String(next),
      };
    });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full Name is required.';
    if (!formData.chiefComplaint.trim()) return 'Chief Complaint is required.';
    if (formData.symptoms.length === 0 && !formData.otherSymptoms.trim()) {
      return 'Select at least one symptom or enter other symptoms.';
    }
    if (!formData.consultationChannel) return 'Consultation Type is required.';
    return '';
  };

  const handleCreateTicket = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsCreatingTicket(true);
    setFormError('');

    try {
      const payload = {
        patientId: formData.patientId ? Number(formData.patientId) : undefined,
        patientName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        birthday: formData.birthday,
        gender: formData.gender,
        addressLine1: formData.addressLine1.trim(),
        region: formData.region.trim(),
        province: formData.province.trim(),
        city: formData.city.trim(),
        barangay: formData.barangay.trim(),
        chiefComplaint: formData.chiefComplaint.trim(),
        symptoms: formData.symptoms.join(', '),
        otherSymptoms: formData.otherSymptoms.trim(),
        preferredDate: new Date().toISOString().slice(0, 10),
        preferredTime: new Date().toTimeString().slice(0, 5),
        consultationChannel: formData.consultationChannel,
        isUsingHmo: formData.isUsingHmo === 'yes',
        hmoProvider: formData.hmoProvider.trim(),
        hmoMemberId: formData.hmoMemberId.trim(),
        painAreas: formData.painAreas,
        selectedPainAreas: formData.painAreas,
        painMapView: formData.painMapView,
        durationValue: formData.durationValue ? Number(formData.durationValue) : null,
        durationUnit: formData.durationUnit,
        severity: Number(formData.severity) || null,
      };

      const createdTicket = await createTicket(payload);
      localStorage.removeItem(CREATE_TICKET_DRAFT_KEY);
      setFormData(createEmptyTicketForm());
      onTicketCreated(createdTicket);
    } catch (error) {
      setFormError(error.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const genderOptions = ['Male', 'Female', 'Other'].map((value) => ({
    label: value,
    value,
  }));
  const subscriptionOptions = SUBSCRIPTION_TYPES.map((value) => ({
    label: value,
    value,
  }));
  const regionOptions = regions.map((region) => ({
    label: region.name,
    value: region.name,
  }));
  const provinceOptions = provinces.map((province) => ({
    label: province.name,
    value: province.name,
  }));
  const cityOptions = cities.map((city) => ({
    label: city.name,
    value: city.name,
  }));
  const barangayOptions = barangays.map((barangay) => ({
    label: barangay.name,
    value: barangay.name,
  }));

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-topbar">
        <div className="create-ticket-title-row">
          <button type="button" className="create-ticket-back" onClick={onBack} aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <UserPlus size={30} className="create-ticket-title-icon" />
          <div>
            <h1>Create Consultation Ticket</h1>
            <p>Nurse-assisted patient registration</p>
          </div>
        </div>
        <div className="create-ticket-actions">
          <button
            type="button"
            className="create-ticket-primary-btn"
            onClick={handleCreateTicket}
            disabled={isCreatingTicket}
          >
            <FileText size={18} />
            {isCreatingTicket ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </div>

      <main className="create-ticket-scroll">
        {formError && <div className="create-ticket-alert">{formError}</div>}

        <section className="create-ticket-card">
          <h2>Patient Information</h2>
          <div className="create-ticket-field full create-ticket-search-field">
            <label>Full Name *</label>
            <div
              className="create-ticket-search-wrap"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setShowPatientResults(false);
                }
              }}
            >
              <Search size={17} />
              <input
                type="text"
                value={formData.fullName}
                placeholder="Enter full name"
                onChange={(event) => updateField('fullName', event.target.value)}
                onFocus={() => setShowPatientResults(patientResults.length > 0)}
              />
              {showPatientResults && (
                <div className="create-ticket-patient-menu">
                  {isSearchingPatients ? (
                    <div className="create-ticket-patient-empty">Searching patients...</div>
                  ) : patientResults.length > 0 ? (
                    patientResults.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        className="create-ticket-patient-option"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handlePatientSelect(patient);
                        }}
                      >
                        <strong>{patient.fullName}</strong>
                        <span>{patient.mobileNumber || patient.email || 'Existing patient'}</span>
                      </button>
                    ))
                  ) : (
                    <div className="create-ticket-patient-empty">No patients found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="create-ticket-grid two">
            <div className="create-ticket-field">
              <label>Mobile Number *</label>
              <input
                type="text"
                value={formData.mobileNumber}
                placeholder="+63 XXX XXX XXXX"
                readOnly={Boolean(formData.patientId)}
                onChange={(event) => updateField('mobileNumber', event.target.value)}
              />
            </div>
            <div className="create-ticket-field">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                placeholder="email@example.com"
                readOnly={Boolean(formData.patientId)}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </div>
            <div className="create-ticket-field">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.birthday}
                readOnly={Boolean(formData.patientId)}
                onChange={(event) => updateField('birthday', event.target.value)}
              />
            </div>
            <div className="create-ticket-field">
              <label>Gender</label>
              <CreateTicketSelect
                value={formData.gender}
                disabled={Boolean(formData.patientId)}
                placeholder="Select gender"
                options={genderOptions}
                onChange={(value) => updateField('gender', value)}
              />
            </div>
          </div>
        </section>

        <section className="create-ticket-card">
          <h2>Address</h2>
          <div className="create-ticket-field full">
            <label>Street Address</label>
            <input
              value={formData.addressLine1}
              placeholder="House/Unit/Building No., Street Name"
              readOnly={Boolean(formData.patientId)}
              onChange={(event) => updateField('addressLine1', event.target.value)}
            />
          </div>
          <div className="create-ticket-grid two">
            <div className="create-ticket-field">
              <label>Region</label>
              <CreateTicketSelect
                value={formData.region}
                disabled={Boolean(formData.patientId) || psgcLoading.regions}
                placeholder={psgcLoading.regions ? 'Loading regions...' : 'Select region'}
                options={regionOptions}
                onChange={(value) => handleRegionChange({ target: { value } })}
              />
            </div>
            <div className="create-ticket-field">
              <label>Province</label>
              <CreateTicketSelect
                value={formData.province}
                disabled={Boolean(formData.patientId) || !formData.region || psgcLoading.provinces}
                placeholder={psgcLoading.provinces ? 'Loading provinces...' : 'Select province'}
                options={provinceOptions}
                onChange={(value) => handleProvinceChange({ target: { value } })}
              />
            </div>
            <div className="create-ticket-field">
              <label>City / Municipality</label>
              <CreateTicketSelect
                value={formData.city}
                disabled={Boolean(formData.patientId) || !formData.province || psgcLoading.cities}
                placeholder={psgcLoading.cities ? 'Loading cities...' : 'Select city / municipality'}
                options={cityOptions}
                onChange={(value) => handleCityChange({ target: { value } })}
              />
            </div>
            <div className="create-ticket-field">
              <label>Barangay</label>
              <CreateTicketSelect
                value={formData.barangay}
                disabled={Boolean(formData.patientId) || !formData.city || psgcLoading.barangays}
                placeholder={psgcLoading.barangays ? 'Loading barangays...' : 'Select barangay'}
                options={barangayOptions}
                onChange={(value) => updateField('barangay', value)}
              />
            </div>
          </div>
        </section>

        <section className="create-ticket-card">
          <h2>Healthcare Information</h2>
          <div className="create-ticket-radio-row">
            <label>PhilHealth Member?</label>
            <label><input type="radio" name="hmo" checked={formData.isUsingHmo === 'yes'} onChange={() => updateField('isUsingHmo', 'yes')} /> Yes</label>
            <label><input type="radio" name="hmo" checked={formData.isUsingHmo === 'no'} onChange={() => updateField('isUsingHmo', 'no')} /> No</label>
          </div>
          <div className="create-ticket-field full">
            <label>HMO Provider (Optional)</label>
            <input value={formData.hmoProvider} placeholder="e.g., Maxicare, Medicard" onChange={(event) => updateField('hmoProvider', event.target.value)} />
          </div>
          <div className="create-ticket-field full">
            <label>Subscription Type</label>
            <CreateTicketSelect
              value={formData.subscriptionType}
              placeholder="Select subscription type"
              options={subscriptionOptions}
              onChange={(value) => updateField('subscriptionType', value)}
            />
          </div>
        </section>

        <section className="create-ticket-card">
          <h2>Consultation Type *</h2>
          <div className="create-ticket-field full">
            <CreateTicketSelect
              value={formData.consultationChannel}
              placeholder="Select consultation type"
              options={CONSULTATION_TYPES}
              onChange={(value) => updateField('consultationChannel', value)}
            />
          </div>
        </section>

        <section className="create-ticket-card">
          <h2>Initial Intake</h2>
          <div className="create-ticket-field full">
            <label>Chief Complaint</label>
            <textarea
              value={formData.chiefComplaint}
              placeholder="Describe the main complaint..."
              onChange={(event) => updateField('chiefComplaint', event.target.value)}
            />
          </div>
          <label className="create-ticket-mini-label">Common Symptoms</label>
          <div className="triage-symptom-pills create-ticket-symptom-pills">
            {COMMON_SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                type="button"
                className={`triage-symptom-pill ${formData.symptoms.includes(symptom) ? 'selected' : ''}`}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>
          <div className="create-ticket-field full">
            <label>Other Symptoms</label>
            <input
              value={formData.otherSymptoms}
              placeholder="Additional symptoms not listed above..."
              onChange={(event) => updateField('otherSymptoms', event.target.value)}
            />
          </div>
        </section>

        <section className="create-ticket-pain-shell">
          <article className="triage-pain-map-card">
            <h4>Pain Map</h4>
            <div className="triage-pain-map-controls-row">
              <div className="triage-pain-map-view-toggle" role="tablist" aria-label="Pain map view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={formData.painMapView === 'front'}
                  className={`triage-pain-map-view-btn ${formData.painMapView === 'front' ? 'active' : ''}`}
                  onClick={() => handlePainMapViewChange('front')}
                >
                  Front
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={formData.painMapView === 'back'}
                  className={`triage-pain-map-view-btn ${formData.painMapView === 'back' ? 'active' : ''}`}
                  onClick={() => handlePainMapViewChange('back')}
                >
                  Back
                </button>
              </div>
              <div className="triage-pain-readonly-meta inline">
                <div className="triage-vitals-grid triage-vitals-grid-readonly inline">
                  <div className="triage-pain-meta-item">
                    <label>Pain Score</label>
                    <div className="triage-vital-input-wrap triage-vital-input-wrap-meta">
                      <input
                        className="triage-vital-input with-unit create-ticket-number-field"
                        type="text"
                        min="0"
                        max="10"
                        value={formData.severity}
                        onChange={(event) => updateField('severity', event.target.value.replace(/\D/g, '').slice(0, 2))}
                      />
                      <div className="create-ticket-number-stepper" aria-label="Pain score controls">
                        <button type="button" onClick={() => adjustNumericField('severity', 1, 0, 10)} aria-label="Increase pain score">
                          <ChevronUp size={12} strokeWidth={2.5} />
                        </button>
                        <button type="button" onClick={() => adjustNumericField('severity', -1, 0, 10)} aria-label="Decrease pain score">
                          <ChevronDown size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                      <span className="triage-vital-unit">/10</span>
                    </div>
                  </div>
                  <div className="triage-pain-meta-item triage-pain-meta-item-duration">
                    <label>Pain Duration</label>
                    <div className="triage-vital-input-wrap triage-vital-input-wrap-duration triage-vital-input-wrap-meta">
                      <input
                        className="triage-vital-input with-unit create-ticket-number-field"
                        type="text"
                        min="0"
                        value={formData.durationValue}
                        onChange={(event) => updateField('durationValue', event.target.value.replace(/\D/g, '').slice(0, 3))}
                      />
                      <div className="create-ticket-number-stepper" aria-label="Pain duration controls">
                        <button type="button" onClick={() => adjustNumericField('durationValue', 1, 0)} aria-label="Increase pain duration">
                          <ChevronUp size={12} strokeWidth={2.5} />
                        </button>
                        <button type="button" onClick={() => adjustNumericField('durationValue', -1, 0)} aria-label="Decrease pain duration">
                          <ChevronDown size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                      <select
                        className="create-ticket-duration-unit"
                        value={formData.durationUnit}
                        onChange={(event) => updateField('durationUnit', event.target.value)}
                      >
                        {DURATION_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="triage-pain-map-content">
              <div className="triage-pain-map-picker">
                <div className={`triage-pain-map-figure ${formData.painMapView === 'back' ? 'back' : 'front'}`}>
                  {PAIN_MAP_AREAS[formData.painMapView].map((area) => {
                    const areaId = `${formData.painMapView}:${area.key}`;
                    const isSelected = formData.painAreas.some((entry) => entry.id === areaId);
                    return (
                      <button
                        key={areaId}
                        type="button"
                        className={`triage-body-part ${area.className} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handlePainAreaToggle(area)}
                        aria-pressed={isSelected}
                        aria-label={`${area.label} (${formData.painMapView})`}
                      />
                    );
                  })}
                </div>
              </div>

              <figure className="triage-pain-reference-card">
                <img src={referredPainChart} alt="Referred pain reference chart" />
              </figure>

              <div className="triage-pain-map-selection">
                <div className="triage-pain-map-selection-title">Selected pain areas:</div>
                {formData.painAreas.length === 0 ? (
                  <div className="triage-pain-map-empty">No areas selected</div>
                ) : (
                  <div className="triage-pain-map-chips">
                    {formData.painAreas.map((area) => (
                      <div key={area.id} className="triage-pain-map-chip">
                        <span>{area.label}{` (${area.view === 'back' ? 'Back' : 'Front'})`}</span>
                        <button type="button" className="triage-pain-map-chip-remove" onClick={() => handlePainAreaRemove(area.id)} aria-label={`Remove ${area.label}`}>
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="triage-pain-map-instruction">Click on body parts to mark pain locations</div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default function ManageAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [createTicketPrefill, setCreateTicketPrefill] = useState(null);

  useEffect(() => {
    if (!location.state?.openCreateTicket) {
      return;
    }

    setIsCreateTicketOpen(true);
    setCreateTicketPrefill(location.state?.createTicketPrefill || null);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!USE_API) {
      // console.log('ManageAppointments: API disabled, no data will be loaded');
      return;
    }

    const loadTicketsData = async () => {
      /* console.log(
        'ManageAppointments: Loading tickets from API for logged-in nurse...',
      ); */
      try {
        const data = await fetchTicketsFromAPI();
        // console.log('ManageAppointments: Tickets loaded from API:', data);
        /* console.log(
          'ManageAppointments: API returned',
          data?.length,
          'tickets',
        ); */
        /* console.log(
          'ManageAppointments: Checking claimedBy fields:',
          data?.map((t) => ({
            id: t.id,
            status: t.status,
            claimedBy: t.claimedBy,
          })),
        ); */

        setTickets((prevTickets) => {
          let triageDraftsByTicketId = {};
          try {
            const rawDrafts = localStorage.getItem(TRIAGE_DRAFTS_STORAGE_KEY);
            const parsedDrafts = rawDrafts ? JSON.parse(rawDrafts) : {};
            triageDraftsByTicketId =
              parsedDrafts && typeof parsedDrafts === 'object' ? parsedDrafts : {};
          } catch {
            triageDraftsByTicketId = {};
          }

          const apiTickets = data || [];
          const apiTicketIds = new Set(apiTickets.map((t) => t.id));

          const prunedDrafts = {};
          for (const apiTicket of apiTickets) {
            const draft = triageDraftsByTicketId[Number(apiTicket.id)];
            if (!draft) continue;

            const ticketFingerprint = getTicketDraftFingerprint(apiTicket);
            if (
              !draft.__ticketFingerprint ||
              !ticketFingerprint ||
              draft.__ticketFingerprint === ticketFingerprint
            ) {
              prunedDrafts[Number(apiTicket.id)] = draft;
            }
          }

          try {
            localStorage.setItem(
              TRIAGE_DRAFTS_STORAGE_KEY,
              JSON.stringify(prunedDrafts),
            );
          } catch {
            // Ignore localStorage write failures.
          }

          const localOnlyTickets = prevTickets.filter(
            (t) => !apiTicketIds.has(t.id),
          );

          const mergedApiTickets = apiTickets.map((apiTicket) => {
            const localTicket = prevTickets.find((t) => t.id === apiTicket.id);
            const localDraft = prunedDrafts[Number(apiTicket.id)] || {};
            const draftStatus = localDraft.status || localDraft.triageStatus || null;

            return {
              ...apiTicket,
              status: draftStatus || apiTicket.status || localTicket?.status,
              claimedBy: apiTicket.claimedBy || localTicket?.claimedBy || null,
            };
          });

          const mergedTickets = [...mergedApiTickets, ...localOnlyTickets];

          /* console.log('ManageAppointments: Merged tickets count:', {
            fromAPI: apiTickets.length,
            localOnly: localOnlyTickets.length,
            total: mergedTickets.length,
          }); */

          /* console.log(
            'ManageAppointments: Sample ticket after merge:',
            mergedTickets[0],
          ); */

          return mergedTickets;
        });
      } catch (error) {
        console.error(
          'ManageAppointments: Error loading tickets from API:',
          error,
        );
      }
    };

    loadTicketsData();

    const interval = setInterval(loadTicketsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceTicket, setInvoiceTicket] = useState(null);
  const [specialistAvailable, setSpecialistAvailable] = useState(null);
  const [hmoVerified, setHmoVerified] = useState(null);
  const [assignedSpecialist, setAssignedSpecialist] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [ticketDetailTab, setTicketDetailTab] = useState('assessment');
  const [urgency, setUrgency] = useState('medium');
  const [targetSpecialty, setTargetSpecialty] = useState('');
  const [isTriaging, setIsTriaging] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
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

  const nurseName = getNurseFirstName();
  const nurseId = user?.id ?? null;

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsData = await fetchDoctorsFromAPI();
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error('Error loading doctors:', error);
        setDoctors([
          { id: 1, name: 'Dr. Smith', specialization: 'General Medicine' },
          { id: 2, name: 'Dr. Lee', specialization: 'Cardiology' },
          { id: 3, name: 'Dr. Patel', specialization: 'Neurology' },
        ]);
      }
    };
    loadDoctors();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/');
  };

  const handleNurseTicketCreated = (createdTicket) => {
    const nextTicket = createdTicket?.data || createdTicket;
    if (nextTicket) {
      setTickets((previous) => [nextTicket, ...previous]);
    }
    setIsCreateTicketOpen(false);
    addNotification('Ticket Created', 'The consultation ticket was added to the patient queue.');
  };

  const updateStatus = async (ticketId, newStatus) => {
    /* console.log(
      'ManageAppointments: Updating ticket status:',
      ticketId,
      newStatus,
    ); */

    if (!USE_API) {
      // console.log('ManageAppointments: API disabled, updating status locally');
      setTickets((prev) => updateTicketStatus(prev, ticketId, newStatus));

      if (newStatus === 'For Payment')
        addNotification('Payment', `Invoice generated for ticket ${ticketId}`);
      if (newStatus === 'Confirmed')
        addNotification(
          'Payment Confirmation',
          `Payment confirmed for ticket ${ticketId}`,
        );
      return;
    }

    try {
      await updateTicket(ticketId, { status: newStatus });
      /* console.log(
        'ManageAppointments: Ticket status updated successfully in API',
      ); */

      setTickets((prev) => updateTicketStatus(prev, ticketId, newStatus));

      if (newStatus === 'For Payment')
        addNotification('Payment', `Invoice generated for ticket ${ticketId}`);
      if (newStatus === 'Confirmed')
        addNotification(
          'Payment Confirmation',
          `Payment confirmed for ticket ${ticketId}`,
        );
    } catch (error) {
      console.error(
        'ManageAppointments: Error updating ticket status in API:',
        error,
      );

      setTickets((prev) => updateTicketStatus(prev, ticketId, newStatus));

      if (newStatus === 'For Payment')
        addNotification(
          'Payment',
          `Invoice generated locally (API unavailable)`,
        );
      if (newStatus === 'Confirmed')
        addNotification(
          'Payment Confirmation',
          `Payment confirmed locally (API unavailable)`,
        );
    }
  };

  const openInvoice = (ticket) => {
    setInvoiceTicket(ticket);
    setShowInvoiceModal(true);
  };

  const simulatePayment = (ticketId) => {
    updateStatus(ticketId, 'Confirmed');
  };

  const handleReschedule = async (ticketId) => {
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select both date and time for rescheduling.');
      return;
    }

    // console.log('ManageAppointments: Rescheduling ticket:', ticketId);

    if (!USE_API) {
      // console.log('ManageAppointments: API disabled, rescheduling locally');
      setTickets((prev) =>
        rescheduleTicket(prev, ticketId, rescheduleDate, rescheduleTime),
      );
      setRescheduleDate('');
      setRescheduleTime('');
      alert('Appointment rescheduled successfully!');
      addNotification(
        'Reschedule',
        `Ticket ${ticketId} rescheduled to ${rescheduleDate} at ${rescheduleTime}`,
      );
      return;
    }

    try {
      await updateTicket(ticketId, {
        preferredDate: rescheduleDate,
        preferredTime: rescheduleTime,
      });
      // console.log('ManageAppointments: Ticket rescheduled successfully in API');

      setTickets((prev) =>
        rescheduleTicket(prev, ticketId, rescheduleDate, rescheduleTime),
      );
      setRescheduleDate('');
      setRescheduleTime('');
      alert('Appointment rescheduled successfully!');
      addNotification(
        'Reschedule',
        `Ticket ${ticketId} rescheduled to ${rescheduleDate} at ${rescheduleTime}`,
      );
    } catch (error) {
      console.error(
        'ManageAppointments: Error rescheduling ticket in API:',
        error,
      );

      setTickets((prev) =>
        rescheduleTicket(prev, ticketId, rescheduleDate, rescheduleTime),
      );
      setRescheduleDate('');
      setRescheduleTime('');
      alert('Appointment rescheduled locally (API unavailable)');
      addNotification('Reschedule', `Ticket ${ticketId} rescheduled locally`);
    }
  };

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
          triageData,
        );
      }

      alert('Ticket triaged successfully!');
      setSelectedTicket(null);
      window.location.reload();
    } catch (error) {
      console.error('Error triaging ticket:', error);
      alert('Failed to triage ticket: ' + error.message);
    } finally {
      setIsTriaging(false);
    }
  };

  const processingTickets = filterTicketsByStatus(
    tickets,
    'Processing',
    nurseId,
  );

  const handleDownloadInvoice = async (billingPayload) => {
    await generatePostConsultationBillingPDF(billingPayload);
  };

  const handleSendToPatient = () => {
    alert('Send to Patient is interactive but not connected yet.');
  };

  const handleRedirectPaymentGateway = () => {
    alert('Redirect to Payment Gateway is interactive but not connected yet.');
  };

  const handleViewBillingHistory = () => {
    alert('View History is interactive but not connected yet.');
  };

  if (isCreateTicketOpen) {
    return (
      <NurseCreateTicketWorkspace
        onBack={() => setIsCreateTicketOpen(false)}
        onTicketCreated={handleNurseTicketCreated}
        initialFormData={createTicketPrefill}
      />
    );
  }

  return (
    <div className='dashboard nurse-manage-dashboard'>
      <div className='dashboard-header'>
        <div className='header-center'>
          <img
            src='/okie-doc-logo.png'
            alt='Okie-Doc+'
            className='logo-image'
          />
        </div>
        <h3 className='dashboard-title'>Manage Appointments</h3>
        <div className='nurse-header-actions'>
          <NotificationBell />
          <div className='user-account'>
            <Avatar
              profileImageUrl={getNurseProfileImage() !== '/account.svg' ? getNurseProfileImage() : null}
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
            className='nav-tab'
            onClick={() => navigate('/nurse-dashboard')}
          >
            Dashboard
          </button>
          <button className='nav-tab active'>Manage Appointments</button>
          <button
            className='nav-tab'
            onClick={() => navigate('/nurse-messages')}
          >
            Messages
          </button>
        </div>
      </div>

      <div className='appointments-section'>
        <div className='tickets-container'>
          <div className='processing-tickets'>
            <div className='processing-tickets-header'>
              <div>
                <h2>Processing Tickets</h2>
                <p>Patients currently being handled by triage.</p>
              </div>
              <div className="processing-ticket-header-actions">
                <span className="processing-ticket-count">
                  {processingTickets.length}
                </span>
                <button
                  type="button"
                  className="create-ticket-entry-btn"
                  onClick={() => setIsCreateTicketOpen(true)}
                >
                  <ClipboardPlus size={18} />
                  Create Ticket
                </button>
              </div>
            </div>
            {processingTickets.map((ticket) => (
              <div
                key={ticket.id}
                className='ticket-card-new processing-ticket-card'
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowTicketDetailModal(true);
                  setTicketDetailTab('assessment');
                }}
              >
                <div className='ticket-card-header'>
                  <span className='ticket-number'>TICKET #{ticket.id}</span>
                  <span className='ticket-status-text processing'>
                    {ticket.status}
                  </span>
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
                            {formatDate(ticket.patientBirthdate) || 'N/A'}
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
                        {ticket.assignedNurse || nurseName}
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
                        {formatDate(ticket.createdAt) || ticket.dateCreated}
                      </p>
                    </div>

                    <div
                      className='ticket-actions'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className='ticket-history-btn'
                        onClick={() => openInvoice(ticket)}
                      >
                        Generate Invoice
                      </button>
                      {!ticket.claimedBy && (
                        <button
                          className='ticket-history-btn'
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          Manage
                        </button>
                      )}
                      <button
                        className='ticket-history-btn ticket-history-btn-success'
                        onClick={() => simulatePayment(ticket.id)}
                      >
                        Simulate Payment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {selectedTicket && !showTicketDetailModal && (
        <div className='modal-overlay'>
          <div className='ticket-modal'>
            <div className='modal-header'>
              <h2>Patient Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className='close-btn'
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <div className='patient-info'>
                <h3>Patient Information</h3>
                <div className='info-grid'>
                  <div className='info-item'>
                    <label>Name:</label>
                    <span>{selectedTicket.patientName}</span>
                  </div>
                  <div className='info-item'>
                    <label>Email:</label>
                    <span>{selectedTicket.email}</span>
                  </div>
                  <div className='info-item'>
                    <label>Mobile:</label>
                    <span>{selectedTicket.mobile}</span>
                  </div>
                </div>
              </div>

              <div className='medical-info'>
                <h3>Medical Information</h3>
                <div className='info-grid'>
                  <div className='info-item'>
                    <label>Chief Complaint:</label>
                    <span>{selectedTicket.chiefComplaint}</span>
                  </div>
                  <div className='info-item'>
                    <label>Symptoms:</label>
                    <span>{selectedTicket.symptoms}</span>
                  </div>
                  <div className='info-item'>
                    <label>Other Symptoms:</label>
                    <span>{selectedTicket.otherSymptoms || 'None'}</span>
                  </div>
                  <div className='info-item'>
                    <label>Actual Chief Complaint (Nurse):</label>
                    <span>{selectedTicket.actualChiefComplaint || ''}</span>
                  </div>
                  <div className='info-item'>
                    <label>Medical Records:</label>
                    <div className='view-pills-container'>
                      {selectedTicket.medicalRecordsPills &&
                      selectedTicket.medicalRecordsPills.length > 0 ? (
                        <div className='view-pills'>
                          {selectedTicket.medicalRecordsPills.map(
                            (text, index) => (
                              <div key={index} className='view-pill'>
                                <span>{text}</span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className='info-item'>
                    <label>Family History:</label>
                    <div className='view-pills-container'>
                      {selectedTicket.familyHistoryPills &&
                      selectedTicket.familyHistoryPills.length > 0 ? (
                        <div className='view-pills'>
                          {selectedTicket.familyHistoryPills.map(
                            (text, index) => (
                              <div key={index} className='view-pill'>
                                <span>{text}</span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className='info-item'>
                    <label>Allergies:</label>
                    <div className='view-pills-container'>
                      {selectedTicket.allergiesPills &&
                      selectedTicket.allergiesPills.length > 0 ? (
                        <div className='view-pills'>
                          {selectedTicket.allergiesPills.map((text, index) => (
                            <div key={index} className='view-pill'>
                              <span>{text}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className='info-item'>
                    <label>Smoking:</label>
                    <span>{selectedTicket.smoking || ''}</span>
                  </div>
                  <div className='info-item'>
                    <label>Drinking:</label>
                    <span>{selectedTicket.drinking || ''}</span>
                  </div>
                </div>
              </div>

              <div className='appointment-info'>
                <h3>Appointment Details</h3>
                <div className='info-grid'>
                  <div className='info-item'>
                    <label>Preferred Date:</label>
                    <span>{formatDate(selectedTicket.preferredDate)}</span>
                  </div>
                  <div className='info-item'>
                    <label>Preferred Time:</label>
                    <span>{selectedTicket.preferredTime}</span>
                  </div>
                  <div className='info-item'>
                    <label>Preferred Specialist:</label>
                    <span>{selectedTicket.preferredSpecialist}</span>
                  </div>
                  <div className='info-item'>
                    <label>Consultation Channel:</label>
                    <span>{selectedTicket.consultationChannel}</span>
                  </div>
                </div>
              </div>

              {selectedTicket.hmo && (
                <div className='hmo-info'>
                  <h3>HMO Information</h3>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <label>Company:</label>
                      <span>{selectedTicket.hmo.company}</span>
                    </div>
                    <div className='info-item'>
                      <label>Member ID:</label>
                      <span>{selectedTicket.hmo.memberId}</span>
                    </div>
                    <div className='info-item'>
                      <label>Expiration Date:</label>
                      <span>{selectedTicket.hmo.expirationDate}</span>
                    </div>
                    <div className='info-item'>
                      <label>LOA Code:</label>
                      <span>{selectedTicket.hmo.loaCode}</span>
                    </div>
                    <div className='info-item'>
                      <label>eLOA File:</label>
                      <span>{selectedTicket.hmo.eLOAFile}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className='specialist-verification'>
                <h3>Specialist & HMO Verification</h3>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 12,
                    justifyContent: 'center',
                  }}
                >
                  <button
                    className='action-btn confirm'
                    style={{ background: '#4caf50', color: '#fff' }}
                    onClick={() => setSpecialistAvailable(true)}
                  >
                    Specialist Available
                  </button>
                  <button
                    className='action-btn warn'
                    style={{ background: '#ff9800', color: '#fff' }}
                    onClick={() => setSpecialistAvailable(false)}
                  >
                    Specialist Unavailable
                  </button>
                </div>
                {selectedTicket.hasHMO && (
                  <div
                    style={{
                      marginBottom: 12,
                      display: 'flex',
                      gap: 16,
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      className='action-btn confirm'
                      style={{ background: '#2196f3', color: '#fff' }}
                      onClick={() => setHmoVerified(true)}
                    >
                      Verify HMO
                    </button>
                    <button
                      className='action-btn warn'
                      style={{ background: '#f44336', color: '#fff' }}
                      onClick={() => setHmoVerified(false)}
                    >
                      Reject HMO
                    </button>
                  </div>
                )}
                {specialistAvailable === true && (
                  <div style={{ marginBottom: 12, color: '#4caf50' }}>
                    Specialist is available for consultation.
                  </div>
                )}
                {specialistAvailable === false && (
                  <div style={{ marginBottom: 12, color: '#ff9800' }}>
                    Specialist is unavailable. Please call patient for
                    arrangement or reschedule.
                  </div>
                )}
                {hmoVerified === true && (
                  <div style={{ marginBottom: 12, color: '#2196f3' }}>
                    HMO verified. You may proceed to generate invoice charged to
                    HMO.
                  </div>
                )}
                {hmoVerified === false && (
                  <div style={{ marginBottom: 12, color: '#f44336' }}>
                    HMO details cannot be verified. Please contact patient for
                    arrangement.
                  </div>
                )}
              </div>

              <div
                className='specialist-actions'
                style={{ marginTop: 24, marginBottom: 16 }}
              >
                <h3 style={{ marginBottom: 16 }}>Triage & Assign</h3>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Target Specialty:
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. Pediatrics, Cardiology'
                    value={targetSpecialty}
                    onChange={(e) => setTargetSpecialty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 4,
                    }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Urgency:
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 4,
                    }}
                  >
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Assign Specialist (Optional):
                  </label>
                  <select
                    id='specialist-select'
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 4,
                    }}
                    value={assignedSpecialist}
                    onChange={(e) => setAssignedSpecialist(e.target.value)}
                  >
                    <option value=''>Select Specialist</option>
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
                    padding: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: 4,
                  }}
                  disabled={isTriaging}
                  onClick={() => handleCompleteTriage(selectedTicket.id)}
                >
                  {isTriaging ? 'Completing Triage...' : 'Complete Triage'}
                </button>
              </div>
              <div
                className='reschedule-actions'
                style={{ marginTop: 16, marginBottom: 0 }}
              >
                <h3 style={{ marginBottom: 8 }}>Reschedule</h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    justifyContent: 'center',
                  }}
                >
                  <label htmlFor='reschedule-date' style={{ marginRight: 4 }}>
                    Date:
                  </label>
                  <input
                    id='reschedule-date'
                    type='date'
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    style={{
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                    }}
                  />
                  <label htmlFor='reschedule-time' style={{ marginRight: 4 }}>
                    Time:
                  </label>
                  <input
                    id='reschedule-time'
                    type='time'
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    style={{
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                    }}
                  />
                  <button
                    className='action-btn'
                    style={{
                      background: '#2196f3',
                      color: '#fff',
                      padding: '6px 16px',
                      borderRadius: 4,
                    }}
                    onClick={() => handleReschedule(selectedTicket.id)}
                  >
                    Reschedule
                  </button>
                </div>
              </div>

              <div className='ros-info' style={{ marginTop: 24 }}>
                <h3>Review of Systems</h3>
                <div className='info-grid'>
                  {selectedTicket.ros &&
                  Object.values(selectedTicket.ros).flat().length > 0 ? (
                    Object.values(selectedTicket.ros)
                      .flat()
                      .map((item, idx) => (
                        <div key={idx} className='info-item'>
                          <span>{item}</span>
                        </div>
                      ))
                  ) : (
                    <div className='info-item'>No ROS data provided.</div>
                  )}
                </div>
              </div>

              <div className='painmap-info' style={{ marginTop: 24 }}>
                <h3>Pain Map</h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <img
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/1506_Referred_Pain_Chart.jpg/1280px-1506_Referred_Pain_Chart.jpg'
                    alt='Pain Map'
                    style={{
                      height: 180,
                      borderRadius: 8,
                      border: '1px solid #ccc',
                      background: '#fff',
                      marginBottom: 12,
                    }}
                  />
                  <div style={{ textAlign: 'center' }}>
                    {selectedTicket.painMap &&
                    selectedTicket.painMap.length > 0 ? (
                      selectedTicket.painMap.map((area, idx) => (
                        <div key={idx} className='info-item'>
                          <span>{area}</span>
                        </div>
                      ))
                    ) : (
                      <div className='info-item'>No pain areas selected.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className='ticket-actions' style={{ marginTop: 12 }}>
                <button
                  className='action-btn edit'
                  onClick={() => openInvoice(selectedTicket)}
                >
                  Generate Invoice
                </button>
                {selectedTicket.status === 'Processing' && (
                  <button
                    className='action-btn edit'
                    onClick={() => {
                      updateStatus(selectedTicket.id, 'Completed');
                    }}
                    style={{ backgroundColor: '#28a745' }}
                  >
                    Mark Completed
                  </button>
                )}
                <button
                  className='action-btn'
                  onClick={() => updateStatus(selectedTicket.id, 'Incomplete')}
                >
                  Mark Incomplete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PostConsultationBillingModal
        isOpen={showInvoiceModal}
        ticket={invoiceTicket}
        onClose={() => setShowInvoiceModal(false)}
        onDownloadPDF={handleDownloadInvoice}
        onSendToPatient={handleSendToPatient}
        onRedirectPaymentGateway={handleRedirectPaymentGateway}
        onViewHistory={handleViewBillingHistory}
      />

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
                  {selectedTicket.assignedNurse || nurseName || 'N/A'}
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  <strong>Assigned Specialist:</strong>{' '}
                  {selectedTicket.assignedSpecialist || 'Not specified'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Consultation Type:</strong>{' '}
                  {selectedTicket.consultationChannel ||
                    selectedTicket.chiefComplaint}
                </p>
              </div>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button
                  className='action-btn'
                  style={{
                    background: '#0b5388',
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: 20,
                  }}
                  onClick={() => alert('Feature in progress')}
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
              {ticketDetailTab === 'assessment' && (
                <div>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    "Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt explicabo. Nemo
                    enim ipsam
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    voluptatem quia voluptas sit aspernatur aut odit aut fugit,
                    sed quia consequuntur magni dolores eos qui ratione
                    voluptatem sequi nesciunt. Neque porro quisquam est, qui
                    dolorem ipsum quia dolor sit amet, consectetur, adipisci
                    velit, sed quia non numquam eius modi tempora incidunt ut
                    labore et dolore magnam aliquam quaerat voluptatem.
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Ut enim ad minima veniam, quis nostrum exercitationem ullam
                    corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                    consequatur? Quis autem vel eum iure reprehenderit qui in ea
                    voluptate velit esse quam nihil molestiae consequatur, vel
                    illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
                  </p>
                </div>
              )}

              {ticketDetailTab === 'medicalHistory' && (
                <div>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    sed do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum."
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </div>
              )}

              {ticketDetailTab === 'laboratoryRequest' && (
                <div>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    "At vero eos et accusamus et iusto odio dignissimos ducimus
                    qui blanditiis praesentium voluptatum deleniti atque
                    corrupti quos dolores et quas molestias excepturi sint
                    occaecati cupiditate non provident.
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Similique sunt in culpa qui officia deserunt mollitia animi,
                    id est laborum et dolorum fuga. Et harum quidem rerum
                    facilis est et expedita distinctio."
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Nam libero tempore, cum soluta nobis est eligendi optio
                    cumque nihil impedit quo minus id quod maxime placeat facere
                    possimus, omnis voluptas assumenda est, omnis dolor
                    repellendus.
                  </p>
                </div>
              )}

              {ticketDetailTab === 'prescription' && (
                <div>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    "Temporibus autem quibusdam et aut officiis debitis aut
                    rerum necessitatibus saepe eveniet ut et voluptates
                    repudiandae sint et molestiae non recusandae. Itaque earum
                    rerum hic tenetur a sapiente delectus.
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Ut aut reiciendis voluptatibus maiores alias consequatur aut
                    perferendis doloribus asperiores repellat. Nam libero
                    tempore, cum soluta nobis est eligendi optio cumque nihil
                    impedit quo minus id quod maxime placeat facere possimus."
                  </p>
                  <p style={{ lineHeight: 1.8, color: '#333' }}>
                    Omnis voluptas assumenda est, omnis dolor repellendus.
                    Temporibus autem quibusdam et aut officiis debitis aut rerum
                    necessitatibus saepe eveniet ut et voluptates repudiandae
                    sint et molestiae non recusandae.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
