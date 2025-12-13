import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const [formData, setFormData] = useState<any>({
    name: "",
    item_code: "",
    type: "goods",
    category: "",
    measuring_unit: "PCS",
    sales_price: "0",
    purchase_price: "0",
    mrp: "0",
    wholesale_price: "0",
    gst_rate: "0",
    hsn_code: "",
    enable_batching: false,
    low_stock_threshold: "10",
    description: "",

    // ⭐ Add missing quantity
    quantity: "0",
  });

  // LOAD ITEM ----------------------------------------
  useEffect(() => {
    loadItem();
  }, []);

  const loadItem = async () => {
    try {
      const API = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API}/api/items/${id}`);

      if (!res.ok) throw new Error("Failed to load item");
      const item = await res.json();

      setFormData({
        name: item.name || "",
        item_code: item.item_code || "",
        type: item.type || "goods",
        category: item.category || "",
        measuring_unit: item.measuring_unit || "PCS",
        sales_price: String(item.sales_price || 0),
        purchase_price: String(item.purchase_price || 0),
        mrp: String(item.mrp || 0),
        wholesale_price: String(item.wholesale_price || 0),
        gst_rate: String(item.gst_rate || 0),
        hsn_code: item.hsn_code || "",
        enable_batching: item.enable_batching || false,
        low_stock_threshold: String(item.low_stock_threshold || 10),
        description: item.description || "",

        // ⭐ Load quantity from backend
        quantity: String(item.quantity ?? 0),
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }

    setLoadingPage(false);
  };

  // HANDLE CHANGE -------------------------------------
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // UPDATE ITEM ---------------------------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      sales_price: Number(formData.sales_price),
      purchase_price: Number(formData.purchase_price),
      mrp: Number(formData.mrp),
      wholesale_price: Number(formData.wholesale_price),
      gst_rate: Number(formData.gst_rate),
      low_stock_threshold: Number(formData.low_stock_threshold),

      // ⭐ Convert quantity properly
      quantity: Number(formData.quantity) || 0,
    };

    try {
      const API = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${API}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      toast({
        title: "Success",
        description: "Item updated successfully",
      });

      navigate("/items");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Update failed",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // LOADING STATE -------------------------------------
  if (loadingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading item...</p>
      </div>
    );
  }

  // UI RENDER -----------------------------------------
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/items")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Item</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* BASIC DETAILS */}
          <TabsContent value="basic">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input value={formData.name} required
                      onChange={(e) => handleChange("name", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Item Code</Label>
                    <Input value={formData.item_code}
                      onChange={(e) => handleChange("item_code", e.target.value)} />
                  </div>

                  {/* ⭐ QUANTITY FIELD ADDED */}
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleChange("quantity", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Measuring Unit</Label>
                    <Input value={formData.measuring_unit}
                      onChange={(e) => handleChange("measuring_unit", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>HSN Code</Label>
                    <Input value={formData.hsn_code}
                      onChange={(e) => handleChange("hsn_code", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)} />
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* PRICING */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader><CardTitle>Pricing Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="space-y-2">
                    <Label>Sales Price</Label>
                    <Input type="number" value={formData.sales_price}
                      onChange={(e) => handleChange("sales_price", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Purchase Price</Label>
                    <Input type="number" value={formData.purchase_price}
                      onChange={(e) => handleChange("purchase_price", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>MRP</Label>
                    <Input type="number" value={formData.mrp}
                      onChange={(e) => handleChange("mrp", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Wholesale Price</Label>
                    <Input type="number" value={formData.wholesale_price}
                      onChange={(e) => handleChange("wholesale_price", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>GST Rate (%)</Label>
                    <Input type="number" value={formData.gst_rate}
                      onChange={(e) => handleChange("gst_rate", e.target.value)} />
                  </div>

                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* ADVANCED */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader><CardTitle>Advanced Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Batching</Label>
                    <p className="text-sm text-muted-foreground">
                      Track items by batch numbers
                    </p>
                  </div>

                  <Switch checked={formData.enable_batching}
                    onCheckedChange={(v) => handleChange("enable_batching", v)} />
                </div>

                <div className="space-y-2">
                  <Label>Low Stock Threshold</Label>
                  <Input type="number" value={formData.low_stock_threshold}
                    onChange={(e) => handleChange("low_stock_threshold", e.target.value)} />
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/items")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Item"}
          </Button>
        </div>

      </form>
    </div>
  );
}
