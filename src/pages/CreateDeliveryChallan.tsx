// src/pages/CreateDeliveryChallan.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { ArrowLeft, Plus, Trash2, Search, UploadCloud } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";

type Party = { _id: string; name: string; address?: string; mobile?: string; gstin?: string };
type Item = { _id: string; name: string; description?: string; hsn?: string; sales_price?: number; gst_rate?: number; stock_source?: "inventory" | "godown" };
type ChallanItem = { item_id: string; name: string; hsn?: string; quantity: number; unit_price: number; discount_percent: number; tax_percent: number };

export default function CreateDeliveryChallan() {
  const navigate = useNavigate();
  const { toast } = useToast?.() || { toast: (x:any)=>{} }; // fallback if hook signature differs

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  // data
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // meta
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [challanNo, setChallanNo] = useState<string>("1");
  const [challanDate, setChallanDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState<string>(format(addDays(new Date(), 0), "yyyy-MM-dd"));

  // items
  const [challanItems, setChallanItems] = useState<ChallanItem[]>([]);

  // optional features
  const [applyTax, setApplyTax] = useState<boolean>(true);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [extraDiscount, setExtraDiscount] = useState<number>(0);

  // notes/signature
  const [notes, setNotes] = useState<string>("");
  const [terms, setTerms] = useState<string>("1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  // saving
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchParties(), fetchItems(), generateChallanNumber()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function safeFetchJson(url: string, opts?: RequestInit) {
    const r = await fetch(url, opts);
    const json = await r.json().catch(() => null);
    if (!r.ok) throw json || new Error("Request failed");
    return json;
  }

  async function fetchParties() {
    try {
      const data = await safeFetchJson(`${apiBase}/api/parties`);
      setParties(data || []);
    } catch (err) {
      console.warn("fetchParties", err);
    }
  }

  async function fetchItems() {
    try {
      const data = await safeFetchJson(`${apiBase}/api/items`);
      const normalized: Item[] = (data || []).map((it: any) => ({
        _id: it._id || it.id,
        name: it.name || it.item_name,
        description: it.description || "",
        hsn: it.hsn || "",
        sales_price: it.sales_price != null ? Number(it.sales_price) : 0,
        gst_rate: it.gst_rate != null ? Number(it.gst_rate) : 0,
        stock_source: it.stock_source || "inventory",
      }));
      setItems(normalized);
    } catch (err) {
      console.warn("fetchItems", err);
    }
  }

  async function generateChallanNumber() {
    try {
      const data = await safeFetchJson(`${apiBase}/api/delivery-challans`);
      const next = (data?.length || 0) + 1;
      setChallanNo(String(next));
    } catch {
      // fallback leave as 1
    }
  }

  // add item
  const addItemToChallan = (it: Item) => {
    setChallanItems((prev) => [
      ...prev,
      {
        item_id: it._id,
        name: it.name,
        hsn: it.hsn || "",
        quantity: 1,
        unit_price: Number(it.sales_price || 0),
        discount_percent: 0,
        tax_percent: Number(it.gst_rate || 0),
      },
    ]);
  };

  const removeItem = (index: number) => setChallanItems((prev) => prev.filter((_, i) => i !== index));
  const updateItem = (index: number, patch: Partial<ChallanItem>) => setChallanItems((prev) => {
    const copy = [...prev];
    copy[index] = { ...copy[index], ...patch };
    return copy;
  });

  const lineCalc = (it: ChallanItem) => {
    const qty = Number(it.quantity || 0);
    const price = Number(it.unit_price || 0);
    const subtotal = qty * price;
    const discount = (subtotal * Number(it.discount_percent || 0)) / 100;
    const afterDiscount = subtotal - discount;
    const tax = applyTax ? ((afterDiscount * Number(it.tax_percent || 0)) / 100) : 0;
    const total = afterDiscount + tax;
    return { subtotal, discount, tax, total };
  };

  const totals = useMemo(() => {
    const subtotal = challanItems.reduce((s, it) => s + (it.quantity * it.unit_price), 0);
    const discount = challanItems.reduce((s, it) => s + ((it.quantity * it.unit_price * it.discount_percent) / 100), 0);
    const taxable = subtotal - discount + Number(additionalCharges || 0) - Number(extraDiscount || 0);
    const tax = applyTax ? challanItems.reduce((s, it) => {
      const ln = lineCalc(it);
      return s + ln.tax;
    }, 0) : 0;
    const total = Math.max(0, subtotal - discount + tax + Number(additionalCharges || 0) - Number(extraDiscount || 0));
    return { subtotal, discount, taxable, tax, total };
  }, [challanItems, applyTax, additionalCharges, extraDiscount]);

  // Save to backend
  const saveChallan = async (clearAfter = false) => {
    if (!selectedParty) {
      toast({ title: "Select party", description: "Please select a party before saving.", variant: "destructive" });
      return null;
    }
    if (challanItems.length === 0) {
      toast({ title: "Add items", description: "Please add at least one item to challan.", variant: "destructive" });
      return null;
    }

    setSaving(true);
    try {
      const payload = {
        challan_number: challanNo,
        challan_date: challanDate,
        party_id: selectedParty,
        items: challanItems,
        subtotal: totals.subtotal,
        discount_amount: totals.discount,
        tax_amount: totals.tax,
        additional_charges: Number(additionalCharges || 0),
        extra_discount: Number(extraDiscount || 0),
        total_amount: totals.total,
        notes,
        terms,
        apply_tax: applyTax,
        created_at: new Date().toISOString(),
      };

      const res = await fetch(`${apiBase}/api/delivery-challans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: result?.error || "Failed to save challan", variant: "destructive" });
        return null;
      }

      // upload signature if present
      if (signatureFile && (result?.id || result?._id)) {
        try {
          const form = new FormData();
          form.append("signature", signatureFile);
          await fetch(`${apiBase}/api/delivery-challans/${result.id || result._id}/signature`, {
            method: "POST",
            body: form,
          });
        } catch (err) {
          console.warn("signature upload failed", err);
        }
      }

      setSavedId(result.id || result._id || null);
      toast({ title: "Saved", description: "Delivery Challan saved." });

      if (clearAfter) {
        // reset form for Save & New
        setSelectedParty(null);
        setChallanItems([]);
        setNotes("");
        setSignatureFile(null);
        await generateChallanNumber();
      } else {
        // navigate to listing or view page if needed
        // navigate(`/sales/delivery-challan/view/${result.id || result._id}`);
      }

      return result;
    } catch (err: any) {
      console.error("saveChallan", err);
      toast({ title: "Error", description: err?.message || "Failed to save challan", variant: "destructive" });
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Print preview
  const openPrint = (data: any) => {
    const party = parties.find((p) => p._id === (data.party_id || selectedParty)) || null;
    const rows = data.items || challanItems;
    const subtotal = Number(data.subtotal || totals.subtotal || 0);
    const tax = Number(data.tax_amount || totals.tax || 0);
    const total = Number(data.total_amount || totals.total || 0);

    const html = `
      <html>
        <head>
          <title>Delivery Challan ${data.challan_number || challanNo}</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111}
            .header{display:flex;justify-content:space-between;align-items:flex-start}
            table{width:100%;border-collapse:collapse;margin-top:12px}
            th,td{border:1px solid #ddd;padding:8px;font-size:13px}
            th{background:#f3f6fb}
            .totals{margin-top:12px;width:100%}
            .signature{margin-top:40px;text-align:center}
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>GNR SURGICALS</h2>
              <div>${party ? party.name : ""}</div>
              <div>${party ? party.address || "" : ""}</div>
            </div>
            <div style="text-align:right">
              <div><strong>Challan No:</strong> ${data.challan_number || challanNo}</div>
              <div><strong>Date:</strong> ${format(new Date(data.challan_date || challanDate), "dd/MM/yyyy")}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr><th>S.NO</th><th>ITEM</th><th>HSN</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr>
            </thead>
            <tbody>
              ${rows.map((r:any, i:number) => {
                const qty = r.quantity || 0;
                const rate = Number(r.unit_price || 0);
                const amount = (qty * rate).toFixed(2);
                return `<tr>
                  <td>${i+1}</td><td>${r.name || ""}</td><td>${r.hsn || ""}</td>
                  <td>${qty}</td><td style="text-align:right">${Number(rate).toFixed(2)}</td>
                  <td style="text-align:right">${Number(amount).toFixed(2)}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr><td style="width:70%"></td><td>SUBTOTAL</td><td style="text-align:right">₹ ${subtotal.toFixed(2)}</td></tr>
              <tr><td></td><td>TAX</td><td style="text-align:right">₹ ${tax.toFixed(2)}</td></tr>
              <tr style="font-weight:800;background:#f3f6fb"><td></td><td>TOTAL</td><td style="text-align:right">₹ ${total.toFixed(2)}</td></tr>
            </table>
          </div>

          <div class="signature">
            <div style="height:80px;width:240px;border:1px dashed #ccc;display:inline-block"></div>
            <div style="margin-top:8px;font-size:12px">Authorized Signature</div>
          </div>
        </body>
      </html>
    `;
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // helper: save then print
  const handlePrint = async () => {
    const saved = savedId ? { id: savedId } : await saveChallan();
    if (!saved) return;
    // fetch saved if minimal
    let data = saved;
    if (!saved.items && saved.id) {
      try {
        data = await safeFetchJson(`${apiBase}/api/delivery-challans/${saved.id}`);
      } catch {}
    }
    openPrint(data);
  };

  // scan barcode stub
  const handleScanBarcode = () => {
    toast({ title: "Scan", description: "Barcode scanning not implemented. Connect scanner callback." });
  };

  const selectedPartyObj = parties.find((p) => p._id === selectedParty) || null;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Create Delivery Challan</h1>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={() => handlePrint()}>Print</Button>
          <Button variant="outline" onClick={async () => { const s = await saveChallan(true); if (s) toast?.({ title: "Saved & New" }); }}>Save & New</Button>
          <Button onClick={async () => { const s = await saveChallan(false); if (s) navigate("/sales/delivery-challan"); }}>Save</Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            {/* left billing */}
            <div className="col-span-8">
              <Label>Bill To</Label>

              <div className="mt-2 flex items-start gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">{selectedPartyObj ? selectedPartyObj.name : "+ Add Party"}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-2">
                    <Command>
                      <CommandInput placeholder="Search parties..." />
                      <CommandList className="max-h-60 overflow-auto">
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup>
                          {parties.map((p) => (
                            <CommandItem key={p._id} onSelect={() => setSelectedParty(p._id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{p.name}</span>
                                <small className="text-muted-foreground">{p.mobile || ""}</small>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div>
                  <div className="text-sm text-muted-foreground">{selectedPartyObj?.address}</div>
                </div>
              </div>
            </div>

            {/* right meta */}
            <div className="col-span-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Challan No:</Label>
                  <Input value={challanNo} onChange={(e) => setChallanNo(e.target.value)} />
                </div>
                <div>
                  <Label>Challan Date:</Label>
                  <Input type="date" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* items table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Items / Services</CardTitle>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Select Item</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search items..." />
                  </div>

                  <div className="max-h-72 overflow-auto space-y-2">
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No items available</div>
                    ) : (
                      items.map((it) => (
                        <div key={it._id} className="flex items-center justify-between border rounded p-2">
                          <div>
                            <div className="font-medium">{it.name}</div>
                            <div className="text-sm text-muted-foreground">{it.description}</div>
                          </div>
                          <Button onClick={() => addItemToChallan(it)}>Add</Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" onClick={handleScanBarcode}>Scan Barcode</Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Items / Services</TableHead>
                  <TableHead>HSN / SAC</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price/Item (₹)</TableHead>
                  <TableHead>Discount %</TableHead>
                  <TableHead>Tax %</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {challanItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No items added — click Add Item to add goods.
                    </TableCell>
                  </TableRow>
                ) : challanItems.map((it, idx) => {
                  const ln = lineCalc(it);
                  return (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm text-muted-foreground">{it.hsn}</div>
                      </TableCell>
                      <TableCell>{it.hsn}</TableCell>
                      <TableCell>
                        <Input type="number" value={it.quantity} className="w-20" onChange={(e) => updateItem(idx, { quantity: Number(e.target.value || 0) })} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={it.unit_price} className="w-28" onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value || 0) })} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={it.discount_percent} className="w-20" onChange={(e) => updateItem(idx, { discount_percent: Number(e.target.value || 0) })} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={it.tax_percent} className="w-20" onChange={(e) => updateItem(idx, { tax_percent: Number(e.target.value || 0) })} />
                      </TableCell>
                      <TableCell>₹{ln.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* totals / right summary area */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <Card>
            <CardContent>
              <div className="space-y-3">
                <Button variant="link" className="text-blue-600">+ Add Notes</Button>
                <div>
                  <Label>Terms and Conditions</Label>
                  <div className="mt-2 p-3 bg-slate-50 rounded text-sm text-muted-foreground">{terms}</div>
                </div>

                <div>
                  <Button variant="link" className="text-blue-600">+ Add New Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-5">
          <Card>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>- ₹{totals.discount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={applyTax} onChange={(e) => setApplyTax(e.target.checked)} />
                      <span className="text-sm">Apply GST</span>
                    </label>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tax</span>
                    <div className="font-semibold">₹{totals.tax.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <Button variant="link" className="text-blue-600" onClick={() => setAdditionalCharges((c) => Number(c) + 0)}>+ Add Additional Charges</Button>
                    <div className="mt-2">
                      <Input type="number" value={additionalCharges} onChange={(e) => setAdditionalCharges(Number(e.target.value || 0))} />
                    </div>
                  </div>

                  <div>
                    <span>Taxable Amount</span>
                    <div className="font-semibold">₹{totals.taxable.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <Button variant="link" className="text-blue-600" onClick={() => setExtraDiscount((d) => Number(d) + 0)}>+ Add Discount</Button>
                    <div className="mt-2">
                      <Input type="number" value={extraDiscount} onChange={(e) => setExtraDiscount(Number(e.target.value || 0))} />
                    </div>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <div className="font-bold text-lg">₹{totals.total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <Label>Authorized Signature</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="flex items-center gap-2 border rounded p-3 cursor-pointer">
                      <UploadCloud className="h-5 w-5 text-muted-foreground" />
                      <span>Upload signature</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
                    </label>
                    <div className="text-sm">
                      {signatureFile ? signatureFile.name : "No signature uploaded"}
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
