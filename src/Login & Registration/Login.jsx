import "./auth.css";
import { useNavigate } from "react-router";
import { useState } from "react";
import { loginAdmin } from '../api/Admin/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    if (formData.email.includes("admin@")) {
      try {
        await loginAdmin(formData.email, formData.password);

        navigate("/admin/specialist-dashboard");
      } catch (err) {

        setError(err.message || "Invalid admin credentials. Please try again.");
      }
      return; 
    }

    if (formData.email === "nurse@okiedocplus.com") {
      navigate("/nurse-dashboard");
      return;
    }
    if (formData.email === "patient@okiedocplus.com") {
      navigate("/patient-dashboard");
      return;
    }
    if (formData.email === "specialist@okiedocplus.com") {
      navigate("/specialist-dashboard");
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const user = registeredUsers.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (user) {
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
            alt="OkieDoc+"
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
          <p className="specialist-text">
            Are you a specialist? <a href="/specialist-login">Login Here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
