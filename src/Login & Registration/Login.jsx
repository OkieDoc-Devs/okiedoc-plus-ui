import "./auth.css";
import { useNavigate } from "react-router-dom"; // Use react-router-dom
import { useState } from "react";
import { loginAdmin } from "../api/Admin/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Keep dummy credentials for fallback/local testing
  const dummyCredentials = {
    nurse: {
      email: "nurse@okiedocplus.com",
      password: "nurseOkDoc123",
    },
    patient: {
      email: "patient@okiedocplus.com",
      password: "patientOkDoc123",
    },
    specialist: {
      email: "specialist@okiedocplus.com",
      password: "specialistOkDoc123",
    },
    // No dummy admin needed if using API
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Admin login attempt using API
    if (formData.email === "admin@okiedocplus.com") {
      try {
        await loginAdmin(formData.email, formData.password);
        sessionStorage.setItem("isAdminLoggedIn", "true");
        navigate("/admin/specialist-dashboard");
        return;
      } catch (err) {
        setError(err.message || "Invalid admin credentials. Please try again.");
        return;
      }
    }

    // Fallback to dummy credentials for other roles (adjust or remove as needed)
    if (
      formData.email === dummyCredentials.nurse.email &&
      formData.password === dummyCredentials.nurse.password
    ) {
      // Set some indicator for nurse login if needed
      localStorage.setItem("userRole", "nurse"); // Example
      navigate("/nurse-dashboard");
      return;
    } else if (
      formData.email === dummyCredentials.patient.email &&
      formData.password === dummyCredentials.patient.password
    ) {
      // Set some indicator for patient login if needed
      localStorage.setItem("userRole", "patient"); // Example
      navigate("/patient-dashboard");
      return;
    }

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const user = registeredUsers.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (user) {
      localStorage.setItem("userRole", "patient");
      navigate("/patient-dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
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
          <button className="login-btn" type="submit">
            Sign in
          </button>
          <p className="login-text">
            Don't have an Okie-Doc+ account?{" "}
            <a href="/registration">Register</a>
          </p>
          <p className="specialist-text">
            Are you a specialist? <a href="/specialist-login">Login Here</a>
          </p>
        </form>
      </div>
    </div>
  );
}