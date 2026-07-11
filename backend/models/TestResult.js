const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    selectedIndex: { type: Number, default: null }, // null = not attempted
    correctIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const testResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    subjectName: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    attempted: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
    answers: [answerSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestResult", testResultSchema);
