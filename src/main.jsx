import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./App.css";
import App from "./App.jsx";
import Login from "./Login & Registration/Login.jsx";
import Registration from "./Login & Registration/Registration.jsx";
import Dashboard from "./Nurse/Dashboard.jsx";
import Notifications from "./Nurse/Notifications.jsx";
import MyAccount from "./Nurse/MyAccount.jsx";
import ManageAppointments from "./Nurse/ManageAppointments.jsx";
import Messages from "./Nurse/Messages.jsx";
import SpecialistDashboard from "./Admin/Specialistdashboard/SpecialistDashboard.jsx";
import PatientDashboard from "./Patient/jsx/PatientDashboard.jsx";
import SpecialistDashboard2 from "./Specialists/SpecialistDashboard.jsx";
import SpecialistLogin from "./Login & Registration/SpecialistLogin.jsx";
import SpecialistRegistration from "./Login & Registration/SpecialistRegistration.jsx";
import CommercialPage from "./CommercialPage.jsx";

async function enableMocking() {
  // Enable MSW mocking if in development OR if specifically requested via env flag (e.g. on Vercel QA)
  if (import.meta.env.MODE !== 'development' && import.meta.env.VITE_USE_MOCK_API !== 'true') {
    return
  }

  const { worker } = await import('./mocks/browser')

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CommercialPage />} />
          <Route path="/loading" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/specialist-login" element={<SpecialistLogin />} />
          <Route
            path="/specialist-registration"
            element={<SpecialistRegistration />}
          />
          <Route path="/nurse-dashboard" element={<Dashboard />} />
          <Route path="/nurse-notifications" element={<Notifications />} />
          <Route path="/nurse-myaccount" element={<MyAccount />} />
          <Route
            path="/nurse-manage-appointments"
            element={<ManageAppointments />}
          />
          <Route path="/nurse-messages" element={<Messages />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/admin/specialist-dashboard"
            element={<SpecialistDashboard />}
          />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route
            path="/specialist-dashboard"
            element={<SpecialistDashboard2 />}
          />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
});
