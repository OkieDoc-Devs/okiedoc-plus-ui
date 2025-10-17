// Validation utility functions for specialists

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation regex (Philippines format)
 */
const PHONE_REGEX = /^(\+63|0)[0-9]{10}$/;

/**
 * PRC license number validation regex
 */
const PRC_LICENSE_REGEX = /^[A-Z0-9]{6,10}$/;

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push("Password is required");
  } else {
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    if (password.length > 50) {
      errors.push("Password must be less than 50 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhone = (phone) => {
  const errors = [];
  
  if (!phone) {
    errors.push("Phone number is required");
  } else {
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.push("Please enter a valid Philippine phone number");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate PRC license number
 * @param {string} licenseNumber - License number to validate
 * @returns {Object} Validation result
 */
export const validatePRCLicense = (licenseNumber) => {
  const errors = [];
  
  if (!licenseNumber) {
    errors.push("PRC license number is required");
  } else {
    if (!PRC_LICENSE_REGEX.test(licenseNumber)) {
      errors.push("Please enter a valid PRC license number");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate specialist profile data
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} Validation result
 */
export const validateSpecialistProfile = (profileData) => {
  const errors = {};

  // First name validation
  if (!profileData.firstName?.trim()) {
    errors.firstName = "First name is required";
  } else if (profileData.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  // Last name validation
  if (!profileData.lastName?.trim()) {
    errors.lastName = "Last name is required";
  } else if (profileData.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  // Email validation
  if (!profileData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(profileData.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Phone validation
  const phoneValidation = validatePhone(profileData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.errors[0];
  }

  // PRC license validation
  const prcValidation = validatePRCLicense(profileData.prcNumber);
  if (!prcValidation.isValid) {
    errors.prcNumber = prcValidation.errors[0];
  }

  // Specialization validation
  if (!profileData.specialization?.trim()) {
    errors.specialization = "Specialization is required";
  }

  // Bio validation
  if (profileData.bio && profileData.bio.length > 500) {
    errors.bio = "Bio must be less than 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate password change data
 * @param {Object} passwordData - Password data to validate
 * @returns {Object} Validation result
 */
export const validatePasswordChange = (passwordData) => {
  const errors = {};

  // Current password validation
  if (!passwordData.currentPassword?.trim()) {
    errors.currentPassword = "Current password is required";
  }

  // New password validation
  const newPasswordValidation = validatePassword(passwordData.newPassword);
  if (!newPasswordValidation.isValid) {
    errors.newPassword = newPasswordValidation.errors[0];
  }

  // Confirm password validation
  if (!passwordData.confirmPassword?.trim()) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (passwordData.newPassword !== passwordData.confirmPassword) {
    errors.confirmPassword = "New passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate service fee data
 * @param {Object} serviceData - Service data to validate
 * @returns {Object} Validation result
 */
export const validateServiceFee = (serviceData) => {
  const errors = {};

  if (!serviceData.name?.trim()) {
    errors.name = "Service name is required";
  }

  if (!serviceData.fee && serviceData.fee !== 0) {
    errors.fee = "Service fee is required";
  } else {
    const fee = parseFloat(serviceData.fee);
    if (isNaN(fee)) {
      errors.fee = "Please enter a valid fee amount";
    } else if (fee < 0) {
      errors.fee = "Fee cannot be negative";
    } else if (fee > 100000) {
      errors.fee = "Fee cannot exceed ₱100,000";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate account details
 * @param {Object} accountData - Account data to validate
 * @returns {Object} Validation result
 */
export const validateAccountDetails = (accountData) => {
  const errors = {};

  if (!accountData.accountType) {
    errors.accountType = "Account type is required";
  }

  if (accountData.accountType === "bank") {
    if (!accountData.accountName?.trim()) {
      errors.accountName = "Account name is required";
    }
    if (!accountData.accountNumber?.trim()) {
      errors.accountNumber = "Account number is required";
    } else if (accountData.accountNumber.length < 10) {
      errors.accountNumber = "Account number must be at least 10 digits";
    }
  } else if (accountData.accountType === "gcash") {
    const phoneValidation = validatePhone(accountData.gcashNumber);
    if (!phoneValidation.isValid) {
      errors.gcashNumber = phoneValidation.errors[0];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate schedule data
 * @param {Object} scheduleData - Schedule data to validate
 * @returns {Object} Validation result
 */
export const validateScheduleData = (scheduleData) => {
  const errors = {};

  if (!scheduleData.time?.trim()) {
    errors.time = "Time is required";
  }

  if (!scheduleData.duration) {
    errors.duration = "Duration is required";
  } else {
    const duration = parseInt(scheduleData.duration);
    if (isNaN(duration) || duration < 15 || duration > 480) {
      errors.duration = "Duration must be between 15 and 480 minutes";
    }
  }

  if (scheduleData.notes && scheduleData.notes.length > 200) {
    errors.notes = "Notes must be less than 200 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate medical history request
 * @param {Object} mhData - Medical history data to validate
 * @returns {Object} Validation result
 */
export const validateMedicalHistoryRequest = (mhData) => {
  const errors = {};

  if (!mhData.consent) {
    errors.consent = "Patient consent is required";
  }

  if (mhData.from && mhData.to) {
    const fromDate = new Date(mhData.from);
    const toDate = new Date(mhData.to);
    
    if (fromDate > toDate) {
      errors.dateRange = "From date cannot be after to date";
    }
  }

  if (mhData.reason && mhData.reason.length > 500) {
    errors.reason = "Reason must be less than 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    required = false
  } = options;

  const errors = [];

  if (!file && required) {
    errors.push("File is required");
    return { isValid: false, errors };
  }

  if (!file) {
    return { isValid: true, errors: [] };
  }

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
