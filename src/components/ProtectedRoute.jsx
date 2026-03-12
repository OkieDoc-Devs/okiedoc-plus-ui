import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userType = localStorage.getItem('okiedoc_user_type');
  const location = useLocation();

  if (!userType) {
    const isSpecialistRoute =
      location.pathname.includes('specialist') ||
      location.pathname.includes('admin');
    const loginRoute = isSpecialistRoute ? '/specialist-login' : '/login';
    return <Navigate to={loginRoute} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userType)) {
    const defaultPaths = {
      specialist: '/specialist-dashboard',
      patient: '/patient-dashboard',
      nurse: '/nurse-dashboard',
      admin: '/admin/specialist-dashboard',
    };
    const redirectPath = defaultPaths[userType] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
