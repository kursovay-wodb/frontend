import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/authService';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;