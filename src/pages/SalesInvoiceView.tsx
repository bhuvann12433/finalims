import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Share2,
  FileText,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, parseISO, isValid } from "date-fns";

export default function SalesInvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;
  const printRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API}/api/invoices/${id}`);
        const data = await res.json();
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, API]);

  // --- 2. NUMBER TO WORDS CONVERTER ---
  const numberToWords = (num: number) => {
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

    const inWords = (n: number): string => {
        if ((n = n.toString() as any).length > 9) return 'overflow';
        const n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n_array) return ""; 
        let str = '';
        str += (Number(n_array[1]) !== 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
        str += (Number(n_array[2]) !== 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
        str += (Number(n_array[3]) !== 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
        str += (Number(n_array[4]) !== 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
        str += (Number(n_array[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
        return str;
    };
    
    return inWords(Math.floor(num));
  }

  // --- 3. ROBUST CALCULATIONS ---
  const calculation = useMemo(() => {
    if (!invoice || !invoice.items) return { 
       totalQty: 0, totalRate: 0, totalTax: 0, subTotal: 0, 
       cgst: 0, sgst: 0, roundOff: 0, finalTotal: 0, received: 0, balance: 0 
    };

    let totalQty = 0;
    let totalRate = 0;
    let subTotal = 0;
    
    invoice.items.forEach((item: any) => {
       const qty = Number(item.quantity || 0);
       const rate = Number(item.rate || item.unit_price || 0);
       const amount = Number(item.amount) || (qty * rate);
       
       totalQty += qty;
       totalRate += rate;
       subTotal += amount;
    });

    const totalTax = subTotal * 0.05; 
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;

    let finalTotalRaw = subTotal + totalTax;
    const finalTotal = Math.round(finalTotalRaw); 
    const roundOff = finalTotal - finalTotalRaw;  

    const received = Number(invoice.amount_received || invoice.received_amount || 0);
    const balance = finalTotal - received;

    return { totalQty, totalRate, totalTax, subTotal, cgst, sgst, roundOff, finalTotal, received, balance };
  }, [invoice]);

  // --- 4. DATE HELPER ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy") : "-";
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!invoice) return <div className="p-10 text-center text-red-500">Invoice not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 space-y-4 print:p-0 print:bg-white">
      
      {/* HEADER ACTIONS (Hidden on Print) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg border shadow-sm print:hidden gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              Sales Invoice #{invoice.invoice_number}
              <Badge variant={invoice.payment_status === "paid" ? "default" : "destructive"} className="uppercase">
                {invoice.payment_status || "Unpaid"}
              </Badge>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
           <Button variant="outline" className="h-9" onClick={handlePrint}>
             <Download className="h-4 w-4 mr-2" /> Download PDF
           </Button>
           <Button variant="outline" className="h-9" onClick={handlePrint}>
             <Printer className="h-4 w-4 mr-2" /> Print PDF
           </Button>
           <Button variant="outline" size="icon" className="h-9 w-9">
             <Share2 className="h-4 w-4" />
           </Button>
           <div className="h-9 w-[1px] bg-gray-200 mx-1 hidden md:block"></div>
           <Button variant="secondary" className="h-9 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100">
             <FileText className="h-4 w-4 mr-2" /> Generate e-way Bill
           </Button>
           <Button className="h-9 bg-[#5b3df5] hover:bg-[#472fbe] text-white">
             <CreditCard className="h-4 w-4 mr-2" /> Record Payment In
           </Button>
        </div>
      </div>

      {/* --- INVOICE LAYOUT --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 print:block">
        
        {/* MAIN PAPER */}
        <div className="xl:col-span-9 bg-white shadow-sm border rounded-lg p-8 min-h-[1000px] print:shadow-none print:border-0 print:w-full print:p-0" ref={printRef}>
          
          {/* HEADER SECTION */}
          <div className="flex justify-between mb-8">
            <div className="flex gap-4 items-start">
              {/* Logo - UPDATED PATH */}
              <img 
                src="/assets/logo.png" 
                alt="Logo" 
                className="h-24 w-24 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              
              <div className="text-sm text-gray-800">
                <h2 className="text-[#1a3c8e] font-bold text-xl mb-1">GNR SURGICALS</h2>
                <p className="leading-tight text-gray-600">
                  10-4-70 ANNAPURANAMMA<br/>
                  HOSPITAL LINE PALANADUROAD ,<br/>
                  NARASARAOPET, Andhra Pradesh,<br/>
                  522601
                </p>
                <div className="mt-2 space-y-0.5 font-medium text-gray-700">
                  <p><strong>GSTIN :</strong> 37BDBPG4519D1ZY</p>
                  <p><strong>Mobile :</strong> 9704063929</p>
                  <p><strong>Email :</strong> gnrsurgicals@gmail.com</p>
                  <p className="text-xs mt-1 text-gray-500">
                    <strong>DL NO:</strong> 20B: AP/07/03/2016-<br/>133377,21B: AP/07/03/2016-<br/>133378
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex flex-col items-end">
                <h2 className="font-bold text-lg mb-1">TAX INVOICE</h2>
                <span className="border border-gray-400 px-2 py-0.5 text-[10px] text-gray-500 mb-4 rounded-sm tracking-wide">
                  ORIGINAL FOR RECIPIENT
                </span>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-y-1 text-sm text-right">
                <span className="text-gray-600 text-left">Invoice No.</span>
                <span className="font-bold">: {invoice.invoice_number}</span>
                
                <span className="text-gray-600 text-left">Invoice Date</span>
                <span className="font-bold">: {formatDate(invoice.invoice_date)}</span>
                
                <span className="text-gray-600 text-left">Due Date</span>
                <span className="font-bold">: {formatDate(invoice.due_date)}</span>

                <span className="text-gray-600 text-left">PT NAME</span>
                <span className="font-bold">: {invoice.party?.name || invoice.party_name || "-"}</span>
                
                <span className="text-gray-600 text-left">DOS</span>
                <span className="font-bold">: {formatDate(invoice.invoice_date)}</span>
              </div>
            </div>
          </div>

          {/* BILL TO / SHIP TO */}
          <div className="grid grid-cols-2 gap-10 mb-8">
            <div>
              <div className="bg-[#E0F4F7] text-[#0F4C75] font-bold px-3 py-1 text-xs mb-2 inline-block rounded-sm">
                BILL TO
              </div>
              <div className="font-bold text-sm text-gray-900 mb-1">
                {invoice.party?.name || invoice.party_name || "Cash Sale"}
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {invoice.party?.billing_address || "Address not provided"}
              </div>
              {invoice.party?.mobile && <div className="text-sm text-gray-600 mt-1">Mobile: {invoice.party.mobile}</div>}
              {invoice.party?.place_of_supply && <div className="text-sm text-gray-600">Place of Supply: {invoice.party.place_of_supply}</div>}
              {invoice.party?.dl_no && <div className="text-sm text-gray-600">DL.NO.: {invoice.party.dl_no}</div>}
            </div>

            <div>
              <div className="bg-[#E0F4F7] text-[#0F4C75] font-bold px-3 py-1 text-xs mb-2 inline-block rounded-sm">
                SHIP TO
              </div>
              <div className="font-bold text-sm text-gray-900 mb-1">
                {invoice.party?.name || invoice.party_name || "Cash Sale"}
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {invoice.party?.shipping_address || invoice.party?.billing_address || "Same as billing address"}
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="mb-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#E0F4F7] text-gray-800 font-bold text-xs uppercase border-b border-gray-300">
                  <th className="py-2 px-2 text-left w-12">S.NO.</th>
                  <th className="py-2 px-2 text-left">ITEMS</th>
                  <th className="py-2 px-2 text-right">HSN</th>
                  <th className="py-2 px-2 text-right">QTY.</th>
                  <th className="py-2 px-2 text-right">RATE</th>
                  <th className="py-2 px-2 text-right">DISC.</th>
                  <th className="py-2 px-2 text-right">TAX</th>
                  <th className="py-2 px-2 text-right w-28">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: any, index: number) => {
                  const qty = Number(item.quantity || 0);
                  const rate = Number(item.rate || item.unit_price || 0);
                  const amount = Number(item.amount) || (qty * rate);
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                       <td className="py-2 px-2 text-left">{index + 1}</td>
                       <td className="py-2 px-2 text-left font-medium text-gray-900">
                         {item.item_name || item.name}
                       </td>
                       <td className="py-2 px-2 text-right text-gray-600">{item.hsn || item.hsn_code || "9021"}</td>
                       <td className="py-2 px-2 text-right text-gray-600">{qty} {item.unit || "UNT"}</td>
                       <td className="py-2 px-2 text-right text-gray-600">{rate.toLocaleString()}</td>
                       <td className="py-2 px-2 text-right text-gray-600">{item.discount || 0}</td>
                       <td className="py-2 px-2 text-right text-gray-600">{(amount * 0.05).toFixed(1)} <span className="text-[10px]">(5%)</span></td>
                       <td className="py-2 px-2 text-right font-bold text-gray-900">{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* SUBTOTAL BAR */}
          <div className="bg-[#E0F4F7] flex items-center justify-end px-2 py-2 text-xs font-bold text-gray-800 border-t border-gray-300 mb-8">
             <div className="mr-auto pl-2">SUBTOTAL</div>
             <div className="w-16 text-right mr-10">{calculation.totalQty} UNT</div>
             <div className="w-20 text-right mr-8">{calculation.totalRate.toLocaleString()}</div>
             <div className="w-20 text-right mr-2">{calculation.totalTax.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
             <div className="w-28 text-right">₹ {calculation.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>

          {/* FOOTER SECTION */}
          <div className="flex justify-between items-start">
             
             {/* LEFT: Terms & Bank */}
             <div className="w-[55%] pr-10">
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-900 mb-1 uppercase">Terms and Conditions</h4>
                  <ol className="text-[10px] text-gray-600 list-decimal pl-3 space-y-0.5">
                    <li>Goods once sold will not be taken back.</li>
                    <li>Interest @ 18% p.a. will be charged if payment is not made within due date.</li>
                  </ol>
                </div>

                <div className="text-xs">
                   <h4 className="font-bold text-gray-900 mb-1 uppercase">Bank Details</h4>
                   <div className="grid grid-cols-[80px_1fr] gap-y-0.5 text-gray-700">
                      <span>Name:</span> <span className="font-bold">GNR SURGICALS</span>
                      <span>IFSC Code:</span> <span className="font-medium">HDFC0001034</span>
                      <span>Account No:</span> <span className="font-medium">50200021977447</span>
                      <span>Bank:</span> <span className="font-medium">HDFC Bank, NARASARAOPETA</span>
                      <span>Branch:</span> <span className="font-medium">ANDHRA PRADESH</span>
                   </div>
                </div>
             </div>

             {/* RIGHT: Totals */}
             <div className="w-[45%]">
                <div className="space-y-1 text-xs text-gray-700 border-b border-gray-200 pb-2 mb-2">
                   <div className="flex justify-between">
                      <span>Taxable Amount</span>
                      <span className="font-bold">₹ {calculation.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between">
                      <span>CGST @ 2.5%</span>
                      <span>₹ {calculation.cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between">
                      <span>SGST @ 2.5%</span>
                      <span>₹ {calculation.sgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between text-gray-500">
                      <span>Round Off</span>
                      <span>{calculation.roundOff > 0 ? '+' : ''}{calculation.roundOff.toFixed(2)}</span>
                   </div>
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 mb-2">
                   <span>Total Amount</span>
                   <span>₹ {calculation.finalTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 mb-6">
                   <span>Received Amount</span>
                   <span>₹ {calculation.received.toLocaleString()}</span>
                </div>

                <div className="text-right mb-8">
                   <p className="text-[10px] text-gray-500 mb-1">Total Amount (in words)</p>
                   <p className="text-sm font-bold text-gray-800 capitalize italic leading-tight">
                     {numberToWords(calculation.finalTotal)} Rupees Only
                   </p>
                </div>

                {/* SIGNATURE - UPDATED PATH */}
                <div className="flex flex-col items-end">
                  <div className="h-16 w-32 flex items-center justify-center mb-1">
                    <img 
                      src="/assets/signature.png" 
                      alt="Signature" 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-800 text-center">
                    Authorised Signature for<br/>GNR SURGICALS
                  </p>
                </div>
             </div>
          </div>

        </div>

        {/* SIDEBAR SUMMARY (Right) */}
        <div className="xl:col-span-3 space-y-4 print:hidden">
          <div className="bg-white border shadow-sm rounded-lg p-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Payment History</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6"><span className="text-xl">×</span></Button>
             </div>
             
             <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                   <span>Invoice Amount</span>
                   <span className="font-medium text-gray-900">₹{calculation.finalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                   <span>Initial Amount Received</span>
                   <span className="font-medium text-gray-900">₹0</span>
                </div>
                <div className="flex justify-between text-gray-600">
                   <span>Total Amount Received</span>
                   <span className="font-medium text-gray-900">₹{calculation.received.toLocaleString()}</span>
                </div>
                
                <Separator className="my-2"/>

                <div className="flex justify-between text-green-700 font-bold bg-green-50 p-2 rounded border border-green-100">
                   <span>Balance Amount</span>
                   <span>₹{calculation.balance.toLocaleString()}</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}