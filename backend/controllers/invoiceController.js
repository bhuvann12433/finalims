// controllers/itemController.js
const Item = require("../models/Item");

// =============================
// 1. CREATE ITEM
// =============================
exports.createItem = async (req, res) => {
  try {
    const item = await Item.create({
      name: req.body.name,
      item_code: req.body.item_code || "",
      category: req.body.category || "",
      type: req.body.type || "goods",
      measuring_unit: req.body.measuring_unit || "PCS", // Default unit

      // Price Fields (Safe Parsing)
      sales_price: Number(req.body.sales_price) || 0,
      purchase_price: Number(req.body.purchase_price) || 0,
      mrp: Number(req.body.mrp) || 0,
      wholesale_price: Number(req.body.wholesale_price) || 0,

      // Tax & HSN
      gst_rate: Number(req.body.gst_rate) || 0,
      hsn_code: req.body.hsn_code || "",

      // Inventory Settings
      enable_batching: req.body.enable_batching || false,
      low_stock_threshold: Number(req.body.low_stock_threshold) || 10,

      description: req.body.description || "",
      
      // ⭐ CRITICAL STOCK FIELD
      quantity: Number(req.body.quantity) || 0, 
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("ITEM CREATE ERROR:", error);
    res.status(500).json({ error: "Item creation failed" });
  }
};

// =============================
// 2. GET ALL ITEMS (Sorted Newest First)
// =============================
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    // Format strictly to ensure frontend gets clean numbers
    const formatted = items.map((item) => ({
      _id: item._id, // Standard ID
      id: item._id,  // Duplicate for easy frontend access
      name: item.name,
      item_code: item.item_code,
      category: item.category,
      type: item.type,
      measuring_unit: item.measuring_unit,
      
      // Stock
      quantity: item.quantity || 0,

      // Prices
      sales_price: item.sales_price || 0,
      purchase_price: item.purchase_price || 0,
      mrp: item.mrp || 0,
      wholesale_price: item.wholesale_price || 0,

      gst_rate: item.gst_rate || 0,
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

// =============================
// 3. GET ONE ITEM
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

// =============================
// 4. UPDATE ITEM
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
        
        // Ensure quantity updates are processed as numbers
        quantity: Number(req.body.quantity) || 0,
      },
      { new: true } // Return the updated document
    );

    if (!updated) return res.status(404).json({ error: "Item not found" });

    res.json(updated);
  } catch (error) {
    console.error("UPDATE ITEM ERROR:", error);
    res.status(500).json({ error: "Update item failed" });
  }
};

// =============================
// 5. DELETE ITEM
// =============================
exports.deleteItem = async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);
    res.status(500).json({ error: "Delete item failed" });
  }
};

// =============================
// 6. DASHBOARD STATS (Total Items + Stock Value)
// =============================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();

    const aggregation = await Item.aggregate([
      { 
        $group: { 
          _id: null, 
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$quantity", "$sales_price"] } } // Estimate stock value
        } 
      }
    ]);

    res.json({
      total_items: totalItems,
      total_quantity: aggregation[0]?.totalQuantity || 0,
      stock_value: aggregation[0]?.totalValue || 0
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};

// =============================
// 7. RECENT TRANSACTIONS (Recently Added/Edited Items)
// =============================
exports.getRecentTransactions = async (req, res) => {
  try {
    const recentItems = await Item.find()
      .sort({ updatedAt: -1 })
      .limit(5); // Limit to top 5 for cleaner dashboard

    res.json(recentItems);
  } catch (error) {
    console.error("RECENT TRANSACTIONS ERROR:", error);
    res.status(500).json({ error: "Failed to load recent transactions" });
  }
};