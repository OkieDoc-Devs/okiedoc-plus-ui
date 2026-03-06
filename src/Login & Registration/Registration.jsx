import './auth.css';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { apiRequest } from '../api/apiClient';

const registerPatient = async (formData) => {
  return await apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName || '',
      email: formData.email,
      password: formData.password,
      birthday: formData.birthday,
      mobileNumber: formData.mobileNumber,
    }),
  });
};

export default function Registration() {
  const navigate = useNavigate();
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
  });
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: '',
      }));
    }
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
    return password.length > 0;
  };

  const getPasswordRequirements = (password) => {
    return [];
  };

  const shouldShowRequirements = () => {
    return false;
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
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!termsAccepted)
      newErrors.terms = 'You must accept the terms and conditions';
    if (!privacyAccepted)
      newErrors.privacy = 'You must accept the privacy policy';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const result = await registerPatient(formData);
      if (result.message || result.success) {
        setSuccess(
          result.message ||
            'Your account has been successfully created. You may now log in.',
        );
        window.scrollTo(0, 0);
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          email: '',
          password: '',
          confirmPassword: '',
          birthday: '',
          gender: '',
          mobileNumber: '',
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ email: error.message || 'Registration failed.' });
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      {success && (
        <div
          className='modal-overlay'
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className='modal-content'
            style={{
              backgroundColor: '#fff',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                color: '#2ecc71',
                marginBottom: '15px',
              }}
            >
              ✓
            </div>
            <h3
              style={{ color: '#333', marginBottom: '15px', fontSize: '24px' }}
            >
              Registration Successful
            </h3>
            <p
              style={{
                color: '#666',
                marginBottom: '30px',
                lineHeight: '1.6',
                fontSize: '16px',
              }}
            >
              {success}
            </p>
            <button
              className='login-btn'
              style={{ margin: 0, width: '100%' }}
              onClick={() => navigate('/login')}
            >
              Proceed to Login
            </button>
          </div>
        </div>
      )}
      <div className='login-page-wrapper'>
        <div className='login-container'>
          <div className='header-inside-container'>
            <button
              className='back-btn login-back-btn'
              onClick={() => navigate('/')}
            >
              <span className='material-symbols-outlined'>arrow_back_2</span>
            </button>
            <img
              src='/okie-doc-logo.png'
              alt='OkieDoc+'
              className='logo-image'
            />
            <div style={{ width: '2.5rem' }}></div>
          </div>
          <h2 className='login-title'>Register</h2>
          <p className='login-subtitle'>
            Create your OkieDoc+ account in a few steps.
          </p>
          <form className='login-form' onSubmit={handleSubmit}>
            <label className='login-label' htmlFor='firstName'>
              First Name
            </label>
            <input
              className={`login-input ${errors.firstName ? 'error' : ''}`}
              id='firstName'
              type='text'
              placeholder='Enter your first name'
              value={formData.firstName}
              onChange={handleInputChange}
            />
            {errors.firstName && (
              <span className='error-message'>{errors.firstName}</span>
            )}

            <label className='login-label' htmlFor='lastName'>
              Last Name
            </label>
            <input
              className={`login-input ${errors.lastName ? 'error' : ''}`}
              id='lastName'
              type='text'
              placeholder='Enter your last name'
              value={formData.lastName}
              onChange={handleInputChange}
            />
            {errors.lastName && (
              <span className='error-message'>{errors.lastName}</span>
            )}

            <label className='login-label' htmlFor='middleName'>
              Middle Name (Optional)
            </label>
            <input
              className='login-input'
              id='middleName'
              type='text'
              placeholder='Enter your middle name'
              value={formData.middleName}
              onChange={handleInputChange}
            />

            <label className='login-label' htmlFor='email'>
              Email address
            </label>
            <input
              className={`login-input ${errors.email ? 'error' : ''}`}
              id='email'
              type='email'
              placeholder='Enter your email address'
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <span className='error-message'>{errors.email}</span>
            )}

            <label className='login-label' htmlFor='birthday'>
              Birthday
            </label>
            <input
              className={`login-input ${errors.birthday ? 'error' : ''}`}
              id='birthday'
              type='date'
              value={formData.birthday}
              onChange={handleInputChange}
            />
            {errors.birthday && (
              <span className='error-message'>{errors.birthday}</span>
            )}

            <label className='login-label' htmlFor='gender'>
              Gender
            </label>
            <select
              className={`login-input ${errors.gender ? 'error' : ''}`}
              id='gender'
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value=''>Select your gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Other'>Other</option>
              <option value='Prefer-not-to-say'>Prefer not to say</option>
            </select>
            {errors.gender && (
              <span className='error-message'>{errors.gender}</span>
            )}

            <label className='login-label' htmlFor='mobileNumber'>
              Mobile Number
            </label>
            <input
              className={`login-input ${errors.mobileNumber ? 'error' : ''}`}
              id='mobileNumber'
              type='tel'
              placeholder='+63 912 345 6789'
              value={formData.mobileNumber}
              onChange={handleInputChange}
            />
            {errors.mobileNumber && (
              <span className='error-message'>{errors.mobileNumber}</span>
            )}

            <label className='login-label' htmlFor='password'>
              Password
            </label>
            <div className='login-password'>
              <input
                className={`login-input ${errors.password ? 'error' : ''}`}
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type='button'
                className={`password-toggle ${showPassword ? 'visible' : 'hidden'}`}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.password && (
              <span className='error-message'>{errors.password}</span>
            )}

            <label className='login-label' htmlFor='confirmPassword'>
              Confirm Password
            </label>
            <div className='login-password'>
              <input
                className={`login-input ${errors.confirmPassword ? 'error' : ''}`}
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm your password'
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type='button'
                className={`password-toggle ${showConfirmPassword ? 'visible' : 'hidden'}`}
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className='error-message'>{errors.confirmPassword}</span>
            )}

            <div className='terms-container'>
              <label className='terms-checkbox'>
                <input
                  type='checkbox'
                  checked={termsAccepted}
                  onChange={handleCheckboxChange}
                />
                <span className='checkmark'></span>I agree to the{' '}
                <a href='#' className='terms-link'>
                  Terms and Conditions
                </a>
              </label>
              {errors.terms && (
                <span className='error-message'>{errors.terms}</span>
              )}
            </div>

            <div className='terms-container'>
              <label className='terms-checkbox'>
                <input
                  type='checkbox'
                  checked={privacyAccepted}
                  onChange={handlePrivacyChange}
                />
                <span className='checkmark'></span>I agree to the{' '}
                <a href='#' className='terms-link'>
                  Privacy Policy
                </a>
              </label>
              {errors.privacy && (
                <span className='error-message'>{errors.privacy}</span>
              )}
            </div>

            <button className='login-btn' type='submit'>
              Register
            </button>
            <p className='login-text'>
              Already have an Okie-Doc+ account? <a href='/login'>Login</a>
            </p>
            <p className='login-text'>
              Are you a specialist?{' '}
              <a href='/login?register=true&specialist=true'>
                Register as a specialist
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
