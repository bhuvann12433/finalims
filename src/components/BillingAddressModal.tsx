import React, { useState } from "react";

export default function BillingAddressModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [street, setStreet] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[650px] rounded-xl shadow-xl">
        
        {/* Title */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Add Billing Address</h2>

          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          <div>
            <label className="text-sm font-medium">
              Street Address <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full h-24 border border-[#d5d8df] rounded-lg p-3 mt-1"
              placeholder="Enter Street Address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">State</label>
              <select
                className="w-full h-11 border border-[#d5d8df] rounded-lg px-3 mt-1"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">Enter State</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Pincode</label>
              <input
                className="w-full h-11 border border-[#d5d8df] rounded-lg px-3 mt-1"
                placeholder="Enter pin code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">City</label>
            <input
              className="w-full h-11 border border-[#d5d8df] rounded-lg px-3 mt-1"
              placeholder="Enter City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-[#fafafa] rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg bg-white"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onSave({ street, state, pincode, city });
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
