const express = require("express");
const router = express.Router();
const srsDocumentController = require("../controllers/srsDocumentController");

// Create or Update SRS document
router.post("/", srsDocumentController.createOrUpdateSRSDocument);

// Get SRS document for a project
router.get("/projects/:projectId", srsDocumentController.getProjectSRSDocument);

// Generate SRS from questions
router.post(
  "/projects/:projectId/generate",
  srsDocumentController.generateSRSFromQuestions
);

// Delete SRS document
router.delete("/:id", srsDocumentController.deleteSRSDocument);

module.exports = router;
