const SRSDocument = require("../models/SRSDocument");

// Create an SRS Document
exports.createSRSDocument = async (req, res) => {
  try {
    const { content, projectId } = req.body;
    const srsDocument = new SRSDocument({ content, project: projectId });
    await srsDocument.save();
    res.status(201).json(srsDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get SRS Document for a Project
exports.getProjectSRSDocument = async (req, res) => {
  try {
    const srsDocument = await SRSDocument.findOne({
      project: req.params.projectId,
    });
    if (!srsDocument) {
      return res.status(404).json({ message: "SRS Document not found" });
    }
    res.status(200).json(srsDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an SRS Document
exports.updateSRSDocument = async (req, res) => {
  try {
    const { content } = req.body;
    const srsDocument = await SRSDocument.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    if (!srsDocument) {
      return res.status(404).json({ message: "SRS Document not found" });
    }
    res.status(200).json(srsDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an SRS Document
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
