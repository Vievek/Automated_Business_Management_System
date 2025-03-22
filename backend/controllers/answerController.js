const Answer = require("../models/Answer");

// Create an Answer
exports.createAnswer = async (req, res) => {
  try {
    const { content, questionId } = req.body;
    const answer = new Answer({ content, question: questionId });
    await answer.save();
    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Answers for a Question
exports.getQuestionAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId });
    res.status(200).json(answers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an Answer
exports.updateAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    res.status(200).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an Answer
exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
