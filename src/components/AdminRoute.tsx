import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/authService';
import { checkAdminAccess } from '../services/apiService';
import Loader from './Loader';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const hasAdminAccess = await checkAdminAccess();
        setIsAdmin(hasAdminAccess);
      } catch (error) {
        console.error('Ошибка проверки прав администратора:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [token]);

  if (loading) {
    return <Loader />;
  }

  if (!token || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;