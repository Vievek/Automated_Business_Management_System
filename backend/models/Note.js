const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  research: { type: mongoose.Schema.Types.ObjectId, ref: "Research" },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Many-to-many relationship with User
});

module.exports = mongoose.model("Note", noteSchema);
