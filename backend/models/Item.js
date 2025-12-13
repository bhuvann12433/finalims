// models/Item.js
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    item_code: { type: String, default: "" },
    category: { type: String, default: "" },
    type: { type: String, default: "goods" },

    measuring_unit: { type: String, default: "PCS" },

    sales_price: { type: Number, default: 0 },
    purchase_price: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    wholesale_price: { type: Number, default: 0 },

    gst_rate: { type: Number, default: 0 },
    hsn_code: { type: String, default: "" },

    enable_batching: { type: Boolean, default: false },
    low_stock_threshold: { type: Number, default: 10 },

    description: { type: String, default: "" },

    quantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
