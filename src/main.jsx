import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './Login & Registration/Login.jsx';
import Registration from './Login & Registration/Registration.jsx';
import RegistrationOptions from './Login & Registration/RegistrationOptions.jsx';
import GuardianRegistration from './Login & Registration/GuardianRegistration.jsx';
import FamilyRegistration from './Login & Registration/FamilyRegistration.jsx';
import SpecialistLogin from './Login & Registration/SpecialistLogin.jsx';
import SpecialistRegistration from './Login & Registration/SpecialistRegistration.jsx';
import Dashboard from './Nurse/Dashboard.jsx';
import Notifications from './Nurse/Notifications.jsx';
import MyAccount from './Nurse/MyAccount.jsx';
import ManageAppointments from './Nurse/ManageAppointments.jsx';
import Messages from './Nurse/Messages.jsx';
import PatientDashboard from './Patient/jsx/Patient_Dashboard.jsx';
import ModalProvider from './Patient/contexts/Modals.jsx'; 
import SpecialistDashboard2 from './Specialists/SpecialistDashboard.jsx';
import PendingVerification from './Specialists/PendingVerification.jsx';
import DeniedVerification from './Specialists/DeniedVerification.jsx';
import SuperAdminDashboard from './Admin/SuperAdminDashboard.jsx';
import NurseAdminDashboard from './Admin/NurseAdminDashboard.jsx';
import BarangayAdminDashboard from './Admin/BarangayAdminDashboard.jsx';
import CommercialPage from './CommercialPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import VideoCallPage from './components/VideoCall/VideoCallPage.jsx';

import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

// Configure Sails Socket Client
const apiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:1337";
const isProd = import.meta.env.MODE === "production";

const loadSailsSocket = () => {
  const script = document.createElement("script");
  script.src = `${apiUrl}/dependencies/sails.io.js`;
  script.onload = () => {
    if (window.io && window.io.sails) {
      window.io.sails.url = apiUrl;
      window.io.sails.useCORSRouteToGetCookie = true;
      window.io.sails.transports = ["websocket", "polling"];
      // Ensure it connects
      if (typeof window.io.socket.connect === "function") {
        window.io.socket.connect();
      }
      // console.log('Sails.io.js loaded and configured for:', apiUrl);
    }
  };
  script.onerror = () => {
    console.warn(
      "[Socket] Failed to load sails.io.js - real-time features will be unavailable",
    );
  };
  script.async = true;
  document.head.appendChild(script);
};

loadSailsSocket();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CommercialPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<RegistrationOptions />} />
            <Route path='/registration-details' element={<Registration />} />
            <Route path='/registration-child' element={<GuardianRegistration />} />
            <Route path='/registration-family' element={<FamilyRegistration />} />
            <Route path="/specialist-login" element={<SpecialistLogin />} />
            <Route
              path="/video-call"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "nurse",
                    "admin",
                    "super_admin",
                    "nurse_admin",
                    "barangay_admin",
                    "patient",
                    "specialist",
                  ]}
                >
                  <VideoCallPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/specialist-registration"
              element={<SpecialistRegistration />}
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/specialist-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/nurse-dashboard"
              element={
                <ProtectedRoute allowedRoles={['nurse_admin']}>
                  <NurseAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/barangay-dashboard"
              element={
                <ProtectedRoute allowedRoles={['barangay_admin']}>
                  <BarangayAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Nurse Routes */}
            <Route
              path="/nurse-dashboard"
              element={
                <ProtectedRoute allowedRoles={["nurse"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-notifications"
              element={
                <ProtectedRoute allowedRoles={["nurse"]}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-myaccount"
              element={
                <ProtectedRoute allowedRoles={["nurse"]}>
                  <MyAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-manage-appointments"
              element={
                <ProtectedRoute allowedRoles={["nurse"]}>
                  <ManageAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nurse-messages"
              element={
                <ProtectedRoute allowedRoles={["nurse"]}>
                  <Messages />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <ModalProvider>
                    <PatientDashboard />
                  </ModalProvider>
                </ProtectedRoute>
              }
            />

            {/* Specialist Routes */}
            <Route
              path="/specialist-dashboard"
              element={
                <ProtectedRoute allowedRoles={["specialist"]}>
                  <SpecialistDashboard2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/specialist-pending"
              element={
                <ProtectedRoute allowedRoles={["specialist"]}>
                  <PendingVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/specialist-denied"
              element={
                <ProtectedRoute allowedRoles={["specialist"]}>
                  <DeniedVerification />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
);