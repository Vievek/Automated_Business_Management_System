const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController");

// Create a quotation
router.post("/", quotationController.createQuotation);

// Get a quotation for a project
router.get(
  "/projects/:projectId/quotations",
  quotationController.getProjectQuotation
);

// Update a quotation
router.put("/:id", quotationController.updateQuotation);

// Delete a quotation
router.delete("/:id", quotationController.deleteQuotation);

module.exports = router;
