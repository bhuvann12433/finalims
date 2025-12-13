// src/pages/DeliveryChallan.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
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
import { Search } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function DeliveryChallan() {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  const [filterDays, setFilterDays] = useState("365");
  const [challanStatus, setChallanStatus] = useState("open");
  const [searchText, setSearchText] = useState("");

  const [challans, setChallans] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    loadChallans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [challans, searchText, filterDays, challanStatus]);

  async function loadChallans() {
    try {
      const res = await fetch(`${apiBase}/api/delivery-challans`);
      const data = await res.json();
      setChallans(data || []);
    } catch (err) {
      console.error("Error loading challans:", err);
      setChallans([]);
    }
  }

  function applyFilters() {
    let list = [...challans];

    // SEARCH FILTER
    if (searchText.trim()) {
      list = list.filter((c) =>
        (c.party_name || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (c.challan_number || "").toString().includes(searchText)
      );
    }

    // DAYS FILTER
    if (filterDays !== "all") {
      const cutoff = Date.now() - Number(filterDays) * 24 * 60 * 60 * 1000;
      list = list.filter((c) => new Date(c.challan_date).getTime() >= cutoff);
    }

    // STATUS FILTER
    if (challanStatus !== "all") {
      list = list.filter((c) => (c.status || "open") === challanStatus);
    }

    setFiltered(list);
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delivery Challan</h1>

        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => navigate("/sales/delivery-challan/create")}
        >
          Create Delivery Challan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search"
            className="pl-8 w-48"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* LAST DAYS FILTER */}
        <Select value={filterDays} onValueChange={setFilterDays}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Last 365 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="180">Last 180 Days</SelectItem>
            <SelectItem value="365">Last 365 Days</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        {/* STATUS FILTER */}
        <Select value={challanStatus} onValueChange={setChallanStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Show Open Challans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Show Open Challans</SelectItem>
            <SelectItem value="closed">Show Closed Challans</SelectItem>
            <SelectItem value="all">Show All Challans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Delivery Challan Number</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {/* EMPTY STATE */}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                      <div className="text-5xl mb-4">🧾</div>
                      <p>No Transactions Matching the current filter</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell>{new Date(c.challan_date).toLocaleDateString()}</TableCell>
                    <TableCell>{c.challan_number}</TableCell>
                    <TableCell>{c.party_name || "-"}</TableCell>
                    <TableCell>₹ {c.total_amount?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{c.status || "open"}</TableCell>
                  </TableRow>
                ))
              )}

            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
