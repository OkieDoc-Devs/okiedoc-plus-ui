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


export default SpecialistDashboard;
