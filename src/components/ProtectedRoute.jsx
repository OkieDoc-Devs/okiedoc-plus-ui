import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRedirectPathForRole } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    const isSpecialistRoute =
      location.pathname.includes('specialist') ||
      location.pathname.includes('admin');
    const loginRoute = isSpecialistRoute ? '/specialist-login' : '/login';
    return <Navigate to={loginRoute} state={{ from: location }} replace />;
  }

  const userType = user?.userType || user?.role;

  if (allowedRoles && !allowedRoles.includes(userType)) {
    const redirectPath = getRedirectPathForRole(userType);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
