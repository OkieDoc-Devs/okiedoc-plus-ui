/**
 * Profile Service Module
 * Handles nurse profile management and transformations
 */

/**
 * Transform API profile data to UI format
 * @param {Object} apiProfile - Profile data from API
 * @returns {Object} Transformed profile data
 */
export function transformProfileFromAPI(apiProfile) {
  console.log("Transforming API profile data:", apiProfile);

  // API now returns camelCase, but also check snake_case and PascalCase for compatibility
  let firstName =
    apiProfile.firstName ||
    apiProfile.first_name ||
    apiProfile.First_Name ||
    "";
  let lastName =
    apiProfile.lastName || apiProfile.last_name || apiProfile.Last_Name || "";
  let email = apiProfile.email || apiProfile.Email || "";
  let licenseNumber =
    apiProfile.licenseNumber ||
    apiProfile.license_number ||
    apiProfile.License_Number ||
    "";

  try {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const userData = JSON.parse(currentUser);

      // Use currentUser data if API fields are empty
      if (!firstName && userData.firstName) {
        firstName = userData.firstName;
        console.log("Using currentUser firstName:", firstName);
      }
      if (!lastName && userData.lastName) {
        lastName = userData.lastName;
        console.log("Using currentUser lastName:", lastName);
      }
      if (userData.email) {
        email = userData.email;
        console.log("Using currentUser email:", userData.email);
      }
    }

    // Also check nurse.firstName/lastName in localStorage as last resort
    if (!firstName) {
      firstName = localStorage.getItem("nurse.firstName") || "";
    }
    if (!lastName) {
      lastName = localStorage.getItem("nurse.lastName") || "";
    }
  } catch (e) {
    console.error("Error parsing currentUser:", e);
  }

  return {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: apiProfile.phone || apiProfile.Phone || "",
    specialization:
      apiProfile.specialization || apiProfile.Specialization || "",
    licenseNumber: licenseNumber,
    experience: apiProfile.experience || apiProfile.Experience || "",
    department: apiProfile.department || apiProfile.Department || "",
  };
}

/**
 * Transform UI profile data to API format
 * @param {Object} uiProfile - Profile data from UI
 * @returns {Object} Transformed profile data for API
 */
export function transformProfileToAPI(uiProfile) {
  return {
    first_name: uiProfile.firstName,
    last_name: uiProfile.lastName,
    email: uiProfile.email,
    phone: uiProfile.phone,
    specialization: uiProfile.specialization,
    license_number: uiProfile.licenseNumber,
    experience: uiProfile.experience,
    department: uiProfile.department,
  };
}

/**
 * Get fallback profile data
 * @returns {Object} Fallback profile data
 */
export function getFallbackProfile() {
  const storedEmail =
    localStorage.getItem("nurse.email") || localStorage.getItem("userEmail");
  const storedFirstName = localStorage.getItem("nurse.firstName") || "Nurse";
  const storedLastName = localStorage.getItem("nurse.lastName") || "";

  return {
    firstName: storedFirstName,
    lastName: storedLastName,
    email: storedEmail || "nurse@okiedocplus.com",
    phone: "+1 (555) 123-4567",
    specialization: "Emergency Care",
    licenseNumber: "RN-12345",
    experience: "5 years",
    department: "Emergency Department",
  };
}

/**
 * Validate password change
 * @param {Object} passwordData - Password data object
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export function validatePasswordChange(passwordData) {
  if (
    !passwordData.currentPassword ||
    !passwordData.newPassword ||
    !passwordData.confirmPassword
  ) {
    return { valid: false, error: "All fields are required" };
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    return { valid: false, error: "New passwords do not match" };
  }

  if (passwordData.newPassword.length < 6) {
    return {
      valid: false,
      error: "New password must be at least 6 characters long",
    };
  }

  return { valid: true, error: "" };
}
