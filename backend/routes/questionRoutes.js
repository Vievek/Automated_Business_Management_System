const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");

// Create a question
router.post("/", questionController.createQuestion);

// Get all questions for a project
router.get(
  "/projects/:projectId/questions",
  questionController.getProjectQuestions
);

// Update a question
router.put("/:id", questionController.updateQuestion);

// Delete a question
router.delete("/:id", questionController.deleteQuestion);

module.exports = router;
