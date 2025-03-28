const SRSDocument = require("../models/SRSDocument");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

// Create or Update SRS Document
exports.createOrUpdateSRSDocument = async (req, res) => {
  try {
    const { content, projectId } = req.body;

    let srsDocument = await SRSDocument.findOne({ project: projectId });

    if (srsDocument) {
      srsDocument.content = content;
      srsDocument.lastUpdated = Date.now();
      await srsDocument.save();
    } else {
      srsDocument = new SRSDocument({
        content,
        project: projectId,
      });
      await srsDocument.save();
    }

    res.status(200).json(srsDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get SRS Document for a Project
exports.getProjectSRSDocument = async (req, res) => {
  try {
    const srsDocument = await SRSDocument.findOne({
      project: req.params.projectId,
    }).populate("questionsUsed");

    if (!srsDocument) {
      return res.status(404).json({ message: "SRS Document not found" });
    }

    res.status(200).json(srsDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generate SRS from Questions
exports.generateSRSFromQuestions = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get all questions and answers for the project
    const questions = await Question.find({ project: projectId }).populate({
      path: "answers",
      model: "Answer",
    });

    if (!questions.length) {
      return res
        .status(400)
        .json({ message: "No questions found for this project" });
    }

    // Generate SRS content structure
    const srsContent = {
      introduction: {
        purpose: "",
        documentConventions: "",
        intendedAudience: "",
        productScope: "",
      },
      overallDescription: {
        productPerspective: "",
        productFunctions: "",
        userCharacteristics: "",
        constraints: "",
      },
      systemFeatures: {},
      externalInterfaceRequirements: {
        userInterfaces: "",
        hardwareInterfaces: "",
        softwareInterfaces: "",
        communicationsInterfaces: "",
      },
      nonFunctionalRequirements: {
        performanceRequirements: "",
        safetyRequirements: "",
        securityRequirements: "",
        softwareQualityAttributes: "",
      },
      otherRequirements: {
        appendixA: "",
        appendixB: "",
      },
    };

    // Process questions to fill SRS content
    questions.forEach((question) => {
      // Categorize questions and populate relevant sections
      // This is simplified - you'd want more sophisticated categorization
      if (question.content.toLowerCase().includes("purpose")) {
        srsContent.introduction.purpose = question.answers[0]?.content || "";
      }
      // Add more categorization logic as needed
    });

    // Create or update SRS document
    let srsDocument = await SRSDocument.findOneAndUpdate(
      { project: projectId },
      {
        content: JSON.stringify(srsContent, null, 2),
        questionsUsed: questions.map((q) => q._id),
        lastUpdated: Date.now(),
      },
      { new: true, upsert: true }
    );

    res.status(200).json(srsDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete SRS Document
exports.deleteSRSDocument = async (req, res) => {
  try {
    const srsDocument = await SRSDocument.findByIdAndDelete(req.params.id);
    if (!srsDocument) {
      return res.status(404).json({ message: "SRS Document not found" });
    }
    res.status(200).json({ message: "SRS Document deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
