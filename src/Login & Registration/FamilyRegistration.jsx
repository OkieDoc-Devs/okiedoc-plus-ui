import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEyeOff, IconAlertCircle, IconCheck, IconX, IconPlus, IconCircleCheck } from '@tabler/icons-react';
import { Users, Lock, Calendar } from 'lucide-react';
import RegistrationHeader from './RegistrationHeader';
import './FamilyRegistration.css';
import './PasswordStrength.css';

const FamilyRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, firstName: '', lastName: '', birthday: '', gender: '', relationship: '', isPhilHealth: false }
  ]);

  const [errors, setErrors] = useState({});
  const [memberErrors, setMemberErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
        setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleMemberInputChange = (index, field, value) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index][field] = value;
    setFamilyMembers(updatedMembers);
    
    if (memberErrors[`${index}-${field}`]) {
      const newMemberErrors = { ...memberErrors };
      delete newMemberErrors[`${index}-${field}`];
      setMemberErrors(newMemberErrors);
    }
  };

  const removeMember = (index) => {
    if (familyMembers.length > 1) {
      const updatedMembers = familyMembers.filter((_, i) => i !== index);
      setFamilyMembers(updatedMembers);
      setMemberErrors({}); // Reset member errors since indices changed
    }
  };

  const addMember = () => {
    setFamilyMembers([...familyMembers, { 
      id: Date.now(), 
      firstName: '', 
      lastName: '', 
      birthday: '', 
      gender: '', 
      relationship: '',
      isPhilHealth: false 
    }]);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score, label: 'Medium', color: '#f59e0b' };
    return { score, label: 'Strong', color: '#22c55e' };
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'Contains uppercase letter', regex: /[A-Z]/ },
    { label: 'Contains lowercase letter', regex: /[a-z]/ },
    { label: 'Contains number', regex: /[0-9]/ },
    { label: 'Contains special character', regex: /[^A-Za-z0-9]/ },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    
    const strength = getPasswordStrength(formData.password);
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (strength.score < 5) {
      newErrors.password = 'Please meet all password requirements';
    }

    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMembers = () => {
    const newErrors = {};
    familyMembers.forEach((member, index) => {
      if (!member.firstName.trim()) newErrors[`${index}-firstName`] = 'First name is required';
      if (!member.lastName.trim()) newErrors[`${index}-lastName`] = 'Last name is required';
      if (!member.birthday) newErrors[`${index}-birthday`] = 'Birthday is required';
      if (!member.gender) newErrors[`${index}-gender`] = 'Gender is required';
      if (!member.relationship) newErrors[`${index}-relationship`] = 'Relationship is required';
    });
    setMemberErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleCreateAccount = () => {
    if (validateMembers()) {
      console.log("Family Account Creation Requested", { accountHolder: formData, familyMembers });
    }
  };

  return (
    <>
      <RegistrationHeader 
        backLabel={step === 1 ? 'Back to Options' : 'Back to Account Holder'} 
        backPath={step === 1 ? '/registration' : null} 
        onBackClick={step === 2 ? () => setStep(1) : null}
      />

      <div className="family-reg-page-wrapper">
        <div className="family-reg-outer-container">
          <div className="family-reg-header-section">
            <div className="family-reg-icon-container">
              <Users size={48} color="#8b5cf6" />
            </div>
            <h1 className="family-reg-title">Family Registration</h1>
            <p className="family-reg-subtitle">Manage healthcare for your entire family in one centralized account</p>
          </div>

          <div className="family-reg-stepper">
            <div className="family-reg-step-item">
              <div className={`family-reg-step-number ${step > 1 ? 'completed' : ''}`}>
                {step > 1 ? <IconCircleCheck size={24} /> : '1'}
              </div>
              <span className="family-reg-step-label">Account Holder</span>
            </div>
            <div className={`family-reg-step-divider ${step > 1 ? 'active' : ''}`}></div>
            <div className="family-reg-step-item">
              <div className={`family-reg-step-number ${step < 2 ? 'inactive' : ''}`}>2</div>
              <span className={`family-reg-step-label ${step < 2 ? 'inactive' : ''}`}>Family Members</span>
            </div>
          </div>

          <div className="family-reg-card">
            {step === 1 ? (
              <>
                <h3 className="family-reg-card-title">Primary Account Holder</h3>
                <form className="family-reg-form">
                  <div className="family-reg-field-container">
                    <label className="family-reg-label">First Name <span>*</span></label>
                    <input 
                      id="firstName"
                      type="text" 
                      placeholder="Juan" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`family-reg-input ${errors.firstName ? 'input-error' : ''}`}
                    />
                    {errors.firstName && (
                      <div className="family-error-msg">
                        <IconAlertCircle size={16} /> {errors.firstName}
                      </div>
                    )}
                  </div>
                  <div className="family-reg-field-container">
                    <label className="family-reg-label">Last Name <span>*</span></label>
                    <input 
                      id="lastName"
                      type="text" 
                      placeholder="Dela Cruz" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`family-reg-input ${errors.lastName ? 'input-error' : ''}`}
                    />
                    {errors.lastName && (
                      <div className="family-error-msg">
                        <IconAlertCircle size={16} /> {errors.lastName}
                      </div>
                    )}
                  </div>
                  <div className="family-reg-form-group full-width">
                    <label className="family-reg-label">Email Address <span>*</span></label>
                    <input 
                      id="email"
                      type="email" 
                      placeholder="juan.delacruz@email.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`family-reg-input ${errors.email ? 'input-error' : ''}`}
                    />
                    {errors.email && (
                      <div className="family-error-msg">
                        <IconAlertCircle size={16} /> {errors.email}
                      </div>
                    )}
                  </div>
                  <div className="family-reg-form-group full-width">
                    <label className="family-reg-label">Mobile Number <span>*</span></label>
                    <input 
                      id="mobileNumber"
                      type="tel" 
                      placeholder="+63 912 345 6789" 
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className={`family-reg-input ${errors.mobileNumber ? 'input-error' : ''}`}
                    />
                    {errors.mobileNumber && (
                      <div className="family-error-msg">
                        <IconAlertCircle size={16} /> {errors.mobileNumber}
                      </div>
                    )}
                  </div>
                  <div className="family-reg-form-group full-width">
                    <label className="family-reg-label">Password <span>*</span></label>
                    <div className="family-reg-password-wrapper">
                      <input 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter a strong password" 
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`family-reg-input ${errors.password ? 'input-error' : ''}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="family-reg-password-toggle"
                      >
                        {showPassword ? <IconEye size={22} /> : <IconEyeOff size={22} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="password-strength-container">
                        <div className="password-strength-header">
                          <span>Password strength:</span>
                          <span style={{ color: getPasswordStrength(formData.password).color }}>
                            {getPasswordStrength(formData.password).label}
                          </span>
                        </div>
                        <div className="password-strength-bars">
                          {[1, 2, 3, 4, 5].map((idx) => (
                            <div 
                              key={idx} 
                              className={`strength-bar ${idx <= getPasswordStrength(formData.password).score ? 'active' : ''}`}
                              style={{ backgroundColor: idx <= getPasswordStrength(formData.password).score ? getPasswordStrength(formData.password).color : '#e2e8f0' }}
                            />
                          ))}
                        </div>
                        <div className="password-requirements">
                          {passwordRequirements.map((req, idx) => {
                            const isMet = req.regex.test(formData.password);
                            return (
                              <div key={idx} className={`requirement-item ${isMet ? 'met' : 'unmet'}`}>
                                {isMet ? <IconCheck size={14} stroke={3} /> : <IconX size={14} stroke={3} />}
                                {req.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {errors.password && (
                      <div className="family-error-msg">
                        <IconAlertCircle size={16} /> {errors.password}
                      </div>
                    )}
                  </div>
                  <div className="family-reg-form-group full-width">
                    <label className="family-reg-label">Confirm Password <span>*</span></label>
                    <div className="family-reg-password-wrapper">
                      <input 
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Re-enter your password" 
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`family-reg-input ${errors.confirmPassword ? 'input-error' : ''}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="family-reg-password-toggle"
                      >
                        {showConfirmPassword ? <IconEye size={22} /> : <IconEyeOff size={22} />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className={`password-match-indicator ${formData.password === formData.confirmPassword ? 'match' : ''}`}>
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <IconCheck size={16} stroke={3} />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <IconX size={16} stroke={3} />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                    {errors.confirmPassword && (
                      <div className="family-error-msg">
                        <IconAlertCircle size={16} /> {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                  <div className="family-reg-form-group full-width">
                    <button 
                      type="button"
                      className="family-reg-submit-btn"
                      onClick={handleContinue}
                    >
                      Continue to Family Members
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="family-reg-card-title">Family Member Information</h3>
                <div className="family-info-notice">
                  Add details for each family member you wish to include in this account for easy consultation management.
                </div>

                <div className="family-list">
                  {familyMembers.map((member, index) => (
                    <div key={member.id} className="family-form-section">
                      <div className="member-form-header">
                        <h4 className="family-form-section-title">Member {index + 1}</h4>
                        {familyMembers.length > 1 && (
                          <button 
                            type="button" 
                            className="remove-member-btn" 
                            onClick={() => removeMember(index)}
                          >
                            <IconX size={20} color="#7c3aed" />
                          </button>
                        )}
                      </div>
                      <div className="family-reg-grid">
                        <div className="family-reg-field">
                          <label className="family-reg-label">First Name <span>*</span></label>
                          <input 
                            type="text" 
                            placeholder="Juan" 
                            className={`family-reg-input ${memberErrors[`${index}-firstName`] ? 'member-input-error' : ''}`}
                            value={member.firstName}
                            onChange={(e) => handleMemberInputChange(index, 'firstName', e.target.value)}
                          />
                          {memberErrors[`${index}-firstName`] && (
                            <div className="family-error-msg">
                              <IconAlertCircle size={16} /> {memberErrors[`${index}-firstName`]}
                            </div>
                          )}
                        </div>
                        <div className="family-reg-field">
                          <label className="family-reg-label">Last Name <span>*</span></label>
                          <input 
                            type="text" 
                            placeholder="Dela Cruz" 
                            className={`family-reg-input ${memberErrors[`${index}-lastName`] ? 'member-input-error' : ''}`}
                            value={member.lastName}
                            onChange={(e) => handleMemberInputChange(index, 'lastName', e.target.value)}
                          />
                          {memberErrors[`${index}-lastName`] && (
                            <div className="family-error-msg">
                              <IconAlertCircle size={16} /> {memberErrors[`${index}-lastName`]}
                            </div>
                          )}
                        </div>
                        <div className="family-reg-field">
                          <label className="family-reg-label">Date of Birth <span>*</span></label>
                          <div className="family-input-wrapper">
                            <input 
                              type="text" 
                              placeholder="dd/mm/yyyy" 
                              className={`family-reg-input ${memberErrors[`${index}-birthday`] ? 'member-input-error' : ''}`}
                              onFocus={(e) => e.target.type = 'date'}
                              onBlur={(e) => e.target.type = 'text'}
                              value={member.birthday}
                              onChange={(e) => handleMemberInputChange(index, 'birthday', e.target.value)}
                            />
                            <Calendar size={18} className="family-input-icon" />
                          </div>
                          {memberErrors[`${index}-birthday`] && (
                            <div className="family-error-msg">
                              <IconAlertCircle size={16} /> {memberErrors[`${index}-birthday`]}
                            </div>
                          )}
                        </div>
                        <div className="family-reg-field">
                          <label className="family-reg-label">Gender <span>*</span></label>
                          <select 
                            className={`family-reg-select ${memberErrors[`${index}-gender`] ? 'member-input-error' : ''}`}
                            value={member.gender}
                            onChange={(e) => handleMemberInputChange(index, 'gender', e.target.value)}
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {memberErrors[`${index}-gender`] && (
                            <div className="family-error-msg">
                              <IconAlertCircle size={16} /> {memberErrors[`${index}-gender`]}
                            </div>
                          )}
                        </div>
                        <div className="family-reg-field">
                          <label className="family-reg-label">Relationship <span>*</span></label>
                          <select 
                            className={`family-reg-select ${memberErrors[`${index}-relationship`] ? 'member-input-error' : ''}`}
                            value={member.relationship}
                            onChange={(e) => handleMemberInputChange(index, 'relationship', e.target.value)}
                          >
                            <option value="">Select relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Child">Child</option>
                            <option value="Parent">Parent</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Other">Other</option>
                          </select>
                          {memberErrors[`${index}-relationship`] && (
                            <div className="family-error-msg">
                              <IconAlertCircle size={16} /> {memberErrors[`${index}-relationship`]}
                            </div>
                          )}
                        </div>
                        <div className="family-reg-field full-width">
                          <div className="philhealth-member-card">
                            <input 
                              type="checkbox" 
                              id={`philhealth-${index}`}
                              checked={member.isPhilHealth}
                              onChange={(e) => handleMemberInputChange(index, 'isPhilHealth', e.target.checked)}
                            />
                            <label htmlFor={`philhealth-${index}`}>PhilHealth Member</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="add-another-member-btn-wrapper">
                  <button className="add-another-member-btn" onClick={addMember}>
                    <IconPlus size={20} /> Add Family Member
                  </button>
                </div>

                <div className="family-reg-actions">
                  <button className="family-reg-back-btn" onClick={() => setStep(1)}>Back</button>
                  <button className="family-reg-submit-btn" onClick={handleCreateAccount}>Create Account</button>
                </div>
              </>
            )}
          </div>
          <div className="family-reg-footer">
            <Lock size={16} /> Your information is secure and encrypted
          </div>
        </div>
      </div>
    </>
  );
};

export default FamilyRegistration;