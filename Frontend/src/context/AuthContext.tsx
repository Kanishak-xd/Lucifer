import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  avatar: string;
  guilds?: Array<{
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check if we just came back from Discord auth
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        // Store token in localStorage
        localStorage.setItem("discord_token", token);
        // Decode JWT to get user info
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          setUser(decoded);
          // Redirect to home after successful login
          window.location.href = "/home";
        } catch (err) {
          console.error("Invalid token:", err);
          localStorage.removeItem("discord_token");
        }
      } else {
        // Check if token already exists in localStorage
        const storedToken = localStorage.getItem("discord_token");
        if (storedToken) {
          try {
            const decoded = JSON.parse(atob(storedToken.split(".")[1]));
            setUser(decoded);
          } catch (err) {
            console.error("Invalid token:", err);
            localStorage.removeItem("discord_token");
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = () => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    window.location.href = `${API_BASE}/auth/discord`;
  };

  const logout = () => {
    localStorage.removeItem("discord_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}