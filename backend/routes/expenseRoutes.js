const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, expenseController.createExpense);
router.get("/", authMiddleware, expenseController.getAllExpenses);
router.get(
  "/project/:projectId",
  authMiddleware,
  expenseController.getExpensesByProjectId
);
router.get("/:id", authMiddleware, expenseController.getExpenseById);
router.put("/:id", authMiddleware, expenseController.updateExpense);
router.delete("/:id", authMiddleware, expenseController.deleteExpense);

module.exports = router;
