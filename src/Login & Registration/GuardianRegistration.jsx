import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Baby, Lock } from 'lucide-react';
import RegistrationHeader from './RegistrationHeader';
import './GuardianRegistration.css';

const GuardianRegistration = () => {
  const navigate = useNavigate();
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

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <>
      <RegistrationHeader backLabel='Back to Options' backPath='/registration' />

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
              <div className="guardian-reg-step-number">1</div>
              <span className="guardian-reg-step-label">Guardian Info</span>
            </div>
            <div className="guardian-reg-step-divider"></div>
            <div className="guardian-reg-step-item">
              <div className="guardian-reg-step-number inactive">2</div>
              <span className="guardian-reg-step-label inactive">Child Details</span>
            </div>
          </div>

          <div className="guardian-reg-card">
            <h3 className="guardian-reg-card-title">
              Guardian Information
            </h3>
            
            <form className="guardian-reg-form">
              <div>
                <label className="guardian-reg-label">First Name <span>*</span></label>
                <input 
                  id="firstName"
                  type="text" 
                  placeholder="Juan" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="guardian-reg-input"
                />
              </div>
              <div>
                <label className="guardian-reg-label">Last Name <span>*</span></label>
                <input 
                  id="lastName"
                  type="text" 
                  placeholder="Dela Cruz" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="guardian-reg-input"
                />
              </div>
              <div className="guardian-reg-form-group full-width">
                <label className="guardian-reg-label">Email Address <span>*</span></label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="juan.delacruz@email.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className="guardian-reg-input"
                />
              </div>
              <div className="guardian-reg-form-group full-width">
                <label className="guardian-reg-label">Mobile Number <span>*</span></label>
                <input 
                  id="mobileNumber"
                  type="tel" 
                  placeholder="+63 912 345 6789" 
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="guardian-reg-input"
                />
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
                    className="guardian-reg-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="guardian-reg-password-toggle"
                  >
                    {showPassword ? <FaEye size={22} /> : <FaEyeSlash size={22} />}
                  </button>
                </div>
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
                    className="guardian-reg-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="guardian-reg-password-toggle"
                  >
                    {showConfirmPassword ? <FaEye size={22} /> : <FaEyeSlash size={22} />}
                  </button>
                </div>
              </div>
              <div className="guardian-reg-form-group full-width">
                <button 
                  type="button"
                  className="guardian-reg-submit-btn"
                >
                  Continue to Child Details
                </button>
              </div>
            </form>
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