import React, { useState } from "react";

export default function CategoryModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] rounded-xl shadow-xl">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Create Category</h2>
          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full h-11 border border-[#d5d8df] rounded-lg px-3 mt-1"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              if (name.trim() === "") return;
              onSave(name.trim());
              setName("");
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
