import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is logged in on App Load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Call your backend's /me endpoint
          const res = await api.get('/auth/me');
          setUser(res.data.data); // Assuming backend returns { success: true, data: user }
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  // 2. Login Action
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data); // Or fetch /me immediately after
    // For safety, let's fetch the full user object ensuring role is present
    const meRes = await api.get('/auth/me');
    setUser(meRes.data.data);
    return true;
  };

  // 3. Register Action
  const register = async (name, telephone, email, password) => {
    const res = await api.post('/auth/register', {
      name,
      telephone, // Matches your backend model
      email,
      password,
      role: 'user'
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data); // Or fetch /me
    return true;
  };

  // 4. Logout Action
  const logout = async () => {
    try {
        await api.get('/auth/logout'); // Call backend logout (clear cookie)
    } catch (err) { console.error(err); }
    
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;