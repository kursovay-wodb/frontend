import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import { checkAdminAccess } from '../services/apiService';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    checkAdminAccess()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, [token]);

  return { isAdmin, loading };
};