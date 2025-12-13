const Party = require("../models/Party");
const Item = require("../models/Item");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalParties = await Party.countDocuments();
    const totalItems = await Item.countDocuments();

    // You can update these when invoices are added
    const totalSales = 0;
    const pendingInvoices = 0;

    res.json({
      totalSales,
      totalParties,
      totalItems,
      pendingInvoices,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
