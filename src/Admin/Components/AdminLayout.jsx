import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiSearch, FiBell, FiLogOut, FiChevronDown, FiChevronRight, 
  FiChevronsLeft, FiChevronsRight, FiMenu, FiX 
} from 'react-icons/fi';
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
  onAvatarUpload,
  headerSearch,
  setHeaderSearch
}) => {
  const fileInputRef = useRef(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false); // NEW: Mobile search state
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

  const handleNavigation = (id) => {
    setActiveTab(id);
    if (window.innerWidth <= 768) setIsMobileSidebarOpen(false);
  };

  const dashboardContent = (
    <div className="admin-layout-wrapper">
      
      {/* MOBILE OVERLAY */}
      <div className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}></div>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo-container">
          <img src={OkieDocLogo} alt="Okie-Doc+" className="sidebar-logo" />
          <div className="sidebar-logo-collapsed" title="Okie-Doc+">OD+</div>
          <button className="mobile-close-btn" onClick={() => setIsMobileSidebarOpen(false)}><FiX /></button>
        </div>
        
        <nav className="sidebar-nav">
          {navLinks.map((link) => {
            if (link.subLinks) {
              const isExpanded = expandedMenus[link.id];
              const isActiveParent = link.subLinks.some(sub => sub.id === activeTab);
              
              return (
                <div key={link.id} className="sidebar-group">
                  <div className={`sidebar-item ${isExpanded ? 'expanded' : ''} ${isActiveParent ? 'active-parent' : ''}`} onClick={() => handleGroupClick(link)}>
                    <span className="sidebar-item-icon">{link.icon}</span> 
                    <span className="sidebar-item-label">{link.label}</span>
                    <span className="sidebar-chevron">{isExpanded ? <FiChevronDown /> : <FiChevronRight />}</span>
                  </div>
                  {isExpanded && (
                    <div className="sidebar-sub-menu">
                      {link.subLinks.map(sub => (
                        <div key={sub.id} className={`sidebar-sub-item ${activeTab === sub.id ? 'active' : ''}`} onClick={() => handleNavigation(sub.id)}>{sub.label}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={link.id} className={`sidebar-item ${activeTab === link.id ? 'active' : ''}`} onClick={() => handleNavigation(link.id)}>
                <span className="sidebar-item-icon">{link.icon}</span> 
                <span className="sidebar-item-label">{link.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <span className="toggle-arrow">{isSidebarCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}</span>
            <span className="toggle-text">Collapse View</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-content">
        <header className="admin-header">
          
          <div className="header-title-group">
            <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)}><FiMenu /></button>
            <div>
              <h1>{title}</h1>
              <p className="hide-on-mobile">{subtitle}</p>
            </div>
          </div>
          
          <div className="header-actions">
            
            {/* FIXED EXPANDING SEARCH BOX */}
            <div 
              className={`header-search-box ${isMobileSearchExpanded ? 'mobile-expanded' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 768 && !isMobileSearchExpanded) setIsMobileSearchExpanded(true);
              }}
            >
              <span className="search-icon"><FiSearch /></span>
              <input 
                type="text" 
                placeholder="Search records..." 
                className="header-search" 
                value={headerSearch || ''}
                onChange={(e) => setHeaderSearch && setHeaderSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {/* Close button only visible on mobile when expanded */}
              {isMobileSearchExpanded && (
                <button 
                  className="mobile-search-close" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsMobileSearchExpanded(false); 
                    if(setHeaderSearch) setHeaderSearch(''); 
                  }}
                >
                  <FiX />
                </button>
              )}
            </div>
            
            <button className="header-icon-btn hide-on-mobile" title="Notifications"><FiBell /></button>
            <div className="header-divider hide-on-mobile"></div>
            
            <div className="header-user-profile">
              <div className="header-user-info">
                <span className="header-user-name">{adminName}</span>
                <span className="header-user-role">{adminRole}</span>
              </div>
              {onAvatarUpload && <input type="file" ref={fileInputRef} onChange={onAvatarUpload} accept="image/png, image/jpeg" style={{ display: 'none' }} />}
              <img 
                src={adminAvatar} alt="Profile" className="header-avatar" 
                style={{ cursor: onAvatarUpload ? 'pointer' : 'default' }}
                onClick={() => onAvatarUpload && fileInputRef.current.click()}
                onError={(e) => { e.target.onerror = null; e.target.src = '/account.svg'; }}
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