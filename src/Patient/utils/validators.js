/**
 * Validation utility functions for the Patient module
 * This module provides form validation and data validation functions
 */

import { 
  PROFILE_VALIDATION_RULES, 
  PASSWORD_VALIDATION_RULES,
  FILE_UPLOAD_CONFIG 
} from '../constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\-()+]+$/;
  const cleanedPhone = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && cleanedPhone.length >= 10;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with errors array
 */
export const validatePassword = (password) => {
  const errors = [];
  const rules = PASSWORD_VALIDATION_RULES;
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`);
  }
  
  if (password.length > rules.maxLength) {
    errors.push(`Password must not exceed ${rules.maxLength} characters`);
  }
  
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (rules.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (rules.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate password confirmation match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} True if passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validate date of birth
 * @param {string} dob - Date of birth
 * @param {number} minAge - Minimum age (default: 0)
 * @param {number} maxAge - Maximum age (default: 150)
 * @returns {Object} Validation result
 */
export const validateDateOfBirth = (dob, minAge = 0, maxAge = 150) => {
  if (!dob) {
    return { isValid: false, error: 'Date of birth is required' };
  }
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }
  
  const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  
  if (age < minAge) {
    return { isValid: false, error: `Age must be at least ${minAge} years` };
  }
  
  if (age > maxAge) {
    return { isValid: false, error: `Age cannot exceed ${maxAge} years` };
  }
  
  return { isValid: true };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateFileUpload = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  // Check file size
  if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    return { isValid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }
  
  // Check file type
  const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
  if (!FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return { 
      isValid: false, 
      error: `File type not allowed. Allowed types: ${FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')}` 
    };
  }
  
  // Check MIME type
  if (!FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type' };
  }
  
  return { isValid: true };
};

/**
 * Validate appointment form
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors object
 */
export const validateAppointmentForm = (formData) => {
  const errors = {};
  
  // Required field validations
  if (!formData.chiefComplaint || !formData.chiefComplaint.trim()) {
    errors.chiefComplaint = 'Chief complaint is required';
  }
  
  if (!formData.symptoms || !formData.symptoms.trim()) {
    errors.symptoms = 'Symptoms description is required';
  }
  
  if (!formData.preferredDate) {
    errors.preferredDate = 'Preferred date is required';
  } else {
    // Check if date is not in the past
    const selectedDate = new Date(formData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.preferredDate = 'Date cannot be in the past';
    }
  }
  
  if (!formData.preferredTime) {
    errors.preferredTime = 'Preferred time is required';
  }
  
  if (!formData.specialization) {
    errors.specialization = 'Specialization is required';
  }
  
  if (!formData.consultationChannel) {
    errors.consultationChannel = 'Consultation channel is required';
  }
  
  // HMO validation (if HMO fields are filled)
  if (formData.hmoCompany) {
    if (!formData.hmoMemberId) {
      errors.hmoMemberId = 'HMO member ID is required';
    }
    
    if (!formData.hmoExpirationDate) {
      errors.hmoExpirationDate = 'HMO expiration date is required';
    } else {
      const expirationDate = new Date(formData.hmoExpirationDate);
      const today = new Date();
      
      if (expirationDate < today) {
        errors.hmoExpirationDate = 'HMO has expired';
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate profile form
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} Validation errors object
 */
export const validateProfileForm = (profileData) => {
  const errors = {};
  const rules = PROFILE_VALIDATION_RULES;
  
  // First name validation
  if (!profileData.firstName || !profileData.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (profileData.firstName.length < rules.firstName.minLength) {
    errors.firstName = `First name must be at least ${rules.firstName.minLength} characters`;
  } else if (!rules.firstName.pattern.test(profileData.firstName)) {
    errors.firstName = 'First name can only contain letters and spaces';
  }
  
  // Last name validation
  if (!profileData.lastName || !profileData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (profileData.lastName.length < rules.lastName.minLength) {
    errors.lastName = `Last name must be at least ${rules.lastName.minLength} characters`;
  } else if (!rules.lastName.pattern.test(profileData.lastName)) {
    errors.lastName = 'Last name can only contain letters and spaces';
  }
  
  // Email validation
  if (!profileData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(profileData.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Phone validation
  if (!profileData.phone) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(profileData.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  // Date of birth validation
  if (profileData.dateOfBirth) {
    const dobValidation = validateDateOfBirth(profileData.dateOfBirth);
    if (!dobValidation.isValid) {
      errors.dateOfBirth = dobValidation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate pattern match
 * @param {string} value - Value to validate
 * @param {RegExp} pattern - Regex pattern
 * @param {string} errorMessage - Custom error message
 * @returns {string|null} Error message or null if valid
 */
export const validatePattern = (value, pattern, errorMessage = 'Invalid format') => {
  if (value && !pattern.test(value)) {
    return errorMessage;
  }
  return null;
};

