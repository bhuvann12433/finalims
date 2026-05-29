import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = { id: "1", username: "admin", role: "admin" };
  const token = "mock-token";
  const signIn = async () => ({ error: null });
  const signOut = () => {};

  return (
    <AuthContext.Provider value={{ user, token, loading: false, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}