import React, { useEffect, useState, useRef } from "react";
import {
  IconSettings,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendarEvent,
  IconDroplet,
  IconShield,
  IconAddressBook,
  IconHistory,
  IconCreditCard,
  IconBell,
  IconLock,
  IconWorld,
  IconLogout,
  IconChevronRight,
  IconCheck,
  IconX,
  IconLoader2,
  IconActivity,
  IconAlertCircle,
  IconCamera,
} from "@tabler/icons-react";
import "../css/Patient_Profile.css";

import {
  fetchPatientProfile,
  updatePatientProfile,
  uploadProfilePicture,
  logoutPatient,
} from "../services/apiService";
import { usePSGC } from "../../hooks/usePSGC";

import { useModal } from "../contexts/Modals";

const settingsLinks = [
  { label: "Medical History", icon: IconHistory },
  { label: "Insurance Details", icon: IconShield },
  { label: "Payment Methods", icon: IconCreditCard },
  { label: "Notifications", icon: IconBell },
  { label: "Privacy & Security", icon: IconLock },
  { label: "Language & Region", icon: IconWorld },
];

const BLOOD_TYPE_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];

const DEFAULT_PROFILE_DATA = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  barangay: "",
  city: "",
  province: "",
  region: "",
  zipCode: "",
  dob: "",
  bloodType: "Unknown",
  allergies: [],
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactAddress: "",
  role: "Patient",
  createdAt: new Date().toISOString(),
  profilePictureUrl: null,
  stats: { appointments: 0, prescriptions: 0, ptSessions: 0 },
};

const MAX_ALLERGIES = 20;

const normalizeAllergies = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapApiProfileToState = (profile = {}) => ({
  ...DEFAULT_PROFILE_DATA,
  firstName: profile.firstName || "",
  middleName: profile.middleName || "",
  lastName: profile.lastName || "",
  email: profile.email || "",
  phone: profile.mobileNumber || profile.phone || "",
  addressLine1: profile.addressLine1 || "",
  addressLine2: profile.addressLine2 || "",
  barangay: profile.barangay || "",
  city: profile.city || "",
  province: profile.province || "",
  region: profile.region || "",
  zipCode: profile.zipCode || "",
  dob: profile.dateOfBirth || "",
  bloodType: profile.bloodType || "Unknown",
  allergies: normalizeAllergies(profile.allergies),
  emergencyContactName: profile.emergencyContactName || "",
  emergencyContactPhone: profile.emergencyContactPhone || "",
  emergencyContactAddress: profile.emergencyContactAddress || "",
  role: profile.role || "Patient",
  createdAt: profile.createdAt || new Date().toISOString(),
  profilePictureUrl: profile.profilePictureUrl || null,
  stats: profile.stats || { appointments: 0, prescriptions: 0, ptSessions: 0 },
});

