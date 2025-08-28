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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/myaccount" element={<MyAccount />} />
        <Route path="/manage-appointments" element={<ManageAppointments />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
