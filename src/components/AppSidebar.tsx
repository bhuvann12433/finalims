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
  Tag
} from "lucide-react";

import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

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
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();

  const [openItems, setOpenItems] = useState(false);
  const [openSales, setOpenSales] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/items")) setOpenItems(true);
    if (location.pathname.startsWith("/sales")) setOpenSales(true);
  }, [location.pathname]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-lg font-bold text-sidebar-primary-foreground">G</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">GNR SURGICALS</span>
            <span className="text-xs text-sidebar-foreground/60">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>

        {/* MAIN MENU */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    end
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

              {/* Parties */}
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

              {/* ITEMS SECTION */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setOpenItems(!openItems)}
                  className="flex items-center justify-between w-full cursor-pointer text-sidebar-foreground/80 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4" />
                    <span>Items</span>
                  </div>

                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      openItems ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </SidebarMenuButton>

                {openItems && (
                  <div className="flex flex-col gap-2 mt-2 ml-8">
                    <NavLink
                      to="/items"
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-xl px-3 py-2 ${
                          isActive
                            ? "bg-[#2f3c85] text-white"
                            : "bg-[#26326B] text-white"
                        }`
                      }
                    >
                      📦 Inventory
                    </NavLink>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 cursor-not-allowed">
                      🏠 Godown (Warehouse)
                      <span className="ml-auto text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                        Empty
                      </span>
                    </div>
                  </div>
                )}
              </SidebarMenuItem>

              {/* SALES SECTION */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setOpenSales(!openSales)}
                  className="flex items-center justify-between w-full cursor-pointer text-sidebar-foreground/80 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4" />
                    <span>Sales</span>
                  </div>

                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      openSales ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </SidebarMenuButton>

                {openSales && (
                  <div className="flex flex-col gap-2 mt-2 ml-8">
                    {[
                      { label: "Sales Invoices", url: "/sales/invoices" },
                      { label: "Quotation / Estimate", url: "/sales/quotation" },
                      { label: "Payment In", url: "/sales/payment-in" },
                      { label: "Sales Return", url: "/sales/return" },
                      { label: "Credit Note", url: "/sales/credit-note" },
                      { label: "Delivery Challan", url: "/delivery" },
                      { label: "Proforma Invoice", url: "/sales/proforma" },
                    ].map((item) => (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-lg ${
                            isActive
                              ? "bg-sidebar-accent text-white"
                              : "hover:text-white"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>

              {/* Reports */}
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

        {/* OTHER MODULES */}
        <SidebarGroup>
          <SidebarGroupLabel>Other</SidebarGroupLabel>
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
    </Sidebar>
  );
}
