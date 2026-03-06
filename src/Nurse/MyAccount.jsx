import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ImageCropperModal from "../components/ImageCropperModal";
import "../App.css";
import "./NurseStyles.css";
import {
  getNurseProfileImage,
  saveNurseProfileImage,
} from "./services/storageService.js";
import {
  fetchNurseProfile,
  updateNurseProfile,
  uploadNurseAvatar,
  deleteNurseAvatar,
} from "./services/apiService.js";
import {
  transformProfileFromAPI,
  transformProfileToAPI,
  validatePasswordChange,
} from "./services/profileService.js";

export default function MyAccount() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
    department: "",
    prcExpiryDate: "",
  });

  const [formData, setFormData] = useState({ ...userData });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        console.log("Loading nurse profile from API...");

        const nurse = await fetchNurseProfile();
        const profileData = transformProfileFromAPI(nurse);

        setUserData(profileData);
        setFormData(profileData);
        setError(null);

        if (profileData.firstName) {
          localStorage.setItem("nurse.firstName", profileData.firstName);
        }
        if (profileData.lastName) {
          localStorage.setItem("nurse.lastName", profileData.lastName);
        }

        console.log("Profile loaded successfully:", profileData);
        console.log("Updated localStorage with nurse name");
      } catch (error) {
        console.error("Error loading profile from API:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      console.log("Saving profile data to API...");

      const profileUpdateData = transformProfileToAPI(formData);
      await updateNurseProfile(profileUpdateData);

      setUserData(formData);
      setIsEditing(false);
      console.log("Profile updated successfully");

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile: " + error.message);

      setUserData(formData);
      try {
        localStorage.setItem("nurse.firstName", formData.firstName || "Nurse");
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }
      setIsEditing(false);
    }
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
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = () => {
    const validation = validatePasswordChange(passwordData);

    if (!validation.valid) {
      setPasswordError(validation.error);
      return;
    }

    setPasswordSuccess("Password changed successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordForm(false);

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

  const [previewImage, setPreviewImage] = useState("/account.svg");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const CROP_SIZE = 500;

  useEffect(() => {
    const saved = getNurseProfileImage();
    if (saved !== "/account.svg") {
      setPreviewImage(saved);
    }
  }, []);



  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setUploadError("");

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(
          "File size exceeds 2MB limit. Please choose a smaller image."
        );
        e.target.value = "";
        return;
      }

      if (!file.type.startsWith("image/")) {
        setUploadError("Please select a valid image file.");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageSrc(reader.result);
        setCropperModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleCropComplete = (croppedFile) => {
    setSelectedFile(croppedFile);
    const objectUrl = URL.createObjectURL(croppedFile);
    setPreviewImage(objectUrl);
    setCropperModalOpen(false);
    setSelectedImageSrc(null);
  };

  const handleCropCancel = () => {
    setCropperModalOpen(false);
    setSelectedImageSrc(null);
  };



  const handleImageSave = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    setUploadLoading(true);
    setUploadError("");

    try {
      const response = await uploadNurseAvatar(selectedFile);

      if (response && response.avatarUrl) {
        saveNurseProfileImage(response.avatarUrl);
        setPreviewImage(response.avatarUrl);
      } else {
        saveNurseProfileImage(previewImage);
      }

      setSelectedFile(null);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploadError(
        error.message || "Failed to upload avatar. Please try again."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleImageDelete = async () => {
    if (previewImage === "/account.svg") {
      alert("No profile picture to delete.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete your profile picture?")
    ) {
      return;
    }

    setUploadLoading(true);
    setUploadError("");

    try {
      await deleteNurseAvatar();
      saveNurseProfileImage("/account.svg");
      setPreviewImage("/account.svg");
      setSelectedFile(null);
      alert("Profile picture deleted successfully!");
    } catch (error) {
      console.error("Error deleting avatar:", error);
      setUploadError(
        error.message || "Failed to delete avatar. Please try again."
      );
    } finally {
      setUploadLoading(false);
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
          <span>{userData.email}</span>
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
          {isEditing ? (
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <span>{userData.licenseNumber}</span>
          )}
        </div>

        <div className="profile-row">
          <label>PRC Expiry Date:</label>
          {isEditing ? (
            <input
              type="date"
              name="prcExpiryDate"
              value={formData.prcExpiryDate ? formData.prcExpiryDate.split('T')[0] : ''}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <span>
              {userData.prcExpiryDate
                ? new Date(userData.prcExpiryDate).toLocaleDateString()
                : "Not set"}
            </span>
          )}
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
      <p style={{ color: "#666", marginBottom: "16px", fontSize: "14px" }}>
        Upload an image (max 2MB). Supported formats: JPG, PNG, GIF. Image will
        be cropped to 500x500.
      </p>
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

        {uploadError && (
          <div
            className="error-message"
            style={{
              color: "#dc3545",
              marginBottom: "12px",
              textAlign: "center",
              padding: "8px",
              backgroundColor: "#f8d7da",
              borderRadius: "4px",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            {uploadError}
          </div>
        )}

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
            disabled={uploadLoading}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleImageSave}
              className="save-btn image-save-btn"
              disabled={!selectedFile || uploadLoading}
            >
              {uploadLoading ? "Uploading..." : "Upload Image"}
            </button>
            {previewImage !== "/account.svg" && (
              <button
                onClick={handleImageDelete}
                className="cancel-btn"
                disabled={uploadLoading}
                style={{ backgroundColor: "#dc3545", color: "white" }}
              >
                {uploadLoading ? "Deleting..." : "Delete Image"}
              </button>
            )}
          </div>
        </div>
      </div>

      <ImageCropperModal
        isOpen={cropperModalOpen}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
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
        <button
          className="back-btn"
          onClick={() => navigate("/nurse-dashboard")}
        >
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
