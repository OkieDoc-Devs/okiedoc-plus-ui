import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import LandingPage from './LandingPage.tsx';
import SearchPage from './Search';
import SpecialistProfile from './SpecialistProfile';
import { NavBar } from './components/ui/NavBar';
import { Footer } from './components/ui/Footer.tsx';
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
import PatientDashboard from './Patient/jsx/Patient_App.jsx';
import ModalProvider from './Patient/contexts/Modals.jsx';
import SpecialistDashboard2 from './Specialists/SpecialistDashboard.jsx';
import PendingVerification from './Specialists/PendingVerification.jsx';
import DeniedVerification from './Specialists/DeniedVerification.jsx';
import SuperAdminDashboard from './Admin/SuperAdminDashboard.jsx';
import NurseAdminDashboard from './Admin/NurseAdminDashboard.jsx';
import BarangayAdminDashboard from './Admin/BarangayAdminDashboard.jsx';
import CreatePatient from './Admin/CreatePatient.jsx';
import SpecialistManagement from './Admin/SpecialistManagement.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import VideoCallPage from './components/VideoCall/VideoCallPage.jsx';
import AboutUs from './AboutUs.tsx';

import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

const apiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:1337';
const isProd = import.meta.env.MODE === 'production';

const loadSailsSocket = () => {
  const script = document.createElement('script');
  script.src = `${apiUrl}/dependencies/sails.io.js`;
  script.onload = () => {
    if (window.io && window.io.sails) {
      window.io.sails.url = apiUrl;
      window.io.sails.useCORSRouteToGetCookie = true;
      window.io.sails.transports = ['websocket', 'polling'];
      if (typeof window.io.socket.connect === 'function') {
        window.io.socket.connect();
      }
    }
  };
  script.onerror = () => {
    console.warn(
      '[Socket] Failed to load sails.io.js - real-time features will be unavailable',
    );
  };
  script.async = true;
  document.head.appendChild(script);
};

loadSailsSocket();

function AppContent() {
  const [activeView, setActiveView] = useState('patient');
  const location = useLocation();

  const hiddenNavFooterRoutes = [
    '/login',
    '/registration',
    '/registration-details',
    '/registration-child',
    '/registration-family',
    '/specialist-login',
    '/specialist-registration',
    '/patient-dashboard',
    '/admin',
    '/nurse-dashboard',
    '/nurse-myaccount',
    '/nurse-messages',
    '/nurse-manage-appointments',
    '/specialist-dashboard',
  ];

  const shouldHideNavFooter = hiddenNavFooterRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <>
      {!shouldHideNavFooter && (
        <NavBar activeView={activeView} setActiveView={setActiveView} />
      )}
      <Routes>
        <Route
          path='/'
          element={
            <LandingPage
              activeView={activeView}
              setActiveView={setActiveView}
            />
          }
        />
        <Route path='/aboutUs' element={<AboutUs />} />
        <Route path='/search' element={<SearchPage />} />
        <Route path='/specialist' element={<SpecialistProfile />} />
        <Route path='/login' element={<Login />} />
        <Route path='/registration' element={<RegistrationOptions />} />
        <Route path='/registration-options' element={<RegistrationOptions />} />
        <Route path='/registration-details' element={<Registration />} />
        <Route path='/registration-child' element={<GuardianRegistration />} />
        <Route path='/registration-family' element={<FamilyRegistration />} />
        <Route path='/specialist-login' element={<SpecialistLogin />} />

        <Route
          path='/video-call'
          element={
            <ProtectedRoute
              allowedRoles={[
                'nurse',
                'super_admin',
                'nurse_admin',
                'barangay_admin',
                'patient',
                'specialist',
              ]}
            >
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

        {/* Admin Routes */}
        <Route
          path='/admin/specialist-dashboard'
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/nurse-dashboard'
          element={
            <ProtectedRoute allowedRoles={['nurse_admin', 'nurseadmin']}>
              <NurseAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/barangay-dashboard'
          element={
            <ProtectedRoute allowedRoles={['barangay_admin', 'barangayadmin']}>
              <BarangayAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/create-patient'
          element={
            <ProtectedRoute allowedRoles={['nurse_admin', 'super_admin']}>
              <CreatePatient />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/specialist-management'
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <SpecialistManagement />
            </ProtectedRoute>
          }
        />

        {/* Patient Routes */}
        <Route
          path='/patient-dashboard'
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <ModalProvider>
                <PatientDashboard />
              </ModalProvider>
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
      {!shouldHideNavFooter && <Footer />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
);
