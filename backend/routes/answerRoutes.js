const express = require("express");
const router = express.Router();
const answerController = require("../controllers/answerController");

// Create an answer
router.post("/", answerController.createAnswer);

// Get all answers for a question
router.get(
  "/questions/:questionId/answers",
  answerController.getQuestionAnswers
);

// Update an answer
router.put("/:id", answerController.updateAnswer);

// Delete an answer
router.delete("/:id", answerController.deleteAnswer);

module.exports = router;
