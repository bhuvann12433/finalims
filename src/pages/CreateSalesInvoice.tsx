import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Search, Minus, X, Settings, ScanBarcode, ChevronDown } from "lucide-react";
import printInvoice from "./InvoicePrintTemplate";

// ----------------------
// Types
// ----------------------
type Party = { _id: string; name: string; address?: string; mobile?: string; gstin?: string };

type Item = {
  _id: string;
  name: string;
  description?: string;
  hsn?: string;
  item_code?: string;
  sales_price?: number;
  purchase_price?: number;
  gst_rate?: number;
  unit?: string;
  quantity?: number; // Matches backend field
  mrp?: number;
};

type InvoiceItem = {
  item_id: string;
  name: string;
  description?: string;
  hsn?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount?: number;
  tax_percent: number;
  unit?: string;
  mfg?: string;
  batch?: string;
  exp_date?: string;
  mrp?: number;
};

export default function CreateSalesInvoice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  // ---------- Data
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // ---------- Meta
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [invoicePrefix, setInvoicePrefix] = useState("GSTSAL25-26/");
  const [invoiceNo, setInvoiceNo] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [paymentTerms, setPaymentTerms] = useState<number>(30);
  const [dueDate, setDueDate] = useState<string>(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  
  // Custom Fields
  const [ptName, setPtName] = useState("");
  const [dos, setDos] = useState("");
  const [umr, setUmr] = useState("");

  // ---------- Dialog States
  const [itemListOpen, setItemListOpen] = useState(false);
  const [itemListSearch, setItemListSearch] = useState("");
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState<Item | null>(null);
  
  // Single quantity state for the simplified popup
  const [qtyToAdd, setQtyToAdd] = useState<number>(1);

  // ---------- Invoice Items & Payment
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [paymentReceived, setPaymentReceived] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [autoRoundOff, setAutoRoundOff] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  // ---------- Dropdown Logic
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const partyBoxRef = useRef<HTMLDivElement | null>(null);

  // ----------------------
  // Fetching Helpers
  // ----------------------
  useEffect(() => {
    (async () => {
      await Promise.all([fetchParties(), fetchItems(), fetchNextInvoiceNumber()]);
    })();
  }, []);

  useEffect(() => {
    try {
      setDueDate(format(addDays(new Date(invoiceDate), Number(paymentTerms || 0)), "yyyy-MM-dd"));
    } catch {}
  }, [invoiceDate, paymentTerms]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (partyBoxRef.current && !partyBoxRef.current.contains(e.target as Node)) {
        setShowPartyDropdown(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function safeFetchJson(url: string, opts?: RequestInit) {
    const r = await fetch(url, opts);
    if (!r.ok) {
      const txt = await r.text();
      try { throw JSON.parse(txt); } catch { throw new Error(txt || "Request failed"); }
    }
    return r.json();
  }

  const fetchParties = async () => setParties(await safeFetchJson(`${apiBase}/api/parties`).catch(() => []));
  const fetchItems = async () => setItems(await safeFetchJson(`${apiBase}/api/items`).catch(() => []));

  const fetchNextInvoiceNumber = async () => {
    try {
      const data = await safeFetchJson(`${apiBase}/api/invoices/next-number`);
      setInvoiceNo(String(data.nextNumber));
    } catch (err) {
      console.error("Failed to fetch next number", err);
    }
  };

  // ----------------------
  // Logic
  // ----------------------
  const filteredItems = useMemo(() => {
    if (!itemListSearch.trim()) return items;
    const q = itemListSearch.toLowerCase();
    return items.filter((it) => it.name.toLowerCase().includes(q) || (it.hsn || "").includes(q));
  }, [items, itemListSearch]);

  // Open "Pic 4" Style Dialog
  const openStockDialog = (it: Item) => {
    setSelectedItemForStock(it);
    setQtyToAdd(1); // Reset to 1
    setStockDialogOpen(true);
  };

  const handleQtyChange = (delta: number) => {
    setQtyToAdd((prev) => Math.max(1, prev + delta));
  };

  const onSaveStock = () => {
    if (!selectedItemForStock) return;

    const newItem: InvoiceItem = {
      item_id: selectedItemForStock._id,
      name: selectedItemForStock.name,
      description: selectedItemForStock.description,
      hsn: selectedItemForStock.hsn,
      quantity: qtyToAdd,
      unit_price: Number(selectedItemForStock.sales_price || 0),
      discount_percent: 0,
      discount_amount: 0,
      tax_percent: Number(selectedItemForStock.gst_rate || 0),
      unit: selectedItemForStock.unit || "UNT",
      mfg: "",
      batch: "",
      exp_date: "",
      mrp: Number(selectedItemForStock.mrp || selectedItemForStock.sales_price || 0),
    };

    addOrIncreaseInvoiceItem(newItem);
    setStockDialogOpen(false);
    setItemListOpen(false); 
    toast({ title: "Item Added" });
  };

  const addOrIncreaseInvoiceItem = (payload: InvoiceItem) => {
    setInvoiceItems((prev) => {
      const idx = prev.findIndex((p) => p.item_id === payload.item_id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + payload.quantity };
        return copy;
      }
      return [...prev, payload];
    });
  };

  const removeInvoiceItem = (index: number) => setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  
  const updateInvoiceItem = (index: number, patch: Partial<InvoiceItem>) => {
    setInvoiceItems((prev) => {
      const c = [...prev];
      c[index] = { ...c[index], ...patch };
      return c;
    });
  };

  // --- TOTALS ---
  const totals = useMemo(() => {
    let subtotal = 0, discount = 0, tax = 0;
    invoiceItems.forEach((it) => {
      const price = Number(it.unit_price) || 0;
      const qty = Number(it.quantity) || 0;
      const itemSubtotal = price * qty;
      const discountRs = it.discount_amount || (itemSubtotal * (it.discount_percent || 0)) / 100;
      const taxable = itemSubtotal - discountRs;
      const taxRs = (taxable * (it.tax_percent || 0)) / 100;

      subtotal += itemSubtotal;
      discount += discountRs;
      tax += taxRs;
    });
    
    let total = subtotal - discount + tax;
    if (autoRoundOff) total = Math.round(total);

    return { subtotal, discount, tax, total };
  }, [invoiceItems, autoRoundOff]);

  const balanceDue = Math.max(0, totals.total - paymentReceived);

  // --- SAVE & PRINT ---
  const handlePrint = () => {
    if (!selectedParty) return toast({ title: "Select Party first", variant: "destructive" });
    
    printInvoice({
      invoice_number: `${invoicePrefix}${invoiceNo}`,
      invoice_date: invoiceDate,
      due_date: dueDate,
      party_id: selectedParty,
      items: invoiceItems,
      totals: totals,
      ptName,
      dos,
      umr
    }, parties, signatureFile);
  };

  const saveInvoice = async () => {
    if (!selectedParty) {
      toast({ title: "Select Party", variant: "destructive" });
      return;
    }
    if (invoiceItems.length === 0) {
      toast({ title: "Add Items", variant: "destructive" });
      return;
    }
    if (!invoiceNo) {
      toast({ title: "Invoice No is missing", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const cleanItems = invoiceItems.map(item => ({
        item_id: item.item_id,
        name: item.name,
        description: item.description || "",
        hsn: item.hsn || "",
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        tax_percent: Number(item.tax_percent),
        discount_percent: Number(item.discount_percent),
        discount_amount: Number(item.discount_amount),
        unit: item.unit,
        mfg: item.mfg,
        batch: item.batch,
        exp_date: item.exp_date,
        mrp: Number(item.mrp)
      }));

      const payload = {
        invoice_number: `${invoicePrefix}${invoiceNo}`,
        invoice_date: invoiceDate,
        due_date: dueDate,
        party_id: selectedParty,
        items: cleanItems,
        subtotal: Number(totals.subtotal),
        discount: Number(totals.discount),
        tax: Number(totals.tax),
        total: Number(totals.total),
        amount_received: Number(paymentReceived),
        balance_due: Number(balanceDue),
      };

      await safeFetchJson(`${apiBase}/api/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast({ title: "Invoice Saved Successfully!" });
      navigate("/sales"); 

    } catch (error: any) {
      toast({
        title: "Failed to save",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-10 font-sans text-sm text-gray-700">
      
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black text-xl">←</button>
          <h1 className="text-lg font-semibold text-gray-800">Create Sales Invoice</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 text-gray-600"><Settings className="w-4 h-4"/> Settings</Button>
          <Button variant="outline" size="sm" className="text-gray-600" onClick={handlePrint}>Print</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6" size="sm" onClick={saveInvoice} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-4">
        
        {/* TOP SECTION: BILL TO + META */}
        <div className="bg-white rounded-md shadow-sm border p-5 mb-4 grid grid-cols-12 gap-8">
          {/* LEFT: BILL TO */}
          <div className="col-span-7">
            <div className="text-gray-600 mb-2 font-medium">Bill To</div>
            <div className="relative" ref={partyBoxRef}>
              <div 
                className={`w-full h-32 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition ${selectedParty ? 'border-blue-300 bg-blue-50' : 'border-blue-400'}`}
                onClick={() => setShowPartyDropdown(!showPartyDropdown)}
              >
                {selectedParty ? (() => {
                  const p = parties.find(x => x._id === selectedParty);
                  return (
                    <div className="text-left w-full px-6">
                      <div className="font-bold text-blue-800 text-lg">{p?.name}</div>
                      <div className="text-gray-600">{p?.address}</div>
                      <div className="text-gray-500 text-xs mt-1">GSTIN: {p?.gstin}</div>
                    </div>
                  );
                })() : (
                  <div className="text-blue-500 font-medium flex items-center gap-1">+ Add Party</div>
                )}
              </div>

              {showPartyDropdown && (
                <div className="absolute z-50 mt-1 left-0 right-0 bg-white border rounded shadow-xl max-h-60 overflow-auto">
                  <div className="p-2 border-b bg-gray-50"><Input placeholder="Search Party..." className="h-8" /></div>
                  {parties.map(p => (
                    <div key={p._id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-0" 
                      onClick={() => { setSelectedParty(p._id); setShowPartyDropdown(false); }}>
                      <div className="font-medium text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.mobile}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: INVOICE META */}
          <div className="col-span-5 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-xs text-gray-500 block mb-1">Invoice Prefix</label>
                <Input className="h-8 bg-gray-50" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-gray-500 block mb-1">Invoice Number</label>
                <Input className="h-8 bg-gray-50" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-gray-500 block mb-1">Sales Invoice Date</label>
                <Input type="date" className="h-8" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Payment Terms</label>
                <div className="flex items-center border rounded overflow-hidden">
                  <input className="h-8 px-2 w-full outline-none text-sm" value={paymentTerms} onChange={e => setPaymentTerms(Number(e.target.value))} />
                  <span className="bg-gray-100 px-2 text-xs text-gray-500 h-8 flex items-center">days</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Due Date</label>
                <Input type="date" className="h-8" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div><label className="text-[10px] text-gray-400 uppercase">PT NAME:</label><Input className="h-7 bg-gray-50 text-xs" value={ptName} onChange={e => setPtName(e.target.value)} /></div>
              <div><label className="text-[10px] text-gray-400 uppercase">DOS:</label><Input className="h-7 bg-gray-50 text-xs" value={dos} onChange={e => setDos(e.target.value)} /></div>
              <div><label className="text-[10px] text-gray-400 uppercase">UMR:</label><Input className="h-7 bg-gray-50 text-xs" value={umr} onChange={e => setUmr(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* MIDDLE: ITEMS TABLE */}
        <div className="bg-white rounded-md shadow-sm border mb-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-600 font-semibold uppercase">
                  <th className="p-3 w-8">NO</th>
                  <th className="p-3 w-48">ITEMS / SERVICES</th>
                  <th className="p-3 w-20">HSN/SAC</th>
                  <th className="p-3 w-20">MFG</th>
                  <th className="p-3 w-20">BATCH NO.</th>
                  <th className="p-3 w-24">EXP. DATE</th>
                  <th className="p-3 w-20">MRP</th>
                  <th className="p-3 w-20">QTY</th>
                  <th className="p-3 w-24">PRICE/ITEM (₹)</th>
                  <th className="p-3 w-20">DISCOUNT</th>
                  <th className="p-3 w-20">TAX</th>
                  <th className="p-3 w-24 text-right">AMOUNT (₹)</th>
                  <th className="p-3 w-10 text-center"><Plus className="w-4 h-4 cursor-pointer hover:text-blue-600" onClick={() => setItemListOpen(true)}/></th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {invoiceItems.map((it, i) => {
                  const itemAmount = ((it.quantity * it.unit_price) - (it.discount_amount || 0));
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2 text-center text-gray-400">{i + 1}</td>
                      <td className="p-2"><div className="font-medium text-gray-800">{it.name}</div></td>
                      <td className="p-2 text-gray-500">{it.hsn || "-"}</td>
                      <td className="p-2"><Input className="h-7 text-xs px-1" value={it.mfg || ""} onChange={e => updateInvoiceItem(i, { mfg: e.target.value })} /></td>
                      <td className="p-2"><Input className="h-7 text-xs px-1" value={it.batch || ""} onChange={e => updateInvoiceItem(i, { batch: e.target.value })} /></td>
                      <td className="p-2"><Input type="date" className="h-7 text-xs px-1 w-full" value={it.exp_date || ""} onChange={e => updateInvoiceItem(i, { exp_date: e.target.value })} /></td>
                      <td className="p-2"><Input className="h-7 text-xs px-1 text-right" value={it.mrp} onChange={e => updateInvoiceItem(i, { mrp: Number(e.target.value) })} /></td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Input className="h-7 text-xs px-1 text-center w-14" value={it.quantity} onChange={e => updateInvoiceItem(i, { quantity: Number(e.target.value) })} />
                          <span className="text-[10px] text-gray-400">{it.unit}</span>
                        </div>
                      </td>
                      <td className="p-2"><Input className="h-7 text-xs px-1 text-right" value={it.unit_price} onChange={e => updateInvoiceItem(i, { unit_price: Number(e.target.value) })} /></td>
                      <td className="p-2"><Input className="h-7 text-xs px-1 text-center" placeholder="%" value={it.discount_percent} onChange={e => updateInvoiceItem(i, { discount_percent: Number(e.target.value) })} /></td>
                      <td className="p-2 text-center text-gray-500">{it.tax_percent}%</td>
                      <td className="p-2 text-right font-medium">₹{itemAmount.toFixed(2)}</td>
                      <td className="p-2 text-center"><Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500 cursor-pointer mx-auto" onClick={() => removeInvoiceItem(i)}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ADD ITEM ROW */}
          <div className="flex p-4 gap-4 bg-white">
            <div 
              className="flex-1 border-2 border-dashed border-blue-300 rounded h-10 flex items-center justify-center text-blue-500 font-medium cursor-pointer hover:bg-blue-50 transition"
              onClick={() => setItemListOpen(true)}
            >
              + Add Item
            </div>
            <Button variant="outline" className="h-10 border-gray-300 text-gray-700 gap-2">
              <ScanBarcode className="w-4 h-4" /> Scan Barcode
            </Button>
          </div>

          {/* SUBTOTAL STRIP */}
          <div className="bg-gray-50 px-4 py-2 flex justify-end gap-12 text-xs font-medium border-t text-gray-600">
            <div>SUBTOTAL</div>
            <div className="w-24 text-right">₹ {totals.subtotal.toFixed(2)}</div>
            <div className="w-24 text-right">₹ {totals.tax.toFixed(2)}</div>
            <div className="w-24 text-right">₹ {totals.total.toFixed(2)}</div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: NOTES */}
          <div className="col-span-6 space-y-4">
            <div>
              <div className="text-blue-500 text-xs cursor-pointer mb-2 font-medium">+ Add Notes</div>
              <div className="relative">
                <label className="text-xs text-gray-600 font-medium mb-1 block">Terms and Conditions</label>
                <textarea className="w-full border rounded p-2 text-xs bg-gray-50 h-20 outline-none resize-none" defaultValue="Goods once sold will not be taken back." />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div className="font-medium text-gray-700 mb-1">Bank Details</div>
              <div>Account Number: 50200021977447</div>
              <div>IFSC Code: HDFC0001034</div>
              <div>Bank & Branch Name: HDFC Bank, NARSARAOPETA ANDHRA PRADESH</div>
              <div>Account Holder's Name: GNR SURGICALS</div>
            </div>
          </div>

          {/* RIGHT: TOTALS */}
          <div className="col-span-6 bg-white pl-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-blue-500 cursor-pointer">
                <span>+ Add Discount</span> <span className="text-gray-800">- ₹ {totals.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-blue-500 cursor-pointer">
                <span>+ Add Additional Charges</span> <span className="text-gray-800">₹ 0</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600">Taxable Amount</span> <span>₹ {(totals.subtotal - totals.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                <span>Total Amount</span>
                <span>₹ {totals.total.toFixed(2)}</span>
              </div>

              {/* PAYMENT BOX */}
              <div className="bg-gray-50 p-3 rounded mt-4 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Amount Received</span>
                  <div className="flex">
                    <div className="flex items-center border rounded-l bg-white px-2 w-32">
                      <span className="text-gray-400 mr-1">₹</span>
                      <input className="w-full outline-none text-right font-medium" value={paymentReceived} onChange={e => setPaymentReceived(Number(e.target.value))} />
                    </div>
                    <div className="relative">
                      <select 
                        className="appearance-none border-y border-r rounded-r bg-white h-full pl-3 pr-8 outline-none text-gray-600 cursor-pointer"
                        value={paymentMode} onChange={e => setPaymentMode(e.target.value)}
                      >
                        <option>Cash</option><option>Online</option><option>Cheque</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ⭐ ADD ITEMS DIALOG (Item Selection) */}
        {/* ---------------------------------------------------- */}
        <Dialog open={itemListOpen} onOpenChange={setItemListOpen}>
          <DialogContent className="max-w-[1000px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Add Items</h2>
                <button onClick={() => setItemListOpen(false)}><X className="h-5 w-5 text-gray-500" /></button>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center border rounded px-3 py-2 bg-white">
                  <Search className="h-4 w-4 text-gray-400 mr-2" />
                  <input 
                    placeholder="Search Items" 
                    className="w-full outline-none text-sm"
                    value={itemListSearch}
                    onChange={(e) => setItemListSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">+ Create New Item</Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 border-b font-medium text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Item Code</th>
                    <th className="px-4 py-3">Sales Price</th>
                    <th className="px-4 py-3">Purchase Price</th>
                    <th className="px-4 py-3">MRP</th>
                    <th className="px-4 py-3">Current Stock</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {filteredItems.map((it) => (
                    <tr key={it._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{it.name}</td>
                      <td className="px-4 py-3 text-gray-500">{it.item_code || "-"}</td>
                      <td className="px-4 py-3">₹ {it.sales_price}</td>
                      <td className="px-4 py-3">{it.purchase_price ? `₹ ${it.purchase_price}` : "-"}</td>
                      <td className="px-4 py-3">{it.mrp ? `₹ ${it.mrp}` : "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{it.quantity || 0} {it.unit || "UNT"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          size="sm" 
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                          onClick={() => openStockDialog(it)}
                        >
                          + Add
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No items found</td></tr>}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t bg-white text-right">
              <Button onClick={() => setItemListOpen(false)}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ---------------------------------------------------- */}
        {/* ⭐ SIMPLE QUANTITY DIALOG (REPLACES GODOWN DIALOG) */}
        {/* ---------------------------------------------------- */}
        <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
          <DialogContent className="max-w-[500px] p-0 gap-0 overflow-hidden rounded-lg">
            
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <DialogTitle className="text-lg font-bold">Add Item Quantity</DialogTitle>
              <button onClick={() => setStockDialogOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>

            {/* Body */}
            <div className="p-6 bg-white flex flex-col items-center">
              <div className="w-full text-center">
                 <div className="text-sm text-gray-500 mb-1">Item Name</div>
                 <div className="text-2xl font-bold text-gray-800 mb-6">{selectedItemForStock?.name}</div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-4 mb-6">
                <button 
                   onClick={() => handleQtyChange(-1)}
                   className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                >
                  <Minus className="w-6 h-6" />
                </button>
                
                <div className="w-24 text-center">
                   <div className="text-4xl font-bold text-gray-800">{qtyToAdd}</div>
                   <div className="text-xs text-gray-500 mt-1">{selectedItemForStock?.unit || "PCS"}</div>
                </div>

                <button 
                   onClick={() => handleQtyChange(1)}
                   className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition shadow-md"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Stock Info */}
              <div className="text-sm bg-gray-50 px-4 py-2 rounded-full border border-gray-100 flex items-center gap-2">
                 <span className="text-gray-500">Available Stock:</span>
                 <span className="font-bold text-gray-800">
                    {selectedItemForStock?.quantity || 0} {selectedItemForStock?.unit}
                 </span>
              </div>

              {/* Warning if Exceeds */}
              {qtyToAdd > (selectedItemForStock?.quantity || 0) && (
                 <div className="mt-4 text-red-500 text-sm font-medium flex items-center animate-pulse">
                    ⚠️ Insufficient Stock (Will result in negative inventory)
                 </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" className="border-gray-300" onClick={() => setStockDialogOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 px-8 font-medium" onClick={onSaveStock}>Add to Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}