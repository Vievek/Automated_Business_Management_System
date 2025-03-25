const Project = require("../models/Project");

// Create a standalone project
exports.createProject = async (req, res) => {
  const { name, description, team } = req.body; // `team` is optional
  try {
    const project = new Project({ name, description, team });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all projects (standalone and team-associated)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("team")
      .populate("questions")
      .populate("quotation")
      .populate("srsDocument")
      .populate("backlogs");
    res.json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  const { projectId } = req.params; // `projectId` is the ID of the project
  try {
    const project = await Project.findById(projectId)
      .populate("team")
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

// Update a project
exports.updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, team } = req.body; // `team` is optional
  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      { name, description, team },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
