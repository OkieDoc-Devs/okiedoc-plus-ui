import "../App.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Welcome to Okie-Doc+ Dashboard</h2>
      <p className="dashboard-text">
        You have successfully logged in! This is your nurse dashboard where you
        can manage patient records and appointments.
      </p>
      <div className="dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="actions-list">
          <div className="action-item">
            <span className="action-icon">📋</span>
            <span>View Patient Records</span>
          </div>
          <div className="action-item">
            <span className="action-icon">📅</span>
            <span>Schedule Appointments</span>
          </div>
          <div className="action-item">
            <span className="action-icon">📝</span>
            <span>Update Medical Notes</span>
          </div>
          <div className="action-item">
            <span className="action-icon">🔬</span>
            <span>Access Lab Results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
