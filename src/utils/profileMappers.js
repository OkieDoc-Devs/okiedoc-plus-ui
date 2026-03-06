/**
 * Profile Mappers
 * Reusable utility functions to translate deeply nested frontend UI states
 * (form states) into the flat JSON structures expected by the backend profile endpoints.
 */

export const mapPatientProfileToPayload = (profileState) => {
  if (!profileState) return {};

  return {
    firstName: profileState.firstName,
    lastName: profileState.lastName,
    mobileNumber: profileState.phone || profileState.mobileNumber,
    address: profileState.address,
    dateOfBirth: profileState.birthDate || profileState.dateOfBirth,
    gender: profileState.gender,
    bloodType: profileState.bloodType,
    height: profileState.height,
    weight: profileState.weight,
    allergies: profileState.allergies,
    currentMedications:
      profileState.medications || profileState.currentMedications,
    pastMedicalHistory:
      profileState.medicalHistory || profileState.pastMedicalHistory,
    emergencyContactName: profileState.emergencyContactName,
    emergencyContactRelation: profileState.emergencyContactRelation,
    emergencyContactNumber:
      profileState.emergencyContactPhone || profileState.emergencyContactNumber,
  };
};

export const mapSpecialistProfileToPayload = (profileState) => {
  if (!profileState) return {};

  return {
    firstName: profileState.firstName || profileState.fName,
    lastName: profileState.lastName || profileState.lName,
    phone: profileState.phone,
    specialization: profileState.specialization || profileState.specialty,
    subSpecialization: profileState.subSpecialization,
    bio: profileState.bio,
    prcNumber: profileState.prcNumber || profileState.licenseNumber,
  };
};

export const mapNurseProfileToPayload = (profileState) => {
  if (!profileState) return {};

  return {
    firstName: profileState.firstName || profileState.fName,
    lastName: profileState.lastName || profileState.lName,
    phone: profileState.phone,
    licenseNumber: profileState.licenseNumber || profileState.prcNumber,
    bio: profileState.bio,
  };
};
