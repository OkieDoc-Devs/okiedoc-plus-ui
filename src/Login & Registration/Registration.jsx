import "../App.css";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    console.log(`Registration - ${id}: ${value}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Registration form submitted:", formData);

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const newUser = {
      email: formData.email,
      password: formData.password,
      registeredAt: new Date().toISOString(),
    };

    const userExists = registeredUsers.find(
      (user) => user.email === formData.email
    );
    if (userExists) {
      console.log("Registration failed - user already exists");
      setSuccess("User with this email already exists. Please login instead.");
      return;
    }

    registeredUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    console.log("Registration successful - redirecting to login");
    setSuccess("Registration successful! Please login with your credentials.");

    setFormData({ email: "", password: "" });

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <>
      <div className="login-page-wrapper">
        <div className="header-login">
          <button className="back-btn" onClick={() => navigate("/")}>
            <span className="material-symbols-outlined">arrow_back_2</span>
          </button>
          <img
            src="/okie-doc-logo.png"
            alt="Okie-Doc+"
            className="logo-image"
          />
        </div>
        <div className="login-container">
          <h2 className="login-title">Register</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            {success && (
              <p style={{ color: "green", marginBottom: "10px" }}>{success}</p>
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
              Register
            </button>
            <p className="login-text">
              Already have an Okie-Doc+ account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
