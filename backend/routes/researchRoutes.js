const express = require("express");
const router = express.Router();
const researchController = require("../controllers/researchController");

router.post("/", researchController.createResearch);
router.get("/", researchController.getResearches);
router.get("/:id", researchController.getResearchById);
router.put("/:id", researchController.updateResearch);
router.delete("/:id", researchController.deleteResearch);

router.get("/users/:userId", researchController.getResearchesByUserId);
router.get("/projects/:projectId", researchController.getResearchesByProjectId);

module.exports = router;
