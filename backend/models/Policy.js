const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  resource: { type: String, required: true }, // e.g., '/projects'
  action: { type: String, required: true }, // e.g., 'POST'
  conditions: {
    role: { type: String }, // e.g., 'manager'
    department: { type: String }, // e.g., 'IT'
    teamAccess: { type: Boolean }, // e.g., true
    time: { type: String }, // e.g., '9AM-5PM'
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Specific users allowed
  },
});

module.exports = mongoose.model("Policy", policySchema);
