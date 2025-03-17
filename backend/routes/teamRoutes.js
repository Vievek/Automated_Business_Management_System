const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/auth");

// Team Routes
router.post("/teams", authMiddleware, teamController.createTeam);
router.get("/teams", authMiddleware, teamController.getAllTeams);
router.get("/teams/:id", authMiddleware, teamController.getTeamById);
router.put("/teams/:id", authMiddleware, teamController.updateTeam);
router.delete("/teams/:id", authMiddleware, teamController.deleteTeam);

module.exports = router;
