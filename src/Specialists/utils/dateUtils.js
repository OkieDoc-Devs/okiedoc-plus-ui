// Date and time utility functions for specialists

/**
 * Format date label with time
 * @param {Date} dt - Date object
 * @param {string} timeLabel - Time label (e.g., "10:30 AM")
 * @returns {string} Formatted date string
 */
export const formatDateLabel = (dt, timeLabel) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${monthNames[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()} - ${timeLabel}`;
};

/**
 * Get number of days in a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days in the month
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get first day of the month (0-6, where 0 is Sunday)
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of week (0-6)
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

/**
 * Get month name from month index
 * @param {number} month - Month index (0-11)
 * @returns {string} Month name
 */
export const getMonthName = (month) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[month];
};

/**
 * Format date key for storage
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {number} day - Day
 * @returns {string} Formatted date key (YYYY-MM-DD)
 */
export const formatDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/**
 * Parse ticket date from when field
 * @param {string} whenField - The "when" field from ticket
 * @returns {Object|null} Parsed date info or null if invalid
 */
export const parseTicketDate = (whenField) => {
  if (!whenField) return null;
  
  const dateMatch = whenField.match(/(\w+)\s+(\d+),\s+(\d+)/);
  if (!dateMatch) return null;
  
  const [, monthName, dayStr, yearStr] = dateMatch;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  return {
    month: monthNames.indexOf(monthName),
    day: parseInt(dayStr),
    year: parseInt(yearStr)
  };
};

/**
 * Check if a date is today
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {number} day - Day
 * @returns {boolean} True if date is today
 */
export const isToday = (year, month, day) => {
  const today = new Date();
  return today.getFullYear() === year && 
         today.getMonth() === month && 
         today.getDate() === day;
};

/**
 * Check if a date is in the past
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {number} day - Day
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (year, month, day) => {
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};
