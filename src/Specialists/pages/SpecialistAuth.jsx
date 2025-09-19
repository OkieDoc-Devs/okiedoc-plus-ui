import React from 'react';
import { useNavigate } from 'react-router';
import { useState, useCallback } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../Login & Registration/auth.css';

function SpecialistAuth({ initialIsSignup = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    // If already logged in with an active session, go straight to dashboard
    const current = localStorage.getItem('currentUserEmail');
    const sessionActive = localStorage.getItem('sessionActive') === '1';
    if (sessionActive && current && localStorage.getItem(current)) {
      navigate('/specialist-dashboard');
    } else if (!sessionActive) {
      // Ensure any stale user email doesn't auto-redirect
      localStorage.removeItem('currentUserEmail');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear errors when user starts typing
    if (error) {
      setError("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const fName = formData.firstName.trim();
    const lName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirm = formData.confirmPassword;

    if (!fName || !lName || !email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    if (password.length < 3) {
      setError('Password must be at least 3 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (localStorage.getItem(email)) {
      setError('An account with this email already exists.');
      return;
    }

    const user = { fName, lName, password };
    localStorage.setItem(email, JSON.stringify(user));
    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem('sessionActive', '1');
    navigate('/specialist-dashboard');
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
          <img
            src="/okie-doc-logo.png"
            alt="Okie-Doc+"
            className="logo-image"
          />
          <div style={{ width: "2.5rem" }}></div>
        </div>
        
        <h2 className="login-title">Create Specialist Account</h2>
        <form className="login-form" onSubmit={handleSignup}>
          {error && (
            <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
          )}
          
          <label className="login-label" htmlFor="firstName">
            First Name
          </label>
          <input
            className="login-input"
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />

          <label className="login-label" htmlFor="lastName">
            Last Name
          </label>
          <input
            className="login-input"
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />

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
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password (min 3 chars)"
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

          <label className="login-label">Confirm Password</label>
          <div className="login-password">
            <input
              className="login-input"
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
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

          <button className="login-btn" type="submit">
            Create Account
          </button>
          <p className="login-text">
            Already have a specialist account?{" "}
            <a 
              href="/login"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SpecialistAuth;
