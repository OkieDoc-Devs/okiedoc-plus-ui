import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiRequest } from '../api/apiClient';

const AuthContext = createContext(null);

const DEFAULT_REDIRECTS = {
  specialist: '/specialist-dashboard',
  patient: '/patient-dashboard',
  nurse: '/nurse-dashboard',
  admin: '/admin/specialist-dashboard',
};

function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const role = rawUser.userType || rawUser.role;
  return {
    ...rawUser,
    role,
    userType: role,
  };
}

export const getRedirectPathForRole = (role) =>
  DEFAULT_REDIRECTS[role] || '/login';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const data = await apiRequest('/api/v1/auth/me', {
        disableAuthRedirect: true,
      });
      console.log('AuthContext received from /auth/me:', data);
      const normalizedUser = normalizeUser(data?.user);
      console.log('AuthContext normalized user:', normalizedUser);
      setUser(normalizedUser);
      return normalizedUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async ({ email, password, roleMode = 'any', role = null }) => {
      const result = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        disableAuthRedirect: true,
      });

      if (!result?.success || !result?.user) {
        throw new Error(
          result?.message || result?.error || 'Invalid email or password',
        );
      }

      if (result.token) {
        localStorage.setItem('jwt_token', result.token);
      }

      const normalizedUser = normalizeUser(result.user);

      if (roleMode === 'allow' && role && normalizedUser?.role !== role) {
        await apiRequest('/api/v1/auth/logout', {
          method: 'POST',
          disableAuthRedirect: true,
        }).catch(() => {});
        throw new Error(`Access denied: this portal is for ${role} accounts.`);
      }

      if (roleMode === 'deny' && role && normalizedUser?.role === role) {
        await apiRequest('/api/v1/auth/logout', {
          method: 'POST',
          disableAuthRedirect: true,
        }).catch(() => {});
        throw new Error(
          `Access denied: ${role} accounts must use their dedicated portal.`,
        );
      }

      setUser(normalizedUser);
      return normalizedUser;
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiRequest('/api/v1/auth/logout', {
      method: 'POST',
      disableAuthRedirect: true,
    }).catch(() => {});
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshSession,
      getRedirectPathForRole,
    }),
    [user, loading, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
