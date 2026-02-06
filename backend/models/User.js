const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // ✅ NEW FIELD: Role (Admin vs Staff)
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff", 
    },
    // ✅ NEW FIELD: Specific Permissions
    permissions: {
      canEdit: { type: Boolean, default: false },       // Only some staff get this
      canDelete: { type: Boolean, default: false },     // Only Admin gets this
      viewDashboard: { type: Boolean, default: false }, // Only Admin gets this
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);