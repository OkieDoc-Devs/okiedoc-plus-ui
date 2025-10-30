/**
 * Notification Service Module
 * Manages notifications for the Nurse module
 */

import {
  loadFromStorage,
  saveToStorage,
  LOCAL_STORAGE_KEYS,
} from "./storageService.js";
import { generateNotificationId } from "./idGenerator.js";

/**
 * Get fallback notifications (default data)
 * @returns {Array} Array of fallback notifications
 */
export function getFallbackNotifications() {
  return [
    {
      id: 1,
      type: "New Ticket",
      message: "New ticket T005 submitted by Alex Brown",
      timeRelative: "5 mins ago",
      time: "5 mins ago",
      unread: true,
    },
    {
      id: 2,
      type: "Payment Confirmation",
      message: "Payment confirmed for appointment #A123",
      timeRelative: "15 mins ago",
      time: "15 mins ago",
      unread: true,
    },
    {
      id: 3,
      type: "Chat Notification",
      message: "New message from Dr. Smith",
      timeRelative: "30 mins ago",
      time: "30 mins ago",
      unread: false,
    },
    {
      id: 4,
      type: "Upload Files",
      message: "Patient uploaded medical records",
      timeRelative: "1 hour ago",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 5,
      type: "HMO Notification",
      message: "HMO approval received for patient ID P001",
      timeRelative: "2 hours ago",
      time: "2 hours ago",
      unread: false,
    },
  ];
}

/**
 * Add a new notification
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 */
export function addNotification(type, message) {
  const notifications = loadFromStorage(LOCAL_STORAGE_KEYS.notifications, []);
  const newItem = {
    id: generateNotificationId(),
    type,
    message,
    time: new Date().toISOString(),
    timeRelative: "Just now",
    unread: true,
  };
  const updated = [newItem, ...notifications];
  saveToStorage(LOCAL_STORAGE_KEYS.notifications, updated);
}

/**
 * Count unread notifications
 * @param {Array} notifications - Array of notifications
 * @returns {number} Count of unread notifications
 */
export function countUnreadNotifications(notifications) {
  return notifications.filter((n) => n.unread).length;
}
