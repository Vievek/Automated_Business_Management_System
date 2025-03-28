const mongoose = require("mongoose");

const srsDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "Software Requirements Specification",
  },
  content: { type: String, required: true },
  version: { type: String, default: "1.0.0" },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    unique: true,
  },
  questionsUsed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SRSDocument", srsDocumentSchema);
