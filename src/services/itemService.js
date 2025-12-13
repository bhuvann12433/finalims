// src/services/itemService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/items";

// ------------------------
// Clean helper to convert number safely
// ------------------------
function safeNumber(value) {
  if (value === "" || value === undefined || value === null) return undefined;
  return Number(value);
}

// ------------------------
// CREATE ITEM
// ------------------------
export async function createItem(data) {
  const payload = {
    name: data.name,
    item_code: data.item_code || "",
    category: data.category || "",
    type: data.type || "goods",
    measuring_unit: data.measuring_unit || "PCS",

    sales_price: safeNumber(data.sales_price),
    purchase_price: safeNumber(data.purchase_price),
    mrp: safeNumber(data.mrp),
    wholesale_price: safeNumber(data.wholesale_price),

    gst_rate: safeNumber(data.gst_rate),
    hsn_code: data.hsn_code || "",

    enable_batching: data.enable_batching || false,
    low_stock_threshold: safeNumber(data.low_stock_threshold),

    description: data.description || "",
    quantity: safeNumber(data.quantity),
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

// ------------------------
// GET ALL ITEMS
// ------------------------
export async function getItems() {
  const res = await fetch(API_URL);
  return res.json();
}

// ------------------------
// GET ONE ITEM
// ------------------------
export async function getItem(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}

// ------------------------
// UPDATE ITEM (smart update)
// ------------------------
export async function updateItem(id, data) {
  const payload = {};

  // Only send keys that have value (avoid overwriting)
  for (const key in data) {
    if (data[key] !== "" && data[key] !== undefined && data[key] !== null) {
      payload[key] = typeof data[key] === "number" ? data[key] : data[key];

      // Convert numeric fields
      if (["sales_price", "purchase_price", "mrp", "wholesale_price", "quantity", "gst_rate", "low_stock_threshold"].includes(key)) {
        payload[key] = safeNumber(data[key]);
      }
    }
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

// ------------------------
// DELETE ITEM
// ------------------------
export async function deleteItem(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return res.json();
}

// ------------------------
// DASHBOARD STATS
// ------------------------
export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/stats/dashboard`);
  return res.json();
}

// ------------------------
// RECENT UPDATES
// ------------------------
export async function getRecentTransactions() {
  const res = await fetch(`${API_URL}/recent`);
  return res.json();
}
