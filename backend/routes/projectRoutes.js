const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/auth");
const abacMiddleware = require("../middleware/abac");

// Create a standalone project
router.post(
  "/projects",
  authMiddleware,
  abacMiddleware("/projects", "POST"),
  projectController.createProject
);

// Get all projects (standalone and team-associated)
router.get(
  "/projects",
  authMiddleware,
  // abacMiddleware("/projects", "GET"),
  projectController.getAllProjects
);

// Update a project
router.put(
  "/projects/:projectId",
  authMiddleware,
  abacMiddleware("/projects", "PUT"),
  projectController.updateProject
);

// Delete a project
router.delete(
  "/projects/:projectId",
  authMiddleware,
  abacMiddleware("/projects", "DELETE"),
  projectController.deleteProject
);

module.exports = router;
