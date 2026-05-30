import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const role = (user?.role || "").toLowerCase();

  const handleLogout = () => {
    signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Username</div>
            <div className="text-lg font-medium">{user?.username || "Admin"}</div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">Role</div>
            <div className="text-lg font-medium uppercase text-blue-600">{role || "ADMIN"}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">More settings coming soon...</p>
        </CardContent>
      </Card>

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