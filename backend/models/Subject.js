const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["subject", "pyq"],
      default: "subject",
    },
    questionsPerTest: { type: Number, required: true, default: 50 },
    timeLimitMinutes: { type: Number, required: true, default: 45 },
    negativeMarking: { type: Number, required: true, default: 0.25 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
