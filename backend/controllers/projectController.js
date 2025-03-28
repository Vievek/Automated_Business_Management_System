const Project = require("../models/Project");
const User = require("../models/User");

// Complete user population configuration
const populateUser = {
  path: "members",
  select: "-password",
  populate: [
    { path: "projects", select: "name description" },
    { path: "tasks", select: "title status" },
    { path: "researches", select: "title status" },
    { path: "notes", select: "title content" },
  ],
};

// Create project (can add multiple members)
exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const project = new Project({ name, description, members });
    await project.save();

    if (members && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members } },
        { $addToSet: { projects: project._id } }
      );
    }

    const populatedProject = await Project.findById(project._id)
      .populate(populateUser)
      .populate("questions")
      .populate("quotation")
      .populate("srsDocument")
      .populate("backlogs");

    res.status(201).json(populatedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate(populateUser)
      .populate("questions")
      .populate("quotation")
      .populate("srsDocument")
      .populate("backlogs");
    res.json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate(populateUser)
      .populate("questions")
      .populate("quotation")
      .populate("srsDocument")
      .populate("backlogs");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update project (without member handling)
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      projectId,
      { name, description },
      { new: true }
    )
      .populate(populateUser)
      .populate("questions")
      .populate("quotation")
      .populate("srsDocument")
      .populate("backlogs");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Option 1: Using deleteOne() (preferred)
    await Project.deleteOne({ _id: req.params.projectId });

    // Option 2: Using remove() with exec()
    // await project.deleteOne().exec();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add single member to project
exports.addMemberToProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    project.members.push(userId);
    await project.save();

    user.projects.push(projectId);
    await user.save();

    const populatedProject = await Project.findById(projectId)
      .populate(populateUser)
      .populate("questions")
      .populate("quotation")
      .populate("srsDocument")
      .populate("backlogs");

    res.json(populatedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove single member from project
exports.removeMemberFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!project.members.includes(userId)) {
      return res.status(400).json({ message: "User is not a member" });
    }

    project.members.pull(userId);
    await project.save();

    user.projects.pull(projectId);
    await user.save();

    const populatedProject = await Project.findById(projectId)
      .populate(populateUser)
      .populate("questions")
      .populate("quotation")
      .populate("srsDocument")
      .populate("backlogs");

    res.json(populatedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
