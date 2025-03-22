const Quotation = require("../models/Quotation");

// Create a Quotation
exports.createQuotation = async (req, res) => {
  try {
    const { amount, details, projectId } = req.body;
    const quotation = new Quotation({ amount, details, project: projectId });
    await quotation.save();
    res.status(201).json(quotation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Quotation for a Project
exports.getProjectQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      project: req.params.projectId,
    });
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.status(200).json(quotation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a Quotation
exports.updateQuotation = async (req, res) => {
  try {
    const { amount, details } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { amount, details },
      { new: true }
    );
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.status(200).json(quotation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a Quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.status(200).json({ message: "Quotation deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
