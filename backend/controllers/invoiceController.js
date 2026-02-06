const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Item = require("../models/Item"); // <--- CRITICAL: Import Item Model

// ===============================
// 1. GET ALL INVOICES
// ===============================
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("party_id", "name mobile billing_address")
      .sort({ createdAt: -1 });

    const formatted = invoices.map((inv) => ({
      _id: inv._id,
      id: inv._id,
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      due_date: inv.due_date,
      total_amount: inv.total || 0,
      amount_received: inv.amount_received || 0,
      balance_due: inv.balance_due || 0,
      payment_status: inv.payment_status,
      party: inv.party_id,
      party_name: inv.party_id?.name || "Cash Sale",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

// ===============================
// 2. GET SINGLE INVOICE
// ===============================
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Invoice ID format" });
    }

    const invoice = await Invoice.findById(id).populate("party_id").lean();
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const responseData = { ...invoice, party: invoice.party_id };
    res.json(responseData);
  } catch (err) {
    console.error("Fetch ID Error:", err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

// ===============================
// ⭐ 3. CREATE INVOICE (FIXED STOCK DEDUCTION)
// ===============================
exports.createInvoice = async (req, res) => {
  console.log("Create Invoice Request Received:", req.body.invoice_number);

  try {
    const {
      invoice_number,
      invoice_date,
      due_date,
      party_id,
      items, // Array of items from frontend
      subtotal,
      discount,
      tax,
      total,
      amount_received,
      balance_due,
    } = req.body;

    // 1. Calculate Status
    let payment_status = "unpaid";
    if (Number(amount_received) >= Number(total) && Number(total) > 0) {
      payment_status = "paid";
    } else if (Number(amount_received) > 0) {
      payment_status = "partial";
    }

    // 2. Save Invoice
    const invoice = new Invoice({
      invoice_number,
      invoice_date,
      due_date,
      party_id,
      items,
      subtotal,
      discount,
      tax,
      total,
      amount_received,
      balance_due,
      payment_status,
    });

    await invoice.save();
    console.log("✅ Invoice Saved:", invoice._id);

    // ---------------------------------------------------------
    // ⭐ 3. CRITICAL STEP: SUBTRACT STOCK FROM INVENTORY
    // ---------------------------------------------------------
    if (items && items.length > 0) {
      console.log(`📉 Updating Stock for ${items.length} items...`);
      
      const bulkOps = items.map((item) => {
        // Ensure ID is valid before using it
        if (!item.item_id || !mongoose.Types.ObjectId.isValid(item.item_id)) {
           console.error("❌ Invalid Item ID found:", item.item_id);
           return null;
        }

        return {
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(item.item_id) }, // Force ID Conversion
            update: { $inc: { quantity: -Number(item.quantity) } } // Decrease quantity
          }
        };
      }).filter(op => op !== null); // Remove nulls

      if (bulkOps.length > 0) {
        const result = await Item.bulkWrite(bulkOps);
        console.log("✅ Stock Updated. Modified Count:", result.modifiedCount);
      }
    }
    // ---------------------------------------------------------

    res.status(201).json({ success: true, invoice });

  } catch (err) {
    console.error("Create Invoice Error:", err);
    res.status(500).json({ error: err.message || "Failed to create invoice" });
  }
};

// ===============================
// 4. GET NEXT INVOICE NUMBER
// ===============================
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoice_number) {
      const match = lastInvoice.invoice_number.match(/(\d+)$/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }
    res.json({ nextNumber: nextNum.toString() });
  } catch (err) {
    console.error("Auto-Number Error:", err);
    res.status(500).json({ nextNumber: "1" });
  }
};

// ===============================
// 5. DELETE INVOICE
// ===============================
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
    
    await Invoice.findByIdAndDelete(id);
    res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
};