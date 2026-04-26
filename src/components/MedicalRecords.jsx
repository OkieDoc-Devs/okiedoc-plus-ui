import { useState, useEffect } from 'react';
import {
  X,
  Activity,
  FileText,
  ClockIcon,
  Heart,
  AlertCircle,
  Download,
  Mail,
  ChevronUp,
  ChevronDown,
  User,
  Loader,
  Plus,
  Pill,
} from 'lucide-react';
import {
  fetchPatientMedicalHistory,
  fetchPatientProfile,
  updatePatientProfile,
} from '../api/apiClient';
const TABS = [
  { id: 'history', label: 'Medical History', icon: Activity },
  { id: 'consultations', label: 'Past Consultations', icon: FileText },
  { id: 'audit', label: 'Audit Trail', icon: ClockIcon },
];
const AUDIT_ENTRIES = [
  {
    action: 'Consultation created',
    actor: 'Nurse Maria Santos',
    role: 'Nurse',
    time: '2026-04-19 09:30 AM',
  },
];
const toConsultTypeLabel = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  if (!normalized) return 'Chat';
  if (normalized.includes('video')) return 'Video';
  if (
    normalized.includes('voice') ||
    normalized.includes('audio') ||
    normalized.includes('call')
  ) {
    return 'Voice';
  }
  return 'Chat';
};

