// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  session: any | null;
  user: any | null;
  adminData: any | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [adminData, setAdminData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  console.log("AuthContext API:", API);

  // Load saved session
  useEffect(() => {
    const saved = localStorage.getItem("session");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSession(parsed);
      setUser(parsed.user || null);
      setAdminData(parsed.admin || null);
    }
    setLoading(false);
  }, []);

  // LOGIN ============================================
  const signIn = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: { message: data.msg || "Invalid credentials" } };
      }

      const sessionData = {
        token: data.token,
        user: data.user,
        admin: data.user,
      };

      localStorage.setItem("session", JSON.stringify(sessionData));

      setSession(sessionData);
      setUser(data.user);
      setAdminData(data.user);

      return { error: null };
    } catch (err) {
      return { error: { message: "Server not reachable" } };
    }
  };

  // LOGOUT ===========================================
  const signOut = async () => {
    localStorage.removeItem("session");
    setSession(null);
    setUser(null);
    setAdminData(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, adminData, loading, signIn, signOut }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
