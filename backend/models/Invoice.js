const mongoose = require("mongoose");

const InvoiceItemSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  name: String,
  description: String,
  hsn: String,
  quantity: Number,
  unit_price: Number,
  discount_percent: Number,
  discount_amount: Number,
  tax_percent: Number,
  unit: String,
  mfg: String,
  batch: String,
  exp_date: String,
  mrp: Number,
  godown: String,
});

const InvoiceSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, required: true },
    invoice_date: { type: Date, required: true },
    due_date: { type: Date },

    party_id: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true },

    items: [InvoiceItemSchema],           // 🔥 FULL ITEM STORAGE
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    amount_received: { type: Number, default: 0 },
    balance_due: { type: Number, default: 0 },

    payment_status: { type: String, default: "unpaid" }, 
    // paid | unpaid | partial | overdue
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
