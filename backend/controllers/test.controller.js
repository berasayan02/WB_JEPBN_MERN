const mongoose = require("mongoose");
const Subject = require("../models/Subject");
const Question = require("../models/Question");
const TestResult = require("../models/TestResult");

// Fisher-Yates shuffle
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// @route GET /api/tests/:slug/start
// Returns a fresh randomized question set for the subject WITHOUT the
// correct answer, so it can never be read from the browser/network tab.
const startTest = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug });
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const allQuestions = await Question.find({ subject: subject._id });
    if (allQuestions.length === 0) {
      return res.status(404).json({ message: "No questions available for this subject yet" });
    }

    const picked = shuffle(allQuestions).slice(0, subject.questionsPerTest);

    const questions = picked.map((q) => ({
      id: q._id,
      text: q.text,
      options: q.options,
    }));

    res.json({
      subject: {
        id: subject._id,
        slug: subject.slug,
        name: subject.name,
        timeLimitMinutes: subject.timeLimitMinutes,
        negativeMarking: subject.negativeMarking,
      },
      questions,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to start test", error: err.message });
  }
};

// @route POST /api/tests/:slug/submit
// Body: { answers: [{ questionId, selectedIndex }], timeTakenSeconds }
// Grading happens entirely server-side against the DB's correctIndex.
const submitTest = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug });
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const { answers, timeTakenSeconds } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers array is required" });
    }

    const questionIds = answers
      .map((a) => a.questionId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    const gradedAnswers = answers.map((a) => {
      const question = questionMap.get(a.questionId);
      if (!question) return null;

      const selectedIndex =
        a.selectedIndex === undefined || a.selectedIndex === null ? null : a.selectedIndex;

      const isCorrect = selectedIndex !== null && selectedIndex === question.correctIndex;

      if (selectedIndex !== null) {
        attempted++;
        if (isCorrect) correct++;
        else wrong++;
      }

      return {
        question: question._id,
        selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect,
      };
    }).filter(Boolean);

    const score = correct * 1 - wrong * subject.negativeMarking;
    const maxScore = gradedAnswers.length;

    const result = await TestResult.create({
      user: req.user._id,
      subject: subject._id,
      subjectName: subject.name,
      totalQuestions: gradedAnswers.length,
      attempted,
      correct,
      wrong,
      score,
      maxScore,
      timeTakenSeconds: timeTakenSeconds || 0,
      answers: gradedAnswers,
    });

    res.status(201).json({
      resultId: result._id,
      score,
      maxScore,
      attempted,
      correct,
      wrong,
      totalQuestions: gradedAnswers.length,
      answers: gradedAnswers,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit test", error: err.message });
  }
};

// @route GET /api/tests/history
const getMyHistory = async (req, res) => {
  try {
    const results = await TestResult.find({ user: req.user._id })
      .select("-answers")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
};

// @route GET /api/tests/history/:id
const getResultDetail = async (req, res) => {
  try {
    const result = await TestResult.findOne({ _id: req.params.id, user: req.user._id }).populate(
      "answers.question"
    );
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch result", error: err.message });
  }
};

module.exports = { startTest, submitTest, getMyHistory, getResultDetail };
