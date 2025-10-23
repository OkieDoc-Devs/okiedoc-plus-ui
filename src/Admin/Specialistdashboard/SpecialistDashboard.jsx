import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PendingTable from "./PendingTable";
import SpecialistTable from "./SpecialistTable";
import Header from "../Components/Header";
import ConsultationHistory from "../ConsultationHistory/ConsultationHistory";

import { handleExport } from "../utils/exportUtils";
import {
  getSpecialists,
  getPendingApplications,
  getTransactions,
  getConsultations,
} from "../../api/Admin/api.js";

import FemaleAvatar from "../../assets/Female_Avatar.png";
import MaleAvatar from "../../assets/Male_Avatar.png";
import S2 from "../../assets/S2.png";
import PRC from "../../assets/PRC_Sample.jpg";
import PTR from "../../assets/PTR.png";
import esig from "../../assets/esig.png";

import "./SpecialistDashboard.css";
import "../ConsultationHistory/ConsultationHistory.css";


const SpecialistDashboard = () => {
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      const originalStyles = {
        maxWidth: root.style.maxWidth,
        padding: root.style.padding,
        margin: root.style.margin,
      };
      root.style.maxWidth = '95%';
      root.style.padding = '0';
      root.style.margin = '0 auto';

      return () => {
        root.style.maxWidth = originalStyles.maxWidth;
        root.style.padding = originalStyles.padding;
        root.style.margin = originalStyles.margin;
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

        const processedPending = (pendingData || []).map((app, index) => ({
          ...app,
          details: {
            ...(app.details || {}),
            s2: { number: app.s2Number || "S2-PENDING", imageUrl: S2 },
            ptr: { number: app.ptrNumber || "PTR-PENDING", imageUrl: PTR },
            prcId: { number: app.prcIdNumber || "PRC-PENDING", imageUrl: PRC },
            eSig: esig, // Placeholder
            profilePicture: index % 2 === 0 ? FemaleAvatar : MaleAvatar,
            specializations: app.specializations || [],
            subspecializations: app.subspecializations || [],
          },
        }));

        setSpecialists(processedSpecialists);
        setPendingApplications(processedPending);
        setTransactions(transactionsData || []);
        setConsultations(consultationsData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data from backend:", error);
        alert("Could not load dashboard data. Please check the connection or try again later.");
      }
    };

    fetchAndProcessData();
  }, []);

   const handleFeeToggle = (feeKey) => {
    setSystemFees((prev) => ({
      ...prev,
      [feeKey]: { ...prev[feeKey], isActive: !prev[feeKey].isActive },
    }));
  };

   const handleDiscountToggle = () => {
     setDiscount((prev) => ({ ...prev, isActive: !prev.isActive }));
   };

   const handleNotesToggle = () => {
     setNotes((prev) => ({ ...prev, isActive: !prev.isActive }));
   };

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
   const filteredConsultations = consultations || [];

  return (
    <>
      <Header />
      <main className="dashboard-container">
        {activeTab !== "settings" && (
          <div className="toolbar">
            <div className="filters">
              <input
                type="text"
                placeholder="Search by Name, Email, Status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
          <button
             className={`tab-link ${activeTab === "pending" ? "active" : ""}`}
             onClick={() => setActiveTab("pending")}
           >
            Pending Applications
            {filteredPending.length > 0 && <span className="badge">{filteredPending.length}</span>}
          </button>
          <button
             className={`tab-link ${activeTab === "list" ? "active" : ""}`}
             onClick={() => setActiveTab("list")}
           >
            OkieDoc+ Specialists
          </button>
          <button
             className={`tab-link ${activeTab === "transactions" ? "active" : ""}`}
             onClick={() => setActiveTab("transactions")}
           >
            Transaction History
          </button>
           <button
             className={`tab-link ${activeTab === "consultations" ? "active" : ""}`}
             onClick={() => setActiveTab("consultations")}
           >
            Consultation History
          </button>
          <button
             className={`tab-link ${activeTab === "settings" ? "active" : ""}`}
             onClick={() => setActiveTab("settings")}
           >
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
                  <tr>
                    <th>Patient Name</th>
                    <th>Specialist</th>
                    <th>Specialty</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(t => (
                      <tr key={t.id}>
                        <td>{t.patientName || 'N/A'}</td>
                        <td>{t.specialistName || 'N/A'}</td>
                        <td>{t.specialty || 'N/A'}</td>
                        <td>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                        <td>{t.status || 'N/A'}</td>
                        <td>{t.channel || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>
                        No transactions found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={fee.isActive}
                        onChange={() => handleFeeToggle(key)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="settings-card">
                <h3>Discount</h3>
                <div className="settings-item">
                  <span>Activate Discount</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={discount.isActive}
                      onChange={handleDiscountToggle}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                {discount.isActive && (
                  <>
                    <div className="settings-item">
                      <label>Discount Type:</label>
                      <select
                        value={discount.type}
                        onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="peso">Peso (₱)</option>
                      </select>
                    </div>
                    <div className="settings-item">
                      <label>Discount Value:</label>
                      <input
                        type="number"
                        value={discount.value}
                        onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step={discount.type === 'percentage' ? '0.1' : '0.01'}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="settings-card notes-card">
                <h3>Checkout Notes</h3>
                <div className="settings-item">
                  <span>Display Notes on Checkout</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notes.isActive}
                      onChange={handleNotesToggle}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                {notes.isActive && (
                  <div className="settings-item-full">
                    <label htmlFor="checkout-notes-textarea">Notes to Display:</label>
                    <textarea
                      id="checkout-notes-textarea"
                      value={notes.checkout}
                      onChange={(e) => setNotes({ ...notes, checkout: e.target.value })}
                      rows="4"
                      placeholder="Enter notes to show during checkout..."
                    ></textarea>
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