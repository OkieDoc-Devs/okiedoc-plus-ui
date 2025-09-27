import React, { useState, useEffect } from 'react';
import { FaPhone, FaPhoneAlt, FaClock, FaComments, FaTimes, FaInfoCircle } from 'react-icons/fa';
import '../css/AppointmentBooking.css';

const HotlineBooking = () => {
  const [showHotlineModal, setShowHotlineModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Always true - login check disabled

  // Authentication check disabled - users can book without login
  useEffect(() => {
    // Login check disabled - always allow booking
    setIsLoggedIn(true);
  }, []);

  // Handle hotline booking button click
  const handleHotlineBooking = () => {
    setShowHotlineModal(true);
  };

  // Close hotline modal
  const closeHotlineModal = () => {
    setShowHotlineModal(false);
  };

  // Handle phone call (for mobile)
  const handlePhoneCall = () => {
    window.location.href = 'tel:+63212345678';
  };

  return (
    <>
      {/* Hotline Booking Button */}
      <button className="patient-hotline-btn" onClick={handleHotlineBooking}>
        <FaPhoneAlt className="patient-hotline-icon" />
        Book via Hotline
      </button>

      {/* Hotline Booking Modal */}
      {showHotlineModal && (
        <div className="patient-booking-modal-overlay" onClick={closeHotlineModal}>
          <div className="patient-booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patient-booking-header">
              <h2 className="patient-booking-title">
                <FaPhoneAlt className="patient-booking-title-icon" />
                Book Appointment via Hotline
              </h2>
              <button className="patient-booking-close" onClick={closeHotlineModal}>
                <FaTimes />
              </button>
            </div>

            <div className="patient-booking-content">
              {/* Hotline Information */}
              <div className="patient-hotline-info">
                <div className="patient-hotline-info-header">
                  <h3 className="patient-section-title">Call Our Hotline</h3>
                </div>
                <div className="patient-hotline-info-content">
                  <p className="patient-hotline-description">
                    To book an appointment via hotline, please call our dedicated hotline number. 
                    Our nurses will assist you with booking and collect all necessary information.
                  </p>
                  
                  {/* Hotline Number Display */}
                  <div className="patient-hotline-number-section">
                    <div className="patient-hotline-number">
                      <FaPhone className="patient-phone-icon" />
                      <span className="patient-phone-number">+63 2 1234 5678</span>
                      
                      {/* Call Button for Mobile - positioned on right */}
                      <button 
                        className="patient-call-btn patient-call-btn-mobile"
                        onClick={handlePhoneCall}
                      >
                        <FaPhoneAlt className="patient-call-icon" />
                        Call Now
                      </button>
                    </div>
                  </div>

                  <div className="patient-hotline-details">
                    <div className="patient-hotline-detail-item">
                      <FaClock className="patient-detail-icon" />
                      <span className="patient-detail-text">Available: 24/7</span>
                    </div>
                    <div className="patient-hotline-detail-item">
                      <FaComments className="patient-detail-icon" />
                      <span className="patient-detail-text">Default: Teleconsultation via Mobile Call</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Section */}
              <div className="patient-form-section">
                <h3 className="patient-section-title">What to Expect</h3>
                <div className="patient-instructions-list">
                  <div className="patient-instruction-item">
                    <div className="patient-instruction-text">
                      <strong>Call the hotline number</strong> - Our nurse will answer your call
                    </div>
                  </div>
                  <div className="patient-instruction-item">
                    <div className="patient-instruction-text">
                      <strong>Provide your information</strong> - Name, phone, email, chief complaint, symptoms, preferred date/time, and specialist
                    </div>
                  </div>
                  <div className="patient-instruction-item">
                    <div className="patient-instruction-text">
                      <strong>Confirmation</strong> - Nurse will confirm specialist availability and create your appointment
                    </div>
                  </div>
                  {isLoggedIn ? (
                    <div className="patient-instruction-item">
                      <div className="patient-instruction-text">
                        <strong>Registered User:</strong> Your ticket will appear on your Patient Dashboard
                      </div>
                    </div>
                  ) : (
                    <div className="patient-instruction-item">
                      <div className="patient-instruction-text">
                        <strong>Non-Registered User:</strong> An account will be created and you'll receive an activation email
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Important Notice */}
              <div className="patient-hotline-notice">
                <div className="patient-notice-content">
                  <h4 className="patient-notice-title">Important Information</h4>
                  <div className="patient-notice-text">
                    <p>
                      Both registered and non-registered users can book via hotline. 
                      Our nurses will collect all necessary information during the call.
                    </p>
                    <p>
                      <strong>Default Service:</strong> Teleconsultation via Mobile Call
                    </p>
                    <p>
                      <strong>Processing:</strong> Manual booking and ticket creation at the Nurse Dashboard upon confirmation of specialist availability
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="patient-booking-actions">
              <button
                type="button"
                className="patient-booking-cancel"
                onClick={closeHotlineModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HotlineBooking;