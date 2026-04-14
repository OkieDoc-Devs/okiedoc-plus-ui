import React, { useState } from "react";
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
} from "@tabler/icons-react";
import "../css/Patient_Profile.css";

const settingsLinks = [
  { label: "Medical History", icon: IconHistory },
  { label: "Insurance Details", icon: IconShield },
  { label: "Payment Methods", icon: IconCreditCard },
  { label: "Notifications", icon: IconBell },
  { label: "Privacy & Security", icon: IconLock },
  { label: "Language & Region", icon: IconWorld },
];

export default function Patient_Profile() {
  // 1. Core State with updated array for allergies and expanded emergency contact
  const [profileData, setProfileData] = useState({
    firstName: "Allen",
    lastName: "Valentin",
    email: "valentin@gmail.com",
    phone: "0912-345-6789",
    address: "Philippines",
    dob: "2000-01-15",
    bloodType: "B",
    allergies: ["Asthma", "Seafood"],
    emergencyContactName: "Ro Valentin",
    emergencyContactPhone: "+63 917 123 4567",
    emergencyContactAddress: "123 Ayala Avenue, Makati City",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profileData });
  const [allergyInput, setAllergyInput] = useState(""); // Temporary state for typing tags

  const handleBackendAction = (action) => {
    alert(`Backend Hook: Trigger ${action}`);
  };

  const handleEditClick = () => {
    setEditData({ ...profileData });
    setAllergyInput("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveChanges = () => {
    // If they typed an allergy but forgot to press Enter, add it automatically
    let finalData = { ...editData };
    if (allergyInput.trim() !== "") {
      finalData.allergies = [...finalData.allergies, allergyInput.trim()];
    }
    setProfileData(finalData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // --- ALLERGY TAG LOGIC ---
  const handleAllergyKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newAllergy = allergyInput.trim();
      if (newAllergy && !editData.allergies.includes(newAllergy)) {
        setEditData((prev) => ({
          ...prev,
          allergies: [...prev.allergies, newAllergy],
        }));
      }
      setAllergyInput("");
    } else if (
      e.key === "Backspace" &&
      allergyInput === "" &&
      editData.allergies.length > 0
    ) {
      // Remove last tag if backspacing on an empty input
      setEditData((prev) => {
        const newAllergies = [...prev.allergies];
        newAllergies.pop();
        return { ...prev, allergies: newAllergies };
      });
    }
  };

  const removeAllergy = (allergyToRemove) => {
    setEditData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergyToRemove),
    }));
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label className="profile-form-label">First Name</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Last Name</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Email Address</label>
              <input
                type="email"
                className="profile-form-input"
                value={editData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Phone Number</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="profile-form-group profile-form-full-width">
              <label className="profile-form-label">Address</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Date of Birth</label>
              <input
                type="date"
                className="profile-form-input"
                value={editData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Blood Type</label>
              <select
                className="profile-form-input"
                value={editData.bloodType}
                onChange={(e) => handleChange("bloodType", e.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            {/* CUSTOM ALLERGY TAG INPUT */}
            <div className="profile-form-group profile-form-full-width">
              <label className="profile-form-label">
                Known Allergies (Press Enter to add)
              </label>
              <div className="profile-tag-input-wrapper">
                {editData.allergies.map((allergy) => (
                  <span key={allergy} className="profile-tag">
                    {allergy}
                    <IconX
                      size={14}
                      className="profile-tag-remove"
                      onClick={() => removeAllergy(allergy)}
                    />
                  </span>
                ))}
                <input
                  type="text"
                  className="profile-tag-input-field"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={handleAllergyKeyDown}
                  placeholder={
                    editData.allergies.length === 0
                      ? "Type an allergy and press Enter..."
                      : ""
                  }
                />
              </div>
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
                  handleChange("emergencyContactName", e.target.value)
                }
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Contact Phone</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.emergencyContactPhone}
                onChange={(e) =>
                  handleChange("emergencyContactPhone", e.target.value)
                }
              />
            </div>
            <div className="profile-form-group profile-form-full-width">
              <label className="profile-form-label">Contact Address</label>
              <input
                type="text"
                className="profile-form-input"
                value={editData.emergencyContactAddress}
                onChange={(e) =>
                  handleChange("emergencyContactAddress", e.target.value)
                }
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button className="profile-btn-cancel" onClick={handleCancelEdit}>
              <IconX size={18} /> Cancel
            </button>
            <button className="profile-btn-save" onClick={handleSaveChanges}>
              <IconCheck size={18} /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* --- READ ONLY VIEW --- */
        <>
          <div className="profile-card profile-hero-card">
            <div className="profile-hero-content">
              <div className="profile-avatar">
                {profileData.firstName[0]}
                {profileData.lastName[0]}
              </div>
              <div className="profile-hero-text">
                <h3 className="profile-hero-name">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="profile-hero-since">Member since January 2024</p>
                <span className="profile-hero-badge">Premium Plus</span>
              </div>
            </div>
          </div>

          <div className="profile-card profile-journey-card">
            <h4 className="profile-section-title">Your Health Journey</h4>
            <div className="profile-journey-grid">
              <div className="profile-journey-stat profile-border-right">
                <h2 className="profile-stat-number">12</h2>
                <p className="profile-stat-label">Appointments</p>
              </div>
              <div className="profile-journey-stat profile-border-right">
                <h2 className="profile-stat-number">5</h2>
                <p className="profile-stat-label">Prescriptions</p>
              </div>
              <div className="profile-journey-stat">
                <h2 className="profile-stat-number">3</h2>
                <p className="profile-stat-label">PT Sessions</p>
              </div>
            </div>
          </div>

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
                    {profileData.address}
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
              <h4 className="profile-emergency-name">
                {profileData.emergencyContactName}
              </h4>
              <p className="profile-emergency-detail">
                <IconPhone size={14} /> {profileData.emergencyContactPhone}
              </p>
              <p className="profile-emergency-detail">
                <IconMapPin size={14} /> {profileData.emergencyContactAddress}
              </p>
            </div>
          </div>

          {/* 5. SETTINGS LIST */}
          <div className="profile-card profile-settings-card">
            {settingsLinks.map((link) => (
              <button
                key={link.label}
                className="profile-settings-item"
                onClick={() => handleBackendAction(`Maps to ${link.label}`)}
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
            onClick={() => handleBackendAction("Auth SignOut & Clear Cookies")}
          >
            <IconLogout size={18} /> Log Out
          </button>

          <div className="profile-footer-links">
            <button
              className="profile-footer-link"
              onClick={() => handleBackendAction("Go to Help Center")}
            >
              Help Center
            </button>
            <span className="profile-footer-dot">•</span>
            <button
              className="profile-footer-link"
              onClick={() => handleBackendAction("Go to ToS")}
            >
              Terms of Service
            </button>
            <span className="profile-footer-dot">•</span>
            <button
              className="profile-footer-link"
              onClick={() => handleBackendAction("Go to Privacy Policy")}
            >
              Privacy Policy
            </button>
          </div>
        </>
      )}
    </div>
  );
}
