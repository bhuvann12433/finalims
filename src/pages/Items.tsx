// src/pages/Items.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import {
  Plus,
  Search,
  Settings,
  BarChart2,
  Keyboard,
  ChevronDown,
  Box
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import AdjustStockModal from "@/components/AdjustStockModal";

export default function Items() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showLowStock, setShowLowStock] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const openAdjustStock = (item: any) => {
    setSelectedItem(item);
    setAdjustModalOpen(true);
  };

  const saveAdjustedStock = async (newQty: number) => {
    await fetch(`${API}/api/items/${selectedItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });

    loadItems();
  };

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await fetch(`${API}/api/items`);
      const data = await res.json();

      const normalized = (data || []).map((it: any) => ({
        id: it._id || it.id,
        ...it,
        name: it.name || "",
        item_code: it.item_code || "-",
        category: it.category || "",
        quantity: Number(it.quantity || 0),
        low_stock_threshold: Number(it.low_stock_threshold || 0),
        sales_price: Number(it.sales_price || 0),
        purchase_price: Number(it.purchase_price || 0),
        mrp: Number(it.mrp || 0),
        wholesale_price: Number(it.wholesale_price || 0),
      }));

      setItems(normalized);

      const sel: Record<string, boolean> = {};
      normalized.forEach((it: any) => (sel[it.id] = false));
      setSelected(sel);

    } catch (err) {
      console.error(err);
    }
  };

  const categories = useMemo(() => {
    const c = new Set<string>();
    items.forEach((it) => it.category && c.add(it.category));
    return ["All", ...Array.from(c)];
  }, [items]);

  const stockValue = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity * it.sales_price, 0),
    [items]
  );

  const lowStockCount = useMemo(
    () => items.filter((it) => it.quantity < it.low_stock_threshold).length,
    [items]
  );

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return items.filter((it) => {
      if (categoryFilter !== "All" && it.category !== categoryFilter) return false;
      if (showLowStock && !(it.quantity < it.low_stock_threshold)) return false;

      return (
        it.name?.toLowerCase().includes(term) ||
        it.item_code?.toLowerCase().includes(term)
      );
    });
  }, [items, searchTerm, categoryFilter, showLowStock]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const toggleSelectAll = (checked: boolean) => {
    const newSel: Record<string, boolean> = {};
    filteredItems.forEach((it) => (newSel[it.id] = checked));
    setSelected((prev) => ({ ...prev, ...newSel }));
  };

  const toggleSelectOne = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-semibold">Items</h1>

        <div className="flex items-center gap-3">

          {/* ✔ REPORTS DROPDOWN EXACT LIKE MYBILLBOOK */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Reports <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">

              <DropdownMenuItem>Rate List</DropdownMenuItem>
              <DropdownMenuItem>Stock Summary</DropdownMenuItem>
              <DropdownMenuItem>Low Stock Summary</DropdownMenuItem>
              <DropdownMenuItem>Item Sales Summary</DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline">
            <Settings className="w-4 h-4" />
          </Button>

          <Button variant="outline">
            <Keyboard className="w-4 h-4" />
          </Button>

        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border bg-white p-4">
          <p className="text-sm">Stock Value</p>
          <p className="text-2xl font-bold mt-1">{fmt(stockValue)}</p>
        </Card>

        <Card className="border bg-white p-4">
          <p className="text-sm text-orange-600">Low Stock</p>
          <p className="text-2xl font-bold mt-1">{lowStockCount}</p>
        </Card>

        <div></div>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-3 mt-3">

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search Item"
            className="pl-10 h-[38px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
          <SelectTrigger className="w-40 h-[38px]">
            <SelectValue placeholder="Select Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showLowStock ? "default" : "outline"}
          className="h-[38px]"
          onClick={() => setShowLowStock((v) => !v)}
        >
          Show Low Stock
        </Button>

        <div className="flex-1" />

        {/* CREATE ITEM BUTTON */}
        <Button
          onClick={() => navigate("/items/create")}
          className="bg-[#5b3df5] text-white h-[38px]"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Item
        </Button>
      </div>

      {/* TABLE */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 48 }}>
                <input type="checkbox" onChange={(e) => toggleSelectAll(e.target.checked)} />
              </TableHead>

              <TableHead>Item Name</TableHead>
              <TableHead>Item Code</TableHead>
              <TableHead className="text-right">Stock QTY</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Purchase Price</TableHead>
              <TableHead className="text-right">MRP</TableHead>
              <TableHead className="text-right">Wholesale Price</TableHead>

              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredItems.map((it) => (
              <TableRow key={it.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={!!selected[it.id]}
                    onChange={() => toggleSelectOne(it.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{it.name}</span>
                    {it.category && (
                      <Badge className="mt-1 w-fit bg-gray-100 text-gray-700">
                        {it.category}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell>{it.item_code}</TableCell>
                <TableCell className="text-right">{it.quantity} PCS</TableCell>
                <TableCell className="text-right">{fmt(it.sales_price)}</TableCell>
                <TableCell className="text-right">{fmt(it.purchase_price)}</TableCell>
                <TableCell className="text-right">{fmt(it.mrp)}</TableCell>
                <TableCell className="text-right">{fmt(it.wholesale_price)}</TableCell>

                <TableCell className="text-center">
                  <Box
                    className="w-5 h-5 opacity-70 cursor-pointer hover:text-blue-600"
                    onClick={() => openAdjustStock(it)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ADJUST STOCK MODAL */}
      <AdjustStockModal
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        item={selectedItem}
        onSave={saveAdjustedStock}
      />
    </div>
  );
}
