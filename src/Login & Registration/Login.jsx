import "./auth.css";
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import authService from "../Specialists/authService";
import { loginAdmin } from "../api/Admin/api.js";
import { login } from "../Patient/services/apiService.js";

export default function Login() {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        const fullName =
          result.user.fullName ||
          result.user.Full_Name ||
          result.user.full_name ||
          result.user.name ||
          "";
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        const firstName =
          result.user.firstName || result.user.first_name || nameParts[0] || "";
        const lastName =
          result.user.lastName ||
          result.user.last_name ||
          nameParts.slice(1).join(" ") ||
          "";

        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: result.user.id,
            email: result.user.email,
            userType: result.user.userType,
            globalId: result.user.globalId || null,
            fullName,
            firstName,
            lastName,
          }),
        );

        if (result.user.userType === "nurse_admin") {
          sessionStorage.setItem("isNurseAdminLoggedIn", "true");
          localStorage.setItem("userRole", "nurse_admin");
          navigate("/nurse-admin-dashboard");
          return;
        }

        if (result.user.userType === "nurse") {
          const firstName =
            result.user.firstName ||
            result.user.first_name ||
            result.user.name?.split(" ")[0] ||
            result.user.fullName?.split(" ")[0] ||
            "Nurse";

          const lastName =
            result.user.lastName ||
            result.user.last_name ||
            result.user.name?.split(" ")[1] ||
            result.user.fullName?.split(" ")[1] ||
            "";

          localStorage.setItem("nurse.id", result.user.id);
          localStorage.setItem("nurse.email", result.user.email);
          localStorage.setItem("nurse.firstName", firstName);
          localStorage.setItem("nurse.lastName", lastName);

          console.log("Nurse data stored in localStorage:", {
            id: result.user.id,
            email: result.user.email,
            firstName: firstName,
            lastName: lastName,
            rawUserObject: result.user,
          });
        }

        navigate(result.user.dashboardRoute || "/patient");
        return;
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
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

        <>
          <h2 className="login-title">Sign in</h2>
          <p className="login-subtitle">
            Welcome back! Please enter your details.
          </p>
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <p className="auth-alert auth-alert--error">{error}</p>}
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
              <a
                href="/specialist-login"
                className="specialist-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/specialist-login");
                }}
              >
                Login Here
              </a>
            </p>
            <p className="specialist-text">
              Need to register as a specialist?{" "}
              <a
                href="/specialist-registration"
                className="specialist-register-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/specialist-registration");
                }}
              >
                Register as Specialist
              </a>
            </p>
          </form>
        </>
      </div>
    </div>
  );
}
