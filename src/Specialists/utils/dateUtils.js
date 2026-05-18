// Date and time utility functions for specialists
import {
  formatDateLabel as sharedFormatDateLabel,
  getDaysInMonth as sharedGetDaysInMonth,
  getFirstDayOfMonth as sharedGetFirstDayOfMonth,
  getMonthName as sharedGetMonthName,
  formatDateKey as sharedFormatDateKey,
  isToday as sharedIsToday,
  isPastDate as sharedIsPastDate
} from '../../utils/dateFormatter';

export const formatDateLabel = sharedFormatDateLabel;
export const getDaysInMonth = sharedGetDaysInMonth;
export const getFirstDayOfMonth = sharedGetFirstDayOfMonth;
export const getMonthName = sharedGetMonthName;
export const formatDateKey = sharedFormatDateKey;

/**
 * Parse ticket date from when field
 * @param {string} whenField - The "when" field from ticket
 * @returns {Object|null} Parsed date info or null if invalid
 */
export const parseTicketDate = (whenField) => {
  if (!whenField) return null;
  const date = new Date(whenField);
  if (isNaN(date.getTime())) return null;
  return {
    month: date.getMonth(),
    day: date.getDate(),
    year: date.getFullYear()
  };
};


/**
 * Check if a date is today
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {number} day - Day
 * @returns {boolean} True if date is today
 */
export const isToday = sharedIsToday;

/**
 * Check if a date is in the past
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {number} day - Day
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = sharedIsPastDate;
