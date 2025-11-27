/**
 * Device detection and responsive utilities for the Patient module
 * This module provides functions to detect device types and handle responsive behavior
 */

/**
 * Check if device is mobile based on screen width
 * @param {number} breakpoint - Width breakpoint in pixels (default: 768)
 * @returns {boolean} True if device is mobile
 */
export const isMobileDevice = (breakpoint = 768) => {
  return window.innerWidth <= breakpoint;
};

/**
 * Check if device is tablet
 * @returns {boolean} True if device is tablet
 */
export const isTabletDevice = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

/**
 * Check if device is desktop
 * @returns {boolean} True if device is desktop
 */
export const isDesktopDevice = () => {
  return window.innerWidth > 1024;
};

/**
 * Get device type
 * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = () => {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
};

/**
 * Check if device supports touch
 * @returns {boolean} True if touch is supported
 */
export const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Get viewport dimensions
 * @returns {Object} Object with width and height
 */
export const getViewportDimensions = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

/**
 * Debounce function for resize events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 250) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Detect if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if device is in portrait mode
 * @returns {boolean} True if in portrait mode
 */
export const isPortrait = () => {
  return window.innerHeight > window.innerWidth;
};

/**
 * Check if device is in landscape mode
 * @returns {boolean} True if in landscape mode
 */
export const isLandscape = () => {
  return window.innerWidth > window.innerHeight;
};

/**
 * Get browser information
 * @returns {Object} Browser name and version
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)[1];
  }
  
  return { browserName, browserVersion };
};

