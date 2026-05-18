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
  return [];
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
