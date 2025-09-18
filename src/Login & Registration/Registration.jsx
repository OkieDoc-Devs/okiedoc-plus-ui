import "./auth.css";
import { useNavigate } from "react-router";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

    // Clear errors when user starts typing
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ""
      }));
    }


    // console.log(`Registration - ${id}: ${value}`);
  };

  const handleCheckboxChange = (e) => {
    setTermsAccepted(e.target.checked);
    if (errors.terms) {
      setErrors(prev => ({
        ...prev,
        terms: ""
      }));
    }
  };

  const handlePrivacyChange = (e) => {
    setPrivacyAccepted(e.target.checked);
    if (errors.privacy) {
      setErrors(prev => ({
        ...prev,
        privacy: ""
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Password validation functions (disabled)
  const isPasswordValid = (password) => {
    return password.length > 0; // Simple validation - just check if password exists
  };

  const getPasswordRequirements = (password) => {
    return []; // Return empty array to hide requirements
  };

  const shouldShowRequirements = () => {
    return false; // Always return false to hide requirements
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validation
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.birthday) {
      newErrors.birthday = "Birthday is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^(\+63|0)?[9][0-9]{9}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = "Please enter a valid Philippine mobile number";
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    if (!privacyAccepted) {
      newErrors.privacy = "You must accept the privacy policy";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if user already exists
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const userExists = registeredUsers.find(
      (user) => user.email === formData.email
    );

    if (userExists) {
      setErrors({ email: "User with this email already exists. Please login instead." });
      return;
    }

    // Create new user
    const newUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      birthday: formData.birthday,
      gender: formData.gender,
      mobileNumber: formData.mobileNumber,
      registeredAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));


    setSuccess("Registration successful! Please login with your credentials.");
    setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", birthday: "", gender: "", mobileNumber: "" });
    setTermsAccepted(false);
    setPrivacyAccepted(false);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
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
          <form className="login-form" onSubmit={handleSubmit}>
            {success && (
              <p style={{ color: "green", marginBottom: "10px" }}>{success}</p>
            )}
            
            {/* First Name */}
            <label className="login-label" htmlFor="firstName">
              First Name
            </label>
            <input
              className={`login-input ${errors.firstName ? 'error' : ''}`}
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}

            {/* Last Name */}
            <label className="login-label" htmlFor="lastName">
              Last Name
            </label>
            <input
              className={`login-input ${errors.lastName ? 'error' : ''}`}
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}

            {/* Email */}
            <label className="login-label" htmlFor="email">
              Email address
            </label>
            <input
              className={`login-input ${errors.email ? 'error' : ''}`}
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}

            {/* Birthday */}
            <label className="login-label" htmlFor="birthday">
              Birthday
            </label>
            <input
              className={`login-input ${errors.birthday ? 'error' : ''}`}
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleInputChange}
            />
            {errors.birthday && <span className="error-message">{errors.birthday}</span>}

            {/* Gender */}
            <label className="login-label" htmlFor="gender">
              Gender
            </label>
            <select
              className={`login-input ${errors.gender ? 'error' : ''}`}
              id="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && <span className="error-message">{errors.gender}</span>}

            {/* Mobile Number */}
            <label className="login-label" htmlFor="mobileNumber">
              Mobile Number
            </label>
            <input
              className={`login-input ${errors.mobileNumber ? 'error' : ''}`}
              id="mobileNumber"
              type="tel"
              placeholder="+63 912 345 6789"
              value={formData.mobileNumber}
              onChange={handleInputChange}
            />
            {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}

            {/* Password */}
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <div className="login-password">
              <input
                className={`login-input ${errors.password ? 'error' : ''}`}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className={`password-toggle ${showPassword ? 'visible' : 'hidden'}`}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}


            {/* Confirm Password */}
            <label className="login-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="login-password">
              <input
                className={`login-input ${errors.confirmPassword ? 'error' : ''}`}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className={`password-toggle ${showConfirmPassword ? 'visible' : 'hidden'}`}
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

            {/* Terms and Conditions */}
            <div className="terms-container">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={handleCheckboxChange}
                />
                <span className="checkmark"></span>
                I agree to the <a href="#" className="terms-link">Terms and Conditions</a>
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            {/* Privacy Policy */}
            <div className="terms-container">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={handlePrivacyChange}
                />
                <span className="checkmark"></span>
                I agree to the <a href="#" className="terms-link">Privacy Policy</a>
              </label>
              {errors.privacy && <span className="error-message">{errors.privacy}</span>}
            </div>

            <button className="login-btn" type="submit">
              Register
            </button>
            <p className="login-text">
              Already have an Okie-Doc+ account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
