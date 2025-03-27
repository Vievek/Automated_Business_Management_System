const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const abacMiddleware = require("../middleware/abac");

// User Routes

router.post("/login", userController.login);

router.post("/logout", authMiddleware, userController.logout);

router.post(
  "/register",
  authMiddleware,
  abacMiddleware("/register", "POST"),
  userController.register
);

router.get("/users", authMiddleware, userController.getAllUsers);

router.get("/profile", authMiddleware, userController.getUserProfile);

router.get("/users/:id", authMiddleware, userController.getUserByID);

router.get(
  "/filtered-users",
  authMiddleware,
  abacMiddleware("/filtered-users", "GET"),
  userController.getUsersByFilters
);

router.get(
  "/search",
  authMiddleware,
  abacMiddleware("/search", "GET"),
  userController.searchUsers
);

router.put(
  "/users/:id",
  authMiddleware,
  abacMiddleware("/users/:id", "PUT"),
  userController.updateUser
);

router.delete(
  "/users/:id",
  authMiddleware,
  abacMiddleware("/users/:id", "DELETE"),
  userController.deleteUser
);

module.exports = router;
