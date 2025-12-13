const mongoose = require("mongoose");

const PartySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    party_type: { type: String, default: "customer" },

    mobile: { type: String, default: "" },
    email: { type: String, default: "" },
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },

    party_category: { type: String, default: "" },
    dl_no: { type: String, default: "" },

    billing_address: { type: String, default: "" },
    billing_city: { type: String, default: "" },
    billing_state: { type: String, default: "" },
    billing_pincode: { type: String, default: "" },

    shipping_address: { type: String, default: "" },
    shipping_city: { type: String, default: "" },
    shipping_state: { type: String, default: "" },
    shipping_pincode: { type: String, default: "" },

    credit_limit: { type: Number, default: 0 },
    opening_balance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },

    bank_name: { type: String, default: "" },
    bank_account_number: { type: String, default: "" },
    bank_ifsc: { type: String, default: "" },
    bank_branch: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Party", PartySchema);
