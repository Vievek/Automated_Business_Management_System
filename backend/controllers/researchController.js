const Research = require("../models/Research");

// Create Research
exports.createResearch = async (req, res) => {
  try {
    const research = new Research(req.body);
    await research.save();

    // Add the research to the users' researches array
    if (research.users && research.users.length > 0) {
      for (const userId of research.users) {
        const user = await User.findById(userId);
        if (user) {
          user.researches.push(research._id);
          await user.save();
        }
      }
    }

    res.status(201).json(research);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Researches
exports.getResearches = async (req, res) => {
  try {
    const researches = await Research.find().populate("project notes users");
    res.status(200).json(researches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Research by ID
exports.getResearchById = async (req, res) => {
  try {
    const research = await Research.findById(req.params.id).populate(
      "project notes users"
    );
    if (!research) {
      return res.status(404).json({ message: "Research not found" });
    }
    res.status(200).json(research);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Research
exports.updateResearch = async (req, res) => {
  try {
    const research = await Research.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("project notes users");
    if (!research) {
      return res.status(404).json({ message: "Research not found" });
    }

    // Update users' researches array if users are modified
    if (req.body.users) {
      const oldUsers = await User.find({ researches: research._id });
      for (const user of oldUsers) {
        user.researches = user.researches.filter(
          (researchId) => researchId.toString() !== research._id.toString()
        );
        await user.save();
      }

      for (const userId of req.body.users) {
        const user = await User.findById(userId);
        if (user) {
          user.researches.push(research._id);
          await user.save();
        }
      }
    }

    res.status(200).json(research);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Research
exports.deleteResearch = async (req, res) => {
  try {
    const research = await Research.findByIdAndDelete(req.params.id);
    if (!research) {
      return res.status(404).json({ message: "Research not found" });
    }

    // Remove the research from the users' researches array
    const users = await User.find({ researches: research._id });
    for (const user of users) {
      user.researches = user.researches.filter(
        (researchId) => researchId.toString() !== research._id.toString()
      );
      await user.save();
    }

    res.status(200).json({ message: "Research deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Research by Project ID
exports.getResearchesByProjectId = async (req, res) => {
  try {
    const researches = await Research.find({
      project: req.params.projectId,
    }).populate("project notes users");
    res.status(200).json(researches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Research by User ID
exports.getResearchesByUserId = async (req, res) => {
  try {
    const researches = await Research.find({
      users: req.params.userId,
    }).populate("project notes users");
    res.status(200).json(researches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