export default function Patient_Profile() {
  const { openDiyModal } = useModal();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(DEFAULT_PROFILE_DATA);
  const [editData, setEditData] = useState(DEFAULT_PROFILE_DATA);

  const [isEditing, setIsEditing] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  // --- UX STATES ---
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [formErrors, setFormErrors] = useState({}); // <-- NEW: Field specific errors

  const {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = usePSGC();

  // --- NAVIGATION PROTECTION ---
  const [pendingNavPath, setPendingNavPath] = useState(null);

  useEffect(() => {
    window.isProfileEditing = isEditing;
    window.triggerProfileCancelModal = (targetPath) => {
      setPendingNavPath(targetPath);
      setShowCancelModal(true);
    };

    const handleBeforeUnload = (e) => {
      if (isEditing) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.isProfileEditing = false;
      window.triggerProfileCancelModal = null;
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditing]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchPatientProfile();
        const mappedProfile = mapApiProfileToState(profile);
        setProfileData(mappedProfile);
        setEditData(mappedProfile);
      } catch (error) {
        console.error("Failed to load patient profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (regions.length > 0 && editData.region) {
      const selectedRegion = regions.find((r) => r.name === editData.region);
      if (selectedRegion) fetchProvinces(selectedRegion.code);
    }
  }, [regions, editData.region, fetchProvinces]);

  useEffect(() => {
    if (provinces.length > 0 && editData.province) {
      const selectedProvince = provinces.find(
        (p) => p.name === editData.province,
      );
      if (selectedProvince) fetchCities(selectedProvince.code);
    }
  }, [provinces, editData.province, fetchCities]);

  useEffect(() => {
    if (cities.length > 0 && editData.city) {
      const selectedCity = cities.find((c) => c.name === editData.city);
      if (selectedCity) fetchBarangays(selectedCity.code);
    }
  }, [cities, editData.city, fetchBarangays]);

  const handleRegionChange = (e) => {
    const val = e.target.value;
    setEditData((prev) => ({
      ...prev,
      region: val,
      province: "",
      city: "",
      barangay: "",
    }));
    const selectedRegion = regions.find((r) => r.name === val);
    if (selectedRegion) fetchProvinces(selectedRegion.code);
  };

  const handleProvinceChange = (e) => {
    const val = e.target.value;
    setEditData((prev) => ({ ...prev, province: val, city: "", barangay: "" }));
    const selectedProvince = provinces.find((p) => p.name === val);
    if (selectedProvince) fetchCities(selectedProvince.code);
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setEditData((prev) => ({ ...prev, city: val, barangay: "" }));
    const selectedCity = cities.find((c) => c.name === val);
    if (selectedCity) fetchBarangays(selectedCity.code);
  };

  const handleBarangayChange = (e) => {
    setEditData((prev) => ({ ...prev, barangay: e.target.value }));
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    try {
      setIsUploadingPic(true);
      const formData = new FormData();
      formData.append("photo", file);

      const response = await uploadProfilePicture(formData);
      const newPicUrl = response?.url || URL.createObjectURL(file);
      setProfileData((prev) => ({ ...prev, profilePictureUrl: newPicUrl }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEditClick = () => {
    setEditData({ ...profileData });
    setAllergyInput("");
    setSaveError("");
    setFormErrors({});
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setPendingNavPath(null);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setIsEditing(false);
    setShowCancelModal(false);
    setEditData({ ...profileData });

    if (pendingNavPath) {
      setTimeout(() => {
        window.location.hash = `#/${pendingNavPath}`;
      }, 10);
      setPendingNavPath(null);
    }
  };

  const handleKeepEditing = () => {
    setShowCancelModal(false);
    setPendingNavPath(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutPatient();
    } finally {
      window.location.href = "/";
    }
  };

  // --- SUBMIT WITH VALIDATION ---
  const handleSaveChanges = async () => {
    setSaveError("");
    setFormErrors({});
    let finalData = { ...editData };

    // --- FORM VALIDATION ---
    const errors = {};

    if (!finalData.firstName.trim())
      errors.firstName = "First Name is required.";
    if (!finalData.lastName.trim()) errors.lastName = "Last Name is required.";
    if (!finalData.addressLine1.trim())
      errors.addressLine1 = "Street address is required.";
    if (!finalData.region) errors.region = "Region is required.";
    if (!finalData.province) errors.province = "Province is required.";
    if (!finalData.city) errors.city = "City is required.";
    if (!finalData.barangay) errors.barangay = "Barangay is required.";

    if (!finalData.dob) {
      errors.dob = "Date of Birth is required.";
    } else {
      // Calculate exactly if the user is 18 or older
      const today = new Date();
      const birthDate = new Date(finalData.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      // If their birthday hasn't happened yet this year, subtract 1 from age
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        errors.dob = "You must be at least 18 years old to use this platform.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSaveError("Please fix the highlighted errors before saving.");
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top to see errors
      return; // STOP EXECUTION!
    }
    // -----------------------

    const payload = {
      firstName: finalData.firstName.trim(),
      middleName: finalData.middleName.trim(),
      lastName: finalData.lastName.trim(),
      email: finalData.email,
      mobileNumber: finalData.phone,
      addressLine1: finalData.addressLine1,
      addressLine2: finalData.addressLine2,
      barangay: finalData.barangay,
      city: finalData.city,
      province: finalData.province,
      region: finalData.region,
      zipCode: finalData.zipCode,
      birthday: finalData.dob || null,
      bloodType: finalData.bloodType || "Unknown",
      allergies: finalData.allergies.join(", "),
      emergencyContactName: finalData.emergencyContactName,
      emergencyContactPhone: finalData.emergencyContactPhone,
      emergencyContactAddress: finalData.emergencyContactAddress,
    };

    try {
      setIsSaving(true);
      await updatePatientProfile(payload);
      setProfileData(finalData);
      setEditData(finalData);
      setAllergyInput("");

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to save patient profile:", error);
      setSaveError(
        error.message || "Failed to save patient profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeWithLimit = (field, value, limit, ignoreSpaces = false) => {
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: null })); // Clear error on typing

    if (ignoreSpaces) {
      const nonSpaceCount = value.replace(/\s/g, "").length;
      if (nonSpaceCount <= limit) {
        setEditData((prev) => ({ ...prev, [field]: value }));
      }
    } else {
      if (value.length <= limit) {
        setEditData((prev) => ({ ...prev, [field]: value }));
      }
    }
  };

  const handlePhoneChange = (field, value) => {
    let digits = value.replace(/\D/g, "");

    if (digits.length === 0) {
      setEditData((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    if (digits.startsWith("0")) {
      digits = "63" + digits.substring(1);
    } else if (!digits.startsWith("63")) {
      if (digits === "6") {
        digits = "6";
      } else {
        digits = "63" + digits;
      }
    }

    digits = digits.substring(0, 12);

    let formatted = "+";
    if (digits.length <= 2) {
      formatted += digits;
    } else if (digits.length <= 5) {
      formatted += digits.substring(0, 2) + " " + digits.substring(2);
    } else if (digits.length <= 8) {
      formatted +=
        digits.substring(0, 2) +
        " " +
        digits.substring(2, 5) +
        " " +
        digits.substring(5);
    } else {
      formatted +=
        digits.substring(0, 2) +
        " " +
        digits.substring(2, 5) +
        " " +
        digits.substring(5, 8) +
        " " +
        digits.substring(8);
    }

    setEditData((prev) => ({ ...prev, [field]: formatted }));
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getInitials = () => {
    const f = profileData.firstName?.[0] || "";
    const l = profileData.lastName?.[0] || "";
    return (f + l).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <header className="profile-header-wrapper">
          <h2 className="profile-page-title">Profile</h2>
          <p className="profile-page-subtitle">Loading your profile...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header-wrapper">
        <h2 className="profile-page-title">Profile</h2>
        <p className="profile-page-subtitle">
          Manage your account and preferences
        </p>
      </header>

      {isEditing ? (
        /* --- EDIT MODE VIEW --- */
        <div className="profile-card profile-edit-card">
          <div className="profile-edit-header">
            <div className="profile-edit-title-group">
              <IconSettings className="profile-icon-primary" size={24} />
              <h3 className="profile-section-title">
                Edit Profile Information
              </h3>
            </div>
            <p className="profile-edit-subtitle">
              Update your personal and medical details below.
            </p>
          </div>

          {/* Inline Error Banner */}
          {saveError && (
            <div className="profile-error-banner">
              <IconAlertCircle size={20} />
              <span>{saveError}</span>
            </div>
          )}

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label
                className={`profile-form-label ${formErrors.firstName ? "text-red" : ""}`}
              >
                First Name *
              </label>
              <input
                type="text"
                className={`profile-form-input ${formErrors.firstName ? "profile-error-field" : ""}`}
                value={editData.firstName}
                onChange={(e) =>
                  handleChangeWithLimit("firstName", e.target.value, 20, true)
                }
              />
              {formErrors.firstName && (
                <span className="profile-error-text">
                  {formErrors.firstName}
                </span>
              )}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Middle Name</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.middleName}
                onChange={(e) =>
                  handleChangeWithLimit("middleName", e.target.value, 20, true)
                }
              />
            </div>

            <div className="profile-form-group">
              <label
                className={`profile-form-label ${formErrors.lastName ? "text-red" : ""}`}
              >
                Last Name *
              </label>
              <input
                type="text"
                className={`profile-form-input ${formErrors.lastName ? "profile-error-field" : ""}`}
                value={editData.lastName}
                onChange={(e) =>
                  handleChangeWithLimit("lastName", e.target.value, 20, true)
                }
              />
              {formErrors.lastName && (
                <span className="profile-error-text">
                  {formErrors.lastName}
                </span>
              )}
            </div>

            <div className="profile-form-group">
              <label
                className={`profile-form-label ${formErrors.dob ? "text-red" : ""}`}
              >
                Date of Birth *
              </label>
              <input
                type="date"
                max="9999-12-31"
                className={`profile-form-input ${formErrors.dob ? "profile-error-field" : ""}`}
                value={editData.dob}
                onChange={(e) => {
                  handleChangeWithLimit("dob", e.target.value, 10, false);
                  if (formErrors.dob)
                    setFormErrors((prev) => ({ ...prev, dob: null }));
                }}
              />
              {formErrors.dob && (
                <span className="profile-error-text">{formErrors.dob}</span>
              )}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Email Address</label>
              <input
                type="email"
                className="profile-form-input"
                value={editData.email}
                onChange={(e) =>
                  handleChangeWithLimit("email", e.target.value, 254, false)
                }
                maxLength={254}
                readOnly // Usually emails shouldn't be edited freely here, but keeping inputs active for your needs
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Phone Number</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.phone}
                onChange={(e) => handlePhoneChange("phone", e.target.value)}
                placeholder="+63 XXX XXX XXXX"
              />
            </div>

            {/* --- CASCADING ADDRESS SECTION --- */}
            <div className="profile-form-group profile-form-full-width">
              <label
                className={`profile-form-label ${formErrors.addressLine1 ? "text-red" : ""}`}
              >
                Address Line 1 *
              </label>
              <input
                type="text"
                className={`profile-form-input ${formErrors.addressLine1 ? "profile-error-field" : ""}`}
                value={editData.addressLine1}
                onChange={(e) =>
                  handleChangeWithLimit("addressLine1", e.target.value, 255)
                }
                placeholder="Street, House No., Building"
              />
              {formErrors.addressLine1 && (
                <span className="profile-error-text">
                  {formErrors.addressLine1}
                </span>
              )}
            </div>

            <div className="profile-form-group profile-form-full-width">
              <label className="profile-form-label">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.addressLine2}
                onChange={(e) =>
                  handleChangeWithLimit("addressLine2", e.target.value, 255)
                }
                placeholder="Apartment, Suite, Unit, etc."
              />
            </div>

            <div className="profile-form-group">
              <label
                className={`profile-form-label ${formErrors.region ? "text-red" : ""}`}
              >
                Region *
              </label>
              <select
                className={`profile-form-input ${formErrors.region ? "profile-error-field" : ""}`}
                value={editData.region}
                onChange={(e) => {
                  handleRegionChange(e);
                  if (formErrors.region)
                    setFormErrors((prev) => ({ ...prev, region: null }));
                }}
              >
                <option value="">Select Region</option>
                {regions
                  .filter(
                    (r) =>
                      !r.name.includes("NCR") &&
                      !r.name.includes("National Capital Region"),
                  )
                  .map((r) => (
                    <option key={r.code} value={r.name}>
                      {r.name}
                    </option>
                  ))}
              </select>
              {formErrors.region && (
                <span className="profile-error-text">{formErrors.region}</span>
              )}
            </div>

            <div className="profile-form-group">
              <label
                className={`profile-form-label ${formErrors.province ? "text-red" : ""}`}
              >
                Province *
              </label>
              <select
                className={`profile-form-input ${formErrors.province ? "profile-error-field" : ""}`}
                value={editData.province}
                onChange={(e) => {
                  handleProvinceChange(e);
                  if (formErrors.province)
                    setFormErrors((prev) => ({ ...prev, province: null }));
                }}
                disabled={!editData.region}
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              {formErrors.province && (
                <span className="profile-error-text">
                  {formErrors.province}
                </span>
              )}
            </div>

            <div className="profile-form-group">
              <label
                className={`profile-form-label ${formErrors.city ? "text-red" : ""}`}
              >
                City/Municipality *
              </label>
              <select
                className={`profile-form-input ${formErrors.city ? "profile-error-field" : ""}`}
                value={editData.city}
                onChange={(e) => {
                  handleCityChange(e);
                  if (formErrors.city)
                    setFormErrors((prev) => ({ ...prev, city: null }));
                }}
                disabled={!editData.province}
              >
                <option value="">Select City/Municipality</option>
                {cities.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {formErrors.city && (
                <span className="profile-error-text">{formErrors.city}</span>
              )}
            </div>

            <div className="profile-form-group">
              <label
                className={`profile-form-label ${formErrors.barangay ? "text-red" : ""}`}
              >
                Barangay *
              </label>
              <select
                className={`profile-form-input ${formErrors.barangay ? "profile-error-field" : ""}`}
                value={editData.barangay}
                onChange={(e) => {
                  handleBarangayChange(e);
                  if (formErrors.barangay)
                    setFormErrors((prev) => ({ ...prev, barangay: null }));
                }}
                disabled={!editData.city}
              >
                <option value="">Select Barangay</option>
                {barangays.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              {formErrors.barangay && (
                <span className="profile-error-text">
                  {formErrors.barangay}
                </span>
              )}
            </div>
            {/* ---------------------------------- */}

            <div className="profile-form-group">
              <label className="profile-form-label">Blood Type</label>
              <select
                className="profile-form-input"
                value={editData.bloodType}
                onChange={(e) =>
                  handleChangeWithLimit("bloodType", e.target.value, 10, false)
                }
              >
                {BLOOD_TYPE_OPTIONS.map((bloodType) => (
                  <option key={bloodType} value={bloodType}>
                    {bloodType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="profile-edit-header" style={{ marginTop: "16px" }}>
            <div className="profile-edit-title-group">
              <IconAddressBook className="profile-icon-primary" size={24} />
              <h3 className="profile-section-title">Emergency Contact</h3>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label className="profile-form-label">Contact Name</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.emergencyContactName}
                onChange={(e) =>
                  handleChangeWithLimit(
                    "emergencyContactName",
                    e.target.value,
                    50,
                    true,
                  )
                }
                placeholder="Max 50 chars"
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Contact Phone</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.emergencyContactPhone}
                onChange={(e) =>
                  handlePhoneChange("emergencyContactPhone", e.target.value)
                }
                placeholder="+63 XXX XXX XXXX"
              />
            </div>
            <div className="profile-form-group profile-form-full-width">
              <label className="profile-form-label">Contact Address</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.emergencyContactAddress}
                onChange={(e) =>
                  handleChangeWithLimit(
                    "emergencyContactAddress",
                    e.target.value,
                    254,
                    true,
                  )
                }
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button
              className="profile-btn-cancel"
              onClick={handleCancelClick}
              disabled={isSaving}
            >
              <IconX size={18} /> Cancel
            </button>
            <button
              className="profile-btn-save"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <IconLoader2 size={18} className="profile-spin" />
              ) : (
                <IconCheck size={18} />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        /* --- READ ONLY VIEW --- */
        <>
          <div className="profile-card profile-hero-card">
            <div className="profile-hero-content">
              {/* Clickable Avatar for Upload */}
              <div
                className={`profile-avatar ${!isEditing ? "profile-avatar-editable" : ""}`}
                onClick={() =>
                  !isEditing &&
                  fileInputRef.current &&
                  fileInputRef.current.click()
                }
              >
                {isUploadingPic ? (
                  <IconLoader2 className="profile-spin" color="white" />
                ) : profileData.profilePictureUrl ? (
                  <img
                    src={profileData.profilePictureUrl}
                    alt="Profile"
                    className="profile-avatar-img"
                  />
                ) : (
                  getInitials()
                )}

                {/* The Hover Overlay */}
                {!isEditing && !isUploadingPic && (
                  <div className="profile-avatar-overlay">
                    <IconCamera size={28} color="white" />
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/png, image/jpeg"
                onChange={handleProfilePicChange}
              />

              <div className="profile-hero-text">
                <h3 className="profile-hero-name">
                  {profileData.firstName}{" "}
                  {profileData.middleName && `${profileData.middleName} `}
                  {profileData.lastName}
                </h3>
                <p className="profile-hero-since">
                  Patient Member since{" "}
                  {new Date(profileData.createdAt).toLocaleDateString(
                    undefined,
                    { month: "long", year: "numeric" },
                  )}
                </p>
                <span
                  className="profile-hero-badge"
                  style={{ textTransform: "capitalize" }}
                >
                  {profileData.role}
                </span>
              </div>
            </div>
          </div>

          {/* --- HEALTH JOURNEY SECTION --- */}
          {profileData.stats.appointments === 0 &&
          profileData.stats.prescriptions === 0 &&
          profileData.stats.ptSessions === 0 ? (
            /* Empty State: Full Gray Box */
            <div
              className="profile-card"
              style={{
                backgroundColor: "#f8fafc",
                border: "2px dashed #cbd5e1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 24px",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#e2e8f0",
                  padding: "16px",
                  borderRadius: "50%",
                  display: "flex",
                  color: "#64748b",
                }}
              >
                <IconActivity size={32} />
              </div>
              <div style={{ textAlign: "center" }}>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    color: "#334155",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  Your Health Journey
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "14px",
                    maxWidth: "400px",
                  }}
                >
                  Start your Health Journey by booking Appointments, requesting
                  Prescriptions, or attending PT Sessions.
                </p>
              </div>
            </div>
          ) : (
            /* Populated State: Blue Card */
            <div className="profile-card profile-journey-card">
              <h4 className="profile-section-title">Your Health Journey</h4>
              <div className="profile-journey-grid">
                <div className="profile-journey-stat profile-border-right">
                  <h2 className="profile-stat-number">
                    {profileData.stats.appointments}
                  </h2>
                  <p className="profile-stat-label">Appointments</p>
                </div>
                <div className="profile-journey-stat profile-border-right">
                  <h2 className="profile-stat-number">
                    {profileData.stats.prescriptions}
                  </h2>
                  <p className="profile-stat-label">Prescriptions</p>
                </div>
                <div className="profile-journey-stat">
                  <h2 className="profile-stat-number">
                    {profileData.stats.ptSessions}
                  </h2>
                  <p className="profile-stat-label">PT Sessions</p>
                </div>
              </div>
            </div>
          )}

          <div className="profile-section-header-flex">
            <h4 className="profile-section-title-no-margin">
              Personal Information
            </h4>
            <button className="profile-btn-edit" onClick={handleEditClick}>
              <IconSettings size={16} /> Edit Profile
            </button>
          </div>

          <div className="profile-card profile-info-card">
            <div className="profile-info-list">
              <div className="profile-info-row">
                <IconMail size={20} className="profile-icon-muted" />
                <div className="profile-info-text">
                  <span className="profile-info-label">Email:</span>
                  <span className="profile-info-value">
                    {profileData.email}
                  </span>
                </div>
              </div>
              <div className="profile-info-row">
                <IconPhone size={20} className="profile-icon-muted" />
                <div className="profile-info-text">
                  <span className="profile-info-label">Phone:</span>
                  <span className="profile-info-value">
                    {profileData.phone}
                  </span>
                </div>
              </div>
              <div className="profile-info-row">
                <IconMapPin size={20} className="profile-icon-muted" />
                <div className="profile-info-text">
                  <span className="profile-info-label">Address:</span>
                  <span className="profile-info-value">
                    {[
                      profileData.addressLine1,
                      profileData.addressLine2,
                      profileData.barangay,
                      profileData.city,
                      profileData.province,
                      profileData.region,
                      profileData.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
              <div className="profile-info-row">
                <IconCalendarEvent size={20} className="profile-icon-muted" />
                <div className="profile-info-text">
                  <span className="profile-info-label">Date of Birth:</span>
                  <span className="profile-info-value">
                    {formatDateForDisplay(profileData.dob)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h4 className="profile-section-title mb-12">Medical Information</h4>
          <div className="profile-medical-grid">
            <div className="profile-card profile-medical-card">
              <div className="profile-medical-card-header">
                <IconDroplet size={18} className="profile-icon-muted" />
                <span className="profile-medical-card-title">Blood Type</span>
              </div>
              <p className="profile-medical-card-value-large">
                {profileData.bloodType}
              </p>
            </div>

            <div className="profile-card profile-medical-card">
              <div className="profile-medical-card-header">
                <IconShield size={18} className="profile-icon-muted" />
                <span className="profile-medical-card-title">Allergies</span>
              </div>
              <div className="profile-allergy-list">
                {profileData.allergies.length > 0 ? (
                  profileData.allergies.map((allergy) => (
                    <span key={allergy} className="profile-allergy-badge">
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="profile-medical-card-value">
                    None Recorded
                  </span>
                )}
              </div>
            </div>

            {/* EXPANDED EMERGENCY CONTACT CARD */}
            <div className="profile-card profile-medical-card profile-emergency-card">
              <div className="profile-medical-card-header">
                <IconAddressBook size={18} className="profile-icon-muted" />
                <span className="profile-medical-card-title">
                  Emergency Contact
                </span>
              </div>
              {profileData.emergencyContactName ||
              profileData.emergencyContactPhone ||
              profileData.emergencyContactAddress ? (
                <>
                  {profileData.emergencyContactName && (
                    <h4 className="profile-emergency-name">
                      {profileData.emergencyContactName}
                    </h4>
                  )}
                  {profileData.emergencyContactPhone && (
                    <p className="profile-emergency-detail">
                      <IconPhone size={14} />{" "}
                      {profileData.emergencyContactPhone}
                    </p>
                  )}
                  {profileData.emergencyContactAddress && (
                    <p className="profile-emergency-detail">
                      <IconMapPin size={14} />{" "}
                      {profileData.emergencyContactAddress}
                    </p>
                  )}
                </>
              ) : (
                <span className="profile-medical-card-value">
                  No emergency contact yet
                </span>
              )}
            </div>
          </div>

          <div className="profile-card profile-settings-card">
            {settingsLinks.map((link) => (
              <button
                key={link.label}
                className="profile-settings-item"
                onClick={() => openDiyModal(`Maps to ${link.label}`)}
              >
                <div className="profile-settings-item-left">
                  <link.icon size={20} className="profile-icon-muted" />
                  <span className="profile-settings-item-label">
                    {link.label}
                  </span>
                </div>
                <IconChevronRight size={16} className="profile-icon-light" />
              </button>
            ))}
          </div>

          <button
            className="profile-btn-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <IconLoader2 size={18} className="profile-spin" /> Logging
                out...
              </>
            ) : (
              <>
                <IconLogout size={18} /> Log Out
              </>
            )}
          </button>

          <div className="profile-footer-links">
            <button
              className="profile-footer-link"
              onClick={() => openDiyModal("Go to Help Center")}
            >
              Help Center
            </button>
            <span className="profile-footer-dot">•</span>
            <button
              className="profile-footer-link"
              onClick={() => openDiyModal("Go to ToS")}
            >
              Terms of Service
            </button>
            <span className="profile-footer-dot">•</span>
            <button
              className="profile-footer-link"
              onClick={() => openDiyModal("Go to Privacy Policy")}
            >
              Privacy Policy
            </button>
          </div>
        </>
      )}

      {/* --- CUSTOM MODALS --- */}

      {/* Cancel Edit Modal */}
      {showCancelModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-container">
            <div
              className="profile-modal-icon-wrapper"
              style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
            >
              <IconAlertCircle size={32} />
            </div>
            <h3 className="profile-modal-title">Discard Changes?</h3>
            <p className="profile-modal-desc">
              You have unsaved edits. Are you sure you want to cancel? All your
              changes will be lost.
            </p>
            <div className="profile-modal-actions">
              <button
                className="profile-btn-save"
                style={{
                  backgroundColor: "#ef4444",
                  width: "100%",
                  justifyContent: "center",
                }}
                onClick={handleConfirmCancel}
              >
                Yes, Discard Changes
              </button>
              <button
                className="profile-btn-cancel"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  border: "none",
                }}
                onClick={handleKeepEditing}
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Save Modal */}
      {showSuccessModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-container">
            <div
              className="profile-modal-icon-wrapper"
              style={{ backgroundColor: "#dcfce7", color: "#22c55e" }}
            >
              <IconCheck size={32} />
            </div>
            <h3 className="profile-modal-title">Profile Updated!</h3>
            <p className="profile-modal-desc">
              Your profile details have been successfully saved and updated.
            </p>
            <div className="profile-modal-actions">
              <button
                className="profile-btn-save"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  setShowSuccessModal(false);
                  setIsEditing(false); // Close edit view only after clicking OK
                }}
              >
                Awesome
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
