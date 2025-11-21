import "./App.css";
import { useNavigate } from "react-router";
import nurseDocImage from "./assets/NurseDoc.png";
import phoneImage from "./assets/phoneImage.png";

function App() {
  const navigate = useNavigate();

  return (
    <div className="splash-container">
      <header className="splash-header">
        <button
          className="sign-up-login-btn"
          onClick={() => navigate("/login")}
        >
          Sign Up/Login
        </button>
      </header>

      <div className="logo-section">
        <img
          src="/okie-doc-logo.png"
          alt="OkieDoc+"
          className="logo-image"
          style={{ height: "80px", maxWidth: "none" }}
        />
      </div>

      <main className="splash-main">
        <div className="content-wrapper">
          <div className="doctor-section">
            <img
              src={nurseDocImage}
              alt="Medical Professional"
              className="doctor-image"
            />
          </div>

          <div className="info-section">
            <div className="search-section">
              <h1 className="main-heading">FIND A SPECIALIST</h1>
              <p className="sub-heading">
                Book your Appointment - Anytime, Anywhere
              </p>

              <div className="search-form">
                <div className="search-bar">
                  <svg
                    className="search-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35" strokeWidth="2" />
                  </svg>
                  <div className="search-input">
                    Your health starts here — search by doctor, hospital, or
                    specialty
                  </div>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <div className="cta-content">
                <h2 className="cta-heading">
                  Immediate access to medical professionals
                </h2>
                <p className="cta-text">
                  Get connected to a doctor right away.
                </p>
                <button
                  className="consult-now-btn"
                  onClick={() => navigate("/login")}
                >
                  Consult Now
                </button>
              </div>
              <div className="phone-mockup">
                <img
                  src={phoneImage}
                  alt="Mobile App Preview"
                  className="phone-image"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
