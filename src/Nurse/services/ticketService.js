/**
 * Ticket Service Module
 * Handles ticket-related business logic
 */

import { generateTicketId } from "./idGenerator.js";

/**
 * Get fallback tickets (default data)
 * @returns {Array} Array of fallback tickets
 */
export function getFallbackTickets() {
  return [
    {
      id: "T001",
      patientName: "John Doe",
      email: "john.doe@email.com",
      mobile: "+1-555-0100",
      chiefComplaint: "Chest pain and shortness of breath",
      symptoms: "Sharp pain in chest, difficulty breathing",
      preferredDate: "2025-10-10",
      preferredTime: "14:00",
      preferredSpecialist: "Dr. Smith",
      consultationChannel: "Platform",
      hasHMO: false,
      status: "Pending",
      claimedBy: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "T002",
      patientName: "Jane Smith",
      email: "jane.smith@email.com",
      mobile: "+1-555-0101",
      chiefComplaint: "Severe headache and nausea",
      symptoms: "Persistent headache, feeling nauseous",
      preferredDate: "2025-10-11",
      preferredTime: "10:30",
      preferredSpecialist: "Dr. Lee",
      consultationChannel: "Mobile Call",
      hasHMO: true,
      status: "Confirmed",
      claimedBy: "N001",
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Create initial sample tickets
 * @returns {Array} Array of sample tickets
 */
export function createInitialTickets() {
  return [
    {
      id: generateTicketId(),
      patientName: "John Doe",
      email: "john.doe@example.com",
      mobile: "09171234567",
      chiefComplaint: "Headache",
      symptoms: "Mild pain",
      otherSymptoms: "Nausea",
      preferredDate: "2025-09-01",
      preferredTime: "09:00",
      preferredSpecialist: "Dr. Smith",
      consultationChannel: "Platform",
      hasHMO: false,
      hmo: {
        company: "",
        memberId: "",
        expirationDate: "",
        loaCode: "",
        eLOAFile: null,
      },
      source: "platform",
      status: "Pending",
      claimedBy: null,
    },
    {
      id: generateTicketId(),
      patientName: "Jane Smith",
      email: "jane.smith@example.com",
      mobile: "09179876543",
      chiefComplaint: "Cough",
      symptoms: "Dry cough",
      otherSymptoms: "Fever",
      preferredDate: "2025-09-02",
      preferredTime: "14:00",
      preferredSpecialist: "Dr. Lee",
      consultationChannel: "Platform",
      hasHMO: true,
      hmo: {
        company: "MediCare",
        memberId: "MC12345",
        expirationDate: "2026-01-01",
        loaCode: "LOA9876",
        eLOAFile: null,
      },
      source: "platform",
      status: "Pending",
      claimedBy: null,
    },
    {
      id: generateTicketId(),
      patientName: "Carlos Gomez",
      email: "carlos.gomez@example.com",
      mobile: "09175551234",
      chiefComplaint: "Back pain",
      symptoms: "Lower back pain",
      otherSymptoms: "None",
      preferredDate: "2025-09-03",
      preferredTime: "11:30",
      preferredSpecialist: "Dr. Patel",
      consultationChannel: "Platform",
      hasHMO: false,
      hmo: {
        company: "",
        memberId: "",
        expirationDate: "",
        loaCode: "",
        eLOAFile: null,
      },
      source: "platform",
      status: "Pending",
      claimedBy: null,
    },
  ];
}

/**
 * Filter tickets by status
 * @param {Array} tickets - Array of tickets
 * @param {string} status - Status to filter by
 * @param {string} nurseId - Optional nurse ID for additional filtering
 * @returns {Array} Filtered tickets
 */
export function filterTicketsByStatus(tickets, status, nurseId = null) {
  if (status === "Pending") {
    // Show tickets that are Pending and not claimed by anyone (nurse or specialist)
    return tickets.filter((t) => t.status === "Pending" && !t.claimedBy);
  }
  if (status === "Processing") {
    if (nurseId) {
      // Show tickets that are Processing and:
      // - Claimed by this nurse, OR
      // - Passed back to nurse (passedBackToNurse = true), OR
      // - Pending but claimed by this nurse
      return tickets.filter(
        (t) =>
          (t.status === "Processing" && t.claimedBy === nurseId) ||
          (t.status === "Processing" && t.passedBackToNurse === true) ||
          (t.claimedBy === nurseId && t.status === "Pending")
      );
    } else {
      // If no nurseId, show all Processing tickets (including those assigned to specialists)
      return tickets.filter((t) => t.status === "Processing");
    }
  }
  if (status === "Confirmed" && nurseId) {
    return tickets.filter(
      (t) => t.status === "Confirmed" && t.claimedBy === nurseId
    );
  }
  return tickets.filter((t) => t.status === status);
}

/**
 * Create a new ticket
 * @param {Object} ticketData - Ticket data
 * @param {Object} textPills - Text pills data (medical records, family history, allergies)
 * @returns {Object} New ticket object
 */
export function createNewTicket(ticketData, textPills = {}) {
  const id = generateTicketId();
  return {
    id,
    ...ticketData,
    medicalRecordsPills: textPills.medicalRecords || [],
    familyHistoryPills: textPills.familyHistory || [],
    allergiesPills: textPills.allergies || [],
    hmo: ticketData.hasHMO ? ticketData.hmo : null,
    status: "Pending",
    createdAt: new Date().toISOString(),
    claimedBy: null,
  };
}

/**
 * Claim a ticket for a nurse
 * @param {Array} tickets - Array of tickets
 * @param {string} ticketId - Ticket ID to claim
 * @param {string} nurseId - Nurse ID claiming the ticket
 * @returns {Array} Updated tickets array
 */
export function claimTicket(tickets, ticketId, nurseId) {
  return tickets.map((t) =>
    t.id === ticketId && !t.claimedBy
      ? { ...t, claimedBy: nurseId, status: "Processing" }
      : t
  );
}

/**
 * Update ticket status
 * @param {Array} tickets - Array of tickets
 * @param {string} ticketId - Ticket ID to update
 * @param {string} newStatus - New status
 * @returns {Array} Updated tickets array
 */
export function updateTicketStatus(tickets, ticketId, newStatus) {
  return tickets.map((t) =>
    t.id === ticketId ? { ...t, status: newStatus } : t
  );
}

/**
 * Reschedule a ticket
 * @param {Array} tickets - Array of tickets
 * @param {string} ticketId - Ticket ID to reschedule
 * @param {string} newDate - New date
 * @param {string} newTime - New time
 * @returns {Array} Updated tickets array
 */
export function rescheduleTicket(tickets, ticketId, newDate, newTime) {
  return tickets.map((t) =>
    t.id === ticketId
      ? {
          ...t,
          preferredDate: newDate,
          preferredTime: newTime,
        }
      : t
  );
}

/**
 * Remove a ticket
 * @param {Array} tickets - Array of tickets
 * @param {string} ticketId - Ticket ID to remove
 * @returns {Array} Updated tickets array
 */
export function removeTicket(tickets, ticketId) {
  return tickets.filter((t) => t.id !== ticketId);
}
