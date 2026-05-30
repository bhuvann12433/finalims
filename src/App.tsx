import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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

import ComingSoon from "./pages/ComingSoon";

import DeliveryChallan from "./pages/DeliveryChallan";
import CreateDeliveryChallan from "./pages/CreateDeliveryChallan";

import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import POSBilling from "./pages/POSBilling";
import EInvoicing from "./pages/EInvoicing";
import OnlineOrders from "./pages/OnlineOrders";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
        <BrowserRouter>
          <Routes>

            {/* REDIRECT LOGIN TO HOME */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/" replace />} />

            {/* DASHBOARD */}
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

            {/* PARTIES */}
            <Route path="/parties" element={<ProtectedRoute><Layout><Parties /></Layout></ProtectedRoute>} />
            <Route path="/parties/create" element={<ProtectedRoute><Layout><CreateParty /></Layout></ProtectedRoute>} />
            <Route path="/parties/edit/:id" element={<ProtectedRoute><Layout><EditParty /></Layout></ProtectedRoute>} />

            {/* ITEMS */}
            <Route path="/items" element={<ProtectedRoute><Layout><Items /></Layout></ProtectedRoute>} />
            <Route path="/items/create" element={<ProtectedRoute><Layout><CreateItem /></Layout></ProtectedRoute>} />
            <Route path="/items/edit/:id" element={<ProtectedRoute><Layout><EditItem /></Layout></ProtectedRoute>} />

            {/* SALES */}
            <Route path="/sales" element={<ProtectedRoute><Layout><SalesInvoices /></Layout></ProtectedRoute>} />
            <Route path="/sales/invoices" element={<ProtectedRoute><Layout><SalesInvoices /></Layout></ProtectedRoute>} />
            <Route path="/sales/create" element={<ProtectedRoute><Layout><CreateSalesInvoice /></Layout></ProtectedRoute>} />
            <Route path="/sales/view/:id" element={<ProtectedRoute><Layout><SalesInvoiceView /></Layout></ProtectedRoute>} />

            {/* COMING SOON */}
            <Route path="/sales/quotation" element={<ProtectedRoute><Layout><ComingSoon /></Layout></ProtectedRoute>} />
            <Route path="/sales/payment-in" element={<ProtectedRoute><Layout><ComingSoon /></Layout></ProtectedRoute>} />
            <Route path="/sales/return" element={<ProtectedRoute><Layout><ComingSoon /></Layout></ProtectedRoute>} />
            <Route path="/sales/credit-note" element={<ProtectedRoute><Layout><ComingSoon /></Layout></ProtectedRoute>} />
            <Route path="/sales/proforma" element={<ProtectedRoute><Layout><ComingSoon /></Layout></ProtectedRoute>} />

            {/* DELIVERY CHALLAN */}
            <Route path="/sales/delivery-challan" element={<ProtectedRoute><Layout><DeliveryChallan /></Layout></ProtectedRoute>} />
            <Route path="/sales/delivery-challan/create" element={<ProtectedRoute><Layout><CreateDeliveryChallan /></Layout></ProtectedRoute>} />
            <Route path="/delivery" element={<ProtectedRoute><Layout><DeliveryChallan /></Layout></ProtectedRoute>} />

            {/* OTHER MODULES */}
            <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute><Layout><POSBilling /></Layout></ProtectedRoute>} />
            <Route path="/e-invoicing" element={<ProtectedRoute><Layout><EInvoicing /></Layout></ProtectedRoute>} />
            <Route path="/online-orders" element={<ProtectedRoute><Layout><OnlineOrders /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;