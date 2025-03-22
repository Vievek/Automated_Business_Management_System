const Backlog = require("../models/Backlog");

// Create Backlog with Order Management
exports.createBacklog = async (req, res) => {
  try {
    const { title, description, projectId, orderNo } = req.body;

    // If orderNo is provided, shift existing backlogs
    if (orderNo !== undefined) {
      await Backlog.updateMany(
        { project: projectId, orderNo: { $gte: orderNo } },
        { $inc: { orderNo: 1 } }
      );
    }

    // If no orderNo provided, place at the end
    const finalOrderNo =
      orderNo !== undefined
        ? orderNo
        : (await Backlog.countDocuments({ project: projectId })) + 1;

    const backlog = new Backlog({
      title,
      description,
      project: projectId,
      orderNo: finalOrderNo,
    });

    await backlog.save();
    res.status(201).json(backlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Backlog Order/Status
exports.updateBacklog = async (req, res) => {
  try {
    const { title, description, status, orderNo } = req.body;
    const backlog = await Backlog.findById(req.params.id);

    if (!backlog) {
      return res.status(404).json({ message: "Backlog not found" });
    }

    // If orderNo is updated, shift other backlogs
    if (orderNo !== undefined && orderNo !== backlog.orderNo) {
      await Backlog.updateMany(
        { project: backlog.project, orderNo: { $gte: orderNo } },
        { $inc: { orderNo: 1 } }
      );
    }

    backlog.title = title || backlog.title;
    backlog.description = description || backlog.description;
    backlog.status = status || backlog.status;
    backlog.orderNo = orderNo || backlog.orderNo;

    await backlog.save();
    res.status(200).json(backlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Backlog and Update Order
exports.deleteBacklog = async (req, res) => {
  try {
    const backlog = await Backlog.findByIdAndDelete(req.params.id);

    if (!backlog) {
      return res.status(404).json({ message: "Backlog not found" });
    }

    // Shift backlogs after deletion
    await Backlog.updateMany(
      { project: backlog.project, orderNo: { $gt: backlog.orderNo } },
      { $inc: { orderNo: -1 } }
    );

    res.status(200).json({ message: "Backlog deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Backlogs for a Project
exports.getProjectBacklogs = async (req, res) => {
  try {
    const backlogs = await Backlog.find({ project: req.params.projectId }).sort(
      "orderNo"
    );
    res.status(200).json(backlogs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
