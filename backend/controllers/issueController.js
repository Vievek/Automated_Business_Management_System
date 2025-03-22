const Issue = require("../models/Issue");
const User = require("../models/User");

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

// Get issues by raisedTo with optional filters for notedStatus and resolvedStatus
exports.getIssuesByRaisedTo = async (req, res) => {
  try {
    const { notedStatus, resolvedStatus } = req.query;
    const filter = { raisedTo: req.params.id };

    // Add notedStatus to filter if provided
    if (notedStatus !== undefined) {
      filter.notedStatus = notedStatus === "true";
    }

    // Add resolvedStatus to filter if provided
    if (resolvedStatus !== undefined) {
      filter.resolvedStatus = resolvedStatus === "true";
    }

    const issues = await Issue.find(filter).populate(
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

// Get issues by raisedBy with optional filters for notedStatus and resolvedStatus
exports.getIssuesByRaisedBy = async (req, res) => {
  try {
    const { notedStatus, resolvedStatus } = req.query;
    const filter = { raisedBy: req.params.id };

    // Add notedStatus to filter if provided
    if (notedStatus !== undefined) {
      filter.notedStatus = notedStatus === "true";
    }

    // Add resolvedStatus to filter if provided
    if (resolvedStatus !== undefined) {
      filter.resolvedStatus = resolvedStatus === "true";
    }

    const issues = await Issue.find(filter).populate(
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

// Search Issues by any field (non-case-sensitive)
exports.searchIssues = async (req, res) => {
  const { query } = req.query;

  try {
    // Find users whose username, firstname, or lastname matches the query
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstname: { $regex: query, $options: "i" } },
        { lastname: { $regex: query, $options: "i" } },
      ],
    });

    // Extract user IDs from the search results
    const userIds = users.map((user) => user._id);

    // Find issues where issueName, details, raisedBy, or raisedTo matches the query
    const issues = await Issue.find({
      $or: [
        { issueName: { $regex: query, $options: "i" } }, // Search by issueName
        { details: { $regex: query, $options: "i" } }, // Search by details
        { raisedBy: { $in: userIds } }, // Search by raisedBy (user ID)
        { raisedTo: { $in: userIds } }, // Search by raisedTo (user ID)
      ],
    })
      .populate("raisedBy", "username firstname lastname") // Populate raisedBy with user details
      .populate("raisedTo", "username firstname lastname"); // Populate raisedTo with user details

    res.json(issues);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
