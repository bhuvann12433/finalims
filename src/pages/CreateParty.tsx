import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import BillingAddressModal from "@/components/BillingAddressModal";
import ShippingAddressModal from "@/components/ShippingAddressModal";
import CategoryModal from "@/components/CategoryModal";

export default function CreateParty() {
  const navigate = useNavigate();
  const { toast } = useToast ? useToast() : { toast: () => {} };

  const [loading, setLoading] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);

  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);

  // ⭐ NEW — CATEGORY MODAL STATE
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // ⭐ Default categories (Option A)
  const DEFAULT_CATEGORIES = [
    "Supplier",
    "Customer",
    "Dealer",
    "Distributor",
    "Agent",
  ];

  // ⭐ Categories stored in state
  const [categories, setCategories] = useState<string[]>([]);

  // ⭐ Load categories from localStorage or default
  useEffect(() => {
    const saved = localStorage.getItem("party_categories");
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem("party_categories", JSON.stringify(DEFAULT_CATEGORIES));
    }
  }, []);

  // ⭐ Save category to localStorage
  const addCategory = (name: string) => {
    const updated = [...categories, name];
    setCategories(updated);
    localStorage.setItem("party_categories", JSON.stringify(updated));

    setFormData((p) => ({ ...p, party_category: name }));

    toast?.({
      title: "Category Added",
      description: `"${name}" has been added successfully.`,
    });
  };

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gstin: "",
    pan: "",
    party_type: "customer",
    party_category: "",
    opening_type: "to_collect",
    opening_balance: "0",
    billing_address: "",
    billing_city: "",
    billing_state: "",
    billing_pincode: "",
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
    contact_person: "",
    dob: "",
    credit_limit: "0",
  });

  const handleChange = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const copyBillingToShipping = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData((p) => ({
        ...p,
        shipping_address: p.billing_address,
        shipping_city: p.billing_city,
        shipping_state: p.billing_state,
        shipping_pincode: p.billing_pincode,
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          opening_balance: Number(formData.opening_balance),
          credit_limit: Number(formData.credit_limit),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast?.({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast?.({
        title: "Success",
        description: "Party created successfully!",
      });

      navigate("/parties");
    } catch (err) {
      toast?.({
        title: "Server Error",
        description: "Could not reach backend",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="w-full p-6 bg-[#f6f7fb] text-gray-900">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/parties")}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            ←
          </button>

          <h1 className="text-3xl font-bold">Create Party</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border rounded bg-white">Party Settings</button>
          <button className="px-4 py-2 border rounded bg-white">Save & New</button>
          <button
            className="px-5 py-2 bg-[#5b2ee6] text-white rounded"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* GENERAL DETAILS CARD */}
        <div className="bg-white rounded-xl p-6 border shadow-sm space-y-6">

          <h2 className="text-lg font-semibold">General Details</h2>

          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className="text-sm font-medium">Party Name *</label>
              <input
                className="w-full h-11 border rounded px-3 bg-white mt-1"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="col-span-3">
              <label className="text-sm font-medium">Mobile</label>
              <input
                className="w-full h-11 border rounded px-3 bg-white mt-1"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
              />
            </div>

            <div className="col-span-3">
              <label className="text-sm font-medium">Email</label>
              <input
                className="w-full h-11 border rounded px-3 bg-white mt-1"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="col-span-3">
              <label className="text-sm font-medium">Opening Balance</label>
              <div className="flex gap-2 mt-1">
                <div className="border w-32 h-11 rounded px-3 flex items-center">
                  ₹
                  <input
                    type="number"
                    className="ml-2 w-full outline-none"
                    value={formData.opening_balance}
                    onChange={(e) => handleChange("opening_balance", e.target.value)}
                  />
                </div>

                <select
                  className="border rounded h-11 px-2 w-32"
                  value={formData.opening_type}
                  onChange={(e) => handleChange("opening_type", e.target.value)}
                >
                  <option value="to_collect">To Collect</option>
                  <option value="to_pay">To Pay</option>
                </select>
              </div>
            </div>

          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-12 gap-4 mt-4">
            <div className="col-span-4">
              <label className="text-sm font-medium">GSTIN</label>
              <div className="flex gap-3 mt-1">
                <input
                  className="h-11 border rounded px-3 w-full"
                  placeholder="29XXXXXXXXX1Z"
                  value={formData.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                />
                <button className="px-4 bg-purple-200 text-purple-700 rounded">
                  Get Details
                </button>
              </div>
            </div>

            <div className="col-span-4">
              <label className="text-sm font-medium">PAN</label>
              <input
                className="h-11 border rounded px-3 w-full mt-1"
                value={formData.pan}
                onChange={(e) => handleChange("pan", e.target.value)}
              />
            </div>

            <div className="col-span-4" />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-12 gap-4 mt-6">
            <div className="col-span-3">
              <label className="text-sm font-medium">Party Type</label>
              <select
                className="h-11 w-full border rounded px-3 mt-1"
                value={formData.party_type}
                onChange={(e) => handleChange("party_type", e.target.value)}
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* ⭐ UPDATED DROPDOWN WITH +CREATE CATEGORY */}
            <div className="col-span-3">
              <label className="text-sm font-medium">Party Category</label>

              <select
                className="h-11 w-full border rounded px-3 mt-1"
                value={formData.party_category}
                onChange={(e) => {
                  if (e.target.value === "_create") {
                    setCategoryModalOpen(true);
                  } else {
                    handleChange("party_category", e.target.value);
                  }
                }}
              >
                <option value="">Select Category</option>

                {/* Load dynamic categories */}
                {categories.map((c, index) => (
                  <option key={index} value={c}>
                    {c}
                  </option>
                ))}

                {/* Create new */}
                <option value="_create" style={{ fontWeight: "bold", color: "blue" }}>
                  + Create Category
                </option>
              </select>
            </div>
          </div>

        </div>

        {/* ADDRESS CARD */}
        <div className="bg-white rounded-xl p-6 border shadow-sm space-y-6">
          <h2 className="text-lg font-semibold">Address</h2>

          <div className="grid grid-cols-12 gap-6">
            {/* Billing */}
            <div className="col-span-6">
              <label className="text-sm font-medium">Billing Address</label>
              <textarea
                className="w-full h-32 border rounded p-3 mt-1"
                value={formData.billing_address}
                onChange={(e) => {
                  handleChange("billing_address", e.target.value);
                  if (sameAsBilling) handleChange("shipping_address", e.target.value);
                }}
              />

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setBillingModalOpen(true)}
                  className="inline-block px-3 py-2 border border-dashed rounded text-blue-600 text-sm"
                >
                  + Add Billing Address
                </button>
              </div>
            </div>

            {/* Shipping */}
            <div className="col-span-6">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Shipping Address</label>

                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => copyBillingToShipping(e.target.checked)}
                  />
                  Same as Billing
                </label>
              </div>

              <textarea
                className="w-full h-32 border rounded p-3 mt-1 bg-gray-100"
                value={formData.shipping_address}
                onChange={(e) => handleChange("shipping_address", e.target.value)}
              />

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShippingModalOpen(true)}
                  className="inline-block px-3 py-2 border border-dashed rounded text-blue-600 text-sm"
                >
                  + Add Shipping Address
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT PERSON CARD */}
        <div className="bg-white rounded-xl p-6 border shadow-sm space-y-6">
          <h2 className="text-lg font-semibold">Contact Person Details</h2>

          <div className="grid grid-cols-12 gap-4">

            <div className="col-span-6">
              <label className="text-sm font-medium">Contact Person Name</label>
              <input
                className="w-full h-11 border rounded px-3 mt-1"
                value={formData.contact_person}
                onChange={(e) => handleChange("contact_person", e.target.value)}
              />
            </div>

            <div className="col-span-3">
              <label className="text-sm font-medium">DOB</label>
              <input
                className="w-full h-11 border rounded px-3 mt-1"
                placeholder="DD-MM-YYYY"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
              />
            </div>

            <div className="col-span-3">
              <label className="text-sm font-medium">Credit Limit</label>
              <input
                className="w-full h-11 border rounded px-3 mt-1"
                type="number"
                value={formData.credit_limit}
                onChange={(e) => handleChange("credit_limit", e.target.value)}
              />
            </div>

            <div className="col-span-12 mt-4">
              <label className="text-sm font-medium">Party Bank Account</label>
              <div className="h-28 border rounded-lg border-dashed flex items-center justify-center text-gray-500 mt-2">
                + Add Bank Account
              </div>
            </div>

            <div className="col-span-12">
              <label className="text-sm font-medium">Custom Field</label>
              <div className="h-24 border rounded-lg flex items-center justify-center text-gray-500 mt-2">
                Add custom fields from Party Settings
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/parties")}
            className="px-5 py-2 border rounded bg-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Creating..." : "Create Party"}
          </button>
        </div>

      </form>

      {/* MODALS */}
      <BillingAddressModal
        open={billingModalOpen}
        onClose={() => setBillingModalOpen(false)}
        onSave={(data) => {
          setFormData((prev) => ({
            ...prev,
            billing_address: data.street,
            billing_state: data.state,
            billing_city: data.city,
            billing_pincode: data.pincode,
          }));
        }}
      />

      <ShippingAddressModal
        open={shippingModalOpen}
        onClose={() => setShippingModalOpen(false)}
        onSave={(data) => {
          setFormData((prev) => ({
            ...prev,
            shipping_address: data.street,
            shipping_state: data.state,
            shipping_city: data.city,
            shipping_pincode: data.pincode,
          }));
        }}
      />

      {/* ⭐ NEW CATEGORY MODAL */}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={addCategory}
      />

    </div>
  );
}
