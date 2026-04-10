import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import './RegistrationOptions.css';

const RegistrationHeader = ({ backLabel = 'Back to Home', backPath = '/' }) => {
  const navigate = useNavigate();

  return (
    <header className="options-header">
      <div className="header-left">
        <div className="header-brand-icon" aria-hidden="true">
          <Stethoscope size={16} color="#ffffff" />
        </div>
        <span className="header-brand-text">OkieDoc+</span>
      </div>
      <button className="back-to-home" onClick={() => navigate(backPath)}>
        <ArrowLeft size={16} />
        {backLabel}
      </button>
    </header>
  );
};

export default RegistrationHeader;