import React from 'react';
import "../css/PatientDashboard.css";
import PatientLayout from './PatientLayout';
import { FaFileAlt, FaFlask } from 'react-icons/fa';

const LabResults = () => {
  return (
    <PatientLayout pageTitle="Lab Results" pageSubtitle="Check your test results and reports">
      <div className="patient-page-content">
        <h2>Lab Results</h2>
      <div className="patient-lab-results-section">
        <div className="patient-lab-result-card">
          <h3>Recent Lab Tests</h3>
          <div className="patient-lab-result-item">
            <FaFlask className="patient-result-icon" />
            <div className="patient-result-info">
              <span className="patient-result-name">Complete Blood Count (CBC)</span>
              <span className="patient-result-date">April 20, 2024</span>
            </div>
            <span className="patient-result-status patient-not-available">Not Available Yet</span>
          </div>
          <div className="patient-lab-result-item">
            <FaFileAlt className="patient-result-icon" />
            <div className="patient-result-info">
              <span className="patient-result-name">Chest X-Ray</span>
              <span className="patient-result-date">April 20, 2024</span>
            </div>
            <span className="patient-result-status patient-available">View Result</span>
          </div>
          <div className="patient-lab-result-item">
            <FaFlask className="patient-result-icon" />
            <div className="patient-result-info">
              <span className="patient-result-name">Urinalysis</span>
              <span className="patient-result-date">April 20, 2024</span>
            </div>
            <span className="patient-result-status patient-not-available">Not Available Yet</span>
          </div>
          <div className="patient-lab-result-item">
            <FaFileAlt className="patient-result-icon" />
            <div className="patient-result-info">
              <span className="patient-result-name">Electrocardiogram (ECG)</span>
              <span className="patient-result-date">April 20, 2024</span>
            </div>
            <span className="patient-result-status patient-available">View Result</span>
          </div>
        </div>
      </div>
      </div>
    </PatientLayout>
  );
};

export default LabResults;