const toPillList = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').trim()).filter(Boolean);
  }

  if (value === null || value === undefined) {
    return [];
  }

  const asString = String(value).trim();
  if (!asString) {
    return [];
  }

  try {
    const parsed = JSON.parse(asString);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => String(entry || '').trim()).filter(Boolean);
    }
  } catch {
    // Keep plain text split fallback.
  }

  return asString
    .split(/\n|,|;/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export default function PatientMedicalRecordsModal({
  onClose,
  patient,
  patientId,
  ticketId,
  consultationType,
  medicalHistoryBindings,
}) {
  const [activeTab, setActiveTab] = useState('history');
  const [activeDiseases, setActiveDiseases] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [pastConsultations, setPastConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pastDiseasesText, setPastDiseasesText] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [medications, setMedications] = useState([]);
  const [customMedication, setCustomMedication] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customActiveDisease, setCustomActiveDisease] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const hasBoundMedicalHistory = Boolean(medicalHistoryBindings);
  const activeDiseasesValue =
    medicalHistoryBindings?.activeDiseases ?? activeDiseases;
  const allergiesValue = medicalHistoryBindings?.allergies ?? allergies;
  const pastDiseasesValue =
    medicalHistoryBindings?.pastDiseases ?? pastDiseasesText;
  const familyHistoryValue =
    medicalHistoryBindings?.familyHistory ?? familyHistory;
  const smokingValue = medicalHistoryBindings?.smoking ?? smoking;
  const drinkingValue = medicalHistoryBindings?.drinking ?? drinking;
  const lifestyleNotesValue =
    medicalHistoryBindings?.lifestyleNotes ?? lifestyleNotes;
  const surgeriesValue = medicalHistoryBindings?.surgeries ?? surgeries;
  const medicationsValue =
    medicalHistoryBindings?.currentMedications ?? medications;
  const addActiveDisease = async () => {
    const incoming = customActiveDisease.trim();
    if (!incoming) {
      return;
    }

    if (medicalHistoryBindings?.onActiveDiseasesAdd) {
      await medicalHistoryBindings.onActiveDiseasesAdd(incoming);
    } else {
      setActiveDiseases((p) => [...p, incoming]);
    }
    setCustomActiveDisease('');
  };
  const removeActiveDisease = (d) => {
    if (medicalHistoryBindings?.onActiveDiseasesRemove) {
      medicalHistoryBindings.onActiveDiseasesRemove(d);
      return;
    }
    setActiveDiseases((p) => p.filter((x) => x !== d));
  };
  const addAllergy = async () => {
    const incoming = customAllergy.trim();
    if (!incoming) {
      return;
    }

    if (medicalHistoryBindings?.onAllergyAdd) {
      await medicalHistoryBindings.onAllergyAdd(incoming);
    } else {
      setAllergies((p) => [...p, incoming]);
    }
    setCustomAllergy('');
  };
  const removeAllergy = (a) => {
    if (medicalHistoryBindings?.onAllergyRemove) {
      medicalHistoryBindings.onAllergyRemove(a);
      return;
    }
    setAllergies((p) => p.filter((x) => x !== a));
  };
  const handlePastDiseasesChange = (value) => {
    if (medicalHistoryBindings?.onPastDiseasesChange) {
      medicalHistoryBindings.onPastDiseasesChange(value);
      return;
    }
    setPastDiseasesText(value);
  };
  const handleFamilyHistoryChange = (value) => {
    if (medicalHistoryBindings?.onFamilyHistoryChange) {
      medicalHistoryBindings.onFamilyHistoryChange(value);
      return;
    }
    setFamilyHistory(value);
  };
  const handleSmokingChange = (value) => {
    if (medicalHistoryBindings?.onSmokingChange) {
      medicalHistoryBindings.onSmokingChange(value);
      return;
    }
    setSmoking(value);
  };
  const handleDrinkingChange = (value) => {
    if (medicalHistoryBindings?.onDrinkingChange) {
      medicalHistoryBindings.onDrinkingChange(value);
      return;
    }
    setDrinking(value);
  };
  const handleLifestyleNotesChange = (value) => {
    if (medicalHistoryBindings?.onLifestyleNotesChange) {
      medicalHistoryBindings.onLifestyleNotesChange(value);
      return;
    }
    setLifestyleNotes(value);
  };
  const handleSurgeriesChange = (value) => {
    if (medicalHistoryBindings?.onSurgeriesChange) {
      medicalHistoryBindings.onSurgeriesChange(value);
      return;
    }
    setSurgeries(value);
  };
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      if (medicalHistoryBindings?.onSave) {
        await medicalHistoryBindings.onSave();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return;
      }

      const pId = patientId || patient?.id;
      await updatePatientProfile(pId, {
        activeDiseases: activeDiseasesValue,
        allergies: allergiesValue,
        pastDiseases: pastDiseasesValue,
        familyHistory: familyHistoryValue,
        smoking: smokingValue,
        drinking: drinkingValue,
        lifestyleNotes: lifestyleNotesValue,
        surgeries: surgeriesValue,
        currentMedications: medicationsValue,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };
  const addMedication = async () => {
    const incoming = customMedication.trim();
    if (!incoming) {
      return;
    }

    if (medicalHistoryBindings?.onMedicationAdd) {
      await medicalHistoryBindings.onMedicationAdd(incoming);
    } else {
      setMedications((p) => [...p, incoming]);
    }
    setCustomMedication('');
  };
  const info = {
    name: patient?.fullName || 'Patient',
    ticketId: ticketId || 'T-001',
    age: patient?.age || 0,
    gender: patient?.gender || 'Unknown',
    consultationType: toConsultTypeLabel(consultationType),
  };
  useEffect(() => {
    if (!patientId && !patient?.id) return;
    const pId = patientId || patient?.id;
    loadMedicalData(pId);
  }, [patientId, patient?.id]);
  const loadMedicalData = async (pId) => {
    setIsLoading(true);
    setError(null);
    try {
      const historyResponse = await fetchPatientMedicalHistory(pId);
      if (historyResponse) {
        const consultations = historyResponse.history || [];
        setPastConsultations(
          consultations.map((c) => ({
            ticketId: c.ticketNumber || 'T-000',
            date: c.visitDate
              ? new Date(c.visitDate).toISOString().split('T')[0]
              : 'N/A',
            type: toConsultTypeLabel(c.consultationType),
            doctor: c.specialistName || 'Unassigned',
            chiefComplaint: c.chiefComplaint || 'N/A',
            diagnosis: c.icd10Code || 'N/A',
          })),
        );
      }
      if (!hasBoundMedicalHistory) {
        const profileResponse = await fetchPatientProfile(pId);
        if (profileResponse?.data) {
          const profileData = profileResponse.data;
          setActiveDiseases(toPillList(profileData.activeDiseases));
          setAllergies(toPillList(profileData.allergies));
          setPastDiseasesText(String(profileData.pastDiseases || '').trim());
          setFamilyHistory(String(profileData.familyHistory || '').trim());
          setSmoking(String(profileData.smoking || '').trim());
          setDrinking(String(profileData.drinking || '').trim());
          setLifestyleNotes(String(profileData.lifestyleNotes || '').trim());
          setSurgeries(String(profileData.surgeries || '').trim());
          setMedications(
            toPillList(profileData.currentMedications || profileData.medications),
          );
        }
      }
    } catch (err) {
      console.error('Error loading medical data:', err);
      setError('Failed to load medical records');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='relative bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]'>
        {/* Header */}
        <div className='px-7 pt-6 pb-4 border-b border-gray-100'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center'>
                <FileText size={18} className='text-blue-500' strokeWidth={2} />
              </div>
              <div>
                <h2 className='text-lg font-bold text-gray-900 leading-tight'>
                  Patient Medical Records
                </h2>
                <p className='text-xs text-gray-400 mt-0.5'>
                  Complete health profile
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors'
            >
              <X size={14} className='text-gray-500' strokeWidth={2.5} />
            </button>
          </div>
          <div className='mt-4 grid grid-cols-4 gap-2'>
            {[
              { label: 'Patient Name', value: info.name },
              { label: 'Ticket ID', value: info.ticketId },
              { label: 'Age / Gender', value: `${info.age} / ${info.gender}` },
              { label: 'Consult Type', value: info.consultationType },
            ].map(({ label, value }) => (
              <div key={label} className='flex flex-col'>
                <span className='text-[10px] text-gray-400 font-medium uppercase tracking-wide'>
                  {label}
                </span>
                <span className='text-sm font-semibold text-gray-800 mt-0.5 capitalize'>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Tabs */}
        <div className='flex gap-1 px-7 pt-3 pb-0 border-b border-gray-100'>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 border-b-2 transition-colors ${activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Body */}
        <div className='flex-1 overflow-y-auto px-7 py-5 space-y-4'>
          {isLoading && (
            <div className='flex items-center justify-center h-full'>
              <div className='flex flex-col items-center gap-2'>
                <Loader size={24} className='animate-spin text-blue-500' />
                <p className='text-sm text-gray-500'>
                  Loading medical records...
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className='p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2'>
              <AlertCircle size={16} className='text-red-500' />
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}
          {!isLoading && !error && activeTab === 'history' && (
            <>
              <p className='text-sm font-bold text-gray-800'>
                Complete Medical History
              </p>
              <div className='border border-gray-200 rounded-2xl overflow-hidden'>
                <button
                  onClick={() => setHistoryOpen((o) => !o)}
                  className='w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                    <Heart size={15} className='text-blue-400' strokeWidth={2.2} />
                    Medical History
                  </div>
                  {historyOpen ? (
                    <ChevronUp size={15} className='text-gray-400' />
                  ) : (
                    <ChevronDown size={15} className='text-gray-400' />
                  )}
                </button>
                {historyOpen && (
                  <div className='px-5 pb-5 space-y-4 border-t border-gray-100'>
                    {/* Active Diseases */}
                    <div className='pt-4'>
                      <div className='flex items-center gap-1.5 mb-3'>
                        <Activity size={13} className='text-orange-400' strokeWidth={2.2} />
                        <span className='text-xs font-bold text-gray-600 uppercase tracking-wide'>
                          Active Diseases
                        </span>
                      </div>
                      <div className='flex gap-2 mb-2'>
                        <input
                          value={customActiveDisease}
                          onChange={(e) => setCustomActiveDisease(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addActiveDisease()}
                          placeholder='Add active disease...'
                          className='flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 placeholder-gray-300'
                        />
                        <button
                          onClick={addActiveDisease}
                          className='w-8 h-8 rounded-xl bg-gray-700 hover:bg-gray-900 text-white flex items-center justify-center transition-colors'
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {activeDiseasesValue.length === 0 ? (
                          <span className='text-xs text-gray-400'>
                            No active diseases recorded
                          </span>
                        ) : (
                          activeDiseasesValue.map((d) => (
                            <span
                              key={d}
                              className='flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-blue-500 text-white border border-blue-500'
                            >
                              {d}
                              <button onClick={() => removeActiveDisease(d)} className='hover:opacity-60 transition-opacity'>
                                <X size={10} strokeWidth={3} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    {/* Allergies */}
                    <div className='bg-red-50 border border-red-100 rounded-xl p-4'>
                      <div className='flex items-center gap-1.5 mb-3'>
                        <AlertCircle size={13} className='text-red-400' strokeWidth={2.2} />
                        <span className='text-xs font-bold text-red-500 uppercase tracking-wide'>
                          Allergies
                        </span>
                      </div>
                      <div className='flex gap-2 mb-2'>
                        <input
                          value={customAllergy}
                          onChange={(e) => setCustomAllergy(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                          placeholder='Add allergy...'
                          className='flex-1 text-xs bg-white border border-red-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-400 placeholder-red-300'
                        />
                        <button
                          onClick={addAllergy}
                          className='w-8 h-8 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors'
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {allergiesValue.length === 0 ? (
                          <span className='text-xs text-gray-400'>
                            No allergies recorded
                          </span>
                        ) : (
                          allergiesValue.map((a) => (
                            <span
                              key={a}
                              className='flex items-center gap-1.5 text-xs font-semibold bg-red-500 text-white rounded-full px-3 py-1'
                            >
                              {a}
                              <button onClick={() => removeAllergy(a)} className='hover:opacity-60 transition-opacity'>
                                <X size={10} strokeWidth={3} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    {/* Past Diseases */}
                    <div>
                      <p className='text-xs font-bold text-gray-700 mb-1.5'>Past Diseases</p>
                      <textarea
                        value={pastDiseasesValue}
                        onChange={(e) => handlePastDiseasesChange(e.target.value)}
                        onBlur={medicalHistoryBindings?.onPastDiseasesBlur}
                        placeholder='List past diseases, conditions, or illnesses...'
                        rows={2}
                        className='w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 placeholder-gray-300 resize-none'
                      />
                    </div>
                    {/* Family History */}
                    <div>
                      <p className='text-xs font-bold text-gray-700 mb-1.5'>Family History</p>
                      <textarea
                        value={familyHistoryValue}
                        onChange={(e) => handleFamilyHistoryChange(e.target.value)}
                        onBlur={medicalHistoryBindings?.onFamilyHistoryBlur}
                        placeholder='Family medical history (parents, siblings, etc.)...'
                        rows={2}
                        className='w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 placeholder-gray-300 resize-none'
                      />
                    </div>
                    {/* Social History */}
                    <div className='border border-gray-200 rounded-xl p-4'>
                      <p className='text-xs font-bold text-gray-700 mb-3'>Social History</p>
                      <div className='grid grid-cols-2 gap-3 mb-3'>
                        <div>
                          <p className='text-[11px] font-semibold text-blue-500 mb-1'>Smoking</p>
                          <input
                            value={smokingValue}
                            onChange={(e) => handleSmokingChange(e.target.value)}
                            onBlur={medicalHistoryBindings?.onSmokingBlur}
                            placeholder='e.g., Non-smoker, 10/day'
                            className='w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 placeholder-gray-300'
                          />
                        </div>
                        <div>
                          <p className='text-[11px] font-semibold text-blue-500 mb-1'>Drinking</p>
                          <input
                            value={drinkingValue}
                            onChange={(e) => handleDrinkingChange(e.target.value)}
                            onBlur={medicalHistoryBindings?.onDrinkingBlur}
                            placeholder='e.g., Occasional, Daily'
                            className='w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 placeholder-gray-300'
                          />
                        </div>
                      </div>
                      <div>
                        <p className='text-[11px] font-semibold text-blue-500 mb-1'>Lifestyle Notes</p>
                        <textarea
                          value={lifestyleNotesValue}
                          onChange={(e) => handleLifestyleNotesChange(e.target.value)}
                          onBlur={medicalHistoryBindings?.onLifestyleNotesBlur}
                          placeholder='Diet, exercise, occupation, stress factors...'
                          rows={2}
                          className='w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 placeholder-gray-300 resize-none'
                        />
                      </div>
                    </div>
                    {/* Surgeries */}
                    <div>
                      <p className='text-xs font-bold text-gray-700 mb-1.5'>Surgeries</p>
                      <textarea
                        value={surgeriesValue}
                        onChange={(e) => handleSurgeriesChange(e.target.value)}
                        onBlur={medicalHistoryBindings?.onSurgeriesBlur}
                        placeholder='List previous surgeries with dates if available...'
                        rows={2}
                        className='w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 placeholder-gray-300 resize-none'
                      />
                    </div>
                    {/* Current Medications */}
                    <div>
                      <div className='flex items-center gap-1.5 mb-2'>
                        <Pill size={13} className='text-green-500' strokeWidth={2.2} />
                        <p className='text-xs font-bold text-gray-700'>Current Medications</p>
                      </div>
                      <div className='flex gap-2 mb-2'>
                        <input
                          value={customMedication}
                          onChange={(e) => setCustomMedication(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                          placeholder='Add medication...'
                          className='flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 placeholder-gray-300'
                        />
                        <button
                          onClick={addMedication}
                          className='w-8 h-8 rounded-xl bg-gray-700 hover:bg-gray-900 text-white flex items-center justify-center transition-colors'
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                      {medicationsValue.length > 0 && (
                        <div className='flex flex-wrap gap-2 mt-1'>
                          {medicationsValue.map((m) => (
                            <span
                              key={m}
                              className='flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1'
                            >
                              {m}
                              <button
                                onClick={() =>
                                  medicalHistoryBindings?.onMedicationRemove
                                    ? medicalHistoryBindings.onMedicationRemove(m)
                                    : setMedications((p) =>
                                        p.filter((x) => x !== m),
                                      )
                                }
                                className='hover:opacity-60 transition-opacity'
                              >
                                <X size={10} strokeWidth={3} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {!isLoading && !error && activeTab === 'consultations' && (
            <div>
              <p className='text-sm font-bold text-gray-800 mb-4'>Past Consultations</p>
              <div className='border border-gray-200 rounded-2xl overflow-hidden'>
                <div className='grid grid-cols-6 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200'>
                  {['Ticket ID', 'Date', 'Type', 'Doctor', 'Chief Complaint', 'Diagnosis'].map((h) => (
                    <span key={h} className='text-[10px] font-bold text-blue-500 uppercase tracking-wide truncate'>
                      {h}
                    </span>
                  ))}
                </div>
                {pastConsultations.length === 0 ? (
                  <div className='px-4 py-6 text-center text-gray-500 text-sm'>
                    No past consultations found
                  </div>
                ) : (
                  pastConsultations.map((c, i) => (
                    <div
                      key={c.ticketId + i}
                      className={`grid grid-cols-6 gap-2 px-4 py-3 items-center ${i !== pastConsultations.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-blue-50/40 transition-colors`}
                    >
                      <span className='text-xs font-semibold text-blue-500'>{c.ticketId}</span>
                      <span className='text-xs text-gray-600'>{c.date}</span>
                      <span className='text-xs text-gray-600'>{c.type}</span>
                      <span className='text-xs text-gray-600 truncate'>{c.doctor}</span>
                      <span className='text-xs text-gray-600 truncate'>{c.chiefComplaint}</span>
                      <span className='text-xs text-gray-600 truncate'>{c.diagnosis}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {!isLoading && !error && activeTab === 'audit' && (
            <div>
              <p className='text-sm font-bold text-gray-800 mb-4'>Consultation Audit Trail</p>
              <div className='border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100'>
                {AUDIT_ENTRIES && AUDIT_ENTRIES.length > 0 ? (
                  AUDIT_ENTRIES.map((entry, i) => (
                    <div key={i} className='flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors'>
                      <div className='w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0'>
                        <Activity size={13} className='text-blue-400' strokeWidth={2.2} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-semibold text-gray-800'>{entry.action}</p>
                        <div className='flex items-center gap-1 mt-0.5'>
                          <User size={10} className='text-gray-400' strokeWidth={2} />
                          <span className='text-[11px] text-gray-400'>
                            {entry.actor}{' '}
                            <span className='text-gray-300'>({entry.role})</span>
                          </span>
                        </div>
                      </div>
                      <span className='text-[11px] text-blue-400 font-medium whitespace-nowrap shrink-0'>
                        {entry.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className='px-4 py-6 text-center text-gray-500 text-sm'>
                    No audit trail entries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className='px-7 py-4 border-t border-gray-100 flex items-center gap-3'>
          {activeTab === 'history' && (
            <div className='flex items-center gap-2'>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors shadow-sm shadow-green-200 disabled:opacity-50'
              >
                {isSaving ? <Loader size={14} className='animate-spin' /> : null}
                Save Changes
              </button>
              {saveSuccess && (
                <span className='text-xs text-green-600 font-medium'>Saved successfully!</span>
              )}
            </div>
          )}
          <div className='ml-auto flex items-center gap-3'>
            <button className='flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors'>
              <Mail size={14} strokeWidth={2.2} />
              Resend to Patient Email
            </button>
            <button className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200'>
              <Download size={14} strokeWidth={2.5} />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
