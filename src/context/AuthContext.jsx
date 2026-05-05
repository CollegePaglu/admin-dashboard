import { useState, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminData');
    if (token && storedAdmin) {
      try { return JSON.parse(storedAdmin); } catch { return null; }
    }
    return null;
  });

  const login = (adminData, tokens) => {
    localStorage.setItem('adminToken', tokens.accessToken);
    localStorage.setItem('adminRefreshToken', tokens.refreshToken);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}
