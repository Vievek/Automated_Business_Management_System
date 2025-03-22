const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

// User Routes
router.post("/register", authMiddleware, userController.register);
router.post("/login", userController.login);
router.get("/users", authMiddleware, userController.getAllUsers);
router.get("/users/:id", authMiddleware, userController.getUserProfile); // Updated to use getUserProfile
router.get("/filtered-users", authMiddleware, userController.getUsersByFilters);
router.get("/search", authMiddleware, userController.searchUsers);
router.put("/users/:id", authMiddleware, userController.updateUser);
router.delete("/users/:id", authMiddleware, userController.deleteUser);

module.exports = router;
