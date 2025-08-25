import React, { useState } from "react";
import "./PatientAuth.css";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  const dummyUser = { email: "patient@example.com", password: "123456" };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (form.email === dummyUser.email && form.password === dummyUser.password) {
      alert("Login successful!");
      setForm({ email: "", password: "" });
    } else {
      alert("Invalid credentials");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert(
      `Registration successful (mock)!\nName: ${form.name}\nEmail: ${form.email}`
    );
    setForm({ email: "", password: "", name: "", confirmPassword: "" });
    setIsLogin(true);
  };

  const showLogin = () => {
    setForm({ email: "", password: "", name: "", confirmPassword: "" });
    setIsLogin(true);
  };

  const showRegister = () => {
    setForm({ email: "", password: "", name: "", confirmPassword: "" });
    setIsLogin(false);
  };

  const handleGoogle = () => {
    alert("Google login clicked (mock)");
  };

  const handleForgot = () => {
    alert("Redirect to Forgot Password page (mock)");
  };

  return (
    <div className="container">
      <div className="brand">
        Okie-Doc<span className="plus">+</span>
      </div>
      <h2>Patient</h2>

      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            exit={{ opacity: 0}}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button className="primary" type="submit">
                Login
              </button>
            </form>
            <div className="forgot" onClick={handleForgot}>
              Forgot Password?
            </div>
            <button className="gsi-material-button" onClick={handleGoogle}>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  {/* Google SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  Sign in with Google
                </span>
              </div>
            </button>
            <div className="toggle" onClick={showRegister}>
              Don’t have an account? Register
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            exit={{ opacity: 0}}
            transition={{ duration: 0.4 }}
          >
            <h2>Create Your Account</h2>
            <form onSubmit={handleRegister}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button className="primary" type="submit">
                Register
              </button>
            </form>
            <div className="divider">OR</div>
            <button className="gsi-material-button" onClick={handleGoogle}>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  {/* Google SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  Sign up with Google
                </span>
              </div>
            </button>
            <div className="toggle" onClick={showLogin}>
              Already have an account? Login
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
