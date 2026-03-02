import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PendingTable from "../Admin/Specialistdashboard/PendingTable";
import SpecialistTable from "../Admin/Specialistdashboard/SpecialistTable";
import ConsultationHistory from "../Admin/ConsultationHistory/ConsultationHistory";
import Modal from "../Admin/Components/Modal";
import UserTable from "../Admin/UserManagement/UserTable.jsx";
import "../Admin/UserManagement/UserTable.css";
import ChatOversight from "../Admin/ChatOversight/ChatOversight.jsx";
import "../Admin/Specialistdashboard/SpecialistDashboard.css";
import "../Admin/ConsultationHistory/ConsultationHistory.css";
import "../Admin/ChatOversight/ChatOversight.css";

// Import API
import {
  getSpecialists,
  getPendingApplications,
  getConsultations,
  getPatientAndNurseUsers,
  updateUser,
  deleteUser,
  logoutAdmin,
} from "../api/Admin/api.js";

import FemaleAvatar from "../assets/Female_Avatar.png";
import MaleAvatar from "../assets/Male_Avatar.png";
import S2 from "../assets/S2.png";
import PRC from "../assets/PRC_Sample.jpg";
import PTR from "../assets/PTR.png";
import esig from "../assets/esig.png";
import OkieDocLogo from "../assets/okie-doc-logo.png";

const NurseAdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");

  const [pendingApplications, setPendingApplications] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);

  // State for Modals
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const [
          specialistsData,
          pendingData,
          consultationsData,
          usersData,
        ] = await Promise.all([
          getSpecialists(),
          getPendingApplications(),
          getConsultations(),
          getPatientAndNurseUsers(),
        ]);

        const specialistsArray = Array.isArray(specialistsData)
          ? specialistsData
          : specialistsData?.specialists || specialistsData?.data || [];
        const pendingArray = Array.isArray(pendingData)
          ? pendingData
          : pendingData?.applications || pendingData?.data || [];
        const consultationsArray = Array.isArray(consultationsData)
          ? consultationsData
          : consultationsData?.consultations || consultationsData?.data || [];
        const usersArray = Array.isArray(usersData)
          ? usersData
          : usersData?.users || usersData?.data || [];

        const processedSpecialists = (specialistsArray || []).map(
          (spec, index) => {
            const nameParts = (spec.name || "").split(" ");
            const firstName =
              nameParts.length > 1
                ? nameParts.slice(0, -1).join(" ")
                : spec.name || "";
            const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : "";
            return {
              ...spec,
              firstName,
              lastName,
              details: {
                s2: { number: spec.s2Number || "S2-FETCHED", imageUrl: S2 },
                ptr: { number: spec.ptrNumber || "PTR-FETCHED", imageUrl: PTR },
                prcId: {
                  number: spec.prcIdNumber || "PRC-FETCHED",
                  imageUrl: PRC,
                },
                eSig: esig,
                profilePicture: index % 2 === 0 ? MaleAvatar : FemaleAvatar,
                specializations: [spec.specialization || "Unknown"],
                subspecializations: ["Sub-specialty Placeholder"],
              },
            };
          }
        );

        const processedPending = (pendingArray || []).map((app, index) => ({
          ...app,
          details: {
            ...(app.details || {}),
            s2: { number: app.s2Number || "S2-PENDING", imageUrl: S2 },
            ptr: { number: app.ptrNumber || "PTR-PENDING", imageUrl: PTR },
            prcId: { number: app.prcIdNumber || "PRC-PENDING", imageUrl: PRC },
            eSig: esig,
            profilePicture: index % 2 === 0 ? FemaleAvatar : MaleAvatar,
            specializations: app.specializations || [],
            subspecializations: app.subspecializations || [],
          },
        }));

        setSpecialists(processedSpecialists);
        setPendingApplications(processedPending);
        setConsultations(consultationsArray || []);
        setUsers(usersArray || []);
      } catch (error) {
        console.error("Failed to fetch nurse admin dashboard data:", error);
        if (!users || users.length === 0) {
          setUsers([
            {
              id: "p1",
              userType: "Patient",
              firstName: "John",
              lastName: "Doe",
              email: "patient@gmail.com",
              mobileNumber: "98765485",
              subscription: "Paid",
            },
            {
              id: "n1",
              userType: "Nurse",
              firstName: "Leslie",
              lastName: "Rowland",
              email: "leslie@row.com",
              mobileNumber: "97685334",
              subscription: "Free",
            },
          ]);
        }
      }
    };

    fetchAndProcessData();
  }, []);

  const allSpecializations = [
    ...new Set(
      [
        ...(pendingApplications || []).flatMap(
          (app) => app.details?.specializations || []
        ),
        ...(specialists || []).flatMap(
          (spec) => spec.details?.specializations || []
        ),
      ].filter(Boolean)
    ),
  ].sort();

  const filteredPending = (pendingApplications || []).filter((app) => {
    const searchString = `${app.name || ""} ${app.email || ""}`.toLowerCase();
    const matchesSearch =
      !searchTerm || searchString.includes(searchTerm.toLowerCase());
    const matchesFilter =
      !filterSpecialization ||
      (app.details?.specializations || []).includes(filterSpecialization);
    return matchesSearch && matchesFilter;
  });

  const filteredSpecialists = (specialists || []).filter((spec) => {
    const searchString =
      `${spec.firstName || ""} ${spec.lastName || ""} ${spec.email || ""}`.toLowerCase();
    const matchesSearch =
      !searchTerm || searchString.includes(searchTerm.toLowerCase());
    const matchesFilter =
      !filterSpecialization ||
      (spec.details?.specializations || []).includes(filterSpecialization);
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = (users || []).filter((user) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const searchString =
      `${user.firstName || ""} ${user.lastName || ""} ${user.email || ""} ${user.mobileNumber || ""}`.toLowerCase();
    return !searchTerm || searchString.includes(lowerSearchTerm);
  });

  const filteredConsultations = consultations || [];

  const handleUpdateUser = async (updatedUser) => {
    try {
      console.log("Simulating update for user:", updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      alert("User updated successfully! (Simulated)");
    } catch (error) {
      alert("Failed to update user. (Simulated)");
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      console.log("Simulating delete for user:", deletingUser);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deletingUser.id)
      );
      alert("User deleted successfully! (Simulated)");
      setDeletingUser(null);
    } catch (error) {
      alert("Failed to delete user. (Simulated)");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error("Nurse Admin logout API call failed:", error);
    } finally {
      sessionStorage.removeItem("isNurseAdminLoggedIn");
      localStorage.removeItem("nurse_admin_token");
      navigate("/login");
    }
  };

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <div className="header-center">
          <img src={OkieDocLogo} alt="Okie-Doc+" className="logo-image" />
        </div>
        <h3 className="dashboard-title">Nurse Admin Dashboard</h3>
        <div className="user-account">
          <img src="/account.svg" alt="Account" className="account-icon" />
          <span className="account-name">Nurse Admin</span>
          <div className="account-dropdown">
            <button
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="dashboard-nav">
          <button
            className={`nav-tab ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Applications
            {filteredPending.length > 0 && (
              <span className="badge">{filteredPending.length}</span>
            )}
          </button>
          <button
            className={`nav-tab ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            OkieDoc+ Specialists
          </button>
          <button
            className={`nav-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            User Management
          </button>
          <button
            className={`nav-tab ${activeTab === "chats" ? "active" : ""}`}
            onClick={() => setActiveTab("chats")}
          >
            Chat Consultations
          </button>
          <button
            className={`nav-tab ${activeTab === "consultations" ? "active" : ""}`}
            onClick={() => setActiveTab("consultations")}
          >
            Consultation History
          </button>
        </div>
      </div>

      <main className="dashboard-container">
        {activeTab !== "chats" && activeTab !== "consultations" && (
          <div className="toolbar">
            <div className="filters">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {(activeTab === "pending" || activeTab === "list") && (
                <select
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                  disabled={allSpecializations.length === 0}
                >
                  <option value="">Filter by Specialization</option>
                  {allSpecializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {activeTab === "pending" && (
          <PendingTable applications={filteredPending} />
        )}
        {activeTab === "list" && (
          <SpecialistTable specialists={filteredSpecialists} />
        )}
        {activeTab === "users" && (
          <UserTable
            users={filteredUsers}
            onView={setViewingUser}
            onUpdate={handleUpdateUser}
            onDelete={setDeletingUser}
          />
        )}
        {activeTab === "chats" && (
          <div className="tab-content active" id="chat-consultations-wrapper">
            <ChatOversight />
          </div>
        )}
        {activeTab === "consultations" && (
          <ConsultationHistory consultations={filteredConsultations} />
        )}
      </main>

      {/* View User Modal */}
      {viewingUser && (
        <Modal title="User Details" onClose={() => setViewingUser(null)}>
          <div id="modal-body">
            <p>
              <strong>User Type:</strong> {viewingUser.userType}
            </p>
            <p>
              <strong>First Name:</strong> {viewingUser.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {viewingUser.lastName}
            </p>
            <p>
              <strong>Email:</strong> {viewingUser.email}
            </p>
            <p>
              <strong>Mobile:</strong> {viewingUser.mobileNumber}
            </p>
            <p>
              <strong>Subscription:</strong> {viewingUser.subscription}
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="action-btn btn-primary"
              onClick={() => setViewingUser(null)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <Modal title="Confirm Deletion" onClose={() => setDeletingUser(null)}>
          <div id="modal-body">
            <p>Are you sure you want to delete this user?</p>
            <p>
              <strong>
                {deletingUser.firstName} {deletingUser.lastName} (
                {deletingUser.email})
              </strong>
            </p>
            <p>This action cannot be undone.</p>
          </div>
          <div className="modal-actions">
            <button
              className="action-btn btn-primary"
              onClick={() => setDeletingUser(null)}
            >
              Cancel
            </button>
            <button
              className="action-btn btn-danger"
              onClick={handleDeleteUser}
            >
              Delete User
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NurseAdminDashboard;
