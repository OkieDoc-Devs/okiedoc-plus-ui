import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("specialist@okiedoc.com")) {
      localStorage.setItem(
        "specialist@okiedoc.com",
        JSON.stringify({
          fName: "John",
          lName: "Smith",
          password: "password123",
        })
      );
      console.log("Dummy credential added:", {
        email: "specialist@okiedoc.com",
        password: "password123",
      });
    }

    const current = localStorage.getItem("currentSpecialistEmail");
    if (current) {
      navigate("/specialist-dashboard");
    }
  }, [navigate]);

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
      email.trim() === "specialist@okiedoc.com" &&
      password === "password123"
    ) {
      localStorage.setItem("currentSpecialistEmail", "specialist@okiedoc.com");
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
        {!isSignUp ? (
          <div id="signinView">
            <h1 className="form-title">Okiedoc+ Specialist Login</h1>
            <form onSubmit={handleLogin}>
              <div className="login-input-group">
                <FaEnvelope />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="login-input-group">
                <FaLock />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="btn">
                Sign In
              </button>
            </form>
            <button className="social-btn google-btn">
              <FaGoogle /> Sign in with Google
            </button>
            <button className="social-btn fb-btn">
              <FaFacebookF /> Sign in with Facebook
            </button>
            <div className="links">
              <p>
                Don't have an account?{" "}
                <button type="button" onClick={() => setIsSignUp(true)}>
                  Sign Up
                </button>
              </p>
            </div>
            <div className="other-login-link">
              <p>
                Patient or Nurse?{" "}
                <button type="button" onClick={() => navigate("/login")}>
                  Login Here
                </button>
              </p>
            </div>
          </div>
        ) : (
          // Sign Up Form
          <div id="signupView">
            <h1 className="form-title">Create your account</h1>
            <form onSubmit={handleSignUp}>
              <div className="login-input-group">
                <FaUser />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="login-input-group">
                <FaUser />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="login-input-group">
                <FaEnvelope />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="login-input-group">
                <FaLock />
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 3 chars)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="login-input-group">
                <FaLock />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="btn">
                Create Account
              </button>
            </form>
            <div className="links">
              <p>
                Already have an account?{" "}
                <button type="button" onClick={() => setIsSignUp(false)}>
                  Back to Sign In
                </button>
              </p>
            </div>
            <div className="other-login-link">
              <p>
                Patient or Nurse?{" "}
                <button type="button" onClick={() => navigate("/login")}>
                  Login Here
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialistLogin;
