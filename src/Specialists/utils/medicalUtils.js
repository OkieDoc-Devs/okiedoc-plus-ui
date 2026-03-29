// Medical utility functions for specialists

/**
 * Medical specializations and their sub-specializations
 */
export const SUB_SPECIALIZATIONS = {
  Cardiology: [
    "Interventional Cardiology",
    "Electrophysiology",
    "Heart Failure",
    "Pediatric Cardiology",
    "N/A",
  ],
  Dermatology: [
    "Cosmetic Dermatology",
    "Mohs Surgery",
    "Pediatric Dermatology",
    "Dermatopathology",
    "N/A",
  ],
  Orthopedics: [
    "Sports Medicine",
    "Spine Surgery",
    "Hand Surgery",
    "Joint Replacement",
    "N/A",
  ],
  Pediatrics: [
    "Neonatology",
    "Pediatric Neurology",
    "Pediatric Cardiology",
    "Pediatric Endocrinology",
    "N/A",
  ],
  "Internal Medicine": [
    "Endocrinology",
    "Gastroenterology",
    "Pulmonology",
    "Nephrology",
    "Rheumatology",
    "Infectious Disease",
    "N/A",
  ],
  Neurology: ["Stroke", "Epilepsy", "Movement Disorders", "Neuromuscular", "N/A"],
  Ophthalmology: ["Glaucoma", "Retina", "Cornea", "Pediatric Ophthalmology", "N/A"],
  "Obstetrics & Gynecology": [
    "Maternal-Fetal Medicine",
    "Reproductive Endocrinology",
    "Gynecologic Oncology",
    "Urogynecology",
    "N/A",
  ],
  "Otolaryngology (ENT)": [
    "Rhinology",
    "Laryngology",
    "Otology",
    "Head & Neck Surgery",
    "N/A",
  ],
  Psychiatry: [
    "Child & Adolescent",
    "Addiction",
    "Geriatric",
    "Consultation-Liaison",
    "N/A",
  ],
  Urology: [
    "Endourology",
    "Urologic Oncology",
    "Pediatric Urology",
    "Female Urology",
    "N/A",
  ],
};

/**
 * Create default encounter data
 * @returns {Object} Default encounter object
 */
export const createDefaultEncounter = () => ({
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
  referral: "",
  followUp: false,
  medicines: [],
  labRequests: [],
  icd10: ""
});

/**
 * Create default medicine form
 * @returns {Object} Default medicine form object
 */
export const createDefaultMedicineForm = () => ({
  brand: "",
  generic: "",
  dosage: "",
  form: "",
  quantity: "",
  instructions: ""
});

/**
 * Create default lab form
 * @returns {Object} Default lab form object
 */
export const createDefaultLabForm = () => ({
  test: "",
  customTestName: "",
  remarks: ""
});

/**
 * Validate medicine data
 * @param {Object} medicine - Medicine data to validate
 * @returns {Object} Validation result
 */
export const validateMedicine = (medicine) => {
  const errors = {};

  if (!medicine.name || medicine.name.trim() === "") {
    errors.medicine = "Enter medicine brand or generic name";
  }

  // Optional: comment this out if specialInstructions is optional
  // if (!medicine.specialInstructions) {
  //   errors.instructions = "Enter instructions";
  // }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate lab request data
 * @param {Object} labRequest - Lab request data to validate
 * @returns {Object} Validation result
 */
export const validateLabRequest = (labRequest) => {
  const errors = {};

  if (!labRequest.test || labRequest.test.trim() === "") {
    errors.test = "Enter a lab test";
  }

  if (labRequest.test === "Custom Test") {
    if (!labRequest.customTestName || labRequest.customTestName.trim() === "") {
      errors.customTestName = "Enter a custom test name";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Add medicine to encounter
 * @param {Object} encounter - Current encounter data
 * @param {Object} medicine - Medicine to add
 * @returns {Object} Updated encounter data
 */
export const addMedicineToEncounter = (encounter, medicine) => {
  const validation = validateMedicine(medicine);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0]);
  }

  const medicines = [...(encounter.medicines || [])];
  medicines.push(medicine);

  return {
    ...encounter,
    medicines
  };
};

/**
 * Remove medicine from encounter
 * @param {Object} encounter - Current encounter data
 * @param {number} index - Index of medicine to remove
 * @returns {Object} Updated encounter data
 */
export const removeMedicineFromEncounter = (encounter, index) => {
  const medicines = [...(encounter.medicines || [])];
  medicines.splice(index, 1);

  return {
    ...encounter,
    medicines
  };
};

/**
 * Add lab request to encounter
 * @param {Object} encounter - Current encounter data
 * @param {Object} labRequest - Lab request to add
 * @returns {Object} Updated encounter data
 */
export const addLabRequestToEncounter = (encounter, labRequest) => {
  const validation = validateLabRequest(labRequest);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0]);
  }

  const labRequests = [...(encounter.labRequests || [])];
  const normalized = {
    test: (labRequest.test || "").trim(),
    remarks: (labRequest.remarks || "").trim(),
    ...(labRequest.test === "Custom Test"
      ? { customTestName: (labRequest.customTestName || "").trim() }
      : {}),
  };

  labRequests.push(normalized);

  return {
    ...encounter,
    labRequests
  };
};

