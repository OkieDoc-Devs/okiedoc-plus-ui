import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Users, Lock } from 'lucide-react';
import RegistrationHeader from './RegistrationHeader';
import './FamilyRegistration.css';

const FamilyRegistration = () => {
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
              <div className="family-reg-step-number">1</div>
              <span className="family-reg-step-label">Account Holder</span>
            </div>
            <div className="family-reg-step-divider"></div>
            <div className="family-reg-step-item">
              <div className="family-reg-step-number inactive">2</div>
              <span className="family-reg-step-label inactive">Family Members</span>
            </div>
          </div>

          <div className="family-reg-card">
            <h3 className="family-reg-card-title">
              Primary Account Holder
            </h3>
            
            <form className="family-reg-form">
              <div>
                <label className="family-reg-label">First Name <span>*</span></label>
                <input 
                  id="firstName"
                  type="text" 
                  placeholder="Juan" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="family-reg-input"
                />
              </div>
              <div>
                <label className="family-reg-label">Last Name <span>*</span></label>
                <input 
                  id="lastName"
                  type="text" 
                  placeholder="Dela Cruz" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="family-reg-input"
                />
              </div>
              <div className="family-reg-form-group full-width">
                <label className="family-reg-label">Email Address <span>*</span></label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="juan.delacruz@email.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className="family-reg-input"
                />
              </div>
              <div className="family-reg-form-group full-width">
                <label className="family-reg-label">Mobile Number <span>*</span></label>
                <input 
                  id="mobileNumber"
                  type="tel" 
                  placeholder="+63 912 345 6789" 
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="family-reg-input"
                />
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
                    className="family-reg-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="family-reg-password-toggle"
                  >
                    {showPassword ? <FaEye size={22} /> : <FaEyeSlash size={22} />}
                  </button>
                </div>
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
                    className="family-reg-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="family-reg-password-toggle"
                  >
                    {showConfirmPassword ? <FaEye size={22} /> : <FaEyeSlash size={22} />}
                  </button>
                </div>
              </div>
              <div className="family-reg-form-group full-width">
                <button 
                  type="button"
                  className="family-reg-submit-btn"
                >
                  Continue to Family Members
                </button>
              </div>
            </form>
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