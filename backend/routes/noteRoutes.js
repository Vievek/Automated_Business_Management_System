const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

// Basic CRUD routes
router.post("/", noteController.createNote);
router.get("/", noteController.getNotes);
router.get("/:id", noteController.getNoteById);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

// Relationship-based routes
router.get("/project/:projectId", noteController.getNotesByProjectId);
router.get("/research/:researchId", noteController.getNotesByResearchId);
router.get("/creator/:userId", noteController.getNotesByCreator);

module.exports = router;
