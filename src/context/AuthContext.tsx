import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { authAPI } from "../services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: any) => Promise<void>;
  register: (name: string, email: string, password: any) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("qrverse_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authAPI.getMe();
        setUser(data.user);
      } catch (err) {
        console.error("Session restore failed, logging out.", err);
        localStorage.removeItem("qrverse_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: any) => {
    setError(null);
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem("qrverse_token", data.token);
      setUser(data.user);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Login failed. Please check your credentials.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name: string, email: string, password: any) => {
    setError(null);
    try {
      const data = await authAPI.register(name, email, password);
      localStorage.setItem("qrverse_token", data.token);
      setUser(data.user);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Registration failed. Please try again.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem("qrverse_token");
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
