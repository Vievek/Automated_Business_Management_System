const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
    srsDocument: { type: mongoose.Schema.Types.ObjectId, ref: "SRSDocument" },
    backlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Backlog" }],
  },
  { timestamps: true }
);

// Remove project from users when deleted
projectSchema.pre("remove", async function (next) {
  try {
    await mongoose
      .model("User")
      .updateMany(
        { _id: { $in: this.members } },
        { $pull: { projects: this._id } }
      );
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Project", projectSchema);
