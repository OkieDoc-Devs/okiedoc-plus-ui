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
import Appointments from "./Patient/jsx/Appointments.jsx";
import PatientMessages from "./Patient/jsx/Messages.jsx";
import MedicalRecords from "./Patient/jsx/MedicalRecords.jsx";
import LabResults from "./Patient/jsx/LabResults.jsx";
import Billing from "./Patient/jsx/Billing.jsx";
import ConsultationHistory from "./Patient/jsx/ConsultationHistory.jsx";
import PatientMyAccount from "./Patient/jsx/MyAccount.jsx";
import PatientLayout from "./Patient/jsx/PatientLayout.jsx";
import SpecialistDashboard2 from "./Specialists/SpecialistDashboard.jsx";
import SpecialistLogin from "./Login & Registration/SpecialistLogin.jsx";
import SpecialistRegistration from "./Login & Registration/SpecialistRegistration.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* MAIN ROUTES */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />

        {/* SPECIALISTS ROUTES */}
        <Route path="/specialist-login" element={<SpecialistLogin />} />
        <Route path="/specialist-registration" element={<SpecialistRegistration />} />
        <Route path="/admin/specialist-dashboard" element={<SpecialistDashboard />} />
        <Route path="/specialist-dashboard" element={<SpecialistDashboard2 />} />

        {/* NURSE ROUTES */}
        <Route path="/nurse-dashboard" element={<Dashboard />} />
        <Route path="/nurse-notifications" element={<Notifications />} />
        <Route path="/nurse-myaccount" element={<MyAccount />} />
        <Route path="/nurse-manage-appointments" element={<ManageAppointments />} />
        <Route path="/nurse-messages" element={<Messages />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* PATIENT PAGE ROUTES */}
        <Route path="/patient" element={<PatientLayout> <PatientDashboard /> </PatientLayout>}/>
        <Route path="/patient/appointments" element={<PatientLayout> <Appointments /> </PatientLayout>}/>
        <Route path="/patient/messages" element={<PatientLayout> <PatientMessages /> </PatientLayout>}/>
        <Route path="/patient/medical_records" element={<PatientLayout> <MedicalRecords /> </PatientLayout>}/>
        <Route path="/patient/lab_results" element={<PatientLayout> <LabResults /> </PatientLayout>}/>
        <Route path="/patient/consultation_billing" element={<PatientLayout> <Billing /> </PatientLayout>}/>
        <Route path="/patient/consultation_history" element={<PatientLayout> <ConsultationHistory /> </PatientLayout>}/>
        <Route path="/patient/account" element={<PatientLayout> <PatientMyAccount /> </PatientLayout>}/>
        <Route path="/patient-dashboard" element={<PatientDashboard />} />




      </Routes>
    </BrowserRouter>
  </StrictMode>
);
