import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "../App.css";
import "./NurseStyles.css";

export default function MyAccount() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Mock user data - in real app this would come from context/API
  const [userData, setUserData] = useState({
    firstName: "Nurse",
    lastName: "Smith",
    email: "nurse.smith@okiedoc.com",
    phone: "+1 (555) 123-4567",
    specialization: "General Nursing",
    licenseNumber: "RN-12345",
    experience: "5 years",
    department: "Emergency Department",
  });

  const [formData, setFormData] = useState({ ...userData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setUserData(formData);
    try {
      localStorage.setItem("nurse.firstName", formData.firstName || "Nurse");
    } catch {}
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error messages when user types
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = () => {
    // Basic validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    // Simulating success
    setPasswordSuccess("Password changed successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordForm(false);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setPasswordSuccess("");
    }, 3000);
  };

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setPasswordSuccess("");
    setShowPasswordForm(false);
  };

  // Profile picture state
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("/account.svg");

  useEffect(() => {
    const saved = localStorage.getItem("nurse.profileImageDataUrl");
    if (saved) {
      setPreviewImage(saved);
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = () => {
    if (previewImage) {
      try {
        localStorage.setItem("nurse.profileImageDataUrl", previewImage);
        alert("Profile picture updated.");
        setProfileImage(null);
      } catch (e) {
        alert("Unable to save profile picture.");
      }
    }
  };

  const renderProfileTab = () => (
    <div className="profile-section">
      <div className="profile-header">
        <h3>Profile Information</h3>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-row">
          <label>First Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <span>{userData.firstName}</span>
          )}
        </div>

        <div className="profile-row">
          <label>Last Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <span>{userData.lastName}</span>
          )}
        </div>

        <div className="profile-row">
          <label>Email:</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <span>{userData.email}</span>
          )}
        </div>

        <div className="profile-row">
          <label>Phone:</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <span>{userData.phone}</span>
          )}
        </div>

        <div className="profile-row">
          <label>Specialization:</label>
          {isEditing ? (
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <span>{userData.specialization}</span>
          )}
        </div>

        <div className="profile-row">
          <label>License Number:</label>
          <span>{userData.licenseNumber}</span>
        </div>

        <div className="profile-row">
          <label>Experience:</label>
          <span>{userData.experience}</span>
        </div>

        <div className="profile-row">
          <label>Department:</label>
          <span>{userData.department}</span>
        </div>
      </div>

      {isEditing && (
        <div className="profile-actions">
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const renderPictureTab = () => (
    <div className="image-section">
      <h3>Profile Picture</h3>
      <div
        className="image-upload-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="current-image" style={{ textAlign: "center" }}>
          <img src={previewImage} alt="Profile" />
        </div>

        <div
          className="upload-controls"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <input
            type="file"
            id="nurseProfileImage"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
            style={{ alignSelf: "center" }}
          />
          <button
            onClick={handleImageSave}
            className="save-btn image-save-btn"
            disabled={!previewImage}
          >
            Update Image
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="security-section">
      <h3>Security Settings</h3>
      <div className="security-content">
        <div className="security-item">
          <h4>Change Password</h4>
          <p>Update your password to keep your account secure</p>

          {!showPasswordForm ? (
            <button
              className="security-btn"
              onClick={() => setShowPasswordForm(true)}
            >
              Change Password
            </button>
          ) : (
            <div className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password:</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="password-input"
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="password-input"
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="password-input"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}

              {passwordSuccess && (
                <div className="success-message">{passwordSuccess}</div>
              )}

              <div className="password-actions">
                <button className="save-btn" onClick={handlePasswordSubmit}>
                  Change Password
                </button>
                <button className="cancel-btn" onClick={handleCancelPassword}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="myaccount-container">
      <div className="myaccount-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h2>My Account</h2>
        <p>Manage your profile and security settings</p>
      </div>

      <div className="myaccount-tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`tab-btn ${activeTab === "picture" ? "active" : ""}`}
          onClick={() => setActiveTab("picture")}
        >
          Profile Picture
        </button>
        <button
          className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
      </div>

      <div className="myaccount-content">
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "picture" && renderPictureTab()}
      </div>
    </div>
  );
}
