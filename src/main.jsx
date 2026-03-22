import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './Login & Registration/Login.jsx';
import Registration from './Login & Registration/Registration.jsx';
import Dashboard from './Nurse/Dashboard.jsx';
import Notifications from './Nurse/Notifications.jsx';
import MyAccount from './Nurse/MyAccount.jsx';
import ManageAppointments from './Nurse/ManageAppointments.jsx';
import Messages from './Nurse/Messages.jsx';
import SpecialistDashboard from './Admin/Specialistdashboard/SpecialistDashboard.jsx';
import NurseAdminDashboard from './NurseAdmin/NurseAdminDashboard.jsx';
import PatientDashboard from './Patient/jsx/PatientDashboard.jsx';
import SpecialistDashboard2 from './Specialists/SpecialistDashboard.jsx';
import SpecialistLogin from './Login & Registration/SpecialistLogin.jsx';
import SpecialistRegistration from './Login & Registration/SpecialistRegistration.jsx';
import PendingVerification from './Specialists/PendingVerification.jsx';
import DeniedVerification from './Specialists/DeniedVerification.jsx';
import CommercialPage from './CommercialPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import VideoCallPage from './components/VideoCall/VideoCallPage.jsx';

import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

// Configure Sails Socket Client
const apiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:1337';
const isProd = import.meta.env.MODE === 'production';

const loadSailsSocket = () => {
  const script = document.createElement('script');
  script.src = `${apiUrl}/socket/sails.io.js`;
  script.onload = () => {
    if (window.io && window.io.sails) {
      window.io.sails.url = apiUrl;
      window.io.sails.useCORSRouteToGetCookie = true;
      window.io.sails.transports = ['websocket', 'polling'];
      // Ensure it connects
      if (typeof window.io.socket.connect === 'function') {
        window.io.socket.connect();
      }
      console.log('Sails.io.js loaded and configured for:', apiUrl);
    }
  };
  document.head.appendChild(script);
};

loadSailsSocket();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<CommercialPage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/registration' element={<Registration />} />
            <Route path='/specialist-login' element={<SpecialistLogin />} />
            <Route
              path='/video-call'
              element={
                <ProtectedRoute allowedRoles={['nurse', 'admin', 'nurse_admin', 'nurseadmin', 'na', 'patient', 'specialist']}>
                  <VideoCallPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/specialist-registration'
              element={<SpecialistRegistration />}
            />
            {/* Nurse Routes */}
            <Route
              path='/nurse-dashboard'
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/nurse-notifications'
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path='/nurse-myaccount'
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <MyAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path='/nurse-manage-appointments'
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <ManageAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path='/nurse-messages'
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path='/admin/specialist-dashboard'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SpecialistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/nurse-admin-dashboard'
              element={
                <ProtectedRoute
                  allowedRoles={['nurse_admin', 'nurseadmin', 'na']}
                >
                  <NurseAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path='/patient-dashboard'
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Specialist Routes */}
            <Route
              path='/specialist-dashboard'
              element={
                <ProtectedRoute allowedRoles={['specialist']}>
                  <SpecialistDashboard2 />
                </ProtectedRoute>
              }
            />
            <Route
              path='/specialist-pending'
              element={
                <ProtectedRoute allowedRoles={['specialist']}>
                  <PendingVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path='/specialist-denied'
              element={
                <ProtectedRoute allowedRoles={['specialist']}>
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
