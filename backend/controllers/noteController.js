const Note = require("../models/Note");
const User = require("../models/User");
const Project = require("../models/Project");
const Research = require("../models/Research");

// Create Note
exports.createNote = async (req, res) => {
  try {
    const { title, content, project, research, createdBy } = req.body;

    const note = new Note({
      title,
      content,
      project,
      research,
      createdBy,
    });

    await note.save();

    // Populate the createdBy user field before returning
    const populatedNote = await Note.findById(note._id).populate("createdBy");

    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate("project research createdBy");
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate(
      "project research createdBy"
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Note
exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    ).populate("project research createdBy");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Notes by Project ID
exports.getNotesByProjectId = async (req, res) => {
  try {
    const notes = await Note.find({ project: req.params.projectId }).populate(
      "research createdBy"
    );

    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Notes by Research ID
exports.getNotesByResearchId = async (req, res) => {
  try {
    const notes = await Note.find({ research: req.params.researchId }).populate(
      "project createdBy"
    );

    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Notes by Creator (User ID)
exports.getNotesByCreator = async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.params.userId }).populate(
      "project research"
    );

    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
