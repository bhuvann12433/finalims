const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// REGISTER (OPTIONAL)
// ===============================
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || "staff",
      permissions: {
        canEdit: role === "admin",
        canDelete: role === "admin",
        viewDashboard: role === "admin",
      },
    });

    res.json({ msg: "User created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ===============================
// LOGIN
// ===============================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        permissions: user.permissions || {},
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ===============================
// CREATE STAFF (ADMIN)
// ===============================
exports.createStaff = async (req, res) => {
  try {
    const { username, password, canEdit } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await User.create({
      username,
      password: hashedPassword,
      role: "staff",
      permissions: {
        canEdit: !!canEdit,
        canDelete: false,
        viewDashboard: false,
      },
    });

    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to create staff" });
  }
};

// ===============================
// GET ALL STAFF
// ===============================
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" }).select("-password");
    res.json(staff);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch staff" });
  }
};

// ===============================
// DELETE STAFF
// ===============================
exports.deleteStaff = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
};

// ===============================
// UPDATE STAFF (PROMOTE / DEMOTE)
// ===============================
exports.updateStaff = async (req, res) => {
  try {
    const { canEdit } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        permissions: {
          canEdit: !!canEdit,
          canDelete: false,
          viewDashboard: false,
        },
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
};
