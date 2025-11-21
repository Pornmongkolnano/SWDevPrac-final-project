import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  // Step 1: Password login -> triggers OTP email
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    if (res.data?.otpRequired) {
      // Caller will prompt for OTP
      return { otpRequired: true };
    }

    // Fallback for legacy flow
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      const meRes = await api.get('/auth/me');
      setUser(meRes.data.data);
      return { otpRequired: false };
    }

    throw new Error('Unexpected login response');
  };

  // Step 2: Verify OTP -> receive JWT
  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (!res.data?.token) {
      throw new Error('OTP verification failed');
    }

    localStorage.setItem('token', res.data.token);
    const meRes = await api.get('/auth/me');
    setUser(meRes.data.data);
    return true;
  };

  // Register Action
  const register = async (name, telephone, email, password) => {
    const res = await api.post('/auth/register', {
      name,
      telephone,
      email,
      password,
      role: 'user'
    });
    return res.data;
  };

  // Logout Action
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error(err);
    }

    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
