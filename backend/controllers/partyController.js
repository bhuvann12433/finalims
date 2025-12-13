const Party = require("../models/Party");

// CREATE PARTY
exports.createParty = async (req, res) => {
  try {
    const party = await Party.create(req.body);
    res.json({ msg: "Party created", party });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL PARTIES
exports.getParties = async (req, res) => {
  try {
    const parties = await Party.find().sort({ createdAt: -1 });
    res.json(parties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET PARTY BY ID
exports.getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ msg: "Party not found" });

    res.json(party);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PARTY
exports.updateParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!party) return res.status(404).json({ msg: "Party not found" });

    res.json({ msg: "Party updated", party });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE PARTY
exports.deleteParty = async (req, res) => {
  try {
    const deleted = await Party.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ msg: "Party not found" });

    res.json({ msg: "Party deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
