import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role || user.userType;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin' || role === 'super_admin') return <Navigate to="/admin/specialist-dashboard" replace />;
    if (role === 'nurse_admin') return <Navigate to="/admin/nurse-dashboard" replace />;
    if (role === 'barangay_admin') return <Navigate to="/admin/barangay-dashboard" replace />;
    if (role === 'nurse') return <Navigate to="/nurse-dashboard" replace />;
    if (role === 'specialist') return <Navigate to="/specialist-dashboard" replace />;

    return <Navigate to="/patient-dashboard" replace />;
  }

  if (role === 'specialist' && allowedRoles && allowedRoles.includes('specialist')) {
    const appStatus = String(user.applicationStatus || 'pending').toLowerCase();
    const path = location.pathname;

    if (appStatus === 'pending') {
      if (path === '/specialist-dashboard' || path.startsWith('/video-call')) {
        return <Navigate to="/specialist-pending" replace />;
      }
    } else if (appStatus === 'denied') {
      if (path === '/specialist-dashboard' || path.startsWith('/video-call')) {
        return <Navigate to="/specialist-denied" replace />;
      }
    } else if (appStatus === 'approved') {
      if (path === '/specialist-pending' || path === '/specialist-denied') {
        return <Navigate to="/specialist-dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;