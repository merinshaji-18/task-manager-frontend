"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

interface AuthContextType {
  user: { email: string } | null;
  loading: boolean;
  login: (token: string) => Promise<void>; // Added login
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get('/users/me');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: THE MISSING LOGIN FUNCTION ---
  const login = async (token: string) => {
    setLoading(true);
    localStorage.setItem('token', token);
    try {
      // Fetch user info IMMEDIATELY so the state is ready
      const res = await axiosInstance.get('/users/me');
      setUser(res.data);
      // Only redirect AFTER the user state is set
      router.push('/tasks');
    } catch (err) {
      console.error("Login sync error:", err);
      localStorage.removeItem('token');
      alert("Session initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshUser(); }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};