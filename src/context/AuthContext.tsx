"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { taskService } from '@/services/taskService';


interface User {
  email: string;
  full_name?: string;
  bio?: string;
  profile_pic?: string;
  is_admin?: boolean; // CRITICAL
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  notifications: any[];
  showNotifications: boolean;
  setShowNotifications: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false); 

  const router = useRouter();

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get('/users/me');
      console.log("SERVER DATA ARRIVED:", res.data);
      setUser(res.data);
      try {
  const upcoming =
    await taskService.getUpcomingNotifications();

  if (upcoming.length > 0) {
    setNotifications(upcoming);
    setShowNotifications(true);
  }
} catch {} // Memory now holds the pic URL
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshUser(); }, []);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    await refreshUser();
    router.push('/tasks');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser,
    notifications,
    showNotifications,
    setShowNotifications }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};