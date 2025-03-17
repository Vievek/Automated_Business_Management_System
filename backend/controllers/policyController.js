const Policy = require("../models/Policy");

// Create Policy
exports.createPolicy = async (req, res) => {
  const { resource, action, conditions } = req.body;
  try {
    const policy = new Policy({ resource, action, conditions });
    await policy.save();
    res.status(201).json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Policies
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find();
    res.json(policies);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Policy
exports.updatePolicy = async (req, res) => {
  const { id } = req.params;
  const { resource, action, conditions } = req.body;
  try {
    const policy = await Policy.findByIdAndUpdate(
      id,
      { resource, action, conditions },
      { new: true }
    );
    res.json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Policy
exports.deletePolicy = async (req, res) => {
  const { id } = req.params;
  try {
    await Policy.findByIdAndDelete(id);
    res.json({ message: "Policy deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
