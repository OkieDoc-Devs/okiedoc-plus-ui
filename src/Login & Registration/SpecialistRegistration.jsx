import "./auth.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function SpecialistRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    primarySpecialty: "",
    licenseNumber: "",
    mobileNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.primarySpecialty.trim()) newErrors.primarySpecialty = "Medical specialty is required";
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required";
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const response = await fetch("http://localhost:1337/api/v1/specialist/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          licenseNumber: formData.licenseNumber,
          primarySpecialty: formData.primarySpecialty,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Redirecting to specialist login...");
        window.scrollTo(0, 0);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          primarySpecialty: "",
          licenseNumber: "",
          mobileNumber: "",
        });
        setTimeout(() => navigate("/specialist-login"), 2000);
      } else {
        setErrors({ email: result.message || "Registration failed." });
        // Handle specific error structure from backend if needed
        if (result.emailAlreadyInUse) {
          setErrors({ email: result.emailAlreadyInUse.message || "Email already in use/Application submitted." });
        }
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ email: "Network error. Please try again later." });
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="header-inside-container">
          <button
            className="back-btn login-back-btn"
            onClick={() => navigate("/")}
          >
            <span className="material-symbols-outlined">arrow_back_2</span>
          </button>
          <img src="/okie-doc-logo.png" alt="OkieDoc+" className="logo-image" />
          <div style={{ width: "2.5rem" }}></div>
        </div>
        <h2 className="login-title">Specialist Registration</h2>
        <p className="login-subtitle">
          Join as a verified specialist and start helping patients.
        </p>
        <form className="login-form" onSubmit={handleSubmit}>
          {success && (
            <p className="auth-alert auth-alert--success">{success}</p>
          )}

          <label className="login-label" htmlFor="firstName">
            First Name
          </label>
          <input
            className={`login-input ${errors.firstName ? "error" : ""}`}
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange}
          />
          {errors.firstName && (
            <span className="error-message">{errors.firstName}</span>
          )}

          <label className="login-label" htmlFor="lastName">
            Last Name
          </label>
          <input
            className={`login-input ${errors.lastName ? "error" : ""}`}
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange}
          />
          {errors.lastName && (
            <span className="error-message">{errors.lastName}</span>
          )}

          <label className="login-label" htmlFor="email">
            Email address
          </label>
          <input
            className={`login-input ${errors.email ? "error" : ""}`}
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}

          <label className="login-label" htmlFor="primarySpecialty">
            Medical Specialty
          </label>
          <input
            className={`login-input ${errors.primarySpecialty ? "error" : ""}`}
            id="primarySpecialty"
            type="text"
            placeholder="e.g. Cardiology, Pediatrics"
            value={formData.primarySpecialty}
            onChange={handleInputChange}
          />
          {errors.primarySpecialty && (
            <span className="error-message">{errors.primarySpecialty}</span>
          )}

          <label className="login-label" htmlFor="licenseNumber">
            License Number
          </label>
          <input
            className={`login-input ${errors.licenseNumber ? "error" : ""}`}
            id="licenseNumber"
            type="text"
            placeholder="Enter your license number"
            value={formData.licenseNumber}
            onChange={handleInputChange}
          />
          {errors.licenseNumber && (
            <span className="error-message">{errors.licenseNumber}</span>
          )}



          <label className="login-label" htmlFor="mobileNumber">
            Mobile Number
          </label>
          <input
            className={`login-input ${errors.mobileNumber ? "error" : ""}`}
            id="mobileNumber"
            type="tel"
            placeholder="+63 912 345 6789"
            value={formData.mobileNumber}
            onChange={handleInputChange}
          />
          {errors.mobileNumber && (
            <span className="error-message">{errors.mobileNumber}</span>
          )}

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <div className="login-password">
            <input
              className={`login-input ${errors.password ? "error" : ""}`}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className={`password-toggle ${showPassword ? "visible" : "hidden"}`}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}

          <label className="login-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="login-password">
            <input
              className={`login-input ${errors.confirmPassword ? "error" : ""}`}
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className={`password-toggle ${showConfirmPassword ? "visible" : "hidden"}`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}

          <button className="login-btn" type="submit">
            Register
          </button>
          <p className="login-text">
            Already a specialist?{" "}
            <a className="specialist-link" href="/specialist-login">
              Login here
            </a>
          </p>
          <p className="login-text">
            Not a specialist?{" "}
            <a className="specialist-link" href="/registration">
              Register as a patient
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
