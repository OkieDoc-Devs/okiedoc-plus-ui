import "./Commercial.css";
import { useNavigate } from "react-router";
import { useState } from "react";
import nurseDocImage from "./assets/NurseDoc.png";
import phoneImage from "./assets/phoneImage.png";
import doc1 from "./assets/doc1.jpg";
import doc2 from "./assets/doc2.jpg";
import doc3 from "./assets/doc3.jpg";
import doc4 from "./assets/doc4.jpg";

function CommercialPage() {
  const navigate = useNavigate();
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    philHealthNumber: "",
    contactMethod: "",
  });
  const [callbackErrors, setCallbackErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });

  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "" }), 4000);
  };

  const handleCallbackChange = (e) => {
    const { name, value } = e.target;
    setCallbackForm((prev) => ({ ...prev, [name]: value }));
    if (callbackErrors[name]) {
      setCallbackErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhilHealthChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 12) value = value.slice(0, 12);
    let formatted = value;
    if (value.length > 2) formatted = value.slice(0, 2) + "-" + value.slice(2);
    if (value.length > 11)
      formatted = value.slice(0, 2) + "-" + value.slice(2, 11) + "-" + value.slice(11);
    setCallbackForm((prev) => ({ ...prev, philHealthNumber: formatted }));
    if (callbackErrors.philHealthNumber) {
      setCallbackErrors((prev) => ({ ...prev, philHealthNumber: "" }));
    }
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!callbackForm.firstName.trim()) errors.firstName = "Required";
    if (!callbackForm.lastName.trim()) errors.lastName = "Required";
    if (!callbackForm.email.trim()) errors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(callbackForm.email)) errors.email = "Invalid email";
    if (!callbackForm.contactNumber.trim()) errors.contactNumber = "Required";
    if (!callbackForm.contactMethod) errors.contactMethod = "Please select a contact method";
    if (Object.keys(errors).length > 0) {
      setCallbackErrors(errors);
      return;
    }
    try {
      const response = await fetch("http://localhost:1337/api/callback-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: callbackForm.firstName,
          lastName: callbackForm.lastName,
          email: callbackForm.email,
          contactNumber: callbackForm.contactNumber,
          philHealthNumber: callbackForm.philHealthNumber || null,
          contactMethod: callbackForm.contactMethod,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Submission failed");
      showToast("Your callback request has been submitted!", "success");
    } catch (err) {
      showToast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setShowCallbackModal(false);
      setCallbackForm({ firstName: "", lastName: "", email: "", contactNumber: "", philHealthNumber: "", contactMethod: "" });
      setCallbackErrors({});
    }
  };

  const doctors = [
    {
      id: 1,
      name: "Dr. Lady Dominique Lumidao",
      credentials: "RMT, MD - General Medicine",
      image: doc1,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: "Online Clinic",
      schedule: "Today, 09:00 AM - 10:00 PM",
      fee: "₱350.00",
    },
    {
      id: 2,
      name: "Dr. Ciarra Isabella Liguid",
      credentials: "RMT, MD - General Medicine",
      image: doc3,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: "Online Clinic",
      schedule: "Today, 01:00 PM - 10:00 PM",
      fee: "₱315.00",
    },
    {
      id: 3,
      name: "Dr. Juan Carlos Santos",
      credentials: "MD - Internal Medicine",
      image: doc2,
      onlineConsultation: true,
      inPersonConsultation: true,
      clinicType: "Online Clinic",
      schedule: "Today, 08:00 AM - 05:00 PM",
      fee: "₱400.00",
    },
    {
      id: 4,
      name: "Dr. Maria Elena Cruz",
      credentials: "MD - Pediatrics",
      image: doc4,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: "Online Clinic",
      schedule: "Today, 10:00 AM - 06:00 PM",
      fee: "₱350.00",
    },
  ];

  return (
    <div className="splash-container">
      <header className="splash-header">
        <button
          className="sign-up-login-btn"
          onClick={() => navigate("/loading")}
        >
          Sign Up/Login
        </button>
      </header>

      <div className="logo-section">
        <img
          src="/okie-doc-logo.png"
          alt="OkieDoc+"
          className="logo-image"
          style={{ height: "80px", maxWidth: "none", paddingLeft: "15px" }}
        />
      </div>

      <main className="splash-main">
        <div>
          <div className="background-decorative-circle"></div>
        </div>
        <div className="content-wrapper">
          <div className="doctor-section">
            <img
              src={nurseDocImage}
              alt="Medical Professional"
              className="doctor-image"
            />
          </div>

          <div className="info-section">
            <div className="search-section">
              <h1 className="main-heading">FIND A SPECIALIST</h1>
              <p className="sub-heading">
                Book your Appointment - Anytime, Anywhere
              </p>

              <div className="search-form">
                <div className="search-bar">
                  <svg
                    className="search-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35" strokeWidth="2" />
                  </svg>
                  <div className="search-input">
                    Your health starts here — search by doctor, hospital, or
                    specialty
                  </div>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <div className="cta-content">
                <h2 className="cta-heading">
                  Immediate access to medical professionals
                </h2>
                <p className="cta-text">
                  Get connected to a doctor right away.
                </p>
                <div className="cta-buttons">
                  <button
                    className="consult-now-btn"
                    onClick={() => navigate("/loading")}
                  >
                    Consult Now
                  </button>
                  <button
                    className="callback-request-btn"
                    onClick={() => setShowCallbackModal(true)}
                  >
                    Callback Request
                  </button>
                </div>
              </div>
              <div className="phone-mockup">
                <img
                  src={phoneImage}
                  alt="Mobile App Preview"
                  className="phone-image"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="doctors-listing-section">
          <div className="doctors-listing-container">
            <h2 className="doctors-listing-heading">
              Our Available Specialists
            </h2>
            <div className="doctors-list">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-info">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="doctor-avatar"
                    />
                    <div className="doctor-details">
                      <h3 className="doctor-name">{doctor.name}</h3>
                      <p className="doctor-credentials">{doctor.credentials}</p>
                      <div className="consultation-types">
                        <span
                          className={`consultation-badge ${
                            doctor.onlineConsultation ? "active" : "inactive"
                          }`}
                        >
                          {doctor.onlineConsultation ? "✓" : "✕"} Online
                          Consultation
                        </span>
                        <span
                          className={`consultation-badge ${
                            doctor.inPersonConsultation ? "active" : "inactive"
                          }`}
                        >
                          {doctor.inPersonConsultation ? "✓" : "✕"} In-Person
                          Consultation
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="schedule-info">
                    <p className="schedule-label">
                      Earliest Available Schedule
                    </p>
                    <div className="schedule-details">
                      <div className="clinic-icon">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4aa7ed"
                          strokeWidth="1.5"
                        >
                          <rect x="5" y="2" width="14" height="20" rx="2" />
                          <path d="M12 18h.01" />
                          <path d="M9 6h6" />
                          <path d="M9 10h6" />
                        </svg>
                      </div>
                      <div className="clinic-info">
                        <p className="clinic-type">{doctor.clinicType}</p>
                        <p className="clinic-schedule">{doctor.schedule}</p>
                        <p className="clinic-fee">Fee: {doctor.fee}</p>
                      </div>
                    </div>
                  </div>

                  <div className="doctor-actions">
                    <button
                      className="book-appointment-link"
                      onClick={() => navigate("/loading")}
                    >
                      BOOK APPOINTMENT
                    </button>
                    <button
                      className="view-profile-btn"
                      onClick={() => navigate("/loading")}
                    >
                      VIEW PROFILE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      {showCallbackModal && (
        <div className="callback-overlay" onClick={() => setShowCallbackModal(false)}>
          <div className="callback-modal" onClick={(e) => e.stopPropagation()}>
            <form className="callback-form" onSubmit={handleCallbackSubmit} noValidate>
              <div className="callback-row">
                <div className="callback-field">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={callbackForm.firstName}
                    onChange={handleCallbackChange}
                    className={callbackErrors.firstName ? "cb-input cb-input-error" : "cb-input"}
                  />
                  {callbackErrors.firstName && <span className="cb-error">{callbackErrors.firstName}</span>}
                </div>
                <div className="callback-field">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={callbackForm.lastName}
                    onChange={handleCallbackChange}
                    className={callbackErrors.lastName ? "cb-input cb-input-error" : "cb-input"}
                  />
                  {callbackErrors.lastName && <span className="cb-error">{callbackErrors.lastName}</span>}
                </div>
              </div>
              <div className="callback-field">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={callbackForm.email}
                  onChange={handleCallbackChange}
                  className={callbackErrors.email ? "cb-input cb-input-error" : "cb-input"}
                />
                {callbackErrors.email && <span className="cb-error">{callbackErrors.email}</span>}
              </div>
              <div className="callback-field">
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={callbackForm.contactNumber}
                  onChange={handleCallbackChange}
                  className={callbackErrors.contactNumber ? "cb-input cb-input-error" : "cb-input"}
                />
                {callbackErrors.contactNumber && <span className="cb-error">{callbackErrors.contactNumber}</span>}
              </div>
              <div className="callback-field">
                <input
                  type="text"
                  name="philHealthNumber"
                  placeholder="Philhealth ID Number (Optional)"
                  value={callbackForm.philHealthNumber}
                  onChange={handlePhilHealthChange}
                  maxLength={14}
                  className="cb-input"
                />
              </div>
              <div className="callback-field">
                <div className="cb-radio-group">
                  <label className="cb-radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="mobile"
                      checked={callbackForm.contactMethod === "mobile"}
                      onChange={handleCallbackChange}
                    />
                    Call via Mobile
                  </label>
                  <label className="cb-radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="viber"
                      checked={callbackForm.contactMethod === "viber"}
                      onChange={handleCallbackChange}
                    />
                    Call via Viber
                  </label>
                  <label className="cb-radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="viber-video"
                      checked={callbackForm.contactMethod === "viber-video"}
                      onChange={handleCallbackChange}
                    />
                    Video Call via Viber
                  </label>
                </div>
                {callbackErrors.contactMethod && <span className="cb-error">{callbackErrors.contactMethod}</span>}
              </div>
              <button type="submit" className="cb-submit-btn">Submit</button>
            </form>
          </div>
        </div>
      )}
      {toast.visible && (
        <div className={`cb-toast cb-toast--${toast.type}`}>
          <span>{toast.message}</span>
          <button className="cb-toast__close" onClick={() => setToast({ visible: false, message: "", type: "" })}>✕</button>
        </div>
      )}
    </div>
  );
}

export default CommercialPage;
