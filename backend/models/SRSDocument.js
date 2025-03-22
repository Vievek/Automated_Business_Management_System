const mongoose = require("mongoose");

const srsDocumentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("SRSDocument", srsDocumentSchema);
