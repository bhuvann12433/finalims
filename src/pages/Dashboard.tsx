import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  Search,
  ChevronDown,
  Cone
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { format, subDays, isSameDay, parseISO } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const [stats, setStats] = useState({
    toCollect: 0,
    toPay: 0,
    cashBank: 0,
  });

  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const invRes = await fetch(`${API}/api/invoices`);
      const invData = await invRes.json();
      setInvoices(invData || []);

      try {
        const statsRes = await fetch(`${API}/api/dashboard`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            toCollect: statsData.toCollect || 0,
            toPay: statsData.toPay || 0,
            cashBank: statsData.cashBank || 0
          });
        }
      } catch {
        console.warn("Dashboard stats API not found");
      }

    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- GRAPH LOGIC ---
  const { chartData, recentSalesTotal, recentInvoiceCount } = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      return {
        date: d,
        label: format(d, "EEE"),
        fullDate: format(d, "dd MMM"),
        amount: 0,
      };
    });

    let total = 0;
    let count = 0;

    invoices.forEach((inv) => {
      if (!inv.invoice_date) return;
      const invDate = parseISO(inv.invoice_date);
      const idx = last7Days.findIndex((d) => isSameDay(d.date, invDate));
      if (idx !== -1) {
        const amt = Number(inv.total_amount) || 0;
        last7Days[idx].amount += amt;
        total += amt;
        count++;
      }
    });

    return { chartData: last7Days, recentSalesTotal: total, recentInvoiceCount: count };
  }, [invoices]);

  const filteredInvoices = invoices.filter((inv) =>
    ((inv.invoice_number ?? "") + " " + (inv.party?.name ?? inv.party_name ?? ""))
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-xs text-gray-500">
           Last Update: {format(new Date(), "dd MMM yyyy | hh:mm a")}
        </div>
      </div>

      <p className="text-gray-700 font-semibold text-sm">Business Overview</p>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Card className="border-0 shadow-sm bg-[#F0FDF4]">
          <CardContent className="p-6">
            <p className="text-green-600 font-medium text-sm flex items-center gap-1">
              <ArrowDownLeft className="h-4 w-4" /> To Collect
            </p>
            <h3 className="text-2xl font-bold mt-2">
              ₹ {stats.toCollect.toLocaleString()}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-[#FEF2F2]">
          <CardContent className="p-6">
            <p className="text-red-500 font-medium text-sm flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" /> To Pay
            </p>
            <h3 className="text-2xl font-bold mt-2">
              ₹ {stats.toPay.toLocaleString()}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-[#F8FAFC]">
          <CardContent className="p-6">
            <p className="text-blue-500 font-medium text-sm flex items-center gap-1">
              <Landmark className="h-4 w-4" /> Total Cash + Bank Balance
            </p>
            <h3 className="text-2xl font-bold mt-2">
              ₹ {stats.cashBank.toLocaleString()}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="xl:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Latest Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input 
                   placeholder="Search transactions..." 
                   className="pl-10"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>

              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Txn No</TableHead>
                      <TableHead>Party Name</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredInvoices.slice(0, 5).map((inv, i) => (
                      <TableRow 
                        key={inv.id || i}
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                          if (!inv?.id) {
                            console.warn("Invoice missing ID", inv);
                            return;
                          }
                          navigate(`/sales/view/${inv.id}`);
                        }}
                      >
                        <TableCell>{inv.invoice_date ? format(parseISO(inv.invoice_date), "dd MMM yyyy") : "-"}</TableCell>
                        <TableCell>Sales Invoice</TableCell>
                        <TableCell>{inv.invoice_number}</TableCell>
                        <TableCell>{inv.party?.name || inv.party_name || "-"}</TableCell>
                        <TableCell className="text-right">
                          ₹ {(Number(inv.total_amount) || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                </Table>
              </div>

              <div className="mt-4 text-center">
                <button 
                  onClick={() => navigate('/sales/invoices')}
                  className="text-blue-500 text-sm font-medium hover:underline"
                >
                  See All Transactions
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* CHECKLIST */}
        <div>
          <Card className="shadow-sm p-10 flex flex-col items-center">
              <Cone className="h-12 w-12 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold">Coming Soon...</h3>
              <p className="text-gray-600 text-sm text-center mt-2">
                Smarter daily checklist will appear here.
              </p>
          </Card>
        </div>

      </div>

      {/* SALES REPORT */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            
            <div className="flex-1 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`₹ ${value.toLocaleString()}`, "Sales"]} />
                  <Area type="monotone" dataKey="amount" stroke="#22c55e" fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full lg:w-48 space-y-6">
               <div>
                  <p className="text-sm text-gray-500">Last 7 days sales</p>
                  <p className="text-2xl font-bold">₹ {recentSalesTotal.toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-sm text-gray-500">Invoices Made</p>
                  <p className="text-2xl font-bold">{recentInvoiceCount}</p>
               </div>
            </div>

          </div>
        </CardContent>

      </Card>

    </div>
  );
}
