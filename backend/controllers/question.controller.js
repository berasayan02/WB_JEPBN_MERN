const Question = require("../models/Question");
const Subject = require("../models/Subject");

// @route GET /api/questions/subject/:subjectId (admin - full list with answers, paginated)
const getQuestionsBySubject = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const questions = await Question.find({ subject: req.params.subjectId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: 1 });

    const total = await Question.countDocuments({ subject: req.params.subjectId });

    res.json({ questions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch questions", error: err.message });
  }
};

// @route POST /api/questions (admin)
const createQuestion = async (req, res) => {
  try {
    const { subject, text, options, correctIndex } = req.body;

    if (!subject || !text || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "subject, text and at least 2 options are required" });
    }
    if (correctIndex === undefined || correctIndex < 0 || correctIndex >= options.length) {
      return res.status(400).json({ message: "correctIndex must point to a valid option" });
    }

    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) return res.status(404).json({ message: "Subject not found" });

    const question = await Question.create({ subject, text, options, correctIndex });
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: "Failed to create question", error: err.message });
  }
};

// @route PUT /api/questions/:id (admin)
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(400).json({ message: "Failed to update question", error: err.message });
  }
};

// @route DELETE /api/questions/:id (admin)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete question", error: err.message });
  }
};

module.exports = {
  getQuestionsBySubject,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
