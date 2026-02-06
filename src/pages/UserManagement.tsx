import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Shield,
  Loader2,
  Trash2,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

export default function UserManagement() {
  const { toast } = useToast();
  const API = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    roleType: "viewer",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API}/api/auth/staff`);
      const data = await res.json();
      setStaffList(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch staff");
    }
  };

  // CREATE STAFF
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/create-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          canEdit: formData.roleType === "editor",
        }),
      });

      if (!res.ok) throw new Error();

      toast({ title: "User created successfully" });
      setFormData({ username: "", password: "", roleType: "viewer" });
      fetchStaff();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // DELETE STAFF
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`${API}/api/auth/staff/${id}`, { method: "DELETE" });
    fetchStaff();
  };

  // PROMOTE / DEMOTE
  const toggleRole = async (staff: any) => {
    await fetch(`${API}/api/auth/staff/${staff._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        canEdit: !staff.permissions?.canEdit,
      }),
    });
    fetchStaff();
  };

  return (
    <div className="space-y-8">
      {/* CREATE USER */}
      <Card>
        <CardHeader>
          <CardTitle>Create Staff Account</CardTitle>
          <CardDescription>Grant access to staff</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <Select
              value={formData.roleType}
              onValueChange={(v) =>
                setFormData({ ...formData, roleType: v })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* STAFF LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Active Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow key={staff._id}>
                  <TableCell>{staff.username}</TableCell>
                  <TableCell>
                    {staff.permissions?.canEdit ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" /> Editor
                      </Badge>
                    ) : (
                      <Badge variant="outline">Viewer</Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleRole(staff)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {staff.permissions?.canEdit ? "Demote" : "Promote"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(staff._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
