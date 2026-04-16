import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Baby, Users, Stethoscope } from 'lucide-react';
import RegistrationHeader from './RegistrationHeader';
import './RegistrationOptions.css';

const RegistrationOptions = () => {
  const navigate = useNavigate();

  const options = [
    {
      id: 'myself',
      title: 'Myself (18+)',
      description: 'Create a personal account for yourself',
      icon: <User size={48} className="option-icon-inner" />,
      color: '#2563eb',
      path: '/registration-details'
    },
    {
      id: 'child',
      title: 'My Child (Below 18)',
      description: 'Register as a guardian for your child',
      icon: <Baby size={48} className="option-icon-inner" />,
      color: '#10b981',
      path: '/registration-child'
    },
    {
      id: 'family',
      title: 'A Family Member',
      description: 'Manage multiple family members in one account',
      icon: <Users size={48} className="option-icon-inner" />,
      color: '#8b5cf6',
      path: '/registration-family'
    }
  ];

  return (
    <div className="options-container">
      <RegistrationHeader backLabel="Back to Home" backPath="/" />

      <main className="options-main">
        <h1 className="options-title">Who is this account for?</h1>
        <p className="options-subtitle">Choose the option that best describes your situation</p>

        <div className="options-grid">
          {options.map((option) => (
            <div key={option.id} className="option-card" style={{ '--option-color': option.color }}>
              <div className="option-icon-wrapper" style={{ backgroundColor: option.color }}>
                {option.icon}
              </div>
              <h2 className="option-card-title">{option.title}</h2>
              <p className="option-card-description">{option.description}</p>
              <button 
                className="option-continue-btn"
                onClick={() => navigate(option.path)}
              >
                Continue
                <span className="option-continue-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          ))}
        </div>

        <div className="why-ask-card">
          <div className="why-ask-icon">
            <Stethoscope size={24} color="#fff" />
          </div>
          <div className="why-ask-content">
            <h3 className="why-ask-title">Why we ask this?</h3>
            <p className="why-ask-text">
              We need to ensure proper consent and guardianship for patients below 18 years old. For family accounts, you can manage multiple members and easily switch between profiles during consultations.
            </p>
          </div>
        </div>

        <div className="login-footer">
          Already have an account? <span className="login-link" onClick={() => navigate('/login')}>Login</span>
        </div>
      </main>
    </div>
  );
};

export default RegistrationOptions;