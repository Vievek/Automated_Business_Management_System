const Issue = require("../models/Issue");

// Create a new issue
exports.createIssue = async (req, res) => {
  try {
    const { issueName, details, raisedBy, raisedTo } = req.body;

    const newIssue = new Issue({
      issueName,
      details,
      raisedBy,
      raisedTo,
    });

    await newIssue.save();
    res.status(201).json({ message: "Issue created successfully", newIssue });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating issue", error: error.message });
  }
};

// Get all issues
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate(
      "raisedBy raisedTo",
      "username email"
    ); // Populate user details
    res.status(200).json(issues);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching issues", error: error.message });
  }
};

// Get a single issue by ID
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate(
      "raisedBy raisedTo",
      "username email"
    );
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.status(200).json(issue);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching issue", error: error.message });
  }
};

// Update an issue
exports.updateIssue = async (req, res) => {
  try {
    const { issueName, details, notedStatus, resolvedStatus } = req.body;

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        issueName,
        details,
        notedStatus,
        resolvedStatus,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res
      .status(200)
      .json({ message: "Issue updated successfully", updatedIssue });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating issue", error: error.message });
  }
};

// Delete an issue
exports.deleteIssue = async (req, res) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
    if (!deletedIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting issue", error: error.message });
  }
};

// Get issues by raisedTo
exports.getIssuesByRaisedTo = async (req, res) => {
  try {
    const issues = await Issue.find({ raisedTo: req.params.id }).populate(
      "raisedBy raisedTo",
      "username email"
    ); // Populate user details
    res.status(200).json(issues);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching issues", error: error.message });
  }
};

// Get issues by raisedBy
exports.getIssuesByRaisedBy = async (req, res) => {
  try {
    const issues = await Issue.find({ raisedBy: req.params.id }).populate(
      "raisedBy raisedTo",
      "username email"
    ); // Populate user details
    res.status(200).json(issues);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching issues", error: error.message });
  }
};
