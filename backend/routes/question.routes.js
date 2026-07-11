const express = require("express");
const {
  getQuestionsBySubject,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/question.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

// All question management endpoints are admin-only — regular users only
// ever see questions via /api/tests/:slug/start (which strips answers).
router.get("/subject/:subjectId", protect, adminOnly, getQuestionsBySubject);
router.post("/", protect, adminOnly, createQuestion);
router.put("/:id", protect, adminOnly, updateQuestion);
router.delete("/:id", protect, adminOnly, deleteQuestion);

module.exports = router;
