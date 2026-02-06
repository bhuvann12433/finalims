import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Parties from "./pages/Parties";
import CreateParty from "./pages/CreateParty";
import EditParty from "./pages/EditParty";
import Items from "./pages/Items";
import CreateItem from "./pages/CreateItem";
import EditItem from "./pages/EditItem";
import SalesInvoices from "./pages/SalesInvoices";
import CreateSalesInvoice from "./pages/CreateSalesInvoice";
import SalesInvoiceView from "./pages/SalesInvoiceView";
import DeliveryChallan from "./pages/DeliveryChallan";
import CreateDeliveryChallan from "./pages/CreateDeliveryChallan";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import POSBilling from "./pages/POSBilling";
import EInvoicing from "./pages/EInvoicing";
import OnlineOrders from "./pages/OnlineOrders";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient();

// ===== Layout =====
const Layout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-auto bg-background p-6">
        {children}
      </main>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* ================= AUTH ================= */}
          <Route path="/login" element={<Login />} />

          {/* Root → Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ================= ADMIN ONLY ================= */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <Layout>
                  <Settings />
                </Layout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <Layout>
                  <Reports />
                </Layout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/expenses"
            element={
              <AdminRoute>
                <Layout>
                  <Expenses />
                </Layout>
              </AdminRoute>
            }
          />

          {/* ================= STAFF + ADMIN ================= */}
          <Route
            path="/parties"
            element={
              <ProtectedRoute>
                <Layout>
                  <Parties />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/parties/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateParty />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/parties/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditParty />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <Layout>
                  <Items />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/items/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateItem />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/items/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditItem />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ================= SALES (FIXED) ================= */}

          {/* /sales → redirect */}
          <Route path="/sales" element={<Navigate to="/sales/invoices" replace />} />

          {/* ACTUAL SALES PAGE */}
          <Route
            path="/sales/invoices"
            element={
              <ProtectedRoute>
                <Layout>
                  <SalesInvoices />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateSalesInvoice />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales/view/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <SalesInvoiceView />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ================= DELIVERY ================= */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute>
                <Layout>
                  <DeliveryChallan />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales/delivery-challan/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateDeliveryChallan />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ================= MODULES ================= */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <Layout>
                  <POSBilling />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/e-invoicing"
            element={
              <ProtectedRoute>
                <Layout>
                  <EInvoicing />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/online-orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <OnlineOrders />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ================= PLACEHOLDERS ================= */}
          <Route
            path="/sales/quotation"
            element={
              <ProtectedRoute>
                <Layout>
                  <ComingSoon />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ================= 404 ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
