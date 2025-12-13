// src/pages/CreateItem.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Barcode, Calendar } from "lucide-react";

export default function CreateItem() {
  const navigate = useNavigate();
  const { toast } = useToast ? useToast() : { toast: () => {} };
  const API = import.meta.env.VITE_API_BASE_URL;

  // saved => true after a successful save (used to enable Party Wise Prices)
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "stock" | "pricing" | "party" | "custom">("basic");

  const [formData, setFormData] = useState({
    // basic
    name: "",
    item_code: "",
    type: "product", // product | service
    category: "",
    show_online: false,
    measuring_unit: "PCS",
    alt_unit: "",
    // stock
    quantity: 0,
    opening_stock: "", // displayed text
    opening_godown: "",
    opening_date: new Date().toISOString().split("T")[0],
    enable_low_stock_warning: false,
    low_stock_threshold: 10,
    // pricing
    sales_price: 0,
    sales_price_with_tax: true,
    purchase_price: 0,
    purchase_price_with_tax: true,
    mrp: 0,
    wholesale_price: 0,
    gst_rate: "",
    hsn_code: "",
    // other
    description: "",
    enable_batching: false,
    custom_fields: [] as { key: string; value: string }[],
  });

  // some sample godowns (your app could load from API)
  const godowns = useMemo(() => ["Main Godown", "Warehouse A", "Branch Godown"], []);

  useEffect(() => {
    // if needed: load measuring units, categories etc from API/localStorage
  }, []);

  const handleChange = (field: string, value: any) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const addAlternateGodown = () => {
    // for UI: this will simply open a new empty entry in future.
    toast({ title: "Info", description: "Add stock to another godown option clicked (UI placeholder)." });
  };

  const addWholesaleRateField = () => {
    // keep simple: open a prompt to add a wholesale price tier (small helper)
    const label = prompt("Enter party/label for wholesale rate (optional):", "Wholesale");
    const price = prompt("Enter wholesale price:", "0");
    if (price == null) return;
    const p = Number(price || 0);
    if (isNaN(p)) return alert("Enter valid number");
    handleChange("wholesale_price", p);
    toast({ title: "Wholesale", description: `Wholesale price set: ${p}` });
  };

  const generateBarcode = () => {
    // just create a quick code (non-unique). In production link to library.
    const code = "ITM" + Math.random().toString(36).substring(2, 9).toUpperCase();
    handleChange("item_code", code);
    toast({ title: "Barcode", description: `Generated code: ${code}` });
  };

  const findHsn = () => {
    // opens a little helper (simple behavior here)
    window.open("https://www.cbic.gov.in/htdocs-cbec/gst/goods-and-services", "_blank");
  };

  const saveItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim()) {
      toast({ title: "Validation", description: "Please enter item name", variant: "destructive" });
      setActiveTab("basic");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        item_code: formData.item_code,
        type: formData.type === "service" ? "service" : "goods",
        category: formData.category,
        measuring_unit: formData.measuring_unit,
        quantity: Number(formData.quantity || 0),
        opening_stock: formData.opening_stock || "",
        opening_godown: formData.opening_godown || "",
        opening_date: formData.opening_date,
        enable_low_stock_warning: !!formData.enable_low_stock_warning,
        low_stock_threshold: Number(formData.low_stock_threshold || 10),
        sales_price: Number(formData.sales_price || 0),
        purchase_price: Number(formData.purchase_price || 0),
        mrp: Number(formData.mrp || 0),
        wholesale_price: Number(formData.wholesale_price || 0),
        gst_rate: formData.gst_rate,
        hsn_code: formData.hsn_code,
        description: formData.description,
        enable_batching: !!formData.enable_batching,
        custom_fields: formData.custom_fields,
      };

      const res = await fetch(`${API}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save item");

      toast({ title: "Success", description: "Item saved successfully" });

      // Mark saved so Party Wise Prices tab becomes active
      setSaved(true);

      // Optional: Navigate back to items list (or close modal)
      navigate("/items");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not save item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // custom fields helpers
  const addCustomField = () => {
    setFormData((p) => ({ ...p, custom_fields: [...p.custom_fields, { key: "", value: "" }] }));
  };
  const updateCustomField = (idx: number, key: string, value: string) => {
    setFormData((p) => {
      const arr = [...p.custom_fields];
      arr[idx] = { key, value };
      return { ...p, custom_fields: arr };
    });
  };
  const removeCustomField = (idx: number) => {
    setFormData((p) => {
      const arr = [...p.custom_fields];
      arr.splice(idx, 1);
      return { ...p, custom_fields: arr };
    });
  };

  // small helper for taxes options
  const gstOptions = ["None", "0", "0.25", "3", "5", "12", "18", "28"];

  // UI: left sidebar items (icon names are not actual icons - using label)
  const LeftNavItem = ({ label, value, disabled }: { label: string; value: typeof activeTab; disabled?: boolean }) => (
    <button
      className={`w-full text-left py-3 px-4 flex items-center gap-3 rounded-l-lg
        ${activeTab === value ? "bg-purple-50 text-purple-700 font-medium" : "hover:bg-gray-50"}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
    >
      {/* icon placeholder box */}
      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
        {/* small icon could go here */}
        📄
      </div>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/40">
      <div className="bg-white w-[95%] max-w-[1150px] rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/items")} className="p-2 rounded hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold">Create New Item</h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/items")} className="px-4 py-2 rounded border bg-white">Cancel</button>
            <Button onClick={saveItem} disabled={loading} className="px-6">
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Body: left sidebar + right content */}
        <div className="flex">
          {/* LEFT SIDEBAR */}
          <div className="w-64 border-r p-4">
            <div className="mb-4">
              <div className={`rounded px-3 py-3 ${activeTab === "basic" ? "bg-purple-50 text-purple-700" : ""}`}>
                <div className="font-medium">Basic Details <span className="text-red-500">*</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-500 font-medium mb-2">Advance Details</div>

              <div>
                <LeftNavItem label="Stock Details" value={"stock"} />
              </div>

              <div>
                <LeftNavItem label="Pricing Details" value={"pricing"} />
              </div>

              <div>
                <LeftNavItem label="Party Wise Prices" value={"party"} disabled={!saved} />
              </div>

              <div>
                <LeftNavItem label="Custom Fields" value={"custom"} />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 p-6">
            {/* TAB: BASIC */}
            {activeTab === "basic" && (
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-12 gap-4">
                      {/* Left column */}
                      <div className="col-span-6 space-y-4">
                        <div>
                          <Label>Item Type *</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <label className={`px-3 py-2 rounded border ${formData.type === "product" ? "bg-purple-50 border-purple-200" : ""}`}>
                              <input
                                type="radio"
                                name="type"
                                value="product"
                                checked={formData.type === "product"}
                                onChange={() => handleChange("type", "product")}
                                className="mr-2"
                              />
                              Product
                            </label>

                            <label className={`px-3 py-2 rounded border ${formData.type === "service" ? "bg-purple-50 border-purple-200" : ""}`}>
                              <input
                                type="radio"
                                name="type"
                                value="service"
                                checked={formData.type === "service"}
                                onChange={() => handleChange("type", "service")}
                                className="mr-2"
                              />
                              Service
                            </label>
                          </div>
                        </div>

                        <div>
                          <Label>Item Name *</Label>
                          <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="ex: Maggie 20gm" />
                        </div>

                        <div>
                          <Label>Sales Price</Label>
                          <div className="flex gap-2 mt-2">
                            <div className="flex items-center border rounded w-full">
                              <div className="px-3">₹</div>
                              <Input
                                className="rounded-none border-0"
                                type="number"
                                value={formData.sales_price}
                                onChange={(e) => handleChange("sales_price", Number(e.target.value))}
                              />
                            </div>

                            <div>
                              <Select value={formData.sales_price_with_tax ? "with" : "without"} onValueChange={(v) => handleChange("sales_price_with_tax", v === "with")}>
                                <SelectTrigger className="h-10 w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="with">With Tax</SelectItem>
                                  <SelectItem value="without">Without Tax</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Measuring Unit</Label>
                          <Select value={formData.measuring_unit} onValueChange={(v) => handleChange("measuring_unit", v)}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PCS">Pieces(PCS)</SelectItem>
                              <SelectItem value="KG">Kg</SelectItem>
                              <SelectItem value="MTR">Meter</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="mt-2 text-sm text-blue-600 cursor-pointer" onClick={() => handleChange("alt_unit", "ALT")}>
                            + Alternative Unit
                          </div>
                        </div>

                        <div>
                          <Label>Category</Label>
                          <Input value={formData.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="Select Category" />
                        </div>
                      </div>

                      {/* Right column */}
                      <div className="col-span-6 space-y-4">
                        <div>
                          <Label>Item Code</Label>
                          <div className="flex gap-3">
                            <Input value={formData.item_code} onChange={(e) => handleChange("item_code", e.target.value)} placeholder="ex: ITM12549" />
                            <Button onClick={generateBarcode} variant="outline"><Barcode className="w-4 h-4 mr-2" />Generate Barcode</Button>
                          </div>
                        </div>

                        <div>
                          <Label>HSN code</Label>
                          <div className="flex items-center gap-3">
                            <Input value={formData.hsn_code} onChange={(e) => handleChange("hsn_code", e.target.value)} placeholder="ex: 4010" />
                            <button className="text-sm text-blue-600" onClick={findHsn}>Find HSN Code</button>
                          </div>
                        </div>

                        <div>
                          <Label>Show Item in Online Store</Label>
                          <div className="mt-2"><Switch checked={formData.show_online} onCheckedChange={(v) => handleChange("show_online", v)} /></div>
                        </div>

                        <div>
                          <Label>Opening Stock (simple)</Label>
                          <div className="flex gap-2 items-center mt-2">
                            <Input type="number" value={formData.quantity} onChange={(e) => handleChange("quantity", Number(e.target.value))} />
                            <div className="px-3 py-2 bg-gray-100 rounded">{formData.measuring_unit}</div>
                          </div>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB: STOCK DETAILS */}
            {activeTab === "stock" && (
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Details</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Godowns</Label>
                            <Select value={formData.opening_godown} onValueChange={(v) => handleChange("opening_godown", v)}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select Godown" />
                              </SelectTrigger>
                              <SelectContent>
                                {godowns.map((g, i) => <SelectItem key={i} value={g}>{g}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Opening Stock</Label>
                            <div className="flex items-center gap-2 mt-2">
                              <Input type="number" value={formData.opening_stock} onChange={(e) => handleChange("opening_stock", e.target.value)} placeholder="ex: 150" />
                              <div className="px-3 py-2 bg-gray-100 rounded">{formData.measuring_unit}</div>
                            </div>
                          </div>

                          <div>
                            <Label>As of Date</Label>
                            <div className="relative mt-2">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input type="date" value={formData.opening_date} onChange={(e) => handleChange("opening_date", e.target.value)} className="pl-10 h-10 border rounded w-full" />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded">
                          <div className="text-blue-600 cursor-pointer" onClick={addAlternateGodown}>+ Add Stock to Another Godown</div>
                          <div className="mt-3 text-blue-600 cursor-pointer" onClick={() => handleChange("enable_low_stock_warning", !formData.enable_low_stock_warning)}>
                            + Enable Low stock quantity warning
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB: PRICING */}
            {activeTab === "pricing" && (
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Details</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6 space-y-4">
                        <div>
                          <Label>Sales Price</Label>
                          <div className="flex gap-2 mt-2">
                            <div className="flex items-center border rounded w-full">
                              <div className="px-3">₹</div>
                              <Input type="number" value={formData.sales_price} onChange={(e) => handleChange("sales_price", Number(e.target.value))} className="rounded-none border-0" />
                            </div>
                            <Select value={formData.sales_price_with_tax ? "with" : "without"} onValueChange={(v) => handleChange("sales_price_with_tax", v === "with")}>
                              <SelectTrigger className="h-10 w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="with">With Tax</SelectItem>
                                <SelectItem value="without">Without Tax</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Maximum Retail Price (MRP)</Label>
                          <Input type="number" value={formData.mrp} onChange={(e) => handleChange("mrp", Number(e.target.value))} />
                        </div>

                        <div>
                          <div className="text-blue-600 cursor-pointer" onClick={addWholesaleRateField}>+ Wholesale Rate</div>
                        </div>
                      </div>

                      <div className="col-span-6 space-y-4">
                        <div>
                          <Label>Purchase Price</Label>
                          <div className="flex gap-2 mt-2">
                            <div className="flex items-center border rounded w-full">
                              <div className="px-3">₹</div>
                              <Input type="number" value={formData.purchase_price} onChange={(e) => handleChange("purchase_price", Number(e.target.value))} className="rounded-none border-0" />
                            </div>
                            <Select value={formData.purchase_price_with_tax ? "with" : "without"} onValueChange={(v) => handleChange("purchase_price_with_tax", v === "with")}>
                              <SelectTrigger className="h-10 w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="with">With Tax</SelectItem>
                                <SelectItem value="without">Without Tax</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>GST Tax Rate(%)</Label>
                          <Select value={formData.gst_rate || "None"} onValueChange={(v) => handleChange("gst_rate", v)}>
                            <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {gstOptions.map((g) => <SelectItem key={g} value={g}>{g === "None" ? "None" : g + "%"}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB: PARTY WISE PRICES (disabled until saved) */}
            {activeTab === "party" && (
              <div>
                {saved ? (
                  <Card>
                    <CardHeader><CardTitle>Party Wise Prices</CardTitle></CardHeader>
                    <CardContent>
                      {/* Implement party wise prices UI here */}
                      <p className="text-sm text-gray-600">Configure prices per party (coming soon).</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="rounded bg-gray-50 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div style={{ width: 140, height: 100, margin: "0 auto" }} className="mb-4 bg-white rounded flex items-center justify-center">📄</div>
                      <p className="text-gray-700">To enable Party Wise Prices and set custom prices for parties, please save the item first</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CUSTOM FIELDS */}
            {activeTab === "custom" && (
              <div>
                <Card>
                  <CardHeader><CardTitle>Custom Fields</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.custom_fields.map((f, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input placeholder="Field name" value={f.key} onChange={(e) => updateCustomField(idx, e.target.value, f.value)} />
                          <Input placeholder="Value" value={f.value} onChange={(e) => updateCustomField(idx, f.key, e.target.value)} />
                          <button className="px-3 py-2 border rounded" onClick={() => removeCustomField(idx)}>Remove</button>
                        </div>
                      ))}

                      <div className="text-blue-600 cursor-pointer" onClick={addCustomField}>+ Add Item Custom Fields</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
