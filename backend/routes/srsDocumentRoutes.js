const express = require("express");
const router = express.Router();
const srsDocumentController = require("../controllers/srsDocumentController");

// Create an SRS document
router.post("/", srsDocumentController.createSRSDocument);

// Get an SRS document for a project
router.get(
  "/projects/:projectId/srs-documents",
  srsDocumentController.getProjectSRSDocument
);

// Update an SRS document
router.put("/:id", srsDocumentController.updateSRSDocument);

// Delete an SRS document
router.delete("/:id", srsDocumentController.deleteSRSDocument);

module.exports = router;
