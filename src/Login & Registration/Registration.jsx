import "./auth.css";
import { useNavigate } from "react-router";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const registerPatient = async (formData) => {
  const response = await fetch("http://localhost:1337/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      birthday: formData.birthday,
      gender: formData.gender,
      mobileNumber: formData.mobileNumber,
      philHealthNumber: formData.philHealthNumber || null,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    gender: "",
    mobileNumber: "",
    philHealthNumber: "",
  });
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const handlePhilHealthChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    
    let formatted = value;
    if (value.length > 2) {
      formatted = value.slice(0, 2) + "-" + value.slice(2);
    }
    if (value.length > 11) {
      formatted = value.slice(0, 2) + "-" + value.slice(2, 11) + "-" + value.slice(11);
    }
    
    setFormData((prev) => ({
      ...prev,
      philHealthNumber: formatted,
    }));

    if (errors.philHealthNumber) {
      setErrors((prev) => ({
        ...prev,
        philHealthNumber: "",
      }));
    }
  };

  const isValidPhilHealthNumber = (number) => {
    if (!number || number.trim() === "") return true;
    const pattern = /^\d{2}-\d{9}-\d{1}$/;
    return pattern.test(number);
  };

  const handleCheckboxChange = (e) => {
    setTermsAccepted(e.target.checked);
    if (errors.terms) {
      setErrors((prev) => ({
        ...prev,
        terms: "",
      }));
    }
  };

  const handlePrivacyChange = (e) => {
    setPrivacyAccepted(e.target.checked);
    if (errors.privacy) {
      setErrors((prev) => ({
        ...prev,
        privacy: "",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isPasswordValid = (password) => {
    return password.length > 0;
  };

  const getPasswordRequirements = (password) => {
    return [];
  };

  const shouldShowRequirements = () => {
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setSuccess("");
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.philHealthNumber && !isValidPhilHealthNumber(formData.philHealthNumber)) {
      newErrors.philHealthNumber = "Invalid PhilHealth number format. Must be XX-XXXXXXXXX-X";
    }
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!termsAccepted)
      newErrors.terms = "You must accept the terms and conditions";
    if (!privacyAccepted)
      newErrors.privacy = "You must accept the privacy policy";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await registerPatient(formData);
      if (result.success) {
        setSuccess("Registration successful! Redirecting to login...");
        const userData = {
          id: result.user.id,
          email: result.user.email,
          userType: result.user.userType,
          globalId: result.user.globalId,
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          birthday: "",
          gender: "",
          mobileNumber: "",
          philHealthNumber: "",
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ email: error.message || "Registration failed." });
    }
  };

  return (
    <>
      <div className="login-page-wrapper">
        <div className="login-container">
          <div className="header-inside-container">
            <button
              className="back-btn login-back-btn"
              onClick={() => navigate("/")}
            >
              <span className="material-symbols-outlined">arrow_back_2</span>
            </button>
            <img
              src="/okie-doc-logo.png"
              alt="OkieDoc+"
              className="logo-image"
            />
            <div style={{ width: "2.5rem" }}></div>
          </div>
          <h2 className="login-title">Register</h2>
          <p className="login-subtitle">
            Create your OkieDoc+ account in a few steps.
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

            <label className="login-label" htmlFor="birthday">
              Birthday
            </label>
            <input
              className={`login-input ${errors.birthday ? "error" : ""}`}
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleInputChange}
            />
            {errors.birthday && (
              <span className="error-message">{errors.birthday}</span>
            )}

            <label className="login-label" htmlFor="gender">
              Gender
            </label>
            <select
              className={`login-input ${errors.gender ? "error" : ""}`}
              id="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <span className="error-message">{errors.gender}</span>
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

            <label className="login-label" htmlFor="philHealthNumber">
              PhilHealth Number <span style={{ color: "#999", fontSize: "0.9em" }}>(Optional)</span>
            </label>
            <input
              className={`login-input ${errors.philHealthNumber ? "error" : ""}`}
              id="philHealthNumber"
              type="text"
              placeholder="XX-XXXXXXXXX-X"
              value={formData.philHealthNumber}
              onChange={handlePhilHealthChange}
              maxLength="14"
            />
            {errors.philHealthNumber && (
              <span className="error-message">{errors.philHealthNumber}</span>
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
                onClick={togglePasswordVisibility}
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
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}

            <div className="terms-container">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={handleCheckboxChange}
                />
                <span className="checkmark"></span>I agree to the{" "}
                <a href="#" className="terms-link">
                  Terms and Conditions
                </a>
              </label>
              {errors.terms && (
                <span className="error-message">{errors.terms}</span>
              )}
            </div>

            <div className="terms-container">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={handlePrivacyChange}
                />
                <span className="checkmark"></span>I agree to the{" "}
                <a href="#" className="terms-link">
                  Privacy Policy
                </a>
              </label>
              {errors.privacy && (
                <span className="error-message">{errors.privacy}</span>
              )}
            </div>

            <button className="login-btn" type="submit">
              Register
            </button>
            <p className="login-text">
              Already have an Okie-Doc+ account? <a href="/login">Login</a>
            </p>
            <p className="login-text">
              Are you a specialist?{" "}
              <a href="/login?register=true&specialist=true">
                Register as a specialist
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
