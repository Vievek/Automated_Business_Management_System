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
      {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
        currentStatus: user.currentStatus,
        teams: user.teams,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
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

// Get a single user by ID
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

// Update User Details
exports.updateUser = async (req, res) => {
  const { id } = req.params; // User ID to update
  const updates = req.body; // Fields to update
  const { currentPassword } = req.body; // Current password for verification
  const authenticatedUserId = req.user.id; // Extracted from JWT payload
  const authenticatedUserRole = req.user.role; // Extracted from JWT payload

  try {
    // Find the user to update
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the authenticated user is authorized to update
    if (authenticatedUserId !== id && authenticatedUserRole !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this user" });
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
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required" });
      }

      // Verify the current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userToUpdate.password
      );
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

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
