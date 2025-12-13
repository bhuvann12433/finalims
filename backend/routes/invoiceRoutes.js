const express = require("express");
const router = express.Router();

const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  deleteInvoice,
  getNextInvoiceNumber // <--- Import this new function
} = require("../controllers/invoiceController");

// ===============================
// ⭐ 1. GET NEXT INVOICE NUMBER (Auto-Generator)
// ===============================
// MUST be placed BEFORE /:id route
router.get("/next-number", getNextInvoiceNumber);

// ===============================
// 2. GET ALL INVOICES (Search & Filter)
// ===============================
router.get("/", getInvoices);

// ===============================
// 3. GET SINGLE INVOICE (View Page)
// ===============================
router.get("/:id", getInvoiceById);

// ===============================
// 4. CREATE INVOICE
// ===============================
router.post("/", createInvoice);

// ===============================
// 5. DELETE INVOICE
// ===============================
router.delete("/:id", deleteInvoice);

module.exports = router;