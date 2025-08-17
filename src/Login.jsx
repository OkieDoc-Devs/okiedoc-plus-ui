import "./App.css";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page-wrapper">
      <div className="header-login">
        <button className="back-btn" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined">arrow_back_2</span>
        </button>
        <h1>Okie-Doc</h1>
        <h1 className="plus">+</h1>
      </div>
      <div className="login-container">
        <h2 className="login-title">Sign in</h2>
        <form className="login-form">
          <label className="login-label" htmlFor="email">
            Email address
          </label>
          <input
            className="login-input"
            id="email"
            type="email"
            placeholder="Enter your email address"
            required
          />
          <label className="login-label">Password</label>
          <div className="login-password">
            <input
              className="login-input"
              id="password"
              type="password"
              placeholder="Enter your password"
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
