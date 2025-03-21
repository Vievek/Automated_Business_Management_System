const Note = require("../models/Note");

// Create Note
exports.createNote = async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();

    // Add the note to the users' notes array
    if (note.users && note.users.length > 0) {
      for (const userId of note.users) {
        const user = await User.findById(userId);
        if (user) {
          user.notes.push(note._id);
          await user.save();
        }
      }
    }

    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate("task project research users");
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate(
      "task project research users"
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
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("task project research users");
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update users' notes array if users are modified
    if (req.body.users) {
      const oldUsers = await User.find({ notes: note._id });
      for (const user of oldUsers) {
        user.notes = user.notes.filter(
          (noteId) => noteId.toString() !== note._id.toString()
        );
        await user.save();
      }

      for (const userId of req.body.users) {
        const user = await User.findById(userId);
        if (user) {
          user.notes.push(note._id);
          await user.save();
        }
      }
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

    // Remove the note from the users' notes array
    const users = await User.find({ notes: note._id });
    for (const user of users) {
      user.notes = user.notes.filter(
        (noteId) => noteId.toString() !== note._id.toString()
      );
      await user.save();
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Notes by User ID
exports.getNotesByUserId = async (req, res) => {
  try {
    const notes = await Note.find({ users: req.params.userId }).populate(
      "task project research"
    );
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Notes by Task ID
exports.getNotesByTaskId = async (req, res) => {
  try {
    const notes = await Note.find({ task: req.params.taskId }).populate(
      "task project research"
    );
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Notes by Project ID
exports.getNotesByProjectId = async (req, res) => {
  try {
    const notes = await Note.find({ project: req.params.projectId }).populate(
      "task project research"
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
      "task project research"
    );
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
