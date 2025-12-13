import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";

export default function AdjustStockModal({
  open,
  onClose,
  item,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  item: any | null;
  onSave: (newQty: number) => void;
}) {
  const [type, setType] = useState("add"); // add or reduce
  const [qty, setQty] = useState<number>(0);
  const [date, setDate] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (open) {
      setQty(0);
      setType("add");
      setRemarks("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [open]);

  if (!open || !item) return null;

  const finalStock =
    type === "add" ? item.quantity + qty : item.quantity - qty;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[850px] rounded-xl shadow-xl p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Adjust Stock Quantity – {item.name}
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-2 gap-6">

          {/* LEFT SIDE (FORM) */}
          <div className="space-y-5 text-sm">

            {/* Date */}
            <div>
              <label className="font-medium">Date</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border rounded-lg pl-10 pr-3 h-11 w-full"
                />
              </div>
            </div>

            {/* Godown */}
            <div>
              <label className="font-medium">Godown *</label>
              <select className="border rounded-lg h-11 w-full px-3 mt-1">
                <option value="">Select Godown</option>
                <option value="Main Godown">Main Godown</option>
                <option value="Branch Godown">Branch Godown</option>
              </select>
            </div>

            {/* Add / Reduce + Quantity */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="font-medium">Adjust Type</label>
                <select
                  className="border rounded-lg h-11 w-full mt-1 px-3"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="add">Add (+)</option>
                  <option value="reduce">Reduce (-)</option>
                </select>
              </div>

              <div className="w-1/2">
                <label className="font-medium">Quantity</label>
                <div className="flex mt-1">
                  <input
                    type="number"
                    className="border rounded-l-lg h-11 w-full px-3"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                  <div className="border rounded-r-lg px-3 h-11 flex items-center bg-gray-100 text-sm">
                    PCS
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="font-medium">Remarks (Optional)</label>
              <textarea
                className="border rounded-lg w-full h-20 p-3 mt-1"
                placeholder="Enter remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {/* RIGHT SIDE (LIVE CALCULATION) */}
          <div className="space-y-5 p-4 text-sm">

            <div className="border rounded-lg bg-gray-50 p-4 space-y-3">
              <p className="font-semibold">Stock Calculation</p>

              <div className="flex justify-between">
                <span>Current Stock:</span>
                <span className="font-medium">{item.quantity} PCS</span>
              </div>

              <div className="flex justify-between">
                <span>Adjustment:</span>
                <span className="font-medium">
                  {type === "add" ? "+" : "-"} {qty} PCS
                </span>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-semibold">
                <span>Final Stock:</span>
                <span>{finalStock} PCS</span>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg bg-white"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (qty <= 0) return;
              onSave(finalStock);
              onClose();
            }}
            className="px-6 py-2 rounded-lg bg-[#5b2ee6] text-white"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
