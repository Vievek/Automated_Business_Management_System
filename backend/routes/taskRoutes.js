const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

router.get("/users/:userId", taskController.getTasksByUserId);
router.get("/projects/:projectId", taskController.getTasksByProjectId);
router.get(
  "/projects/:projectId/users/:userId",
  taskController.getTasksByProjectIdAndUserId
);
router.get("/search", taskController.searchTasks);
module.exports = router;
