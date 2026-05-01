import { useEffect, useState } from 'react';
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
  Eye,
  Stethoscope,
  ClipboardList,
  Pill,
  FlaskConical,
} from 'lucide-react';
import {
  fetchPatientMedicalHistory,
  fetchPatientProfile,
} from '../api/apiClient';

const TABS = [
  { id: 'history', label: 'Medical History', icon: Activity },
  { id: 'consultations', label: 'Past Consultations', icon: FileText },
  { id: 'audit', label: 'Audit Trail', icon: ClockIcon },
];

const AUDIT_ENTRIES = [];

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
}) {
  const [activeTab, setActiveTab] = useState('history');
  const [activeDiseases, setActiveDiseases] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [pastDiseasesText, setPastDiseasesText] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [medications, setMedications] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [pastConsultations, setPastConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const info = {
    name: patient?.fullName || 'Patient',
    ticketId: ticketId || 'T-001',
    age: patient?.age || 0,
    gender: patient?.gender || 'Unknown',
    consultationType: toConsultTypeLabel(consultationType),
  };

  useEffect(() => {
    if (!patientId && !patient?.id) {
      return;
    }

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
                  consultations.map((consultation) => ({
                    ticketId: consultation.ticketNumber || 'T-000',
                    date: consultation.visitDate
                      ? new Date(consultation.visitDate).toISOString().split('T')[0]
                      : 'N/A',
                    type: toConsultTypeLabel(consultation.consultationType),
                    doctor: consultation.specialistName || 'Unassigned',
                    chiefComplaint: consultation.chiefComplaint || 'N/A',
                    diagnosis:
                      consultation.medicalCertificates &&
                      consultation.medicalCertificates.length > 0
                        ? consultation.medicalCertificates[0].diagnosisReason
                        : consultation.icd10Code || 'N/A',
                    assessment: consultation.assessment || 'N/A',
                    plan: consultation.plan || 'N/A',
                    prescriptions: consultation.prescriptions || [],
                    labRequests: consultation.labRequests || [],
                    medicalCertificates: consultation.medicalCertificates || [],
                    treatmentPlans: consultation.treatmentPlans || [],
                  })),
                );
      }

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
    } catch (loadError) {
      console.error('Error loading medical data:', loadError);
      setError('Failed to load medical records');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='relative bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]'>
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

        <div className='flex gap-1 px-7 pt-3 pb-0 border-b border-gray-100'>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

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
                Patient-Managed Medical History
              </p>

              <div className='border border-gray-200 rounded-2xl overflow-hidden'>
                <button
                  onClick={() => setHistoryOpen((open) => !open)}
                  className='w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                    <Heart
                      size={15}
                      className='text-blue-400'
                      strokeWidth={2.2}
                    />
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
                    <div className='pt-4'>
                      <div className='flex items-center gap-1.5 mb-3'>
                        <Activity
                          size={13}
                          className='text-orange-400'
                          strokeWidth={2.2}
                        />
                        <span className='text-xs font-bold text-gray-600 uppercase tracking-wide'>
                          Active Diseases
                        </span>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        {activeDiseases.length === 0 ? (
                          <span className='text-xs text-gray-400'>
                            No active diseases recorded
                          </span>
                        ) : (
                          activeDiseases.map((disease) => (
                            <span
                              key={disease}
                              className='text-xs px-3 py-1 rounded-full bg-blue-500 text-white border border-blue-500'
                            >
                              {disease}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className='bg-red-50 border border-red-100 rounded-xl p-4'>
                      <div className='flex items-center gap-1.5 mb-3'>
                        <AlertCircle
                          size={13}
                          className='text-red-400'
                          strokeWidth={2.2}
                        />
                        <span className='text-xs font-bold text-red-500 uppercase tracking-wide'>
                          Allergies
                        </span>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        {allergies.length === 0 ? (
                          <span className='text-xs text-gray-400'>
                            No allergies recorded
                          </span>
                        ) : (
                          allergies.map((allergy) => (
                            <span
                              key={allergy}
                              className='text-xs font-semibold bg-red-500 text-white rounded-full px-3 py-1'
                            >
                              {allergy}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className='rounded-xl border border-amber-200 bg-amber-50 px-3 py-2'>
                      <p className='text-[11px] text-amber-700'>
                        Active diseases and allergies are managed by the patient
                        profile. Nurses can view these records but cannot edit
                        them.
                      </p>
                    </div>

                    <div>
                      <p className='text-xs font-bold text-gray-700 mb-1.5'>
                        Past Diseases
                      </p>
                      <div className='w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 min-h-12 whitespace-pre-wrap'>
                        {pastDiseasesText || 'No past diseases recorded'}
                      </div>
                    </div>

                    <div>
                      <p className='text-xs font-bold text-gray-700 mb-1.5'>
                        Family History
                      </p>
                      <div className='w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 min-h-12 whitespace-pre-wrap'>
                        {familyHistory || 'No family history recorded'}
                      </div>
                    </div>

                    <div className='border border-gray-200 rounded-xl p-4'>
                      <p className='text-xs font-bold text-gray-700 mb-3'>
                        Social History
                      </p>
                      <div className='grid grid-cols-2 gap-3 mb-3'>
                        <div>
                          <p className='text-[11px] font-semibold text-blue-500 mb-1'>
                            Smoking
                          </p>
                          <div className='w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 min-h-9'>
                            {smoking || 'No smoking history'}
                          </div>
                        </div>
                        <div>
                          <p className='text-[11px] font-semibold text-blue-500 mb-1'>
                            Drinking
                          </p>
                          <div className='w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 min-h-9'>
                            {drinking || 'No drinking history'}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className='text-[11px] font-semibold text-blue-500 mb-1'>
                          Lifestyle Notes
                        </p>
                        <div className='w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 min-h-12 whitespace-pre-wrap'>
                          {lifestyleNotes || 'No lifestyle notes recorded'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className='text-xs font-bold text-gray-700 mb-1.5'>
                        Surgeries
                      </p>
                      <div className='w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 min-h-12 whitespace-pre-wrap'>
                        {surgeries || 'No surgeries recorded'}
                      </div>
                    </div>

                    <div>
                      <p className='text-xs font-bold text-gray-700 mb-2'>
                        Current Medications
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {medications.length === 0 ? (
                          <span className='text-xs text-gray-400'>
                            No medications recorded
                          </span>
                        ) : (
                          medications.map((medication) => (
                            <span
                              key={medication}
                              className='text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1'
                            >
                              {medication}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!isLoading && !error && activeTab === 'consultations' && (
            <div>
              <p className='text-sm font-bold text-gray-800 mb-4'>
                Past Consultations
              </p>

              {selectedConsultation ? (
                <div className='border border-gray-200 rounded-2xl p-6 bg-white space-y-6'>
                  <div className='flex items-center justify-between border-b pb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center'>
                        <FileText size={18} className='text-blue-500' />
                      </div>
                      <div>
                        <h3 className='text-base font-bold text-gray-900'>
                          Consultation Details
                        </h3>
                        <p className='text-xs text-blue-500 font-semibold'>
                          {selectedConsultation.ticketId}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedConsultation(null)}
                      className='text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50'
                    >
                      Back to list
                    </button>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>
                        Date
                      </span>
                      <p className='text-sm font-semibold text-gray-700'>
                        {selectedConsultation.date}
                      </p>
                    </div>
                    <div>
                      <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>
                        Specialist
                      </span>
                      <p className='text-sm font-semibold text-gray-700'>
                        {selectedConsultation.doctor}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-4 pt-2'>
                    <div className='bg-blue-50/50 p-4 rounded-xl border border-blue-100'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Stethoscope size={14} className='text-blue-500' />
                        <span className='text-xs font-bold text-blue-900 uppercase tracking-wide'>
                          Assessment
                        </span>
                      </div>
                      <p className='text-sm text-gray-700 leading-relaxed'>
                        {selectedConsultation.assessment}
                      </p>
                    </div>

                    <div className='bg-green-50/50 p-4 rounded-xl border border-green-100'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Activity size={14} className='text-green-500' />
                        <span className='text-xs font-bold text-green-900 uppercase tracking-wide'>
                          Diagnosis
                        </span>
                      </div>
                      <p className='text-sm text-gray-700 leading-relaxed'>
                        {selectedConsultation.diagnosis}
                      </p>
                    </div>

                    <div className='bg-purple-50/50 p-4 rounded-xl border border-purple-100'>
                      <div className='flex items-center gap-2 mb-2'>
                        <ClipboardList size={14} className='text-purple-500' />
                        <span className='text-xs font-bold text-purple-900 uppercase tracking-wide'>
                          Treatment Plan
                        </span>
                      </div>
                      <p className='text-sm text-gray-700 leading-relaxed'>
                        {selectedConsultation.plan}
                      </p>
                    </div>

                    {selectedConsultation.prescriptions?.length > 0 && (
                      <div className='bg-orange-50/50 p-4 rounded-xl border border-orange-100'>
                        <div className='flex items-center gap-2 mb-2'>
                          <Pill size={14} className='text-orange-500' />
                          <span className='text-xs font-bold text-orange-900 uppercase tracking-wide'>
                            Prescriptions
                          </span>
                        </div>
                        <ul className='list-disc list-inside text-sm text-gray-700 space-y-1'>
                          {selectedConsultation.prescriptions.map((p, idx) => (
                            <li key={idx}>
                              <span className='font-semibold'>
                                {p.generic} {p.brand ? `(${p.brand})` : ''}
                              </span>{' '}
                              - {p.dosage} {p.form}, {p.quantity} units (
                              {p.instructions})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedConsultation.labRequests?.length > 0 && (
                      <div className='bg-amber-50/50 p-4 rounded-xl border border-amber-100'>
                        <div className='flex items-center gap-2 mb-2'>
                          <FlaskConical size={14} className='text-amber-500' />
                          <span className='text-xs font-bold text-amber-900 uppercase tracking-wide'>
                            Laboratory Requests
                          </span>
                        </div>
                        <ul className='list-disc list-inside text-sm text-gray-700 space-y-1'>
                          {selectedConsultation.labRequests.map((l, idx) => (
                            <li key={idx}>
                              <span className='font-semibold'>{l.test}</span>{' '}
                              {l.customTestName ? `(${l.customTestName})` : ''}
                              {l.remarks ? ` - ${l.remarks}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className='border border-gray-200 rounded-2xl overflow-hidden'>
                  <div className='grid grid-cols-7 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200'>
                    {[
                      'Ticket ID',
                      'Date',
                      'Type',
                      'Doctor',
                      'Chief Complaint',
                      'Diagnosis',
                      'Action',
                    ].map((header) => (
                      <span
                        key={header}
                        className='text-[10px] font-bold text-blue-500 uppercase tracking-wide truncate'
                      >
                        {header}
                      </span>
                    ))}
                  </div>

                  {pastConsultations.length === 0 ? (
                    <div className='px-4 py-6 text-center text-gray-500 text-sm'>
                      No past consultations found
                    </div>
                  ) : (
                    pastConsultations.map((consultation, index) => (
                      <div
                        key={consultation.ticketId + index}
                        className={`grid grid-cols-7 gap-2 px-4 py-3 items-center ${
                          index !== pastConsultations.length - 1
                            ? 'border-b border-gray-100'
                            : ''
                        } hover:bg-blue-50/40 transition-colors`}
                      >
                        <span className='text-xs font-semibold text-blue-500'>
                          {consultation.ticketId}
                        </span>
                        <span className='text-xs text-gray-600'>
                          {consultation.date}
                        </span>
                        <span className='text-xs text-gray-600'>
                          {consultation.type}
                        </span>
                        <span className='text-xs text-gray-600 truncate'>
                          {consultation.doctor}
                        </span>
                        <span className='text-xs text-gray-600 truncate'>
                          {consultation.chiefComplaint}
                        </span>
                        <span className='text-xs text-gray-600 truncate'>
                          {consultation.diagnosis}
                        </span>
                        <button
                          onClick={() => setSelectedConsultation(consultation)}
                          className='flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors'
                        >
                          <Eye size={12} />
                          VIEW DETAILS
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && activeTab === 'audit' && (
            <div>
              <p className='text-sm font-bold text-gray-800 mb-4'>
                Consultation Audit Trail
              </p>

              <div className='border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100'>
                {AUDIT_ENTRIES.length > 0 ? (
                  AUDIT_ENTRIES.map((entry, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors'
                    >
                      <div className='w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0'>
                        <Activity
                          size={13}
                          className='text-blue-400'
                          strokeWidth={2.2}
                        />
                      </div>

                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-semibold text-gray-800'>
                          {entry.action}
                        </p>
                        <div className='flex items-center gap-1 mt-0.5'>
                          <User
                            size={10}
                            className='text-gray-400'
                            strokeWidth={2}
                          />
                          <span className='text-[11px] text-gray-400'>
                            {entry.actor}{' '}
                            <span className='text-gray-300'>
                              ({entry.role})
                            </span>
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

        <div className='px-7 py-4 border-t border-gray-100 flex items-center gap-3'>
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
