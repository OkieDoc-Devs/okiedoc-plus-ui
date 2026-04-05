import "./App.css";
import { useNavigate } from "react-router";
import { useState } from "react";
import { apiRequest } from "./api/apiClient";


function App() {
  const navigate = useNavigate();
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
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
  const [hasPhilHealth, setHasPhilHealth] = useState(false);
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
    if (hasPhilHealth) {
      const philRegex = /^\d{2}-\d{9}-\d$/;
      if (!callbackForm.philHealthNumber.trim()) {
        errors.philHealthNumber = "Required";
      } else if (!philRegex.test(callbackForm.philHealthNumber)) {
        errors.philHealthNumber = "Incomplete or invalid format (XX-XXXXXXXXX-X)";
      }
    }
    if (Object.keys(errors).length > 0) {
      setCallbackErrors(errors);
      return;
    }
    try {
      await apiRequest("/api/v1/callback-requests", {
        method: "POST",
        body: JSON.stringify({
          firstName: callbackForm.firstName,
          lastName: callbackForm.lastName,
          email: callbackForm.email,
          contactNumber: callbackForm.contactNumber,
          philHealthNumber: hasPhilHealth ? callbackForm.philHealthNumber : "",
          contactMethod: callbackForm.contactMethod,
        }),
      });
      showToast("Your callback request has been submitted!", "success");
      setShowCallbackModal(false);
      setCallbackForm({ firstName: "", lastName: "", email: "", contactNumber: "", philHealthNumber: "", contactMethod: "" });
      setCallbackErrors({});
      setHasPhilHealth(false);
    } catch (err) {
      showToast(err.message || "Something went wrong. Please try again.", "error");
    }
  };

  const navLinks = [
    "Products",
    "Solutions",
    "Community",
    "Resources",
    "Pricing",
    "Contact",
    "Link",
  ];

  const toggleDropdownMenu = () => {
    setIsDropdownMenuOpen(!isDropdownMenuOpen);
  };

  return (
    <div className="app-container">
      <div className="container1">
        <div className="header">
          <div className="logo-section">
            <img
              src="/okie-doc-logo.png"
              alt="OkieDoc+"
              className="logo-image"
            />
          </div>

          <button
            className="mobile-nav-toggle"
            onClick={toggleDropdownMenu}
            aria-label="Toggle dropdown menu"
          >
            ☰
          </button>

          <div className="text-and-buttons">
            <nav className="nav-links">
              {navLinks.map((link) => (
                <a key={link} href="#" className="nav-link">
                  {link}
                </a>
              ))}
            </nav>
          </div>

          <div className="button-group">
            <button className="btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="btn" onClick={() => navigate("/registration")}>
              Register
            </button>
          </div>

          <div
            className={`mobile-nav-dropdown ${
              isDropdownMenuOpen ? "open" : ""
            }`}
          >
            {navLinks.map((link) => (
              <a key={link} href="#" className="nav-link">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container2">
        <div className="imageContainer">
          <img
            src="/okie-doc-logo.png"
            alt="OkieDoc+ Logo"
            className="main-logo-image"
          ></img>
        </div>
      </div>

      {showCallbackModal && (
        <div className="callback-overlay">
          <div className="callback-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="callback-modal__close"
              onClick={() => setShowCallbackModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <form className="callback-form" onSubmit={handleCallbackSubmit} noValidate>
              <div className="callback-row">
                <div className="callback-field">
                  {callbackErrors.firstName && <span className="cb-error">{callbackErrors.firstName}</span>}
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={callbackForm.firstName}
                    onChange={handleCallbackChange}
                    className={callbackErrors.firstName ? "cb-input cb-input-error" : "cb-input"}
                  />
                </div>
                <div className="callback-field">
                  {callbackErrors.lastName && <span className="cb-error">{callbackErrors.lastName}</span>}
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={callbackForm.lastName}
                    onChange={handleCallbackChange}
                    className={callbackErrors.lastName ? "cb-input cb-input-error" : "cb-input"}
                  />
                </div>
              </div>
              <div className="callback-field">
                {callbackErrors.email && <span className="cb-error">{callbackErrors.email}</span>}
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={callbackForm.email}
                  onChange={handleCallbackChange}
                  className={callbackErrors.email ? "cb-input cb-input-error" : "cb-input"}
                />
              </div>
              <div className="callback-field">
                {callbackErrors.contactNumber && <span className="cb-error">{callbackErrors.contactNumber}</span>}
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={callbackForm.contactNumber}
                  onChange={handleCallbackChange}
                  className={callbackErrors.contactNumber ? "cb-input cb-input-error" : "cb-input"}
                />
              </div>
              <div className="callback-field">
                <label className="cb-checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasPhilHealth}
                    onChange={(e) => setHasPhilHealth(e.target.checked)}
                    className="cb-checkbox"
                  />
                  I have a PhilHealth ID number
                </label>
                {hasPhilHealth && (
                  <div className="callback-field" style={{ marginTop: "0.4rem" }}>
                    {callbackErrors.philHealthNumber && <span className="cb-error">{callbackErrors.philHealthNumber}</span>}
                    <input
                      type="text"
                      name="philHealthNumber"
                      placeholder="Philhealth ID Number (XX-XXXXXXXXX-X)"
                      value={callbackForm.philHealthNumber}
                      onChange={handlePhilHealthChange}
                      maxLength={14}
                      className={callbackErrors.philHealthNumber ? "cb-input cb-input-error" : "cb-input"}
                    />
                  </div>
                )}
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
              <button type="submit" className="app-cb-submit-btn">Submit</button>
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

export default App;
