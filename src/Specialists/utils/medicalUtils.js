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
  ],
  Dermatology: [
    "Cosmetic Dermatology",
    "Mohs Surgery",
    "Pediatric Dermatology",
    "Dermatopathology",
  ],
  Orthopedics: [
    "Sports Medicine",
    "Spine Surgery",
    "Hand Surgery",
    "Joint Replacement",
  ],
  Pediatrics: [
    "Neonatology",
    "Pediatric Neurology",
    "Pediatric Cardiology",
    "Pediatric Endocrinology",
  ],
  "Internal Medicine": [
    "Endocrinology",
    "Gastroenterology",
    "Pulmonology",
    "Nephrology",
    "Rheumatology",
    "Infectious Disease",
  ],
  Neurology: ["Stroke", "Epilepsy", "Movement Disorders", "Neuromuscular"],
  Ophthalmology: ["Glaucoma", "Retina", "Cornea", "Pediatric Ophthalmology"],
  "Obstetrics & Gynecology": [
    "Maternal-Fetal Medicine",
    "Reproductive Endocrinology",
    "Gynecologic Oncology",
    "Urogynecology",
  ],
  "Otolaryngology (ENT)": [
    "Rhinology",
    "Laryngology",
    "Otology",
    "Head & Neck Surgery",
  ],
  Psychiatry: [
    "Child & Adolescent",
    "Addiction",
    "Geriatric",
    "Consultation-Liaison",
  ],
  Urology: [
    "Endourology",
    "Urologic Oncology",
    "Pediatric Urology",
    "Female Urology",
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
  labRequests: []
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
  remarks: ""
});

/**
 * Validate medicine data
 * @param {Object} medicine - Medicine data to validate
 * @returns {Object} Validation result
 */
export const validateMedicine = (medicine) => {
  const errors = {};

  if (!medicine.brand && !medicine.generic) {
    errors.medicine = "Enter medicine brand or generic name";
  }

  if (!medicine.instructions) {
    errors.instructions = "Enter instructions";
  }

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
  labRequests.push(labRequest);

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
