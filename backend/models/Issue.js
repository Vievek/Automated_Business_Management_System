const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  issueName: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  raisedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  notedStatus: {
    type: Boolean,
    default: false,
  },
  resolvedStatus: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Issue", issueSchema);
