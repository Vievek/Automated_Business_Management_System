const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

// Add pre-remove hook to delete all answers when question is deleted
questionSchema.pre("remove", async function (next) {
  try {
    await mongoose.model("Answer").deleteMany({ question: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Question", questionSchema);
