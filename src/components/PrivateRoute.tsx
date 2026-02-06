import { Navigate, Outlet } from "react-router-dom";

// This component wraps routes that strictly require ADMIN access
export default function PrivateRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // If user is NOT logged in or NOT an admin, kick them to Sales
  if (!user || user.role !== "admin") {
    return <Navigate to="/sales" replace />;
  }

  // If Admin, let them through
  return <Outlet />;
}