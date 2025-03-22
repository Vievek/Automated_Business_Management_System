const Salary = require("../models/Salary");
const Expense = require("../models/Expense");
const User = require("../models/User");

// Helper function to update expense
const updateExpense = async (salary, action) => {
  const expenseDescription = `Salary for ${salary.month} - User: ${salary.user}`;

  if (action === "create") {
    const expense = new Expense({
      amount: salary.total,
      description: expenseDescription,
    });
    await expense.save();
  } else if (action === "update") {
    await Expense.findOneAndUpdate(
      { description: expenseDescription },
      { amount: salary.total }
    );
  } else if (action === "delete") {
    await Expense.findOneAndDelete({ description: expenseDescription });
  }
};

// Create Salary
exports.createSalary = async (req, res) => {
  try {
    const { user, month, bonus, allowance } = req.body;

    const salary = new Salary({ user, month, bonus, allowance });
    await salary.save();

    // Add salary as an expense
    await updateExpense(salary, "create");

    res.status(201).json({ message: "Salary created successfully", salary });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating salary", error: error.message });
  }
};

// Get All Salaries
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate("user", "name email salary");
    res.status(200).json(salaries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching salaries", error: error.message });
  }
};

// Get Salary by ID
exports.getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id).populate(
      "user",
      "name email salary"
    );
    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }
    res.status(200).json(salary);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching salary", error: error.message });
  }
};

// Update Salary
exports.updateSalary = async (req, res) => {
  try {
    const { bonus, allowance } = req.body;

    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    salary.bonus = bonus;
    salary.allowance = allowance;
    await salary.save();

    // Update associated expense
    await updateExpense(salary, "update");

    res.status(200).json({ message: "Salary updated successfully", salary });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating salary", error: error.message });
  }
};

// Delete Salary
exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    // Delete associated expense
    await updateExpense(salary, "delete");

    await salary.remove();

    res.status(200).json({ message: "Salary deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting salary", error: error.message });
  }
};
