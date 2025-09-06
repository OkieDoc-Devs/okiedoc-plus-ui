import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import "./App.css";
import App from "./App.jsx";
import Login from "./Login & Registration/Login.jsx";
import Registration from "./Login & Registration/Registration.jsx";
import Dashboard from "./Nurse/Dashboard.jsx";
import Notifications from "./Nurse/Notifications.jsx";
import MyAccount from "./Nurse/MyAccount.jsx";
import ManageAppointments from "./Nurse/ManageAppointments.jsx";
import SpecialistDashboard from "./Admin/SpecialistDashboard/SpecialistDashboard.jsx";
import PatientDashboard from "./Patient/jsx/PatientDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/nurse-dashboard" element={<Dashboard />} />
        <Route path="/nurse-notifications" element={<Notifications />} />
        <Route path="/nurse-myaccount" element={<MyAccount />} />
        <Route
          path="/nurse-manage-appointments"
          element={<ManageAppointments />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/admin/specialistdashboard" element={<SpecialistDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
