//import './auth.css';
import './Registration.css';
import { useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { usePSGC } from '../hooks/usePSGC';
import { Lock } from 'lucide-react';
import RegistrationHeader from './RegistrationHeader';
import { useAuth } from '../contexts/AuthContext';

import { apiRequest } from '../api/apiClient';

const registerPatient = async (formData) => {
  // Define the default values that we want to treat as "not set" if unchanged
  const defaultRegion = 'Bicol Region';
  const defaultProvince = 'Camarines Sur';
  const defaultCity = 'City of Naga';

  return await apiRequest('/api/v1/auth/register', {
    method: 'POST',
    disableAuthRedirect: true,
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName || '',
      email: formData.email,
      password: formData.password,
      birthday: formData.birthday,
      gender: formData.gender || undefined,
      mobileNumber: formData.mobileNumber,
      // Only send address if it's been modified from the default
      barangay: formData.barangay,
      city: formData.city === defaultCity ? '' : formData.city,
      province: formData.province === defaultProvince ? '' : formData.province,
      region: formData.region === defaultRegion ? '' : formData.region,
      zipCode: formData.zipCode,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      isPhilHealthMember: formData.isPhilHealthMember,
      philHealthNumber: formData.isPhilHealthMember ? formData.philHealthNumber : '',
      emergencyFullName: formData.emergencyFullName,
      emergencyRelationship: formData.emergencyRelationship,
      emergencyPhoneNumber: formData.emergencyPhoneNumber,
    }),
  });
};

