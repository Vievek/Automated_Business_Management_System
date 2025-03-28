const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { type: String },
    salary: { type: Number, required: true },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    yearsOfExperience: { type: Number, required: true },
    nicNo: { type: String, required: true, unique: true },
    currentStatus: {
      type: String,
      enum: ["working on project", "on bench", "chief"],
      default: "on bench",
    },
    role: { type: String, required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    researches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Research" }],
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Remove user from projects when deleted
userSchema.pre("remove", async function (next) {
  try {
    await mongoose
      .model("Project")
      .updateMany({ members: this._id }, { $pull: { members: this._id } });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
