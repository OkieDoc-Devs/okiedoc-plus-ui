import "./auth.css";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const dummyCredentials = {
    nurse: {
      email: "nurse@okiedoc.com",
      password: "password123",
    },
    admin: {
      email: "admin@okiedoc.com",
      password: "password123",
    },
    patient: {
      email: "patient@okiedoc.com",
      password: "password123",
    },
    specialist: {
      email: "specialists@okiedoc.com",
      password: "password123",
    },
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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
      // Set the specialist session for the dashboard
      localStorage.setItem(
        "currentSpecialistEmail",
        dummyCredentials.specialist.email
      );
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
          <img
            src="/okie-doc-logo.png"
            alt="Okie-Doc+"
            className="logo-image"
          />
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
        </form>
      </div>
    </div>
  );
}
