import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Search, Minus, X, Lock, Loader2 } from "lucide-react";
import printInvoice from "./InvoicePrintTemplate";
import { useAuth } from "@/contexts/AuthContext";

// Types
type Party = { _id: string; name: string; address?: string; mobile?: string; gstin?: string };
type Item = { _id: string; name: string; description?: string; hsn?: string; item_code?: string; sales_price?: number; purchase_price?: number; gst_rate?: number; unit?: string; quantity?: number; mrp?: number; };
type InvoiceItem = { item_id: string; name: string; description?: string; hsn?: string; quantity: number; unit_price: number; discount_percent: number; discount_amount?: number; tax_percent: number; unit?: string; mfg?: string; batch?: string; exp_date?: string; mrp?: number; };

export default function CreateSalesInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { toast } = useToast();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  // Auth Check
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canEdit = isAdmin || user?.permissions?.canEdit;
  const isViewOnly = editId && !canEdit;

  // Data State
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Form State
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [invoicePrefix, setInvoicePrefix] = useState("GSTSAL25-26/");
  const [invoiceNo, setInvoiceNo] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState<string>(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  
  // Specific Fields from Video
  const [ptName, setPtName] = useState("");
  const [dos, setDos] = useState("");
  const [umr, setUmr] = useState("");
  
  // Terms & Bank (Defaults from your video)
  const [terms, setTerms] = useState("100% Payment As Advance along with PO.\nGoods once sold will not be taken back.\nWarranty Terms:\nCompany Standard Warranty Applies.");
  const [bankDetails, setBankDetails] = useState({
    accNo: "50200021977447",
    ifsc: "HDFC0001034",
    bank: "HDFC BANK",
    branch: "NARASARAOPETA ANDHRA PRADESH",
    holder: "GNR SURGICALS"
  });

  // Dialogs
  const [itemListOpen, setItemListOpen] = useState(false);
  const [itemListSearch, setItemListSearch] = useState("");
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState<Item | null>(null);
  const [qtyToAdd, setQtyToAdd] = useState<number>(1);

  // Items & Payments
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [paymentReceived, setPaymentReceived] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [autoRoundOff, setAutoRoundOff] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const partyBoxRef = useRef<HTMLDivElement | null>(null);

  // Init
  useEffect(() => {
    (async () => {
      await Promise.all([fetchParties(), fetchItems()]);
      if (editId) {
        await loadInvoiceForEdit(editId);
      } else {
        await fetchNextInvoiceNumber();
      }
    })();
  }, [editId]);

  async function safeFetchJson(url: string, opts?: RequestInit) {
    const r = await fetch(url, opts);
    if (!r.ok) { const txt = await r.text(); try { throw JSON.parse(txt); } catch { throw new Error(txt || "Request failed"); } }
    return r.json();
  }

  const fetchParties = async () => setParties(await safeFetchJson(`${apiBase}/api/parties`).catch(() => []));
  const fetchItems = async () => setItems(await safeFetchJson(`${apiBase}/api/items`).catch(() => []));

  const fetchNextInvoiceNumber = async () => {
    try {
      const data = await safeFetchJson(`${apiBase}/api/invoices/next-number`);
      setInvoiceNo(String(data.nextNumber));
    } catch (err) { console.error(err); }
  };

  const loadInvoiceForEdit = async (id: string) => {
    setLoadingData(true);
    try {
      const data = await safeFetchJson(`${apiBase}/api/invoices/${id}`);
      setSelectedParty(data.party?._id || data.party);
      if (data.invoice_number?.includes("/")) {
          const parts = data.invoice_number.split("/");
          const numberPart = parts.pop();
          setInvoicePrefix(parts.join("/") + "/");
          setInvoiceNo(numberPart || "");
      } else { setInvoiceNo(data.invoice_number); }
      
      if(data.invoice_date) setInvoiceDate(data.invoice_date.split("T")[0]);
      if(data.due_date) setDueDate(data.due_date.split("T")[0]);
      setPtName(data.ptName || ""); setDos(data.dos || ""); setUmr(data.umr || "");
      setPaymentMode(data.payment_mode || "Cash");
      if(data.terms) setTerms(data.terms);

      const mappedItems = (data.items || []).map((item: any) => ({
        item_id: item.item_id || item._id, name: item.name, description: item.description || "", hsn: item.hsn || "", quantity: Number(item.quantity), unit_price: Number(item.unit_price), discount_percent: Number(item.discount_percent || 0), discount_amount: Number(item.discount_amount || 0), tax_percent: Number(item.tax_percent || 0), unit: item.unit || "UNT", mfg: item.mfg || "", batch: item.batch || "", exp_date: item.exp_date ? item.exp_date.split("T")[0] : "", mrp: Number(item.mrp || 0),
      }));
      setInvoiceItems(mappedItems);
      setPaymentReceived(data.amount_received || 0);
    } catch (error) { navigate("/sales"); } finally { setLoadingData(false); }
  };

  // Logic
  const filteredItems = useMemo(() => {
    if (!itemListSearch.trim()) return items;
    const q = itemListSearch.toLowerCase();
    return items.filter((it) => it.name.toLowerCase().includes(q) || (it.hsn || "").includes(q));
  }, [items, itemListSearch]);

  const openStockDialog = (it: Item) => { setSelectedItemForStock(it); setQtyToAdd(1); setStockDialogOpen(true); };
  const handleQtyChange = (delta: number) => { setQtyToAdd((prev) => Math.max(1, prev + delta)); };
  
  const onSaveStock = () => {
    if (!selectedItemForStock) return;
    const newItem: InvoiceItem = {
      item_id: selectedItemForStock._id, name: selectedItemForStock.name, description: selectedItemForStock.description, hsn: selectedItemForStock.hsn, quantity: qtyToAdd, unit_price: Number(selectedItemForStock.sales_price || 0), discount_percent: 0, discount_amount: 0, tax_percent: Number(selectedItemForStock.gst_rate || 0), unit: selectedItemForStock.unit || "UNT", mfg: "", batch: "", exp_date: "", mrp: Number(selectedItemForStock.mrp || selectedItemForStock.sales_price || 0),
    };
    setInvoiceItems(prev => [...prev, newItem]);
    setStockDialogOpen(false); setItemListOpen(false);
  };

  const removeInvoiceItem = (index: number) => { if(!isViewOnly) setInvoiceItems(prev => prev.filter((_, i) => i !== index)); };
  const updateInvoiceItem = (index: number, patch: Partial<InvoiceItem>) => { if(!isViewOnly) setInvoiceItems(prev => { const c = [...prev]; c[index] = { ...c[index], ...patch }; return c; }); };

  const totals = useMemo(() => {
    let subtotal = 0, discount = 0, tax = 0;
    invoiceItems.forEach((it) => {
      const price = Number(it.unit_price) || 0; const qty = Number(it.quantity) || 0;
      const itemSubtotal = price * qty;
      const discountRs = it.discount_amount || (itemSubtotal * (it.discount_percent || 0)) / 100;
      const taxable = itemSubtotal - discountRs;
      const taxRs = (taxable * (it.tax_percent || 0)) / 100;
      subtotal += itemSubtotal; discount += discountRs; tax += taxRs;
    });
    let total = subtotal - discount + tax; if (autoRoundOff) total = Math.round(total);
    return { subtotal, discount, tax, total };
  }, [invoiceItems, autoRoundOff]);

  const handlePrint = () => {
    if (!selectedParty) return toast({ title: "Select Party first", variant: "destructive" });
    // Pass the static stamp image path to print function
    printInvoice({ 
      invoice_number: `${invoicePrefix}${invoiceNo}`, 
      invoice_date: invoiceDate, 
      due_date: dueDate, 
      party_id: selectedParty, 
      items: invoiceItems, 
      totals: totals, 
      ptName, dos, umr, 
      terms,
      bankDetails 
    }, parties, "/stamp.png"); // Passing string path instead of File object
  };
  
  const saveInvoice = async () => {
    if (isViewOnly) return toast({ title: "View Only", variant: "destructive" });
    if (!selectedParty) return toast({ title: "Select Party", variant: "destructive" });
    
    setSaving(true);
    try {
      const payload = {
        invoice_number: `${invoicePrefix}${invoiceNo}`, invoice_date: invoiceDate, due_date: dueDate, party_id: selectedParty,
        items: invoiceItems, subtotal: Number(totals.subtotal), discount: Number(totals.discount), tax: Number(totals.tax), total: Number(totals.total),
        amount_received: Number(paymentReceived), balance_due: Number(Math.max(0, totals.total - paymentReceived)),
        ptName, dos, umr, payment_mode: paymentMode, terms
      };

      const url = editId ? `${apiBase}/api/invoices/${editId}` : `${apiBase}/api/invoices`;
      const method = editId ? "PUT" : "POST";
      await safeFetchJson(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      
      toast({ title: editId ? "Invoice Updated!" : "Invoice Created Successfully!" });
      navigate("/sales");
    } catch (error: any) { toast({ title: "Failed to save", description: error.message, variant: "destructive" }); } finally { setSaving(false); }
  };

  if (loadingData) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="bg-gray-100 min-h-screen pb-10 font-sans text-sm text-gray-700">
      
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black text-xl">←</button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800">
                {editId ? (isViewOnly ? "View Invoice" : "Edit Invoice") : "Create Sales Invoice"}
            </h1>
            {isViewOnly && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs border border-yellow-200 flex items-center gap-1"><Lock className="w-3 h-3"/> Read Only</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint}>Print</Button>
          {!isViewOnly && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6" size="sm" onClick={saveInvoice} disabled={saving}>
                {saving ? "Saving..." : editId ? "Update" : "Save"}
              </Button>
          )}
        </div>
      </div>

      <div className={`max-w-[1400px] mx-auto p-4 ${isViewOnly ? "pointer-events-none opacity-90" : ""}`}>
        
        {/* TOP SECTION */}
        <div className="bg-white rounded-md shadow-sm border p-5 mb-4 grid grid-cols-12 gap-8">
          <div className="col-span-7">
            <div className="text-gray-600 mb-2 font-medium">Bill To</div>
            <div className="relative" ref={partyBoxRef}>
              <div 
                className={`w-full h-32 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${selectedParty ? 'border-blue-300 bg-blue-50' : 'border-blue-400'}`}
                onClick={() => !isViewOnly && setShowPartyDropdown(!showPartyDropdown)}
              >
                {selectedParty ? (() => {
                  const p = parties.find(x => x._id === selectedParty);
                  return (
                    <div className="text-left w-full px-6">
                      <div className="font-bold text-blue-800 text-lg">{p?.name || "Unknown Party"}</div>
                      <div className="text-gray-600">{p?.address || ""}</div>
                      <div className="text-gray-500 text-xs mt-1">GSTIN: {p?.gstin || "N/A"}</div>
                    </div>
                  );
                })() : <div className="text-blue-500 font-medium flex items-center gap-1">+ Add Party</div>}
              </div>
              {showPartyDropdown && (
                <div className="absolute z-50 mt-1 left-0 right-0 bg-white border rounded shadow-xl max-h-60 overflow-auto pointer-events-auto">
                  <div className="p-2 border-b bg-gray-50"><Input placeholder="Search Party..." className="h-8" /></div>
                  {parties.map(p => (
                    <div key={p._id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-0" onClick={() => { setSelectedParty(p._id); setShowPartyDropdown(false); }}>
                      <div className="font-medium text-gray-800">{p.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1"><label className="text-xs text-gray-500 block mb-1">Invoice Prefix</label><Input className="h-8 bg-gray-50" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} /></div>
              <div className="col-span-1"><label className="text-xs text-gray-500 block mb-1">Invoice Number</label><Input className="h-8 bg-gray-50" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
              <div className="col-span-1"><label className="text-xs text-gray-500 block mb-1">Date</label><Input type="date" className="h-8" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div><label className="text-[10px] text-gray-400 uppercase">PT NAME:</label><Input className="h-7 bg-gray-50 text-xs" value={ptName} onChange={e => setPtName(e.target.value)} /></div>
              <div><label className="text-[10px] text-gray-400 uppercase">DOS:</label><Input className="h-7 bg-gray-50 text-xs" value={dos} onChange={e => setDos(e.target.value)} /></div>
              <div><label className="text-[10px] text-gray-400 uppercase">UMR:</label><Input className="h-7 bg-gray-50 text-xs" value={umr} onChange={e => setUmr(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="bg-white rounded-md shadow-sm border mb-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-600 font-semibold uppercase">
                  <th className="p-3 w-8">NO</th><th className="p-3 w-48">ITEMS</th><th className="p-3 w-20">HSN</th><th className="p-3 w-20">QTY</th><th className="p-3 w-24">PRICE</th><th className="p-3 w-20">DISC</th><th className="p-3 w-20">TAX</th><th className="p-3 w-24 text-right">AMOUNT</th><th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {invoiceItems.map((it, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2 text-center text-gray-400">{i + 1}</td>
                      <td className="p-2"><div className="font-medium text-gray-800">{it.name}</div></td>
                      <td className="p-2 text-gray-500">{it.hsn || "-"}</td>
                      <td className="p-2"><Input className="h-7 text-xs px-1 text-center w-14" value={it.quantity} onChange={e => updateInvoiceItem(i, { quantity: Number(e.target.value) })} /></td>
                      <td className="p-2"><Input className="h-7 text-xs px-1 text-right" value={it.unit_price} onChange={e => updateInvoiceItem(i, { unit_price: Number(e.target.value) })} /></td>
                      <td className="p-2"><Input className="h-7 text-xs px-1 text-center" value={it.discount_percent} onChange={e => updateInvoiceItem(i, { discount_percent: Number(e.target.value) })} /></td>
                      <td className="p-2 text-center text-gray-500">{it.tax_percent}%</td>
                      <td className="p-2 text-right font-medium">₹{((it.quantity * it.unit_price) - (it.discount_amount || 0)).toFixed(2)}</td>
                      <td className="p-2 text-center">{!isViewOnly && <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500 cursor-pointer mx-auto" onClick={() => removeInvoiceItem(i)}/>}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isViewOnly && (
              <div className="flex p-4 gap-4 bg-white pointer-events-auto">
                <div className="flex-1 border-2 border-dashed border-blue-300 rounded h-10 flex items-center justify-center text-blue-500 font-medium cursor-pointer hover:bg-blue-50 transition" onClick={() => setItemListOpen(true)}>+ Add Item</div>
              </div>
          )}
        </div>

        {/* ✅ EXACT LAYOUT FROM VIDEO */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 pointer-events-auto">
          
          {/* LEFT: Terms & Bank Details */}
          <div className="flex-1 space-y-4">
             <div className="bg-white p-4 rounded shadow-sm border h-full">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-sm font-semibold text-gray-700">Terms and Conditions</h3>
                </div>
                <Textarea 
                   className="min-h-[100px] text-xs bg-gray-50 resize-none" 
                   value={terms} 
                   onChange={e => setTerms(e.target.value)} 
                   disabled={isViewOnly}
                />
                
                <div className="mt-4 pt-4 border-t">
                   <h3 className="text-sm font-semibold text-gray-700 mb-2">Bank Details</h3>
                   <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex"><span className="w-24 font-medium text-gray-500">Account Number:</span> <span>{bankDetails.accNo}</span></div>
                      <div className="flex"><span className="w-24 font-medium text-gray-500">IFSC Code:</span> <span>{bankDetails.ifsc}</span></div>
                      <div className="flex"><span className="w-24 font-medium text-gray-500">Bank & Branch:</span> <span>{bankDetails.bank}, {bankDetails.branch}</span></div>
                      <div className="flex"><span className="w-24 font-medium text-gray-500">Account Name:</span> <span>{bankDetails.holder}</span></div>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT: Totals & Signature */}
          <div className="w-full lg:w-[400px] bg-white p-5 rounded shadow-sm border flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Discount</span><span>- ₹{totals.discount.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Taxable Amount</span><span>₹{(totals.subtotal - totals.discount).toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>+ ₹{totals.tax.toFixed(2)}</span></div>
              
              <div className="flex justify-between items-center py-2 border-t border-b border-dashed my-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">Total Amount</span>
                  <div className="flex items-center gap-1">
                    <input type="checkbox" id="roundOff" checked={autoRoundOff} onChange={(e) => setAutoRoundOff(e.target.checked)} disabled={isViewOnly} className="w-3 h-3"/>
                    <label htmlFor="roundOff" className="text-[10px] text-gray-500 cursor-pointer">Round Off</label>
                  </div>
                </div>
                <span className="font-bold text-gray-800 text-xl">₹{totals.total.toFixed(2)}</span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                   <label className="text-sm font-medium text-gray-600">Amount Received</label>
                   <div className="flex items-center gap-2">
                      <select className="h-8 border rounded text-xs bg-gray-50" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} disabled={isViewOnly}>
                        <option>Cash</option><option>UPI</option><option>Bank</option>
                      </select>
                      <Input type="number" className="w-24 text-right h-8" value={paymentReceived} onChange={(e) => setPaymentReceived(Number(e.target.value))} disabled={isViewOnly} />
                   </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-600">Balance Amount</span>
                  <span className="font-bold text-gray-800">₹{Math.max(0, totals.total - paymentReceived).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* ✅ SIGNATURE SECTION (EXACTLY AS IN VIDEO) */}
            <div className="mt-8 text-right">
               <div className="text-xs text-gray-500 mb-2">Authorized signatory for <span className="font-bold text-gray-700">GNR SURGICALS</span></div>
               <div className="flex justify-end">
                  {/* Assumes stamp.png is in public folder */}
                  <img src="/stamp.png" alt="Stamp" className="h-20 w-20 object-contain opacity-80" />
               </div>
            </div>
          </div>
        </div>

        {/* DIALOGS (Hidden for brevity, same as before) */}
        <Dialog open={itemListOpen} onOpenChange={setItemListOpen}>
          <DialogContent className="max-w-[1000px] max-h-[90vh] flex flex-col p-0 overflow-hidden pointer-events-auto">
             <div className="p-4 border-b space-y-4">
               <div className="flex justify-between items-center"><h2 className="text-xl font-semibold">Add Items</h2><button onClick={() => setItemListOpen(false)}><X className="h-5 w-5 text-gray-500" /></button></div>
               <div className="flex gap-3"><div className="flex-1 flex items-center border rounded px-3 py-2 bg-white"><Search className="h-4 w-4 text-gray-400 mr-2" /><input placeholder="Search Items" className="w-full outline-none text-sm" value={itemListSearch} onChange={(e) => setItemListSearch(e.target.value)} autoFocus /></div></div>
             </div>
             <div className="flex-1 overflow-auto bg-gray-50">
               <table className="w-full text-sm text-left"><thead className="bg-white text-gray-500 border-b font-medium text-xs uppercase sticky top-0"><tr><th className="px-4 py-3">Item Name</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
               <tbody className="bg-white divide-y">{filteredItems.map((it) => (<tr key={it._id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-800">{it.name}</td><td className="px-4 py-3 text-right"><Button size="sm" className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100" onClick={() => openStockDialog(it)}>+ Add</Button></td></tr>))}</tbody></table>
             </div>
          </DialogContent>
        </Dialog>

        <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
           <DialogContent className="max-w-[500px] p-0 gap-0 overflow-hidden rounded-lg pointer-events-auto">
             <div className="p-4 border-b flex justify-between items-center bg-white"><DialogTitle className="text-lg font-bold">Qty</DialogTitle><button onClick={() => setStockDialogOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
             <div className="p-6 bg-white flex flex-col items-center"><div className="w-full text-center"><div className="text-2xl font-bold text-gray-800 mb-6">{selectedItemForStock?.name}</div></div><div className="flex items-center gap-4 mb-6"><button onClick={() => handleQtyChange(-1)} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"><Minus className="w-6 h-6" /></button><div className="w-24 text-center"><div className="text-4xl font-bold text-gray-800">{qtyToAdd}</div></div><button onClick={() => handleQtyChange(1)} className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition shadow-md"><Plus className="w-6 h-6" /></button></div></div>
             <div className="p-4 border-t bg-gray-50 flex justify-end gap-3"><Button variant="outline" onClick={() => setStockDialogOpen(false)}>Cancel</Button><Button className="bg-blue-600 hover:bg-blue-700 px-8 font-medium" onClick={onSaveStock}>Add</Button></div>
           </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}