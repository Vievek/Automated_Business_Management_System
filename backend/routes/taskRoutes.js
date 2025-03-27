const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/auth");
const abacMiddleware = require("../middleware/abac");

// Create a task
router.post("/", authMiddleware, taskController.createTask);

// Get all tasks
router.get("/", authMiddleware, taskController.getTasks);

// Get a task by ID
router.get("/:id", authMiddleware, taskController.getTaskById);

// Update a task
router.put("/:id", authMiddleware, taskController.updateTask);

// Delete a task
router.delete("/:id", authMiddleware, taskController.deleteTask);

// Get tasks by user ID
router.get("/users/:userId", authMiddleware, taskController.getTasksByUserId);

// Get tasks by project ID
router.get(
  "/projects/:projectId",
  authMiddleware,
  taskController.getTasksByProjectId
);

// Get tasks by project ID and user ID
router.get(
  "/projects/:projectId/users/:userId",
  authMiddleware,
  taskController.getTasksByProjectIdAndUserId
);

// Search tasks
router.get("/search", authMiddleware, taskController.searchTasks);

// get task by assignedBY id
router.get(
  "/assignedBy/:userId",
  authMiddleware,
  taskController.getTasksByAssignedById
);

// get task by assignedTo id
router.get(
  "/assignedTo/:userId",
  authMiddleware,
  taskController.getTasksByAssignedToId
);

module.exports = router;
