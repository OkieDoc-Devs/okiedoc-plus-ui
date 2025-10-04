import "./auth.css";
import { useNavigate } from "react-router";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiService from "../Patient/services/apiService";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dummy credentials removed - now using backend user type detection

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

    try {
      console.log("Attempting login for:", formData.email);
      
      // Use the generic login handler that detects user type from backend
      const response = await apiService.loginUser(formData.email, formData.password);
      
      if (response.success) {
        console.log("Login successful:", response);
        
        // Store user information based on user type
        switch (response.userType) {
          case 'patient':
            localStorage.setItem("patientId", response.patient.patient_id);
            localStorage.setItem("userType", "patient");
            navigate("/patient-dashboard");
            break;
            
          case 'nurse':
            localStorage.setItem("nurseId", response.userId);
            localStorage.setItem("userType", "nurse");
            navigate("/nurse-dashboard");
            break;
            
          case 'admin':
            localStorage.setItem("adminId", response.userId);
            localStorage.setItem("userType", "admin");
            navigate("/admin/specialist-dashboard");
            break;
            
          case 'specialist':
            localStorage.setItem("specialistId", response.userId);
            localStorage.setItem("userType", "specialist");
            navigate("/specialist-dashboard");
            break;
            
          default:
            setError("Unknown user type. Please contact support.");
        }
      } else {
        setError(response.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your credentials or try again later.");
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
              type={showPassword ? "text" : "password"}
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
