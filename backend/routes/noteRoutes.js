const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.post("/", noteController.createNote);
router.get("/", noteController.getNotes);
router.get("/:id", noteController.getNoteById);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

router.get("/users/:userId", noteController.getNotesByUserId);
router.get("/tasks/:taskId", noteController.getNotesByTaskId);
router.get("/projects/:projectId", noteController.getNotesByProjectId);
router.get("/researches/:researchId", noteController.getNotesByResearchId);

module.exports = router;
