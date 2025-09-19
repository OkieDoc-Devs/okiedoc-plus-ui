// ConsultationHistory/pdfHelpers.js

import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Utility function: Download a PDF with a title and table data
 */
const generatePDF = (title, data, filename) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  if (data && data.length > 0) {
    doc.autoTable({
      startY: 30,
      head: [Object.keys(data[0])],
      body: data.map((row) => Object.values(row)),
    });
  } else {
    doc.text("No data available", 14, 30);
  }

  doc.save(filename);
};

// Download functions
export const downloadTreatmentPlanPDF = (consultation) => {
  generatePDF(
    `Treatment Plan - ${consultation.patientName}`,
    consultation.treatmentPlan || [],
    `TreatmentPlan_${consultation.patientName}.pdf`
  );
};

export const downloadPrescriptionPDF = (consultation) => {
  generatePDF(
    `Prescription - ${consultation.patientName}`,
    consultation.prescription || [],
    `Prescription_${consultation.patientName}.pdf`
  );
};

export const downloadLabRequestPDF = (consultation) => {
  generatePDF(
    `Lab Requests - ${consultation.patientName}`,
    consultation.labs || [],
    `LabRequests_${consultation.patientName}.pdf`
  );
};

export const downloadMedicalCertificatePDF = (consultation) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Medical Certificate - ${consultation.patientName}`, 14, 20);
  doc.text(`Issued by: ${consultation.specialist || "—"}`, 14, 30);
  doc.text(`Date: ${consultation.date || "—"}`, 14, 40);
  doc.save(`MedicalCertificate_${consultation.patientName}.pdf`);
};

export const downloadMasterPDF = (consultation) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Consultation Summary - ${consultation.patientName}`, 14, 20);
  doc.text(`Ticket: ${consultation.ticket || "—"}`, 14, 30);
  doc.text(`Date: ${consultation.date || "—"}`, 14, 40);
  doc.text(`Specialist: ${consultation.specialist || "—"}`, 14, 50);

  doc.text("Chief Complaint:", 14, 60);
  doc.text(consultation.complaint || "—", 14, 70);

  doc.text("SOAP Notes:", 14, 80);
  doc.text(consultation.soap || "—", 14, 90);

  doc.text("Doctor's Note:", 14, 100);
  doc.text(consultation.doctorsNote || "—", 14, 110);

  doc.save(`MasterPDF_${consultation.patientName}.pdf`);
};

export const sendToEmail = (consultation) => {
  alert(
    `Pretend sending email for ${consultation.patientName}. Implement real email logic here.`
  );
};

