const Subject = require("../models/Subject");
const Question = require("../models/Question");

// @route GET /api/subjects
// Public list used to render the dashboard cards.
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ category: 1, name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects", error: err.message });
  }
};

// @route GET /api/subjects/:slug
const getSubjectBySlug = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subject", error: err.message });
  }
};

// @route POST /api/subjects (admin)
const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ message: "Failed to create subject", error: err.message });
  }
};

// @route PUT /api/subjects/:id (admin)
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(400).json({ message: "Failed to update subject", error: err.message });
  }
};

// @route DELETE /api/subjects/:id (admin)
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    await Question.deleteMany({ subject: subject._id });
    res.json({ message: "Subject and its questions deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete subject", error: err.message });
  }
};

module.exports = {
  getSubjects,
  getSubjectBySlug,
  createSubject,
  updateSubject,
  deleteSubject,
};
