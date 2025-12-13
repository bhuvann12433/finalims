const express = require("express");
const router = express.Router();

const Party = require("../models/Party");
const Item = require("../models/Item");

// If you add invoices later, import Invoice model:
// const Invoice = require("../models/Invoice");

router.get("/", async (req, res) => {
  try {
    // Count Parties
    const totalParties = await Party.countDocuments();

    // Count Items
    const totalItems = await Item.countDocuments();

    // Placeholder values until you add sales/invoices
    const totalSales = 0;
    const pendingInvoices = 0;

    res.json({
      totalSales,
      pendingInvoices,
      totalParties,
      totalItems
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
