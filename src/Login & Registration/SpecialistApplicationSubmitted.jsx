import "./auth.css";
import { useNavigate } from "react-router-dom";

export default function SpecialistApplicationSubmitted() {
  const navigate = useNavigate();

  return (
    <div className="login-page-wrapper specialist-registration-page">
      <div className="login-container specialist-approval-card">
        <div className="header-inside-container">
          <button
            type="button"
            className="back-btn login-back-btn"
            onClick={() => navigate("/specialist-login")}
            aria-label="Back to specialist login"
          >
            <span className="material-symbols-outlined">arrow_back_2</span>
          </button>
          <img src="/okie-doc-logo.png" alt="OkieDoc+" className="logo-image" />
          <div style={{ width: "2.5rem" }} />
        </div>

        <h2 className="login-title">Waiting for admin approval</h2>
        <p className="login-subtitle specialist-approval-lead">
          Please wait. Your application has been submitted successfully and is{" "}
          <strong>pending admin approval</strong>. Thank you—we will notify you when your account is
          ready.
        </p>

        <div className="specialist-approval-panel">
          <p className="specialist-approval-status">Status: Waiting for admin approval</p>
          <p className="specialist-approval-note">
            You will be able to use the specialist dashboard after an administrator approves your
            registration.
          </p>
        </div>

        <div className="specialist-approval-actions">
          <button
            type="button"
            className="login-btn"
            onClick={() => navigate("/specialist-login")}
            style={{ color: '#ffffff', fontWeight: 600 }}
          >
            Back to specialist sign in
          </button>
        </div>
      </div>
    </div>
  );
}
