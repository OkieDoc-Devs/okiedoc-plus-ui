/**
 * Invoice Service Module
 * Handles invoice generation and PDF creation
 */

import { generateInvoiceId } from "./idGenerator.js";

/**
 * Create initial invoice data
 * @returns {Object} Initial invoice data structure
 */
export function createInitialInvoiceData() {
  return {
    items: [
      {
        name: "Consultation Fee",
        description: "Medical consultation",
        quantity: 1,
        amount: 100,
      },
    ],
    platformFee: 25,
    eNurseFee: 15,
    invoiceNumber: "",
    paymentLink: "",
  };
}

/**
 * Initialize invoice data for a ticket
 * @returns {Object} Invoice data
 */
export function initializeInvoice() {
  const invoiceNumber = generateInvoiceId();
  const paymentLink = `${window.location.origin}/pay/${invoiceNumber}`;

  return {
    items: [
      {
        name: "Consultation Fee",
        description: "Medical consultation",
        quantity: 1,
        amount: 100,
      },
    ],
    platformFee: 25,
    eNurseFee: 15,
    invoiceNumber,
    paymentLink,
  };
}

/**
 * Calculate invoice total
 * @param {Object} invoiceData - Invoice data
 * @returns {number} Total amount
 */
export function calculateInvoiceTotal(invoiceData) {
  const itemsTotal = invoiceData.items.reduce(
    (sum, it) => sum + Number(it.amount || 0) * Number(it.quantity || 0),
    0
  );
  return (
    itemsTotal +
    Number(invoiceData.platformFee || 0) +
    Number(invoiceData.eNurseFee || 0)
  );
}

/**
 * Format date for invoice display
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
export function formatInvoiceDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const [y, m, day] = dateStr.split("-");
    if (y && m && day) {
      return `${day}/${m}/${y.slice(-2)}`;
    }
    return dateStr;
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/**
 * Format time for invoice display
 * @param {string} timeStr - Time string
 * @returns {string} Formatted time
 */
export function formatInvoiceTime(timeStr) {
  if (!timeStr) return "";
  let [h, m] = timeStr.split(":");
  h = Number(h);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Generate invoice PDF
 * @param {Object} invoiceData - Invoice data
 * @param {Object} invoiceTicket - Ticket associated with invoice
 * @returns {Promise<void>}
 */
export async function generateInvoicePDF(invoiceData, invoiceTicket) {
  if (!invoiceTicket) return;

  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF();

  const logoUrl = "/okie-doc-logo.png";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    let displayWidth = 40;
    let displayHeight = displayWidth / (1839 / 544);

    img.onload = () => {
      canvas.width = img.width + 12;
      canvas.height = img.height + 12;

      ctx.shadowColor = "#399eeb";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 63;
      ctx.shadowOffsetY = 80;

      ctx.drawImage(img, 0, 0, img.width, img.height);

      const logoBase64 = canvas.toDataURL("image/png");
      pdf.addImage(logoBase64, "PNG", 85, 10, displayWidth, displayHeight);

      generatePDFContent(pdf, invoiceData, invoiceTicket);
    };

    img.src = logoUrl;
  } catch {
    generatePDFContent(pdf, invoiceData, invoiceTicket);
  }
}

/**
 * Generate PDF content (internal helper)
 * @param {Object} pdf - jsPDF instance
 * @param {Object} invoiceData - Invoice data
 * @param {Object} invoiceTicket - Ticket data
 */
function generatePDFContent(pdf, invoiceData, invoiceTicket) {
  pdf.setFont("helvetica");
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");

  let yPosition = 35;

  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 150, yPosition);
  pdf.text(`Invoice No: ${invoiceData.invoiceNumber}`, 20, yPosition);

  yPosition += 6;
  pdf.text(
    `Date of Consultation: ${formatInvoiceDate(
      invoiceTicket.preferredDate
    )} ${formatInvoiceTime(invoiceTicket.preferredTime)}`,
    20,
    yPosition
  );

  yPosition += 15;
  pdf.setFont("helvetica", "bold");
  pdf.text("PATIENT INFORMATION:", 20, yPosition);

  pdf.setFont("helvetica", "normal");
  yPosition += 8;

  pdf.text(`Name: ${invoiceTicket.patientName}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Mobile Number: ${invoiceTicket.mobile}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Email Address: ${invoiceTicket.email}`, 20, yPosition);

  yPosition += 20;
  pdf.setFont("helvetica", "bold");
  pdf.text("INVOICE ITEMS:", 20, yPosition);

  yPosition += 10;
  pdf.text("Item", 20, yPosition);
  pdf.text("Description", 70, yPosition);
  pdf.text("Qty", 130, yPosition);
  pdf.text("Amount", 150, yPosition);

  pdf.line(20, yPosition + 2, 180, yPosition + 2);

  pdf.setFont("helvetica", "normal");
  yPosition += 8;
  invoiceData.items.forEach((item) => {
    pdf.text(item.name, 20, yPosition);
    pdf.text(item.description, 70, yPosition);
    pdf.text(item.quantity.toString(), 130, yPosition);
    pdf.text(`PHP ${item.amount}`, 150, yPosition);
    yPosition += 8;
  });

  yPosition += 10;
  pdf.line(20, yPosition, 180, yPosition);
  yPosition += 8;

  pdf.text(`Platform Fee:`, 120, yPosition);
  pdf.text(`PHP ${invoiceData.platformFee}`, 150, yPosition);
  yPosition += 6;

  pdf.text(`E-Nurse Fee:`, 120, yPosition);
  pdf.text(`PHP ${invoiceData.eNurseFee}`, 150, yPosition);
  yPosition += 8;

  const total = calculateInvoiceTotal(invoiceData);
  pdf.setFont("helvetica", "bold");
  pdf.text(`TOTAL AMOUNT:`, 110, yPosition);
  pdf.text(`PHP ${total.toFixed(2)}`, 150, yPosition);

  yPosition += 15;
  pdf.setFont("helvetica", "normal");
  pdf.text("Payment Link:", 20, yPosition);
  yPosition += 6;
  pdf.setTextColor(0, 0, 255);
  pdf.text(invoiceData.paymentLink, 20, yPosition);
  pdf.setTextColor(0, 0, 0);

  yPosition += 20;
  pdf.line(20, yPosition, 180, yPosition);
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.text("This is a system-generated invoice.", 105, yPosition, {
    align: "center",
  });

  yPosition += 8;
  pdf.text(
    "For inquiries, please contact support@okiedocplus.com",
    105,
    yPosition,
    {
      align: "center",
    }
  );

  pdf.save(`Invoice_${invoiceData.invoiceNumber || "OkieDoc"}.pdf`);
}
