import React, { useState, useRef } from 'react';
import { FaUser, FaCamera, FaLock, FaSave, FaTimes } from 'react-icons/fa';
import {
  updatePatientProfile,
  uploadProfilePicture,
} from '../services/apiService';
import { API_BASE_URL } from '../../api/apiClient';
import ImageCropperModal from '../../components/ImageCropperModal';
import Avatar from '../../components/Avatar';
import { usePSGC } from '../../hooks/usePSGC';

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
  setActiveTab,
}) => {
  const {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = usePSGC();
  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isPasswordValid = (password) => {
    return (
      password.length >= 6 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      password !== passwordData.currentPassword
    );
  };

  const isTypingPassword =
    passwordData.newPassword.length > 0 ||
    passwordData.confirmPassword.length > 0;

  const shouldShowRequirements =
    isTypingPassword && !isPasswordValid(passwordData.newPassword);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImageSrc(e.target.result);
        setCropperModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const handleCropComplete = async (croppedFile) => {
    setCropperModalOpen(false);
    setSelectedImageSrc(null);
    try {
      const formData = new FormData();
      formData.append('photo', croppedFile);
      const response = await uploadProfilePicture(formData);
      setProfileImage(`${API_BASE_URL}${response.profileUrl}`);
      alert('Profile picture uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to upload profile picture.');
    }
  };

  const handleCropCancel = () => {
    setCropperModalOpen(false);
    setSelectedImageSrc(null);
  };

  React.useEffect(() => {
    if (isEditing && profileData.region && regions.length > 0) {
      const region = regions.find((r) => r.name === profileData.region);
      if (region) {
        fetchProvinces(region.code);
      }
    }
  }, [isEditing, profileData.region, regions, fetchProvinces]);

  React.useEffect(() => {
    if (isEditing && profileData.province && provinces.length > 0) {
      const province = provinces.find((p) => p.name === profileData.province);
      if (province) {
        fetchCities(province.code);
      }
    }
  }, [isEditing, profileData.province, provinces, fetchCities]);

  React.useEffect(() => {
    if (isEditing && profileData.city && cities.length > 0) {
      const city = cities.find((c) => c.name === profileData.city);
      if (city) {
        fetchBarangays(city.code);
      }
    }
  }, [isEditing, profileData.city, cities, fetchBarangays]);

  const handleSaveProfile = async () => {
    try {
      const payload = {
        birthday: profileData.birthday,
        gender: profileData.gender,
        bloodType: profileData.bloodType,
        allergies: profileData.allergies,
        activeDiseases: profileData.activeDiseases,
        medications: profileData.medications,
        hmoCompany: profileData.hmoCompany,
        hmoMemberId: profileData.hmoMemberId,
        loaCode: profileData.loaCode,
        barangay: profileData.barangay,
        city: profileData.city,
        province: profileData.province,
        region: profileData.region,
        zipCode: profileData.zipCode,
        addressLine1: profileData.addressLine1,
        addressLine2: profileData.addressLine2,
      };

      const res = await updatePatientProfile(payload);
      if (res) {
        alert('Clinical profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      alert('Failed to update profile. Please try again.');
      console.error(err);
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
    // console.log('Changing password');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className='patient-page-content'>
      <h2>My Account</h2>

      <div className='patient-account-container'>
        <div className='patient-profile-image-section'>
          <div className='patient-profile-image-container'>
            <Avatar
              profileImageUrl={profileImage}
              firstName={profileData.firstName}
              lastName={profileData.lastName}
              userType='patient'
              size={120}
              alt='Profile'
              className='patient-profile-image'
            />
            <button
              className='patient-upload-btn'
              onClick={() => fileInputRef.current?.click()}
              title='Upload Photo'
            >
              <FaCamera className='patient-upload-icon' />
            </button>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept='image/*'
              style={{ display: 'none' }}
            />
          </div>
          <div className='patient-profile-name'>
            <h3 className='patient-profile-full-name'>
              {profileData.firstName} {profileData.lastName}
            </h3>
            <p className='patient-profile-email'>{profileData.email}</p>
          </div>
        </div>

        <div className='patient-account-tabs'>
          <button
            className={`patient-tab-btn ${activeTab === 'profile' ? 'patient-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className='patient-tab-icon' />
            Profile Information
          </button>
          <button
            className={`patient-tab-btn ${activeTab === 'password' ? 'patient-active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FaLock className='patient-tab-icon' />
            Change Password
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className='patient-profile-section'>
            <div className='patient-section-header'>
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button
                  className='patient-edit-btn'
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <div className='patient-action-buttons'>
                  <button
                    className='patient-save-btn'
                    onClick={handleSaveProfile}
                  >
                    <FaSave className='patient-btn-icon' />
                    Save Changes
                  </button>
                  <button className='patient-cancel-btn' onClick={handleCancel}>
                    <FaTimes className='patient-btn-icon' />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className='patient-profile-form'>
              <div className='patient-form-row'>
                <div className='patient-form-group'>
                  <label htmlFor='firstName'>First Name</label>
                  <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={
                      isEditing ? 'patient-editable' : 'patient-readonly'
                    }
                  />
                </div>
                <div className='patient-form-group'>
                  <label htmlFor='lastName'>Last Name</label>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={
                      isEditing ? 'patient-editable' : 'patient-readonly'
                    }
                  />
                </div>
              </div>

              <div className='patient-form-row'>
                <div className='patient-form-group'>
                  <label htmlFor='email'>Email Address</label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={
                      isEditing ? 'patient-editable' : 'patient-readonly'
                    }
                  />
                </div>
                <div className='patient-form-group'>
                  <label htmlFor='phone'>Phone Number</label>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={
                      isEditing ? 'patient-editable' : 'patient-readonly'
                    }
                  />
                </div>
              </div>

              <div className='patient-form-row'>
                <div className='patient-form-group'>
                  <label htmlFor='birthday'>Date of Birth</label>
                  <input
                    type='date'
                    id='birthday'
                    name='birthday'
                    value={profileData.birthday || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={
                      isEditing ? 'patient-editable' : 'patient-readonly'
                    }
                  />
                </div>
                <div className='patient-form-group'>
                  <label htmlFor='region'>Region</label>
                  {isEditing ? (
                    <select
                      id='region'
                      name='region'
                      value={profileData.region || ''}
                      onChange={(e) => {
                        const selectedRegion = regions.find(
                          (r) => r.name === e.target.value,
                        );
                        handleInputChange(e);
                        fetchProvinces(selectedRegion?.code);
                        setProfileData((prev) => ({
                          ...prev,
                          province: '',
                          city: '',
                          barangay: '',
                        }));
                      }}
                      className='patient-editable patient-select'
                    >
                      <option value=''>Select Region</option>
                      {regions.map((r) => (
                        <option key={r.code} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type='text'
                      id='region'
                      name='region'
                      value={profileData.region || ''}
                      readOnly
                      className='patient-readonly'
                    />
                  )}
                </div>
              </div>

              <div className='patient-form-row'>
                <div className='patient-form-group'>
                  <label htmlFor='province'>Province</label>
                  {isEditing ? (
                    <select
                      id='province'
                      name='province'
                      value={profileData.province || ''}
                      onChange={(e) => {
                        const selectedProvince = provinces.find(
                          (p) => p.name === e.target.value,
                        );
                        handleInputChange(e);
                        fetchCities(selectedProvince?.code);
                        setProfileData((prev) => ({
                          ...prev,
                          city: '',
                          barangay: '',
                        }));
                      }}
                      className='patient-editable patient-select'
                      disabled={!profileData.region}
                    >
                      <option value=''>Select Province</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type='text'
                      id='province'
                      name='province'
                      value={profileData.province || ''}
                      readOnly
                      className='patient-readonly'
                    />
                  )}
                </div>
                <div className='patient-form-group'>
                  <label htmlFor='city'>City / Municipality</label>
                  {isEditing ? (
                    <select
                      id='city'
                      name='city'
                      value={profileData.city || ''}
                      onChange={(e) => {
                        const selectedCity = cities.find(
                          (c) => c.name === e.target.value,
                        );
                        handleInputChange(e);
                        fetchBarangays(selectedCity?.code);
                        setProfileData((prev) => ({ ...prev, barangay: '' }));
                      }}
                      className='patient-editable patient-select'
                      disabled={!profileData.province}
                    >
                      <option value=''>Select City / Municipality</option>
                      {cities.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type='text'
                      id='city'
                      name='city'
                      value={profileData.city || ''}
                      readOnly
                      className='patient-readonly'
                    />
                  )}
                </div>
              </div>

              <div className='patient-form-row'>
                <div className='patient-form-group'>
                  <label htmlFor='barangay'>Barangay</label>
                  {isEditing ? (
                    <select
                      id='barangay'
                      name='barangay'
                      value={profileData.barangay || ''}
                      onChange={handleInputChange}
                      className='patient-editable patient-select'
                      disabled={!profileData.city}
                    >
                      <option value=''>Select Barangay</option>
                      {barangays.map((b) => (
                        <option key={b.code} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type='text'
                      id='barangay'
                      name='barangay'
                      value={profileData.barangay || ''}
                      readOnly
                      className='patient-readonly'
                    />
                  )}
                </div>
                <div className='patient-form-group'>
                  <label htmlFor='zipCode'>Zip Code</label>
                  <input
                    type='text'
                    id='zipCode'
                    name='zipCode'
                    value={profileData.zipCode || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={
                      isEditing ? 'patient-editable' : 'patient-readonly'
                    }
                  />
                </div>
              </div>

              <div className='patient-form-row'>
                <div className='patient-form-group'>
                  <label htmlFor='addressLine1'>Address Line 1</label>
                  <input
                    type='text'
                    id='addressLine1'
                    name='addressLine1'
                    value={profileData.addressLine1 || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={
                      isEditing ? 'patient-editable' : 'patient-readonly'
                    }
                  />
                </div>
                <div className='patient-form-group'>
                  <label htmlFor='addressLine2'>Address Line 2</label>
                  <input
                    type='text'
                    id='addressLine2'
                    name='addressLine2'
                    value={profileData.addressLine2 || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={
                      isEditing ? 'patient-editable' : 'patient-readonly'
                    }
                  />
                </div>
              </div>

              <div className='patient-form-section'>
                <h4>Emergency Contact</h4>
                <div className='patient-form-row'>
                  <div className='patient-form-group'>
                    <label htmlFor='emergencyContact'>Contact Name</label>
                    <input
                      type='text'
                      id='emergencyContact'
                      name='emergencyContact'
                      value={profileData.emergencyContact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing ? 'patient-editable' : 'patient-readonly'
                      }
                    />
                  </div>
                  <div className='patient-form-group'>
                    <label htmlFor='emergencyPhone'>Contact Phone</label>
                    <input
                      type='tel'
                      id='emergencyPhone'
                      name='emergencyPhone'
                      value={profileData.emergencyPhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing ? 'patient-editable' : 'patient-readonly'
                      }
                    />
                  </div>
                </div>
              </div>

              <div className='patient-form-section'>
                <h4>Clinical Information</h4>
                <div className='patient-form-row'>
                  <div className='patient-form-group'>
                    <label htmlFor='gender'>Gender</label>
                    <select
                      id='gender'
                      name='gender'
                      value={profileData.gender || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? 'patient-editable patient-select'
                          : 'patient-readonly patient-select'
                      }
                    >
                      <option value=''>Select Gender</option>
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                  <div className='patient-form-group'>
                    <label htmlFor='bloodType'>Blood Type</label>
                    <select
                      id='bloodType'
                      name='bloodType'
                      value={profileData.bloodType || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? 'patient-editable patient-select'
                          : 'patient-readonly patient-select'
                      }
                    >
                      <option value=''>Select Blood Type</option>
                      <option value='A+'>A+</option>
                      <option value='A-'>A-</option>
                      <option value='B+'>B+</option>
                      <option value='B-'>B-</option>
                      <option value='AB+'>AB+</option>
                      <option value='AB-'>AB-</option>
                      <option value='O+'>O+</option>
                      <option value='O-'>O-</option>
                    </select>
                  </div>
                </div>
                <div className='patient-form-row'>
                  <div className='patient-form-group patient-full-width'>
                    <label htmlFor='allergies'>Allergies</label>
                    <textarea
                      id='allergies'
                      name='allergies'
                      value={profileData.allergies || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing ? 'patient-editable' : 'patient-readonly'
                      }
                      placeholder='List any known allergies...'
                      rows='2'
                    />
                  </div>
                </div>
                <div className='patient-form-row'>
                  <div className='patient-form-group patient-full-width'>
                    <label htmlFor='activeDiseases'>
                      Active Diseases / Conditions
                    </label>
                    <textarea
                      id='activeDiseases'
                      name='activeDiseases'
                      value={profileData.activeDiseases || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing ? 'patient-editable' : 'patient-readonly'
                      }
                      placeholder='List any ongoing medical conditions...'
                      rows='2'
                    />
                  </div>
                </div>
                <div className='patient-form-row'>
                  <div className='patient-form-group patient-full-width'>
                    <label htmlFor='medications'>Current Medications</label>
                    <textarea
                      id='medications'
                      name='medications'
                      value={profileData.medications || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing ? 'patient-editable' : 'patient-readonly'
                      }
                      placeholder='List your current medications and dosages...'
                      rows='2'
                    />
                  </div>
                </div>
              </div>

              <div className='patient-form-section'>
                <h4>HMO & Insurance</h4>
                <div className='patient-form-row'>
                  <div className='patient-form-group'>
                    <label htmlFor='hmoCompany'>HMO Provider</label>
                    <input
                      type='text'
                      id='hmoCompany'
                      name='hmoCompany'
                      value={profileData.hmoCompany || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing ? 'patient-editable' : 'patient-readonly'
                      }
                      placeholder='E.g., Maxicare, Intellicare'
                    />
                  </div>
                  <div className='patient-form-group'>
                    <label htmlFor='hmoMemberId'>Member ID</label>
                    <input
                      type='text'
                      id='hmoMemberId'
                      name='hmoMemberId'
                      value={profileData.hmoMemberId || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing ? 'patient-editable' : 'patient-readonly'
                      }
                      placeholder='Card Number'
                    />
                  </div>
                </div>
                <div className='patient-form-row'>
                  <div className='patient-form-group'>
                    <label htmlFor='loaCode'>Default LOA Code (Optional)</label>
                    <input
                      type='text'
                      id='loaCode'
                      name='loaCode'
                      value={profileData.loaCode || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing ? 'patient-editable' : 'patient-readonly'
                      }
                      placeholder='Pre-approved LOA code if applicable'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className='patient-password-section'>
            <div className='patient-section-header'>
              <h3>Change Password</h3>
            </div>

            <div className='patient-password-form'>
              <div className='patient-form-group'>
                <label htmlFor='currentPassword'>Current Password</label>
                <input
                  type='password'
                  id='currentPassword'
                  name='currentPassword'
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className='patient-editable'
                  placeholder='Enter current password'
                />
              </div>

              <div className='patient-form-group'>
                <label htmlFor='newPassword'>New Password</label>
                <input
                  type='password'
                  id='newPassword'
                  name='newPassword'
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className='patient-editable'
                  placeholder='Enter new password'
                />
              </div>

              <div className='patient-form-group'>
                <label htmlFor='confirmPassword'>Confirm New Password</label>
                <input
                  type='password'
                  id='confirmPassword'
                  name='confirmPassword'
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className='patient-editable'
                  placeholder='Confirm new password'
                />
              </div>

              {shouldShowRequirements && (
                <div className='patient-password-requirements'>
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li
                      className={
                        passwordData.newPassword.length >= 6
                          ? 'patient-requirement-met'
                          : 'patient-requirement-not-met'
                      }
                    >
                      At least 6 characters long
                    </li>
                    <li
                      className={
                        /[a-zA-Z]/.test(passwordData.newPassword) &&
                        /[0-9]/.test(passwordData.newPassword)
                          ? 'patient-requirement-met'
                          : 'patient-requirement-not-met'
                      }
                    >
                      Must contain letters and numbers
                    </li>
                    <li
                      className={
                        passwordData.newPassword !==
                          passwordData.currentPassword &&
                        passwordData.newPassword.length > 0
                          ? 'patient-requirement-met'
                          : 'patient-requirement-not-met'
                      }
                    >
                      Cannot be the same as current password
                    </li>
                  </ul>
                </div>
              )}

              <button className='patient-save-btn' onClick={handleSavePassword}>
                <FaLock className='patient-btn-icon' />
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>

      <ImageCropperModal
        isOpen={cropperModalOpen}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </div>
  );
};

export default MyAccount;
