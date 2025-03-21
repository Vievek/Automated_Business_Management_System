const Team = require("../models/Teams");
const Project = require("../models/Project");
const User = require("../models/User");

// Helper function to add a user to a team and update the user's teams array
const addUserToTeam = async (teamId, userId) => {
  const team = await Team.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: userId } }, // Add user to team's members array
    { new: true }
  );

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { teams: teamId } }, // Add team to user's teams array
    { new: true }
  );

  return { team, user };
};

// Helper function to remove a user from a team and update the user's teams array
const removeUserFromTeam = async (teamId, userId) => {
  const team = await Team.findByIdAndUpdate(
    teamId,
    { $pull: { members: userId } }, // Remove user from team's members array
    { new: true }
  );

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { teams: teamId } }, // Remove team from user's teams array
    { new: true }
  );

  return { team, user };
};

// Create a new team with a reference to an existing project
exports.createTeam = async (req, res) => {
  try {
    const { name, members, projectId } = req.body;

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if a team already exists for this project
    const existingTeam = await Team.findOne({ project: projectId });
    if (existingTeam) {
      return res
        .status(400)
        .json({ message: "A team already exists for this project" });
    }

    const newTeam = new Team({ name, members, project: projectId });
    await newTeam.save();

    // Update the project with the team reference
    project.team = newTeam._id;
    await project.save();

    // Add the team to each user's teams array
    if (members && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members } },
        { $addToSet: { teams: newTeam._id } }
      );
    }

    res
      .status(201)
      .json({ message: "Team created successfully", team: newTeam });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating team", error: error.message });
  }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("members", "username role department")
      .populate("project");
    res.status(200).json(teams);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching teams", error: error.message });
  }
};

// Get a single team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("members", "username role department")
      .populate("project");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json(team);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching team", error: error.message });
  }
};

// Update a team by ID
exports.updateTeam = async (req, res) => {
  try {
    const { name, members } = req.body;
    const teamId = req.params.id;

    // Find the current team to compare members
    const currentTeam = await Team.findById(teamId);
    if (!currentTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Update the team
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { name, members },
      { new: true, runValidators: true }
    );

    // Find added and removed members
    const addedMembers = members.filter(
      (member) => !currentTeam.members.includes(member)
    );
    const removedMembers = currentTeam.members.filter(
      (member) => !members.includes(member)
    );

    // Add team to added users' teams array
    if (addedMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: addedMembers } },
        { $addToSet: { teams: teamId } }
      );
    }

    // Remove team from removed users' teams array
    if (removedMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: removedMembers } },
        { $pull: { teams: teamId } }
      );
    }

    res
      .status(200)
      .json({ message: "Team updated successfully", team: updatedTeam });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating team", error: error.message });
  }
};

// Delete a team by ID
exports.deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;

    // Find the team to get its members
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Remove the team from all users' teams array
    if (team.members && team.members.length > 0) {
      await User.updateMany(
        { _id: { $in: team.members } },
        { $pull: { teams: teamId } }
      );
    }

    // Delete the team
    await Team.findByIdAndDelete(teamId);

    // Remove the team reference from the project
    await Project.findByIdAndUpdate(team.project, { $unset: { team: 1 } });

    res.status(200).json({ message: "Team deleted successfully", team });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting team", error: error.message });
  }
};
