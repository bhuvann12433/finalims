import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ USER MANAGEMENT
import UserManagement from "./UserManagement";

export default function Settings() {
  const { user, logout } = useAuth();   // ✅ CORRECT SOURCE
  const navigate = useNavigate();

  // ✅ ADMIN CHECK (single source of truth)
  const role = (user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* 1️⃣ ADMIN INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Username</div>
            <div className="text-lg font-medium">
              {user?.username || "Admin"}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Role</div>
            <div className="text-lg font-medium uppercase text-blue-600">
              {role || "ADMIN"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2️⃣ USER MANAGEMENT (ADMIN ONLY) */}
      {isAdmin && <UserManagement />}

      {/* 3️⃣ LOGOUT */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
