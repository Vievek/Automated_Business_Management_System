const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  bonus: {
    type: Number,
    default: 0,
  },
  allowance: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
});

// Calculate total before saving
salarySchema.pre("save", async function (next) {
  const user = await mongoose.model("User").findById(this.user);
  if (!user) {
    throw new Error("User not found");
  }
  this.total = user.salary + this.bonus + this.allowance;
  next();
});

module.exports = mongoose.model("Salary", salarySchema);
