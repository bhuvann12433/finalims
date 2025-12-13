import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Search,
  MoreVertical,
  Pencil,
  Trash,
  ChevronDown,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Parties() {
  const [parties, setParties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/parties");
      const data = await res.json();
      setParties(data || []);
    } catch (err) {
      console.error("Failed to fetch parties:", err);
      setParties([]);
    }
  };

  const deleteParty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this party?")) return;

    try {
      await fetch(`http://localhost:5000/api/parties/${id}`, {
        method: "DELETE",
      });

      setParties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const filteredParties = parties.filter(
    (party) =>
      party.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.mobile?.includes(searchTerm) ||
      party.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* ================================ */}
      {/* PAGE HEADER + RIGHT SIDE BUTTONS */}
      {/* ================================ */}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Parties</h1>

        <div className="flex items-center gap-3">

          {/* SHARED LEDGER PORTAL */}
          <Button
            variant="outline"
            className="border text-[#5B5BE0] rounded-md"
            style={{
              borderColor: "#C9CDF6",
              padding: "6px 14px",
              fontWeight: 500,
            }}
          >
            🔗 SharedLedger Portal
          </Button>

          {/* REPORTS DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border flex items-center gap-2 rounded-md"
                style={{
                  borderColor: "#C9C9C9",
                  padding: "6px 14px",
                }}
              >
                📊 Reports <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem>Partywise Outstanding</DropdownMenuItem>
              <DropdownMenuItem>Item Report By Party</DropdownMenuItem>
              <DropdownMenuItem>Receivable Ageing Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* SETTINGS */}
          <Button
            variant="outline"
            className="border rounded-md"
            style={{ borderColor: "#D4D4D4", padding: "6px 10px" }}
          >
            ⚙️
          </Button>

          {/* VIEW ICON */}
          <Button
            variant="outline"
            className="border rounded-md"
            style={{ borderColor: "#D4D4D4", padding: "6px 10px" }}
          >
            📄
          </Button>
        </div>
      </div>

      {/* ================================ */}
      {/* SUMMARY CARDS */}
      {/* ================================ */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* ALL PARTIES */}
        <div
          className="rounded-lg border shadow-sm p-5"
          style={{ borderColor: "#CFCFF7", background: "#F7F5FF" }}
        >
          <p className="text-[#4452A3] text-sm font-medium flex items-center gap-1">
            👥 All Parties
          </p>
          <p className="text-3xl font-bold mt-3">{parties.length}</p>
        </div>

        {/* TO COLLECT */}
        <div
          className="rounded-lg border shadow-sm p-5"
          style={{ background: "#F0F9F4", borderColor: "#D8EBDD" }}
        >
          <p className="text-green-700 text-sm font-medium">To Collect</p>
          <p className="text-3xl font-bold mt-3">₹0</p>
        </div>

        {/* TO PAY */}
        <div
          className="rounded-lg border shadow-sm p-5"
          style={{ background: "#FDF3F4", borderColor: "#F1D6D8" }}
        >
          <p className="text-red-700 text-sm font-medium">To Pay</p>
          <p className="text-3xl font-bold mt-3">₹0</p>
        </div>
      </div>

      {/* ================================ */}
      {/* SEARCH + CATEGORY + BUTTONS */}
      {/* ================================ */}

      <div className="flex flex-wrap justify-between items-center gap-4">

        <div className="flex gap-4 flex-1">

          {/* SEARCH */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Party Name / Mobile"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* CATEGORY DROPDOWN */}
          <select
            className="border px-4 py-2 rounded-md text-sm text-gray-700"
            style={{
              borderColor: "#D2D2D2",
              paddingRight: "30px",
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg fill='gray' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            <option>Select Categories</option>
            <option>Customer</option>
            <option>Supplier</option>
          </select>
        </div>

        {/* RIGHT BUTTONS */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border"
            style={{
              borderColor: "#D2D2D2",
              color: "#444",
              background: "white",
            }}
          >
            Bulk Action
          </Button>

          <Button
            className="bg-[#5C3CF4] hover:bg-[#4b30c4]"
            onClick={() => navigate("/parties/create")}
          >
            Create Party
          </Button>
        </div>
      </div>

      {/* ================================ */}
      {/* TABLE */}
      {/* ================================ */}

      <div
        className="rounded-lg border shadow-sm"
        style={{ borderColor: "#E2E2E2" }}
      >
        <Table>
          <TableHeader>
            <TableRow
              style={{
                background: "#F8F9FA",
                borderBottom: "1px solid #E2E2E2",
              }}
            >
              <TableHead>Party Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Mobile Number</TableHead>
              <TableHead>Party type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredParties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No parties found.
                </TableCell>
              </TableRow>
            ) : (
              filteredParties.map((party, i) => (
                <TableRow
                  key={party._id}
                  style={{
                    background: i % 2 === 1 ? "#F7F7F7" : "#FFFFFF",
                  }}
                >
                  <TableCell>{party.name}</TableCell>
                  <TableCell>{party.party_category || "-"}</TableCell>
                  <TableCell>{party.mobile || "-"}</TableCell>
                  <TableCell>{party.party_type || "Customer"}</TableCell>
                  <TableCell>₹{Number(party.balance || 0)}</TableCell>

                  {/* 3-dot menu */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/parties/edit/${party._id}`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteParty(party._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ================================ */}
      {/* BOTTOM BANNER */}
      {/* ================================ */}

      <div
        className="rounded-xl p-6 mt-4"
        style={{
          background: "linear-gradient(90deg, #F1F5FF, #E8F1FF)",
          border: "1px solid #D8E1FF",
        }}
      >
        <p className="text-gray-700 text-lg font-medium">
          Add Multiple Parties at once
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Bulk upload all your parties using excel.
        </p>

        <Button className="bg-green-600 hover:bg-green-700 px-6">
          Upload Excel
        </Button>
      </div>
    </div>
  );
}
