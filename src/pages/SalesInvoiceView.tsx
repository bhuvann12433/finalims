import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Printer, Edit, Trash2, ArrowLeft, Download, Share2, 
  FileText, CreditCard, CheckCircle, AlertCircle, Loader2 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import printInvoice from "./InvoicePrintTemplate";

// Define Types (Matches your Create Page)
type InvoiceItem = {
  name: string;
  description?: string;
  hsn?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_amount: number;
  tax_percent: number;
};

type InvoiceData = {
  _id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  party: { name: string; address?: string; gstin?: string; mobile?: string } | any;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amount_received: number;
  balance_due: number;
  status: string;
  ptName?: string;
  dos?: string;
  terms?: string;
  bankDetails?: any;
};

export default function SalesInvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "admin";
  const canEdit = isAdmin || user?.permissions?.canEdit;
  const canDelete = isAdmin || user?.permissions?.canDelete;

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`${apiBase}/api/invoices/${id}`);
      if (!res.ok) throw new Error("Failed to load invoice");
      const data = await res.json();
      setInvoice(data);
    } catch (error) {
      toast({ title: "Error", description: "Could not load invoice details", variant: "destructive" });
      navigate("/sales");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice permanently?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Deleted", description: "Invoice deleted successfully" });
      navigate("/sales");
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete invoice", variant: "destructive" });
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    if (invoice) {
      // Pass invoice data to your existing print template
      printInvoice(invoice, [], null); 
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

  // Resolve Party Object (it might be populated or just an ID)
  const partyName = typeof invoice.party === 'object' ? invoice.party.name : "Unknown Party";
  const partyAddr = typeof invoice.party === 'object' ? invoice.party.address : "";
  const partyGstin = typeof invoice.party === 'object' ? invoice.party.gstin : "";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      
      {/* HEADER BAR */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/sales")}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {invoice.invoice_number}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                invoice.balance_due <= 0 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-orange-50 text-orange-700 border-orange-200"
              }`}>
                {invoice.balance_due <= 0 ? "PAID" : "UNPAID"}
              </span>
            </h1>
            <p className="text-xs text-gray-500">Created on {format(new Date(invoice.invoice_date), "dd MMM yyyy")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/sales/create?edit=${invoice._id}`)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* INVOICE CONTENT */}
      <div className="max-w-4xl mx-auto mt-6 p-8 bg-white shadow rounded-lg border">
        
        {/* TOP ROW: LOGO & META */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div className="flex items-center gap-4">
             {/* Static Logo from Assets */}
             <img src="/assets/logo.png" className="h-16 w-auto object-contain" alt="Logo" onError={(e) => e.currentTarget.style.display = 'none'} />
             <div>
               <h2 className="text-2xl font-bold text-blue-800">GNR SURGICALS</h2>
               <p className="text-xs text-gray-500 max-w-[200px]">10-4-70 Annapuranamma Hospital Line, Palanaduroad, Narasaraopet, AP - 522601</p>
             </div>
          </div>
          <div className="text-right space-y-1">
             <div className="text-sm text-gray-500">Invoice Date</div>
             <div className="font-semibold">{format(new Date(invoice.invoice_date), "dd MMM yyyy")}</div>
             <div className="text-sm text-gray-500 mt-2">Due Date</div>
             <div className="font-semibold">{format(new Date(invoice.due_date), "dd MMM yyyy")}</div>
          </div>
        </div>

        {/* ADDRESSES */}
        <div className="grid grid-cols-2 gap-10 mb-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Billed To</h3>
            <div className="font-bold text-lg text-gray-800">{partyName}</div>
            <p className="text-sm text-gray-600 whitespace-pre-line">{partyAddr || "No Address"}</p>
            {partyGstin && <p className="text-xs text-blue-600 mt-1 font-medium">GSTIN: {partyGstin}</p>}
          </div>
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Payment Details</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-bold">₹{invoice.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Paid</span>
              <span className="text-green-600 font-medium">₹{invoice.amount_received.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2 mt-2">
              <span className="font-bold text-gray-700">Balance Due</span>
              <span className={`font-bold ${invoice.balance_due > 0 ? "text-red-600" : "text-green-600"}`}>
                ₹{invoice.balance_due.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* CUSTOM FIELDS (PT NAME / DOS) */}
        {(invoice.ptName || invoice.dos) && (
           <div className="flex gap-6 mb-6 text-sm bg-blue-50 p-3 rounded border border-blue-100">
              {invoice.ptName && <div><span className="text-blue-600 font-semibold">PT Name:</span> {invoice.ptName}</div>}
              {invoice.dos && <div><span className="text-blue-600 font-semibold">DOS:</span> {invoice.dos}</div>}
           </div>
        )}

        {/* ITEMS TABLE */}
        <div className="border rounded-lg overflow-hidden mb-8">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Tax</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="p-3 text-gray-400">{index + 1}</td>
                  <td className="p-3">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                  </td>
                  <td className="p-3 text-right">₹{item.unit_price}</td>
                  <td className="p-3 text-center">{item.quantity} {item.unit}</td>
                  <td className="p-3 text-right">{item.tax_percent}%</td>
                  <td className="p-3 text-right font-medium">
                    ₹{((item.quantity * item.unit_price) - (item.discount_amount || 0)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER AREA */}
        <div className="flex flex-col md:flex-row justify-between gap-8">
           {/* TERMS & SIGNATURE */}
           <div className="flex-1">
              <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Terms & Conditions</h4>
              <p className="text-xs text-gray-600 whitespace-pre-line mb-6">
                {invoice.terms || "Goods once sold will not be taken back.\nWarranty Terms: Company Standard Warranty Applies."}
              </p>

              <div className="mt-8">
                 <p className="text-xs font-bold text-gray-400 uppercase mb-2">Authorized Signatory</p>
                 {/* Static Signature from Assets */}
                 <img src="/assets/signature.png" className="h-16 w-auto opacity-80" alt="Signature" onError={(e) => e.currentTarget.style.display = 'none'} />
                 <p className="text-sm font-bold text-gray-800 mt-1">GNR SURGICALS</p>
              </div>
           </div>

           {/* TOTALS SUMMARY */}
           <div className="w-full md:w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>- ₹{invoice.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (GST)</span>
                <span>+ ₹{invoice.tax.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                 <span className="font-bold text-gray-800 text-lg">Total</span>
                 <span className="font-bold text-blue-700 text-lg">₹{invoice.total.toLocaleString()}</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}