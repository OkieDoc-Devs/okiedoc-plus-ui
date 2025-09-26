import React, { useState, useEffect } from "react"; // Import useEffect
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

const Header = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
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

  // State for transaction filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Dummy data for Transaction History
  const [transactions, setTransactions] = useState([
    {
      id: 'TRN001',
      patientName: 'Alice Johnson',
      specialistName: 'Dr. John Doe',
      specialty: 'Pediatrics',
      date: '2025-09-05',
      status: 'Completed',
      channel: 'Platform Video Call',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'TRN002',
      patientName: 'Bob Williams',
      specialistName: 'Dr. Jane Smith',
      specialty: 'Cardiology',
      date: '2025-09-04',
      status: 'Confirmed',
      channel: 'Mobile Call',
      paymentMethod: 'HMO'
    },
    {
      id: 'TRN003',
      patientName: 'Charlie Brown',
      specialistName: 'Dr. John Doe',
      specialty: 'Pediatrics',
      date: '2025-09-03',
      status: 'For Payment',
      channel: 'Platform Chat',
      paymentMethod: 'GCash'
    },
     {
      id: 'TRN004',
      patientName: 'Diana Miller',
      specialistName: 'Dr. Evelyn Reed',
      specialty: 'Cardiology',
      date: '2025-09-02',
      status: 'Processing',
      channel: 'Viber Video Call',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'TRN005',
      patientName: 'Ethan Davis',
      specialistName: 'Dr. Samuel Chen',
      specialty: 'Dermatology',
      date: '2025-09-01',
      status: 'Pending',
      channel: 'Platform Chat',
      paymentMethod: 'N/A'
    },
    {
      id: 'TRN006',
      patientName: 'Fiona Garcia',
      specialistName: 'Dr. Jane Smith',
      specialty: 'Cardiology',
      date: '2025-08-30',
      status: 'Incomplete',
      channel: 'Mobile Call',
      paymentMethod: 'GCash'
    }
  ]);

  const [systemFees, setSystemFees] = useState({
    doctorsFee: { isActive: true, name: "Doctor's Fee" },
    processingFee: { isActive: true, name: "Processing Fee" },
    convenienceFee: { isActive: true, name: "Convenience Fee" },
  });

  const [discount, setDiscount] = useState({
    name: "Discount",
    type: "percentage", // 'percentage' or 'peso'
    value: 0,
    isActive: false,
  });

  const [notes, setNotes] = useState({
    checkout: "",
    isActive: true,
  });

  const handleFeeToggle = (feeName) => {
    setSystemFees((prev) => ({
      ...prev,
      [feeName]: { ...prev[feeName], isActive: !prev[feeName].isActive },
    }));
  };

  const handleDiscountToggle = () => {
    setDiscount((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleNotesToggle = () => {
    setNotes((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

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

    const [consultations, setConsultations] = useState([
    {
      id: 'CON001',
      patientName: 'Alice Johnson',
      date: '2025-09-05',
      ticket: 'TKT001',
      chiefComplaint: 'Headache',
      assignedSpecialist: 'Dr. John Doe',
      soap: {
        subjective: 'Patient complains of a persistent headache for the last 3 days.',
        objective: 'BP: 120/80, Temp: 98.6F',
        assessment: 'Tension headache',
        plan: 'Prescribe pain relievers and recommend rest.'
      },
      medicinePrescription: [
        { brand: 'Advil', generic: 'Ibuprofen', dosage: '200mg', form: 'Tablet', quantity: 20, instructions: 'Take one tablet every 6 hours as needed for pain.' }
      ],
      labRequests: [],
      doctorsNote: { remarks: 'Follow up if headache persists for more than a week.' },
      referrals: 'None',
      specialistName: 'Dr. John Doe',
      assignedNurse: 'Nurse Jane',
      followUp: '2025-09-12'
    },
    {
      id: 'CON002',
      patientName: 'Bob Williams',
      date: '2025-09-04',
      ticket: 'TKT002',
      chiefComplaint: 'Sore Throat',
      assignedSpecialist: 'Dr. Jane Smith',
	  soap: {
        subjective: 'Patient complains of a sore throat and difficulty swallowing.',
        objective: 'Red and swollen tonsils observed.',
        assessment: 'Strep throat',
        plan: 'Prescribe antibiotics.'
      },
	  medicinePrescription: [
        { brand: 'Amoxil', generic: 'Amoxicillin', dosage: '500mg', form: 'Capsule', quantity: 30, instructions: 'Take one capsule every 8 hours for 10 days.' }
      ],
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
      ...transactions.flatMap(t => t.specialty)
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
  
  const filteredTransactions = transactions.filter(t => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || 
          t.patientName.toLowerCase().includes(lowerSearchTerm) ||
          t.specialistName.toLowerCase().includes(lowerSearchTerm) ||
          t.channel.toLowerCase().includes(lowerSearchTerm) ||
          t.paymentMethod.toLowerCase().includes(lowerSearchTerm) ||
          t.status.toLowerCase().includes(lowerSearchTerm);
          
      const matchesSpecialty = !filterSpecialization || t.specialty === filterSpecialization;
      const matchesStatus = !filterStatus || t.status === filterStatus;
      
      const transactionDate = new Date(t.date);
      const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
      const toDate = filterDateTo ? new Date(filterDateTo) : null;
      
      // Adjust dates to ignore time and timezone differences
      if(fromDate) fromDate.setHours(0,0,0,0);
      if(toDate) toDate.setHours(23,59,59,999);

      const matchesDate = (!fromDate || transactionDate >= fromDate) && (!toDate || transactionDate <= toDate);

      return matchesSearch && matchesSpecialty && matchesStatus && matchesDate;
  });

  // Handler for the export button
  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert("No data to export.");
      return;
    }
    // Simple CSV export simulation
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
    alert("Exporting filtered data...");
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
              {activeTab === "transactions" && (
                <>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Filter by Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="For Payment">For Payment</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Incomplete">Incomplete</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    placeholder="To"
                  />
                  <button
                    className="add-btn"
                    style={{ backgroundColor: "#0B5388" }}
                    onClick={handleExport}
                  >
                    Export Tickets
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
                            {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                                <tr key={t.id}>
                                    <td>{t.patientName}</td>
                                    <td>{t.specialistName}</td>
                                    <td>{t.specialty}</td>
                                    <td>{t.date}</td>
                                    <td>{t.status}</td>
                                    <td>{t.channel}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center'}}>No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        {activeTab === "consultations" && (
          <ConsultationHistory consultations={consultations} />
        )}
        {activeTab === "settings" && (
          <div id="settings" className="tab-content active settings-tab-content">
            <h2>System Fee & Discount Settings</h2>
            <div className="settings-grid">
              {/* System Fees */}
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

              {/* Discount */}
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
                        onChange={(e) =>
                          setDiscount({ ...discount, type: e.target.value })
                        }
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
                        onChange={(e) =>
                          setDiscount({
                            ...discount,
                            value: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Notes */}
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
                    <label htmlFor="checkout-notes-textarea">
                      Notes to Display:
                    </label>
                    <textarea
                      id="checkout-notes-textarea"
                      value={notes.checkout}
                      onChange={(e) =>
                        setNotes({ ...notes, checkout: e.target.value })
                      }
                      rows="4"
                      placeholder="Enter notes to show on the checkout summary..."
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
