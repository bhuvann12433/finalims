import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  // ⏳ Wait for auth to finish
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Role check
  const role = (user.role || "").toLowerCase();

  // ❌ Logged in but not admin
  if (role !== "admin") {
    return <Navigate to="/sales" replace />;
  }

  // ✅ Admin allowed
  return children;
}
