import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PendingTable from "./PendingTable";
import SpecialistTable from "./SpecialistTable";
import "./SpecialistDashboard.css";
import FemaleAvatar from "../../assets/Female_Avatar.png";
import MaleAvatar from "../../assets/Male_Avatar.png";
import S2 from "../../assets/S2.png";
import PRC from "../../assets/PRC_Sample.jpg";
import PTR from "../../assets/PTR.png";
import esig from "../../assets/esig.png";
import OkieDocLogo from "../../assets/okie-doc-logo.png";

// Header component defined locally
const Header = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };
  return (
    <header>
      <img src={OkieDocLogo} alt="OkieDoc Logo" className="logo-image" />
      <h1>Management</h1>
      <button id="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

const SpecialistDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");

  const [pendingApplications, setPendingApplications] = useState([
    {
      id: "APP001",
      name: "Dr. Evelyn Reed",
      email: "evelyn.reed@clinic.com",
      date: "2025-08-20",
      details: {
        s2: { number: "S2-12345", imageUrl: S2 },
        ptr: { number: "PTR-67890", imageUrl: PTR },
        prcId: { number: "PRC-54321", imageUrl: PRC },
        eSig: esig,
        profilePicture: FemaleAvatar,
        specializations: ["Cardiology"],
        subspecializations: ["Interventional Cardiology"],
      },
    },
    {
      id: "APP002",
      name: "Dr. Samuel Chen",
      email: "sam.chen@med.com",
      date: "2025-08-18",
      details: {
        s2: { number: "S2-54321", imageUrl: S2 },
        ptr: { number: "PTR-98765", imageUrl: PTR },
        prcId: { number: "PRC-12345", imageUrl: PRC },
        eSig: esig,
        profilePicture: MaleAvatar,
        specializations: ["Dermatology"],
        subspecializations: ["Cosmetic Dermatology"],
      },
    },
    {
      id: "APP003",
      name: "Dr. Maria Garcia",
      email: "maria.garcia@health.org",
      date: "2025-08-22",
      details: {
        s2: { number: "S2-67890", imageUrl: S2 },
        ptr: { number: "PTR-12345", imageUrl: PTR },
        prcId: { number: "PRC-67890", imageUrl: PRC },
        eSig: esig,
        profilePicture: FemaleAvatar,
        specializations: ["Pediatrics", "Cardiology"],
        subspecializations: ["Pediatric Cardiology"],
      },
    },
  ]);

  const [specialists, setSpecialists] = useState([
    {
      id: "SPEC001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@okiedoc.com",
      status: "Active",
      details: {
        s2: { number: "S2-A1B2C", imageUrl: S2 },
        ptr: { number: "PTR-D3E4F", imageUrl: PTR },
        prcId: { number: "PRC-G5H6I", imageUrl: PRC },
        eSig: esig,
        profilePicture: MaleAvatar,
        specializations: ["Pediatrics"],
        subspecializations: ["General Pediatrics"],
      },
    },
    {
      id: "SPEC002",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@okiedoc.com",
      status: "Active",
      details: {
        s2: { number: "S2-J7K8L", imageUrl: S2 },
        ptr: { number: "PTR-M9N0O", imageUrl: PTR },
        prcId: { number: "PRC-P1Q2R", imageUrl: PRC },
        eSig: esig,
        profilePicture: FemaleAvatar,
        specializations: ["Cardiology"],
        subspecializations: ["Echocardiography"],
      },
    },
  ]);

  const handleAddSpecialist = (newSpecialist) => {
    const newId = `SPEC${String(specialists.length + 1).padStart(3, "0")}`;
    setSpecialists((prev) => [
      ...prev,
      { ...newSpecialist, id: newId, status: "Active" },
    ]);
  };

  const allSpecializations = [
    ...new Set([
      ...pendingApplications.flatMap((app) => app.details.specializations),
      ...specialists.flatMap((spec) => spec.details.specializations),
    ]),
  ];

  const filteredPending = pendingApplications.filter((app) => {
    const searchString = `${app.name} ${app.email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecialization
      ? app.details.specializations.includes(filterSpecialization)
      : true;
    return matchesSearch && matchesFilter;
  });

  const filteredSpecialists = specialists.filter((spec) => {
    const searchString =
      `${spec.firstName} ${spec.lastName} ${spec.email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecialization
      ? spec.details.specializations.includes(filterSpecialization)
      : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Header />
      <main className="dashboard-container">
        <div className="toolbar">
          <div className="filters">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
            >
              <option value="">Filter by Specialization</option>
              {allSpecializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab-link ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Applications
            {filteredPending.length > 0 && (
              <span className="badge">{filteredPending.length}</span>
            )}
          </button>
          <button
            className={`tab-link ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            OkieDoc+ Specialists
          </button>
        </div>

        {/* This logic ensures the active tab highlight is retained */}

        {activeTab === "pending" && (
          <PendingTable applications={filteredPending} />
        )}

        {activeTab === "list" && (
          <SpecialistTable
            specialists={filteredSpecialists}
            onAddSpecialist={handleAddSpecialist}
          />
        )}
      </main>
    </>
  );
};

// Consultation Histories 


import React, { useState } from "react";
import {
  downloadTreatmentPlanPDF,
  downloadPrescriptionPDF,
  downloadLabRequestPDF,
  downloadMedicalCertificatePDF,
  downloadMasterPDF,
  sendToEmail,
} from "./ConsultationHistory/pdfHelpers";

const SpecialistDashboard = ({ consultations }) => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Specialist Dashboard</h1>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Ticket</th>
            <th className="p-2 border">Patient</th>
            <th className="p-2 border">Complaint</th>
            <th className="p-2 border">Specialist</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {consultations.map((consultation, idx) => (
            <tr
              key={idx}
              className="border-b hover:bg-gray-100 cursor-pointer"
              onClick={() => setSelectedConsultation(consultation)}
            >
              <td className="p-2 border">{consultation.date}</td>
              <td className="p-2 border">{consultation.ticket}</td>
              <td className="p-2 border">{consultation.patientName}</td>
              <td className="p-2 border">{consultation.complaint}</td>
              <td className="p-2 border">{consultation.specialist}</td>
              <td
                className="p-2 border space-x-2"
                onClick={(e) => e.stopPropagation()} // stop row click
              >
                <button
                  onClick={() => downloadTreatmentPlanPDF(consultation)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Treatment
                </button>
                <button
                  onClick={() => downloadPrescriptionPDF(consultation)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Prescription
                </button>
                <button
                  onClick={() => downloadLabRequestPDF(consultation)}
                  className="bg-yellow-500 text-black px-2 py-1 rounded"
                >
                  Lab
                </button>
                <button
                  onClick={() => downloadMedicalCertificatePDF(consultation)}
                  className="bg-purple-500 text-white px-2 py-1 rounded"
                >
                  Certificate
                </button>
                <button
                  onClick={() => downloadMasterPDF(consultation)}
                  className="bg-indigo-600 text-white px-2 py-1 rounded"
                >
                  Master PDF
                </button>
                <button
                  onClick={() => sendToEmail(consultation)}
                  className="bg-gray-600 text-white px-2 py-1 rounded"
                >
                  Email
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal (only shows if a consultation is selected) */}
      {selectedConsultation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-3/4 max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Consultation - {selectedConsultation.patientName}
              </h2>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {/* Patient Info */}
            <div className="flex items-center space-x-4 mb-6">
              {selectedConsultation.patientImage && (
                <img
                  src={selectedConsultation.patientImage}
                  alt="Patient"
                  className="w-20 h-20 rounded-full border"
                />
              )}
              <div>
                <p><strong>Ticket:</strong> {selectedConsultation.ticket}</p>
                <p><strong>Date:</strong> {selectedConsultation.date}</p>
                <p><strong>Specialist:</strong> {selectedConsultation.specialist}</p>
              </div>
            </div>

            {/* Complaint & Notes */}
            <p><strong>Chief Complaint:</strong> {selectedConsultation.complaint}</p>
            <p className="mt-2"><strong>SOAP Notes:</strong> {selectedConsultation.soap}</p>
            <p className="mt-2"><strong>Doctor’s Note:</strong> {selectedConsultation.doctorsNote}</p>

            {/* Prescriptions */}
            <div className="mt-4">
              <strong>Prescriptions:</strong>
              <ul className="list-disc ml-6">
                {selectedConsultation.prescription?.map((p, idx) => (
                  <li key={idx}>
                    {p.brand} ({p.generic}) - {p.dosage} {p.form} × {p.quantity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lab Requests */}
            <div className="mt-4">
              <strong>Lab Requests:</strong>
              <ul className="list-disc ml-6">
                {selectedConsultation.labs?.map((l, idx) => (
                  <li key={idx}>
                    {l.test} - {l.remarks}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => downloadTreatmentPlanPDF(selectedConsultation)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Treatment PDF
              </button>
              <button
                onClick={() => downloadPrescriptionPDF(selectedConsultation)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Prescription PDF
              </button>
              <button
                onClick={() => downloadLabRequestPDF(selectedConsultation)}
                className="bg-yellow-500 text-black px-3 py-1 rounded"
              >
                */ Lab PDF
              </button>
              <button
                onClick={() => downloadMedicalCertificatePDF(selectedConsultation)}
                className="bg-purple-500 text-white px-3 py-1 rounded"
              >
                Certificate PDF
              </button>
              <button
                onClick={() => downloadMasterPDF(selectedConsultation)}
                className="bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Master PDF
              </button>
              <button
                onClick={() => sendToEmail(selectedConsultation)}
                className="bg-gray-600 text-white px-3 py-1 rounded"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default SpecialistDashboard;