/**
 * Remove lab request from encounter
 * @param {Object} encounter - Current encounter data
 * @param {number} index - Index of lab request to remove
 * @returns {Object} Updated encounter data
 */
export const removeLabRequestFromEncounter = (encounter, index) => {
  const labRequests = [...(encounter.labRequests || [])];
  labRequests.splice(index, 1);

  return {
    ...encounter,
    labRequests
  };
};

/**
 * Create medical history request
 * @param {Object} data - Medical history request data
 * @returns {Object} Medical history request object
 */
export const createMedicalHistoryRequest = (data) => {
  const { reason, from, to, consent } = data;

  if (!consent) {
    throw new Error("Patient consent is required");
  }

  return {
    id: 'MH-' + Date.now(),
    reason: reason?.trim() || '',
    from: from || '',
    to: to || '',
    consent: true,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
};

/**
 * Update medical history request status
 * @param {Object} request - Medical history request
 * @param {string} status - New status
 * @returns {Object} Updated medical history request
 */
export const updateMedicalHistoryStatus = (request, status) => ({
  ...request,
  status,
  updatedAt: new Date().toISOString()
});

/**
 * Format medicine for display
 * @param {Object} medicine - Medicine object
 * @returns {string} Formatted medicine string
 */
export const formatMedicineDisplay = (medicine) => {
  const parts = [];

  if (medicine.brand || medicine.generic) {
    parts.push(medicine.brand || medicine.generic);
  }

  if (medicine.dosage) {
    parts.push(medicine.dosage);
  }

  if (medicine.form) {
    parts.push(`/ ${medicine.form}`);
  }

  if (medicine.quantity) {
    parts.push(`(Qty: ${medicine.quantity})`);
  }

  return parts.join(' ');
};

/**
 * Format lab request for display
 * @param {Object} labRequest - Lab request object
 * @returns {string} Formatted lab request string
 */
export const formatLabRequestDisplay = (labRequest) => {
  return `${labRequest.test}${labRequest.remarks ? ` - ${labRequest.remarks}` : ''}`;
};

/**
 * Get available sub-specializations for a specialization
 * @param {string} specialization - Main specialization
 * @returns {Array} Array of sub-specializations
 */
export const getSubSpecializations = (specialization) => {
  return SUB_SPECIALIZATIONS[specialization] || [];
};

/**
 * Check if specialization exists
 * @param {string} specialization - Specialization to check
 * @returns {boolean} True if specialization exists
 */
export const isValidSpecialization = (specialization) => {
  return Object.keys(SUB_SPECIALIZATIONS).includes(specialization);
};

/**
 * Check if sub-specialization is valid for a specialization
 * @param {string} specialization - Main specialization
 * @param {string} subSpecialization - Sub-specialization to check
 * @returns {boolean} True if sub-specialization is valid
 */
export const isValidSubSpecialization = (specialization, subSpecialization) => {
  const validSubs = getSubSpecializations(specialization);
  return validSubs.includes(subSpecialization);
};
