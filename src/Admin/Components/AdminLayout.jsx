import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiBell, FiLogOut, FiChevronDown, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import OkieDocLogo from '../../assets/okie-doc-logo.png';
import '../AdminLayout.css';

const AdminLayout = ({ 
  children, 
  title = "Dashboard", 
  subtitle = "Overview of system activities",
  navLinks = [], 
  activeTab, 
  setActiveTab,
  adminAvatar = '/account.svg',
  adminName = 'Admin',
  adminRole = 'Administrator',
  onLogout,
  onAvatarUpload 
}) => {
  const fileInputRef = useRef(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    const autoExpand = {};
    navLinks.forEach(link => {
      if (link.subLinks && link.subLinks.some(sub => sub.id === activeTab)) {
        autoExpand[link.id] = true;
      }
    });
    setExpandedMenus(prev => ({ ...prev, ...autoExpand }));
  }, [activeTab, navLinks]);

  const toggleMenu = (id) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGroupClick = (link) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedMenus(prev => ({ ...prev, [link.id]: true }));
    } else {
      toggleMenu(link.id);
    }
  };

  const dashboardContent = (
    <div className="admin-layout-wrapper">
      
      {/* COLLAPSIBLE SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo-container">
          {!isSidebarCollapsed ? (
            <img src={OkieDocLogo} alt="Okie-Doc+" className="sidebar-logo" />
          ) : (
            <div className="sidebar-logo-collapsed" title="Okie-Doc+">OD+</div>
          )}
        </div>
        
        <nav className="sidebar-nav">
          {navLinks.map((link) => {
            if (link.subLinks) {
              const isExpanded = expandedMenus[link.id];
              const isActiveParent = link.subLinks.some(sub => sub.id === activeTab);
              
              return (
                <div key={link.id} className="sidebar-group">
                  <div 
                    className={`sidebar-item ${isExpanded ? 'expanded' : ''} ${isActiveParent ? 'active-parent' : ''}`}
                    onClick={() => handleGroupClick(link)}
                    title={isSidebarCollapsed ? link.label : ""}
                  >
                    <span className="sidebar-item-icon">{link.icon}</span> 
                    {!isSidebarCollapsed && <span className="sidebar-item-label">{link.label}</span>}
                    {!isSidebarCollapsed && <span className="sidebar-chevron">{isExpanded ? <FiChevronDown /> : <FiChevronRight />}</span>}
                  </div>
                  
                  {!isSidebarCollapsed && isExpanded && (
                    <div className="sidebar-sub-menu">
                      {link.subLinks.map(sub => (
                        <div 
                          key={sub.id} 
                          className={`sidebar-sub-item ${activeTab === sub.id ? 'active' : ''}`}
                          onClick={() => setActiveTab(sub.id)}
                        >
                          {sub.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div 
                key={link.id}
                className={`sidebar-item ${activeTab === link.id ? 'active' : ''}`} 
                onClick={() => setActiveTab(link.id)}
                title={isSidebarCollapsed ? link.label : ""}
              >
                <span className="sidebar-item-icon">{link.icon}</span> 
                {!isSidebarCollapsed && <span className="sidebar-item-label">{link.label}</span>}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-toggle-btn" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="toggle-arrow">{isSidebarCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}</span>
            {!isSidebarCollapsed && <span className="toggle-text">Collapse View</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-content">
        <header className="admin-header">
          <div className="header-title-group">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          
          <div className="header-actions">
            <div className="header-search-box">
              <span className="search-icon"><FiSearch /></span>
              <input type="text" placeholder="Search..." className="header-search" />
            </div>
            
            <button className="header-icon-btn" title="Notifications"><FiBell /></button>
            <div className="header-divider"></div>
            
            <div className="header-user-profile">
              <div className="header-user-info">
                <span className="header-user-name">{adminName}</span>
                <span className="header-user-role">{adminRole}</span>
              </div>
              
              {onAvatarUpload && (
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onAvatarUpload} 
                  accept="image/png, image/jpeg" 
                  style={{ display: 'none' }} 
                />
              )}
              <img 
                src={adminAvatar} 
                alt="Profile" 
                className="header-avatar" 
                style={{ cursor: onAvatarUpload ? 'pointer' : 'default' }}
                onClick={() => onAvatarUpload && fileInputRef.current.click()}
                onError={(e) => { e.target.onerror = null; e.target.src = '/account.svg'; }}
                title={onAvatarUpload ? "Click to change avatar" : ""}
              />

              <button onClick={onLogout} className="header-logout-btn" title="Logout"><FiLogOut /></button>
            </div>
          </div>
        </header>

        <div className="admin-scroll-area">
          {children}
        </div>
      </main>
    </div>
  );

  return createPortal(dashboardContent, document.body);
};

export default AdminLayout;