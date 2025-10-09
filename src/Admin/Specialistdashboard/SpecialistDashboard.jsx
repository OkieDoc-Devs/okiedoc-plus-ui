import React, { useState, useEffect } from "react";
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
import ConsultationHistory from "../ConsultationHistory/ConsultationHistory";

import {
  getSpecialists,
  getPendingApplications,
  getTransactions,
  getConsultations,
  logoutAdmin,
} from "../../api/Admin/api.js";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin(); 
    sessionStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };
  return (
    <header>
      <img src={OkieDocLogo} alt="OkieDoc Logo" className="logo-image" />
      <h1>Admin Dashboard</h1>
      <button id="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

const SpecialistDashboard = () => {
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      const originalMaxWidth = root.style.maxWidth;
      const originalPadding = root.style.padding;
      const originalMargin = root.style.margin;
      root.style.maxWidth = '95%';
      root.style.padding = '1';
      root.style.margin = '1';
      return () => {
        root.style.maxWidth = originalMaxWidth;
        root.style.padding = originalPadding;
        root.style.margin = originalMargin;
      };
    }
  }, []);

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
        ] = await Promise.all([
          getSpecialists(),
          getPendingApplications(),
          getTransactions(),
          getConsultations(),
        ]);

        const processedSpecialists = (specialistsData || []).map((spec, index) => {
            const nameParts = spec.name.split(' ');
            const firstName = nameParts.slice(1, -1).join(' ');
            const lastName = nameParts.slice(-1)[0];
            return {
              ...spec,
              firstName: firstName,
              lastName: lastName,
              details: {
                s2: { number: "S2-FETCHED", imageUrl: S2 },
                ptr: { number: "PTR-FETCHED", imageUrl: PTR },
                prcId: { number: "PRC-FETCHED", imageUrl: PRC },
                eSig: esig,
                profilePicture: index % 2 === 0 ? MaleAvatar : FemaleAvatar,
                specializations: [spec.specialization],
                subspecializations: ["Sub-specialty from API"],
              },
            };
        });

        const processedPending = (pendingData || []).map((app, index) => ({
          ...app,
          details: {
            ...app.details,
            s2: { number: "S2-PENDING", imageUrl: S2 },
            ptr: { number: "PTR-PENDING", imageUrl: PTR },
            prcId: { number: "PRC-PENDING", imageUrl: PRC },
            eSig: esig,
            profilePicture: index % 2 === 0 ? FemaleAvatar : MaleAvatar,
          },
        }));

        // Update state with the processed data
        setSpecialists(processedSpecialists);
        setPendingApplications(processedPending);
        setTransactions(transactionsData || []);
        setConsultations(consultationsData || []);

      } catch (error) {
        console.error("Failed to fetch data from backend:", error);
        alert("Could not load dashboard data. Please make sure the backend server is running.");
      }
    };

    fetchAndProcessData();
  }, []);

  const handleFeeToggle = (feeName) => setSystemFees((prev) => ({ ...prev, [feeName]: { ...prev[feeName], isActive: !prev[feeName].isActive } }));
  const handleDiscountToggle = () => setDiscount((prev) => ({ ...prev, isActive: !prev.isActive }));
  const handleNotesToggle = () => setNotes((prev) => ({ ...prev, isActive: !prev.isActive }));

  const allSpecializations = [
    ...new Set([
      ...(pendingApplications || []).flatMap((app) => app.details.specializations),
      ...(specialists || []).flatMap((spec) => spec.details.specializations),
      ...(transactions || []).map(t => t.specialty)
    ].filter(Boolean)),
  ];

  const filteredPending = (pendingApplications || []).filter((app) => {
    const searchString = `${app.name} ${app.email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecialization
      ? app.details.specializations.includes(filterSpecialization)
      : true;
    return matchesSearch && matchesFilter;
  });

  const filteredSpecialists = (specialists || []).filter((spec) => {
    const searchString = `${spec.firstName} ${spec.lastName} ${spec.email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecialization
      ? spec.details.specializations.includes(filterSpecialization)
      : true;
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
    if (!t.date) return false;
    const transactionDate = new Date(t.date);
    const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
    const toDate = filterDateTo ? new Date(filterDateTo) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);
    const matchesDate = (!fromDate || transactionDate >= fromDate) && (!toDate || transactionDate <= toDate);
    return matchesSearch && matchesSpecialty && matchesStatus && matchesDate;
  });

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = ["ID", "Patient Name", "Specialist Name", "Specialty", "Date", "Status", "Channel", "Payment Method"];
    const rows = filteredTransactions.map(t => 
      [t.id, t.patientName, t.specialistName, t.specialty, t.date, t.status, t.channel, t.paymentMethod].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header />
      <main className="dashboard-container">
        {activeTab !== "settings" && (
          <div className="toolbar">
            <div className="filters">
              <input
                type="text"
                placeholder="Search..."
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
                  <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                  <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                  <button className="add-btn" style={{ backgroundColor: "#0B5388" }} onClick={handleExport}>
                    Export Tickets
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
          <button className={`tab-link ${activeTab === "transactions" ? "active" : ""}`} onClick={() => setActiveTab("transactions")}>
            Transaction History
          </button>
          <button className={`tab-link ${activeTab === "consultations" ? "active" : ""}`} onClick={() => setActiveTab("consultations")}>
            Consultation History
          </button>
          <button className={`tab-link ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
            System Fee Settings
          </button>
        </div>

        {activeTab === "pending" && <PendingTable applications={filteredPending} />}
        {activeTab === "list" && <SpecialistTable specialists={filteredSpecialists} />}
        
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
                      <td>{t.patientName}</td><td>{t.specialistName}</td><td>{t.specialty}</td><td>{t.date}</td><td>{t.status}</td><td>{t.channel}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{textAlign: 'center'}}>No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === "consultations" && <ConsultationHistory consultations={consultations} />}
        
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
    </>
  );
};

export default SpecialistDashboard;