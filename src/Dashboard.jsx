import "./App.css";

export default function Dashboard() {
  return (
    <div className="dashboard" style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h2 className="dashboard-title" style={{ 
        color: '#333', 
        marginBottom: '20px' 
      }}>
        Welcome to Okie-Doc+ Dashboard
      </h2>
      <p className="dashboard-text" style={{ 
        fontSize: '18px', 
        color: '#666',
        lineHeight: '1.6'
      }}>
        You have successfully logged in! This is your nurse dashboard where you can manage patient records and appointments.
      </p>
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>Quick Actions</h3>
        <p style={{ color: '#666' }}>
          • View Patient Records<br/>
          • Schedule Appointments<br/>
          • Update Medical Notes<br/>
          • Access Lab Results
        </p>
      </div>
    </div>
  );
}
