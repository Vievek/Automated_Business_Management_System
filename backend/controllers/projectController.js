const Project = require("../models/Project");

// Create Project for a Team
exports.createProjectForTeam = async (req, res) => {
  const { name, description } = req.body;
  const { teamId } = req.params;
  try {
    const project = new Project({ name, description, team: teamId });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read All Projects for a Team
exports.getAllProjectsForTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    const projects = await Project.find({ team: teamId }).populate("team");
    res.json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Project for a Team
exports.updateProjectForTeam = async (req, res) => {
  const { teamId, projectId } = req.params;
  const { name, description } = req.body;
  try {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, team: teamId },
      { name, description },
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

// Delete Project for a Team
exports.deleteProjectForTeam = async (req, res) => {
  const { teamId, projectId } = req.params;
  try {
    const project = await Project.findOneAndDelete({
      _id: projectId,
      team: teamId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
