const FinancialSummary = require("../models/FinancialSummary");

// Get financial summary by projectId
const getFinancialSummary = async (req, res) => {
  try {
    const { projectId } = req.body;

    // If projectId is null or not provided, return the summary with projectId: null
    if (!projectId) {
      const defaultSummary = await FinancialSummary.findOne({
        projectId: null,
      });

      if (!defaultSummary) {
        return res.status(404).json({
          message: "Default financial summary not found",
        });
      }

      return res.status(200).json(defaultSummary);
    }

    // If projectId is provided, find the summary for that project
    const summary = await FinancialSummary.findOne({ projectId }).populate(
      "projectId"
    ); // Optional: populate project details if needed

    if (!summary) {
      return res.status(404).json({
        message: "Financial summary not found for the given projectId",
      });
    }

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving financial summary",
      error: error.message,
    });
  }
};

module.exports = {
  getFinancialSummary,
};
