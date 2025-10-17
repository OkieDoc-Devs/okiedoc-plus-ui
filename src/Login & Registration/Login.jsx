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
  const [isLoading, setIsLoading] = useState(false);

  const loginWithAPI = async (email, password) => {
    const response = await fetch("http://localhost:1337/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
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
    setIsLoading(true);
    setError("");

    try {
      const result = await loginWithAPI(formData.email, formData.password);

      if (result.success) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: result.user.id,
              email: result.user.email,
              userType: result.user.userType,
              globalId: result.user.globalId || null, // fallback if missing
            })
          );
          navigate(result.user.dashboardRoute);
          return;
      }
    } catch (apiError) {
      console.warn(
        "API login failed, trying fallback credentials:",
        apiError.message
      );

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
        return;
      }

      setError("Invalid email or password. Please try again.");
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
            Are you a specialist? <a href="/specialist-login">Login Here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
