/**
 * Storage Service Module
 * Centralized localStorage management for the Nurse module
 */

import { API_BASE_URL } from '../../api/apiClient';

/**
 * Local storage keys used throughout the application
 */
export const LOCAL_STORAGE_KEYS = {
  NURSE_ID: 'nurse.id',
  NURSE_EMAIL: 'nurse.email',
  NURSE_FIRST_NAME: 'nurse.firstName',
  NURSE_LAST_NAME: 'nurse.lastName',
  NURSE_PROFILE_IMAGE: 'nurse.profileImage',
  TICKETS: 'tickets',
  NOTIFICATIONS: 'notifications',
};

/**
 * Load data from localStorage with a fallback value
 * @param {string} key - The localStorage key
 * @param {*} fallback - Fallback value if key doesn't exist
 * @returns {*} Parsed data or fallback
 */
export function loadFromStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return fallback;
  }
}

/**
 * Save data to localStorage
 * @param {string} key - The localStorage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

/**
 * Get the current nurse's ID from localStorage
 * @returns {string|null} Nurse ID or null
 */
export function getNurseId() {
  const nurseId = localStorage.getItem(LOCAL_STORAGE_KEYS.NURSE_ID);

  if (nurseId) {
    const parsed = parseInt(nurseId, 10);
    if (!isNaN(parsed)) {
      console.log('getNurseId: Returning nurse ID (parsed):', parsed);
      return parsed;
    }
  }

  console.log('getNurseId: Returning nurse ID:', null);
  return null;
}

/**
 * Get the current nurse's email from localStorage
 * @returns {string|null} Nurse email or null
 */
export function getNurseEmail() {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.NURSE_EMAIL);
}

/**
 * Get the current nurse's first name from localStorage
 * @returns {string} Nurse first name or "Nurse"
 */
export function getNurseFirstName() {
  const firstName = localStorage.getItem(LOCAL_STORAGE_KEYS.NURSE_FIRST_NAME);

  return firstName || 'Nurse';
}

/**
 * Get the current nurse's last name from localStorage
 * @returns {string} Nurse last name or empty string
 */
export function getNurseLastName() {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.NURSE_LAST_NAME) || '';
}

/**
 * Get the current nurse's profile image from localStorage
 * @returns {string} Profile image URL or default account icon
 */
export function getNurseProfileImage() {
  const profileImage = localStorage.getItem(
    LOCAL_STORAGE_KEYS.NURSE_PROFILE_IMAGE,
  );

  if (!profileImage) {
    return '/account.svg';
  }

  if (profileImage.startsWith('/uploads')) {
    return `${API_BASE_URL}${profileImage}`;
  }

  return profileImage;
}

/**
 * Save nurse profile image to localStorage
 * @param {string} imageDataUrl - The image data URL to save
 */
export function saveNurseProfileImage(imageDataUrl) {
  if (imageDataUrl) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NURSE_PROFILE_IMAGE, imageDataUrl);
  }
}

/**
 * Load tickets from localStorage
 * @returns {Array} Array of tickets or empty array
 */
export function loadTickets() {
  return loadFromStorage(LOCAL_STORAGE_KEYS.TICKETS, []);
}

/**
 * Save tickets to localStorage
 * @param {Array} tickets - Array of ticket objects
 */
export function saveTickets(tickets) {
  saveToStorage(LOCAL_STORAGE_KEYS.TICKETS, tickets);
}

/**
 * Load notifications from localStorage
 * @returns {Array} Array of notifications or empty array
 */
export function loadNotifications() {
  return loadFromStorage(LOCAL_STORAGE_KEYS.NOTIFICATIONS, []);
}

/**
 * Save notifications to localStorage
 * @param {Array} notifications - Array of notification objects
 */
export function saveNotifications(notifications) {
  saveToStorage(LOCAL_STORAGE_KEYS.NOTIFICATIONS, notifications);
}

/**
 * Clear all nurse-related data from localStorage
 */
export function clearNurseData() {
  Object.values(LOCAL_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
