const Question = require("../models/Question");
const mongoose = require("mongoose");

// Create a Question
exports.createQuestion = async (req, res) => {
  try {
    const { content, project } = req.body;

    // Validate project ID format
    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    const question = new Question({
      content,
      project: new mongoose.Types.ObjectId(project), // Explicit conversion
    });

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({
      error: error.message,
      details: error.errors, // This will show validation details
    });
  }
};

// Get All Questions for a Project
exports.getProjectQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ project: req.params.projectId });
    res.status(200).json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a Question
exports.updateQuestion = async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a Question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // This will trigger the pre-remove hook to delete answers
    await question.deleteOne();

    res
      .status(200)
      .json({ message: "Question and its answers deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
