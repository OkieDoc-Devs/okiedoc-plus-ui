import "../App.css";
import "./NurseStyles.css";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function CreateSchedule() {
  const navigate = useNavigate();

  // Add dummy notifications data for notification count in the tab
  const [notifications] = useState([
    {
      id: 1,
      type: "New Ticket",
      message: "New ticket T005 submitted by Alex Brown",
      time: "5 mins ago",
      unread: true,
    },
    {
      id: 2,
      type: "Payment Confirmation",
      message: "Payment confirmed for appointment #A123",
      time: "15 mins ago",
      unread: true,
    },
  ]);

  const createSchedule = () => {
    console.log("Opening Google Calendar integration...");
    alert("Google Calendar integration will be implemented here");
  };

  const handleTabClick = (tab) => {
    if (tab === "tickets") {
      navigate("/dashboard");
    } else if (tab === "notifications") {
      navigate("/notifications");
    } else if (tab === "schedule") {
      // Already on create schedule page, do nothing
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <img src="/okie-doc-logo.png" alt="Okie-Doc+" className="logo-image" />
        <h2 className="dashboard-title">Create Doctor Schedule</h2>
        <div className="user-account">
          <img src="/account.svg" alt="Account" className="account-icon" />
          <span className="account-name">Nurse</span>
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
          <button className="nav-tab" onClick={() => handleTabClick("tickets")}>
            Pending Tickets
          </button>
          <button
            className="nav-tab active"
            onClick={() => handleTabClick("schedule")}
          >
            Create Schedule
          </button>
          <button
            className="nav-tab"
            onClick={() => handleTabClick("notifications")}
          >
            Notifications ({notifications.filter((n) => n.unread).length})
          </button>
        </div>
      </div>

      <div className="schedule-section">
        <div className="schedule-form calendar">
          <div className="form-header">
            <div className="form-icon"></div>
            <h3>Schedule New Appointment</h3>
          </div>

          <div className="form-group">
            <label>
              <i className="form-icon-small"></i> Doctor
            </label>
            <select className="form-input">
              <option>Dr. Smith - Cardiology</option>
              <option>Dr. Johnson - Neurology</option>
              <option>Dr. Wilson - Dermatology</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <i className="form-icon-small"></i> Patient
            </label>
            <select className="form-input">
              <option>John Smith - Confirmed Appointment</option>
              <option>Sarah Johnson - Confirmed Appointment</option>
              <option>Mike Davis - Confirmed Appointment</option>
            </select>
          </div>

          <div className="calendar-container">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="form-icon-small"></i> Date
                </label>
                <input type="date" className="form-input date-input" />
              </div>
              <div className="form-group">
                <label>
                  <i className="form-icon-small"></i> Time
                </label>
                <input type="time" className="form-input time-input" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              <i className="form-icon-small"></i> Duration (minutes)
            </label>
            <select className="form-input">
              <option>30</option>
              <option>45</option>
              <option>60</option>
              <option>90</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <i className="form-icon-small"></i> Notes
            </label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Additional notes for the appointment..."
            ></textarea>
          </div>

          <button className="schedule-btn" onClick={createSchedule}>
            Add Appointment to Schedule
          </button>

          <div className="schedule-help">
            <p>Integration with Google Calendar to be added</p>
          </div>
        </div>
      </div>
    </div>
  );
}
