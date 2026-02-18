import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaCamera, FaLock, FaSave, FaTimes } from 'react-icons/fa';
import { fetchPatientProfile } from '../services/apiService';

const MyAccount = ({ 
  profileImage: propsProfileImage, 
  setProfileImage: propsSetProfileImage, 
  profileData: propsProfileData, 
  setProfileData: propsSetProfileData, 
  passwordData: propsPasswordData, 
  setPasswordData: propsSetPasswordData, 
  isEditing: propsIsEditing, 
  setIsEditing: propsSetIsEditing, 
  activeTab: propsActiveTab, 
  setActiveTab: propsSetActiveTab 
}) => {
  // Use props if provided (for backward compatibility), otherwise use local state
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const [localProfileData, setLocalProfileData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [localPasswordData, setLocalPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState("profile");

  // Use props values if available, otherwise use local state
  const profileImage = propsProfileImage !== undefined ? propsProfileImage : localProfileImage;
  const setProfileImage = propsSetProfileImage || setLocalProfileImage;
  const profileData = propsProfileData !== undefined ? propsProfileData : localProfileData;
  const setProfileData = propsSetProfileData || setLocalProfileData;
  const passwordData = propsPasswordData !== undefined ? propsPasswordData : localPasswordData;
  const setPasswordData = propsSetPasswordData || setLocalPasswordData;
  const isEditing = propsIsEditing !== undefined ? propsIsEditing : localIsEditing;
  const setIsEditing = propsSetIsEditing || setLocalIsEditing;
  const activeTab = propsActiveTab !== undefined ? propsActiveTab : localActiveTab;
  const setActiveTab = propsSetActiveTab || setLocalActiveTab;

  const fileInputRef = useRef(null);

  // Load profile data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
          const user = JSON.parse(currentUser);
          setProfileData(prev => ({
            ...prev,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            fullName: user.fullName || "",
          }));
        }

        const profile = await fetchPatientProfile();
        if (profile) {
          setProfileData(prev => ({
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
            email: profile.email || prev.email,
            phone: profile.phone || prev.phone,
            dateOfBirth: profile.dateOfBirth || prev.dateOfBirth,
            address: profile.address || prev.address,
            emergencyContact: profile.emergencyContact || prev.emergencyContact,
            emergencyPhone: profile.emergencyPhone || prev.emergencyPhone,
          }));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if password meets requirements
  const isPasswordValid = (password) => {
    return password.length >= 6 && 
           /[a-zA-Z]/.test(password) && 
           /[0-9]/.test(password) &&
           password !== passwordData.currentPassword;
  };

  // Check if user is typing in password fields
  const isTypingPassword = passwordData.newPassword.length > 0 || passwordData.confirmPassword.length > 0;
  
  // Check if password requirements are not met
  const shouldShowRequirements = isTypingPassword && !isPasswordValid(passwordData.newPassword);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Save profile data logic here
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // You can add API call here to save to backend
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    // Save password logic here
    console.log('Changing password');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    // You can add API call here to change password
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  return (
    <div className="patient-page-content">
      <h2>My Account</h2>
      
      <div className="patient-account-container">
        {/* Profile Image Section */}
        <div className="patient-profile-image-section">
          <div className="patient-profile-image-container">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="patient-profile-image" />
            ) : (
              <div className="patient-profile-image-placeholder">
                <FaUser className="patient-profile-icon" />
              </div>
            )}
            <button 
              className="patient-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Photo"
            >
              <FaCamera className="patient-upload-icon" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div className="patient-profile-name">
            <h3 className="patient-profile-full-name">
              {profileData.firstName} {profileData.lastName}
            </h3>
            <p className="patient-profile-email">{profileData.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="patient-account-tabs">
          <button 
            className={`patient-tab-btn ${activeTab === 'profile' ? 'patient-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="patient-tab-icon" />
            Profile Information
          </button>
          <button 
            className={`patient-tab-btn ${activeTab === 'password' ? 'patient-active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FaLock className="patient-tab-icon" />
            Change Password
          </button>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="patient-profile-section">
            <div className="patient-section-header">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button className="patient-edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <div className="patient-action-buttons">
                  <button className="patient-save-btn" onClick={handleSaveProfile}>
                    <FaSave className="patient-btn-icon" />
                    Save Changes
                  </button>
                  <button className="patient-cancel-btn" onClick={handleCancel}>
                    <FaTimes className="patient-btn-icon" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="patient-profile-form">
              <div className="patient-form-row">
                <div className="patient-form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'patient-editable' : 'patient-readonly'}
                  />
                </div>
                <div className="patient-form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'patient-editable' : 'patient-readonly'}
                  />
                </div>
              </div>

              <div className="patient-form-row">
                <div className="patient-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'patient-editable' : 'patient-readonly'}
                  />
                </div>
                <div className="patient-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'patient-editable' : 'patient-readonly'}
                  />
                </div>
              </div>

              <div className="patient-form-row">
                <div className="patient-form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'patient-editable' : 'patient-readonly'}
                  />
                </div>
                <div className="patient-form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'patient-editable' : 'patient-readonly'}
                  />
                </div>
              </div>

              <div className="patient-form-section">
                <h4>Emergency Contact</h4>
                <div className="patient-form-row">
                  <div className="patient-form-group">
                    <label htmlFor="emergencyContact">Contact Name</label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={isEditing ? 'patient-editable' : 'patient-readonly'}
                    />
                  </div>
                  <div className="patient-form-group">
                    <label htmlFor="emergencyPhone">Contact Phone</label>
                    <input
                      type="tel"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={profileData.emergencyPhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={isEditing ? 'patient-editable' : 'patient-readonly'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="patient-password-section">
            <div className="patient-section-header">
              <h3>Change Password</h3>
            </div>

            <div className="patient-password-form">
              <div className="patient-form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="patient-editable"
                  placeholder="Enter current password"
                />
              </div>

              <div className="patient-form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="patient-editable"
                  placeholder="Enter new password"
                />
              </div>

              <div className="patient-form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="patient-editable"
                  placeholder="Confirm new password"
                />
              </div>

              {shouldShowRequirements && (
                <div className="patient-password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li className={passwordData.newPassword.length >= 6 ? 'patient-requirement-met' : 'patient-requirement-not-met'}>
                      At least 6 characters long
                    </li>
                    <li className={/[a-zA-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) ? 'patient-requirement-met' : 'patient-requirement-not-met'}>
                      Must contain letters and numbers
                    </li>
                    <li className={passwordData.newPassword !== passwordData.currentPassword && passwordData.newPassword.length > 0 ? 'patient-requirement-met' : 'patient-requirement-not-met'}>
                      Cannot be the same as current password
                    </li>
                  </ul>
                </div>
              )}

              <button className="patient-save-btn" onClick={handleSavePassword}>
                <FaLock className="patient-btn-icon" />
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
