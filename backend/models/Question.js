const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

module.exports = mongoose.model("Question", questionSchema);
