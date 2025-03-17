const express = require("express");
const router = express.Router();
const policyController = require("../controllers/policyController");
const authMiddleware = require("../middleware/auth");

// Policy Routes
router.post("/policies", authMiddleware, policyController.createPolicy);
router.get("/policies", authMiddleware, policyController.getAllPolicies);
router.put("/policies/:id", authMiddleware, policyController.updatePolicy);
router.delete("/policies/:id", authMiddleware, policyController.deletePolicy);

module.exports = router;
