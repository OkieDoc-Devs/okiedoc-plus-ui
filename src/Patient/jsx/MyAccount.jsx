import React, { useState, useRef } from 'react';
import { FaUser, FaCamera, FaLock, FaSave, FaTimes } from 'react-icons/fa';
import apiService from '../services/apiService';

const MyAccount = ({ 
  profileImage, 
  setProfileImage, 
  profileData, 
  setProfileData, 
  passwordData, 
  setPasswordData, 
  isEditing, 
  setIsEditing, 
  activeTab, 
  setActiveTab 
}) => {
  const fileInputRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

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

  const compressImage = (file, maxWidth = 300, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compress the image before showing in modal
        const compressedImage = await compressImage(file);
        setTempImage(compressedImage);
        setShowImageModal(true);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original method if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          setTempImage(e.target.result);
          setShowImageModal(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveImage = async () => {
    try {
      const patientId = localStorage.getItem('patientId');
      if (!patientId) {
        console.error('No patient ID found in session');
        alert('No patient ID found in session');
        return;
      }

      console.log('=== SAVING PROFILE IMAGE ===');
      console.log('Patient ID:', patientId);
      console.log('Temp Image:', tempImage ? 'Present' : 'Not provided');

      // Prepare profile data for backend
      const profileUpdateData = {
        profile_image_url: tempImage,
      };

      console.log('Sending to backend:', profileUpdateData);

      // Call backend API to update profile
      const response = await apiService.updatePatientProfile(patientId, profileUpdateData);
      
      console.log('Backend response:', response);
      
      if (response.success) {
        console.log('Profile image saved successfully');
        setProfileImage(tempImage); // Update the actual profile image
        setTempImage(null); // Clear temp image
        setShowImageModal(false); // Close modal
        alert('Profile image updated successfully!');
      } else {
        console.error('Failed to save profile image:', response.error);
        alert('Failed to save profile image. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile image:', error);
      alert('Error saving profile image. Please try again.');
    }
  };

  const handleDiscardImage = () => {
    setTempImage(null);
    setShowImageModal(false);
  };

  const handleSaveProfile = async () => {
    try {
      const patientId = localStorage.getItem('patientId');
      if (!patientId) {
        console.error('No patient ID found in session');
        alert('No patient ID found in session');
        return;
      }

      console.log('=== SAVING PROFILE ===');
      console.log('Patient ID:', patientId);
      console.log('Profile Data:', profileData);
      console.log('Profile Image:', profileImage ? 'Image present' : 'No image');
      
      // Prepare profile data for backend
      const profileUpdateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        emergency_contact_name: profileData.emergencyContact,
        emergency_contact_phone: profileData.emergencyPhone,
        date_of_birth: profileData.dateOfBirth,
      };

      // Profile image is handled separately in the image modal

      console.log('Sending to backend:', profileUpdateData);

      // Call backend API to update profile
      const response = await apiService.updatePatientProfile(patientId, profileUpdateData);
      
      console.log('Backend response:', response);
      
      if (response.success) {
        console.log('Profile saved successfully');
        setIsEditing(false);
        // Optionally show success message
        alert('Profile updated successfully!');
      } else {
        console.error('Failed to save profile:', response.error);
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
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

      {/* Profile Image Upload Modal */}
      {showImageModal && (
        <div 
          className="patient-image-modal-overlay" 
          onClick={handleDiscardImage}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <div 
            className="patient-image-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: 0,
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              margin: 0
            }}
          >
            <div className="patient-image-modal-header">
              <h3>Update Profile Picture</h3>
              <button 
                className="patient-image-modal-close"
                onClick={handleDiscardImage}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="patient-image-modal-content">
              <div className="patient-image-preview-container">
                {tempImage ? (
                  <img src={tempImage} alt="Preview" className="patient-image-preview" />
                ) : (
                  <div className="patient-image-preview-placeholder">
                    <FaUser />
                  </div>
                )}
              </div>
              
              <div className="patient-image-modal-actions">
                <button 
                  className="patient-image-discard-btn"
                  onClick={handleDiscardImage}
                >
                  <FaTimes />
                  Discard
                </button>
                <button 
                  className="patient-image-save-btn"
                  onClick={handleSaveImage}
                >
                  <FaSave />
                  Save Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccount;
