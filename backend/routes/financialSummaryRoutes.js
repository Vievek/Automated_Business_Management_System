const express = require("express");
const router = express.Router();

const financialSummaryController = require("../controllers/financialSummaryController");

router.get("/", financialSummaryController.getFinancialSummary);

module.exports = router;
