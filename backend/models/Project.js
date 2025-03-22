const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" }, // Optional
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
  srsDocument: { type: mongoose.Schema.Types.ObjectId, ref: "SRSDocument" },
  backlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Backlog" }],
});

module.exports = mongoose.model("Project", projectSchema);
