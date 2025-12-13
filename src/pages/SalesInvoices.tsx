import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash,
  CalendarDays,
  ChevronDown,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Date-fns imports
import { 
  format, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear, 
  isWithinInterval,
  parseISO,
  differenceInDays,
  isValid
} from "date-fns";

export default function SalesInvoices() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Date Filter State
  const [dateFilterLabel, setDateFilterLabel] = useState("Last 365 Days");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: subDays(new Date(), 365),
    end: new Date()
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/invoices`);
      const data = await res.json();
      setInvoices(data || []);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvoice = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when deleting
    if (!confirm("Delete invoice permanently?")) return;
    try {
      await fetch(`${API}/api/invoices/${id}`, { method: "DELETE" });
      setInvoices((prev) => prev.filter((inv) => inv.id !== id && inv._id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // --- FILTERING & TOTALS ---
  const processedData = useMemo(() => {
    const filtered = invoices.filter((inv) => {
      const partyName = inv.party?.name || inv.party_name || "";
      const searchMatch = (
        (inv.invoice_number ?? "") + " " + partyName
      ).toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Date Filter
      if (!dateRange.start || !dateRange.end) return true; 
      const invDate = parseISO(inv.invoice_date);
      if (!isValid(invDate)) return true;
      const start = new Date(dateRange.start.setHours(0,0,0,0));
      const end = new Date(dateRange.end.setHours(23,59,59,999));
      return isWithinInterval(invDate, { start, end });
    });

    const totals = filtered.reduce(
      (acc, curr) => {
        const amount = Number(curr.total || curr.total_amount) || 0;
        acc.total += amount;
        if (curr.payment_status === "paid") acc.paid += amount;
        else if (curr.payment_status === "unpaid" || curr.payment_status === "overdue") acc.unpaid += amount;
        return acc;
      },
      { total: 0, paid: 0, unpaid: 0 }
    );

    return { filtered, totals };
  }, [invoices, searchTerm, dateRange]);

  const { filtered: filteredInvoices, totals } = processedData;

  const handleDateFilterChange = (label: string) => {
    setDateFilterLabel(label);
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = today;

    switch (label) {
      case "Today": start = today; break;
      case "Yesterday": start = subDays(today, 1); end = subDays(today, 1); break;
      case "This Week": start = startOfWeek(today); end = endOfWeek(today); break;
      case "Last 7 Days": start = subDays(today, 7); break;
      case "This Month": start = startOfMonth(today); end = endOfMonth(today); break;
      case "This Quarter": start = startOfQuarter(today); end = endOfQuarter(today); break;
      case "Current Fiscal Year": start = startOfYear(today); end = endOfYear(today); break;
      case "Last 365 Days": start = subDays(today, 365); break;
      default: start = null; end = null;
    }
    setDateRange({ start, end });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700 border-green-200";
      case "unpaid": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "overdue": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-[22px] font-semibold">Sales Invoices</h1>
        <div className="flex flex-wrap items-center gap-3">
           <Button variant="outline" className="flex items-center gap-2 h-[38px] border-gray-300">
             <BarChart3 className="h-4 w-4" /> Reports <ChevronDown className="h-4 w-4" />
           </Button>
           <Button className="bg-[#5b3df5] hover:bg-[#472fbe] text-white h-[38px]" onClick={() => navigate("/sales/create")}>
             <Plus className="mr-2 h-4 w-4" /> Create Sales Invoice
           </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl px-5 py-3 bg-white shadow-sm h-[88px] flex flex-col justify-center">
          <p className="text-[13px] font-medium text-gray-700">Total Sales</p>
          <p className="text-[22px] font-bold mt-1">₹{totals.total.toLocaleString()}</p>
        </div>
        <div className="border rounded-xl px-5 py-3 bg-white shadow-sm h-[88px] flex flex-col justify-center">
          <p className="text-[13px] font-medium text-green-700">Paid</p>
          <p className="text-[22px] font-bold mt-1">₹{totals.paid.toLocaleString()}</p>
        </div>
        <div className="border rounded-xl px-5 py-3 bg-white shadow-sm h-[88px] flex flex-col justify-center">
          <p className="text-[13px] font-medium text-red-700">Unpaid / Overdue</p>
          <p className="text-[22px] font-bold mt-1">₹{totals.unpaid.toLocaleString()}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search Invoice..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 h-[38px]" 
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-52 h-[38px] px-4 rounded-md border bg-white flex items-center justify-between text-[14px] hover:bg-gray-50 whitespace-nowrap">
                <span className="flex items-center gap-2 overflow-hidden">
                  <CalendarDays className="h-4 w-4 text-gray-600 shrink-0" />
                  <span className="truncate">{dateFilterLabel}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
              {[
                "Today", "Yesterday", "This Week", "Last 7 Days", 
                "This Month", "This Quarter", "Current Fiscal Year", 
                "Last 365 Days", "All Time"
              ].map((label) => (
                <DropdownMenuItem key={label} onClick={() => handleDateFilterChange(label)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8F9FA]">
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Due In</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading invoices...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => {
                const dueDate = inv.due_date ? new Date(inv.due_date) : null;
                const daysDue = dueDate ? differenceInDays(dueDate, new Date()) : 0;
                const invoiceDate = parseISO(inv.invoice_date);

                // Safe ID check
                const invId = inv.id || inv._id;

                return (
                  <TableRow 
                    key={invId} 
                    className="hover:bg-blue-50/50 cursor-pointer group"
                    onClick={() => navigate(`/sales/view/${invId}`)} // <--- ROW CLICK NAVIGATION
                  >
                    <TableCell className="font-medium text-gray-700">
                      {isValid(invoiceDate) ? format(invoiceDate, "dd MMM yyyy") : "-"}
                    </TableCell>
                    
                    <TableCell>{inv.invoice_number}</TableCell>
                    
                    <TableCell className="font-medium">
                      {inv.party?.name || inv.party_name || "-"}
                    </TableCell>
                    
                    <TableCell>
                       {inv.payment_status === 'paid' ? (
                         <span className="text-green-600 text-xs">Paid</span>
                       ) : dueDate ? (
                         <span className={`text-xs ${daysDue < 0 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                           {daysDue < 0 ? `${Math.abs(daysDue)} days overdue` : `${daysDue} days`}
                         </span>
                       ) : "-"}
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      ₹{Number(inv.total || inv.total_amount).toLocaleString()}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className={`border-0 ${getStatusBadge(inv.payment_status)}`}>
                        {inv.payment_status?.toUpperCase() || "UNKNOWN"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {/* Stop propagation so clicking menu doesn't navigate */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/sales/view/${invId}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/sales/edit/${invId}`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => deleteInvoice(invId, e)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}