const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

// User Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/users", authMiddleware, userController.getAllUsers);
router.get("/users/:id", authMiddleware, userController.getUserProfile); // Updated to use getUserProfile
router.put("/users/:id", authMiddleware, userController.updateUser);

module.exports = router;
