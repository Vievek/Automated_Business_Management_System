const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/auth");
const abacMiddleware = require("../middleware/abac");

// Project Routes
router.post(
  "/teams/:teamId/projects",
  authMiddleware,
  abacMiddleware("/projects", "POST"),
  projectController.createProjectForTeam
);
router.get(
  "/teams/:teamId/projects",
  authMiddleware,
  abacMiddleware("/projects", "GET"),
  projectController.getAllProjectsForTeam
);
router.put(
  "/teams/:teamId/projects/:projectId",
  authMiddleware,
  abacMiddleware("/projects", "PUT"),
  projectController.updateProjectForTeam
);
router.delete(
  "/teams/:teamId/projects/:projectId",
  authMiddleware,
  abacMiddleware("/projects", "DELETE"),
  projectController.deleteProjectForTeam
);

module.exports = router;
