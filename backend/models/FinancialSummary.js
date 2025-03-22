const mongoose = require("mongoose");

const financialSummarySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    default: null, // Allow financial summary without a project
  },
  totalIncome: {
    type: Number,
    default: 0,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  profitLoss: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("FinancialSummary", financialSummarySchema);
