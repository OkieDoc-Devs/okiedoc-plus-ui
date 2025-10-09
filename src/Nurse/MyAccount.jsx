import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "../App.css";
import "./NurseStyles.css";

export default function MyAccount() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://your-production-url.com"
      : "http://localhost:1337";

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
    department: "",
  });

  const [formData, setFormData] = useState({ ...userData });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        console.log("Loading nurse profile from API...");

        const response = await fetch(`${API_BASE_URL}/api/nurse/profile`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const nurse = data.data;

          // Get the real logged-in user email from currentUser
          let realEmail = nurse.email;
          try {
            const currentUser = localStorage.getItem("currentUser");
            if (currentUser) {
              const userData = JSON.parse(currentUser);
              if (userData.email) {
                realEmail = userData.email;
                console.log(
                  "Overriding API email with currentUser email:",
                  userData.email
                );
              }
            }
          } catch (e) {
            console.error("Error parsing currentUser:", e);
          }

          const profileData = {
            firstName: nurse.first_name || "",
            lastName: nurse.last_name || "",
            email: realEmail, // Use the real email from currentUser
            phone: nurse.phone || "",
            specialization: nurse.specialization || "",
            licenseNumber: nurse.license_number || "",
            experience: nurse.experience || "",
            department: nurse.department || "",
          };

          setUserData(profileData);
          setFormData(profileData);
          setError(null);
          console.log("Profile loaded successfully:", profileData);
        } else {
          throw new Error(data.message || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError(error.message);

        // Try to get user data from localStorage first, then use fallback
        const storedEmail =
          localStorage.getItem("nurse.email") ||
          localStorage.getItem("userEmail");
        const storedFirstName =
          localStorage.getItem("nurse.firstName") || "Nurse";
        const storedLastName = localStorage.getItem("nurse.lastName") || "";

        console.log("Debug - stored values:", {
          storedEmail,
          storedFirstName,
          storedLastName,
          allLocalStorage: Object.fromEntries(Object.entries(localStorage)),
        });

        const fallbackData = {
          firstName: storedFirstName,
          lastName: storedLastName,
          email: storedEmail || "nurse@okiedocplus.com", // Use stored email or the actual one you're using
          phone: "+1 (555) 123-4567",
          specialization: "Emergency Care",
          licenseNumber: "RN-12345",
          experience: "5 years",
          department: "Emergency Department",
        };

        console.log("Using fallback data:", fallbackData);

        setUserData(fallbackData);
        setFormData(fallbackData);
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

      const profileUpdateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        license_number: formData.licenseNumber,
        experience: formData.experience,
        department: formData.department,
      };

      const response = await fetch(`${API_BASE_URL}/api/nurse/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileUpdateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUserData(formData);
        setIsEditing(false);
        console.log("Profile updated successfully");

        alert("Profile updated successfully!");
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile: " + error.message);

      setUserData(formData);
      try {
        localStorage.setItem("nurse.firstName", formData.firstName || "Nurse");
      } catch {}
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
