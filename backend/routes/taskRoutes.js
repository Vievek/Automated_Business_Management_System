const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/auth");
const abacMiddleware = require("../middleware/abac");

// Create a task
router.post(
  "/",
  authMiddleware,
  abacMiddleware("/tasks", "POST"),
  taskController.createTask
);

// Get all tasks
router.get(
  "/",
  authMiddleware,
  abacMiddleware("/tasks", "GET"),
  taskController.getTasks
);

// Get a task by ID
router.get(
  "/:id",
  authMiddleware,
  abacMiddleware("/tasks", "GET"),
  taskController.getTaskById
);

// Update a task
router.put(
  "/:id",
  authMiddleware,
  abacMiddleware("/tasks", "PUT"),
  taskController.updateTask
);

// Delete a task
router.delete(
  "/:id",
  authMiddleware,
  abacMiddleware("/tasks", "DELETE"),
  taskController.deleteTask
);

// Get tasks by user ID
router.get(
  "/users/:userId",
  authMiddleware,
  abacMiddleware("/tasks/users/:userId", "GET"),
  taskController.getTasksByUserId
);

// Get tasks by project ID
router.get(
  "/projects/:projectId",
  authMiddleware,
  abacMiddleware("/tasks/projects/:projectId", "GET"),
  taskController.getTasksByProjectId
);

// Get tasks by project ID and user ID
router.get(
  "/projects/:projectId/users/:userId",
  authMiddleware,
  abacMiddleware("/tasks/projects/:projectId/users/:userId", "GET"),
  taskController.getTasksByProjectIdAndUserId
);

// Search tasks
router.get(
  "/search",
  authMiddleware,
  abacMiddleware("/tasks/search", "GET"),
  taskController.searchTasks
);

module.exports = router;
