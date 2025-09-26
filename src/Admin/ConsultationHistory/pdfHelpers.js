export const downloadTreatmentPlanPDF = (consultation) => {
  alert(`Downloading Treatment Plan PDF for ${consultation.patientName}`);
};

export const downloadPrescriptionPDF = (consultation) => {
  alert(`Downloading Prescription PDF for ${consultation.patientName}`);
};

export const downloadLabRequestPDF = (consultation) => {
  alert(`Downloading Lab Request PDF for ${consultation.patientName}`);
};

export const downloadMedicalCertificatePDF = (consultation) => {
  alert(`Downloading Medical Certificate PDF for ${consultation.patientName}`);
};

export const sendToEmail = (consultation) => {
  alert(`Emailing consultation details for ${consultation.patientName}`);
};