export default function Registration() {
  const navigate = useNavigate();
  const { refreshSession, getRedirectPathForRole } = useAuth();
  const {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = usePSGC();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    gender: '',
    mobileNumber: '',
    barangay: '',
    city: '',
    province: '',
    region: '',
    zipCode: '',
    addressLine1: '',
    addressLine2: '',
    isPhilHealthMember: false,
    philHealthNumber: '',
    emergencyFullName: '',
    emergencyRelationship: '',
    emergencyPhoneNumber: '',
  });
  
  const formRef = useRef(null);
  
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeliveryAddress, setShowDeliveryAddress] = useState(false);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);

  // Initialize defaults for Bicol Region, Camarines Sur, and Naga
  useEffect(() => {
    if (regions.length > 0 && formData.region === '') {
      const bicolRegion = regions.find((r) => r.name === 'Bicol Region');
      if (bicolRegion) {
        setFormData((prev) => ({ ...prev, region: bicolRegion.name }));
        fetchProvinces(bicolRegion.code);
      }
    }
  }, [regions, formData.region, fetchProvinces]);

  // Set province to Camarines Sur after regions are loaded
  useEffect(() => {
    if (
      provinces.length > 0 &&
      formData.region === 'Bicol Region' &&
      formData.province === ''
    ) {
      const camarineSur = provinces.find((p) => p.name === 'Camarines Sur');
      if (camarineSur) {
        setFormData((prev) => ({ ...prev, province: camarineSur.name }));
        fetchCities(camarineSur.code);
      }
    }
  }, [provinces, formData.region, formData.province, fetchCities]);

  // Set city to Naga after provinces are loaded
  useEffect(() => {
    if (
      cities.length > 0 &&
      formData.province === 'Camarines Sur' &&
      formData.city === ''
    ) {
      const nagaCity = cities.find(
        (c) => c.name === 'City of Naga' || c.name === 'City of Naga',
      );
      if (nagaCity) {
        setFormData((prev) => ({ ...prev, city: nagaCity.name }));
        fetchBarangays(nagaCity.code);
      }
    }
  }, [cities, formData.province, formData.city, fetchBarangays]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let filteredValue = value;

    // Apply character restrictions
    if (['firstName', 'lastName', 'middleName'].includes(id)) {
      filteredValue = value.replace(/[^a-zA-Z\s-]/g, '');
    } else if (id === 'mobileNumber' || id === 'emergencyPhoneNumber') {
      // Ensure only + and numbers are entered, and max length for +639XXXXXXXXX (13 chars)
      filteredValue = value.replace(/[^0-9+]/g, '').slice(0, 13);
    } else if (id === 'philHealthNumber') {
      // Numbers only, then format as XX-XXXXXXXXX-X (12 digits total)
      const digits = value.replace(/[^0-9]/g, '').slice(0, 12);
      filteredValue = digits;
      if (digits.length > 2) {
        filteredValue = digits.slice(0, 2) + '-' + digits.slice(2);
      }
      if (digits.length > 11) {
        filteredValue =
          digits.slice(0, 2) + '-' + digits.slice(2, 11) + '-' + digits.slice(11);
      }
    } else if (id === 'zipCode') {
      filteredValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    } else if (['addressLine1', 'addressLine2'].includes(id)) {
      filteredValue = value.replace(/[^a-zA-Z0-9\s,]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [id]: filteredValue,
    }));

    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: '',
      }));
    }
  };

  const handleRegionChange = (e) => {
    const selectedRegion = regions.find((r) => r.name === e.target.value);
    setFormData((prev) => ({
      ...prev,
      region: e.target.value,
      province: '',
      city: '',
      barangay: '',
    }));
    if (selectedRegion) {
      fetchProvinces(selectedRegion.code);
    }
  };

  const handleProvinceChange = (e) => {
    const selectedProvince = provinces.find((p) => p.name === e.target.value);
    setFormData((prev) => ({
      ...prev,
      province: e.target.value,
      city: '',
      barangay: '',
    }));
    if (selectedProvince) {
      fetchCities(selectedProvince.code);
    }
  };

  const handleCityChange = (e) => {
    const selectedCity = cities.find((c) => c.name === e.target.value);
    setFormData((prev) => ({
      ...prev,
      city: e.target.value,
      barangay: '',
    }));
    if (selectedCity) {
      fetchBarangays(selectedCity.code);
    }
  };

  const handleBarangayChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      barangay: e.target.value,
    }));
  };

  const handleCheckboxChange = (e) => {
    setTermsAccepted(e.target.checked);
    if (errors.terms) {
      setErrors((prev) => ({
        ...prev,
        terms: '',
      }));
    }
  };

  const handlePrivacyChange = (e) => {
    setPrivacyAccepted(e.target.checked);
    if (errors.privacy) {
      setErrors((prev) => ({
        ...prev,
        privacy: '',
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isPasswordValid = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const getPasswordRequirements = (password) => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One number', met: /[0-9]/.test(password) },
      { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
    ];
  };

  const shouldShowRequirements = (password) => {
    return password.length > 0 && !isPasswordValid(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setSuccess('');
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    } else {
      const birthDate = new Date(formData.birthday);
      if (birthDate > new Date()) {
        newErrors.birthday = 'Birthday cannot be in the future';
      } else {
        // Confirm if 18
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.birthday = 'You must be at least 18 years old to register';
        }

        // Year bug: 5-digit year
        if (birthDate.getFullYear() > 9999) {
          newErrors.birthday = 'Invalid year in birthday';
        }
      }
    }

    if (formData.isPhilHealthMember) {
      if (!formData.philHealthNumber.trim()) {
        newErrors.philHealthNumber = 'PhilHealth number is required';
      } else {
        const philRegex = /^\d{2}-\d{9}-\d$/;
        if (!philRegex.test(formData.philHealthNumber)) {
          newErrors.philHealthNumber = 'Invalid PhilHealth format (XX-XXXXXXXXX-X)';
        }
      }
    }

    if (showDeliveryAddress) {
      if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Street address is required';
      if (!formData.region) newErrors.region = 'Region is required';
      if (!formData.province) newErrors.province = 'Province is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.barangay) newErrors.barangay = 'Barangay is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    }

    if (showEmergencyContact) {
      if (!formData.emergencyFullName.trim()) newErrors.emergencyFullName = 'Full name is required';
      if (!formData.emergencyRelationship.trim()) newErrors.emergencyRelationship = 'Relationship is required';
      if (!formData.emergencyPhoneNumber.trim()) {
        newErrors.emergencyPhoneNumber = 'Phone number is required';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else {
      // Philippine mobile number filter: starts with +639 followed by 9 digits
      const mobileRegex = /^\+639\d{9}$/;
      if (!mobileRegex.test(formData.mobileNumber.trim())) {
        newErrors.mobileNumber =
          'Must be a valid PH number starting with +639 (e.g., +639123456789)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters and include an uppercase letter, a number, and a special character';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!termsAccepted)
      newErrors.terms = 'You must accept the terms and conditions';
    if (!privacyAccepted)
      newErrors.privacy = 'You must accept the privacy policy';

    if (formData.emergencyPhoneNumber && formData.emergencyPhoneNumber.trim()) {
      const mobileRegex = /^\+639\d{9}$/;
      if (!mobileRegex.test(formData.emergencyPhoneNumber.trim())) {
        newErrors.emergencyPhoneNumber =
          'Must be a valid PH number starting with +639 (e.g., +639123456789)';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 1) {
        // If only one error, scroll to that specific field
        const firstErrorKey = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorKey);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // If multiple errors, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      const result = await registerPatient(formData);
      if (result.message || result.success) {
        // Automatically sync session
        await refreshSession();
        setSuccess(
          'Your account has been successfully created. Welcome to OkieDoc+!',
        );
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      const newErrors = {};
      
      if (error && typeof error === 'object') {
        if (error.emailAlreadyInUse) {
          newErrors.email = error.emailAlreadyInUse.message || 'Email already in use';
        } else if (error.mobileNumberAlreadyInUse) {
          newErrors.mobileNumber = error.mobileNumberAlreadyInUse.message || 'Mobile number already in use';
        } else if (error.message) {
          newErrors.email = error.message;
        } else {
          newErrors.email = 'Registration failed. Please try again.';
        }
      } else {
        newErrors.email = typeof error === 'string' ? error : 'Registration failed.';
      }
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 1) {
        // If only one error, scroll to that specific field
        const firstErrorKey = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorKey);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // If multiple errors, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <RegistrationHeader backLabel='Back to Home' backPath='/' />

      {success && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-success-icon'>✓</div>
            <h3 className='modal-title'>Registration Successful</h3>
            <p className='modal-description'>{success}</p>
            <button
              className='login-btn'
              style={{ margin: 0, width: '100%' }}
              onClick={() => {
                const redirectPath = getRedirectPathForRole('patient');
                navigate(redirectPath);
              }}
            >
              Navigate to dashboard
            </button>
          </div>
        </div>
      )}
      <div className='login-page-wrapper' style={{ backgroundColor: '#f1f5f9', minHeight: 'calc(100vh - 65px)', padding: '0 0 1.5rem', fontFamily: 'Inter, sans-serif' }}>
        <div className='registration-container'>
          <div className='registration-header-section'>
            <h2 className='registration-title'>Create Your Account</h2>
            <p className='registration-subtitle'>
              Join OkieDoc+ and access quality healthcare from home
            </p>
          </div>

          <div className='registration-card'>
            <h3 className='registration-section-title'>Personal Information</h3>
            
            <form className='registration-form' onSubmit={handleSubmit}>
              <div className='registration-field'>
                <label className='registration-label' htmlFor='firstName'>
                  First Name <span className='required'>*</span>
                </label>
                <input
                  className={`registration-input ${errors.firstName ? 'error' : ''}`}
                  id='firstName'
                  type='text'
                  placeholder='Juan'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  maxLength={150}
                />
                {errors.firstName && (
                  <span className='registration-error-text'>{errors.firstName}</span>
                )}
              </div>

              <div className='registration-field'>
                <label className='registration-label' htmlFor='lastName'>
                  Last Name <span className='required'>*</span>
                </label>
                <input
                  className={`registration-input ${errors.lastName ? 'error' : ''}`}
                  id='lastName'
                  type='text'
                  placeholder='Dela Cruz'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  maxLength={150}
                />
                {errors.lastName && (
                  <span className='registration-error-text'>{errors.lastName}</span>
                )}
              </div>

              <div className='registration-field full-width' style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <label className='registration-label' htmlFor='email'>
                  Email Address <span className='required'>*</span>
                </label>
                <input
                  className={`registration-input ${errors.email ? 'error' : ''}`}
                  id='email'
                  type='email'
                  placeholder='juan.delacruz@email.com'
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <span className='registration-error-text'>{errors.email}</span>
                )}
              </div>

              <div className='registration-field full-width'>
                <label className='registration-label' htmlFor='mobileNumber'>
                  Mobile Number <span className='required'>*</span>
                </label>
                <input
                  className={`registration-input ${errors.mobileNumber ? 'error' : ''}`}
                  id='mobileNumber'
                  type='tel'
                  placeholder='+63 912 345 6789'
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  maxLength={13}
                />
                {errors.mobileNumber && (
                  <span className='registration-error-text'>{errors.mobileNumber}</span>
                )}
              </div>

              <div className='registration-field full-width' style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <label className='registration-label' htmlFor='password'>
                  Password <span className='required'>*</span>
                </label>
                <div className='registration-password-wrapper'>
                  <input
                    className={`registration-input ${errors.password ? 'error' : ''}`}
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter a strong password'
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type='button'
                    className='registration-password-toggle'
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className='registration-error-text'>{errors.password}</span>
                )}
              </div>

              <div className='registration-field full-width'>
                <label className='registration-label' htmlFor='confirmPassword'>
                  Confirm Password <span className='required'>*</span>
                </label>
                <div className='registration-password-wrapper'>
                  <input
                    className={`registration-input ${errors.confirmPassword ? 'error' : ''}`}
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Re-enter your password'
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type='button'
                    className='registration-password-toggle'
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className='registration-error-text'>{errors.confirmPassword}</span>
                )}
              </div>

              <div className='registration-field'>
                <label className='registration-label'>
                  Date of Birth <span className='required'>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id='birthday'
                    type="date"
                    className={`registration-input ${errors.birthday ? 'error' : ''}`}
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    style={{ color: '#64748b', cursor: 'pointer' }}
                  />
                  {errors.birthday && (
                      <div className='registration-error-popup'>
                        {errors.birthday}
                      </div>
                  )}
                </div>
              </div>

              <div className='registration-field'>
                <label className='registration-label' htmlFor='gender'>
                  Gender <span className='required'>*</span>
                </label>
                <select
                  id='gender'
                  className={`registration-select ${errors.gender ? 'input-error' : ''}`}
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={{ color: '#64748b' }}
                >
                  <option value=''>Select gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
                {errors.gender && (
                  <span className='registration-error-text'>{errors.gender}</span>
                )}
              </div>

              <div className='registration-field full-width' style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <input 
                  type='checkbox' 
                  className='registration-checkbox' 
                  style={{ accentColor: '#2563eb' }} 
                  checked={formData.isPhilHealthMember}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      isPhilHealthMember: checked,
                      philHealthNumber: checked ? formData.philHealthNumber : ''
                    });
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '1.1rem' }}>I am a PhilHealth Member</div>
                  <div style={{ color: '#3b82f6', fontSize: '0.95rem', marginTop: '0.25rem' }}>PhilHealth coverage helps reduce your consultation costs</div>
                </div>
                </div>
              </div>

              {formData.isPhilHealthMember && (
                <div className='registration-field full-width'>
                  <label className='registration-label' htmlFor='philHealthNumber'>
                    PhilHealth Number <span className='required'>*</span>
                  </label>
                  <input
                    className={`registration-input ${errors.philHealthNumber ? 'error' : ''}`}
                    id='philHealthNumber'
                    type='text'
                    placeholder='17-13245678-0'
                    value={formData.philHealthNumber}
                    onChange={handleInputChange}
                    maxLength={14}
                  />
                  {errors.philHealthNumber && (
                    <span className='registration-error-text'>{errors.philHealthNumber}</span>
                  )}
                </div>
              )}

              <div className='registration-field full-width' style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <button
                  type='button'
                  onClick={() => {
                    const newShow = !showDeliveryAddress;
                    setShowDeliveryAddress(newShow);
                    if (!newShow) {
                      setFormData(prev => ({
                        ...prev,
                        barangay: '',
                        city: '',
                        province: '',
                        region: '',
                        zipCode: '',
                        addressLine1: '',
                        addressLine2: ''
                      }));
                      // Clear errors for these fields
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        ['barangay', 'city', 'province', 'region', 'zipCode', 'addressLine1', 'addressLine2'].forEach(k => delete newErrors[k]);
                        return newErrors;
                      });
                    }
                  }}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  <span style={{ fontSize: '1.5rem', marginRight: '0.75rem', lineHeight: 1 }}>{showDeliveryAddress ? '−' : '+'}</span>
                  {showDeliveryAddress ? 'Hide Delivery Address (Optional)' : 'Add Delivery Address (Optional)'}
                </button>
                {showDeliveryAddress && (
                  <div className="registration-optional-section">
                    <p className="registration-optional-description">Add your address for pharmacy delivery services</p>

                    <div className="registration-field">
                      <label className='registration-label'>Street Address</label>
                      <input
                        id='addressLine1'
                        className={`registration-input ${errors.addressLine1 ? 'error' : ''}`}
                        type='text'
                        placeholder='123 Main Street, Unit 456'
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        style={{ backgroundColor: '#fff' }}
                      />
                      {errors.addressLine1 && (
                        <span className='registration-error-text'>{errors.addressLine1}</span>
                      )}
                    </div>

                    <div className="registration-grid-2">
                       <div className='registration-field'>
                        <label className='registration-label'>Region</label>
                        <select
                          id='region'
                          className={`registration-select ${errors.region ? 'input-error' : ''}`}
                          value={formData.region}
                          onChange={handleRegionChange}
                          style={{ backgroundColor: '#fff' }}
                        >
                          <option value=''>Select Region</option>
                          {regions.map((region) => (
                            <option key={region.code} value={region.name}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                        {errors.region && (
                          <span className='registration-error-text'>{errors.region}</span>
                        )}
                      </div>
                      <div className='registration-field'>
                        <label className='registration-label'>Province</label>
                        <select
                          id='province'
                          className={`registration-select ${errors.province ? 'input-error' : ''}`}
                          value={formData.province}
                          onChange={handleProvinceChange}
                          style={{ backgroundColor: '#fff' }}
                          disabled={!formData.region}
                        >
                          <option value=''>Select Province</option>
                          {provinces.map((province) => (
                            <option key={province.code} value={province.name}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                        {errors.province && (
                          <span className='registration-error-text'>{errors.province}</span>
                        )}
                      </div>
                      <div className='registration-field'>
                        <label className='registration-label'>City/Municipality</label>
                        <select
                          id='city'
                          className={`registration-select ${errors.city ? 'input-error' : ''}`}
                          value={formData.city}
                          onChange={handleCityChange}
                          style={{ backgroundColor: '#fff' }}
                          disabled={!formData.province}
                        >
                          <option value=''>Select City/Municipality</option>
                          {cities.map((city) => (
                            <option key={city.code} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        {errors.city && (
                          <span className='registration-error-text'>{errors.city}</span>
                        )}
                      </div>
                      <div className='registration-field'>
                        <label className='registration-label'>Barangay</label>
                        <select
                          id='barangay'
                          className={`registration-select ${errors.barangay ? 'input-error' : ''}`}
                          value={formData.barangay}
                          onChange={handleBarangayChange}
                          style={{ backgroundColor: '#fff' }}
                          disabled={!formData.city}
                        >
                          <option value=''>Select Barangay</option>
                          {barangays.map((barangay) => (
                            <option key={barangay.code} value={barangay.name}>
                              {barangay.name}
                            </option>
                          ))}
                        </select>
                        {errors.barangay && (
                          <span className='registration-error-text'>{errors.barangay}</span>
                        )}
                      </div>
                      <div className='registration-field'>
                        <label className='registration-label'>Zip Code</label>
                        <input
                          id='zipCode'
                          className={`registration-input ${errors.zipCode ? 'error' : ''}`}
                          type='text'
                          placeholder='1000'
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          style={{ backgroundColor: '#fff' }}
                        />
                         {errors.zipCode && (
                          <span className='registration-error-text'>{errors.zipCode}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className='registration-field full-width' style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <button
                  type='button'
                  onClick={() => {
                    const newShow = !showEmergencyContact;
                    setShowEmergencyContact(newShow);
                    if (!newShow) {
                      setFormData(prev => ({
                        ...prev,
                        emergencyFullName: '',
                        emergencyRelationship: '',
                        emergencyPhoneNumber: ''
                      }));
                      // Clear errors for these fields
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        ['emergencyFullName', 'emergencyRelationship', 'emergencyPhoneNumber'].forEach(k => delete newErrors[k]);
                        return newErrors;
                      });
                    }
                  }}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  <span style={{ fontSize: '1.5rem', marginRight: '0.75rem', lineHeight: 1 }}>{showEmergencyContact ? '−' : '+'}</span>
                  {showEmergencyContact ? 'Hide Emergency Contact (Optional)' : 'Add Emergency Contact (Optional)'}
                </button>
                {showEmergencyContact && (
                  <div className="registration-optional-section">
                    <p className="registration-optional-description">Person to contact in case of emergency</p>

                    <div className="registration-field">
                      <label className='registration-label'>Full Name</label>
                      <input
                        id='emergencyFullName'
                        className={`registration-input ${errors.emergencyFullName ? 'error' : ''}`}
                        type='text'
                        placeholder='Maria Dela Cruz'
                        value={formData.emergencyFullName || ''}
                        onChange={handleInputChange}
                        style={{ backgroundColor: '#fff' }}
                      />
                      {errors.emergencyFullName && (
                        <span className='registration-error-text'>{errors.emergencyFullName}</span>
                      )}
                    </div>

                    <div className="registration-grid-2">
                      <div className='registration-field'>
                        <label className='registration-label'>Relationship</label>
                        <input
                          id='emergencyRelationship'
                          className={`registration-input ${errors.emergencyRelationship ? 'error' : ''}`}
                          type='text'
                          placeholder='Mother, Spouse, etc.'
                          value={formData.emergencyRelationship || ''}
                          onChange={handleInputChange}
                          style={{ backgroundColor: '#fff' }}
                        />
                         {errors.emergencyRelationship && (
                          <span className='registration-error-text'>{errors.emergencyRelationship}</span>
                        )}
                      </div>
                      <div className='registration-field' style={{ position: 'relative' }}>
                        <label className='registration-label'>Phone Number</label>
                        <input
                          id='emergencyPhoneNumber'
                          className={`registration-input ${errors.emergencyPhoneNumber ? 'error' : ''}`}
                          type='tel'
                          placeholder='+63 912 345 6789'
                          value={formData.emergencyPhoneNumber || ''}
                          onChange={handleInputChange}
                          style={{ backgroundColor: '#fff' }}
                        />
                        {errors.emergencyPhoneNumber && (
                          <div className='registration-error-popup'>
                            {errors.emergencyPhoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className='registration-field full-width' style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <input 
                  type='checkbox' 
                  className={`registration-checkbox ${errors.terms || errors.privacy ? 'error' : ''}`} 
                  style={{ accentColor: '#2563eb' }} 
                  checked={termsAccepted && privacyAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    setPrivacyAccepted(e.target.checked);
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '1.1rem' }}>
                    I agree to the <span style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span> <span className='required'>*</span>
                  </div>
                  { (errors.terms || errors.privacy) && (
                    <div className='registration-error-text' style={{ marginTop: '0.25rem' }}>{errors.terms || errors.privacy}</div>
                  )}
                  <div style={{ color: '#3b82f6', fontSize: '0.95rem', marginTop: '0.25rem' }}>Your data is protected and used only for healthcare services</div>
                </div>
                </div>
              </div>

              <div className='registration-field full-width' style={{ borderTop: '1px solid #e5e7eb', marginTop: '0.5rem', paddingTop: '1.5rem' }}>
                <button 
                  className='registration-submit-btn' 
                  type='submit' 
                >
                  Create Account
                </button>
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1rem', color: '#64748b' }}>
                  Already have an account? <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>Login</span>
                </p>
              </div>
            </form>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '1rem' }}>
            <Lock size={18} /> Your information is secure and encrypted
          </div>
        </div>
      </div>
    </>
  );
}
