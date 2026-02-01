import "./auth.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import authService from "../Specialists/authService";

export default function SpecialistRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    licenseNumber: "",
    experience: "",
    phone: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const { isValid, errors: validationErrors } =
      authService.validateSpecialistData({
        ...formData,
        experience: formData.experience ? Number(formData.experience) : "",
      });

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    const result = authService.registerSpecialist({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      specialty: formData.specialty,
      licenseNumber: formData.licenseNumber,
      experience: Number(formData.experience),
      phone: formData.phone,
    });

    if (result.success) {
      setSuccess("Registration successful! Redirecting to specialist login...");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        specialty: "",
        licenseNumber: "",
        experience: "",
        phone: "",
      });
      setTimeout(() => navigate("/specialist-login"), 1500);
      return;
    }

    setErrors({ email: result.error || "Registration failed." });
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

          <label className="login-label" htmlFor="specialty">
            Medical Specialty
          </label>
          <input
            className={`login-input ${errors.specialty ? "error" : ""}`}
            id="specialty"
            type="text"
            placeholder="e.g. Cardiology, Pediatrics"
            value={formData.specialty}
            onChange={handleInputChange}
          />
          {errors.specialty && (
            <span className="error-message">{errors.specialty}</span>
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

          <label className="login-label" htmlFor="experience">
            Years of Experience
          </label>
          <input
            className={`login-input ${errors.experience ? "error" : ""}`}
            id="experience"
            type="number"
            min="0"
            placeholder="e.g. 5"
            value={formData.experience}
            onChange={handleInputChange}
          />
          {errors.experience && (
            <span className="error-message">{errors.experience}</span>
          )}

          <label className="login-label" htmlFor="phone">
            Mobile Number (optional)
          </label>
          <input
            className="login-input"
            id="phone"
            type="tel"
            placeholder="+63 912 345 6789"
            value={formData.phone}
            onChange={handleInputChange}
          />

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
