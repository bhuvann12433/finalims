import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL;

  // ✅ RESTORE SESSION (single source of truth)
  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      const parsed = JSON.parse(session);
      setUser(parsed.user || null);
      setToken(parsed.token || null);
    }
    setLoading(false);
  }, []);

  // ✅ LOGIN
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
        user: data.user,
        token: data.token,
      };

      localStorage.setItem("session", JSON.stringify(sessionData));
      setUser(data.user);
      setToken(data.token);

      return { error: null };
    } catch {
      return { error: { message: "Server not reachable" } };
    }
  };

  // ✅ LOGOUT
  const signOut = () => {
    localStorage.removeItem("session");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
