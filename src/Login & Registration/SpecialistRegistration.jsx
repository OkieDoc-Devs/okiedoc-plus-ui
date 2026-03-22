import './auth.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { usePSGC } from '../hooks/usePSGC';
import { apiRequest } from '../api/apiClient';

export default function SpecialistRegistration() {
  const navigate = useNavigate();
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
    primarySpecialty: '',
    subSpecialties: '',
    licenseNumber: '',
    prcExpiryDate: '',
    s2Number: '',
    ptrNumber: '',
    mobileNumber: '',
    barangay: '',
    city: 'City of Naga',
    province: 'Camarines Sur',
    region: 'Bicol Region',
    zipCode: '',
    addressLine1: '',
    addressLine2: '',
  });
  const [eSignatureFile, setESignatureFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Set default location and fetch provinces and cities on component mount
  useEffect(() => {
    const bicolRegion = regions.find((r) => r.name === 'Bicol Region');
    if (bicolRegion) {
      fetchProvinces(bicolRegion.code);
    }
  }, [regions, fetchProvinces]);

  useEffect(() => {
    const camarinesSur = provinces.find((p) => p.name === 'Camarines Sur');
    if (camarinesSur) {
      fetchCities(camarinesSur.code);
    }
  }, [provinces, fetchCities]);

  useEffect(() => {
    const nagaCity = cities.find(
      (c) => c.name === 'City of Naga' || c.name === 'Naga',
    );
    if (nagaCity) {
      fetchBarangays(nagaCity.code);
    }
  }, [cities, fetchBarangays]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let filteredValue = value;

    // Apply character restrictions
    if (['firstName', 'lastName', 'middleName'].includes(id)) {
      filteredValue = value.replace(/[^a-zA-Z\s-]/g, '');
    } else if (id === 'mobileNumber') {
      filteredValue = value.replace(/[^0-9+]/g, '');
    } else if (['addressLine1', 'addressLine2'].includes(id)) {
      filteredValue = value.replace(/[^a-zA-Z0-9\s,]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [id]: filteredValue,
    }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.primarySpecialty.trim())
      newErrors.primarySpecialty = 'Medical specialty is required';
    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = 'License number is required';
    if (!formData.mobileNumber.trim())
      newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('firstName', formData.firstName);
      payload.append('lastName', formData.lastName);
      payload.append('middleName', formData.middleName || '');
      payload.append('email', formData.email);
      payload.append('mobileNumber', formData.mobileNumber);
      payload.append('password', formData.password);
      payload.append('licenseNumber', formData.licenseNumber);
      payload.append('primarySpecialty', formData.primarySpecialty);
      payload.append('subSpecialties', formData.subSpecialties || '');
      if (formData.prcExpiryDate)
        payload.append('prcExpiryDate', formData.prcExpiryDate);
      if (formData.s2Number) payload.append('s2Number', formData.s2Number);
      if (formData.ptrNumber) payload.append('ptrNumber', formData.ptrNumber);
      if (formData.barangay) payload.append('barangay', formData.barangay);
      if (formData.city) payload.append('city', formData.city);
      if (formData.province) payload.append('province', formData.province);
      if (formData.region) payload.append('region', formData.region);
      if (formData.zipCode) payload.append('zipCode', formData.zipCode);
      if (formData.addressLine1)
        payload.append('addressLine1', formData.addressLine1);
      if (formData.addressLine2)
        payload.append('addressLine2', formData.addressLine2);
      if (eSignatureFile) payload.append('eSignature', eSignatureFile);

      const result = await apiRequest('/api/v1/specialist/register', {
        method: 'POST',
        body: payload,
      });

      if (result.success || result.message) {
        setSuccess(
          'Registration successful! Your application to become a specialist has been submitted.',
        );
        window.scrollTo(0, 0);
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          email: '',
          password: '',
          confirmPassword: '',
          primarySpecialty: '',
          subSpecialties: '',
          licenseNumber: '',
          prcExpiryDate: '',
          s2Number: '',
          ptrNumber: '',
          mobileNumber: '',
          barangay: '',
          city: '',
          province: '',
          region: '',
          zipCode: '',
          addressLine1: '',
          addressLine2: '',
        });
        setESignatureFile(null);
      } else {
        setErrors({ email: result.message || 'Registration failed.' });
        // Handle specific error structure from backend if needed
        if (result.emailAlreadyInUse) {
          setErrors({
            email:
              result.emailAlreadyInUse.message ||
              'Email already in use/Application submitted.',
          });
        }
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ email: 'Network error. Please try again later.' });
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
              onClick={() => navigate('/specialist-login')}
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
          <h2 className='login-title'>Specialist Registration</h2>
          <p className='login-subtitle'>
            Join as a verified specialist and start helping patients.
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
              maxLength={150}
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
              maxLength={150}
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
              maxLength={150}
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

            <label className='login-label' htmlFor='primarySpecialty'>
              Medical Specialty
            </label>
            <input
              className={`login-input ${errors.primarySpecialty ? 'error' : ''}`}
              id='primarySpecialty'
              type='text'
              placeholder='e.g. Cardiology, Pediatrics'
              value={formData.primarySpecialty}
              onChange={handleInputChange}
            />
            {errors.primarySpecialty && (
              <span className='error-message'>{errors.primarySpecialty}</span>
            )}

            <label className='login-label' htmlFor='subSpecialties'>
              Sub-specialties (Optional, comma-separated)
            </label>
            <input
              className='login-input'
              id='subSpecialties'
              type='text'
              placeholder='e.g. Interventional, Electrophysiology'
              value={formData.subSpecialties}
              onChange={handleInputChange}
            />

            <label className='login-label' htmlFor='licenseNumber'>
              License Number
            </label>
            <input
              className={`login-input ${errors.licenseNumber ? 'error' : ''}`}
              id='licenseNumber'
              type='text'
              placeholder='Enter your license number'
              value={formData.licenseNumber}
              onChange={handleInputChange}
            />
            {errors.licenseNumber && (
              <span className='error-message'>{errors.licenseNumber}</span>
            )}

            <label className='login-label' htmlFor='prcExpiryDate'>
              PRC Expiry Date (Optional)
            </label>
            <input
              className='login-input'
              id='prcExpiryDate'
              type='date'
              value={formData.prcExpiryDate}
              onChange={handleInputChange}
            />

            <label className='login-label' htmlFor='s2Number'>
              S2 License Number (Optional)
            </label>
            <input
              className='login-input'
              id='s2Number'
              type='text'
              placeholder='For prescribing dangerous drugs'
              value={formData.s2Number}
              onChange={handleInputChange}
            />

            <label className='login-label' htmlFor='ptrNumber'>
              PTR Number (Optional)
            </label>
            <input
              className='login-input'
              id='ptrNumber'
              type='text'
              placeholder='Professional Tax Receipt No.'
              value={formData.ptrNumber}
              onChange={handleInputChange}
            />

            <label className='login-label' htmlFor='eSignature'>
              E-Signature Upload (Optional)
            </label>
            <input
              className={`login-input ${errors.eSignature ? 'error' : ''}`}
              id='eSignature'
              type='file'
              accept='image/png'
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type !== 'image/png') {
                  setErrors((prev) => ({
                    ...prev,
                    eSignature: 'Only PNG files are accepted for e-signature',
                  }));
                  setESignatureFile(null);
                  e.target.value = ''; // Reset the input
                } else {
                  setErrors((prev) => ({ ...prev, eSignature: '' }));
                  setESignatureFile(file);
                }
              }}
              style={{ padding: '10px' }}
            />
            {errors.eSignature && (
              <span className='error-message'>{errors.eSignature}</span>
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
              maxLength={13}
            />
            {errors.mobileNumber && (
              <span className='error-message'>{errors.mobileNumber}</span>
            )}

            <label className='login-label' htmlFor='region'>
              Region
            </label>
            <select
              className={`login-input ${errors.region ? 'error' : ''}`}
              id='region'
              value={formData.region}
              onChange={(e) => {
                const selectedRegion = regions.find(
                  (r) => r.name === e.target.value,
                );
                handleInputChange(e);
                fetchProvinces(selectedRegion?.code);
                setFormData((prev) => ({
                  ...prev,
                  province: '',
                  city: '',
                  barangay: '',
                }));
              }}
              disabled
            >
              <option value=''>Select Region</option>
              {regions.map((r) => (
                <option key={r.code} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.region && (
              <span className='error-message'>{errors.region}</span>
            )}

            <label className='login-label' htmlFor='province'>
              Province
            </label>
            <select
              className={`login-input ${errors.province ? 'error' : ''}`}
              id='province'
              value={formData.province}
              onChange={(e) => {
                const selectedProvince = provinces.find(
                  (p) => p.name === e.target.value,
                );
                handleInputChange(e);
                fetchCities(selectedProvince?.code);
                setFormData((prev) => ({ ...prev, city: '', barangay: '' }));
              }}
              disabled
            >
              <option value=''>Select Province</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <span className='error-message'>{errors.province}</span>
            )}

            <label className='login-label' htmlFor='city'>
              City / Municipality
            </label>
            <select
              className={`login-input ${errors.city ? 'error' : ''}`}
              id='city'
              value={formData.city}
              onChange={(e) => {
                const selectedCity = cities.find(
                  (c) => c.name === e.target.value,
                );
                handleInputChange(e);
                fetchBarangays(selectedCity?.code);
                setFormData((prev) => ({ ...prev, barangay: '' }));
              }}
              disabled
            >
              <option value=''>Select City / Municipality</option>
              {cities.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.city && (
              <span className='error-message'>{errors.city}</span>
            )}

            <label className='login-label' htmlFor='barangay'>
              Barangay
            </label>
            <select
              className={`login-input ${errors.barangay ? 'error' : ''}`}
              id='barangay'
              value={formData.barangay}
              onChange={handleInputChange}
              disabled={!formData.city}
            >
              <option value=''>Select Barangay</option>
              {barangays.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.barangay && (
              <span className='error-message'>{errors.barangay}</span>
            )}

            <label className='login-label' htmlFor='addressLine1'>
              Address Line 1 (House No., Street)
            </label>
            <input
              className={`login-input ${errors.addressLine1 ? 'error' : ''}`}
              id='addressLine1'
              type='text'
              placeholder='Enter your address line 1'
              value={formData.addressLine1}
              onChange={handleInputChange}
              maxLength={150}
            />
            {errors.addressLine1 && (
              <span className='error-message'>{errors.addressLine1}</span>
            )}

            <label className='login-label' htmlFor='addressLine2'>
              Address Line 2 (Apartment, Suite, Unit)
            </label>
            <input
              className='login-input'
              id='addressLine2'
              type='text'
              placeholder='Enter your address line 2 (optional)'
              value={formData.addressLine2}
              onChange={handleInputChange}
              maxLength={150}
            />

            <label className='login-label' htmlFor='zipCode'>
              Zip Code
            </label>
            <input
              className={`login-input ${errors.zipCode ? 'error' : ''}`}
              id='zipCode'
              type='text'
              placeholder='Enter your zip code'
              value={formData.zipCode}
              onChange={handleInputChange}
              maxLength={10}
            />
            {errors.zipCode && (
              <span className='error-message'>{errors.zipCode}</span>
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
                onClick={() => setShowPassword(!showPassword)}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className='error-message'>{errors.confirmPassword}</span>
            )}

            <button className='login-btn' type='submit'>
              Register
            </button>
            <p className='login-text'>
              Already a specialist?{' '}
              <a className='specialist-link' href='/specialist-login'>
                Login here
              </a>
            </p>
            <p className='login-text'>
              Not a specialist?{' '}
              <a className='specialist-link' href='/registration'>
                Register as a patient
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
