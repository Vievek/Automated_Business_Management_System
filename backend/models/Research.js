const mongoose = require("mongoose");

const researchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Many-to-many relationship with User
});

module.exports = mongoose.model("Research", researchSchema);
