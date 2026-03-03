import React, { useState, useEffect } from 'react';
import { fetchLabResults } from '../services/labResultsService';
import { FaFileAlt, FaFlask, FaDownload } from 'react-icons/fa';
import '../css/PatientDashboard.css';

const LabResults = () => {
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const userId = currentUser?.id;
        if (userId) {
          const data = await fetchLabResults(userId);
          setLabResults(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch lab results:", err);
        setError("Failed to load lab results.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="patient-loading-state">
        <div className="patient-loading-spinner"></div>
        <h3 className="patient-loading-title">Loading Lab Results...</h3>
      </div>
    );
  }

  if (error) {
    return <div className="error-state"><p>{error}</p></div>;
  }

  return (
    <div className="patient-page-content">
      <div className="patient-page-header">
        <h2 className="patient-page-title">Lab Results</h2>
        <p className="patient-page-subtitle">View and download your lab results</p>
      </div>

      <div className="patient-lab-results-list-container">
        {labResults.length > 0 ? (
          labResults.map((result) => (
            <div key={result.id} className="patient-lab-result-list-item">
              <div className="patient-lab-result-icon-wrapper">{result.icon || <FaFlask />}</div>
              <div className="patient-lab-result-info">
                <span className="patient-lab-result-name">{result.name}</span>
                <span className="patient-lab-result-date">Date: {result.date}</span>
              </div>
              <div className="patient-lab-result-actions">
                {result.status === 'Available' ? (
                  <a href={result.fileUrl} className="patient-download-btn" download>
                    <FaDownload />
                    <span>Download</span>
                  </a>
                ) : (
                  <span className="patient-result-status patient-not-available">
                    Not Available
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="patient-empty-state">
            <FaFlask className="patient-empty-icon" />
            <h3 className="patient-empty-title">No Lab Results Yet</h3>
            <p className="patient-empty-message">
              You don't have any lab results available yet. Once your tests are
              completed, the results will appear here for you to view and download.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResults;
