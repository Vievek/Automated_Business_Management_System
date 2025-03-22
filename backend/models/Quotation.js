const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  details: { type: String },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Quotation", quotationSchema);
