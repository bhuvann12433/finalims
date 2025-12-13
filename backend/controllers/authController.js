const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, password: hashedPassword });

    res.json({ msg: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔥 DEBUG LOGIN FUNCTION (FULL)
// ===============================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login Attempt Received:", username, password);

    const user = await User.findOne({ username });

    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Debugging password
    console.log("Entered Password:", password);
    console.log("Stored Hash from DB:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password Match Result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login Success for user:", username);

    res.json({
      msg: "Login successful",
      token,
      user: { id: user._id, username: user.username },
    });
    
  } catch (error) {
    console.error("🔥 LOGIN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
