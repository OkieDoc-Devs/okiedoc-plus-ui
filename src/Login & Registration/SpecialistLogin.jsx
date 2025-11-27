import "./auth.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import authService from "../Specialists/authService";

export default function SpecialistLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authService.loginSpecialist(
        formData.email,
        formData.password
      );
      if (result.success) {
        const path =
          result.redirect || authService.getRedirectPath("specialist");
        navigate(path);
        return;
      }

      setError(result.error || "Invalid email or password. Please try again.");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
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
        <h2 className="login-title">Specialist Sign in</h2>
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
            Don&apos;t have a specialist account?{" "}
            <a
              className="specialist-register-link"
              href="/specialist-registration"
            >
              Register as a specialist
            </a>
          </p>
          <p className="login-text">
            Not a specialist?{" "}
            <a className="specialist-link" href="/login">
              Back to general login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
