import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          setUser(res.data);
        } catch (err) {
          console.error(err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setError(null);

    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password
        }
      );

      localStorage.setItem(
        'token',
        res.data.token
      );

      setUser(res.data);

      return true;

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed'
      );

      return false;
    }
  };

  const register = async (
    name,
    email,
    password
  ) => {
    setError(null);

    try {
      const res = await axios.post(
        `${API_URL}/auth/register`,
        {
          name,
          email,
          password
        }
      );

      localStorage.setItem(
        'token',
        res.data.token
      );

      setUser(res.data);

      return true;

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed'
      );

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};