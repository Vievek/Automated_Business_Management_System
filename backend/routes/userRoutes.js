const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

// User Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/users", authMiddleware, userController.getAllUsers);

module.exports = router;
