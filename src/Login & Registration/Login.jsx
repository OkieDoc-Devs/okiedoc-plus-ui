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

  const dummyCredentials = {
    nurse: {
      email: "nurse@okiedocplus.com",
      password: "nurseOkDoc123",
    },
    admin: {
      email: "admin@okiedocplus.com",
      password: "adminOkDoc123",
    },
    patient: {
      email: "patient@okiedocplus.com",
      password: "patientOkDoc123",
    },
    specialist: {
      email: "specialist@okiedocplus.com",
      password: "specialistOkDoc123",
    },
  };

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

    // Check for hardcoded non-patient accounts first
    if (
      formData.email === dummyCredentials.nurse.email &&
      formData.password === dummyCredentials.nurse.password
    ) {
      navigate("/nurse-dashboard");
      return;
    } else if (
      formData.email === dummyCredentials.admin.email &&
      formData.password === dummyCredentials.admin.password
    ) {
      navigate("/admin/specialist-dashboard");
      return;
    } else if (
      formData.email === dummyCredentials.specialist.email &&
      formData.password === dummyCredentials.specialist.password
    ) {
      navigate("/specialist-dashboard");
      return;
    } else if (
      formData.email === dummyCredentials.patient.email &&
      formData.password === dummyCredentials.patient.password
    ) {
      // Try backend authentication for patient@okiedocplus.com first
      try {
        console.log("Attempting backend login for patient:", formData.email);
        const response = await apiService.loginPatient(formData.email, formData.password);
        
        if (response.success && response.patient) {
          console.log("Backend login successful:", response.patient);
          
          // Store only patient ID for session management (backend is source of truth)
          localStorage.setItem("patientId", response.patient.patient_id);
          
          // Navigate to patient dashboard
          navigate("/patient-dashboard");
          return;
        } else {
          // Fallback to dummy navigation if backend fails
          console.log("Backend failed, using dummy navigation");
          navigate("/patient-dashboard");
          return;
        }
      } catch (error) {
        console.error("Backend login error:", error);
        // Fallback to dummy navigation if backend fails
        console.log("Backend failed, using dummy navigation");
        navigate("/patient-dashboard");
        return;
      }
    }

    // Try backend authentication for other patient accounts
    try {
      console.log("Attempting backend login for:", formData.email);
      const response = await apiService.loginPatient(formData.email, formData.password);
      
      if (response.success && response.patient) {
        console.log("Login successful:", response.patient);
        
        // Store only patient ID for session management (backend is source of truth)
        localStorage.setItem("patientId", response.patient.patient_id);
        
        // Navigate to patient dashboard
        navigate("/patient-dashboard");
        return;
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Fallback to localStorage check
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const user = registeredUsers.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        navigate("/dashboard");
      } else {
        setError("Login failed. Please check your credentials or try again later.");
      }
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
