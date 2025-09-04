import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  History, 
  LogOut
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (storedUser && isAuthenticated === 'true') {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not authenticated
      navigate('/');
    }
  }, [navigate]);

            const navigationItems = [
            {
              name: 'Dashboard',
              path: '/patient-dashboard',
              icon: Home,
              description: 'View all tickets by status'
            },
            {
              name: 'My Account',
              path: '/patient-account',
              icon: User,
              description: 'Edit profile and account settings'
            },
            {
              name: 'Consultation History',
              path: '/patient-consultation-history',
              icon: History,
              description: 'View past consultations and EMR'
            }
          ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    
    // Navigate back to login
    navigate('/');
  };

  return (
    <div className="sidebar-container">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-text">
            Okie-Doc<span className="logo-plus">+</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <Icon 
                  size={20} 
                  className={`nav-icon ${isActive(item.path) ? 'active' : ''}`}
                />
                <div className="nav-content">
                  <div className="nav-title">{item.name}</div>
                  <div className={`nav-description ${isActive(item.path) ? 'active' : ''}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="logout-section">
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            <LogOut size={20} className="nav-icon" />
            <span className="nav-title">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Page content */}
        <div className="page-content">
          {children}
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
