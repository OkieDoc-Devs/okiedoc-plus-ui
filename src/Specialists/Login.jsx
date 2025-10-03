import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaGoogle,
  FaFacebookF,
} from "react-icons/fa";
import "./SpecialistAuth.css";

const SpecialistLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("specialist@okiedocplus.com")) {
      localStorage.setItem(
        "specialist@okiedocplus.com",
        JSON.stringify({
          fName: "John",
          lName: "Smith",
          password: "specialistOkDoc123",
        })
      );
      console.log("Dummy credential added:", {
        email: "specialist@okiedocplus.com",
        password: "specialistOkDoc123",
      });
    }

    const current = localStorage.getItem("currentSpecialistEmail");
    if (current) {
      navigate("/specialist-dashboard");
    }

    // Check if user came from registration link - show signup form
    if (location.state?.fromRegistration || location.search.includes('register=true')) {
      setIsSignUp(true);
    }
  }, [navigate, location]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (
      email.trim() === "specialist@okiedocplus.com" &&
      password === "specialistOkDoc123"
    ) {
      localStorage.setItem("currentSpecialistEmail", "specialist@okiedocplus.com");
      alert("Welcome, Dr. John Smith 👋");
      navigate("/specialist-dashboard");
      return;
    }

    let user = localStorage.getItem(email.trim());
    if (!user) {
      alert("No account found with this email.");
      return;
    }

    user = JSON.parse(user);
    if (user.password !== password) {
      alert("Invalid password.");
      return;
    }

    localStorage.setItem("currentSpecialistEmail", email.trim());
    alert(
      "Welcome, Dr. " + (user.fName || "") + " " + (user.lName || "") + " 👋"
    );
    navigate("/specialist-dashboard");
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert("Please enter a valid email.");
      return;
    }

    if (password.length < 3) {
      alert("Password must be at least 3 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (localStorage.getItem(email.trim().toLowerCase())) {
      alert("An account with this email already exists.");
      return;
    }

    const user = {
      fName: firstName.trim(),
      lName: lastName.trim(),
      password: password,
    };
    localStorage.setItem(email.trim().toLowerCase(), JSON.stringify(user));

    localStorage.setItem("currentSpecialistEmail", email.trim().toLowerCase());
    alert("Account created successfully! Redirecting to your dashboard...");
    navigate("/specialist-dashboard");
  };

  return (
    <div className="specialist-auth-body">
      <div className="login-container">
        {/* Header with back button */}
        <div className="header-inside-container">
          <button
            className="back-btn specialist-back-btn"
            onClick={() => {
              if (isSignUp) {
                setIsSignUp(false);
              } else {
                navigate("/");
              }
            }}
          >
            <span className="material-symbols-outlined">arrow_back_2</span>
          </button>
          <div style={{ width: "2.5rem" }}></div>
        </div>

        {!isSignUp ? (
          <div id="signinView">
            <h2 className="login-title">Sign in</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <label className="login-label" htmlFor="email">
                Email address
              </label>
              <input
                className="login-input"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <div className="login-password">
                <input
                  className="login-input"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="login-btn" type="submit">
                Sign in
              </button>
              <p className="login-text">
                Don't have an Okie-Doc+ account?{" "}
                <button type="button" onClick={() => setIsSignUp(true)}>
                  Register
                </button>
              </p>
              <p className="specialist-text">
                Patient or Nurse?{" "}
                <button type="button" onClick={() => navigate("/login")}>
                  Login Here
                </button>
              </p>
            </form>
          </div>
        ) : (
          <div id="signupView">
            <h2 className="login-title">Register</h2>
            <form className="login-form" onSubmit={handleSignUp}>
              <label className="login-label" htmlFor="firstName">
                First Name
              </label>
              <input
                className="login-input"
                id="firstName"
                type="text"
                name="firstName"
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
                name="lastName"
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
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <div className="login-password">
                <input
                  className="login-input"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <label className="login-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="login-password">
                <input
                  className="login-input"
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="login-btn" type="submit">
                Register
              </button>
              <p className="login-text">
                Already have an Okie-Doc+ account?{" "}
                <button type="button" onClick={() => setIsSignUp(false)}>
                  Login
                </button>
              </p>
              <p className="specialist-text">
                Patient or Nurse?{" "}
                <button type="button" onClick={() => navigate("/login")}>
                  Login Here
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialistLogin;
