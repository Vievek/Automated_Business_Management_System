const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  resource: { type: String, required: true }, // e.g., '/projects'
  action: { type: String, required: true }, // e.g., 'POST'
  conditions: {
    role: { type: String }, // e.g., 'manager'
    teamAccess: { type: Boolean }, // e.g., true
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Specific users allowed
  },
});

module.exports = mongoose.model("Policy", policySchema);
