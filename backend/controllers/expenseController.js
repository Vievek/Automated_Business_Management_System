const Expense = require("../models/Expense");
const FinancialSummary = require("../models/FinancialSummary");

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

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const { projectId, amount, description } = req.body;

    const expense = new Expense({ projectId, amount, description });
    await expense.save();

    await updateFinancialSummary(projectId); // Update project-specific summary
    await updateFinancialSummary(null); // Update general summary

    res.status(201).json({ message: "Expense created successfully", expense });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating expense", error: error.message });
  }
};

// Get All Expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().populate("projectId", "name");
    res.status(200).json(expenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching expenses", error: error.message });
  }
};

// Get All Expenses by Project ID
exports.getExpensesByProjectId = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const expenses = await Expense.find({ projectId }).populate(
      "projectId",
      "name"
    );
    res.status(200).json(expenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching expenses", error: error.message });
  }
};

// Get Expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate(
      "projectId",
      "name"
    );
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching expense", error: error.message });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const { amount, description, projectId } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const oldProjectId = expense.projectId; // Store old projectId for summary update

    expense.amount = amount;
    expense.description = description;
    expense.projectId = projectId;

    await expense.save();

    await updateFinancialSummary(oldProjectId); // Update old project summary
    await updateFinancialSummary(projectId); // Update new project summary
    await updateFinancialSummary(null); // Update general summary

    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating expense", error: error.message });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const projectId = expense.projectId; // Store projectId for summary update

    await expense.remove();

    await updateFinancialSummary(projectId); // Update project summary
    await updateFinancialSummary(null); // Update general summary

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting expense", error: error.message });
  }
};
