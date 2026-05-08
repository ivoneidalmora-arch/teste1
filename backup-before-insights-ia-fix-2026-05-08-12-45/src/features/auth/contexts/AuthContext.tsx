"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSession, logoutUser } from '../actions/auth.actions';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: { id: string, username: string } | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string, username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const initializeAuth = useCallback(async () => {
    try {
      const session = await getSession();
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthProvider] Error initializing auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const logout = async () => {
    setLoading(true);
    await logoutUser();
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
    refresh: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
