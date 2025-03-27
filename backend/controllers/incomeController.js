const Income = require("../models/Income");
const FinancialSummary = require("../models/FinancialSummary");
const Expense = require("../models/Expense");

// Helper function to update financial summary
const updateFinancialSummary = async (projectId) => {
  const incomes = await Income.find({ projectId });
  const expenses = await Expense.find({ projectId });

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const profitLoss = totalIncome - totalExpense;

  let financialSummary = await FinancialSummary.findOne({ projectId });

  if (!financialSummary) {
    financialSummary = new FinancialSummary({
      projectId,
      totalIncome,
      totalExpense,
      profitLoss,
    });
  } else {
    financialSummary.totalIncome = totalIncome;
    financialSummary.totalExpense = totalExpense;
    financialSummary.profitLoss = profitLoss;
  }

  await financialSummary.save();
};

// Create Income
exports.createIncome = async (req, res) => {
  try {
    const { projectId, amount, description } = req.body;

    const income = new Income({ projectId, amount, description });
    await income.save();

    await updateFinancialSummary(projectId); // Update project-specific summary
    await updateFinancialSummary(null); // Update general summary

    res.status(201).json({ message: "Income created successfully", income });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating income", error: error.message });
  }
};

// Get All Incomes
exports.getAllIncomes = async (req, res) => {
  try {
    const incomes = await Income.find().populate("projectId", "name");
    res.status(200).json(incomes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching incomes", error: error.message });
  }
};

//Get All Incomes by Project ID
exports.getIncomesByProjectId = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const incomes = await Income.find({ projectId }).populate(
      "projectId",
      "name"
    );
    res.status(200).json(incomes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching incomes", error: error.message });
  }
};
// Get Income by ID
exports.getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id).populate(
      "projectId",
      "name"
    );
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.status(200).json(income);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching income", error: error.message });
  }
};

// Update Income
exports.updateIncome = async (req, res) => {
  try {
    const { amount, description, projectId } = req.body;

    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    const oldProjectId = income.projectId; // Store old projectId for summary update

    income.amount = amount;
    income.description = description;
    income.projectId = projectId;

    await income.save();

    await updateFinancialSummary(oldProjectId); // Update old project summary
    await updateFinancialSummary(projectId); // Update new project summary
    await updateFinancialSummary(null); // Update general summary

    res.status(200).json({ message: "Income updated successfully", income });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating income", error: error.message });
  }
};

// Delete Income
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    const projectId = income.projectId; // Store projectId for summary update

    await income.remove();

    await updateFinancialSummary(projectId); // Update project summary
    await updateFinancialSummary(null); // Update general summary

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting income", error: error.message });
  }
};
