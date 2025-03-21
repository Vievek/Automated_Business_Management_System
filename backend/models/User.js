const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePic: { type: String }, // URL or file path to the profile picture
  salary: { type: Number, required: true },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], // Array of project references
  yearsOfExperience: { type: Number, required: true },
  nicNo: { type: String, required: true, unique: true }, // National Identity Card Number
  currentStatus: {
    type: String,
    enum: ["working on project", "on bench", "chief"],
    default: "on bench",
  },
  workingProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Reference to the current working project
  role: { type: String, required: true }, // Role field without enum restriction
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // One-to-many relationship with Task
  researches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Research" }], // Many-to-many relationship with Research
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }], // Many-to-many relationship with Note
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
