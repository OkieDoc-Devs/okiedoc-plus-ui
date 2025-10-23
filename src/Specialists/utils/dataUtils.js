// Data management utilities for specialists

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

/**
 * Load data from localStorage with error handling
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed data or default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading data from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Save data to localStorage with error handling
 * @param {string} key - localStorage key
 * @param {*} data - Data to save
 * @returns {boolean} True if successful, false otherwise
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - localStorage key
 * @returns {boolean} True if successful, false otherwise
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data from localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Load tickets from localStorage
 * @returns {Array} Array of tickets
 */
export const loadTickets = () => {
  return loadFromStorage("specialistTickets", []);
};

/**
 * Save tickets to localStorage
 * @param {Array} tickets - Array of tickets
 * @returns {boolean} True if successful
 */
export const saveTickets = (tickets) => {
  return saveToStorage("specialistTickets", tickets);
};

/**
 * Load profile data for a user
 * @param {string} email - User email
 * @returns {Object} Profile data
 */
export const loadProfileData = (email) => {
  return loadFromStorage(`profile:${email}`, {});
};

/**
 * Save profile data for a user
 * @param {string} email - User email
 * @param {Object} profileData - Profile data to save
 * @returns {boolean} True if successful
 */
export const saveProfileData = (email, profileData) => {
  return saveToStorage(`profile:${email}`, profileData);
};

/**
 * Load services data for a user
 * @param {string} email - User email
 * @returns {Object} Services data
 */
export const loadServicesData = (email) => {
  return loadFromStorage(`services:${email}`, {});
};

/**
 * Save services data for a user
 * @param {string} email - User email
 * @param {Object} servicesData - Services data to save
 * @returns {boolean} True if successful
 */
export const saveServicesData = (email, servicesData) => {
  return saveToStorage(`services:${email}`, servicesData);
};

/**
 * Load account details for a user
 * @param {string} email - User email
 * @returns {Object} Account details
 */
export const loadAccountData = (email) => {
  return loadFromStorage(`account:${email}`, {});
};

/**
 * Save account details for a user
 * @param {string} email - User email
 * @param {Object} accountData - Account data to save
 * @returns {boolean} True if successful
 */
export const saveAccountData = (email, accountData) => {
  return saveToStorage(`account:${email}`, accountData);
};

/**
 * Load schedule data for a user
 * @param {string} email - User email
 * @returns {Object} Schedule data
 */
export const loadScheduleData = (email) => {
  return loadFromStorage(`schedule:${email}`, {});
};

/**
 * Save schedule data for a user
 * @param {string} email - User email
 * @param {Object} scheduleData - Schedule data to save
 * @returns {boolean} True if successful
 */
export const saveScheduleData = (email, scheduleData) => {
  return saveToStorage(`schedule:${email}`, scheduleData);
};

/**
 * Load encounter data for a ticket
 * @param {string} ticketId - Ticket ID
 * @returns {Object|null} Encounter data or null
 */
export const loadEncounterData = (ticketId) => {
  return loadFromStorage(`encounter:${ticketId}`, null);
};

/**
 * Save encounter data for a ticket
 * @param {string} ticketId - Ticket ID
 * @param {Object} encounterData - Encounter data to save
 * @returns {boolean} True if successful
 */
export const saveEncounterData = (ticketId, encounterData) => {
  return saveToStorage(`encounter:${ticketId}`, encounterData);
};

/**
 * Load medical history requests for a ticket
 * @param {string} ticketId - Ticket ID
 * @returns {Array} Array of medical history requests
 */
export const loadMedicalHistoryData = (ticketId) => {
  return loadFromStorage(`mh:${ticketId}`, []);
};

/**
 * Save medical history requests for a ticket
 * @param {string} ticketId - Ticket ID
 * @param {Array} mhData - Medical history data to save
 * @returns {boolean} True if successful
 */
export const saveMedicalHistoryData = (ticketId, mhData) => {
  return saveToStorage(`mh:${ticketId}`, mhData);
};

/**
 * Get current user email from localStorage
 * @returns {string|null} Current user email or null
 */
export const getCurrentUserEmail = () => {
  return localStorage.getItem("currentSpecialistEmail");
};

/**
 * Set current user email in localStorage
 * @param {string} email - User email
 * @returns {boolean} True if successful
 */
export const setCurrentUserEmail = (email) => {
  try {
    localStorage.setItem("currentSpecialistEmail", email);
    return true;
  } catch (error) {
    console.error("Error setting current user email:", error);
    return false;
  }
};
