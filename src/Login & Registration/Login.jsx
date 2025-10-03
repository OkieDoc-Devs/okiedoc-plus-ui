import "./auth.css";
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import authService from "../Specialists/authService";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSpecialistMode, setIsSpecialistMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
    specialty: "",
    licenseNumber: "",
    experience: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const redirectPath = authService.getRedirectPath(currentUser.userType);
      navigate(redirectPath);
    }

    // Check if user came from specialist registration link
    if (location.state?.fromRegistration || 
        location.search.includes('register=true')) {
      setIsSpecialistMode(true);
      setIsSignUp(true);
    }

    // Check if user came from specialist login link
    if (location.pathname === '/specialist-login' || 
        (location.search.includes('specialist=true') && !location.search.includes('register=true'))) {
      setIsSpecialistMode(true);
      setIsSignUp(false);
    }
  }, [navigate, location]);

  const dummyCredentials = {
    nurse: {
      email: "nurse@okiedocplus.com",
      password: "nurseOkDoc123",
    },
    admin: {
      email: "admin@okiedocplus.com",
      password: "adminOkDoc123",
    },
    patient: {
      email: "patient@okiedocplus.com",
      password: "patientOkDoc123",
    },
    specialist: {
      email: "specialists@okiedoc.com",
      password: "password123",
    },
  };

  const handleInputChange = (e) => {
    const { name, id, value } = e.target;
    const fieldName = name || id;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Check dummy credentials first
    if (
      formData.email === dummyCredentials.nurse.email &&
      formData.password === dummyCredentials.nurse.password
    ) {
      setError("");
      navigate("/nurse-dashboard");
      setIsLoading(false);
      return;
    } else if (
      formData.email === dummyCredentials.admin.email &&
      formData.password === dummyCredentials.admin.password
    ) {
      setError("");
      navigate("/admin/specialist-dashboard");
      setIsLoading(false);
      return;
    } else if (
      formData.email === dummyCredentials.patient.email &&
      formData.password === dummyCredentials.patient.password
    ) {
      setError("");
      navigate("/patient-dashboard");
      setIsLoading(false);
      return;
    }

    // Use authentication service for registered users
    const result = authService.loginUser(formData.email, formData.password);
    
    if (result.success) {
      setError("");
      const redirectPath = authService.getRedirectPath(result.userType);
      navigate(redirectPath);
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleSpecialistLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setError("");

    const { email, password } = formData;

    if (!email.trim() || !password) {
      setErrors({ general: "Please fill in all fields." });
      setIsLoading(false);
      return;
    }

    const result = authService.loginSpecialist(email.trim(), password);
    
    if (result.success) {
      alert(`Welcome, Dr. ${result.user.firstName} ${result.user.lastName} 👋`);
      navigate("/specialist-dashboard");
    } else {
      setErrors({ general: result.error });
    }
    
    setIsLoading(false);
  };

  const handleSpecialistSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
      setError("");

    // Validate form data
    const validation = authService.validateSpecialistData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    // Prepare specialist data
    const specialistData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      specialty: formData.specialty.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      experience: parseInt(formData.experience),
      phone: formData.phone.trim() || '',
    };

    // Register specialist
    const result = authService.registerSpecialist(specialistData);
    
    if (result.success) {
      alert("Account created successfully! Please login with your new credentials 🎉");
      // Switch to login mode for specialist
      setIsSignUp(false);
      // Clear form data
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
    } else {
      setErrors({ general: result.error });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="header-inside-container">
          <button
            className="back-btn login-back-btn"
            onClick={() => {
              if (isSpecialistMode && isSignUp) {
                setIsSignUp(false);
              } else if (isSpecialistMode) {
                setIsSpecialistMode(false);
              } else {
                navigate("/");
              }
            }}
          >
            <span className="material-symbols-outlined">arrow_back_2</span>
          </button>
          <img src="/okie-doc-logo.png" alt="OkieDoc+" className="logo-image" />
          <div style={{ width: "2.5rem" }}></div>
        </div>

        {!isSpecialistMode ? (
          // Regular Patient/Nurse Login
          <>
        <h2 className="login-title">Sign in</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
          )}
          <label className="login-label" htmlFor="email">
            Email address
          </label>
          <input
            className="login-input"
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <label className="login-label">Password</label>
          <div className="login-password">
            <input
              className="login-input"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
          </button>
          <p className="login-text">
            Don't have an Okie-Doc+ account?{" "}
            <a href="/registration">Register</a>
          </p>
          <p className="specialist-text">
                Are you a specialist?{" "}
                <a href="#" className="specialist-link" onClick={(e) => {
                  e.preventDefault();
                  setIsSpecialistMode(true);
                }}>
                  Login Here
                </a>
              </p>
              <p className="specialist-text">
                Need to register as a specialist?{" "}
                <a href="#" className="specialist-register-link" onClick={(e) => {
                  e.preventDefault();
                  setIsSpecialistMode(true);
                  setIsSignUp(true);
                }}>
                  Register as Specialist
                </a>
              </p>
            </form>
          </>
        ) : !isSignUp ? (
          // Specialist Login
          <>
            <h2 className="login-title">Specialist Sign in</h2>
            <form className="login-form" onSubmit={handleSpecialistLogin}>
              {errors.general && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                  {errors.general}
                </div>
              )}
              
              <label className="login-label" htmlFor="email">
                Email address
              </label>
              <input
                className={`login-input ${errors.email ? 'error' : ''}`}
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
              
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <div className="login-password">
                <input
                  className={`login-input ${errors.password ? 'error' : ''}`}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
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
              
              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              
              <p className="login-text">
                Don't have a specialist account?{" "}
                <a href="#" className="specialist-link" onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(true);
                }}>
                  Register
                </a>
              </p>
              <p className="specialist-text">
                Patient or Nurse?{" "}
                <a href="#" className="specialist-link" onClick={(e) => {
                  e.preventDefault();
                  setIsSpecialistMode(false);
                }}>
                  Login Here
                </a>
              </p>
            </form>
          </>
        ) : (
          // Specialist Registration
          <>
            <h2 className="login-title">Register as Specialist</h2>
            <form className="login-form" onSubmit={handleSpecialistSignUp}>
              {errors.general && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                  {errors.general}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className="login-label" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    className={`login-input ${errors.firstName ? 'error' : ''}`}
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label className="login-label" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    className={`login-input ${errors.lastName ? 'error' : ''}`}
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <label className="login-label" htmlFor="email">
                Email address
              </label>
              <input
                className={`login-input ${errors.email ? 'error' : ''}`}
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}

              <label className="login-label" htmlFor="specialty">
                Medical Specialty
              </label>
              <select
                className={`login-input ${errors.specialty ? 'error' : ''}`}
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                required
              >
                <option value="">Select your specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Neurology">Neurology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Gynecology">Gynecology</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="ENT">ENT (Ear, Nose, Throat)</option>
                <option value="Other">Other</option>
              </select>
              {errors.specialty && <span className="error-message">{errors.specialty}</span>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className="login-label" htmlFor="licenseNumber">
                    License Number
                  </label>
                  <input
                    className={`login-input ${errors.licenseNumber ? 'error' : ''}`}
                    id="licenseNumber"
                    type="text"
                    name="licenseNumber"
                    placeholder="e.g., MD-12345"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label className="login-label" htmlFor="experience">
                    Years of Experience
                  </label>
                  <input
                    className={`login-input ${errors.experience ? 'error' : ''}`}
                    id="experience"
                    type="number"
                    name="experience"
                    placeholder="0"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.experience && <span className="error-message">{errors.experience}</span>}
                </div>
              </div>

              <label className="login-label" htmlFor="phone">
                Phone Number (Optional)
              </label>
              <input
                className={`login-input ${errors.phone ? 'error' : ''}`}
                id="phone"
                type="tel"
                name="phone"
                placeholder="+63 912 345 6789"
                value={formData.phone}
                onChange={handleInputChange}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}

              <label className="login-label" htmlFor="password">
                Password
              </label>
              <div className="login-password">
                <input
                  className={`login-input ${errors.password ? 'error' : ''}`}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
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

              <label className="login-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="login-password">
                <input
                  className={`login-input ${errors.confirmPassword ? 'error' : ''}`}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
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

              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Register as Specialist"}
              </button>
              
              <p className="login-text">
                Already have a specialist account?{" "}
                <a href="#" className="specialist-link" onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(false);
                }}>
                  Login
                </a>
              </p>
              <p className="specialist-text">
                Patient or Nurse?{" "}
                <a href="#" className="specialist-link" onClick={(e) => {
                  e.preventDefault();
                  setIsSpecialistMode(false);
                }}>
                  Login Here
                </a>
          </p>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
