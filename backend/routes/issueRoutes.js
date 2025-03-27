const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const authMiddleware = require("../middleware/auth");
const abacMiddleware = require("../middleware/abac");

// Create a new issue
router.post("/issues", authMiddleware, issueController.createIssue);

// Get all issues
router.get("/issues", authMiddleware, issueController.getAllIssues);

// Get a single issue by ID
router.get("/issues/:id", authMiddleware, issueController.getIssueById);

// Get issues by raisedBy
router.get(
  "/issues/raisedBy/:id",
  authMiddleware,
  issueController.getIssuesByRaisedBy
);

// Get issues by raisedTo
router.get(
  "/issues/raisedTo/:id",
  authMiddleware,
  issueController.getIssuesByRaisedTo
);

// Update an issue
router.put("/issues/:id", authMiddleware, issueController.updateIssue);

// Delete an issue
router.delete("/issues/:id", authMiddleware, issueController.deleteIssue);

// Search issues
router.get("/issues/search", authMiddleware, issueController.searchIssues);

module.exports = router;
