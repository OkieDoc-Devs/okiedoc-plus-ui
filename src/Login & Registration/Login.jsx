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

  const loginWithAPI = async (email, password) => {
    const response = await fetch("http://localhost:1337/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await loginWithAPI(formData.email, formData.password);

      if (result.success) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: result.user.id,
              email: result.user.email,
              userType: result.user.userType,
              globalId: result.user.globalId || null, // fallback if missing
            })
          );
          navigate(result.user.dashboardRoute);
          return;
      }
    } catch (apiError) {
      console.warn(
        "API login failed, trying fallback credentials:",
        apiError.message
      );

      if (
        formData.email === dummyCredentials.nurse.email &&
        formData.password === dummyCredentials.nurse.password
      ) {
        setError("");
        navigate("/nurse-dashboard");
        return;
      } else if (
        formData.email === dummyCredentials.admin.email &&
        formData.password === dummyCredentials.admin.password
      ) {
        setError("");
        navigate("/admin/specialist-dashboard");
        return;
      } else if (
        formData.email === dummyCredentials.patient.email &&
        formData.password === dummyCredentials.patient.password
      ) {
        setError("");
        navigate("/patient-dashboard");
        return;
      } else if (
        formData.email === dummyCredentials.specialist.email &&
        formData.password === dummyCredentials.specialist.password
      ) {
        setError("");
        navigate("/specialist-dashboard");
        return;
      }

      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const user = registeredUsers.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        setError("");
        navigate("/dashboard");
        return;
      }

      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
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
              disabled={isLoading}
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