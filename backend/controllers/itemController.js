// controllers/itemController.js
const Item = require("../models/Item");

//
// =============================
// CREATE ITEM
// =============================
exports.createItem = async (req, res) => {
  try {
    const item = await Item.create({
      name: req.body.name,

      item_code: req.body.item_code || "",
      category: req.body.category || "",
      type: req.body.type || "goods",

      measuring_unit: req.body.measuring_unit || "PCS",

      sales_price: Number(req.body.sales_price) || 0,
      purchase_price: Number(req.body.purchase_price) || 0,
      mrp: Number(req.body.mrp) || 0,
      wholesale_price: Number(req.body.wholesale_price) || 0,

      gst_rate: Number(req.body.gst_rate) || 0,
      hsn_code: req.body.hsn_code || "",

      enable_batching: req.body.enable_batching || false,
      low_stock_threshold: Number(req.body.low_stock_threshold) || 10,

      description: req.body.description || "",
      quantity: Number(req.body.quantity) || 0,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("ITEM CREATE ERROR:", error);
    res.status(500).json({ error: "Item creation failed" });
  }
};

//
// =============================
// GET ALL ITEMS
// =============================
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    const formatted = items.map((item) => ({
      id: item._id,
      name: item.name,

      item_code: item.item_code,
      category: item.category,
      type: item.type,

      measuring_unit: item.measuring_unit,

      quantity: item.quantity,
      sales_price: item.sales_price,
      purchase_price: item.purchase_price,
      mrp: item.mrp,
      wholesale_price: item.wholesale_price,

      gst_rate: item.gst_rate,
      hsn_code: item.hsn_code,

      enable_batching: item.enable_batching,
      low_stock_threshold: item.low_stock_threshold,

      description: item.description,
      createdAt: item.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("FETCH ITEMS ERROR:", error);
    res.status(500).json({ error: "Fetch items failed" });
  }
};

//
// =============================
// GET ONE ITEM
// =============================
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ error: "Item not found" });

    res.json(item);
  } catch (error) {
    console.error("FETCH ITEM ERROR:", error);
    res.status(500).json({ error: "Fetch item failed" });
  }
};

//
// =============================
// UPDATE ITEM
// =============================
exports.updateItem = async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,

        item_code: req.body.item_code || "",
        category: req.body.category || "",
        type: req.body.type || "goods",

        measuring_unit: req.body.measuring_unit || "PCS",

        sales_price: Number(req.body.sales_price) || 0,
        purchase_price: Number(req.body.purchase_price) || 0,
        mrp: Number(req.body.mrp) || 0,
        wholesale_price: Number(req.body.wholesale_price) || 0,

        gst_rate: Number(req.body.gst_rate) || 0,
        hsn_code: req.body.hsn_code || "",

        enable_batching: req.body.enable_batching || false,
        low_stock_threshold: Number(req.body.low_stock_threshold) || 10,

        description: req.body.description || "",
        quantity: Number(req.body.quantity) || 0,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Item not found" });

    res.json(updated);
  } catch (error) {
    console.error("UPDATE ITEM ERROR:", error);
    res.status(500).json({ error: "Update item failed" });
  }
};

//
// =============================
// DELETE ITEM
// =============================
exports.deleteItem = async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ error: "Item not found" });

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);
    res.status(500).json({ error: "Delete item failed" });
  }
};

//
// =============================
// DASHBOARD STATS
// =============================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();

    const totalQuantity = await Item.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);

    res.json({
      total_items: totalItems,
      total_quantity: totalQuantity[0]?.total || 0,
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};

//
// =============================
// RECENT TRANSACTIONS
// =============================
exports.getRecentTransactions = async (req, res) => {
  try {
    const recentItems = await Item.find()
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json(recentItems);
  } catch (error) {
    console.error("RECENT TRANSACTIONS ERROR:", error);
    res.status(500).json({ error: "Failed to load recent transactions" });
  }
};
