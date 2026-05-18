/**
 * Shared Validation Utilities
 * Centralizes validation logic for emails, passwords, phones across Patient and Specialist
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX_PH = /^(\+63|0)[0-9]{10}$/;
export const GENERAL_PHONE_REGEX = /^[\d\s\-()+]+$/;

export const isValidEmail = (email) => {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
};

export const isValidPhone = (phone, strictPH = false) => {
  if (!phone) return false;
  const cleanedPhone = phone.replace(/[\s\-()]+/g, '');
  if (strictPH) {
    return PHONE_REGEX_PH.test(cleanedPhone);
  }
  return GENERAL_PHONE_REGEX.test(phone) && cleanedPhone.length >= 10;
};

export const validatePasswordStrength = (
  password,
  options = { minLength: 6, maxLength: 50 },
) => {
  const errors = [];
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < options.minLength) {
    errors.push(
      `Password must be at least ${options.minLength} characters long`,
    );
  }
  if (password.length > options.maxLength) {
    errors.push(`Password must be less than ${options.maxLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFileUploadBase = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    required = false,
  } = options;

  const errors = [];

  if (!file && required) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  if (!file) return { isValid: true, errors: [] };

  if (file.size > maxSize) {
    errors.push(
      `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    );
  }

  if (!allowedTypes.includes(file.type)) {
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};
