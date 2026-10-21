import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  teacher: { username: 'teacher', password: 'teacher123', label: 'Teacher (teacher123)' },
  admin:   { username: 'admin',   password: 'admin123',   label: 'Admin (admin123)' },
  student: { username: 'student', password: 'student123', label: 'Student: John Doe (student123)' },
  jane:    { username: 'jane',    password: 'student123', label: 'Student: Jane Smith' },
  alex:    { username: 'alex',    password: 'student123', label: 'Student: Alex Rivera' }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('edupulse_jwt');
      const savedUser = localStorage.getItem('edupulse_user');

      if (savedToken && savedUser) {
        try {
          // Validate existing token against backend
          const verifiedProfile = await api.getCurrentUser();
          const parsed = JSON.parse(savedUser);
          setUser({ ...parsed, ...verifiedProfile });
          setLoading(false);
          return;
        } catch (err) {
          console.warn('Stored token is expired or invalid. Performing auto-login...', err);
          localStorage.removeItem('edupulse_jwt');
          localStorage.removeItem('edupulse_user');
        }
      }

      // Default to teacher demo account on first load for seamless experience
      try {
        await quickLogin('teacher');
      } catch (err) {
        console.warn('Initial demo login fallback notice:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  async function login(username, password) {
    setError(null);
    try {
      const data = await api.login(username, password);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function register(formData) {
    setError(null);
    try {
      const data = await api.register(formData);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function quickLogin(roleKey) {
    const creds = DEMO_USERS[roleKey] || DEMO_USERS.teacher;
    return login(creds.username, creds.password);
  }

  function logout() {
    api.logout();
    setUser(null);
  }

  const role = user?.role || 'ROLE_STUDENT';
  const isTeacherOrAdmin = role === 'ROLE_TEACHER' || role === 'ROLE_ADMIN';
  const isAdmin = role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isTeacherOrAdmin,
      isAdmin,
      loading,
      error,
      login,
      register,
      quickLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
