const express = require("express");
const router = express.Router();

const {
  createParty,
  getParties,
  getPartyById,
  updateParty,
  deleteParty,
} = require("../controllers/partyController");

router.post("/", createParty);
router.get("/", getParties);
router.get("/:id", getPartyById);
router.put("/:id", updateParty);
router.delete("/:id", deleteParty);

module.exports = router;
