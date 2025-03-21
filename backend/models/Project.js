const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", unique: true }, // One-to-one relationship
});

module.exports = mongoose.model("Project", projectSchema);
