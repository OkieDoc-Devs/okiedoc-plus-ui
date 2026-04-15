/**
 * Status helper functions for the Patient module
 * This module provides utilities for handling appointment statuses,
 * including icons, colors, and status-related operations
 */

import React from 'react';
import {
  FaClock,
  FaCheckCircle,
  FaCreditCard,
  FaUserCheck,
  FaPlay,
  FaTimesCircle,
  FaHourglassHalf,
  FaExclamationCircle
} from 'react-icons/fa';

/**
 * Get icon component for appointment status
 * @param {string} status - Appointment status
 * @returns {JSX.Element} React icon component
 */
export const getStatusIcon = (status) => {
  const iconMap = {
    'Pending': <FaClock className="patient-status-icon patient-pending" />,
    'Processing': <FaUserCheck className="patient-status-icon patient-processing" />,
    'For Payment': <FaCreditCard className="patient-status-icon patient-payment" />,
    'Confirmed': <FaCheckCircle className="patient-status-icon patient-confirmed" />,
    'Active': <FaPlay className="patient-status-icon patient-active" />,
    'Completed': <FaCheckCircle className="patient-status-icon patient-completed" />,
    'Cancelled': <FaTimesCircle className="patient-status-icon patient-cancelled" />,
    'Waiting': <FaHourglassHalf className="patient-status-icon patient-waiting" />
  };
  
  return iconMap[status] || <FaClock className="patient-status-icon" />;
};

/**
 * Get CSS class for appointment status color
 * @param {string} status - Appointment status
 * @returns {string} CSS class name
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'Pending': 'patient-status-pending',
    'Processing': 'patient-status-processing',
    'For Payment': 'patient-status-payment',
    'Confirmed': 'patient-status-confirmed',
    'Active': 'patient-status-active',
    'Completed': 'patient-status-completed',
    'Cancelled': 'patient-status-cancelled',
    'Waiting': 'patient-status-waiting'
  };
  
  return colorMap[status] || 'patient-status-default';
};

/**
 * Get human-readable status label
 * @param {string} status - Appointment status
 * @returns {string} Formatted status label
 */
export const getStatusLabel = (status) => {
  const labelMap = {
    'Pending': 'Pending Review',
    'Processing': 'Being Processed',
    'For Payment': 'Awaiting Payment',
    'Confirmed': 'Confirmed',
    'Active': 'Active Session',
    'Completed': 'Completed',
    'Cancelled': 'Cancelled',
    'Waiting': 'In Waiting Room'
  };
  
  return labelMap[status] || status;
};

/**
 * Get status description/message
 * @param {string} status - Appointment status
 * @returns {string} Status description
 */
export const getStatusDescription = (status) => {
  const descriptionMap = {
    'Pending': 'Your appointment is pending review by our medical team.',
    'Processing': 'Your appointment is being processed by our nurses.',
    'For Payment': 'Please complete the payment to confirm your appointment.',
    'Confirmed': 'Your appointment has been confirmed.',
    'Active': 'Your consultation session is currently active.',
    'Completed': 'Your consultation has been completed.',
    'Cancelled': 'This appointment has been cancelled.',
    'Waiting': 'You are in the waiting room. The doctor will be with you shortly.'
  };
  
  return descriptionMap[status] || '';
};

/**
 * Check if status allows chat functionality
 * @param {string} status - Appointment status
 * @returns {boolean} True if chat is allowed
 */
export const isChatEnabled = (status) => {
  const chatEnabledStatuses = ['Processing', 'Confirmed', 'Active', 'Waiting'];
  return chatEnabledStatuses.includes(status);
};

/**
 * Check if status allows file upload
 * @param {string} status - Appointment status
 * @returns {boolean} True if file upload is allowed
 */
export const isFileUploadEnabled = (status) => {
  const uploadEnabledStatuses = ['Processing', 'Confirmed', 'Active', 'Waiting'];
  return uploadEnabledStatuses.includes(status);
};

/**
 * Check if status allows cancellation
 * @param {string} status - Appointment status
 * @returns {boolean} True if cancellation is allowed
 */
export const isCancellationAllowed = (status) => {
  const cancellableStatuses = ['Pending', 'Processing', 'For Payment', 'Confirmed'];
  return cancellableStatuses.includes(status);
};

/**
 * Check if status requires payment
 * @param {string} status - Appointment status
 * @returns {boolean} True if payment is required
 */
export const requiresPayment = (status) => {
  return status === 'For Payment';
};

/**
 * Get all available statuses
 * @returns {Array<string>} Array of status values
 */
export const getAllStatuses = () => {
  return [
    'Pending',
    'Processing',
    'For Payment',
    'Confirmed',
    'Active',
    'Completed',
    'Cancelled',
    'Waiting'
  ];
};

/**
 * Get next possible statuses for transition
 * @param {string} currentStatus - Current appointment status
 * @returns {Array<string>} Array of possible next statuses
 */
export const getNextStatuses = (currentStatus) => {
  const transitionMap = {
    'Pending': ['Processing', 'Cancelled'],
    'Processing': ['For Payment', 'Confirmed', 'Cancelled'],
    'For Payment': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Active', 'Cancelled'],
    'Active': ['Completed'],
    'Completed': [],
    'Cancelled': [],
    'Waiting': ['Active', 'Cancelled']
  };
  
  return transitionMap[currentStatus] || [];
};

/**
 * Validate status transition
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {boolean} True if transition is valid
 */
export const isValidStatusTransition = (fromStatus, toStatus) => {
  const allowedTransitions = getNextStatuses(fromStatus);
  return allowedTransitions.includes(toStatus);
};

