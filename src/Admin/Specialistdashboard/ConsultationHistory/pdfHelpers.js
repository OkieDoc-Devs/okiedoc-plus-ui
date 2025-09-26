// ConsultationHistory/pdfHelpers.js

import jsPDF from "jspdf";
import "jspdf-autotable";

export const downloadTreatmentPlanPDF = (consultation) => {
  const doc = new jsPDF();
  doc.text(`Treatment Plan for ${consultation.patientName}`, 14, 20);
  doc.text(`Date: ${consultation.date}`, 14, 30);
  doc.save(`${consultation.patientName}-TreatmentPlan.pdf`);
};

export const downloadPrescriptionPDF = (consultation) => {
  const doc = new jsPDF();
  doc.text(`Prescription for ${consultation.patientName}`, 14, 20);
  consultation.prescription?.forEach((p, i) => {
    doc.text(`${i + 1}. ${p.brand} (${p.generic}) - ${p.dosage} ${p.form} × ${p.quantity}`, 14, 30 + i * 10);
  });
  doc.save(`${consultation.patientName}-Prescription.pdf`);
};

export const downloadLabRequestPDF = (consultation) => {
  const doc = new jsPDF();
  doc.text(`Lab Requests for ${consultation.patientName}`, 14, 20);
  consultation.labs?.forEach((l, i) => {
    doc.text(`${i + 1}. ${l.test} - ${l.remarks}`, 14, 30 + i * 10);
  });
  doc.save(`${consultation.patientName}-LabRequests.pdf`);
};

export const downloadMedicalCertificatePDF = (consultation) => {
  const doc = new jsPDF();
  doc.text(`Medical Certificate for ${consultation.patientName}`, 14, 20);
  doc.text(`Date: ${consultation.date}`, 14, 30);
  doc.save(`${consultation.patientName}-MedicalCertificate.pdf`);
};

export const downloadMasterPDF = (consultation) => {
  const doc = new jsPDF();
  doc.text(`Full Consultation Record for ${consultation.patientName}`, 14, 20);
  doc.text(`Date: ${consultation.date}`, 14, 30);
  doc.text(`Complaint: ${consultation.complaint}`, 14, 40);
  doc.text(`SOAP Notes: ${consultation.soap || "—"}`, 14, 50);
  doc.save(`${consultation.patientName}-MasterPDF.pdf`);
};

export const sendToEmail = (consultation) => {
  alert(`Send consultation of ${consultation.patientName} to email`);
};


