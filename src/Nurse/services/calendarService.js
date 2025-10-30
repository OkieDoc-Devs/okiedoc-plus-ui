/**
 * Calendar Service Module
 * Handles calendar-related operations and Google Calendar integration
 */

/**
 * Convert date and time to calendar date range for Google Calendar
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {string} timeStr - Time string (HH:MM)
 * @param {number} durationMinutes - Duration in minutes (default: 30)
 * @returns {Object} Object with start and end date strings
 */
export function toCalendarDateRange(dateStr, timeStr, durationMinutes = 30) {
  try {
    const startLocal = new Date(`${dateStr} ${timeStr}`);
    if (isNaN(startLocal.getTime())) {
      const fallback = new Date();
      const endFallback = new Date(
        fallback.getTime() + durationMinutes * 60000
      );
      const fmt = (d) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      return { start: fmt(fallback), end: fmt(endFallback) };
    }
    const endLocal = new Date(startLocal.getTime() + durationMinutes * 60000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return { start: fmt(startLocal), end: fmt(endLocal) };
  } catch {
    const now = new Date();
    const end = new Date(now.getTime() + durationMinutes * 60000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return { start: fmt(now), end: fmt(end) };
  }
}

/**
 * Build Google Calendar URL for a ticket
 * @param {Object} ticket - Ticket object
 * @returns {string} Google Calendar URL
 */
export function buildGoogleCalendarUrl(ticket) {
  const { start, end } = toCalendarDateRange(
    ticket.preferredDate,
    ticket.preferredTime,
    30
  );
  const title = encodeURIComponent(`Consultation: ${ticket.patientName}`);
  const details = encodeURIComponent(
    `Patient: ${ticket.patientName}\nEmail: ${ticket.email}\nMobile: ${ticket.mobile}\nChief Complaint: ${ticket.chiefComplaint}\nChannel: ${ticket.consultationChannel}\nSpecialist: ${ticket.preferredSpecialist}`
  );
  const location = encodeURIComponent("OkieDoc+ Platform");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}%2F${end}`;
}
