const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, salaryController.createSalary);
router.get("/", authMiddleware, salaryController.getAllSalaries);
router.get("/:id", authMiddleware, salaryController.getSalaryById);
router.put("/:id", authMiddleware, salaryController.updateSalary);
router.delete("/:id", authMiddleware, salaryController.deleteSalary);

module.exports = router;
