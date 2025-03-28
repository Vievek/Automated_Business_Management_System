const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/auth");
const abacMiddleware = require("../middleware/abac");

// Create a standalone project
router.post("/projects", authMiddleware, projectController.createProject);

// Get all projects (standalone and team-associated)
router.get(
  "/projects",
  authMiddleware,
  // abacMiddleware("/projects", "GET"),
  projectController.getAllProjects
);
// Get a project by ID
router.get(
  "/projects/:projectId",
  authMiddleware,
  projectController.getProjectById
);
// Update a project
router.put(
  "/projects/:projectId",
  authMiddleware,
  projectController.updateProject
);

// Delete a project
router.delete(
  "/projects/:projectId",
  authMiddleware,
  projectController.deleteProject
);

// Add a member to a project
router.put(
  "/projects/:projectId/members/:userId",
  authMiddleware,
  projectController.addMemberToProject
);

// Remove a member from a project
router.delete(
  "/projects/:projectId/members/:userId",
  authMiddleware,
  projectController.removeMemberFromProject
);

module.exports = router;
