import React from 'react';
import { useNavigate } from 'react-router-dom';
import OkieDocLogo from '../../assets/okie-doc-logo.png';
import { logoutAdmin } from '../../api/Admin/api.js';
import '../Specialistdashboard/SpecialistDashboard.css';

/**
 * Header component for the Admin Dashboard.
 * Includes logo, title, and logout functionality.
 */
const Header = () => {
  const navigate = useNavigate();

  /**
   * Handles the admin logout process.
   * Calls the logout API endpoint, clears local session data, and navigates to the login page.
   */
  const handleLogout = async () => {
    try {
      // Call the API function to handle backend logout logic (e.g., invalidate token, log last_active)
      await logoutAdmin();
    } catch (error) {
       console.error("Admin logout API call failed:", error);
       // Log the error but proceed with frontend cleanup regardless
    } finally {
        sessionStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem('admin_token');
        navigate("/login");
    }
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

export default Header;