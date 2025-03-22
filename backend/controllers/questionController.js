const Question = require("../models/Question");

// Create a Question
exports.createQuestion = async (req, res) => {
  try {
    const { content, projectId } = req.body;
    const question = new Question({ content, project: projectId });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
