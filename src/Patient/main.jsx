import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import "./App.css";
import App from "./App.jsx";
import Login from "./Login & Registration/Login.jsx";
import Registration from "./Login & Registration/Registration.jsx";
import Dashboard from "./Nurse/Dashboard.jsx";
import PatientAuth from "./patient/login&registration/PatientAuth.jsx";
import {
  PatientDashboard,
  MyAccount,
  ConsultationHistory
} from "./patient/PatientDashboardTollsNav";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Temporarily commented out for patient login testing */}
        {/*<Route path="/" element={<App />} />*
        <Route path="/login" element={<Login />} /> 
        <Route path="/registration" element={<Registration />} /> 
        <Route path="/dashboard" element={<Dashboard />} />*/}
        
        {/* Patient Routes for Testing */}
        <Route path="/" element={<PatientAuth />} />
        <Route path="/patient-auth" element={<PatientAuth />} />
        <Route path="/patient-login-registration" element={<PatientAuth />} />
        
                        {/* Patient Dashboard Routes */}
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/patient-account" element={<MyAccount />} />
                <Route path="/patient-consultation-history" element={<ConsultationHistory />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
