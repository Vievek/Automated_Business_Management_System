const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const authMiddleware = require("../middleware/auth");
const abacMiddleware = require("../middleware/abac");

// Create a new issue
router.post(
  "/issues",
  authMiddleware,
  abacMiddleware("/issues", "POST"),
  issueController.createIssue
);

// Get all issues
router.get(
  "/issues",
  authMiddleware,
  abacMiddleware("/issues", "GET"),
  issueController.getAllIssues
);

// Get a single issue by ID
router.get(
  "/issues/:id",
  authMiddleware,
  abacMiddleware("/issues/:id", "GET"),
  issueController.getIssueById
);

// Get issues by raisedBy
router.get(
  "/issues/raisedBy/:id",
  authMiddleware,
  abacMiddleware("/issues/raisedBy/:id", "GET"),
  issueController.getIssuesByRaisedBy
);

// Get issues by raisedTo
router.get(
  "/issues/raisedTo/:id",
  authMiddleware,
  abacMiddleware("/issues/raisedTo/:id", "GET"),
  issueController.getIssuesByRaisedTo
);

// Update an issue
router.put(
  "/issues/:id",
  authMiddleware,
  abacMiddleware("/issues/:id", "PUT"),
  issueController.updateIssue
);

// Delete an issue
router.delete(
  "/:id",
  authMiddleware,
  abacMiddleware("/issues/:id", "DELETE"),
  issueController.deleteIssue
);

// Search issues
router.get(
  "/issues/search",
  authMiddleware,
  abacMiddleware("/issues/search", "GET"),
  issueController.searchIssues
);

module.exports = router;
