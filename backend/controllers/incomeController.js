const Income = require("../models/Income");

// Create Income
exports.createIncome = async (req, res) => {
  try {
    const { projectId, amount, description } = req.body;

    const income = new Income({ projectId, amount, description });
    await income.save();

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

// Get All Incomes by Project ID
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

    income.amount = amount;
    income.description = description;
    income.projectId = projectId;

    await income.save();

    res.status(200).json({ message: "Income updated successfully", income });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating income", error: error.message });
  }
};

// Delete Income
// Delete Income (simplified version)
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting income", error: error.message });
  }
};
