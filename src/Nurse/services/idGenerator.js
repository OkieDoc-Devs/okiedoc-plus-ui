/**
 * ID Generator Service Module
 * Generates unique IDs for various entities
 */

/**
 * Generate a unique ID with specified prefix
 * @param {string} prefix - Prefix for the ID (default: "T")
 * @returns {string} Generated unique ID
 */
export function generateId(prefix = "T") {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

/**
 * Generate a ticket ID
 * @returns {string} Ticket ID
 */
export function generateTicketId() {
  return generateId("TK");
}

/**
 * Generate an invoice ID
 * @returns {string} Invoice ID
 */
export function generateInvoiceId() {
  return generateId("INV");
}

/**
 * Generate a notification ID
 * @returns {string} Notification ID
 */
export function generateNotificationId() {
  return generateId("NT");
}

/**
 * Generate a nurse ID
 * @returns {string} Nurse ID
 */
export function generateNurseId() {
  return generateId("N");
}
