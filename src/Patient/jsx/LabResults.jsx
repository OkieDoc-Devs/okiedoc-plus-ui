import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFlask, FaInbox } from 'react-icons/fa';
import apiService from '../services/apiService';

const LabResults = () => {
  const [labResults, setLabResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLabResults();
  }, []);

  const loadLabResults = async () => {
    setIsLoading(true);
    try {
      const patientId = localStorage.getItem('patientId');
      const patientData = await apiService.getPatientData(patientId);
      setLabResults(patientData.labResults || []);
    } catch (error) {
      console.error('Failed to load lab results:', error);
      setLabResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1rem',
      color: '#666'
    }}>
      <FaInbox style={{ fontSize: '4rem', color: '#ddd', marginBottom: '1rem' }} />
      <h3 style={{ color: '#999', marginBottom: '0.5rem' }}>No Lab Results Yet</h3>
      <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
        Your lab results will appear here once they become available
      </p>
    </div>
  );

  return (
    <div className="patient-page-content">
      <h2>Lab Results</h2>
      <div className="patient-lab-results-section">
        <div className="patient-lab-result-card">
          <h3>Recent Lab Tests</h3>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              Loading lab results...
            </div>
          ) : labResults.length === 0 ? (
            <EmptyState />
          ) : (
            labResults.map((result, index) => (
              <div key={index} className="patient-lab-result-item">
                {result.type === 'lab' ? (
                  <FaFlask className="patient-result-icon" />
                ) : (
                  <FaFileAlt className="patient-result-icon" />
                )}
                <div className="patient-result-info">
                  <span className="patient-result-name">{result.name}</span>
                  <span className="patient-result-date">
                    {new Date(result.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <span className={`patient-result-status ${
                  result.status === 'available' ? 'patient-available' : 'patient-not-available'
                }`}>
                  {result.status === 'available' ? 'View Result' : 'Not Available Yet'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LabResults;
