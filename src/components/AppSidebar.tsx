import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Receipt,
  CreditCard,
  ShoppingCart,
  FileBarChart,
  Settings,
  Tag,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [openItems, setOpenItems] = useState(false);
  const [openSales, setOpenSales] = useState(false);

  const role = (user?.role || "guest").toLowerCase();
  const isAdmin = role === "admin";

  useEffect(() => {
    if (location.pathname.startsWith("/items")) setOpenItems(true);
    if (location.pathname.startsWith("/sales") || location.pathname.startsWith("/delivery")) {
      setOpenSales(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <span className="text-xl font-bold text-white">G</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wide">GNR SURGICALS</span>
            <div className="flex items-center gap-1.5 mt-1 bg-black/20 px-2 py-0.5 rounded w-fit">
              {isAdmin ? (
                <Shield className="w-3 h-3 text-yellow-300" />
              ) : (
                <User className="w-3 h-3 text-blue-300" />
              )}
              <span className="text-[10px] uppercase font-mono text-white/90">
                {user?.username || "Guest"} : {role}
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground"
                      }`
                    }
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/parties"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground"
                      }`
                    }
                  >
                    <Users className="h-4 w-4" />
                    <span>Parties</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setOpenItems(!openItems)}
                  className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-100/10"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4" />
                    <span>Items</span>
                  </div>
                </SidebarMenuButton>
                {openItems && (
                  <div className="flex flex-col gap-2 mt-2 ml-8">
                    <NavLink
                      to="/items"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 bg-[#26326B] text-white hover:bg-[#2f3c85]"
                    >
                      📦 Inventory
                    </NavLink>
                  </div>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setOpenSales(!openSales)}
                  className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-100/10"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4" />
                    <span>Sales</span>
                  </div>
                </SidebarMenuButton>
                {openSales && (
                  <div className="flex flex-col gap-2 mt-2 ml-8">
                    {[
                      { label: "Sales Invoices", url: "/sales/invoices" },
                      { label: "Quotation", url: "/sales/quotation" },
                      { label: "Delivery Challan", url: "/delivery" },
                    ].map((item) => (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-lg ${
                            isActive
                              ? "bg-sidebar-accent text-white"
                              : "text-gray-400 hover:text-white"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground"
                      }`
                    }
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Reports</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { title: "Expenses", url: "/expenses", icon: Receipt },
                { title: "POS Billing", url: "/pos", icon: CreditCard },
                { title: "E-Invoicing", url: "/e-invoicing", icon: FileBarChart },
                { title: "Online Orders", url: "/online-orders", icon: ShoppingCart },
                { title: "Settings", url: "/settings", icon: Settings },
              ].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}