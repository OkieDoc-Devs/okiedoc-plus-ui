import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PendingTable from "./PendingTable";
import SpecialistTable from "./SpecialistTable";
import ConsultationHistory from "../ConsultationHistory/ConsultationHistory";
import Header from "../Components/Header";
import Modal from "../Components/Modal";
import UserTable from "../UserManagement/UserTable.jsx";
import '../UserManagement/UserTable.css';

import ChatOversight from "../ChatOversight/ChatOversight.jsx";
import { handleExport } from "../utils/exportUtils";
import "./SpecialistDashboard.css";
import "../ConsultationHistory/ConsultationHistory.css";
import "../ChatOversight/ChatOversight.css";

// Import API
import {
  getSpecialists,
  getPendingApplications,
  getTransactions,
  getConsultations,
  getPatientAndNurseUsers,
  updateUser,
  deleteUser,
} from "../../api/Admin/api.js";

import FemaleAvatar from "../../assets/Female_Avatar.png";
import MaleAvatar from "../../assets/Male_Avatar.png";
import S2 from "../../assets/S2.png";
import PRC from "../../assets/PRC_Sample.jpg";
import PTR from "../../assets/PTR.png";
import esig from "../../assets/esig.png";

const SpecialistDashboard = () => {

  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);

  // State for Modals
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [systemFees, setSystemFees] = useState({
    doctorsFee: { isActive: true, name: "Doctor's Fee" },
    processingFee: { isActive: true, name: "Processing Fee" },
    convenienceFee: { isActive: true, name: "Convenience Fee" },
  });
  const [discount, setDiscount] = useState({
    name: "Discount",
    type: "percentage",
    value: 0,
    isActive: false,
  });
  const [notes, setNotes] = useState({ checkout: "", isActive: true });

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const [
          specialistsData,
          pendingData,
          transactionsData,
          consultationsData,
          usersData,
        ] = await Promise.all([
          getSpecialists(),
          getPendingApplications(),
          getTransactions(),
          getConsultations(),
          getPatientAndNurseUsers(),
        ]);

        // Extract arrays from response objects if needed
        const specialistsArray = Array.isArray(specialistsData) 
          ? specialistsData 
          : (specialistsData?.specialists || specialistsData?.data || []);
        const pendingArray = Array.isArray(pendingData)
          ? pendingData
          : (pendingData?.applications || pendingData?.data || []);
        const transactionsArray = Array.isArray(transactionsData)
          ? transactionsData
          : (transactionsData?.transactions || transactionsData?.data || []);
        const consultationsArray = Array.isArray(consultationsData)
          ? consultationsData
          : (consultationsData?.consultations || consultationsData?.data || []);
        const usersArray = Array.isArray(usersData)
          ? usersData
          : (usersData?.users || usersData?.data || []);

        const processedSpecialists = (specialistsArray || []).map((spec, index) => {
            const nameParts = (spec.name || '').split(' ');
            const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : (spec.name || '');
            const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';
            return {
              ...spec,
              firstName: firstName,
              lastName: lastName,
              details: {
                s2: { number: spec.s2Number || "S2-FETCHED", imageUrl: S2 },
                ptr: { number: spec.ptrNumber || "PTR-FETCHED", imageUrl: PTR },
                prcId: { number: spec.prcIdNumber || "PRC-FETCHED", imageUrl: PRC },
                eSig: esig,
                profilePicture: index % 2 === 0 ? MaleAvatar : FemaleAvatar,
                specializations: [spec.specialization || 'Unknown'],
                subspecializations: ["Sub-specialty Placeholder"],
              },
            };
        });

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
        setTransactions(transactionsArray || []);
        setConsultations(consultationsArray || []);
        setUsers(usersArray || []); // Set the new users state

      } catch (error) {
        console.error("Failed to fetch dashboard data from backend:", error);
        if (!users || users.length === 0) {
           setUsers([
             { id: 'p1', userType: 'Patient', firstName: 'John', lastName: 'Doe', email: 'patient@gmail.com', mobileNumber: '98765485', subscription: 'Paid' },
             { id: 'n1', userType: 'Nurse', firstName: 'Leslie', lastName: 'Rowland', email: 'les@row@gmail.com', mobileNumber: '97685334', subscription: 'Free' }
           ]);
        }
      }
    };

    fetchAndProcessData();
  }, []);

  const handleFeeToggle = (feeName) => setSystemFees((prev) => ({ ...prev, [feeName]: { ...prev[feeName], isActive: !prev[feeName].isActive } }));
  const handleDiscountToggle = () => setDiscount((prev) => ({ ...prev, isActive: !prev.isActive }));
  const handleNotesToggle = () => setNotes((prev) => ({ ...prev, isActive: !prev.isActive }));

  const allSpecializations = [
     ...new Set([
       ...(pendingApplications || []).flatMap((app) => app.details?.specializations || []),
       ...(specialists || []).flatMap((spec) => spec.details?.specializations || []),
       ...(transactions || []).map(t => t.specialty)
     ].filter(Boolean)),
   ].sort();


  const filteredPending = (pendingApplications || []).filter((app) => {
    const searchString = `${app.name || ''} ${app.email || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || searchString.includes(searchTerm.toLowerCase());
    const matchesFilter = !filterSpecialization || (app.details?.specializations || []).includes(filterSpecialization);
    return matchesSearch && matchesFilter;
  });

  const filteredSpecialists = (specialists || []).filter((spec) => {
    const searchString = `${spec.firstName || ''} ${spec.lastName || ''} ${spec.email || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || searchString.includes(searchTerm.toLowerCase());
    const matchesFilter = !filterSpecialization || (spec.details?.specializations || []).includes(filterSpecialization);
    return matchesSearch && matchesFilter;
  });

  const filteredTransactions = (transactions || []).filter(t => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (t.patientName || '').toLowerCase().includes(lowerSearchTerm) ||
      (t.specialistName || '').toLowerCase().includes(lowerSearchTerm) ||
      (t.status || '').toLowerCase().includes(lowerSearchTerm);

    const matchesSpecialty = !filterSpecialization || t.specialty === filterSpecialization;
    const matchesStatus = !filterStatus || t.status === filterStatus;
    const transactionDate = t.date ? new Date(t.date) : null;
    const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
    const toDate = filterDateTo ? new Date(filterDateTo) : null;

    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    const matchesDate = !fromDate && !toDate ||
                        (transactionDate &&
                        (!fromDate || transactionDate >= fromDate) &&
                        (!toDate || transactionDate <= toDate));

    return matchesSearch && matchesSpecialty && matchesStatus && matchesDate;
  });

  const filteredUsers = (users || []).filter(user => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const searchString = `${user.firstName || ''} ${user.lastName || ''} ${user.email || ''} ${user.mobileNumber || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || searchString.includes(lowerSearchTerm);
    return matchesSearch;
  });

  const filteredConsultations = consultations || [];


  const handleUpdateUser = async (updatedUser) => {
    // Simulate API call
    try {
      console.log("Simulating update for user:", updatedUser);
      setUsers(prevUsers => 
        prevUsers.map(user => 
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
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== deletingUser.id)
      );
      alert("User deleted successfully! (Simulated)");
      setDeletingUser(null); // Close confirmation modal
    } catch (error) {
      alert("Failed to delete user. (Simulated)");
    }
  };
  

  return (
    <>
      <Header />
      <main className="dashboard-container">
        
        {/* FIX: Hide main toolbar if on settings, chats, OR consultations tab */}
        {activeTab !== "settings" && activeTab !== "chats" && activeTab !== "consultations" && (
          <div className="toolbar">
            <div className="filters">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Specialization filter (only show on specialist/pending tabs) */}
              {(activeTab === "pending" || activeTab === "list" || activeTab === "transactions") && (
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
              
              {/* Transaction-specific filters */}
              {activeTab === "transactions" && (
                <>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Filter by Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="For Payment">For Payment</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Incomplete">Incomplete</option>
                    <option value="Completed">Completed</option>
                  </select>
                   <label htmlFor="dateFrom" style={{marginLeft: '10px', fontSize: '0.9rem'}}>From:</label>
                  <input id="dateFrom" type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                   <label htmlFor="dateTo" style={{marginLeft: '10px', fontSize: '0.9rem'}}>To:</label>
                  <input id="dateTo" type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                  <button
                     className="action-btn btn-primary"
                     style={{ backgroundColor: "#0B5388", marginLeft: 'auto' }}
                     onClick={() => handleExport(filteredTransactions)}
                     disabled={filteredTransactions.length === 0}
                   >
                    Export CSV
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="tabs">
          <button className={`tab-link ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>
            Pending Applications {filteredPending.length > 0 && <span className="badge">{filteredPending.length}</span>}
          </button>
          <button className={`tab-link ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>
            OkieDoc+ Specialists
          </button>
          <button className={`tab-link ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
            User Management
          </button>
          <button className={`tab-link ${activeTab === "transactions" ? "active" : ""}`} onClick={() => setActiveTab("transactions")}>
            Transaction History
          </button>
          <button className={`tab-link ${activeTab === "chats" ? "active" : ""}`} onClick={() => setActiveTab("chats")}>
            Chat Consultations
          </button>
          <button className={`tab-link ${activeTab === "consultations" ? "active" : ""}`} onClick={() => setActiveTab("consultations")}>
            Consultation History
          </button>
          <button className={`tab-link ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
            System Fee Settings
          </button>
        </div>

        {/* Conditional Rendering based on activeTab */}

        {activeTab === "pending" && <PendingTable applications={filteredPending} />}
        {activeTab === "list" && <SpecialistTable specialists={filteredSpecialists} />}

        {/* NEW TAB CONTENT FOR USER MANAGEMENT */}
        {activeTab === "users" && (
          <UserTable
            users={filteredUsers}
            onView={setViewingUser}
            onUpdate={handleUpdateUser}
            onDelete={setDeletingUser}
          />
        )}

        {activeTab === 'transactions' && (
          <div id="transactions" className="tab-content active">
            <h2>Transaction History & Management</h2>
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr><th>Patient Name</th><th>Specialist</th><th>Specialty</th><th>Date</th><th>Status</th><th>Channel</th></tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                    <tr key={t.id}>
                      <td>{t.patientName}</td><td>{t.specialistName}</td><td>{t.specialty}</td><td>{new Date(t.date).toLocaleDateString()}</td><td>{t.status}</td><td>{t.channel}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{textAlign: 'center'}}>No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "chats" && (
          <div className="tab-content active" id="chat-consultations-wrapper">
            <ChatOversight />
          </div>
        )}

        {activeTab === "consultations" && <ConsultationHistory consultations={filteredConsultations} />}

        {activeTab === "settings" && (
          <div id="settings" className="tab-content active settings-tab-content">
            <h2>System Fee & Discount Settings</h2>
            <div className="settings-grid">
              <div className="settings-card">
                <h3>System Fees</h3>
                {Object.entries(systemFees).map(([key, fee]) => (
                  <div className="settings-item" key={key}>
                    <span>{fee.name}</span>
                    <label className="switch"><input type="checkbox" checked={fee.isActive} onChange={() => handleFeeToggle(key)} /><span className="slider round"></span></label>
                  </div>
                ))}
              </div>
              <div className="settings-card">
                <h3>Discount</h3>
                <div className="settings-item">
                  <span>Activate Discount</span>
                  <label className="switch"><input type="checkbox" checked={discount.isActive} onChange={handleDiscountToggle} /><span className="slider round"></span></label>
                </div>
                {discount.isActive && (
                  <>
                    <div className="settings-item"><label>Discount Type:</label><select value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value })}><option value="percentage">Percentage (%)</option><option value="peso">Peso (₱)</option></select></div>
                    <div className="settings-item"><label>Discount Value:</label><input type="number" value={discount.value} onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}/></div>
                  </>
                )}
              </div>
              <div className="settings-card notes-card">
                <h3>Checkout Notes</h3>
                <div className="settings-item">
                  <span>Display Notes on Checkout</span>
                  <label className="switch"><input type="checkbox" checked={notes.isActive} onChange={handleNotesToggle} /><span className="slider round"></span></label>
                </div>
                {notes.isActive && (
                  <div className="settings-item-full">
                    <label htmlFor="checkout-notes-textarea">Notes to Display:</label>
                    <textarea id="checkout-notes-textarea" value={notes.checkout} onChange={(e) => setNotes({ ...notes, checkout: e.target.value })} rows="4" placeholder="Enter notes to show..."></textarea>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* View User Modal */}
      {viewingUser && (
        <Modal title="User Details" onClose={() => setViewingUser(null)}>
          <div id="modal-body">
            <p><strong>User Type:</strong> {viewingUser.userType}</p>
            <p><strong>First Name:</strong> {viewingUser.firstName}</p>
            <p><strong>Last Name:</strong> {viewingUser.lastName}</p>
            <p><strong>Email:</strong> {viewingUser.email}</p>
            <p><strong>Mobile:</strong> {viewingUser.mobileNumber}</p>
            <p><strong>Subscription:</strong> {viewingUser.subscription}</p>
          </div>
          <div className="modal-actions">
            <button className="action-btn btn-primary" onClick={() => setViewingUser(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <Modal title="Confirm Deletion" onClose={() => setDeletingUser(null)}>
          <div id="modal-body">
            <p>
              Are you sure you want to delete this user?
            </p>
            <p>
              <strong>{deletingUser.firstName} {deletingUser.lastName} ({deletingUser.email})</strong>
            </p>
            <p>This action cannot be undone.</p>
          </div>
          <div className="modal-actions">
            <button className="action-btn btn-primary" onClick={() => setDeletingUser(null)}>
              Cancel
            </button>
            <button className="action-btn btn-danger" onClick={handleDeleteUser}>
              Delete User
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SpecialistDashboard;