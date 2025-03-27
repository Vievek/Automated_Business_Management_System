const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res) => {
  const {
    username,
    password,
    firstname,
    lastname,
    phone,
    email,
    profilePic,
    salary,
    yearsOfExperience,
    nicNo,
    currentStatus,
    role,
  } = req.body;

  try {
    const user = new User({
      username,
      password,
      firstname,
      lastname,
      phone,
      email,
      profilePic,
      salary,
      yearsOfExperience,
      nicNo,
      currentStatus,
      role,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Enhanced cookie settings
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Force HTTPS - set to false for local testing
      sameSite: "none", // Required for cross-site cookies
      domain: process.env.COOKIE_DOMAIN || "localhost", // Important!
      maxAge: 3600000,
      path: "/",
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("_id username role") // Only get necessary fields
      .sort({ role: 1, username: 1 }) // Sort by role then by username
      .lean(); // Convert to plain JavaScript object

    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get current user by ID
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT payload
    const user = await User.findById(userId)
      .populate("projects")
      .populate("teams")
      .populate("workingProject")
      .populate("tasks")
      .populate("researches")
      .populate("notes");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get User by ID
exports.getUserByID = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate("projects")
      .populate("teams")
      .populate("workingProject")
      .populate("tasks")
      .populate("researches")
      .populate("notes");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update User Details (No authentication checks, handled by ABAC middleware)
exports.updateUser = async (req, res) => {
  const { id } = req.params; // User ID to update
  const updates = req.body; // Fields to update

  try {
    // Find the user to update
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Define allowed fields for update
    const allowedUpdates = [
      "username",
      "password",
      "firstname",
      "lastname",
      "phone",
      "email",
      "profilePic",
      "salary",
      "yearsOfExperience",
      "nicNo",
      "currentStatus",
      "role",
      "projects",
      "workingProject",
      "tasks",
      "researches",
      "notes",
    ];

    // Filter out disallowed fields
    const validUpdates = Object.keys(updates).filter((key) =>
      allowedUpdates.includes(key)
    );

    // Check if password is being updated
    if (validUpdates.includes("password")) {
      // Hash the new password before saving
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Apply updates
    validUpdates.forEach((key) => {
      userToUpdate[key] = updates[key];
    });

    // Save the updated user
    await userToUpdate.save();

    // Respond with the updated user (excluding sensitive data)
    const userResponse = { ...userToUpdate.toObject() };
    delete userResponse.password; // Remove password from the response

    res.json({ message: "User updated successfully", user: userResponse });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  const { id } = req.params; // User ID to delete

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Users by Filters (role, currentStatus, workingProject)
exports.getUsersByFilters = async (req, res) => {
  const { role, currentStatus, workingProject } = req.query;

  try {
    const filter = {};
    if (role) filter.role = role;
    if (currentStatus) filter.currentStatus = currentStatus;
    if (workingProject) filter.workingProject = workingProject;

    const users = await User.find(filter)
      .populate("projects")
      .populate("workingProject")
      .populate("teams")
      .populate("tasks")
      .populate("researches")
      .populate("notes");

    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Search Users by any field
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstname: { $regex: query, $options: "i" } },
        { lastname: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { nicNo: { $regex: query, $options: "i" } },
        { role: { $regex: query, $options: "i" } },
        { currentStatus: { $regex: query, $options: "i" } },
      ],
    })
      .populate("projects")
      .populate("workingProject")
      .populate("teams")
      .populate("tasks")
      .populate("researches")
      .populate("notes");

    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// logout
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
