import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEyeOff, IconAlertCircle, IconCheck, IconX, IconPlus, IconCircleCheck } from '@tabler/icons-react';
import { Baby, Lock, Calendar } from 'lucide-react';
import RegistrationHeader from './RegistrationHeader';
import './GuardianRegistration.css';
import './PasswordStrength.css';

const GuardianRegistration = () => {
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

  const [children, setChildren] = useState([
    { id: 1, firstName: '', lastName: '', birthday: '', gender: '', isPhilHealth: false }
  ]);

  const [errors, setErrors] = useState({});
  const [childErrors, setChildErrors] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
        setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleChildInputChange = (index, field, value) => {
    const updatedChildren = [...children];
    updatedChildren[index][field] = value;
    setChildren(updatedChildren);
    
    if (childErrors[`${index}-${field}`]) {
      setChildErrors(prev => {
        const next = { ...prev };
        delete next[`${index}-${field}`];
        return next;
      });
    }
  };

  const addChild = () => {
    setChildren([...children, { 
      id: children.length + 1, 
      firstName: '', 
      lastName: '', 
      birthday: '', 
      gender: '', 
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
    if (!formData.firstName.trim()) newErrors.firstName = 'Guardian first name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Guardian last name is required';
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

  const validateChildren = () => {
    const newErrors = {};
    children.forEach((child, index) => {
      if (!child.firstName.trim()) newErrors[`${index}-firstName`] = 'First name is required';
      if (!child.lastName.trim()) newErrors[`${index}-lastName`] = 'Last name is required';
      if (!child.birthday) newErrors[`${index}-birthday`] = 'Date of birth is required';
      if (!child.gender) newErrors[`${index}-gender`] = 'Gender is required';
    });
    setChildErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const removeChild = (index) => {
    if (children.length > 1) {
      const updatedChildren = children.filter((_, i) => i !== index);
      setChildren(updatedChildren);
      
      // Clear associated errors
      const updatedErrors = { ...childErrors };
      Object.keys(updatedErrors).forEach(key => {
        if (key.startsWith(`${index}-`)) {
          delete updatedErrors[key];
        }
      });
      setChildErrors(updatedErrors);
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleCreateAccount = () => {
    if (validateChildren()) {
      console.log("Account Creation Requested", { guardian: formData, children });
      // Final submission logic would go here
    }
  };

  return (
    <>
      <RegistrationHeader 
        backLabel={step === 1 ? 'Back to Options' : 'Back to Guardian Info'} 
        backPath={step === 1 ? '/registration' : null} 
        onBackClick={step === 2 ? () => setStep(1) : null}
      />

      <div className="guardian-reg-page-wrapper">
        <div className="guardian-reg-outer-container">
          <div className="guardian-reg-header-section">
            <div className="guardian-reg-icon-container">
              <Baby size={48} color="#10b981" />
            </div>
            <h1 className="guardian-reg-title">Guardian Registration</h1>
            <p className="guardian-reg-subtitle">Register as a guardian to manage healthcare for your children under 18</p>
          </div>

          <div className="guardian-reg-stepper">
            <div className="guardian-reg-step-item">
              <div className={`guardian-reg-step-number ${step > 1 ? 'completed' : ''}`}>
                {step > 1 ? <IconCircleCheck size={24} /> : '1'}
              </div>
              <span className="guardian-reg-step-label">Guardian Info</span>
            </div>
            <div className={`guardian-reg-step-divider ${step > 1 ? 'active' : ''}`}></div>
            <div className="guardian-reg-step-item">
              <div className={`guardian-reg-step-number ${step < 2 ? 'inactive' : ''}`}>2</div>
              <span className={`guardian-reg-step-label ${step < 2 ? 'inactive' : ''}`}>Child Details</span>
            </div>
          </div>

          <div className="guardian-reg-card">
            {step === 1 ? (
              <>
                <h3 className="guardian-reg-card-title">Guardian Information</h3>
                <form className="guardian-reg-form">
                  <div className="guardian-reg-field-container">
                    <label className="guardian-reg-label">First Name <span>*</span></label>
                    <input 
                      id="firstName"
                      type="text" 
                      placeholder="Juan" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`guardian-reg-input ${errors.firstName ? 'input-error' : ''}`}
                    />
                    {errors.firstName && (
                      <div className="guardian-error-msg">
                        <IconAlertCircle size={16} /> {errors.firstName}
                      </div>
                    )}
                  </div>
                  <div className="guardian-reg-field-container">
                    <label className="guardian-reg-label">Last Name <span>*</span></label>
                    <input 
                      id="lastName"
                      type="text" 
                      placeholder="Dela Cruz" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`guardian-reg-input ${errors.lastName ? 'input-error' : ''}`}
                    />
                    {errors.lastName && (
                      <div className="guardian-error-msg">
                        <IconAlertCircle size={16} /> {errors.lastName}
                      </div>
                    )}
                  </div>
                  <div className="guardian-reg-form-group full-width">
                    <label className="guardian-reg-label">Email Address <span>*</span></label>
                    <input 
                      id="email"
                      type="email" 
                      placeholder="juan.delacruz@email.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`guardian-reg-input ${errors.email ? 'input-error' : ''}`}
                    />
                    {errors.email && (
                      <div className="guardian-error-msg">
                        <IconAlertCircle size={16} /> {errors.email}
                      </div>
                    )}
                  </div>
                  <div className="guardian-reg-form-group full-width">
                    <label className="guardian-reg-label">Mobile Number <span>*</span></label>
                    <input 
                      id="mobileNumber"
                      type="tel" 
                      placeholder="+63 912 345 6789" 
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className={`guardian-reg-input ${errors.mobileNumber ? 'input-error' : ''}`}
                    />
                    {errors.mobileNumber && (
                      <div className="guardian-error-msg">
                        <IconAlertCircle size={16} /> {errors.mobileNumber}
                      </div>
                    )}
                  </div>
                  <div className="guardian-reg-form-group full-width">
                    <label className="guardian-reg-label">Password <span>*</span></label>
                    <div className="guardian-reg-password-wrapper">
                      <input 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter a strong password" 
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`guardian-reg-input ${errors.password ? 'input-error' : ''}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="guardian-reg-password-toggle"
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
                      <div className="guardian-error-msg">
                        <IconAlertCircle size={16} /> {errors.password}
                      </div>
                    )}
                  </div>
                  <div className="guardian-reg-form-group full-width">
                    <label className="guardian-reg-label">Confirm Password <span>*</span></label>
                    <div className="guardian-reg-password-wrapper">
                      <input 
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Re-enter your password" 
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`guardian-reg-input ${errors.confirmPassword ? 'input-error' : ''}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="guardian-reg-password-toggle"
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
                      <div className="guardian-error-msg">
                        <IconAlertCircle size={16} /> {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                  <div className="guardian-reg-form-group full-width">
                    <button 
                      type="button"
                      className="guardian-reg-submit-btn"
                      onClick={handleContinue}
                    >
                      Continue to Child Details
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="guardian-reg-card-title">Child Information</h3>
                <div className="child-info-notice">
                  This account will be managed by the parent/guardian. You can add multiple children to this account.
                </div>

                <div className="children-list">
                  {children.map((child, index) => (
                    <div key={child.id} className="child-form-section">
                      <div className="child-form-header">
                        <h4 className="child-form-section-title">Child {index + 1}</h4>
                        {children.length > 1 && (
                          <button 
                            type="button" 
                            className="remove-child-btn" 
                            onClick={() => removeChild(index)}
                          >
                            <IconX size={20} color="#ef4444" />
                          </button>
                        )}
                      </div>
                      <div className="child-reg-grid">
                        <div className="child-reg-field">
                          <label className="guardian-reg-label">First Name <span>*</span></label>
                          <input 
                            type="text" 
                            placeholder="Maria" 
                            className={`guardian-reg-input ${childErrors[`${index}-firstName`] ? 'input-error' : ''}`}
                            value={child.firstName}
                            onChange={(e) => handleChildInputChange(index, 'firstName', e.target.value)}
                          />
                          {childErrors[`${index}-firstName`] && (
                            <div className="guardian-error-msg">
                              <IconAlertCircle size={16} /> {childErrors[`${index}-firstName`]}
                            </div>
                          )}
                        </div>
                        <div className="child-reg-field">
                          <label className="guardian-reg-label">Last Name <span>*</span></label>
                          <input 
                            type="text" 
                            placeholder="Dela Cruz" 
                            className={`guardian-reg-input ${childErrors[`${index}-lastName`] ? 'input-error' : ''}`}
                            value={child.lastName}
                            onChange={(e) => handleChildInputChange(index, 'lastName', e.target.value)}
                          />
                          {childErrors[`${index}-lastName`] && (
                            <div className="guardian-error-msg">
                              <IconAlertCircle size={16} /> {childErrors[`${index}-lastName`]}
                            </div>
                          )}
                        </div>
                        <div className="child-reg-field">
                          <label className="guardian-reg-label">Date of Birth <span>*</span></label>
                          <div className="child-input-wrapper">
                            <input 
                              type="text" 
                              placeholder="dd/mm/yyyy" 
                              className={`guardian-reg-input ${childErrors[`${index}-birthday`] ? 'input-error' : ''}`}
                              onFocus={(e) => e.target.type = 'date'}
                              onBlur={(e) => e.target.type = 'text'}
                              value={child.birthday}
                              onChange={(e) => handleChildInputChange(index, 'birthday', e.target.value)}
                            />
                            <Calendar size={18} className="child-input-icon" />
                          </div>
                          {childErrors[`${index}-birthday`] && (
                            <div className="guardian-error-msg">
                              <IconAlertCircle size={16} /> {childErrors[`${index}-birthday`]}
                            </div>
                          )}
                        </div>
                        <div className="child-reg-field">
                          <label className="guardian-reg-label">Gender <span>*</span></label>
                          <select 
                            className={`guardian-reg-select ${childErrors[`${index}-gender`] ? 'input-error' : ''}`}
                            value={child.gender}
                            onChange={(e) => handleChildInputChange(index, 'gender', e.target.value)}
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {childErrors[`${index}-gender`] && (
                            <div className="guardian-error-msg">
                              <IconAlertCircle size={16} /> {childErrors[`${index}-gender`]}
                            </div>
                          )}
                        </div>
                        <div className="child-reg-field full-width">
                          <div className="philhealth-member-card">
                            <input 
                              type="checkbox" 
                              id={`philhealth-${index}`}
                              checked={child.isPhilHealth}
                              onChange={(e) => handleChildInputChange(index, 'isPhilHealth', e.target.checked)}
                            />
                            <label htmlFor={`philhealth-${index}`}>PhilHealth Member</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="add-another-child-btn-wrapper">
                  <button className="add-another-child-btn" onClick={addChild}>
                    <IconPlus size={20} /> Add Another Child
                  </button>
                </div>

                <div className="child-reg-actions">
                  <button className="child-reg-back-btn" onClick={() => setStep(1)}>Back</button>
                  <button className="child-reg-submit-btn" onClick={handleCreateAccount}>Create Account</button>
                </div>
              </>
            )}
          </div>
          <div className="guardian-reg-footer">
            <Lock size={16} /> Your information is secure and encrypted
          </div>
        </div>
      </div>
    </>
  );
};

export default GuardianRegistration;