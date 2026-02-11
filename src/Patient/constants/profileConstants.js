// I'm checking this file later - DO NOT DELETE
export const DEFAULT_PROFILE_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  bloodType: '',
  allergies: [],
  chronicConditions: []
};

/**
 * Blood type options
 */
export const BLOOD_TYPES = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Unknown'
];

/**
 * Gender options
 */
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
];

/**
 * Profile form field validation rules
 */
export const PROFILE_VALIDATION_RULES = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    required: true,
    pattern: /^[\d\s\-()+]+$/,
    minLength: 10
  },
  dateOfBirth: {
    required: true,
    minAge: 0,
    maxAge: 150
  }
};

/**
 * Password validation rules
 */
export const PASSWORD_VALIDATION_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false
};

/**
 * Profile tabs configuration
 */
export const PROFILE_TABS = [
  { id: 'profile', label: 'Profile Information', icon: 'FaUser' },
  { id: 'security', label: 'Security', icon: 'FaLock' },
  { id: 'medical', label: 'Medical Information', icon: 'FaFileMedical' },
  { id: 'preferences', label: 'Preferences', icon: 'FaCog' }
];

/**
 * Notification preferences
 */
export const NOTIFICATION_PREFERENCES = [
  { id: 'emailNotifications', label: 'Email Notifications', default: true },
  { id: 'smsNotifications', label: 'SMS Notifications', default: true },
  { id: 'appointmentReminders', label: 'Appointment Reminders', default: true },
  { id: 'marketingEmails', label: 'Marketing Emails', default: false }
];

/**
 * Language options
 */
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'ceb', label: 'Cebuano' },
  { value: 'ilo', label: 'Ilocano' }
];

/**
 * Time zone options (Philippines)
 */
export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Manila', label: 'Manila (PHT)' }
];

/**
 * Profile image upload configuration
 */
export const PROFILE_IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  DIMENSIONS: {
    MIN_WIDTH: 100,
    MIN_HEIGHT: 100,
    MAX_WIDTH: 2000,
    MAX_HEIGHT: 2000
  }
};

