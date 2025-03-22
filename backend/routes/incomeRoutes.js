const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, incomeController.createIncome);
router.get("/", authMiddleware, incomeController.getAllIncomes);
router.get(
  "/project/:projectId",
  authMiddleware,
  incomeController.getIncomesByProjectId
);
router.get("/:id", authMiddleware, incomeController.getIncomeById);
router.put("/:id", authMiddleware, incomeController.updateIncome);
router.delete("/:id", authMiddleware, incomeController.deleteIncome);

module.exports = router;
