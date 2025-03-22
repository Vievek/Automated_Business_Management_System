const express = require("express");
const router = express.Router();
const backlogController = require("../controllers/backlogController");

// Create a backlog with order management
router.post("/", backlogController.createBacklog);

// Update a backlog (order or status)
router.put("/:id", backlogController.updateBacklog);

// Delete a backlog and update order
router.delete("/:id", backlogController.deleteBacklog);

// Get all backlogs for a project
router.get(
  "/projects/:projectId/backlogs",
  backlogController.getProjectBacklogs
);

module.exports = router;
