// I'm checking this file later - DO NOT DELETE
export const SPECIALISTS = [
  { id: 1, name: "Dr. Maria Santos", specialty: "Cardiology" },
  { id: 2, name: "Dr. John Smith", specialty: "Hematology" },
  { id: 3, name: "Dr. Lisa Garcia", specialty: "Radiology" },
  { id: 4, name: "Dr. Michael Brown", specialty: "Cardiology" },
  { id: 5, name: "Dr. Sarah Wilson", specialty: "Neurology" },
  { id: 6, name: "Dr. David Lee", specialty: "Dermatology" },
  { id: 7, name: "Dr. Jennifer Martinez", specialty: "Pediatrics" },
  { id: 8, name: "Dr. Robert Johnson", specialty: "Orthopedics" },
  { id: 9, name: "Dr. Emily Davis", specialty: "Psychiatry" },
  { id: 10, name: "Dr. James Taylor", specialty: "Ophthalmology" }
];

/**
 * Get unique specializations from specialists list
 */
export const SPECIALIZATIONS = [...new Set(SPECIALISTS.map(s => s.specialty))].sort();

/**
 * Consultation channels with their icons and labels
 */
export const CONSULTATION_CHANNELS = [
  {
    value: "Platform Chat",
    label: "Platform Chat",
    icon: "FaComments",
    description: "Text-based chat on our platform"
  },
  {
    value: "Mobile Call",
    label: "Mobile Call",
    icon: "FaPhone",
    description: "Direct mobile phone call"
  },
  {
    value: "Viber Audio",
    label: "Viber (Audio Call)",
    icon: "FaPhone",
    description: "Audio call via Viber app"
  },
  {
    value: "Viber Video",
    label: "Viber (Video Call)",
    icon: "FaVideo",
    description: "Video call via Viber app"
  },
  {
    value: "Platform Video",
    label: "Platform Video Call (via Lgorithm)",
    icon: "FaDesktop",
    description: "Video call through our platform"
  }
];

/**
 * Appointment statuses
 */
export const APPOINTMENT_STATUSES = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  FOR_PAYMENT: 'For Payment',
  CONFIRMED: 'Confirmed',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  WAITING: 'Waiting'
};

/**
 * Booking methods
 */
export const BOOKING_METHODS = {
  ONLINE: 'Online',
  HOTLINE: 'Hotline'
};

/**
 * User types
 */
export const USER_TYPES = {
  REGISTERED: 'Registered',
  GUEST: 'Guest'
};

/**
 * Consultation types
 */
export const CONSULTATION_TYPES = {
  TELECONSULTATION: 'Teleconsultation',
  HOME_SERVICE: 'Home Service',
  CLINIC_VISIT: 'Clinic Visit'
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS = [
  { value: 'gcash', label: 'GCash', icon: 'FaMobileAlt' },
  { value: 'paymaya', label: 'PayMaya', icon: 'FaMobileAlt' },
  { value: 'card', label: 'Credit/Debit Card', icon: 'FaCreditCard' },
  { value: 'bank', label: 'Bank Transfer', icon: 'FaUniversity' },
  { value: 'cash', label: 'Cash', icon: 'FaMoneyBillWave' }
];

/**
 * HMO providers
 */
export const HMO_PROVIDERS = [
  'Maxicare',
  'PhilCare',
  'Medicard',
  'Intellicare',
  'Cocolife',
  'Avega',
  'Pacific Cross',
  'Insular Health Care',
  'HMI',
  'AsianLife',
  'Other'
];

/**
 * Common symptoms list
 */
export const COMMON_SYMPTOMS = [
  'Fever',
  'Cough',
  'Headache',
  'Sore Throat',
  'Body Aches',
  'Fatigue',
  'Nausea',
  'Dizziness',
  'Shortness of Breath',
  'Chest Pain',
  'Abdominal Pain',
  'Skin Rash',
  'Loss of Appetite',
  'Difficulty Sleeping'
];

/**
 * Appointment time slots
 */
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

/**
 * File upload configurations
 */
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_EXTENSIONS: [
    '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'
  ],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ],
  MAX_FILES: 5
};

/**
 * Chat message types
 */
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system'
};

/**
 * Medical record categories
 */
export const MEDICAL_RECORD_CATEGORIES = [
  'Active Diseases',
  'Past Diseases',
  'Medications',
  'Surgeries',
  'Family History',
  'Social History',
  'Allergies'
];

/**
 * Default form values for appointment booking
 */
export const DEFAULT_APPOINTMENT_FORM = {
  chiefComplaint: '',
  symptoms: '',
  otherSymptoms: '',
  preferredDate: '',
  preferredTime: '',
  specialization: '',
  preferredSpecialist: '',
  consultationChannel: 'Platform Chat',
  hmoCompany: '',
  hmoMemberId: '',
  hmoExpirationDate: '',
  loaCode: '',
  eLOAFiles: []
};

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 10,
  MAX_PAGE_BUTTONS: 5
};

