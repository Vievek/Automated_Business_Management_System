const Task = require("../models/Task");
const User = require("../models/User");

// Create Task
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();

    // Add the task to the assigned user's tasks array
    const assignedToUser = await User.findById(task.assignedTo);
    if (assignedToUser) {
      assignedToUser.tasks.push(task._id);
      await assignedToUser.save();
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedBy assignedTo project");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedBy assignedTo project"
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignedBy assignedTo project");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove the task from the assigned user's tasks array
    const assignedToUser = await User.findById(task.assignedTo);
    if (assignedToUser) {
      assignedToUser.tasks = assignedToUser.tasks.filter(
        (taskId) => taskId.toString() !== task._id.toString()
      );
      await assignedToUser.save();
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Tasks by User ID
exports.getTasksByUserId = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId }).populate(
      "assignedBy assignedTo project"
    );
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Tasks by Project ID
exports.getTasksByProjectId = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate(
      "assignedBy assignedTo project"
    );
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search Tasks
exports.searchTasks = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    // Fetch all tasks and populate assignedBy, assignedTo, project
    const tasks = await Task.find()
      .populate("assignedBy", "username firstname lastname email role") // Populate assignedBy details
      .populate("assignedTo", "username firstname lastname email role") // Populate assignedTo details
      .populate("project", "name description"); // Populate project details

    // Filter tasks where the keyword matches any field (including populated data)
    const filteredTasks = tasks.filter((task) => {
      // Check if the keyword matches any of the task fields
      const matchesTaskName = task.taskName
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesStatus = task.status
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesDeadline = task.deadline
        .toISOString()
        .toLowerCase()
        .includes(keyword.toLowerCase());

      // Check if the keyword matches the populated assignedBy or assignedTo fields
      const matchesAssignedByName = task.assignedBy?.username
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesAssignedByFirstName = task.assignedBy?.firstname
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesAssignedByLastName = task.assignedBy?.lastname
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesAssignedByEmail = task.assignedBy?.email
        .toLowerCase()
        .includes(keyword.toLowerCase());

      const matchesAssignedToName = task.assignedTo?.username
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesAssignedToFirstName = task.assignedTo?.firstname
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesAssignedToLastName = task.assignedTo?.lastname
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesAssignedToEmail = task.assignedTo?.email
        .toLowerCase()
        .includes(keyword.toLowerCase());

      // Check if the keyword matches the populated project fields
      const matchesProjectName = task.project?.name
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesProjectDescription = task.project?.description
        .toLowerCase()
        .includes(keyword.toLowerCase());

      // Check if the keyword matches the description
      const matchesDescription = task.description
        .toLowerCase()
        .includes(keyword.toLowerCase());

      // Return true if any of the fields match the keyword
      return (
        matchesTaskName ||
        matchesStatus ||
        matchesDeadline ||
        matchesAssignedByName ||
        matchesAssignedByFirstName ||
        matchesAssignedByLastName ||
        matchesAssignedByEmail ||
        matchesAssignedToName ||
        matchesAssignedToFirstName ||
        matchesAssignedToLastName ||
        matchesAssignedToEmail ||
        matchesProjectName ||
        matchesProjectDescription ||
        matchesDescription
      );
    });

    res.status(200).json(filteredTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Tasks by Project ID and User ID
exports.getTasksByProjectIdAndUserId = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId,
      assignedTo: req.params.userId,
    }).populate("assignedBy assignedTo project");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get task by assignedBY id
exports.getTasksByAssignedById = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedBy: req.params.userId }).populate(
      "assignedBy assignedTo project"
    );
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get task by assignedTo id
exports.getTasksByAssignedToId = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId }).populate(
      "assignedBy assignedTo project"
    );
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
