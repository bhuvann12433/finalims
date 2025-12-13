// routes/itemRoutes.js
const express = require("express");
const router = express.Router();

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getDashboardStats,
  getRecentTransactions
} = require("../controllers/itemController");

router.post("/", createItem);
router.get("/", getItems);
router.get("/stats/dashboard", getDashboardStats);
router.get("/recent", getRecentTransactions);

router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
